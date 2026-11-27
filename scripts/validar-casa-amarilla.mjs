import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1540,height:1040}}),errores=[];
  page.on('pageerror',e=>errores.push(e.message));
  await page.goto((process.env.VISOR_URL??'http://localhost:5174')+'/casa-amarilla.html');
  await page.waitForFunction(()=>window.estudioCasa?.edificio);
  await mkdir('entregables/casa-amarilla',{recursive:true});
  for(const anio of [1772,1810,1843,1889,1911,1936]){
    await page.click(`[data-anio="${anio}"]`);await page.click('[data-vista="perspectiva"]');
    assert.equal(await page.evaluate(()=>window.estudioCasa.etapa.anio),anio);
    await page.screenshot({path:`entregables/casa-amarilla/${anio}.png`});
    await page.click('[data-vista="frente"]');await page.screenshot({path:`entregables/casa-amarilla/${anio}-fachada.png`});
    if(anio>=1889){await page.click('[data-vista="portada"]');await page.screenshot({path:`entregables/casa-amarilla/${anio}-portada.png`});}
    const descarga=page.waitForEvent('download');await page.click('#exportar');const archivo=await descarga;await archivo.saveAs(`entregables/casa-amarilla/${archivo.suggestedFilename()}`);
    console.log(anio,await page.evaluate(()=>({mallas:window.estudioCasa.render.info.render.calls,triangulos:window.estudioCasa.render.info.render.triangles})));
  }
  await page.click('[data-vista="patio"]');await page.uncheck('#techos');
  assert.equal(await page.evaluate(()=>window.estudioCasa.cubiertas.visible),false);
  await page.screenshot({path:'entregables/casa-amarilla/patio.png'});
  await page.click('[data-vista="planta"]');await page.screenshot({path:'entregables/casa-amarilla/planta-sin-cubiertas.png'});
  await page.check('#techos');await page.click('[data-vista="perspectiva"]');await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
  await page.screenshot({path:'entregables/casa-amarilla/movil.png',fullPage:true});
  await page.goto((process.env.VISOR_URL??'http://localhost:5174')+'/');await page.waitForFunction(()=>window.estudio?.palacio);
  assert.equal(await page.locator('#edificio').inputValue(),'panteon');
  await page.selectOption('#edificio','miraflores');assert.equal(await page.locator('h1').textContent(),'Palacio de Miraflores');
  assert.deepEqual(errores,[]);console.log('Épocas, cubiertas, GLB, móvil y estudios anteriores: correctos.');
}finally{await browser.close();}
