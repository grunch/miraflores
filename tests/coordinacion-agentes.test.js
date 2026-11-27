import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, chmodSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Worker} from 'node:worker_threads';
import {connect} from 'node:net';
import {
  INACTIVIDAD_MS, iniciarSesion, latido, reclamar, liberar, liberarTodos, anotar, terminar,
  estado, limpiarInactivas, normalizarRecurso, conMutex, direccionMutex,
} from '../scripts/coordinacion-agentes.mjs';
import {intervaloLatido, grupoActivo} from '../scripts/agentes.mjs';

const T0 = Date.parse('2026-11-27T15:00:00Z');
const TARDE = T0 + INACTIVIDAD_MS + 1;
const CLI = fileURLToPath(new URL('../scripts/agentes.mjs', import.meta.url));
const MODULO = new URL('../scripts/coordinacion-agentes.mjs', import.meta.url).href;

async function conRaiz(fn) {
  const raiz = mkdtempSync(join(tmpdir(), 'agentes-'));
  try { return await fn(raiz); } finally { rmSync(raiz, {recursive: true, force: true}); }
}
const sesion = (raiz, agente = 'Claude', ahora = T0) => iniciarSesion({raiz, agente, tarea: 'probar', ahora});
const recursosDe = (raiz, ahora = T0) => estado({raiz, ahora}).reclamos.map((r) => `${r.recurso}=${r.id}`);

test('iniciar crea una sesión con identidad, tarea, directorio y hora de inicio', () => conRaiz(async (raiz) => {
  const s = await iniciarSesion({raiz, agente: 'Codex GPT', tarea: 'probar', directorio: '/tmp/wt', ahora: T0});
  assert.match(s.id, /^codex-gpt-\d{8}-\d{4}-[0-9a-f]{4}$/);
  const [leida] = estado({raiz, ahora: T0}).sesiones;
  assert.equal(leida.agente, 'Codex GPT');
  assert.equal(leida.directorio, '/tmp/wt');
  assert.equal(leida.inicio, new Date(T0).toISOString());
  assert.equal(leida.inactiva, false);
}));

test('normaliza rutas y rechaza las que salen del proyecto', () => {
  assert.equal(normalizarRecurso('./src//palacio.js'), 'src/palacio.js');
  assert.equal(normalizarRecurso('docs/'), 'docs');
  assert.equal(normalizarRecurso('puerto:5176'), 'puerto:5176');
  assert.throws(() => normalizarRecurso('../caracas/x.js'), RangeError);
  assert.throws(() => normalizarRecurso('/etc/passwd'), RangeError);
  assert.throws(() => normalizarRecurso(''), RangeError);
});

test('un recurso reclamado no puede reclamarlo otra sesión activa', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A'); const b = await sesion(raiz, 'B');
  assert.deepEqual((await reclamar({raiz, id: a.id, recursos: ['src/palacio.js'], ahora: T0})).conflictos, []);
  const r = await reclamar({raiz, id: b.id, recursos: ['src/palacio.js'], ahora: T0});
  assert.deepEqual(r.obtenidos, []);
  assert.equal(r.conflictos[0].dueno, a.id);
}));

test('detecta solapamiento entre un directorio y un archivo dentro de él', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A'); const b = await sesion(raiz, 'B');
  await reclamar({raiz, id: a.id, recursos: ['docs/prioridades'], ahora: T0});
  assert.equal((await reclamar({raiz, id: b.id, recursos: ['docs/prioridades/rotunda.md'], ahora: T0})).conflictos.length, 1);
  assert.equal((await reclamar({raiz, id: b.id, recursos: ['docs/prioridades-otro.md'], ahora: T0})).conflictos.length, 0);
}));

test('reclamar es todo o nada', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A'); const b = await sesion(raiz, 'B');
  await reclamar({raiz, id: a.id, recursos: ['puerto:5176'], ahora: T0});
  await reclamar({raiz, id: b.id, recursos: ['src/teatro-municipal.js', 'puerto:5176'], ahora: T0});
  assert.deepEqual(recursosDe(raiz), [`puerto:5176=${a.id}`]);
}));

test('reclamar de nuevo lo propio no es conflicto', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  assert.deepEqual((await reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0})).conflictos, []);
}));

