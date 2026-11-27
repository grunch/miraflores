import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, readFileSync, existsSync, readdirSync, writeFileSync, utimesSync, chmodSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Worker} from 'node:worker_threads';
import {
  INACTIVIDAD_MS, iniciarSesion, latido, reclamar, liberar, anotar, terminar,
  estado, limpiarInactivas, normalizarRecurso, liberarTodos,
} from '../scripts/coordinacion-agentes.mjs';

const T0 = Date.parse('2026-11-27T15:00:00Z');
function conRaiz(fn) {
  const raiz = mkdtempSync(join(tmpdir(), 'agentes-'));
  try { return fn(raiz); } finally { rmSync(raiz, {recursive: true, force: true}); }
}
const sesion = (raiz, agente = 'Claude', ahora = T0) =>
  iniciarSesion({raiz, agente, tarea: 'probar', ahora});

test('iniciar crea una sesión propia con identidad, tarea y hora de inicio', () => conRaiz((raiz) => {
  const s = sesion(raiz, 'Codex GPT');
  assert.match(s.id, /^codex-gpt-\d{8}-\d{4}-[0-9a-f]{4}$/);
  const [leida] = estado({raiz, ahora: T0}).sesiones;
  assert.equal(leida.agente, 'Codex GPT');
  assert.equal(leida.tarea, 'probar');
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

test('un recurso reclamado no puede reclamarlo otra sesión activa', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  assert.deepEqual(reclamar({raiz, id: a.id, recursos: ['src/palacio.js'], ahora: T0}).conflictos, []);
  const r = reclamar({raiz, id: b.id, recursos: ['src/palacio.js'], ahora: T0});
  assert.deepEqual(r.obtenidos, []);
  assert.equal(r.conflictos[0].dueno, a.id);
}));

test('detecta solapamiento entre un directorio y un archivo dentro de él', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  reclamar({raiz, id: a.id, recursos: ['docs/prioridades'], ahora: T0});
  const r = reclamar({raiz, id: b.id, recursos: ['docs/prioridades/rotunda.md'], ahora: T0});
  assert.equal(r.conflictos.length, 1);
  assert.equal(reclamar({raiz, id: b.id, recursos: ['docs/prioridades-otro.md'], ahora: T0}).conflictos.length, 0);
}));

test('reclamar es todo o nada: ante un conflicto no retiene los demás recursos', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  reclamar({raiz, id: a.id, recursos: ['puerto:5176'], ahora: T0});
  reclamar({raiz, id: b.id, recursos: ['src/teatro-municipal.js', 'puerto:5176'], ahora: T0});
  const libres = reclamar({raiz, id: a.id, recursos: ['src/teatro-municipal.js'], ahora: T0});
  assert.deepEqual(libres.obtenidos, ['src/teatro-municipal.js']);
}));

test('reclamar de nuevo lo propio no es conflicto', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  assert.deepEqual(reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0}).conflictos, []);
}));

test('liberar deja el recurso disponible para otros', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  liberar({raiz, id: a.id, recursos: ['README.md']});
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: T0}).conflictos, []);
}));

test('liberar no borra reclamos ajenos', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  liberar({raiz, id: b.id, recursos: ['README.md']});
  assert.equal(reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: T0}).conflictos.length, 1);
}));

test('una sesión sin latido durante el plazo pierde sus reclamos', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  const tarde = T0 + INACTIVIDAD_MS + 1;
  const b = sesion(raiz, 'B', tarde);
  assert.equal(estado({raiz, ahora: tarde}).sesiones.find((s) => s.id === a.id).inactiva, true);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: tarde}).conflictos, []);
}));

test('el latido mantiene viva la sesión y puede actualizar la tarea', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  const casi = T0 + INACTIVIDAD_MS - 1000;
  latido({raiz, id: a.id, tarea: 'revisar enlaces', ahora: casi});
  const tarde = T0 + INACTIVIDAD_MS + 1;
  const b = sesion(raiz, 'B', tarde);
  assert.equal(reclamar({raiz, id: b.id, recursos: ['README.md'], ahora: tarde}).conflictos.length, 1);
  assert.equal(estado({raiz, ahora: tarde}).sesiones.find((s) => s.id === a.id).tarea, 'revisar enlaces');
}));

