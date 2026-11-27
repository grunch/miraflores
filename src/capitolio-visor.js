import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { crearCapitolio } from './capitolio.js';
import { ANIOS_CAPITOLIO, FUENTES_CAPITOLIO } from './capitolio-datos.js';
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

const camara = new THREE.PerspectiveCamera(36, 1, 0.2, 950);
const control = new OrbitControls(camara, render.domElement);
control.maxPolarAngle = Math.PI / 2 - 0.03;
control.minDistance = 16;
control.maxDistance = 320;

escena.add(new THREE.HemisphereLight(0xf6f3ea, 0x8a7962, 2.35));
const sol = new THREE.DirectionalLight(0xfff2da, 3.0);
sol.position.set(62, 95, -58);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -82, right: 82, top: 82, bottom: -82, near: 5, far: 260 });
sol.shadow.normalBias = 0.03;
sol.shadow.bias = -0.00025;
escena.add(sol);

const relleno = new THREE.DirectionalLight(0xdce6f2, 0.75);
relleno.position.set(-65, 45, 70);
escena.add(relleno);

const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(2400, 2400),
  new THREE.MeshStandardMaterial({ color: 0xdedbd1, roughness: 1 })
);
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.32;
suelo.receiveShadow = true;
escena.add(suelo);

const dibujar = () => render.render(escena, camara);
control.addEventListener('change', dibujar);

let modelo;
function liberarModelo(actual) {
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
  liberarModelo(modelo);
  modelo = crearCapitolio({ anio });
  escena.add(modelo.edificio);
  modelo.cubiertas.visible = $('#techos').checked;
  const e = modelo.etapa;
  for (const key of ['nombre', 'subtitulo', 'historia', 'certeza']) {
    $('#' + key).textContent = e[key];
  }
  $('#fecha').textContent = anio === 1958 ? '1958+' : String(anio);
  document.querySelectorAll('[data-anio]').forEach((b) => {
    b.setAttribute('aria-pressed', String(Number(b.dataset.anio) === anio));
  });
  document.title = `${e.nombre} · ${anio} · Estudio de Caracas`;
  history.replaceState(null, '', `?anio=${anio}`);
  dibujar();
  window.estudioCapitolio = { ...modelo, render, escena, camara, control };
}

for (const anio of ANIOS_CAPITOLIO) {
  const b = document.createElement('button');
  b.dataset.anio = anio;
  b.innerHTML = `${anio === 1958 ? '1958+' : anio}<small>${anio === 1958 ? 'HITO' : 'MAPA'}</small>`;
  b.onclick = () => cambiar(anio);
  $('#epocas').append(b);
}

for (const f of FUENTES_CAPITOLIO) {
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
  // Vista aérea NE replicando el encuadre de 14407977-4632652c.jpg
  perspectiva: { pos: [106, 92, -124], target: [0, 6, 0] },
  // Fachada Norte (Palacio Federal / Salón Elíptico o Iglesia de las Concepciones)
  norte: { pos: [44, 21, -134], target: [0, 13, -42] },
  // Fachada Sur (Palacio Legislativo frente a Av. Universidad o Huerta conventual)
  sur: { pos: [-34, 21, 138], target: [0, 9, 42] },
  // Interior del patio mirando al norte hacia la escalinata curva y la cúpula (73f1ad4b...jpg) o claustro
  patio: { pos: [2, 16, 36], target: [0, 12, -40] },
  // Planta cenital completa de la manzana 92 × 108 m
  planta: { pos: [0, 215, -0.01], target: [0, 0, 0] },
  // Detalle cercano de la cúpula elíptica / pórtico curvo norte o portada de la iglesia colonial
  detalle: { pos: [42, 28, -94], target: [2, 14, -43] },
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

$('#exportar').onclick = async () => {
  const b = $('#exportar');
  b.disabled = true;
  try {
    const data = await new GLTFExporter().parseAsync(modelo.edificio, { binary: true, onlyVisible: false });
    const url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `palacio-federal-${modelo.etapa.anio}.glb`;
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
cambiar(ANIOS_CAPITOLIO.includes(pedido) ? pedido : 1772);
vista('perspectiva');
ajustar();
