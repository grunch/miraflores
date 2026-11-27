/**
 * Coordinación entre agentes que trabajan a la vez en este directorio.
 *
 * Ningún archivo tiene dos escritores:
 * - sesiones/<id>.json: solo lo escribe su sesión (escritura atómica por rename).
 * - reclamos/<hash>.json: se publica completo con link() atómico; el sistema de archivos decide quién gana.
 * - bitacora.md: solo se añade con O_APPEND, una escritura por entrada.
 * Todo borrado de reclamo se hace bajo un cerrojo exclusivo (<reclamo>.toma) y tras volver a comprobar.
 * Una sesión sin latido durante INACTIVIDAD_MS se considera abandonada: sus reclamos pueden tomarse
 * y ya no puede revivir; debe terminar e iniciar otra.
 */
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync,
  linkSync, rmSync, statSync, unlinkSync, writeFileSync,
} from 'node:fs';
import {createHash, randomBytes} from 'node:crypto';
import {join, posix} from 'node:path';

export const INACTIVIDAD_MS = 30 * 60 * 1000;
export const LATIDO_RECOMENDADO_MS = 10 * 60 * 1000;
const CERROJO_HUERFANO_MS = 60 * 1000;
const REINTENTOS_CERROJO = 50;
const PAUSA_CERROJO_MS = 20;
const MAX_ENTRADA = 3000;

const dirSesiones = (raiz) => join(raiz, 'sesiones');
const dirReclamos = (raiz) => join(raiz, 'reclamos');
const archivoSesion = (raiz, id) => join(dirSesiones(raiz), `${id}.json`);
const archivoReclamo = (raiz, recurso) =>
  join(dirReclamos(raiz), `${createHash('sha1').update(recurso).digest('hex').slice(0, 16)}.json`);
const iso = (ms) => new Date(ms).toISOString();
const sufijo = () => randomBytes(4).toString('hex');

function leerJson(ruta) {
  try { return JSON.parse(readFileSync(ruta, 'utf8')); } catch (e) {
    if (e.code === 'ENOENT') return null;
    if (e instanceof SyntaxError) return null; // archivo ajeno corrupto: se ignora en lugar de bloquear a todos
    throw e;
  }
}

function escribirAtomico(ruta, datos) {
  const tmp = `${ruta}.${process.pid}.${sufijo()}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(datos, null, 2)}\n`);
  renameSync(tmp, ruta);
}

function listarJson(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => n.endsWith('.json')).map((n) => leerJson(join(dir, n))).filter(Boolean);
}

export function normalizarRecurso(recurso) {
  const texto = String(recurso ?? '').trim();
  if (/^[a-z][a-z0-9-]*:[^/]/i.test(texto)) return texto.toLowerCase();
  if (!texto || texto.startsWith('/')) throw new RangeError(`Recurso inválido: «${texto}»`);
  const ruta = posix.normalize(texto).replace(/\/+$/, '');
  if (ruta === '.' || ruta === '..' || ruta.startsWith('../')) throw new RangeError(`Recurso fuera del proyecto: «${texto}»`);
  return ruta;
}

