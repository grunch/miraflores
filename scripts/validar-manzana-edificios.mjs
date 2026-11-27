import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,args:['--no-sandbox']});
try{const p=await b.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(90000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:5178/manzana-colonial.html');await p.waitForFunction(()=>window.estudioManzana);
for(const id of ['miraflores','arzobispal','casa-amarilla','panteon','san-francisco']){
 await p.selectOption('#edificio',id);await p.waitForFunction(id=>window.estudioManzana.receta.edificio===id,id);
 await p.locator('#cantidadCasas').scrollIntoViewIfNeeded();await p.screenshot({path:`entregables/manzana-colonial/con-${id}.png`});
 assert.ok(await p.evaluate(()=>window.estudioManzana.casasSustituidas>0));
}
await p.selectOption('#edificio','arzobispal');await p.selectOption('#contacto','separado');await p.fill('#separacion','4');await p.locator('#separacion').blur();assert.equal(await p.evaluate(()=>window.estudioManzana.receta.separacion),4);await p.selectOption('#contacto','adosado');assert.equal(await p.locator('#campo-separacion').isVisible(),false);await p.selectOption('#esquina','NO');await p.selectOption('#anio','1889');await p.reload();await p.waitForFunction(()=>window.estudioManzana);assert.equal(await p.inputValue('#edificio'),'arzobispal');assert.equal(await p.inputValue('#esquina'),'NO');assert.equal(await p.inputValue('#contacto'),'adosado');assert.equal(await p.inputValue('#separacion'),'4');
await p.uncheck('#techos');assert.equal(await p.evaluate(()=>window.estudioManzana.cubiertasExternas.visible),false);await p.check('#techos');
for(const id of ['receta','glb']){const d=p.waitForEvent('download');await p.click('#'+id);await (await d).saveAs(`entregables/manzana-colonial/composicion.${id==='glb'?'glb':'json'}`);}
await p.selectOption('#edificio','capitolio');assert.match(await p.textContent('#estado'),/Amplía/);assert.equal(await p.evaluate(()=>window.estudioManzana.receta.edificio),'arzobispal');
for(let i=0;i<4;i++)await p.fill('#lado'+i,'140');await p.click('button[type=submit]');assert.equal(await p.evaluate(()=>window.estudioManzana.receta.edificio),'capitolio');
await p.selectOption('#edificio','');assert.equal(await p.evaluate(()=>window.estudioManzana.plan.casas.length),16);assert.deepEqual(errors,[]);console.log('Selector, seis edificios, reserva, recarga, capas y exportación: OK');
}finally{await b.close();}