test('operar con una sesión inexistente es un error explícito', () => conRaiz((raiz) => {
  assert.throws(() => reclamar({raiz, id: 'nadie', recursos: ['README.md'], ahora: T0}), /sesión/);
  assert.throws(() => latido({raiz, id: 'nadie', ahora: T0}), /sesión/);
}));

test('la bitácora solo crece y conserva autor y hora', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  anotar({raiz, id: a.id, mensaje: 'el puerto 5176 lo usan dos validadores', ahora: T0});
  anotar({raiz, id: a.id, mensaje: 'línea\nnueva', ahora: T0});
  const texto = readFileSync(join(raiz, 'bitacora.md'), 'utf8');
  assert.match(texto, new RegExp(`2026-11-27T15:00:00.000Z \\[${a.id}\\] el puerto 5176`));
  assert.match(texto, /línea nueva/);
  assert.equal(estado({raiz, ahora: T0}).bitacora.length, 3);
}));

test('terminar borra sesión y reclamos y deja un resumen en la bitácora', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A'); const b = sesion(raiz, 'B');
  reclamar({raiz, id: a.id, recursos: ['README.md', 'puerto:5174'], ahora: T0});
  terminar({raiz, id: a.id, resumen: 'README revisado', ahora: T0});
  assert.equal(existsSync(join(raiz, 'sesiones', `${a.id}.json`)), false);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md', 'puerto:5174'], ahora: T0}).conflictos, []);
  assert.match(readFileSync(join(raiz, 'bitacora.md'), 'utf8'), /terminó: README revisado/);
}));

test('limpiar retira sesiones inactivas y sus reclamos, no las activas', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  const tarde = T0 + INACTIVIDAD_MS + 1;
  const b = sesion(raiz, 'B', tarde);
  reclamar({raiz, id: b.id, recursos: ['docs'], ahora: tarde});
  assert.deepEqual(limpiarInactivas({raiz, ahora: tarde}), [a.id]);
  const e = estado({raiz, ahora: tarde});
  assert.deepEqual(e.sesiones.map((s) => s.id), [b.id]);
  assert.deepEqual(e.reclamos.map((r) => r.recurso), ['docs']);
}));

test('una sesión caducada no revive con latido ni puede reclamar', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['docs'], ahora: T0});
  const tarde = T0 + INACTIVIDAD_MS + 1;
  const b = sesion(raiz, 'B', tarde);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['docs/test.md'], ahora: tarde}).conflictos, []);
  assert.throws(() => latido({raiz, id: a.id, ahora: tarde + 1}), /caducada/);
  assert.throws(() => reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: tarde + 1}), /caducada/);
  terminar({raiz, id: a.id, resumen: 'cierre tardío', ahora: tarde + 2});
  assert.deepEqual(estado({raiz, ahora: tarde + 3}).reclamos.map((r) => r.id), [b.id]);
}));

test('un cerrojo de toma huérfano y antiguo no bloquea el recurso para siempre', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A', Date.now() - INACTIVIDAD_MS - 1000);
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: Date.now() - INACTIVIDAD_MS - 1000});
  const [archivo] = readdirSync(join(raiz, 'reclamos'));
  const cerrojo = join(raiz, 'reclamos', `${archivo}.toma`);
  writeFileSync(cerrojo, 'huérfano');
  const b = sesion(raiz, 'B', Date.now());
  assert.equal(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos.length, 1, 'cerrojo reciente: se respeta');
  const viejo = new Date(Date.now() - 120000);
  utimesSync(cerrojo, viejo, viejo);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos, []);
}));

test('un reclamo ilegible y reciente cuenta como ocupado; solo se toma cuando es antiguo', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0});
  const [archivo] = readdirSync(join(raiz, 'reclamos'));
  const ruta = join(raiz, 'reclamos', archivo);
  writeFileSync(ruta, ''); // como lo vería otro agente si la publicación no fuese atómica
  const b = sesion(raiz, 'B', Date.now());
  assert.equal(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos.length, 1);
  const viejo = new Date(Date.now() - 120000);
  utimesSync(ruta, viejo, viejo);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos, []);
}));

