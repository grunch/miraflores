#!/usr/bin/env node
/**
 * CLI de coordinación entre agentes. Protocolo completo en AGENTS.md.
 *
 *   node scripts/agentes.mjs estado
 *   node scripts/agentes.mjs iniciar --agente "Claude Opus 5.5" --tarea "..." [--rama feat/x]
 *   node scripts/agentes.mjs reclamar --id ID ruta|puerto:NNNN ...
 *   node scripts/agentes.mjs liberar  --id ID ruta ...
 *   node scripts/agentes.mjs latido   --id ID [--tarea "..."]
 *   node scripts/agentes.mjs ejecutar --id ID -- <comando largo> [args]   (late mientras corre)
 *   node scripts/agentes.mjs nota     --id ID "mensaje para los demás agentes"
 *   node scripts/agentes.mjs terminar --id ID --resumen "..."
 *   node scripts/agentes.mjs limpiar
 *
 * Códigos de salida: 0 bien, 1 error de uso, 2 conflicto de reclamo; ejecutar devuelve el del comando.
 */
import {execFileSync, spawn} from 'node:child_process';
import {readFileSync, readdirSync, realpathSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  INACTIVIDAD_MS, LATIDO_RECOMENDADO_MS, anotar, estado, iniciarSesion, latido, liberar, limpiarInactivas, reclamar, terminar,
} from './coordinacion-agentes.mjs';

/** Directorio compartido por todos los worktrees: <git-common-dir>/agentes; sin git, .agentes/. */
function raizCompartida() {
  if (process.env.AGENTES_DIR) return process.env.AGENTES_DIR;
  const proyecto = join(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const comun = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'],
      {cwd: proyecto, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
    return join(comun, 'agentes');
  } catch {
    return join(proyecto, '.agentes');
  }
}
const RAIZ = raizCompartida();

function analizar(argv) {
  const opciones = {};
  const sueltos = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--') { opciones.comando = argv.slice(i + 1); break; }
    if (argv[i].startsWith('--')) { opciones[argv[i].slice(2)] = argv[i + 1]; i += 1; } else sueltos.push(argv[i]);
  }
  return {opciones, sueltos};
}

function requerir(opciones, ...claves) {
  for (const c of claves) if (!opciones[c]) throw new Error(`Falta --${c}`);
}

function minutos(desde) {
  return Math.round((Date.now() - Date.parse(desde)) / 60000);
}

function imprimirEstado() {
  const {sesiones, reclamos, bitacora} = estado({raiz: RAIZ});
  console.log(`## Sesiones (${sesiones.length}) · inactiva tras ${INACTIVIDAD_MS / 60000} min sin latido`);
  for (const s of sesiones) {
    console.log(`- ${s.id}${s.inactiva ? ' [INACTIVA]' : ''} · ${s.agente} · ${s.tarea}` +
      `${s.rama ? ` · rama ${s.rama}` : ''}${s.directorio ? ` · en ${s.directorio}` : ''} · desde ${s.inicio} · latido hace ${minutos(s.latido)} min`);
  }
  console.log(`\n## Reclamos (${reclamos.length})`);
  for (const r of reclamos) console.log(`- ${r.recurso} → ${r.id} (desde ${r.desde})`);
  console.log('\n## Bitácora (últimas entradas)');
  for (const linea of bitacora) console.log(linea);
}

/** Intervalo de latido de ejecutar: por defecto 10 min; debe ser positivo y menor que la caducidad. */
export function intervaloLatido(valor) {
  if (valor === undefined) return LATIDO_RECOMENDADO_MS;
  const ms = String(valor).trim() === '' ? Number.NaN : Number(valor);
  if (!Number.isFinite(ms) || ms <= 0 || ms >= INACTIVIDAD_MS) {
    throw new Error(`AGENTES_LATIDO_MS debe ser un número de milisegundos mayor que 0 y menor que ${INACTIVIDAD_MS}`);
  }
  return ms;
}

const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));

const PROC = {
  listar: () => readdirSync('/proc').filter((n) => /^\d+$/.test(n)),
  leer: (pid) => { try { return readFileSync(`/proc/${pid}/stat`, 'utf8'); } catch { return null; } },
};

/**
 * ¿Queda algún proceso del grupo que pueda ejecutarse? Los zombis no cuentan: no ejecutan ni escriben,
 * y en contenedores sin un init que los recoja pueden quedarse para siempre. Fuera de Linux se usa
 * kill(-pgid, 0), que no distingue zombis.
 */
export function grupoActivo(pgid, fuente = process.platform === 'linux' ? PROC : null) {
  if (!fuente) { try { process.kill(-pgid, 0); return true; } catch (e) { return e.code !== 'ESRCH'; } }
  return fuente.listar().some((pid) => {
    const stat = fuente.leer(pid);
    if (!stat) return false;
    const [estado, , pgrp] = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    return Number(pgrp) === pgid && estado !== 'Z';
  });
}
const SENALES = ['SIGINT', 'SIGTERM', 'SIGHUP'];

const CODIGO_SENAL = {SIGHUP: 129, SIGINT: 130, SIGTERM: 143};

