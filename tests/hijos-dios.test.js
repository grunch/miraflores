import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {crearPatrimonio} from '../src/patrimonio-prioritario.js';
test('Hijos de Dios conserva tres campos y contorno escalonado sin capilla atribuida',()=>{
 const m=crearPatrimonio({id:'hijos-dios',anio:1936});
 assert.equal(m.metadatos.recintos,3);
 assert.equal(m.metadatos.hilerasNichos,4);
 assert.equal(m.metadatos.capillaDocumentada,false);
 const bounds=new T.Box3().setFromObject(m.edificio);
 assert.ok(bounds.max.x-bounds.min.x>165);
 assert.ok(bounds.max.z-bounds.min.z<75);
 const suelo=m.edificio.getObjectByName('recinto-cartografico');
 assert.ok(suelo?.isMesh);
 const ray=new T.Raycaster(new T.Vector3(80,30,-22),new T.Vector3(0,-1,0));
 m.edificio.updateMatrixWorld(true);
 assert.equal(ray.intersectObject(suelo).length,0,'el entrante noreste no se rellena');
 const rayInterior=new T.Raycaster(new T.Vector3(70,30,0),new T.Vector3(0,-1,0));
 assert.ok(rayInterior.intersectObject(suelo).length>0);
});

test('la planta conserva los puntos documentados y no se deforma entre épocas',async()=>{
 const {readFile}=await import('node:fs/promises');
 const d=JSON.parse(await readFile(new URL('../docs/prioridades/hijos-dios-georreferencia.json',import.meta.url),'utf8'));
 const {CONTORNO_HIJOS,DIVISIONES_HIJOS}=await import('../src/patrimonio-hijos-dios.js');
 assert.deepEqual(CONTORNO_HIJOS,d.contornoLocal);
 assert.deepEqual(DIVISIONES_HIJOS,d.divisionesLocal);
 let base;
 for(const anio of [1889,1911,1936,1946]){
  const m=crearPatrimonio({id:'hijos-dios',anio,nivelDetalle:'ciudad'});
  const b=new T.Box3().setFromObject(m.edificio);
  if(base){assert.ok(base.min.distanceTo(b.min)<1e-6);assert.ok(base.max.distanceTo(b.max)<1e-6);}else base=b;
 }
 for(const anio of [1772,1843])assert.equal(crearPatrimonio({id:'hijos-dios',anio}).edificio.children.length,0);
});
