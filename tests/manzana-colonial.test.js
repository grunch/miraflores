import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {planificarManzana,planDesdeReceta,recetaDeManzana} from '../src/manzana-plan.js';
import {crearManzanaColonial} from '../src/manzana-colonial.js';
test('semilla y receta reproducibles, variación entre manzanas y validación de entradas',()=>{
 const p=planificarManzana({cantidadCasas:16});assert.deepEqual(planDesdeReceta(recetaDeManzana(p)),p);assert.notDeepEqual(planificarManzana({cantidadCasas:16,semilla:'otra'}),p);
 for(const o of [{ancho:0},{fondo:NaN},{vegetacion:2},{semilla:''}])assert.throws(()=>planificarManzana({cantidadCasas:16,...o}));assert.throws(()=>planDesdeReceta({...recetaDeManzana(p),version:99}));
});
test('100 semillas: crujías dentro del solar, patios libres y lotes sin solapes',()=>{
 for(let i=0;i<100;i++){
  const p=planificarManzana({cantidadCasas:9+i%24,semilla:`cuadra-${i}`,ancho:60+i%81,fondo:60+(i*17)%81});
  const lotes=[];
  for(const c of p.casas){
   for(const r of c.rects){assert.ok(r.x-r.w/2>=-c.frente/2-1e-7);assert.ok(r.x+r.w/2<=c.frente/2+1e-7);assert.ok(r.z-r.d/2>=-1e-7);assert.ok(r.z+r.d/2<=c.profundidad+1e-7);const a=c.patio;assert.ok(Math.min(r.x+r.w/2,a.x+a.w/2)-Math.max(r.x-r.w/2,a.x-a.w/2)<1e-7||Math.min(r.z+r.d/2,a.z+a.d/2)-Math.max(r.z-r.d/2,a.z-a.d/2)<1e-7);}
   const puntos=[[-c.frente/2,0],[c.frente/2,0],[-c.frente/2,c.profundidad],[c.frente/2,c.profundidad]].map(([x,z])=>[c.x+Math.cos(c.giro)*x+Math.sin(c.giro)*z,c.z-Math.sin(c.giro)*x+Math.cos(c.giro)*z]);
   const b={x0:Math.min(...puntos.map(v=>v[0])),x1:Math.max(...puntos.map(v=>v[0])),z0:Math.min(...puntos.map(v=>v[1])),z1:Math.max(...puntos.map(v=>v[1]))};
   assert.ok(b.x0>=-p.ancho/2-1e-6&&b.x1<=p.ancho/2+1e-6&&b.z0>=-p.fondo/2-1e-6&&b.z1<=p.fondo/2+1e-6);lotes.push(b);
  }
  for(let a=0;a<lotes.length;a++)for(let b=a+1;b<lotes.length;b++){const u=lotes[a],v=lotes[b];assert.ok(Math.min(u.x1,v.x1)-Math.max(u.x0,v.x0)<1e-6||Math.min(u.z1,v.z1)-Math.max(u.z0,v.z0)<1e-6);}
  assert.ok(p.estadisticas.ocupacion>.3&&p.estadisticas.ocupacion<.8);
 }
});
test('LOD conserva el plan y reduce triángulos; capas exportables y coordenadas finitas',()=>{
 const a=crearManzanaColonial({cantidadCasas:16}),b=crearManzanaColonial({cantidadCasas:16,detalle:'ciudad'});assert.deepEqual(a.plan,b.plan);
 const contar=m=>{let t=0;m.manzana.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));t+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return t;};
 assert.ok(contar(b)<contar(a)*.4);const bounds=new Box3().setFromObject(b.manzana);assert.ok(bounds.max.y<15);assert.equal(a.cubiertas.parent,a.manzana);a.liberar();b.liberar();
});

test('cantidad exacta, 1 a 48 casas; solares y patios mayores para pocas viviendas',()=>{
 assert.throws(()=>planificarManzana());for(const cantidadCasas of [0,1.5,49])assert.throws(()=>planificarManzana({cantidadCasas}));
 for(let n=1;n<=48;n++){const p=planificarManzana({cantidadCasas:n});assert.equal(p.casas.length,n);assert.ok(p.casas.every(c=>c.patio.w>0&&c.patio.d>0));}
 const elite=planificarManzana({cantidadCasas:4}),humilde=planificarManzana({cantidadCasas:32});
 assert.equal(elite.perfil,'elite');assert.equal(humilde.perfil,'humilde');assert.ok(elite.estadisticas.superficieMediaSolar>humilde.estadisticas.superficieMediaSolar*4);
 assert.ok(elite.casas.reduce((s,c)=>s+c.patio.w*c.patio.d,0)/4>humilde.casas.reduce((s,c)=>s+c.patio.w*c.patio.d,0)/32*4);
});


test('cuatro lados y ángulos: rectángulo por defecto, paralelogramo y cierre validado',async()=>{
 const {resolverPerimetro,puntoEnPerimetro}=await import('../src/manzana-perimetro.js');
 const rect=resolverPerimetro({lados:[100,80,100,80]});assert.deepEqual(rect.angulos,[90,90,90,90]);assert.ok(Math.abs(rect.area-8000)<1e-6);
 const p=resolverPerimetro({lados:[100,80,100,80],angulos:[75,105,75,105]});
 for(let i=0;i<4;i++){const a=p.vertices[i],b=p.vertices[(i+1)%4],c=p.vertices[(i+3)%4];assert.ok(Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1])-p.lados[i])<1e-6);const angle=Math.acos(((b[0]-a[0])*(c[0]-a[0])+(b[1]-a[1])*(c[1]-a[1]))/(p.lados[i]*p.lados[(i+3)%4]))*180/Math.PI;assert.ok(Math.abs(angle-p.angulos[i])<1e-6);}
 assert.deepEqual(puntoEnPerimetro(-50,-40,100,80,p.vertices),p.vertices[0]);
 assert.throws(()=>resolverPerimetro({lados:[100,80,90,80]}),/no cierra/);assert.throws(()=>resolverPerimetro({angulos:[90,90,90,80]}),/360/);
 const modelo=crearManzanaColonial({cantidadCasas:12,lados:p.lados,angulos:p.angulos,detalle:'ciudad'});assert.equal(modelo.plan.casas.length,12);assert.deepEqual(planDesdeReceta(recetaDeManzana(modelo.plan)),modelo.plan);modelo.manzana.traverse(o=>{if(o.isMesh)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});modelo.liberar();
});

test('las casas grandes tienen tejados más anchos y conservan patios abiertos',()=>{
 const media=(p,f)=>p.casas.reduce((s,c)=>s+f(c),0)/p.casas.length;
 const grande=planificarManzana({cantidadCasas:4}),pequena=planificarManzana({cantidadCasas:32});
 for(const f of [c=>c.crujia,c=>c.rects[0].d])assert.ok(media(grande,f)>media(pequena,f)*2);
 const solarMenor=planificarManzana({cantidadCasas:4,ancho:60,fondo:60});
 assert.ok(media(grande,c=>c.crujia)>media(solarMenor,c=>c.crujia));
 for(const ancho of [60,96,140])for(const cantidadCasas of [1,2,4,8,16,32]){
  const p=planificarManzana({cantidadCasas,ancho,fondo:ancho});
  assert.ok(p.casas.every(c=>c.patio.w>0&&c.patio.d>0&&c.rects.every(r=>r.w>0&&r.d>0)));
 }
});
