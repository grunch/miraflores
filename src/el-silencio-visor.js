import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {crearElSilencio,FUENTES_SILENCIO} from './el-silencio.js';
import './casa-amarilla.css';
import './el-silencio.css';
import guia from '../docs/integracion-caracas-el-silencio.md?raw';
const $=s=>document.querySelector(s),contenedor=$('#visor');
const escena=new THREE.Scene();escena.background=new THREE.Color('#dedbd1');
const render=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
render.setPixelRatio(Math.min(devicePixelRatio,2));render.shadowMap.enabled=true;render.shadowMap.type=THREE.PCFSoftShadowMap;render.toneMapping=THREE.ACESFilmicToneMapping;render.toneMappingExposure=1.05;contenedor.append(render.domElement);
const camara=new THREE.PerspectiveCamera(38,1,.2,2400);
const control=new OrbitControls(camara,render.domElement);control.maxPolarAngle=Math.PI/2-.005;control.minDistance=5;control.maxDistance=1200;
escena.add(new THREE.HemisphereLight(0xf5f3eb,0x87745d,2.5));
const sol=new THREE.DirectionalLight(0xfff1d8,3);sol.position.set(100,250,140);sol.castShadow=true;sol.shadow.mapSize.set(4096,4096);Object.assign(sol.shadow.camera,{left:-260,right:260,top:260,bottom:-260,near:1,far:650});sol.shadow.normalBias=.055;sol.shadow.bias=-.00015;escena.add(sol);
const suelo=new THREE.Mesh(new THREE.PlaneGeometry(2500,2500),new THREE.MeshStandardMaterial({color:0xdedbd1,roughness:1}));suelo.rotation.x=-Math.PI/2;suelo.position.y=-.4;suelo.receiveShadow=true;escena.add(suelo);
$('.guia').href=URL.createObjectURL(new Blob([guia],{type:'text/markdown;charset=utf-8'}));$('.guia').download='integracion-caracas-el-silencio.md';
const modelo=crearElSilencio();escena.add(modelo.edificio);
const dibujar=()=>render.render(escena,camara);control.addEventListener('change',dibujar);
for(const b of modelo.bloques){const opt=document.createElement('option');opt.value=b.userData.id;opt.textContent=b.name;$('#bloque').append(opt);}
for(const f of FUENTES_SILENCIO){const li=document.createElement('li'),a=document.createElement('a');a.href=f.url;a.textContent=f.titulo;a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('#fuentes').append(li);}
const vistas={conjunto:{p:[420,330,415],t:[-5,0,30]},planta:{p:[0,650,30.01],t:[0,0,30]},plaza:{p:[100,30,13],t:[-55,11,0]},galeria:{p:[-45,4.1,48],t:[-53,3.6,26]},balcones:{p:[-30,14,37],t:[-53,12,26]}};
function mostrarTodos(){modelo.bloques.forEach(b=>b.visible=true);modelo.entorno.visible=true;modelo.plazas.visible=true;$('#bloque').value='todos';$('#descripcion').textContent='Plaza Urdaneta —hoy O’Leary— y Plaza Miranda articulan el conjunto.';}
function vista(id){mostrarTodos();const v=vistas[id];camara.position.set(...v.p);control.target.set(...v.t);control.update();dibujar();}
document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>vista(b.dataset.vista));
$('#bloque').onchange=e=>{const id=e.target.value;if(id==='todos'){vista('conjunto');return;}modelo.bloques.forEach(b=>b.visible=String(b.userData.id)===id);modelo.entorno.visible=false;modelo.plazas.visible=false;const b=modelo.bloques.find(b=>b.visible),box=new THREE.Box3().setFromObject(b),c=box.getCenter(new THREE.Vector3()),d=box.getSize(new THREE.Vector3()).length();control.target.copy(c);camara.position.copy(c).add(new THREE.Vector3(d,d*.85,d));$('#descripcion').textContent=b.userData.descripcion;control.update();dibujar();};
$('#techos').onchange=e=>{modelo.cubiertas.forEach(g=>g.visible=e.target.checked);dibujar();};
$('#exportar').onclick=async()=>{const b=$('#exportar');b.disabled=true;try{const data=await new GLTFExporter().parseAsync(modelo.edificio,{binary:true,onlyVisible:false});const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='el-silencio-1945.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){b.textContent='Error al exportar; vuelve a intentar';console.error(e);}finally{b.disabled=false;}};
function ajustar(){const {width,height}=contenedor.getBoundingClientRect();render.setSize(width,height);camara.aspect=width/height;camara.zoom=Math.min(1,camara.aspect/1.05);camara.updateProjectionMatrix();dibujar();}
new ResizeObserver(ajustar).observe(contenedor);
window.estudioSilencio={...modelo,render,escena,camara,control,vista};vista('conjunto');ajustar();
