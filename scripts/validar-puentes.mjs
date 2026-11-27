import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {CATALOGO_PUENTES,estadoPuente,ANIOS_PUENTES} from '../src/puentes-guaire-datos.js';
const out='entregables/puentes-guaire';await mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const errores=[],resultados=[];
try{const p=await browser.newPage({viewport:{width:1450,height:1000}});p.on('pageerror',e=>errores.push(e.message));
 for(const [id,f] of Object.entries(CATALOGO_PUENTES)){
  await p.goto(`http://localhost:5182/puentes-guaire.html?edificio=${id}&anio=${f.anioVista}&detalle=ciudad`);await p.waitForFunction(()=>window.estudioPuentes);
  for(const [vista,nombre] of [['perspectiva','perspectiva'],['frente','alzado'],['planta','planta']]){await p.click(`[data-vista=${vista}]`);await p.screenshot({path:`${out}/${id}-${nombre}.png`});}
  const dl=p.waitForEvent('download');await p.click('#exportar');await(await dl).saveAs(`${out}/${id}.glb`);
  resultados.push(await p.evaluate(()=>({id:window.estudioPuentes.metadatos.id,etapa:window.estudioPuentes.etapa,render:window.estudioPuentes.render.info.render})));
  for(const anio of ANIOS_PUENTES){await p.click(`[data-anio="${anio}"]`);const esperado=estadoPuente(id,anio);assert.deepEqual(await p.evaluate(()=>window.estudioPuentes.etapa),esperado);assert.equal(await p.locator('#exportar').isDisabled(),!esperado.modelo);}
 }
 await p.goto('http://localhost:5182/puentes-guaire.html?edificio=sucre&anio=1889&detalle=ciudad');await p.waitForFunction(()=>window.estudioPuentes);
 await p.screenshot({path:`${out}/constitucion-perspectiva.png`});
 const dlConstitucion=p.waitForEvent('download');await p.click('#exportar');await(await dlConstitucion).saveAs(`${out}/constitucion.glb`);
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:`${out}/movil.png`});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errores,[]);await writeFile(`${out}/validacion.json`,JSON.stringify({errores,resultados},null,2));console.log(JSON.stringify({errores,resultados}));
}finally{await browser.close();}
