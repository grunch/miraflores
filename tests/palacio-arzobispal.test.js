import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {crearPalacioArzobispal} from '../src/palacio-arzobispal.js';
import {etapaArzobispal,ANIOS_ARZOBISPAL} from '../src/palacio-arzobispal-datos.js';
function liberar(e){const g=new Set(),m=new Set();e.traverse(o=>{if(o.geometry)g.add(o.geometry);if(o.material)m.add(o.material)});g.forEach(x=>x.dispose());m.forEach(x=>x.dispose());}
test('épocas sin atribuir la restauración de 1980 a los mapas históricos',()=>{
 assert.equal(etapaArzobispal(1772).nombre,'Palacio Episcopal');
 assert.equal(etapaArzobispal(1843).nombre,'Palacio Arzobispal');
 for(const anio of [1889,1911,1936])assert.equal(etapaArzobispal(anio).id,'guzmancista');
 assert.equal(etapaArzobispal(2025).id,'restaurado');assert.throws(()=>etapaArzobispal(1900),RangeError);
});
test('todas las variantes tienen geometría finita, seis ejes y cubiertas desmontables',()=>{
 for(const anio of ANIOS_ARZOBISPAL){
  const {edificio,cubiertas}=crearPalacioArzobispal({anio});let n=0;
  edificio.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
  assert.ok(n>1000&&n<250000);assert.equal(edificio.userData.vanosFachada,6);assert.equal(edificio.userData.accesos,2);
  const caja=new Box3().setFromObject(edificio);assert.ok(caja.max.y>10&&caja.max.y<12);assert.ok(caja.max.x-caja.min.x<36);
  assert.ok(cubiertas.children.length>0);assert.equal(cubiertas.parent,edificio);liberar(edificio);
 }
});
