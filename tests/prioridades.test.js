import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {crearPatrimonio,estadoPatrimonio,CATALOGO_PATRIMONIO} from '../src/patrimonio-prioritario.js';
test('los circos tienen vidas diferentes y el Metropolitano desaparece antes de 1946',()=>{
 assert.equal(estadoPatrimonio('metropolitano',1889).presente,false);
 assert.equal(estadoPatrimonio('metropolitano',1911).presente,true);
 assert.equal(estadoPatrimonio('metropolitano',1936).presente,true);
 assert.equal(estadoPatrimonio('metropolitano',1946).presente,false);
 assert.equal(estadoPatrimonio('nuevo-circo',1911).presente,false);
 assert.equal(estadoPatrimonio('nuevo-circo',1936).presente,true);
});
test('cementerio cerrado sigue físicamente presente; Rotunda 1936 no se decide sin evidencia',()=>{
 assert.equal(estadoPatrimonio('hijos-dios',1889).presente,true);
 assert.match(estadoPatrimonio('hijos-dios',1889).fase,/cerrado/);
 assert.equal(estadoPatrimonio('rotunda',1843).presente,false);
 assert.equal(estadoPatrimonio('rotunda',1936).presente,false);
 assert.equal(crearPatrimonio({id:'rotunda',anio:1936}).edificio.children.length,0);
 assert.equal(estadoPatrimonio('rotunda',1946).presente,false);
});
test('no permite años/edificios o modos desconocidos',()=>{
 for(const options of [{id:'inventado'},{id:'rotunda',anio:1900},{id:'rotunda',nivelDetalle:'x'}])assert.throws(()=>crearPatrimonio(options),RangeError);
});
for(const id of Object.keys(CATALOGO_PATRIMONIO))test(`${id}: geometría finita, patio abierto y detalle de ciudad con la misma huella`,()=>{
 const anio=id==='concordia'?1946:['nuevo-circo','san-agustin'].includes(id)?1936:1911;
 const estudio=crearPatrimonio({id,anio}), ciudad=crearPatrimonio({id,anio,nivelDetalle:'ciudad'});
 if(estudio.etapa.presente!==true){assert.equal(estudio.edificio.children.length,0);return;}
 const limites=m=>new THREE.Box3().setFromObject(m.edificio);
 const a=limites(estudio),b=limites(ciudad);assert.ok(a.min.distanceTo(b.min)<.01);assert.ok(a.max.distanceTo(b.max)<.01);
 let n=0;ciudad.edificio.traverse(o=>{if(o.isMesh){n++;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});assert.ok(n<=25,`${n} mallas`);
 assert.ok(a.max.y>3);assert.ok(a.min.y>=-.1);
 assert.ok(estudio.cubiertas.isGroup);assert.ok(estudio.metadatos.dimensionesInterpretativas);
});
test('Nuevo Circo conserva ruedo abierto y dos torres con geometría en 1936',()=>{
 const m=crearPatrimonio({id:'nuevo-circo',anio:1936});assert.equal(m.metadatos.ruedoAbierto,true);assert.equal(m.metadatos.torres,2);assert.ok(new THREE.Box3().setFromObject(m.edificio).max.y>18);
});

test('las fases tempranas inciertas no se convierten en iglesias modernas',()=>{
 for(const [id,anio] of [['santa-rosalia',1772],['san-juan',1843],['san-jose',1889]]){const m=crearPatrimonio({id,anio});assert.equal(m.etapa.presente,null);assert.equal(m.edificio.children.length,0);}
 assert.equal(estadoPatrimonio('san-agustin',1911).presente,false);
 assert.equal(estadoPatrimonio('san-agustin',1936).presente,true);
});

test('Rotunda representa los dos recintos norte y sur sin convertir el cuartel vecino en cárcel',()=>{
 const m=crearPatrimonio({id:'rotunda',anio:1911,nivelDetalle:'estudio'});
 assert.equal(m.metadatos.recintos,2);
 assert.deepEqual(m.metadatos.centrosPatios,[[-19,0],[19,0]]);
 assert.equal(m.metadatos.diametroPatio,24);
});

test('La Concordia de Villanueva solo aparece en 1946, separada de la cárcel',()=>{
 for(const anio of [1772,1843,1889,1911,1936])assert.equal(estadoPatrimonio('concordia',anio).presente,false);
 const m=crearPatrimonio({id:'concordia',anio:1946});
 assert.equal(m.etapa.presente,true);assert.equal(m.metadatos.templete,true);
 assert.equal(m.metadatos.columnasInteriores,8);assert.equal(m.metadatos.pilaresExteriores,8);
 assert.ok(new THREE.Box3().setFromObject(m.edificio).max.y>8);
 assert.equal(estadoPatrimonio('rotunda',1946).presente,false);
});

test('General del Sur distingue calco de 1936 y esquemas interpretativos',()=>{
 const medir=anio=>{const m=crearPatrimonio({id:'cementerio-sur',anio});const b=new THREE.Box3().setFromObject(m.edificio);return {m,b,s:b.getSize(new THREE.Vector3())};};
 const a=medir(1889),b=medir(1911),c=medir(1936),d=medir(1946);
 assert.equal(a.m.metadatos.huellaInterpretativa,true);
 assert.equal(a.m.metadatos.areaCartografiada,false);
 assert.equal(a.m.metadatos.secciones,4);
 assert.equal(b.m.metadatos.huellaInterpretativa,true);
 assert.match(b.m.metadatos.trazado,/no medible/);
 assert.ok(c.s.x>780&&c.s.x<850,`ancho 1936 ${c.s.x}`);
 assert.ok(c.s.z>400&&c.s.z<470,`fondo 1936 ${c.s.z}`);
 assert.equal(c.m.metadatos.areaCartografiada,true);
 assert.equal(c.m.metadatos.huellaDeReferencia,1936);
 assert.equal(d.m.metadatos.huellaInterpretativa,true);
 assert.equal(d.m.metadatos.areaCartografiada,false);
 assert.equal(d.m.metadatos.huellaDeReferencia,1936);
 assert.ok(c.m.metadatos.conteoTipologico.tumbas>100);
 assert.ok(c.m.metadatos.conteoTipologico.arboles>20);
 assert.ok(c.b.max.y<12,'no se debe inventar una portada monumental');
});

test('San Agustín conserva cúpula de 24 m y torre abierta de 32 m según IPC',()=>{
 const m=crearPatrimonio({id:'san-agustin',anio:1936});m.edificio.updateMatrixWorld(true);
 const caja=new THREE.Box3().setFromObject(m.edificio);assert.ok(Math.abs(caja.max.y-32)<.05,`torre ${caja.max.y}`);
 let altoCrucero=-Infinity;const p=new THREE.Vector3();
 m.edificio.traverse(o=>{if(!o.isMesh)return;const v=o.geometry.attributes.position;for(let i=0;i<v.count;i++){p.fromBufferAttribute(v,i).applyMatrix4(o.matrixWorld);if(p.z<-5&&Math.abs(p.x)<5)altoCrucero=Math.max(altoCrucero,p.y);}});
 assert.ok(Math.abs(altoCrucero-24)<.05,`cúpula ${altoCrucero}`);
 const r=new THREE.Raycaster(new THREE.Vector3(0,24.5,34),new THREE.Vector3(0,0,-1),0,12);
 assert.equal(r.intersectObject(m.edificio,true).length,0,'el campanario permite ver a través, sin caja maciza ni aguja a esa altura');
});

test('San Agustín ajusta su volumen al contorno aproximado de los planos sin escalar alturas',()=>{
 const m=crearPatrimonio({id:'san-agustin',anio:1936});
 const b=new THREE.Box3().setFromObject(m.edificio),s=b.getSize(new THREE.Vector3());
 // Lectura cartográfica aprox.32×63m; tolerancia de línea y ausencia de mensura catastral.
 assert.ok(s.x>=30&&s.x<=34,`ancho ${s.x}`);
 assert.ok(s.z>=60&&s.z<=65,`fondo ${s.z}`);
 assert.ok(Math.abs(b.max.y-32)<.05);
});

test('San Agustín cierra los extremos altos del crucero',()=>{
 const m=crearPatrimonio({id:'san-agustin',anio:1936});m.edificio.updateMatrixWorld(true);
 for(const lado of [-1,1]){
  const r=new THREE.Raycaster(new THREE.Vector3(lado*25,16,-18),new THREE.Vector3(-lado,0,0),0,12);
  assert.ok(r.intersectObject(m.edificio,true).length>0,'el extremo del crucero tiene muro exterior');
 }
});

test('Hospital Vargas aparece desde la planta de 1889 y conserva sus dos alas por etapas',()=>{
 assert.equal(estadoPatrimonio('hospital-vargas',1772).presente,false);
 assert.equal(estadoPatrimonio('hospital-vargas',1843).presente,false);
 assert.equal(estadoPatrimonio('hospital-vargas',1889).presente,true);
 assert.match(estadoPatrimonio('hospital-vargas',1889).fase,/En obras/);
 for(const anio of [1911,1936,1946]){
  const m=crearPatrimonio({id:'hospital-vargas',anio});
  assert.equal(m.etapa.presente,true);
  assert.deepEqual(m.metadatos.alas,['norte','sur']);
  const b=new THREE.Box3().setFromObject(m.edificio),s=b.getSize(new THREE.Vector3());
  assert.ok(s.x>60&&s.x<64,`ancho ${s.x}`);assert.ok(s.z>140&&s.z<145,`largo ${s.z}`);
  assert.ok(b.max.y>5);
 }
 assert.match(CATALOGO_PATRIMONIO['hospital-vargas'].nota,/No se ubican anexos de 1939/);
});
