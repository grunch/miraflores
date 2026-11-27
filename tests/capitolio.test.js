import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { etapaCapitolio, ANIOS_CAPITOLIO, ANIOS_MAPA_CARACAS } from '../src/capitolio-datos.js';
import { crearCapitolio } from '../src/capitolio.js';

test('las fechas distinguen convento colonial y evolución de la cúpula sin anacronismos', () => {
  assert.equal(etapaCapitolio(1772).convento, true);
  assert.equal(etapaCapitolio(1772).postTerremoto, false);
  assert.equal(etapaCapitolio(1772).cupula, 'ninguna');

  assert.equal(etapaCapitolio(1843).convento, true);
  assert.equal(etapaCapitolio(1843).postTerremoto, true);

  assert.equal(etapaCapitolio(1889).convento, false);
  assert.equal(etapaCapitolio(1889).cupula, 'original-1877');

  assert.equal(etapaCapitolio(1911).cupula, 'belga-1890');
  assert.equal(etapaCapitolio(1936).cupula, 'belga-1890');
  assert.equal(etapaCapitolio(1958).cupula, 'dorada-1958');

  assert.deepEqual(ANIOS_MAPA_CARACAS, [1772, 1843, 1889, 1911, 1936]);
  assert.throws(() => etapaCapitolio(1578), RangeError);
});

test('todas las épocas generan manzana completa 92×108 m, mallas finitas y cubiertas separables', () => {
  const alturas = {};
  for (const anio of ANIOS_CAPITOLIO) {
    const { edificio, cubiertas } = crearCapitolio({ anio });
    const caja = new Box3().setFromObject(edificio);
    const anchoX = caja.max.x - caja.min.x;
    const fondoZ = caja.max.z - caja.min.z;
    alturas[anio] = caja.max.y;

    assert.ok(anchoX >= 90 && anchoX <= 100, `anchoX inesperado en ${anio}: ${anchoX}`);
    assert.ok(fondoZ >= 106 && fondoZ <= 116, `fondoZ inesperado en ${anio}: ${fondoZ}`);
    assert.ok(caja.max.y > 14 && caja.max.y < 36, `altura inesperada en ${anio}: ${caja.max.y}`);
    assert.ok(cubiertas.children.length > 0, `sin cubiertas en ${anio}`);

    edificio.traverse((o) => {
      if (o.geometry) {
        for (const n of o.geometry.attributes.position.array) {
          assert.ok(Number.isFinite(n), `vértice no finito en ${anio}`);
        }
      }
    });

    cubiertas.visible = false;
    assert.ok(edificio.children.some((o) => o !== cubiertas && o.visible));
  }

  // Verificar progresión real de alturas: campanario 1772 > espadaña 1843; cúpula 1958 > belga 1911/1936 > original 1889
  assert.ok(alturas[1772] > alturas[1843], '1772 debe superar la espadaña reparada de 1843');
  assert.ok(alturas[1911] > alturas[1889], 'la sobrecúpula belga de 1911 debe superar la bóveda achatada de 1889');
  assert.ok(alturas[1958] > alturas[1936], 'la sobrecúpula dorada de 1958 debe superar la de 1936');
});

test('el modo ciudad reduce sustancialmente el conteo de triángulos para integración en grunch/caracas', () => {
  const contar = (grupo) => {
    let t = 0;
    grupo.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const g = o.geometry;
      t += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    });
    return t;
  };

  for (const anio of ANIOS_MAPA_CARACAS) {
    const estudio = contar(crearCapitolio({ anio, nivelDetalle: 'estudio' }).edificio);
    const ciudad = contar(crearCapitolio({ anio, nivelDetalle: 'ciudad' }).edificio);
    assert.ok(ciudad < estudio, `ciudad (${ciudad}) debe tener menos triángulos que estudio (${estudio}) en ${anio}`);
  }
});
