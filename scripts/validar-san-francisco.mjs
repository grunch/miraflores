import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1540, height: 1040 } });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  const baseUrl = process.env.VISOR_URL ?? 'http://localhost:5176';

  await page.goto(`${baseUrl}/san-francisco.html`);
  await page.waitForFunction(() => window.estudioSanFrancisco?.edificio);
  await mkdir('entregables/san-francisco', { recursive: true });

  for (const anio of [1772, 1843, 1889, 1911, 1936]) {
    await page.click(`[data-anio="${anio}"]`);
    await page.click('[data-vista="perspectiva"]');
    assert.equal(await page.evaluate(() => window.estudioSanFrancisco.etapa.anio), anio);
    await page.screenshot({ path: `entregables/san-francisco/${anio}-perspectiva.png` });

    // Vista frontal limpia (sin Ceiba tapando el centro para inspeccionar fachada completa)
    if (anio >= 1889) await page.uncheck('#ceiba');
    await page.click('[data-vista="frente"]');
    await page.screenshot({ path: `entregables/san-francisco/${anio}-fachada.png` });

    if (anio === 1843 || anio === 1936) {
      await page.click('[data-vista="detalle"]');
      await page.screenshot({ path: `entregables/san-francisco/${anio}-detalle.png` });
    }
    if (anio >= 1889) await page.check('#ceiba');

    const descarga = page.waitForEvent('download');
    await page.click('#exportar');
    const archivo = await descarga;
    await archivo.saveAs(`entregables/san-francisco/${archivo.suggestedFilename()}`);
    console.log(
      anio,
      await page.evaluate(() => ({
        llamadas: window.estudioSanFrancisco.render.info.render.calls,
        triangulos: window.estudioSanFrancisco.render.info.render.triangles,
      }))
    );
  }

  // Interior de tres naves sin cubiertas (1936)
  await page.click('[data-anio="1936"]');
  await page.uncheck('#techos');
  await page.uncheck('#ceiba');
  assert.equal(await page.evaluate(() => window.estudioSanFrancisco.cubiertas.visible), false);
  await page.click('[data-vista="interior"]');
  await page.screenshot({ path: 'entregables/san-francisco/1936-interior-sin-cubiertas.png' });

  await page.click('[data-vista="planta"]');
  await page.screenshot({ path: 'entregables/san-francisco/1936-planta-sin-cubiertas.png' });

  // Vista con Ceiba en perspectiva 1936 + móvil
  await page.check('#techos');
  await page.check('#ceiba');
  await page.click('[data-vista="perspectiva"]');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
  await page.screenshot({ path: 'entregables/san-francisco/movil.png', fullPage: true });

  // Comprobar continuidad de estudios anteriores
  await page.goto(`${baseUrl}/capitolio.html`);
  await page.waitForFunction(() => window.estudioCapitolio?.edificio);
  await page.goto(`${baseUrl}/casa-amarilla.html`);
  await page.waitForFunction(() => window.estudioCasa?.edificio);
  await page.goto(`${baseUrl}/`);
  await page.waitForFunction(() => window.estudio?.palacio);

  assert.deepEqual(errores, []);
  console.log('Iglesia de San Francisco: épocas, cubiertas, Ceiba, GLB, móvil y estudios previos verificados.');
} finally {
  await browser.close();
}
