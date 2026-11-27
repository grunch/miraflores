import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {crearElSilencio} from '../src/el-silencio.js';

test('El Silencio no introduce el conjunto de 1945 en mapas anteriores',()=>{
  for(const anio of [1772,1843,1889,1911,1936,1944])assert.throws(()=>crearElSilencio({anio}),RangeError);
});
test('Siete bloques diferenciados, patios y cuerpo elevado',()=>{
  const m=crearElSilencio();
  assert.deepEqual(m.bloques.map(b=>b.userData.id),[1,2,3,4,5,6,7]);
  assert.ok(m.huellas.some(h=>h.bloque===1&&h.pisos===7));
  assert.ok(m.huellas.filter(h=>h.bloque!==1).every(h=>h.pisos===4));
  // El centro del patio del bloque 7 queda fuera de todas sus alas.
  const p=[-56,178];
  for(const h of m.huellas.filter(h=>h.bloque===7)){
    const dx=h.b[0]-h.a[0],dz=h.b[1]-h.a[1],l2=dx*dx+dz*dz;
    const t=Math.max(0,Math.min(1,((p[0]-h.a[0])*dx+(p[1]-h.a[1])*dz)/l2));
    assert.ok(Math.hypot(p[0]-h.a[0]-t*dx,p[1]-h.a[1]-t*dz)>h.ancho/2);
  }
});
test('La fusión conserva volumen y reduce mallas sin perder cubiertas independientes',()=>{
  const sin=crearElSilencio({optimizar:false}),con=crearElSilencio();
  const limites=m=>new Box3().setFromObject(m.edificio);
  const a=limites(sin),b=limites(con);
  assert.ok(a.min.distanceTo(b.min)<.001&&a.max.distanceTo(b.max)<.001);
  const contar=m=>{let n=0,t=0;m.edificio.traverse(o=>{if(o.isMesh){n++;t+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return {n,t};};
  const s=contar(sin),c=contar(con);assert.equal(c.t,s.t);assert.ok(c.n<s.n/10);assert.ok(c.n<300);
  assert.equal(con.cubiertas.length,sin.cubiertas.length);
  for(const g of con.cubiertas){assert.ok(g.parent);assert.ok(g.children.length);}
});
