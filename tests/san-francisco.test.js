import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { etapaSanFrancisco, ANIOS_SAN_FRANCISCO } from '../src/san-francisco-datos.js';
import { crearSanFrancisco } from '../src/san-francisco.js';

test('las fechas distinguen la fachada colonial de 1745 de la reforma de Juan Hurtado Manrique (1888)', () => {
  assert.deepEqual(ANIOS_SAN_FRANCISCO, [1772, 1843, 1889, 1911, 1936]);
  assert.equal(etapaSanFrancisco(1772).colonial, true);
  assert.equal(etapaSanFrancisco(1772).conCeiba, false);
  assert.equal(etapaSanFrancisco(1843).colonial, true);
  assert.equal(etapaSanFrancisco(1843).postTerremoto, true);
  assert.equal(etapaSanFrancisco(1843).conCeiba, false);

  assert.equal(etapaSanFrancisco(1889).colonial, false);
  assert.equal(etapaSanFrancisco(1889).conCeiba, true);
  assert.equal(etapaSanFrancisco(1911).colonial, false);
  assert.equal(etapaSanFrancisco(1936).colonial, false);
  assert.throws(() => etapaSanFrancisco(1578), RangeError);
});

test('todas las épocas producen geometría finita, cubiertas desmontables y dimensiones coherentes con grunch/caracas', () => {
  for (const anio of ANIOS_SAN_FRANCISCO) {
    const { edificio, cubiertas, ceiba } = crearSanFrancisco({ anio, nivelDetalle: 'ciudad' });
    const caja = new Box3().setFromObject(edificio);
    const anchoX = caja.max.x - caja.min.x;
    const largoZ = caja.max.z - caja.min.z;

    // En modo ciudad no hay plataforma ni Ceiba: el templo mide ~19,6–24 m × 62 m
    assert.ok(anchoX >= 19 && anchoX <= 26, `anchoX inesperado en ${anio}: ${anchoX}`);
    assert.ok(largoZ >= 61 && largoZ <= 66, `largoZ inesperado en ${anio}: ${largoZ}`);
    assert.ok(caja.max.y >= 14 && caja.max.y <= 19, `altura inesperada en ${anio}: ${caja.max.y}`);
    assert.ok(cubiertas.children.length > 0, `sin cubiertas en ${anio}`);
    assert.equal(ceiba.children.length, 0, `la Ceiba no debe incluirse en modo ciudad (${anio})`);

    edificio.traverse((o) => {
      if (o.geometry) {
        for (const n of o.geometry.attributes.position.array) {
          assert.ok(Number.isFinite(n), `vértice no finito en ${anio}`);
        }
      }
    });

    cubiertas.visible = false;
    assert.ok(edificio.children.some((o) => o !== cubiertas && o !== ceiba && o.visible));
  }
});

test('el modo ciudad reduce el conteo de triángulos y omite la Ceiba respecto al estudio', () => {
  const contar = (grupo) => {
    let t = 0;
    grupo.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const g = o.geometry;
      t += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    });
    return t;
  };

  for (const anio of ANIOS_SAN_FRANCISCO) {
    const estudio = contar(crearSanFrancisco({ anio, nivelDetalle: 'estudio' }).edificio);
    const ciudad = contar(crearSanFrancisco({ anio, nivelDetalle: 'ciudad' }).edificio);
    assert.ok(ciudad < estudio, `ciudad (${ciudad}) debe pesar menos que estudio (${estudio}) en ${anio}`);
  }
});
