import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Worker} from 'node:worker_threads';
import {
  INACTIVIDAD_MS, iniciarSesion, latido, reclamar, liberar, anotar, terminar,
  estado, limpiarInactivas, normalizarRecurso,
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
