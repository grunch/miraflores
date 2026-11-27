import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.VISOR_URL??'http://localhost:5174');
 await page.waitForFunction(()=>window.estudio?.palacio);
 await mkdir('entregables',{recursive:true});
 for(const year of ['1843','1889','1911','1936']){
  await page.selectOption('#epoca',year);
  await page.click('[data-vista="perspectiva"]');
  await page.screenshot({path:`entregables/panteon-${year}.png`});
  await page.click('[data-vista="frente"]');
  await page.screenshot({path:`entregables/panteon-frente-${year}.png`});
  const pending=page.waitForEvent('download');await page.click('#exportar');
  const file=await pending;await file.saveAs(`entregables/${file.suggestedFilename()}`);
  console.log(year,await page.evaluate(()=>({etapa:window.estudio.palacio.userData.etapa,drawCalls:window.estudio.render.info.render.calls})));
 }
 await page.selectOption('#epoca','1843');await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'entregables/panteon-movil.png'});
 await page.selectOption('#edificio','miraflores');
 if(await page.locator('h1').textContent()!=='Palacio de Miraflores')throw Error('Regresión Miraflores');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Sin errores JavaScript; exportaciones y cambio a Miraflores correctos.');
} finally { await browser.close(); }