const esRuta = (r) => !/^[a-z][a-z0-9-]*:/.test(r);
export function seSolapan(a, b) {
  if (a === b) return true;
  if (!esRuta(a) || !esRuta(b)) return false;
  return a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function slug(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'agente';
}

function sesionActiva(raiz, id, ahora) {
  const s = leerJson(archivoSesion(raiz, id));
  return s && ahora - Date.parse(s.latido) <= INACTIVIDAD_MS ? s : null;
}

function exigirSesion(raiz, id) {
  const s = leerJson(archivoSesion(raiz, id));
  if (!s) throw new Error(`No existe la sesión «${id}». Inicia una con «node scripts/agentes.mjs iniciar».`);
  return s;
}

/**
 * Una sesión caducada no puede revivir: otros agentes pudieron tomar recursos que se solapan con
 * sus reclamos mientras estuvo inactiva. Debe terminar e iniciar una sesión nueva.
 */
function exigirSesionActiva(raiz, id, ahora) {
  const s = exigirSesion(raiz, id);
  if (ahora - Date.parse(s.latido) > INACTIVIDAD_MS) {
    throw new Error(`La sesión «${id}» está caducada (último latido ${s.latido}). Ejecuta «terminar» e inicia una nueva; sus reclamos ya no valen.`);
  }
  return s;
}

export function iniciarSesion({raiz, agente, tarea, rama = null, directorio = null, ahora = Date.now()}) {
  if (!agente || !tarea) throw new TypeError('iniciar necesita agente y tarea');
  mkdirSync(dirSesiones(raiz), {recursive: true});
  mkdirSync(dirReclamos(raiz), {recursive: true});
  const fecha = iso(ahora).replace(/[-:]/g, '');
  const id = `${slug(agente)}-${fecha.slice(0, 8)}-${fecha.slice(9, 13)}-${sufijo().slice(0, 4)}`;
  const sesion = {id, agente, tarea, rama, directorio, inicio: iso(ahora), latido: iso(ahora)};
  writeFileSync(archivoSesion(raiz, id), `${JSON.stringify(sesion, null, 2)}\n`, {flag: 'wx'});
  anotar({raiz, id, mensaje: `inició: ${tarea}`, ahora});
  return sesion;
}

/** Bajo el cerrojo de la sesión: limpiar no puede retirarla mientras se publica su latido. */
export function latido({raiz, id, tarea, ahora = Date.now()}) {
  exigirSesionActiva(raiz, id, ahora);
  return conCerrojoReintentando(archivoSesion(raiz, id), `la sesión «${id}»`, () => {
    const s = exigirSesionActiva(raiz, id, ahora);
    const nueva = {...s, latido: iso(ahora), ...(tarea ? {tarea} : {})};
    escribirAtomico(archivoSesion(raiz, id), nueva);
    return nueva;
  });
}

function procesoVivo(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/**
 * Devuelve la identidad (stat) del archivo si es un cerrojo huérfano: el proceso que lo creó ya no
 * existe (todos los agentes corren en esta máquina). La antigüedad no basta, porque un dueño vivo puede
 * estar suspendido; solo se usa si el cerrojo no tiene un pid legible (lo dejó otra herramienta).
 */
function observarHuerfano(ruta) {
  let identidad; let contenido;
  try {
    identidad = statSync(ruta);
    contenido = readFileSync(ruta, 'utf8');
  } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  const vivo = procesoVivo(Number.parseInt(contenido, 10));
  const huerfano = vivo === null ? Date.now() - identidad.mtimeMs >= CERROJO_HUERFANO_MS : !vivo;
  return huerfano ? identidad : null;
}

const mismoArchivo = (a, b) =>
  a.dev === b.dev && a.ino === b.ino && a.birthtimeMs === b.birthtimeMs && a.mtimeMs === b.mtimeMs;

/**
 * Retira el archivo solo si sigue siendo el que se observó. Se aparta con un rename atómico y se
 * compara su identidad; si resulta ser otro (el cerrojo nuevo de un dueño vivo), se devuelve a su
 * sitio con link(), que no pisa un archivo más reciente.
 */
function retirarSiEsElMismo(ruta, observado) {
  const apartado = `${ruta}.${process.pid}.${sufijo()}.retirado`;
  try { renameSync(ruta, apartado); } catch (e) { if (e.code === 'ENOENT') return false; throw e; }
  if (mismoArchivo(statSync(apartado), observado)) { rmSync(apartado, {force: true}); return true; }
  try { linkSync(apartado, ruta); } catch (e) { if (e.code !== 'EEXIST') throw e; }
  rmSync(apartado, {force: true});
  return false;
}

/** Publica el archivo completo de una vez: link() es atómico y falla con EEXIST si ya existe. */
function publicarExclusivo(ruta, datos) {
  const tmp = `${ruta}.${process.pid}.${sufijo()}.tmp`;
  writeFileSync(tmp, datos);
  try { linkSync(tmp, ruta); } finally {
    try { rmSync(tmp, {force: true}); } catch { /* ya se publicó: un temporal huérfano es inofensivo */ }
  }
}

/**
 * Retira un cerrojo huérfano bajo un segundo cerrojo (<cerrojo>.rec). Ambas retiradas verifican la
 * identidad del archivo observado, así que nadie borra el cerrojo nuevo de otro proceso.
 */
function recuperarCerrojo(cerrojo) {
  const rec = `${cerrojo}.rec`;
  try { publicarExclusivo(rec, `${process.pid}\n`); } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const recHuerfano = observarHuerfano(rec); // el recuperador murió dentro de la recuperación
    if (recHuerfano) retirarSiEsElMismo(rec, recHuerfano);
    return;
  }
  try {
    const huerfano = observarHuerfano(cerrojo);
    if (huerfano) retirarSiEsElMismo(cerrojo, huerfano);
  } finally { rmSync(rec, {force: true}); }
}

/**
 * Ejecuta fn con el cerrojo exclusivo <ruta>.toma. Todo borrado de un reclamo y toda escritura de una
 * sesión pasan por aquí, así la comprobación y el cambio son una sola transición.
 * Devuelve null si otro proceso vivo tiene el cerrojo.
 */
function conCerrojo(ruta, fn) {
  const cerrojo = `${ruta}.toma`;
  for (let intento = 0; intento < 3; intento += 1) {
    try {
      publicarExclusivo(cerrojo, `${process.pid}\n`);
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (!observarHuerfano(cerrojo)) return null;
      recuperarCerrojo(cerrojo);
      continue;
    }
    try { return fn(); } finally { rmSync(cerrojo, {force: true}); }
  }
  return null;
}

const pausa = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Como conCerrojo, pero los cerrojos solo se retienen microsegundos: reintenta en vez de rendirse. */
function conCerrojoReintentando(ruta, descripcion, fn) {
  for (let intento = 0; intento < REINTENTOS_CERROJO; intento += 1) {
    const r = conCerrojo(ruta, () => ({valor: fn()}));
    if (r) return r.valor;
    pausa(PAUSA_CERROJO_MS);
  }
  throw new Error(`El cerrojo de ${descripcion} sigue ocupado. Reintenta en unos segundos.`);
}

/**
 * Un reclamo ilegible (corrupto o escrito por otra herramienta) solo se considera abandonado cuando es
 * antiguo: si es reciente, alguien podría estar publicándolo y borrarlo le quitaría un reclamo válido.
 */
function reclamoVigente(raiz, ruta, ahora) {
  const datos = leerJson(ruta);
  if (datos) return sesionActiva(raiz, datos.id, ahora) ? datos : null;
  try {
    return Date.now() - statSync(ruta).mtimeMs < CERROJO_HUERFANO_MS ? {id: 'desconocido'} : null;
  } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}

/** Retira un reclamo cuyo dueño ya no está activo, comprobándolo de nuevo bajo el cerrojo. */
function tomarSiAbandonado(raiz, ruta, ahora) {
  if (reclamoVigente(raiz, ruta, ahora)) return false; // dueño vivo: ni siquiera se toma el cerrojo
  return conCerrojo(ruta, () => {
    if (reclamoVigente(raiz, ruta, ahora)) return false;
    rmSync(ruta, {force: true});
    return true;
  }) ?? false;
}

function crearReclamo(raiz, recurso, id, ahora) {
  const ruta = archivoReclamo(raiz, recurso);
  const datos = `${JSON.stringify({recurso, id, desde: iso(ahora)}, null, 2)}\n`;
  for (let intento = 0; intento < 2; intento += 1) {
    try { publicarExclusivo(ruta, datos); return {ok: true}; } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const actual = leerJson(ruta);
      if (actual?.id === id) return {ok: true, previo: true};
      if (!tomarSiAbandonado(raiz, ruta, ahora)) return {ok: false, dueno: actual?.id ?? 'desconocido'};
    }
  }
  return {ok: false, dueno: leerJson(ruta)?.id ?? 'desconocido'};
}

