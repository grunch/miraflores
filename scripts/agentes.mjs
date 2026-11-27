#!/usr/bin/env node
/**
 * CLI de coordinación entre agentes. Protocolo completo en AGENTS.md.
 *
 *   node scripts/agentes.mjs estado
 *   node scripts/agentes.mjs iniciar --agente "Claude Opus 5.5" --tarea "..." [--rama feat/x]
 *   node scripts/agentes.mjs reclamar --id ID ruta|puerto:NNNN ...
 *   node scripts/agentes.mjs liberar  --id ID ruta ...
 *   node scripts/agentes.mjs latido   --id ID [--tarea "..."]
 *   node scripts/agentes.mjs nota     --id ID "mensaje para los demás agentes"
 *   node scripts/agentes.mjs terminar --id ID --resumen "..."
 *   node scripts/agentes.mjs limpiar
 *
 * Códigos de salida: 0 bien, 1 error de uso, 2 conflicto de reclamo.
 */
import {execFileSync} from 'node:child_process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  INACTIVIDAD_MS, anotar, estado, iniciarSesion, latido, liberar, limpiarInactivas, reclamar, terminar,
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
      `${s.rama ? ` · rama ${s.rama}` : ''} · desde ${s.inicio} · latido hace ${minutos(s.latido)} min`);
  }
  console.log(`\n## Reclamos (${reclamos.length})`);
  for (const r of reclamos) console.log(`- ${r.recurso} → ${r.id} (desde ${r.desde})`);
  console.log('\n## Bitácora (últimas entradas)');
  for (const linea of bitacora) console.log(linea);
}

const comandos = {
  estado: () => imprimirEstado(),
  iniciar: ({opciones}) => {
    requerir(opciones, 'agente', 'tarea');
    const s = iniciarSesion({raiz: RAIZ, agente: opciones.agente, tarea: opciones.tarea, rama: opciones.rama ?? null});
    console.log(s.id);
  },
  reclamar: ({opciones, sueltos}) => {
    requerir(opciones, 'id');
    const r = reclamar({raiz: RAIZ, id: opciones.id, recursos: sueltos});
    if (!r.conflictos.length) { console.log(`Reclamado: ${r.obtenidos.join(', ')}`); return 0; }
    for (const c of r.conflictos) console.error(`CONFLICTO: ${c.recurso} lo tiene ${c.dueno}${c.con ? ` (por ${c.con})` : ''}`);
    console.error('No se reclamó nada. Elige otra tarea, coordina por la bitácora o espera a que se libere.');
    return 2;
  },
  liberar: ({opciones, sueltos}) => { requerir(opciones, 'id'); liberar({raiz: RAIZ, id: opciones.id, recursos: sueltos}); },
  latido: ({opciones}) => { requerir(opciones, 'id'); latido({raiz: RAIZ, id: opciones.id, tarea: opciones.tarea}); },
  nota: ({opciones, sueltos}) => {
    requerir(opciones, 'id');
    if (!sueltos.length) throw new Error('Falta el mensaje');
    anotar({raiz: RAIZ, id: opciones.id, mensaje: sueltos.join(' ')});
  },
  terminar: ({opciones}) => { requerir(opciones, 'id'); terminar({raiz: RAIZ, id: opciones.id, resumen: opciones.resumen}); },
  limpiar: () => { const r = limpiarInactivas({raiz: RAIZ}); console.log(r.length ? `Retiradas: ${r.join(', ')}` : 'Nada que limpiar'); },
};

const [nombre, ...resto] = process.argv.slice(2);
const comando = comandos[nombre ?? 'estado'];
if (!comando) {
  console.error(`Comando desconocido «${nombre}». Usa: ${Object.keys(comandos).join(', ')}`);
  process.exit(1);
}
try {
  process.exitCode = comando(analizar(resto)) ?? 0;
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 1;
}