test('liberar deja el recurso disponible y no toca reclamos ajenos', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A'); const b = await sesion(raiz, 'B');
  await reclamar({raiz, id: a.id, recursos: ['README.md', 'docs'], ahora: T0});
  await liberar({raiz, id: b.id, recursos: ['README.md']});
  assert.equal(recursosDe(raiz).length, 2);
  await liberar({raiz, id: a.id, recursos: ['README.md']});
  assert.deepEqual((await reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: T0})).conflictos, []);
}));

test('liberarTodos sigue con los válidos e informa de los inválidos', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['docs', 'README.md'], ahora: T0});
  const fallidos = await liberarTodos({raiz, id: a.id, recursos: ['docs', '../typo', 'README.md']});
  assert.deepEqual(fallidos.map((f) => f.recurso), ['../typo']);
  assert.deepEqual(recursosDe(raiz), []);
  await assert.rejects(liberar({raiz, id: a.id, recursos: ['../typo']}), /\.\.\/typo/);
}));

test('una sesión sin latido durante el plazo pierde sus reclamos', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  const b = await sesion(raiz, 'B', TARDE);
  assert.equal(estado({raiz, ahora: TARDE}).sesiones.find((s) => s.id === a.id).inactiva, true);
  assert.deepEqual((await reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: TARDE})).conflictos, []);
  assert.deepEqual(recursosDe(raiz, TARDE), [`README.md=${b.id}`]);
}));

test('el latido mantiene viva la sesión y puede actualizar la tarea', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  await latido({raiz, id: a.id, tarea: 'revisar enlaces', ahora: T0 + INACTIVIDAD_MS - 1000});
  const b = await sesion(raiz, 'B', TARDE);
  assert.equal((await reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: TARDE})).conflictos.length, 1);
  assert.equal(estado({raiz, ahora: TARDE}).sesiones.find((s) => s.id === a.id).tarea, 'revisar enlaces');
}));

test('una sesión caducada no revive con latido ni puede reclamar', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['docs'], ahora: T0});
  const b = await sesion(raiz, 'B', TARDE);
  assert.deepEqual((await reclamar({raiz, id: b.id, recursos: ['docs/test.md'], ahora: TARDE})).conflictos, []);
  await assert.rejects(latido({raiz, id: a.id, ahora: TARDE + 1}), /caducada/);
  await assert.rejects(reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: TARDE + 1}), /caducada/);
  await terminar({raiz, id: a.id, resumen: 'cierre tardío', ahora: TARDE + 2});
  assert.deepEqual(estado({raiz, ahora: TARDE + 3}).reclamos.map((r) => r.id), [b.id]);
}));

test('operar con una sesión inexistente es un error explícito', () => conRaiz(async (raiz) => {
  await assert.rejects(reclamar({raiz, id: 'nadie', recursos: ['README.md'], ahora: T0}), /sesión/);
  await assert.rejects(latido({raiz, id: 'nadie', ahora: T0}), /sesión/);
}));

test('la bitácora solo crece y conserva autor y hora', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await anotar({raiz, id: a.id, mensaje: 'el puerto 5176 lo usan dos validadores', ahora: T0});
  await anotar({raiz, id: a.id, mensaje: 'línea\nnueva', ahora: T0});
  const texto = readFileSync(join(raiz, 'bitacora.md'), 'utf8');
  assert.match(texto, new RegExp(`2026-11-27T15:00:00.000Z \\[${a.id}\\] el puerto 5176`));
  assert.match(texto, /línea nueva/);
  assert.equal(estado({raiz, ahora: T0}).bitacora.length, 3);
}));

test('terminar borra sesión y reclamos y deja un resumen', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A'); const b = await sesion(raiz, 'B');
  await reclamar({raiz, id: a.id, recursos: ['README.md', 'puerto:5174'], ahora: T0});
  await terminar({raiz, id: a.id, resumen: 'README revisado', ahora: T0});
  assert.equal(existsSync(join(raiz, 'sesiones', `${a.id}.json`)), false);
  assert.deepEqual((await reclamar({raiz, id: b.id, recursos: ['README.md', 'puerto:5174'], ahora: T0})).conflictos, []);
  assert.match(readFileSync(join(raiz, 'bitacora.md'), 'utf8'), /terminó: README revisado/);
}));