function borrarReclamoPropio(raiz, recurso, id) {
  const ruta = archivoReclamo(raiz, recurso);
  conCerrojoReintentando(ruta, `«${recurso}»`, () => { if (leerJson(ruta)?.id === id) rmSync(ruta, {force: true}); });
}

function solapamientos(raiz, id, pedidos, ahora) {
  const conflictos = [];
  for (const otro of listarJson(dirReclamos(raiz))) {
    if (otro.id === id || !sesionActiva(raiz, otro.id, ahora)) continue;
    const choque = pedidos.find((p) => seSolapan(p, otro.recurso));
    if (choque) conflictos.push({recurso: choque, dueno: otro.id, con: otro.recurso});
  }
  return conflictos;
}

/** Reclama todos los recursos o ninguno. Devuelve {obtenidos, conflictos}. */
export function reclamar({raiz, id, recursos, ahora = Date.now()}) {
  exigirSesionActiva(raiz, id, ahora);
  const pedidos = [...new Set(recursos.map(normalizarRecurso))];
  const nuevos = [];
  const deshacer = () => {
    const fallidos = liberarTodos({raiz, id, recursos: nuevos});
    if (fallidos.length) throw new Error(`Reversión incompleta: no se liberaron ${fallidos.map((f) => f.recurso).join(', ')}`);
  };
  try {
    let conflictos = [];
    for (const recurso of pedidos) {
      const r = crearReclamo(raiz, recurso, id, ahora);
      if (!r.ok) { conflictos = [{recurso, dueno: r.dueno}]; break; }
      if (!r.previo) nuevos.push(recurso);
    }
    // Directorio frente a archivo interior: se comprueba después de crear, contra reclamos vivos ajenos.
    if (!conflictos.length) conflictos = solapamientos(raiz, id, pedidos, ahora);
    if (conflictos.length) { deshacer(); return {obtenidos: [], conflictos}; }
    latido({raiz, id, ahora});
    return {obtenidos: pedidos, conflictos: []};
  } catch (e) {
    try { deshacer(); } catch (r) { throw new Error(`${e.message}. ${r.message}; libéralos con «liberar».`, {cause: e}); }
    throw e;
  }
}

