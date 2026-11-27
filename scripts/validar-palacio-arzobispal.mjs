import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errores=[];
  page.setDefaultTimeout(90000);
  page.on('pageerror',e=>errores.push(e.message));
  await page.goto((process.env.VISOR_URL??'http://localhost:5176')+'/palacio-arzobispal.html');
  await page.waitForFunction(()=>window.estudioArzobispal?.edificio);
  await mkdir('entregables/palacio-arzobispal',{recursive:true});
  for(const anio of [1772,1843,1889,1911,1936,2025]){
    await page.click(`[data-anio="${anio}"]`);await page.click('[data-vista="perspectiva"]');
    assert.equal(await page.evaluate(()=>window.estudioArzobispal.etapa.anio),anio);
    await page.screenshot({path:`entregables/palacio-arzobispal/${anio}.png`});
    await page.click('[data-vista="frente"]');await page.screenshot({path:`entregables/palacio-arzobispal/${anio}-fachada.png`});
    if(anio>=1889){await page.click('[data-vista="portada"]');await page.screenshot({path:`entregables/palacio-arzobispal/${anio}-portada.png`});}
    const descarga=page.waitForEvent('download');await page.click('#exportar');const archivo=await descarga;await archivo.saveAs(`entregables/palacio-arzobispal/${archivo.suggestedFilename()}`);
    console.log(anio,await page.evaluate(()=>({mallas:window.estudioArzobispal.render.info.render.calls,triangulos:window.estudioArzobispal.render.info.render.triangles})));
  }
  await page.click('[data-vista="patio"]');await page.uncheck('#techos');
  assert.equal(await page.evaluate(()=>window.estudioArzobispal.cubiertas.visible),false);
  await page.screenshot({path:'entregables/palacio-arzobispal/patio.png'});
  await page.click('[data-vista="planta"]');await page.screenshot({path:'entregables/palacio-arzobispal/planta-sin-cubiertas.png'});
  await page.check('#techos');await page.click('[data-vista="perspectiva"]');await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
  await page.screenshot({path:'entregables/palacio-arzobispal/movil.png',fullPage:true});
  await page.goto((process.env.VISOR_URL??'http://localhost:5176')+'/');await page.waitForFunction(()=>window.estudio?.palacio);
  assert.equal(await page.locator('#edificio').inputValue(),'panteon');
  await page.selectOption('#edificio','miraflores');assert.equal(await page.locator('h1').textContent(),'Palacio de Miraflores');
  assert.deepEqual(errores,[]);console.log('Épocas, cubiertas, GLB, móvil y estudios anteriores: correctos.');
}finally{await browser.close();}