test('limpiar retira sesiones caducadas con todos sus reclamos y respeta las activas', () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['README.md', 'puerto:5174'], ahora: T0});
  const b = await sesion(raiz, 'B', TARDE);
  await reclamar({raiz, id: b.id, recursos: ['docs'], ahora: TARDE});
  assert.deepEqual(await limpiarInactivas({raiz, ahora: TARDE}), [a.id]);
  const e = estado({raiz, ahora: TARDE});
  assert.deepEqual(e.sesiones.map((s) => s.id), [b.id]);
  assert.deepEqual(e.reclamos.map((r) => r.recurso), ['docs']);
}));

test('si falla el latido final, reclamar deshace los reclamos nuevos y conserva los previos', {skip: process.getuid?.() === 0}, () => conRaiz(async (raiz) => {
  const a = await sesion(raiz, 'A');
  await reclamar({raiz, id: a.id, recursos: ['docs'], ahora: T0});
  chmodSync(join(raiz, 'sesiones'), 0o500);
  try {
    await assert.rejects(reclamar({raiz, id: a.id, recursos: ['README.md', 'puerto:1'], ahora: T0}), /EACCES/);
  } finally { chmodSync(join(raiz, 'sesiones'), 0o700); }
  assert.deepEqual(recursosDe(raiz), [`docs=${a.id}`]);
}));

test('el mutex es exclusivo y el sistema lo libera si su dueño muere', () => conRaiz(async (raiz) => {
  const dueno = spawn('node', ['--input-type=module', '-e',
    `import {conMutex} from ${JSON.stringify(MODULO)};
     await conMutex(${JSON.stringify(raiz)}, () => { console.log('dentro'); setInterval(() => {}, 1000); return new Promise(() => {}); });`],
  {stdio: ['ignore', 'pipe', 'inherit']});
  try {
    await new Promise((ok) => dueno.stdout.once('data', ok));
    let entro = false;
    const espera = conMutex(raiz, () => { entro = true; });
    await new Promise((ok) => setTimeout(ok, 300));
    assert.equal(entro, false, 'el mutex está ocupado mientras el dueño vive');
    dueno.kill('SIGKILL');
    await espera;
    assert.equal(entro, true, 'entra al morir el dueño, sin recuperar nada a mano');
  } finally { dueno.kill('SIGKILL'); }
}));

async function enHilos(raiz, ids, recurso) {
  const codigo = `
    const {workerData, parentPort} = require('node:worker_threads');
    import(workerData.modulo).then(async ({reclamar}) => {
      const r = await reclamar({raiz: workerData.raiz, id: workerData.id, recursos: [workerData.recurso]});
      parentPort.postMessage(r.obtenidos.length);
    });`;
  return Promise.all(ids.map((id) => new Promise((ok, mal) => {
    const w = new Worker(codigo, {eval: true, workerData: {raiz, id, modulo: MODULO, recurso}});
    w.once('message', ok); w.once('error', mal);
  })));
}

test('reclamos simultáneos desde varios hilos: exactamente uno gana', () => conRaiz(async (raiz) => {
  const ids = [];
  for (let i = 0; i < 8; i += 1) ids.push((await sesion(raiz, `agente${i}`, Date.now())).id);
  const ganados = await enHilos(raiz, ids, 'src/palacio.js');
  assert.equal(ganados.reduce((a, b) => a + b, 0), 1);
}));

test('varios hilos tomando el mismo reclamo abandonado: exactamente uno gana y lo conserva', () => conRaiz(async (raiz) => {
  const viejo = Date.now() - INACTIVIDAD_MS - 1000;
  const a = await sesion(raiz, 'A', viejo);
  await reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: viejo});
  const ids = [];
  for (let i = 0; i < 8; i += 1) ids.push((await sesion(raiz, `agente${i}`, Date.now())).id);
  const ganados = await enHilos(raiz, ids, 'README.md');
  assert.equal(ganados.reduce((x, y) => x + y, 0), 1);
  assert.deepEqual(estado({raiz}).reclamos.map((r) => r.id), [ids[ganados.indexOf(1)]]);
}));

