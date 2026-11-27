import {test} from 'node:test';
import assert from 'node:assert/strict';
import {crearPanteon,etapaPanteon} from '../src/panteon.js';

test('Las reformas cambian de etapa en el año histórico y no antes',()=>{
 for(const [anio,id] of [[1772,'trinidad-obras'],[1843,'trinidad-ruinas'],[1874,'trinidad-ruinas'],[1875,'panteon-neogotico'],[1889,'panteon-neogotico'],[1910,'panteon-neogotico'],[1911,'panteon-chataing'],[1929,'panteon-chataing'],[1930,'panteon-mujica'],[1936,'panteon-mujica']])assert.equal(etapaPanteon(anio).id,id);
 for(const anio of [1771,1773,1781,1937,2013])assert.throws(()=>etapaPanteon(anio),RangeError);
 assert.throws(()=>etapaPanteon('1843'),TypeError);
});
test('1843 carece de cubiertas y la torre central solo aparece tras la reforma de 1930',()=>{
 for(const anio of [1843,1889,1911,1936]){
  const {edificio,cubiertas}=crearPanteon({anio});
  assert.equal(cubiertas.children.length===0,anio===1843);
  assert.equal(Boolean(edificio.getObjectByName('Torre central')),anio===1936);
  edificio.traverse(o=>{if(o.geometry)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));});
 }
});

test('La fusión reduce mallas sin cambiar límites, triángulos ni el control de cubiertas',async()=>{
 const {Box3}=await import('three');
 function medir(raiz){let mallas=0,triangulos=0;raiz.traverse(o=>{if(o.isMesh){mallas++;triangulos+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return {mallas,triangulos,caja:new Box3().setFromObject(raiz)};}
 for(const anio of [1772,1843,1889,1911,1936]){
  const original=crearPanteon({anio,optimizar:false}),compacto=crearPanteon({anio});
  const a=medir(original.edificio),b=medir(compacto.edificio);
  assert.ok(b.mallas<a.mallas*.2,`${anio}: ${a.mallas} → ${b.mallas}`);
  assert.equal(a.triangulos,b.triangulos);
  assert.ok(a.caja.min.distanceTo(b.caja.min)<.0001);
  assert.ok(a.caja.max.distanceTo(b.caja.max)<.0001);
  assert.equal(compacto.cubiertas.parent,compacto.edificio);
 }
});

test('1772 muestra bóvedas y dos torres inconclusas, no ruinas ni torre moderna',()=>{
 const {edificio,cubiertas,etapa}=crearPanteon({anio:1772,optimizar:false});
 assert.equal(etapa.id,'trinidad-obras');
 assert.equal(cubiertas.children.filter(o=>o.name.startsWith('Bóveda nave')).length,3);
 assert.equal(edificio.children.filter(o=>o.name.startsWith('Campanario en obra')).length,2);
 assert.equal(edificio.getObjectByName('Torre central'),undefined);
 assert.equal(edificio.userData.interpretativo,true);
 edificio.traverse(o=>{if(o.geometry)for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));});
});
