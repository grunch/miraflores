import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {crearPalacio} from './palacio.js';
import {crearPanteon} from './panteon.js';
import './style.css';
const escena=new THREE.Scene();escena.background=new THREE.Color('#dddcd3');
const render=new THREE.WebGLRenderer({antialias:true});render.setPixelRatio(Math.min(devicePixelRatio,2));render.setSize(innerWidth,innerHeight);render.shadowMap.enabled=true;render.shadowMap.type=THREE.PCFShadowMap;render.toneMapping=THREE.ACESFilmicToneMapping;document.querySelector('#visor').append(render.domElement);
const camara=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,500);camara.position.set(78,58,83);
const control=new OrbitControls(camara,render.domElement);control.target.set(0,5,0);control.maxPolarAngle=Math.PI/2-.025;control.minDistance=9;control.maxDistance=190;
escena.add(new THREE.HemisphereLight(0xf1f5ff,0x89795e,2.4));const sol=new THREE.DirectionalLight(0xfff1d8,3.3);sol.position.set(-35,65,40);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);Object.assign(sol.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:180});sol.shadow.bias=-.0003;sol.shadow.normalBias=.04;escena.add(sol);
let palacio,cubiertas;
function cambiarEdificio(){
 const palacioAnteriorDisponible=Boolean(palacio);
 const anteriorPanteon=palacio?.userData.id==="panteon";
 if(palacio){escena.remove(palacio);const geos=new Set(),mats=new Set();palacio.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
 const esPanteon=document.querySelector("#edificio").value==="panteon";
 const anio=Number(document.querySelector("#epoca").value);
 const modelo=esPanteon?crearPanteon({anio}):crearPalacio();
 palacio=modelo.edificio??modelo.palacio;cubiertas=modelo.cubiertas;escena.add(palacio);
 cubiertas.visible=document.querySelector("#techos").checked;
 document.querySelector("#epoca").hidden=!esPanteon;document.querySelector("#epoca-label").hidden=!esPanteon;
 document.querySelector("h1").textContent=esPanteon?modelo.etapa.nombre:"Palacio de Miraflores";
 document.querySelector("header p").textContent=esPanteon?`${anio} · ${modelo.etapa.detalle}`:"Estudio volumétrico · referencia circa 1911";
 const enlace=document.querySelector('#referencia');enlace.hidden=!esPanteon;
 enlace.href=anio===1772?'https://memoriasdevenezuela.wordpress.com/2018/07/27/la-arquitectura-de-un-pardo-en-la-caracas-colonial/':anio===1889?'https://elarchivo.org/producto/panteon-nacional/':'https://fundaayc.com/tag/panteon-nacional/';
 document.title=`${esPanteon?modelo.etapa.nombre+" · "+anio:"Miraflores"} · Estudio`;
 if(!palacioAnteriorDisponible||anteriorPanteon!==esPanteon){control.target.set(0,esPanteon?10:5,0);camara.position.set(...(esPanteon?[70,49,95]:vistas.perspectiva));}
 control.update();dibujar();
 window.estudio={escena,palacio,render};
}

const suelo=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0xd4d1c4,roughness:1}));suelo.rotation.x=-Math.PI/2;suelo.position.y=-.02;suelo.receiveShadow=true;escena.add(suelo);
const dibujar=()=>render.render(escena,camara);control.addEventListener('change',dibujar);
const vistas={perspectiva:[78,58,83],frente:[0,17,98],patio:[17,32,25],planta:[0,112,.01]};
document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>{const esPanteon=palacio.userData.id==="panteon";const vista=b.dataset.vista;camara.position.set(...(esPanteon&&vista==="frente"?[0,23,125]:vistas[vista]));control.target.set(0,esPanteon?15:5,0);control.update();dibujar();});
document.querySelector('#techos').onchange=e=>{cubiertas.visible=e.target.checked;dibujar();};
document.querySelector('#giro').onchange=e=>{control.autoRotate=e.target.checked;};
let anterior=0;render.setAnimationLoop(t=>{if(control.autoRotate)control.update((t-anterior)/1000);anterior=t;});
window.addEventListener('resize',()=>{ajustarVisor();dibujar();});
document.querySelector('#exportar').onclick=async()=>{const b=document.querySelector('#exportar');b.disabled=true;try{const datos=await new GLTFExporter().parseAsync(palacio,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([datos],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=palacio.userData.id==='panteon'?`${palacio.userData.etapa}-${palacio.userData.anio}.glb`:'palacio-miraflores.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}finally{b.disabled=false;}};
document.querySelector("#edificio").onchange=cambiarEdificio;
document.querySelector("#epoca").onchange=cambiarEdificio;
cambiarEdificio();

function ajustarVisor(){const ancho=innerWidth,alto=innerWidth<=650?Math.max(240,innerHeight-420):innerHeight;render.setSize(ancho,alto);camara.aspect=ancho/alto;camara.zoom=Math.min(1,camara.aspect/.95);camara.updateProjectionMatrix();}
ajustarVisor();dibujar();