test('el intervalo de latido debe ser positivo y menor que la caducidad', () => {
  assert.equal(intervaloLatido(undefined), 10 * 60 * 1000);
  assert.equal(intervaloLatido('50'), 50);
  for (const malo of ['', ' ', '0', '-5', 'abc', 'Infinity', String(INACTIVIDAD_MS), '2400000']) {
    assert.throws(() => intervaloLatido(malo), /AGENTES_LATIDO_MS/);
  }
});

test('un grupo con solo procesos zombis no cuenta como activo', () => {
  // Formato de /proc/<pid>/stat: pid (comm) estado ppid pgrp ...
  const proc = {'10': '10 (node) Z 1 77 77', '11': '11 (mi (raro) cmd) Z 1 77 77', '12': '12 (bash) S 1 99 99'};
  const fuente = {listar: () => Object.keys(proc), leer: (pid) => proc[pid]};
  assert.equal(grupoActivo(77, fuente), false);
  proc['13'] = '13 (node) R 1 77 77';
  assert.equal(grupoActivo(77, fuente), true);
  delete proc['13'];
  proc['14'] = '14 (node) S 1 77 77';
  assert.equal(grupoActivo(77, fuente), true);
});

// ---------- ejecutar (CLI) ----------

const cli = (raiz, args, extra = {}) =>
  spawnSync('node', [CLI, ...args], {env: {...process.env, AGENTES_DIR: raiz, ...extra}, encoding: 'utf8'});
/** ¿Puede el proceso ejecutarse? Un zombi (estado Z en /proc) ya no ejecuta ni escribe. */
const vivo = (pid) => {
  try { process.kill(pid, 0); } catch (e) { return e.code !== 'ESRCH'; }
  if (process.platform !== 'linux') return true;
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0] !== 'Z';
  } catch { return false; }
};
const esperarArchivo = async (ruta, ms = 5000) => {
  const limite = Date.now() + ms;
  while (!existsSync(ruta)) { if (Date.now() > limite) throw new Error(`no apareció ${ruta}`); await new Promise((ok) => setTimeout(ok, 20)); }
};

test('ejecutar mantiene el latido mientras corre un comando y devuelve su código', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const antes = estado({raiz}).sesiones[0].latido;
  const r = cli(raiz, ['ejecutar', '--id', id, '--', 'node', '-e', 'setTimeout(()=>process.exit(3),400)'], {AGENTES_LATIDO_MS: '50'});
  assert.equal(r.status, 3);
  assert.ok(estado({raiz}).sesiones[0].latido > antes, 'hubo latidos durante el comando');
}));

test('ejecutar rechaza un intervalo de latido que deja caducar la sesión', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const r = cli(raiz, ['ejecutar', '--id', id, '--', 'node', '-e', ''], {AGENTES_LATIDO_MS: '2400000'});
  assert.equal(r.status, 1);
  assert.match(r.stderr, /AGENTES_LATIDO_MS/);
}));

test('al perder la sesión, ejecutar detiene todo el grupo, incluso subprocesos que ignoran SIGTERM', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const listo = join(raiz, 'nieto-listo');
  const marca = join(raiz, 'escrito-por-el-nieto');
  // El nieto ignora SIGTERM, anota su pid al arrancar y escribiría la marca a los 3 s.
  const nieto = `process.on('SIGTERM',()=>{});require('fs').writeFileSync(${JSON.stringify(listo)},String(process.pid));` +
    `setTimeout(()=>require('fs').writeFileSync(${JSON.stringify(marca)},'x'),3000)`;
  const padre = `require('child_process').spawn('node',['-e',${JSON.stringify(nieto)}],{stdio:'inherit'});setTimeout(()=>{},10000)`;
  const env = {...process.env, AGENTES_DIR: raiz, AGENTES_LATIDO_MS: '50', AGENTES_GRACIA_MS: '500'};
  const hijo = spawn('node', [CLI, 'ejecutar', '--id', id, '--', 'node', '-e', padre], {env, stdio: 'ignore'});
  await esperarArchivo(listo); // el comando arrancó de verdad antes de perder la sesión
  const pidNieto = Number(readFileSync(listo, 'utf8'));
  await conMutex(raiz, () => rmSync(join(raiz, 'sesiones', `${id}.json`)));
  assert.equal(await new Promise((ok) => hijo.on('exit', ok)), 1);
  assert.equal(vivo(pidNieto), false, 'el nieto ya no puede ejecutarse cuando ejecutar devuelve el control');
  await new Promise((ok) => setTimeout(ok, 3200));
  assert.equal(existsSync(marca), false);
}));

