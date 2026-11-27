import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {etapaCasaAmarilla,ANIOS_CASA} from '../src/casa-amarilla-datos.js';
import {crearCasaAmarilla} from '../src/casa-amarilla.js';
test('las fechas evitan anacronismos de fachada y cubierta',()=>{
  assert.equal(etapaCasaAmarilla(1772).neoclasica,false);
  assert.equal(etapaCasaAmarilla(1810).id,etapaCasaAmarilla(1772).id);
  assert.equal(etapaCasaAmarilla(1843).id,'casa-de-gobierno');
  assert.equal(etapaCasaAmarilla(1911).cubiertaMixta,false);
  assert.equal(etapaCasaAmarilla(1936).cubiertaMixta,true);
  assert.throws(()=>etapaCasaAmarilla(1578),RangeError);
});
test('todas las variantes producen mallas finitas y cubierta separable',()=>{
  for(const anio of ANIOS_CASA){
    const {edificio,cubiertas}=crearCasaAmarilla({anio});
    const caja=new Box3().setFromObject(edificio);
    assert.ok(caja.max.y>10&&caja.max.y<22);
    assert.ok(caja.max.x-caja.min.x<65);
    assert.ok(cubiertas.children.length>0);
    edificio.traverse(o=>{if(o.geometry)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));});
    cubiertas.visible=false;
    assert.ok(edificio.children.some(o=>o!==cubiertas&&o.visible));
  }
});
