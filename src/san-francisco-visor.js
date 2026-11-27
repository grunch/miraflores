import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { crearSanFrancisco } from './san-francisco.js';
import { ANIOS_SAN_FRANCISCO, FUENTES_SAN_FRANCISCO } from './san-francisco-datos.js';
import './casa-amarilla.css';

const $ = (s) => document.querySelector(s);
const contenedor = $('#visor');

const escena = new THREE.Scene();
escena.background = new THREE.Color('#dedbd1');

const render = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
render.setPixelRatio(Math.min(devicePixelRatio, 2));
render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;
render.toneMapping = THREE.ACESFilmicToneMapping;
render.toneMappingExposure = 1.04;
contenedor.append(render.domElement);

const camara = new THREE.PerspectiveCamera(36, 1, 0.2, 700);
const control = new OrbitControls(camara, render.domElement);
control.maxPolarAngle = Math.PI / 2 - 0.03;
control.minDistance = 10;
control.maxDistance = 240;

escena.add(new THREE.HemisphereLight(0xf6f3ea, 0x87765e, 2.35));
const sol = new THREE.DirectionalLight(0xfff2da, 3.0);
sol.position.set(-42, 72, 58);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 2, far: 200 });
sol.shadow.normalBias = 0.025;
sol.shadow.bias = -0.0002;
escena.add(sol);

const relleno = new THREE.DirectionalLight(0xdce6f2, 0.75);
relleno.position.set(55, 36, -45);
escena.add(relleno);

const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0xdedbd1, roughness: 1 })
);
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.32;
suelo.receiveShadow = true;
escena.add(suelo);

const dibujar = () => render.render(escena, camara);
control.addEventListener('change', dibujar);

let modelo;
function liberar(actual) {
  if (!actual) return;
  escena.remove(actual.edificio);
  const geos = new Set();
  const mats = new Set();
  actual.edificio.traverse((o) => {
    if (o.geometry) geos.add(o.geometry);
    if (o.material) mats.add(o.material);
  });
  geos.forEach((g) => g.dispose());
  mats.forEach((m) => m.dispose());
}

function cambiar(anio) {
  liberar(modelo);
  modelo = crearSanFrancisco({ anio });
  escena.add(modelo.edificio);
  modelo.cubiertas.visible = $('#techos').checked;
  modelo.ceiba.visible = $('#ceiba').checked;
  const e = modelo.etapa;
  for (const key of ['nombre', 'subtitulo', 'historia', 'certeza']) {
    $('#' + key).textContent = e[key];
  }
  $('#fecha').textContent = String(anio);
  document.querySelectorAll('[data-anio]').forEach((b) => {
    b.setAttribute('aria-pressed', String(Number(b.dataset.anio) === anio));
  });
  document.title = `${e.nombre} · ${anio} · Estudio de Caracas`;
  history.replaceState(null, '', `?anio=${anio}`);
  dibujar();
  window.estudioSanFrancisco = { ...modelo, render, escena, camara, control };
}

for (const anio of ANIOS_SAN_FRANCISCO) {
  const b = document.createElement('button');
  b.dataset.anio = anio;
  b.innerHTML = `${anio}<small>MAPA</small>`;
  b.onclick = () => cambiar(anio);
  $('#epocas').append(b);
}

for (const f of FUENTES_SAN_FRANCISCO) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = f.url;
  a.textContent = f.titulo;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  li.append(a);
  $('#fuentes').append(li);
}

const vistas = {
  // Perspectiva 3/4 desde el NE (Esquina de San Francisco, viendo fachada norte + costado este + naves)
  perspectiva: { pos: [-38, 25, 68], target: [1, 7, 10] },
  // Fachada Norte de frente (Av. Universidad)
  frente: { pos: [0, 10.5, 76], target: [0, 8.5, 30] },
  // Costado Este (Esquina de San Francisco)
  costado: { pos: [-54, 17, 14], target: [0, 6.5, 2] },
  // Interior de tres naves mirando hacia el Retablo Mayor (se aprecia mejor sin cubiertas)
  interior: { pos: [-18, 26, 22], target: [0, 4, -18] },
  // Planta cenital completa (19,6 × 62 m)
  planta: { pos: [0, 118, 0.01], target: [0, 0, 0] },
  // Detalle cercano de la portada (barroca en 1772/1843 o Hurtado Manrique en 1889–1936)
  detalle: { pos: [14, 12.2, 60], target: [0, 9.8, 31] },
};

function vista(id) {
  const v = vistas[id];
  if (!v) return;
  camara.position.set(...v.pos);
  control.target.set(...v.target);
  control.update();
  dibujar();
}

document.querySelectorAll('[data-vista]').forEach((b) => {
  b.onclick = () => vista(b.dataset.vista);
});

$('#techos').onchange = (e) => {
  modelo.cubiertas.visible = e.target.checked;
  dibujar();
};

$('#ceiba').onchange = (e) => {
  modelo.ceiba.visible = e.target.checked;
  dibujar();
};

$('#exportar').onclick = async () => {
  const b = $('#exportar');
  b.disabled = true;
  try {
    const data = await new GLTFExporter().parseAsync(modelo.edificio, { binary: true, onlyVisible: false });
    const url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `iglesia-san-francisco-${modelo.etapa.anio}.glb`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    b.textContent = 'Error al exportar; vuelve a intentar';
    console.error(err);
  } finally {
    b.disabled = false;
  }
};

function ajustar() {
  const { width, height } = contenedor.getBoundingClientRect();
  render.setSize(width, height);
  camara.aspect = width / height;
  camara.zoom = Math.min(1, camara.aspect / 1.05);
  camara.updateProjectionMatrix();
  dibujar();
}

new ResizeObserver(ajustar).observe(contenedor);
const pedido = Number(new URLSearchParams(location.search).get('anio'));
cambiar(ANIOS_SAN_FRANCISCO.includes(pedido) ? pedido : 1772);
vista('perspectiva');
ajustar();