/**
 * Ejecuta el comando en su propio grupo de procesos y emite latidos mientras corre. Si la sesión se
 * pierde o el propio ejecutar recibe SIGINT/SIGTERM/SIGHUP, detiene el grupo entero con la misma
 * rutina (señal, gracia, SIGKILL) y no devuelve el control hasta que no queda ningún proceso que pueda
 * ejecutarse: hasta entonces, nadie debe dar por libres sus recursos.
 */
async function ejecutar({opciones}) {
  requerir(opciones, 'id');
  if (!opciones.comando?.length) throw new Error('Falta el comando tras «--»');
  const cada = intervaloLatido(process.env.AGENTES_LATIDO_MS);
  const gracia = Number(process.env.AGENTES_GRACIA_MS) || 5000;
  await latido({raiz: RAIZ, id: opciones.id});
  const hijo = spawn(opciones.comando[0], opciones.comando.slice(1), {stdio: 'inherit', detached: true});
  const alGrupo = (senal) => { try { process.kill(-hijo.pid, senal); } catch { /* el grupo ya terminó */ } };
  const grupoVivo = () => grupoActivo(hijo.pid);
  let parada = null;
  let codigoParada = 1;
  const detener = (senal, codigo) => {
    if (parada) return;
    codigoParada = codigo;
    parada = (async () => {
      alGrupo(senal);
      const limite = Date.now() + gracia;
      while (grupoVivo() && Date.now() < limite) await dormir(50);
      if (grupoVivo()) alGrupo('SIGKILL');
      const final = Date.now() + gracia; // SIGKILL no se puede ignorar; el límite solo evita colgarse
      while (grupoVivo() && Date.now() < final) await dormir(20);
      if (grupoVivo()) console.error(`Aviso: el grupo ${hijo.pid} sigue vivo tras SIGKILL; revísalo a mano.`);
    })();
  };
  const alRecibir = (senal) => detener(senal, CODIGO_SENAL[senal]);
  for (const senal of SENALES) process.on(senal, alRecibir);
  const salida = new Promise((ok) => {
    hijo.on('error', (e) => { console.error(`Error: ${e.message}`); ok(1); });
    hijo.on('exit', (codigo, senal) => ok(codigo ?? (senal ? 1 : 0)));
  });
  const reloj = setInterval(() => {
    latido({raiz: RAIZ, id: opciones.id}).catch((e) => {
      if (parada) return;
      clearInterval(reloj);
      console.error(`Error: ${e.message}. Se detiene el comando porque sus reclamos ya no valen.`);
      detener('SIGTERM', 1);
    });
  }, cada);
  try {
    const codigo = await salida;
    if (parada) { await parada; return codigoParada; }
    return codigo;
  } finally {
    clearInterval(reloj);
    for (const senal of SENALES) process.off(senal, alRecibir);
  }
}

const comandos = {
  estado: () => imprimirEstado(),
  iniciar: async ({opciones}) => {
    requerir(opciones, 'agente', 'tarea');
    const s = await iniciarSesion({raiz: RAIZ, agente: opciones.agente, tarea: opciones.tarea, rama: opciones.rama ?? null, directorio: process.cwd()});
    console.log(s.id);
  },
  reclamar: async ({opciones, sueltos}) => {
    requerir(opciones, 'id');
    const r = await reclamar({raiz: RAIZ, id: opciones.id, recursos: sueltos});
    if (!r.conflictos.length) { console.log(`Reclamado: ${r.obtenidos.join(', ')}`); return 0; }
    for (const c of r.conflictos) console.error(`CONFLICTO: ${c.recurso} lo tiene ${c.dueno}${c.con ? ` (por ${c.con})` : ''}`);
    console.error('No se reclamó nada. Elige otra tarea, coordina por la bitácora o espera a que se libere.');
    return 2;
  },
  liberar: async ({opciones, sueltos}) => { requerir(opciones, 'id'); await liberar({raiz: RAIZ, id: opciones.id, recursos: sueltos}); },
  latido: async ({opciones}) => { requerir(opciones, 'id'); await latido({raiz: RAIZ, id: opciones.id, tarea: opciones.tarea}); },
  nota: async ({opciones, sueltos}) => {
    requerir(opciones, 'id');
    if (!sueltos.length) throw new Error('Falta el mensaje');
    await anotar({raiz: RAIZ, id: opciones.id, mensaje: sueltos.join(' ')});
  },
  terminar: async ({opciones}) => { requerir(opciones, 'id'); await terminar({raiz: RAIZ, id: opciones.id, resumen: opciones.resumen}); },
  ejecutar,
  limpiar: async () => { const r = await limpiarInactivas({raiz: RAIZ}); console.log(r.length ? `Retiradas: ${r.join(', ')}` : 'Nada que limpiar'); },
};

async function principal() {
  const [nombre, ...resto] = process.argv.slice(2);
  const comando = comandos[nombre ?? 'estado'];
  if (!comando) {
    console.error(`Comando desconocido «${nombre}». Usa: ${Object.keys(comandos).join(', ')}`);
    return 1;
  }
  try { return (await comando(analizar(resto))) ?? 0; } catch (e) {
    console.error(`Error: ${e.message}`);
    return 1;
  }
}

// Importable desde las pruebas sin ejecutar la CLI.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await principal();
}
