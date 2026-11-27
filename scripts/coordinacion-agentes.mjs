/**
 * Coordinación entre agentes que trabajan a la vez en este repositorio (misma máquina).
 *
 * Toda mutación del estado ocurre dentro de un mutex global que el sistema operativo libera si el
 * proceso muere: un socket del espacio abstracto de Linux (o un puerto TCP de localhost en otros
 * sistemas). Su bind es exclusivo y no deja archivos huérfanos, así que no hay cerrojos que recuperar
 * ni ventanas de carrera entre comprobar y escribir.
 *
 * Estado en disco: sesiones/<id>.json, reclamos/<hash>.json y bitacora.md (solo se añade).
 * Una sesión sin latido durante INACTIVIDAD_MS caduca: sus reclamos dejan de valer y no puede revivir.
 */
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync,
  rmSync, writeFileSync,
} from 'node:fs';
import {createHash, randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {join, posix} from 'node:path';

export const INACTIVIDAD_MS = 30 * 60 * 1000;
export const LATIDO_RECOMENDADO_MS = 10 * 60 * 1000;
const MAX_ENTRADA = 3000;
const ESPERA_MUTEX_MS = 15000;

const dirSesiones = (raiz) => join(raiz, 'sesiones');
const dirReclamos = (raiz) => join(raiz, 'reclamos');
const archivoSesion = (raiz, id) => join(dirSesiones(raiz), `${id}.json`);
const hash = (texto) => createHash('sha1').update(texto).digest('hex');
const archivoReclamo = (raiz, recurso) => join(dirReclamos(raiz), `${hash(recurso).slice(0, 16)}.json`);
const iso = (ms) => new Date(ms).toISOString();
const sufijo = () => randomBytes(4).toString('hex');
const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));

// ---------- mutex global ----------

export function direccionMutex(raiz) {
  const clave = hash(realpathSync(raiz));
  if (process.platform === 'linux') return {path: `\0agentes-miraflores-${clave}`};
  return {host: '127.0.0.1', port: 40000 + (Number.parseInt(clave.slice(0, 8), 16) % 20000)};
}

function escuchar(direccion) {
  return new Promise((ok, mal) => {
    // El mutex solo necesita el bind exclusivo: cualquier conexión se cierra al instante para que
    // close() no tenga que esperarla.
    const servidor = createServer((conexion) => conexion.destroy());
    servidor.unref();
    servidor.once('error', mal);
    servidor.listen({...direccion, exclusive: true}, () => ok(servidor));
  });
}

/** Ejecuta fn (síncrona o asíncrona) en exclusiva frente a cualquier otro proceso o hilo que use el mismo raiz. */
export async function conMutex(raiz, fn) {
  mkdirSync(raiz, {recursive: true});
  const direccion = direccionMutex(raiz);
  const limite = Date.now() + ESPERA_MUTEX_MS;
  for (;;) {
    let servidor;
    try { servidor = await escuchar(direccion); } catch (e) {
      if (e.code !== 'EADDRINUSE') throw e;
      if (Date.now() > limite) throw new Error('El mutex de coordinación sigue ocupado. Reintenta en unos segundos.');
      await dormir(5 + Math.random() * 20);
      continue;
    }
    try { return await fn(); } finally { await new Promise((ok) => servidor.close(ok)); }
  }
}

// ---------- utilidades de disco (siempre dentro del mutex) ----------

