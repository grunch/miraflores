import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {crearPuente,estadoPuente,CATALOGO_PUENTES} from '../src/puentes-guaire.js';
test('Sur 7 distingue Constitución, Sucre metálico y sustitución de concreto',()=>{
 assert.equal(estadoPuente('sucre',1843).presente,false);
 assert.equal(estadoPuente('sucre',1889).modelo,'constitucion');
 assert.equal(estadoPuente('sucre',1911).modelo,'bowstring');
 assert.equal(estadoPuente('sucre',1936).presente,true);
 assert.equal(estadoPuente('sucre',1936).modelo,null);
 assert.equal(crearPuente({id:'sucre',anio:1936}).edificio.children.length,1);
});
test('los puentes originales no sobreviven a su sustitución por falta de modelo nuevo',()=>{
 assert.equal(estadoPuente('hierro',1936).modelo,'hierro');
 assert.equal(estadoPuente('hierro',1946).modelo,null);
 assert.equal(estadoPuente('dolores',1911).modelo,'dolores');
 assert.equal(estadoPuente('dolores',1936).modelo,null);
 assert.equal(estadoPuente('ayacucho',1911).presente,false);
});
for(const [id,f] of Object.entries(CATALOGO_PUENTES))test(`${id}: geometría finita y misma envolvente entre niveles`,()=>{
 const a=crearPuente({id,anio:f.anioVista}),b=crearPuente({id,anio:f.anioVista,nivelDetalle:'ciudad'});
 assert.ok(a.etapa.modelo);let meshes=0;
 b.edificio.traverse(o=>{if(o.isMesh){meshes++;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});
 assert.ok(meshes<=14);const ba=new T.Box3().setFromObject(a.edificio),bb=new T.Box3().setFromObject(b.edificio);
 assert.ok(ba.min.distanceTo(bb.min)<.01);assert.ok(ba.max.distanceTo(bb.max)<.01);
 assert.ok(b.metadatos.cotaTablero>0);assert.ok(b.tablero.children.length>0);
});
test('Sucre y Dolores dejan el cauce sin pilas; Hierro tiene apoyos intermedios',()=>{
 assert.equal(crearPuente({id:'sucre',anio:1911}).metadatos.apoyosIntermedios,0);
 assert.equal(crearPuente({id:'dolores',anio:1911}).metadatos.apoyosIntermedios,0);
 assert.equal(crearPuente({id:'hierro',anio:1889}).metadatos.apoyosIntermedios,9);
});
test('rechaza año, id y detalle inválidos',()=>{
 for(const opts of [{anio:1925},{id:'inexistente'},{nivelDetalle:'bajo'}])assert.throws(()=>crearPuente(opts),RangeError);
});
