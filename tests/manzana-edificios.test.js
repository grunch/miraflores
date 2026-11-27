import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {crearManzanaCompuesta} from '../src/manzana-edificios.js';
import {puntoEnPerimetro} from '../src/manzana-perimetro.js';
test('hito integrado, reserva sin viviendas, receta reproducible y escala original',()=>{
 for(const esquina of ['NO','NE','SE','SO']){
  const m=crearManzanaCompuesta({cantidadCasas:16,edificio:'arzobispal',esquina,detalle:'ciudad',lados:[100,100,100,100],angulos:[75,105,75,105]});
  assert.ok(m.casasSustituidas>0);assert.equal(m.plan.casas.length+m.casasSustituidas,16);assert.equal(m.edificioExterno.parent,m.manzana);assert.equal(m.edificioExterno.scale.x,1);
  const reserva=m.reserva,b=new Box3().setFromObject(m.edificioExterno);assert.ok(b.min.x>=reserva.x0&&b.max.x<=reserva.x1&&b.min.z>=reserva.z0&&b.max.z<=reserva.z1);
  for(const c of m.plan.casas){const co=Math.cos(c.giro),si=Math.sin(c.giro);const puntos=[[-c.frente/2,0],[c.frente/2,0],[-c.frente/2,c.profundidad],[c.frente/2,c.profundidad]].map(([x,z])=>puntoEnPerimetro(c.x+co*x+si*z,c.z-si*x+co*z,m.plan.ancho,m.plan.fondo,m.plan.perimetro.vertices));const xs=puntos.map(p=>p[0]),zs=puntos.map(p=>p[1]);assert.ok(Math.max(...xs)<=reserva.x0||Math.min(...xs)>=reserva.x1||Math.max(...zs)<=reserva.z0||Math.min(...zs)>=reserva.z1);}
  const replica=crearManzanaCompuesta({...m.receta,detalle:'ciudad'});assert.deepEqual(replica.plan,m.plan);assert.deepEqual(replica.reserva,m.reserva);replica.liberar();m.liberar();
 }
});
test('edificio demasiado grande produce error y Capitolio cabe al ampliar la manzana',()=>{
 assert.throws(()=>crearManzanaCompuesta({cantidadCasas:16,edificio:'capitolio',detalle:'ciudad'}),/Amplía/);
 const m=crearManzanaCompuesta({cantidadCasas:16,edificio:'capitolio',lados:[140,140,140,140],detalle:'ciudad'});assert.ok(m.edificioExterno);m.liberar();
 assert.throws(()=>crearManzanaCompuesta({cantidadCasas:16,edificio:'desconocido'}),/desconocido/);
});
test('adosado cierra el hueco y separado conserva los metros elegidos sin invadir la reserva',()=>{
 for(const contacto of ['adosado','separado']){
  const m=crearManzanaCompuesta({cantidadCasas:16,edificio:'arzobispal',contacto,separacion:4,detalle:'ciudad'}),r=m.reservaContacto;
  let distancia=Infinity;
  m.construcciones.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);assert.ok(Number.isFinite(x)&&Number.isFinite(z));assert.ok(!(x>r.x0+.01&&x<r.x1-.01&&z>r.z0+.01&&z<r.z1-.01));if(z>r.z0&&z<r.z1)distancia=Math.min(distancia,Math.abs(x-r.x0));}});
  assert.ok(distancia<.01,'las casas alcanzan la alineación solicitada');
  const b=new Box3().setFromObject(m.edificioExterno);assert.ok(Math.abs(b.min.x-r.x0-(contacto==='adosado'?0:4))<1e-6);
  assert.equal(m.receta.contacto,contacto);assert.equal(m.receta.separacion,4);m.liberar();
 }
 for(const separacion of [-1,NaN,16])assert.throws(()=>crearManzanaCompuesta({cantidadCasas:16,edificio:'arzobispal',separacion}),/Separación/);
});