/** Intenta liberar todos los recursos aunque alguno falle. Devuelve los fallidos con su error. */
export function liberarTodos({raiz, id, recursos}) {
  const fallidos = [];
  for (const recurso of recursos.map(normalizarRecurso)) {
    try { borrarReclamoPropio(raiz, recurso, id); } catch (error) { fallidos.push({recurso, error}); }
  }
  return fallidos;
}

export function liberar({raiz, id, recursos}) {
  const fallidos = liberarTodos({raiz, id, recursos});
  if (fallidos.length) throw new Error(fallidos.map((f) => f.error.message).join(' '));
}

export function anotar({raiz, id, mensaje, ahora = Date.now()}) {
  mkdirSync(raiz, {recursive: true});
  const texto = String(mensaje).replace(/\s+/g, ' ').trim().slice(0, MAX_ENTRADA);
  appendFileSync(join(raiz, 'bitacora.md'), `- ${iso(ahora)} [${id}] ${texto}\n`);
}

export function terminar({raiz, id, resumen = 'sin resumen', ahora = Date.now()}) {
  exigirSesion(raiz, id);
  for (const r of listarJson(dirReclamos(raiz))) if (r.id === id) borrarReclamoPropio(raiz, r.recurso, id);
  anotar({raiz, id, mensaje: `terminó: ${resumen}`, ahora});
  conCerrojoReintentando(archivoSesion(raiz, id), `la sesión «${id}»`, () => unlinkSync(archivoSesion(raiz, id)));
}

export function limpiarInactivas({raiz, ahora = Date.now()}) {
  const retiradas = [];
  for (const s of listarJson(dirSesiones(raiz))) {
    if (sesionActiva(raiz, s.id, ahora)) continue;
    // Bajo el cerrojo de la sesión y comprobando otra vez: un latido en curso gana. Ocupado: se omite.
    const retirada = conCerrojo(archivoSesion(raiz, s.id), () => {
      if (sesionActiva(raiz, s.id, ahora)) return false;
      for (const r of listarJson(dirReclamos(raiz))) {
        if (r.id === s.id) tomarSiAbandonado(raiz, archivoReclamo(raiz, r.recurso), ahora);
      }
      rmSync(archivoSesion(raiz, s.id), {force: true});
      return true;
    });
    if (!retirada) continue;
    anotar({raiz, id: 'limpieza', mensaje: `retiró la sesión inactiva ${s.id} (último latido ${s.latido})`, ahora});
    retiradas.push(s.id);
  }
  return retiradas;
}

export function estado({raiz, ahora = Date.now(), lineas = 30}) {
  const sesiones = listarJson(dirSesiones(raiz))
    .map((s) => ({...s, inactiva: ahora - Date.parse(s.latido) > INACTIVIDAD_MS}))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const reclamos = listarJson(dirReclamos(raiz)).sort((a, b) => a.recurso.localeCompare(b.recurso));
  const ruta = join(raiz, 'bitacora.md');
  const bitacora = existsSync(ruta) ? readFileSync(ruta, 'utf8').trimEnd().split('\n').slice(-lineas) : [];
  return {sesiones, reclamos, bitacora};
}

/** Solo para pruebas. */
export const __pruebas = Object.freeze({retirarSiEsElMismo});
