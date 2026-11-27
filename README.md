# Estudios arquitectónicos de Caracas

Estudio independiente en Three.js + Vite donde se modelan, por épocas, edificios y conjuntos históricos de Caracas antes de integrarlos en el mapa de [grunch/caracas](https://github.com/grunch/caracas). La mayoría ya está integrada (ver [Estado de integración](#estado-de-integración)). Usa el mismo stack que ese proyecto (Three.js + `BufferGeometryUtils`) y no lo modifica: cada estudio se revisa aquí y se instala después mediante un PR en [grunch/caracas](https://github.com/grunch/caracas), siguiendo su guía de integración.

Todos los modelos son **reconstrucciones procedurales interpretativas, no levantamientos**. Las medidas son metros nominales, +Y es vertical y la ubicación debe ajustarse a cartografía georreferenciada antes de instalarlos. Cada documento indica las fuentes, el grado de certeza y los límites de su estudio.

## Uso

```sh
npm install
npm run dev          # vite --host 0.0.0.0
npm run build        # sitio estático en dist/
npm test             # node --test tests/*.test.js
```

En este entorno `node_modules` es un enlace simbólico a las dependencias de una copia local de [grunch/caracas](https://github.com/grunch/caracas). Para trabajar de forma independiente, elimina el enlace y ejecuta `npm install`.

Los scripts de `scripts/` usan Playwright (`playwright`, instalado aparte) contra un servidor de desarrollo en marcha. Cada uno espera un puerto concreto (ver la tabla); los que lo admiten aceptan otra URL con `VISOR_URL`. Las imágenes de `recursos/` son referencias de consulta: no se publican con el sitio compilado ni se usan como texturas.

## Varios agentes a la vez

Si trabajan varios agentes (Claude, Codex, Gemini…) en paralelo, deben seguir el protocolo de [AGENTS.md](AGENTS.md). Antes de editar, cada uno inicia una sesión y reclama los archivos y puertos que va a tocar con `node scripts/agentes.mjs`; comparten hallazgos en una bitácora común. `node scripts/agentes.mjs estado` muestra quién trabaja en qué.

## Visores

`vite.config.js` compila diez páginas. La portada (`index.html`) enlaza al resto.

| Página | Estudio | Épocas | Validación (puerto por defecto) |
|---|---|---|---|
| `/` (`index.html`) | Palacio de Miraflores (ca. 1911) y Santísima Trinidad / Panteón Nacional | 1772, 1843, 1889, 1911, 1936 | `npm run validar:visor` (5174) |
| `/casa-amarilla.html` | Casa Amarilla | 1772–1936 | `scripts/validar-casa-amarilla.mjs` (5174) |
| `/capitolio.html` | Convento de las Concepciones / Palacio Federal Legislativo | 1772–1958+ | `scripts/validar-capitolio.mjs` (5175) |
| `/palacio-arzobispal.html` | Palacio Arzobispal | 1772–1936 y comparación de 2025 | `scripts/validar-palacio-arzobispal.mjs` (5176) |
| `/san-francisco.html` | Iglesia de San Francisco | 1772, 1843, 1889, 1911, 1936 | `scripts/validar-san-francisco.mjs` (5176) |
| `/teatro-municipal.html` | Teatro Municipal | 1881, 1889, 1911, 1936 | `npm test` |
| `/el-silencio.html` | Reurbanización El Silencio | 1945 | `npm test` |
| `/manzana-colonial.html` | Generador de manzanas coloniales | — | `scripts/validar-manzana.mjs`, `scripts/validar-manzana-edificios.mjs` (5178) |
| `/prioridades.html` | Patrimonio prioritario (diez estudios) | seis épocas | `scripts/validar-prioridades.mjs` (5182) |
| `/puentes-guaire.html` | Puentes del Guaire (siete estructuras) | seis épocas | `scripts/validar-puentes.mjs` (5182) |

Por ejemplo, para validar San Francisco: `npm run dev -- --port 5176` y, en otra terminal, `node scripts/validar-san-francisco.mjs`.

Los visores ofrecen, en general, perspectiva, fachada, planta y vistas cercanas o de patio; ocultación de cubiertas; detalle `estudio`/`ciudad`, y exportación GLB. Los GLB y las capturas son material de revisión, en `entregables/` (o `docs/capturas/` en El Silencio). Caracas genera la geometría en tiempo de ejecución y no carga esos GLB.

## Estudios

### Palacio de Miraflores

`src/palacio.js` (`crearPalacio`). Primera reconstrucción de referencia ca. 1911, guiada por las fotos y capturas de `recursos/`. Huella exterior principal de 52 × 44 m, +Z hacia el frente y origen al centro del patio. [Revisión de las 29 referencias](docs/comparacion-referencias.md). Entregables: `entregables/palacio-miraflores.glb`, `perspectiva.png`, `patio.png`.

```js
import {crearPalacio} from './palacio.js';
const {palacio} = crearPalacio();
escena.add(palacio);
palacio.position.set(x, alturaDelTerreno, z);
palacio.rotation.y = orientacion;
```

Los materiales todavía no implementan los shaders de época, tinta o elevación de Caracas: hace falta un adaptador. Para usarlo a escala de ciudad, el modelo detallado debe optimizarse con instancias o geometrías fusionadas.

### Santísima Trinidad / Panteón Nacional

`src/panteon.js` (`crearPanteon({anio})`) recorre cinco etapas: iglesia en obras de 1772 (`src/trinidad-1772.js`, según la visita de Martí), ruinas tras el terremoto de 1812, fachada neogótica, reforma de Chataing (1911) y reforma de Mujica Millán (1930). `src/optimizar-panteon.js` agrupa mallas por material.
- [Investigación y límites del Panteón](docs/panteon-nacional.md)
- [Investigación de Trinidad en 1772](docs/trinidad-1772-investigacion.md) · [Guía de instalación](docs/instalacion-trinidad-1772-caracas.md)
- Entregables: `entregables/panteon-*`, `entregables/trinidad-ruinas-1843.glb`, `entregables/trinidad-1772/`

### Casa Amarilla

`src/casa-amarilla.js` y `src/casa-amarilla-datos.js`. Etapas 1772, 1810, 1843, 1889, 1911 y 1936, con fuentes y límites por etapa. [Investigación y criterios](docs/casa-amarilla.md). Entregables en `entregables/casa-amarilla/`.

### Palacio Federal Legislativo / Convento de las Concepciones

`src/capitolio.js` y `src/capitolio-datos.js`. Modelan la manzana completa (92 × 108 m): Convento de las Concepciones en 1772 y 1843; Capitolio de Luciano Urdaneta en 1889; sobrecúpula metálica de Malaussena en 1911 y 1936, y sobrecúpula dorada actual en 1958+.
- [Investigación histórica](docs/palacio-federal-legislativo.md) · [Guía de integración por épocas](docs/integracion-caracas-capitolio.md)
- Entregables en `entregables/capitolio/`

### Palacio Arzobispal

`src/palacio-arzobispal.js` y `src/palacio-arzobispal-datos.js`. Etapas de 1772 a 1936, más una comparación moderna de 2025 que distingue la cornisa y el pretil históricos del alero restaurado. Las etapas tempranas y los patios se marcan como hipótesis. [Investigación, fuentes y límites](docs/palacio-arzobispal.md). Entregables en `entregables/palacio-arzobispal/`.

### Iglesia de San Francisco

`src/san-francisco.js` y `src/san-francisco-datos.js`. Distingue la portada barroca de 1745, con campanario oeste, de la fachada sin torre de Juan Hurtado Manrique (1887–1889). Incluye el interior de tres naves y la Ceiba de San Francisco, que se omite en modo `ciudad`.
- [Investigación histórica](docs/iglesia-san-francisco.md) · [Guía de integración por épocas](docs/integracion-caracas-san-francisco.md)
- Entregables en `entregables/san-francisco/`

### Teatro Municipal

`src/teatro-municipal.js` (`crearTeatroMunicipal({anio, nivelDetalle})`). Exterior de 1881 con el pórtico semicircular, que se demolió en 1949. Las tres épocas de mapa comparten la misma envolvente. [Estudio e instalación](docs/integracion-caracas-teatro-municipal.md). Admite `?anio=` en la URL.

### El Silencio

`src/el-silencio.js` (`crearElSilencio({anio: 1945})`), que depende de `src/optimizar-panteon.js`. Representa los siete bloques de Villanueva inaugurados en 1945, con galerías, balcones, patios y las plazas O'Leary y Miranda, y permite seleccionar cada bloque. [Estudio e integración](docs/integracion-caracas-el-silencio.md), fusionada en [grunch/caracas#219](https://github.com/grunch/caracas/pull/219).

### Generador de manzanas coloniales

`src/manzana-plan.js`, `src/manzana-perimetro.js`, `src/manzana-colonial.js`, `src/manzana-edificios.js` (`crearManzanaCompuesta`) y `src/manzana-contacto.js`. Recibe la cantidad exacta de casas, la longitud de los cuatro lados, los ángulos de las esquinas, una semilla y la vegetación. Pocas casas producen residencias amplias; muchas, viviendas menores. Exporta JSON y GLB.
- CLI: `node scripts/generar-manzana.mjs --cantidadCasas 16 --semilla cuadra-001 --lados 96,96,96,96`
- Capturas: `node scripts/capturar-manzana.mjs`
- [Guía de integración](docs/integracion-manzanas-coloniales.md) · Entregables en `entregables/manzana-colonial/`, `manzanas-1843/`, `manzanas-1889/`, `detalle-colonial*/` y `patios-verdes/`

### Patrimonio prioritario

`src/patrimonio-prioritario.js` y `src/patrimonio-prioritario-datos.js`, con módulos propios para templos, San Agustín, Hijos de Dios, Cementerio del Sur, La Concordia y Hospital Vargas, sobre el taller común `src/patrimonio-geometria.js`. Diez estudios: Santa Rosalía, San Juan, San José, San Agustín, Circo Metropolitano, Nuevo Circo, La Rotunda / Plaza La Concordia, Hijos de Dios, Cementerio General del Sur y Hospital Vargas. Un estado `presente: null` indica incertidumbre, no ausencia.
- [Catálogo, evidencia y límites](docs/prioridades/README.md) · [Guía de instalación](docs/integracion-caracas-prioridades.md)
- `node scripts/documentar-prioridades.mjs` generó las fichas iniciales, que luego se editaron a mano: volver a ejecutarlo las sobrescribe
- Entregables en `entregables/prioridades/` y en las carpetas por edificio

### Puentes del Guaire

`src/puentes-guaire.js` (`crearPuente({id, anio, nivelDetalle})`) y `src/puentes-guaire-datos.js`. Seis cruces: Constitución / Sucre, Hierro, Dolores, Restaurador, 19 de Diciembre y Ayacucho. Exponen el tablero como capa separada y requieren un anclaje vertical propio, distinto del de las casas.
- [Catálogo](docs/puentes-guaire/README.md) · [Guía de integración](docs/integracion-caracas-puentes.md)
- `node scripts/documentar-puentes.mjs` generó las fichas iniciales, que luego se editaron a mano: volver a ejecutarlo las sobrescribe
- Entregables en `entregables/puentes-guaire/`

## Estado de integración

Situación en [grunch/caracas](https://github.com/grunch/caracas) a 27-11-2026. Las guías `docs/integracion-caracas-*.md` describen el contrato geométrico, el calce y los pasos de cada instalación; en los estudios ya integrados quedan como registro del procedimiento.

| Estudio | Estado en Caracas |
|---|---|
| Palacio de Miraflores | Integrado desde 1911 ([#46](https://github.com/grunch/caracas/pull/46)) |
| Trinidad / Panteón Nacional | 1843–1936 integrados ([#87](https://github.com/grunch/caracas/pull/87)); fase de 1772 pendiente ([issue #268](https://github.com/grunch/caracas/issues/268)) |
| Casa Amarilla | Integrada ([#139](https://github.com/grunch/caracas/pull/139)) |
| Capitolio / Concepciones | Integrado ([#143](https://github.com/grunch/caracas/pull/143); ajustes en [#160](https://github.com/grunch/caracas/pull/160), [#164](https://github.com/grunch/caracas/pull/164) y [#186](https://github.com/grunch/caracas/pull/186)) |
| Palacio Arzobispal | Integrado ([#146](https://github.com/grunch/caracas/pull/146)) |
| Iglesia de San Francisco | Integrada ([#184](https://github.com/grunch/caracas/pull/184)) |
| Teatro Municipal | Integrado en 1889, 1911 y 1936 ([#218](https://github.com/grunch/caracas/pull/218)) |
| El Silencio | Integrado como vista parcial de 1945 ([#219](https://github.com/grunch/caracas/pull/219)) |
| Manzanas coloniales | Paleta y densidad aplicadas de 1772 a 1946 ([#210](https://github.com/grunch/caracas/pull/210), [#211](https://github.com/grunch/caracas/pull/211), [#214](https://github.com/grunch/caracas/pull/214), [#216](https://github.com/grunch/caracas/pull/216), [#217](https://github.com/grunch/caracas/pull/217), [#239](https://github.com/grunch/caracas/pull/239)–[#241](https://github.com/grunch/caracas/pull/241)) |
| Nuevo Circo · Circo Metropolitano | Integrados ([#283](https://github.com/grunch/caracas/pull/283), [#284](https://github.com/grunch/caracas/pull/284)) |
| La Rotunda · La Concordia | Integradas ([#285](https://github.com/grunch/caracas/pull/285)) |
| San Agustín | Integrada en 1936 y 1946 ([#286](https://github.com/grunch/caracas/pull/286)) |
| Hijos de Dios · Cementerio General del Sur | Integrados ([#287](https://github.com/grunch/caracas/pull/287), [#288](https://github.com/grunch/caracas/pull/288)) |
| Santa Rosalía · San Juan · San José | Pendientes ([issue #259](https://github.com/grunch/caracas/issues/259)) |
| Hospital Vargas | Ficha corregida ([#236](https://github.com/grunch/caracas/pull/236)); modelo pendiente ([issue #249](https://github.com/grunch/caracas/issues/249)) |
| Puentes del Guaire | Cronología corregida ([#281](https://github.com/grunch/caracas/pull/281)); modelos pendientes ([issue #272](https://github.com/grunch/caracas/issues/272)) |

## Referencias y licencias

Todos los modelos son originales: no se copiaron mallas ni texturas de reconstrucciones ajenas. No se ha verificado la autoría ni la licencia de las imágenes de `recursos/`, que solo se usan como consulta local. Las capturas de `entregables/` y `docs/capturas/` son renders propios.