test('los reclamos se publican completos: nunca queda un temporal ni un archivo vacío', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md', 'docs', 'puerto:5174'], ahora: T0});
  const nombres = readdirSync(join(raiz, 'reclamos'));
  assert.equal(nombres.length, 3);
  for (const n of nombres) assert.equal(JSON.parse(readFileSync(join(raiz, 'reclamos', n), 'utf8')).id, a.id);
}));

test('si falla el latido final, reclamar deshace los reclamos nuevos y relanza el error', {skip: process.getuid?.() === 0}, () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['docs'], ahora: T0});
  chmodSync(join(raiz, 'sesiones'), 0o500);
  try {
    assert.throws(() => reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: T0}), /EACCES/);
  } finally { chmodSync(join(raiz, 'sesiones'), 0o700); }
  assert.deepEqual(estado({raiz, ahora: T0}).reclamos.map((r) => r.recurso), ['docs']);
}));

test('limpiar no retira una sesión cuyo latido está en curso', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A', Date.now() - INACTIVIDAD_MS - 1000);
  writeFileSync(join(raiz, 'sesiones', `${a.id}.json.toma`), 'latido en curso');
  assert.deepEqual(limpiarInactivas({raiz}), []);
  assert.equal(estado({raiz}).sesiones.length, 1);
}));

test('ejecutar mantiene el latido mientras corre un comando largo y devuelve su código', () => conRaiz((raiz) => {
  const cli = new URL('../scripts/agentes.mjs', import.meta.url).pathname;
  const env = {...process.env, AGENTES_DIR: raiz, AGENTES_LATIDO_MS: '50'};
  const id = spawnSync('node', [cli, 'iniciar', '--agente', 'A', '--tarea', 'build'], {env, encoding: 'utf8'}).stdout.trim();
  const antes = estado({raiz}).sesiones[0].latido;
  const r = spawnSync('node', [cli, 'ejecutar', '--id', id, '--', 'node', '-e', 'setTimeout(()=>process.exit(3),400)'], {env, encoding: 'utf8'});
  assert.equal(r.status, 3);
  assert.ok(estado({raiz}).sesiones[0].latido > antes, 'hubo latidos durante el comando');
}));

const pidMuerto = () => spawnSync('node', ['-e', 'process.stdout.write(String(process.pid))'], {encoding: 'utf8'}).stdout;

test('un cerrojo de un proceso vivo no se rompe aunque sea antiguo; el de un proceso muerto sí', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A', Date.now() - INACTIVIDAD_MS - 1000);
  reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: Date.now() - INACTIVIDAD_MS - 1000});
  const [archivo] = readdirSync(join(raiz, 'reclamos'));
  const cerrojo = join(raiz, 'reclamos', `${archivo}.toma`);
  const viejo = new Date(Date.now() - 3600000);
  writeFileSync(cerrojo, `${process.pid}\n`);
  utimesSync(cerrojo, viejo, viejo);
  const b = sesion(raiz, 'B', Date.now());
  assert.equal(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos.length, 1, 'dueño vivo: se respeta');
  writeFileSync(cerrojo, `${pidMuerto()}\n`);
  assert.deepEqual(reclamar({raiz, id: b.id, recursos: ['README.md']}).conflictos, [], 'dueño muerto: se recupera');
}));

test('liberarTodos intenta todos los recursos e informa de los que no pudo liberar', () => conRaiz((raiz) => {
  const a = sesion(raiz, 'A');
  reclamar({raiz, id: a.id, recursos: ['README.md', 'docs', 'puerto:5174'], ahora: T0});
  const archivoDocs = readdirSync(join(raiz, 'reclamos'))
    .find((n) => JSON.parse(readFileSync(join(raiz, 'reclamos', n), 'utf8')).recurso === 'docs');
  writeFileSync(join(raiz, 'reclamos', `${archivoDocs}.toma`), `${process.pid}\n`);
  const fallidos = liberarTodos({raiz, id: a.id, recursos: ['README.md', 'docs', 'puerto:5174']});
  assert.deepEqual(fallidos.map((f) => f.recurso), ['docs']);
  assert.deepEqual(estado({raiz, ahora: T0}).reclamos.map((r) => r.recurso), ['docs']);
}));

test('la sesión registra su directorio de trabajo', () => conRaiz((raiz) => {
  iniciarSesion({raiz, agente: 'A', tarea: 't', directorio: '/tmp/miraflores-teatro', ahora: T0});
  assert.equal(estado({raiz, ahora: T0}).sesiones[0].directorio, '/tmp/miraflores-teatro');
}));

