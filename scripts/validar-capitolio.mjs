import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1540, height: 1040 } });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  const baseUrl = process.env.VISOR_URL ?? 'http://localhost:5175';

  await page.goto(`${baseUrl}/capitolio.html`);
  await page.waitForFunction(() => window.estudioCapitolio?.edificio);
  await mkdir('entregables/capitolio', { recursive: true });

  for (const anio of [1772, 1843, 1889, 1911, 1936, 1958]) {
    await page.click(`[data-anio="${anio}"]`);
    await page.click('[data-vista="perspectiva"]');
    assert.equal(await page.evaluate(() => window.estudioCapitolio.etapa.anio), anio);
    await page.screenshot({ path: `entregables/capitolio/${anio}-perspectiva.png` });

    await page.click('[data-vista="norte"]');
    await page.screenshot({ path: `entregables/capitolio/${anio}-norte.png` });

    if (anio === 1772 || anio === 1936 || anio === 1958) {
      await page.click('[data-vista="patio"]');
      await page.screenshot({ path: `entregables/capitolio/${anio}-patio.png` });
    }
    if (anio === 1889 || anio === 1958) {
      await page.click('[data-vista="sur"]');
      await page.screenshot({ path: `entregables/capitolio/${anio}-sur.png` });
    }

    const descarga = page.waitForEvent('download');
    await page.click('#exportar');
    const archivo = await descarga;
    await archivo.saveAs(`entregables/capitolio/${archivo.suggestedFilename()}`);
    console.log(
      anio,
      await page.evaluate(() => ({
        llamadas: window.estudioCapitolio.render.info.render.calls,
        triangulos: window.estudioCapitolio.render.info.render.triangles,
      }))
    );
  }

  // Planta sin cubiertas para inspeccionar patios y claustros
  await page.click('[data-anio="1772"]');
  await page.click('[data-vista="planta"]');
  await page.uncheck('#techos');
  assert.equal(await page.evaluate(() => window.estudioCapitolio.cubiertas.visible), false);
  await page.screenshot({ path: 'entregables/capitolio/1772-planta-sin-cubiertas.png' });

  await page.click('[data-anio="1958"]');
  await page.check('#techos');
  await page.click('[data-vista="planta"]');
  await page.screenshot({ path: 'entregables/capitolio/1958-planta.png' });

  await page.click('[data-vista="detalle"]');
  await page.screenshot({ path: 'entregables/capitolio/1958-detalle-cupula.png' });

  // Revisión móvil
  await page.click('[data-vista="perspectiva"]');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
  await page.screenshot({ path: 'entregables/capitolio/movil.png', fullPage: true });

  // Comprobar continuidad de estudios anteriores
  await page.goto(`${baseUrl}/casa-amarilla.html`);
  await page.waitForFunction(() => window.estudioCasa?.edificio);
  await page.goto(`${baseUrl}/`);
  await page.waitForFunction(() => window.estudio?.palacio);

  assert.deepEqual(errores, []);
  console.log('Palacio Federal Legislativo: épocas, cubiertas, GLB, móvil y estudios previos verificados.');
} finally {
  await browser.close();
}
