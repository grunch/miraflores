import {chromium} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='entregables/manzana-colonial';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errores=[];
try {
 const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(90000);p.on('pageerror',e=>errores.push(e.message));
 await p.goto('http://localhost:5178/manzana-colonial.html');await p.waitForFunction(()=>window.estudioManzana);
 const plan=()=>p.evaluate(()=>window.estudioManzana.plan);
 const captura=nombre=>p.screenshot({path:`${out}/${nombre}.png`});
 const generar=async n=>{await p.fill('#cantidadCasas',String(n));await p.click('button[type=submit]');assert.equal((await plan()).cantidadCasas,n);};
 for(const v of ['perspectiva','planta','calle']){await p.click(`[data-vista=${v}]`);await captura(v);}
 await p.click('[data-vista=perspectiva]');await generar(4);const elite=await plan();await captura('elite-4');
 await generar(32);const humilde=await plan();await captura('humilde-32');assert.ok(elite.estadisticas.superficieMediaSolar>humilde.estadisticas.superficieMediaSolar*4);
 for(let i=0;i<4;i++){await p.fill(`#lado${i}`,String([100,80,100,80][i]));await p.fill(`#angulo${i}`,String([75,105,75,105][i]));}
 await generar(12);await p.click('[data-vista=planta]');await captura('oblicua');const oblicua=await plan();
 await p.reload();await p.waitForFunction(()=>window.estudioManzana);assert.deepEqual(await plan(),oblicua);
 await p.fill('#lado2','90');await p.click('button[type=submit]');assert.match(await p.textContent('#estado'),/no cierra/);assert.deepEqual(await plan(),oblicua);await p.fill('#lado2','100');
 await p.selectOption('#detalle','ciudad');await generar(12);assert.deepEqual(await plan(),oblicua);
 await p.uncheck('#techos');assert.equal(await p.evaluate(()=>window.estudioManzana.cubiertas.visible),false);await p.check('#techos');
 for(const [id,file] of [['receta','receta-exportada.json'],['glb','manzana-colonial.glb']]){const download=p.waitForEvent('download');await p.click('#'+id);await (await download).saveAs(`${out}/${file}`);}
 assert.equal(JSON.parse(await readFile(`${out}/receta-exportada.json`)).version,4);assert.equal((await readFile(`${out}/manzana-colonial.glb`)).subarray(0,4).toString(),'glTF');
 await p.goto('http://localhost:5178/manzana-colonial.html');await p.waitForFunction(()=>window.estudioManzana);await p.click('[data-vista=planta]');await p.click('#comparar');
 for(let i=0;i<3;i++){await p.locator('#selectores button').nth(i).click();await p.waitForFunction(()=>document.querySelector('#referencia').complete&&document.querySelector('#referencia').naturalWidth>0);}
 await p.locator('#selectores button').nth(1).click();await captura('comparacion');
 await p.click('#comparar');await p.setViewportSize({width:390,height:844});await captura('movil');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errores,[]);console.log(JSON.stringify({elite:elite.estadisticas,humilde:humilde.estadisticas,oblicua:oblicua.perimetro,errores},null,2));
}finally{await browser.close();}