test('ejecutar detiene el comando y falla si la sesión caduca mientras corre', async () => {
  const raiz = mkdtempSync(join(tmpdir(), 'agentes-'));
  try {
    const cli = new URL('../scripts/agentes.mjs', import.meta.url).pathname;
    const env = {...process.env, AGENTES_DIR: raiz, AGENTES_LATIDO_MS: '50'};
    const id = spawnSync('node', [cli, 'iniciar', '--agente', 'A', '--tarea', 'build'], {env, encoding: 'utf8'}).stdout.trim();
    const inicio = Date.now();
    const hijo = spawn('node', [cli, 'ejecutar', '--id', id, '--', 'node', '-e', 'setTimeout(()=>{},10000)'], {env, stdio: 'ignore'});
    setTimeout(() => {
      const ruta = join(raiz, 'sesiones', `${id}.json`);
      const s = JSON.parse(readFileSync(ruta, 'utf8'));
      writeFileSync(ruta, JSON.stringify({...s, latido: new Date(Date.now() - INACTIVIDAD_MS - 1000).toISOString()}));
    }, 200);
    const codigo = await new Promise((ok) => hijo.on('exit', ok));
    assert.notEqual(codigo, 0);
    assert.ok(Date.now() - inicio < 5000, 'no esperó a que el comando terminara solo');
  } finally { rmSync(raiz, {recursive: true, force: true}); }
});

async function enHilos(raiz, ids, recurso) {
  const modulo = new URL('../scripts/coordinacion-agentes.mjs', import.meta.url).href;
  const codigo = `
    const {workerData, parentPort} = require('node:worker_threads');
    import(workerData.modulo).then(({reclamar}) => {
      const r = reclamar({raiz: workerData.raiz, id: workerData.id, recursos: [workerData.recurso]});
      parentPort.postMessage(r.obtenidos.length);
    });`;
  return Promise.all(ids.map((id) => new Promise((ok, mal) => {
    const w = new Worker(codigo, {eval: true, workerData: {raiz, id, modulo, recurso}});
    w.once('message', ok); w.once('error', mal);
  })));
}

test('varios hilos tomando el mismo reclamo abandonado: exactamente uno gana y lo conserva', async () => {
  for (let ronda = 0; ronda < 5; ronda += 1) {
    const raiz = mkdtempSync(join(tmpdir(), 'agentes-'));
    try {
      const viejo = Date.now() - INACTIVIDAD_MS - 1000;
      const a = sesion(raiz, 'A', viejo);
      reclamar({raiz, id: a.id, recursos: ['README.md'], ahora: viejo});
      const ids = Array.from({length: 8}, (_, i) => sesion(raiz, `agente${i}`, Date.now()).id);
      const ganados = await enHilos(raiz, ids, 'README.md');
      assert.equal(ganados.reduce((x, y) => x + y, 0), 1);
      const ganador = ids[ganados.indexOf(1)];
      assert.deepEqual(estado({raiz}).reclamos.map((r) => r.id), [ganador]);
    } finally { rmSync(raiz, {recursive: true, force: true}); }
  }
});

test('reclamos simultáneos desde varios hilos: exactamente uno gana', async () => {
  const raiz = mkdtempSync(join(tmpdir(), 'agentes-'));
  try {
    const ids = Array.from({length: 8}, (_, i) => sesion(raiz, `agente${i}`, Date.now()).id);
    const modulo = new URL('../scripts/coordinacion-agentes.mjs', import.meta.url).href;
    const codigo = `
      const {workerData, parentPort} = require('node:worker_threads');
      import(workerData.modulo).then(({reclamar}) => {
        const r = reclamar({raiz: workerData.raiz, id: workerData.id, recursos: ['src/palacio.js']});
        parentPort.postMessage(r.obtenidos.length);
      });`;
    const ganados = await Promise.all(ids.map((id) => new Promise((ok, mal) => {
      const w = new Worker(codigo, {eval: true, workerData: {raiz, id, modulo}});
      w.once('message', ok); w.once('error', mal);
    })));
    assert.equal(ganados.reduce((a, b) => a + b, 0), 1);
  } finally { rmSync(raiz, {recursive: true, force: true}); }
});
