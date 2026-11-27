import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {crearPatrimonio,CATALOGO_PATRIMONIO,ANIOS_PATRIMONIO} from './patrimonio-prioritario.js';
import './casa-amarilla.css';
import './prioridades.css';
const $=s=>document.querySelector(s),host=$('#visor');
const escena=new T.Scene();escena.background=new T.Color('#dedbd1');
const render=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});render.setPixelRatio(Math.min(devicePixelRatio,2));render.shadowMap.enabled=true;render.shadowMap.type=T.PCFSoftShadowMap;render.toneMapping=T.ACESFilmicToneMapping;render.toneMappingExposure=1.05;host.append(render.domElement);
const camara=new T.PerspectiveCamera(38,1,.1,3000);const control=new OrbitControls(camara,render.domElement);control.maxPolarAngle=Math.PI/2-.01;control.maxDistance=850;control.minDistance=8;
escena.add(new T.HemisphereLight(0xfff5e6,0x797559,2.4));const sol=new T.DirectionalLight(0xffefda,3);sol.position.set(-90,150,110);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);Object.assign(sol.shadow.camera,{left:-160,right:160,top:160,bottom:-160,near:1,far:550});sol.shadow.normalBias=.04;escena.add(sol);
const piso=new T.Mesh(new T.PlaneGeometry(3000,3000),new T.MeshStandardMaterial({color:0xdedbd1,roughness:1}));piso.rotation.x=-Math.PI/2;piso.position.y=-.04;piso.receiveShadow=true;escena.add(piso);
const dibujar=()=>render.render(escena,camara);control.addEventListener('change',dibujar);
let modelo,anio=1911,id='metropolitano',vistaActual='perspectiva';
for(const [k,f] of Object.entries(CATALOGO_PATRIMONIO))$('#edificio').add(new Option(f.nombre,k));
function vista(nombre){vistaActual=nombre;const r=modelo.ficha.radioVista;const vistas={perspectiva:[-r*1.65,r*1.35,r*2],frente:[0,r*.28,r*2.7],planta:[0,r*3,.01],patio:[r*.3,r*.75,r*.6]};camara.position.set(...vistas[nombre]);control.target.set(0,nombre==='frente'?6:1.5,0);control.update();dibujar();}
function eliminar(){if(!modelo)return;escena.remove(modelo.edificio);const geos=new Set(),mats=new Set();modelo.edificio.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
function cambiar(reencuadrar=false){
 eliminar();modelo=crearPatrimonio({id,anio,nivelDetalle:$('#detalle').value});escena.add(modelo.edificio);modelo.cubiertas.visible=$('#techos').checked;
 $('#edificio').value=id;$('#fecha').textContent=anio;$('#nombre').textContent=modelo.ficha.nombre;$('#fase').textContent=modelo.etapa.fase;$('#certeza').textContent=modelo.ficha.nota;
 $('#ausencia').textContent=modelo.etapa.presente===true?'':modelo.etapa.fase;$('#ausencia').hidden=modelo.etapa.presente===true;$('#exportar').disabled=modelo.etapa.presente!==true;
 $('#fuentes').replaceChildren();for(const [titulo,url] of modelo.ficha.fuentes){const li=document.createElement('li'),a=document.createElement('a');a.href=url;a.textContent=titulo;a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('#fuentes').append(li);}
 for(const b of document.querySelectorAll('[data-anio]'))b.setAttribute('aria-pressed',String(+b.dataset.anio===anio));
 let mallas=0,triangulos=0;modelo.edificio.traverse(o=>{if(o.isMesh){mallas++;triangulos+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});$('#estadisticas').textContent=`${mallas} mallas · ${Math.round(triangulos).toLocaleString('es')} triángulos`;
 history.replaceState(null,'',`?edificio=${id}&anio=${anio}&detalle=${$('#detalle').value}`);window.estudioPrioridades={...modelo,render,camara,escena,vista};if(reencuadrar)vista(vistaActual);dibujar();
}
for(const a of ANIOS_PATRIMONIO){const b=document.createElement('button');b.dataset.anio=a;b.textContent=a;b.onclick=()=>{anio=a;cambiar();};$('#epocas').append(b);}
$('#edificio').onchange=e=>{id=e.target.value;cambiar(true);};$('#detalle').onchange=()=>cambiar();$('#techos').onchange=e=>{modelo.cubiertas.visible=e.target.checked;dibujar();};document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>vista(b.dataset.vista));
$('#exportar').onclick=async()=>{const b=$('#exportar');b.disabled=true;try{const data=await new GLTFExporter().parseAsync(modelo.edificio,{binary:true,onlyVisible:false});const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=`${id}-${anio}.glb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){console.error(e);$('#estadisticas').textContent='No se pudo exportar el modelo.';}finally{b.disabled=modelo.etapa.presente!==true;}};
function ajustar(){const {width,height}=host.getBoundingClientRect();render.setSize(width,height);camara.aspect=width/height;camara.zoom=Math.min(1,camara.aspect/1.05);camara.updateProjectionMatrix();dibujar();}new ResizeObserver(ajustar).observe(host);
const params=new URLSearchParams(location.search);if(CATALOGO_PATRIMONIO[params.get('edificio')])id=params.get('edificio');if(ANIOS_PATRIMONIO.includes(+params.get('anio')))anio=+params.get('anio');if(['estudio','ciudad'].includes(params.get('detalle')))$('#detalle').value=params.get('detalle');cambiar(true);ajustar();
