import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='entregables/prioridades';await mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const errores=[];const resultados=[];
try{const p=await browser.newPage({viewport:{width:1450,height:1000}});p.on('pageerror',e=>errores.push(e.message));p.setDefaultTimeout(60000);
 for(const id of ['metropolitano','nuevo-circo','rotunda','hijos-dios','cementerio-sur','santa-rosalia','san-juan','san-jose','san-agustin','hospital-vargas']){
  await p.goto(`http://localhost:5182/prioridades.html?edificio=${id}&anio=${['nuevo-circo','san-agustin'].includes(id)?1936:1911}&detalle=ciudad`);await p.waitForFunction(()=>window.estudioPrioridades);await p.screenshot({path:`${out}/${id}-perspectiva.png`});
  await p.click('[data-vista=frente]');await p.screenshot({path:`${out}/${id}-fachada.png`});await p.click('[data-vista=planta]');await p.uncheck('#techos');await p.screenshot({path:`${out}/${id}-planta.png`});await p.check('#techos');
  const dl=p.waitForEvent('download');await p.click('#exportar');await(await dl).saveAs(`${out}/${id}.glb`);
  resultados.push(await p.evaluate(()=>({id:window.estudioPrioridades.metadatos.id,etapa:window.estudioPrioridades.etapa,render:window.estudioPrioridades.render.info.render})));
  for(const anio of [1772,1843,1889,1911,1936,1946]){await p.click(`[data-anio="${anio}"]`);assert.equal(await p.evaluate(()=>window.estudioPrioridades.etapa.anio),anio);}
 }
 await p.goto('http://localhost:5182/prioridades.html?edificio=nuevo-circo&anio=1936');await p.waitForFunction(()=>window.estudioPrioridades);await p.setViewportSize({width:390,height:844});await p.screenshot({path:`${out}/movil.png`});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errores,[]);await writeFile(`${out}/validacion.json`,JSON.stringify({errores,resultados},null,2));console.log(JSON.stringify({errores,resultados}));
}finally{await browser.close();}