test('al caducar la sesión durante el comando, ejecutar lo detiene y falla', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const listo = join(raiz, 'listo');
  const env = {...process.env, AGENTES_DIR: raiz, AGENTES_LATIDO_MS: '50'};
  const inicio = Date.now();
  const hijo = spawn('node', [CLI, 'ejecutar', '--id', id, '--', 'node', '-e',
    `require('fs').writeFileSync(${JSON.stringify(listo)},'');setTimeout(()=>{},10000)`], {env, stdio: 'ignore'});
  await esperarArchivo(listo);
  const ruta = join(raiz, 'sesiones', `${id}.json`);
  await conMutex(raiz, () => {
    const s = JSON.parse(readFileSync(ruta, 'utf8'));
    writeFileSync(ruta, JSON.stringify({...s, latido: new Date(Date.now() - INACTIVIDAD_MS - 1000).toISOString()}));
  });
  assert.equal(await new Promise((ok) => hijo.on('exit', ok)), 1);
  assert.ok(Date.now() - inicio < 8000, 'no esperó a que el comando terminara solo');
}));

test('si ejecutar recibe SIGTERM, detiene todo el grupo antes de salir', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const listo = join(raiz, 'nieto-listo');
  const marca = join(raiz, 'escrito-por-el-nieto');
  const nieto = `process.on('SIGTERM',()=>{});require('fs').writeFileSync(${JSON.stringify(listo)},String(process.pid));` +
    `setTimeout(()=>require('fs').writeFileSync(${JSON.stringify(marca)},'x'),3000)`;
  const padre = `require('child_process').spawn('node',['-e',${JSON.stringify(nieto)}],{stdio:'inherit'});setTimeout(()=>{},10000)`;
  const env = {...process.env, AGENTES_DIR: raiz, AGENTES_GRACIA_MS: '500'};
  const hijo = spawn('node', [CLI, 'ejecutar', '--id', id, '--', 'node', '-e', padre], {env, stdio: 'ignore'});
  await esperarArchivo(listo);
  const pidNieto = Number(readFileSync(listo, 'utf8'));
  hijo.kill('SIGTERM');
  const codigo = await new Promise((ok) => hijo.on('exit', (c, s) => ok(c ?? s)));
  assert.equal(codigo, 143, 'sale con 128 + SIGTERM');
  assert.equal(vivo(pidNieto), false, 'el nieto ya no puede ejecutarse cuando ejecutar sale');
  await new Promise((ok) => setTimeout(ok, 3200));
  assert.equal(existsSync(marca), false);
}));

test('el mutex no se cuelga si alguien se conecta a su socket mientras se usa', () => conRaiz(async (raiz) => {
  const inicio = Date.now();
  await conMutex(raiz, async () => {
    const cliente = connect(direccionMutex(raiz));
    cliente.on('error', () => {});
    await new Promise((ok) => setTimeout(ok, 150));
  });
  assert.ok(Date.now() - inicio < 2000, 'close() no esperó a la conexión');
}));

test('ejecutar espera a los subprocesos que siguen vivos cuando el lanzador sale', () => conRaiz(async (raiz) => {
  const id = cli(raiz, ['iniciar', '--agente', 'A', '--tarea', 'build']).stdout.trim();
  const marca = join(raiz, 'escrito-por-el-trabajador');
  const trabajador = `setTimeout(()=>require('fs').writeFileSync(${JSON.stringify(marca)},'x'),800)`;
  const lanzador = `require('child_process').spawn('node',['-e',${JSON.stringify(trabajador)}],{stdio:'ignore'}).unref();process.exit(0)`;
  const r = cli(raiz, ['ejecutar', '--id', id, '--', 'node', '-e', lanzador], {AGENTES_LATIDO_MS: '50'});
  assert.equal(r.status, 0);
  assert.equal(existsSync(marca), true, 'ejecutar no volvió hasta que terminó el trabajador');
}));
