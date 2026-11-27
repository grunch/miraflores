import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {crearCasaAmarilla} from './casa-amarilla.js';
import {ANIOS_CASA,FUENTES_CASA} from './casa-amarilla-datos.js';
import './casa-amarilla.css';
const $=s=>document.querySelector(s),contenedor=$('#visor');
const escena=new THREE.Scene();escena.background=new THREE.Color('#dedbd1');
const render=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
render.setPixelRatio(Math.min(devicePixelRatio,2));render.shadowMap.enabled=true;render.shadowMap.type=THREE.PCFSoftShadowMap;render.toneMapping=THREE.ACESFilmicToneMapping;render.toneMappingExposure=1.05;contenedor.append(render.domElement);
const camara=new THREE.PerspectiveCamera(36,1,.1,700);
const control=new OrbitControls(camara,render.domElement);control.maxPolarAngle=Math.PI/2-.03;control.minDistance=12;control.maxDistance=220;
escena.add(new THREE.HemisphereLight(0xf5f3eb,0x87745d,2.5));
const sol=new THREE.DirectionalLight(0xfff1d8,3);sol.position.set(30,70,48);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);Object.assign(sol.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:1,far:180});sol.shadow.normalBias=.025;sol.shadow.bias=-.0002;escena.add(sol);
const suelo=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0xdedbd1,roughness:1}));suelo.rotation.x=-Math.PI/2;suelo.position.y=-.32;suelo.receiveShadow=true;escena.add(suelo);
const dibujar=()=>render.render(escena,camara);
control.addEventListener('change',dibujar);
let modelo;
function cambiar(anio){
  if(modelo){escena.remove(modelo.edificio);const geos=new Set(),mats=new Set();modelo.edificio.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
  modelo=crearCasaAmarilla({anio});escena.add(modelo.edificio);modelo.cubiertas.visible=$('#techos').checked;
  const e=modelo.etapa;for(const key of ['nombre','subtitulo','historia','certeza'])$('#'+key).textContent=e[key];$('#fecha').textContent=anio;
  document.querySelectorAll('[data-anio]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.anio)===anio)));
  document.title=`${e.nombre} · ${anio} · Estudio de Caracas`;
  history.replaceState(null,'',`?anio=${anio}`);dibujar();
  window.estudioCasa={...modelo,render,escena,camara};
}
for(const anio of ANIOS_CASA){const b=document.createElement('button');b.dataset.anio=anio;b.innerHTML=`${anio}<small>${anio===1810?'HITO':'MAPA'}</small>`;b.onclick=()=>cambiar(anio);$('#epocas').append(b);}
for(const f of FUENTES_CASA){const li=document.createElement('li'),a=document.createElement('a');a.href=f.url;a.textContent=f.titulo;a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('#fuentes').append(li);}
const vistas={perspectiva:[79,59,96],frente:[0,11,122],planta:[0,133,.01],patio:[35,58,44],portada:[-18.5,6.5,50]};
function vista(id){camara.position.set(...vistas[id]);control.target.set(...(id==='portada'?[-18.5,6.2,27]:[0,id==='frente'?6:3,0]));control.update();dibujar();}
document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>vista(b.dataset.vista));
$('#techos').onchange=e=>{modelo.cubiertas.visible=e.target.checked;dibujar();};
$('#exportar').onclick=async()=>{const b=$('#exportar');b.disabled=true;try{const data=await new GLTFExporter().parseAsync(modelo.edificio,{binary:true,onlyVisible:false});const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=`casa-amarilla-${modelo.etapa.anio}.glb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){b.textContent='Error al exportar; vuelve a intentar';console.error(e);}finally{b.disabled=false;}};
function ajustar(){const {width,height}=contenedor.getBoundingClientRect();render.setSize(width,height);camara.aspect=width/height;camara.zoom=Math.min(1,camara.aspect/1.05);camara.updateProjectionMatrix();dibujar();}
new ResizeObserver(ajustar).observe(contenedor);
const pedido=Number(new URLSearchParams(location.search).get('anio'));cambiar(ANIOS_CASA.includes(pedido)?pedido:1772);vista('perspectiva');ajustar();