function leerJson(ruta) {
  try { return JSON.parse(readFileSync(ruta, 'utf8')); } catch (e) {
    if (e.code === 'ENOENT' || e instanceof SyntaxError) return null;
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

const caducada = (s, t) => t - Date.parse(s.latido) > INACTIVIDAD_MS;

function exigirSesion(raiz, id) {
  const s = leerJson(archivoSesion(raiz, id));
  if (!s) throw new Error(`No existe la sesión «${id}». Inicia una con «node scripts/agentes.mjs iniciar».`);
  return s;
}

/** Una sesión caducada no revive: otros pudieron tomar recursos solapados con los suyos. */
function exigirSesionActiva(raiz, id, t) {
  const s = exigirSesion(raiz, id);
  if (caducada(s, t)) {
    throw new Error(`La sesión «${id}» está caducada (último latido ${s.latido}). Ejecuta «terminar» e inicia una nueva; sus reclamos ya no valen.`);
  }
  return s;
}

function anotarSinMutex(raiz, id, mensaje, t) {
  const texto = String(mensaje).replace(/\s+/g, ' ').trim().slice(0, MAX_ENTRADA);
  appendFileSync(join(raiz, 'bitacora.md'), `- ${iso(t)} [${id}] ${texto}\n`);
}

// El reloj se lee dentro del mutex: el orden de las decisiones coincide con el orden temporal.
const reloj = (ahora) => ahora ?? Date.now();

// ---------- API ----------

export function iniciarSesion({raiz, agente, tarea, rama = null, directorio = null, ahora}) {
  if (!agente || !tarea) throw new TypeError('iniciar necesita agente y tarea');
  return conMutex(raiz, () => {
    const t = reloj(ahora);
    mkdirSync(dirSesiones(raiz), {recursive: true});
    mkdirSync(dirReclamos(raiz), {recursive: true});
    const fecha = iso(t).replace(/[-:]/g, '');
    const id = `${slug(agente)}-${fecha.slice(0, 8)}-${fecha.slice(9, 13)}-${sufijo().slice(0, 4)}`;
    const sesion = {id, agente, tarea, rama, directorio, inicio: iso(t), latido: iso(t)};
    escribirAtomico(archivoSesion(raiz, id), sesion);
    anotarSinMutex(raiz, id, `inició: ${tarea}`, t);
    return sesion;
  });
}

function latidoSinMutex(raiz, id, tarea, t) {
  const s = exigirSesionActiva(raiz, id, t);
  const nueva = {...s, latido: iso(t), ...(tarea ? {tarea} : {})};
  escribirAtomico(archivoSesion(raiz, id), nueva);
  return nueva;
}

export function latido({raiz, id, tarea, ahora}) {
  return conMutex(raiz, () => latidoSinMutex(raiz, id, tarea, reloj(ahora)));
}

/** Reclama todos los recursos o ninguno. Devuelve {obtenidos, conflictos}. */
export function reclamar({raiz, id, recursos, ahora}) {
  const pedidos = [...new Set(recursos.map(normalizarRecurso))];
  return conMutex(raiz, () => {
    const t = reloj(ahora);
    exigirSesionActiva(raiz, id, t);
    const sesiones = new Map(listarJson(dirSesiones(raiz)).map((s) => [s.id, s]));
    const vivo = (dueno) => sesiones.has(dueno) && !caducada(sesiones.get(dueno), t);
    const existentes = listarJson(dirReclamos(raiz));
    const conflictos = [];
    for (const otro of existentes) {
      if (otro.id === id || !vivo(otro.id)) continue;
      const choque = pedidos.find((p) => seSolapan(p, otro.recurso));
      if (choque) conflictos.push({recurso: choque, dueno: otro.id, ...(choque !== otro.recurso ? {con: otro.recurso} : {})});
    }
    if (conflictos.length) return {obtenidos: [], conflictos};
    const propios = new Set(existentes.filter((r) => r.id === id).map((r) => r.recurso));
    const escritos = [];
    try {
      for (const recurso of pedidos) {
        if (propios.has(recurso)) continue;
        escribirAtomico(archivoReclamo(raiz, recurso), {recurso, id, desde: iso(t)});
        escritos.push(recurso);
      }
      latidoSinMutex(raiz, id, undefined, t);
    } catch (e) {
      for (const recurso of escritos) rmSync(archivoReclamo(raiz, recurso), {force: true});
      throw e;
    }
    return {obtenidos: pedidos, conflictos: []};
  });
}

function liberarSinMutex(raiz, id, recurso) {
  const ruta = archivoReclamo(raiz, recurso);
  if (leerJson(ruta)?.id === id) rmSync(ruta, {force: true});
}

/** Intenta liberar todos los recursos aunque alguno falle. Devuelve los fallidos con su error. */
export function liberarTodos({raiz, id, recursos}) {
  return conMutex(raiz, () => {
    const fallidos = [];
    for (const original of recursos) {
      try { liberarSinMutex(raiz, id, normalizarRecurso(original)); } catch (error) { fallidos.push({recurso: original, error}); }
    }
    return fallidos;
  });
}

export async function liberar({raiz, id, recursos}) {
  const fallidos = await liberarTodos({raiz, id, recursos});
  if (fallidos.length) throw new Error(fallidos.map((f) => `${f.recurso}: ${f.error.message}`).join('; '));
}

export function anotar({raiz, id, mensaje, ahora}) {
  return conMutex(raiz, () => anotarSinMutex(raiz, id, mensaje, reloj(ahora)));
}

export function terminar({raiz, id, resumen = 'sin resumen', ahora}) {
  return conMutex(raiz, () => {
    const t = reloj(ahora);
    exigirSesion(raiz, id);
    for (const r of listarJson(dirReclamos(raiz))) if (r.id === id) rmSync(archivoReclamo(raiz, r.recurso), {force: true});
    rmSync(archivoSesion(raiz, id), {force: true});
    anotarSinMutex(raiz, id, `terminó: ${resumen}`, t);
  });
}

/** Retira las sesiones caducadas y sus reclamos, y los reclamos de sesiones que ya no existen. */
export function limpiarInactivas({raiz, ahora}) {
  return conMutex(raiz, () => {
    const t = reloj(ahora);
    const sesiones = listarJson(dirSesiones(raiz));
    const retiradas = sesiones.filter((s) => caducada(s, t));
    const vigentes = new Set(sesiones.filter((s) => !caducada(s, t)).map((s) => s.id));
    for (const r of listarJson(dirReclamos(raiz))) {
      if (!vigentes.has(r.id)) rmSync(archivoReclamo(raiz, r.recurso), {force: true});
    }
    for (const s of retiradas) {
      rmSync(archivoSesion(raiz, s.id), {force: true});
      anotarSinMutex(raiz, 'limpieza', `retiró la sesión inactiva ${s.id} (último latido ${s.latido})`, t);
    }
    return retiradas.map((s) => s.id);
  });
}

/** Lectura sin mutex: cada archivo se escribe de forma atómica, así que nunca se ve a medias. */
export function estado({raiz, ahora, lineas = 30}) {
  const t = reloj(ahora);
  const sesiones = listarJson(dirSesiones(raiz))
    .map((s) => ({...s, inactiva: caducada(s, t)}))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const reclamos = listarJson(dirReclamos(raiz)).sort((a, b) => a.recurso.localeCompare(b.recurso));
  const ruta = join(raiz, 'bitacora.md');
  const bitacora = existsSync(ruta) ? readFileSync(ruta, 'utf8').trimEnd().split('\n').slice(-lineas) : [];
  return {sesiones, reclamos, bitacora};
}
