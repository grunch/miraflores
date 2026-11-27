/**
 * Coordinación entre agentes que trabajan a la vez en este directorio.
 *
 * Ningún archivo tiene dos escritores:
 * - sesiones/<id>.json: solo lo escribe su sesión (escritura atómica por rename).
 * - reclamos/<hash>.json: se crea con O_EXCL ('wx'); el sistema de archivos decide quién gana.
 * - bitacora.md: solo se añade con O_APPEND, una escritura por entrada.
 * Una sesión sin latido durante INACTIVIDAD_MS se considera abandonada y sus reclamos pueden tomarse.
 */
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync,
  rmSync, unlinkSync, writeFileSync,
} from 'node:fs';
import {createHash, randomBytes} from 'node:crypto';
import {join, posix} from 'node:path';

export const INACTIVIDAD_MS = 30 * 60 * 1000;
export const LATIDO_RECOMENDADO_MS = 10 * 60 * 1000;
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

export function iniciarSesion({raiz, agente, tarea, rama = null, ahora = Date.now()}) {
  if (!agente || !tarea) throw new TypeError('iniciar necesita agente y tarea');
  mkdirSync(dirSesiones(raiz), {recursive: true});
  mkdirSync(dirReclamos(raiz), {recursive: true});
  const fecha = iso(ahora).replace(/[-:]/g, '');
  const id = `${slug(agente)}-${fecha.slice(0, 8)}-${fecha.slice(9, 13)}-${sufijo().slice(0, 4)}`;
  const sesion = {id, agente, tarea, rama, inicio: iso(ahora), latido: iso(ahora)};
  writeFileSync(archivoSesion(raiz, id), `${JSON.stringify(sesion, null, 2)}\n`, {flag: 'wx'});
  anotar({raiz, id, mensaje: `inició: ${tarea}`, ahora});
  return sesion;
}

export function latido({raiz, id, tarea, ahora = Date.now()}) {
  const s = exigirSesion(raiz, id);
  const nueva = {...s, latido: iso(ahora), ...(tarea ? {tarea} : {})};
  escribirAtomico(archivoSesion(raiz, id), nueva);
  return nueva;
}

/** Retira un reclamo cuyo dueño ya no está activo. Solo un agente consigue el rename. */
function tomarSiAbandonado(raiz, ruta, id, ahora) {
  const actual = leerJson(ruta);
  if (actual && sesionActiva(raiz, actual.id, ahora)) return false;
  const descarte = `${ruta}.${id}.${sufijo()}.descartado`;
  try { renameSync(ruta, descarte); } catch (e) { if (e.code === 'ENOENT') return true; throw e; }
  rmSync(descarte, {force: true});
  return true;
}

function crearReclamo(raiz, recurso, id, ahora) {
  const ruta = archivoReclamo(raiz, recurso);
  const datos = `${JSON.stringify({recurso, id, desde: iso(ahora)}, null, 2)}\n`;
  for (let intento = 0; intento < 2; intento += 1) {
    try { writeFileSync(ruta, datos, {flag: 'wx'}); return {ok: true}; } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const actual = leerJson(ruta);
      if (actual?.id === id) return {ok: true, previo: true};
      if (!tomarSiAbandonado(raiz, ruta, id, ahora)) return {ok: false, dueno: actual?.id ?? 'desconocido'};
    }
  }
  return {ok: false, dueno: leerJson(ruta)?.id ?? 'desconocido'};
}

function borrarReclamoPropio(raiz, recurso, id) {
  const ruta = archivoReclamo(raiz, recurso);
  if (leerJson(ruta)?.id === id) rmSync(ruta, {force: true});
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
  exigirSesion(raiz, id);
  const pedidos = [...new Set(recursos.map(normalizarRecurso))];
  const nuevos = [];
  let conflictos = [];
  for (const recurso of pedidos) {
    const r = crearReclamo(raiz, recurso, id, ahora);
    if (!r.ok) { conflictos = [{recurso, dueno: r.dueno}]; break; }
    if (!r.previo) nuevos.push(recurso);
  }
  // Directorio frente a archivo interior: se comprueba después de crear, contra reclamos vivos ajenos.
  if (!conflictos.length) conflictos = solapamientos(raiz, id, pedidos, ahora);
  if (conflictos.length) {
    for (const recurso of nuevos) borrarReclamoPropio(raiz, recurso, id);
    return {obtenidos: [], conflictos};
  }
  latido({raiz, id, ahora});
  return {obtenidos: pedidos, conflictos: []};
}

export function liberar({raiz, id, recursos}) {
  for (const recurso of recursos.map(normalizarRecurso)) borrarReclamoPropio(raiz, recurso, id);
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
  unlinkSync(archivoSesion(raiz, id));
}

export function limpiarInactivas({raiz, ahora = Date.now()}) {
  const retiradas = [];
  for (const s of listarJson(dirSesiones(raiz))) {
    if (sesionActiva(raiz, s.id, ahora)) continue;
    for (const r of listarJson(dirReclamos(raiz))) {
      if (r.id === s.id) tomarSiAbandonado(raiz, archivoReclamo(raiz, r.recurso), 'limpieza', ahora);
    }
    rmSync(archivoSesion(raiz, s.id), {force: true});
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
