import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {crearManzanaCompuesta} from './manzana-edificios.js';
import './manzana.css';
const refs=[new URL('../recursos/manzanas/manzanas-pueblo-colonial-01.jpg',import.meta.url).href,new URL('../recursos/manzanas/manzanas-pueblo-colonial-02.jpg',import.meta.url).href,new URL('../recursos/manzanas/manzanas-pueblo-colonial-03.jpg',import.meta.url).href];
const $=s=>document.querySelector(s),contenedor=$('#visor'),escena=new THREE.Scene();escena.background=new THREE.Color(0xdedbd1);
const render=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});render.setPixelRatio(Math.min(devicePixelRatio,1.5));render.shadowMap.enabled=true;render.shadowMap.type=THREE.PCFSoftShadowMap;render.toneMapping=THREE.ACESFilmicToneMapping;render.toneMappingExposure=1.05;contenedor.append(render.domElement);
const camara=new THREE.OrthographicCamera(-80,80,80,-80,.1,700),control=new OrbitControls(camara,render.domElement);control.maxPolarAngle=Math.PI/2-.025;control.minZoom=.5;control.maxZoom=5;
escena.add(new THREE.HemisphereLight(0xfff2d8,0x6c7055,2.5));const sol=new THREE.DirectionalLight(0xffefce,3.3);sol.position.set(-65,100,45);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);Object.assign(sol.shadow.camera,{left:-115,right:115,top:115,bottom:-115,near:1,far:300});sol.shadow.bias=-.00025;sol.shadow.normalBias=.06;escena.add(sol);
const terreno=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0xdedbd1,roughness:1}));terreno.rotation.x=-Math.PI/2;terreno.position.y=-.18;terreno.receiveShadow=true;escena.add(terreno);
const calle=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xada089,roughness:1}));calle.position.y=-.1;calle.receiveShadow=true;escena.add(calle);
let modelo,vistaActiva='perspectiva';const dibujar=()=>render.render(escena,camara);control.addEventListener('change',dibujar);
function vista(id){vistaActiva=id;camara.zoom=1;camara.position.set(...({perspectiva:[100,115,135],planta:[0,200,.001],calle:[75,27,140]})[id]);control.target.set(0,0,0);control.update();ajustar();document.querySelectorAll('[data-vista]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vista===id)));}
function ajustar(){const {width,height}=contenedor.getBoundingClientRect(),aspecto=width/height,lado=modelo?Math.max(...modelo.plan.perimetro.vertices.map(p=>Math.abs(p[0])*2),...modelo.plan.perimetro.vertices.map(p=>Math.abs(p[1])*2)):96,r=lado*(vistaActiva==='planta'?.59:.73);camara.left=-r*Math.max(1,aspecto);camara.right=-camara.left;camara.top=r/Math.min(1,aspecto);camara.bottom=-camara.top;camara.updateProjectionMatrix();render.setSize(width,height);dibujar();}
function generar(){
 try{
  const nuevo=crearManzanaCompuesta({edificio:$('#edificio').value,contacto:$('#contacto').value,separacion:Number($('#separacion').value),esquina:$('#esquina').value,anio:Number($('#anio').value),cantidadCasas:Number($('#cantidadCasas').value),semilla:$('#semilla').value,lados:[0,1,2,3].map(i=>Number($('#lado'+i).value)),angulos:[0,1,2,3].map(i=>Number($('#angulo'+i).value)),vegetacion:Number($('#verde').value)/100,detalle:$('#detalle').value});
  if(modelo){escena.remove(modelo.manzana);modelo.liberar();}modelo=nuevo;escena.add(modelo.manzana);modelo.cubiertas.visible=$('#techos').checked;if(modelo.cubiertasExternas)modelo.cubiertasExternas.visible=$('#techos').checked;modelo.vegetacion.visible=$('#arboles').checked;const borde=modelo.plan.perimetro.vertices.map(([x,z])=>new THREE.Vector2(x*1.14,-z*1.14)),shape=new THREE.Shape(borde);calle.geometry.dispose();calle.geometry=new THREE.ShapeGeometry(shape);calle.rotation.x=-Math.PI/2;
  ajustar();let triangulos=0;modelo.manzana.traverse(o=>{if(o.isMesh)triangulos+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});const s=modelo.plan.estadisticas;$('#metricas').textContent=`${s.casas} casas · ${s.patios} patios · ${modelo.edificioExterno?'1 edificio · '+modelo.casasSustituidas+' casas sustituidas':Math.round(s.ocupacion*100)+' % de ocupación con anexos'} · ${Math.round(triangulos/1000)} mil triángulos`;
  $('#perfil-social').textContent=`${modelo.plan.estadisticas.casas} viviendas · ${modelo.plan.perfil==='elite'?'residencias de élite':modelo.plan.perfil==='humilde'?'viviendas humildes':'tejido intermedio'}${modelo.edificioExterno?'':' · solar medio '+Math.round(modelo.plan.estadisticas.superficieMediaSolar)+' m²'}`;
  $('#estado').textContent='Semilla aplicada. Puedes guardarla como receta.';const q=new URLSearchParams(modelo.receta);q.set('detalle',$('#detalle').value);history.replaceState(null,'',`?${q}`);
  window.estudioManzana={...modelo,render,escena,camara,control};
 }catch(e){$('#estado').textContent=e.message;}
}
$('#ajustes').onsubmit=e=>{e.preventDefault();generar();};$('#verde').oninput=()=>$('#cantidad-verde').textContent=$('#verde').value+' %';
$('#otra').onclick=()=>{$('#semilla').value='caracas-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36);generar();};
for(const b of document.querySelectorAll('[data-vista]'))b.onclick=()=>vista(b.dataset.vista);
$('#techos').onchange=()=>{modelo.cubiertas.visible=$('#techos').checked;if(modelo.cubiertasExternas)modelo.cubiertasExternas.visible=$('#techos').checked;dibujar();};$('#arboles').onchange=()=>{modelo.vegetacion.visible=$('#arboles').checked;dibujar();};
$('#comparar').onclick=()=>{const abierto=$('#referencias').hidden;$('#referencias').hidden=!abierto;document.body.classList.toggle('comparando',abierto);$('#comparar').setAttribute('aria-expanded',String(abierto));ajustar();};
refs.forEach((src,i)=>{const b=document.createElement('button');b.textContent=`0${i+1}`;b.onclick=()=>{$('#referencia').src=src;for(const el of $('#selectores').children)el.setAttribute('aria-pressed',String(el===b));};$('#selectores').append(b);if(i===0)b.click();});
function descargar(datos,tipo,nombre){const url=URL.createObjectURL(new Blob([datos],{type:tipo})),a=document.createElement('a');a.href=url;a.download=nombre;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#receta').onclick=()=>descargar(JSON.stringify(modelo.receta,null,2),'application/json','manzana-colonial.json');
$('#glb').onclick=async()=>{const b=$('#glb');b.disabled=true;try{const data=await new GLTFExporter().parseAsync(modelo.manzana,{binary:true,onlyVisible:false});descargar(data,'model/gltf-binary','manzana-colonial.glb');}catch(e){$('#estado').textContent=e.message;}finally{b.disabled=false;}};
const q=new URLSearchParams(location.search);for(const k of ['cantidadCasas','semilla','detalle','edificio','esquina','anio','contacto','separacion'])if(q.has(k))$('#'+k).value=q.get(k);for(const [k,prefijo] of [['lados','lado'],['angulos','angulo']])if(q.has(k))q.get(k).split(',').slice(0,4).forEach((v,i)=>$('#'+prefijo+i).value=v);if(q.has('vegetacion'))$('#verde').value=Number(q.get('vegetacion'))*100;$('#verde').oninput();$('#opciones-edificio').hidden=!$('#edificio').value;$('#campo-separacion').hidden=$('#contacto').value==='adosado';generar();vista('perspectiva');new ResizeObserver(ajustar).observe(contenedor);

$('#edificio').onchange=()=>{$('#opciones-edificio').hidden=!$('#edificio').value;generar();};$('#esquina').onchange=generar;$('#anio').onchange=generar;

$('#contacto').onchange=()=>{$('#campo-separacion').hidden=$('#contacto').value==='adosado';generar();};$('#separacion').onchange=generar;
