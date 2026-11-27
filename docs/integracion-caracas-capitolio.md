# Guía de integración en [grunch/caracas](https://github.com/grunch/caracas): modelos por épocas y caso completo del Palacio Federal Legislativo

Este documento explica **cómo llevar los modelos 3D procedurales desarrollados en `miraflores/` al proyecto [grunch/caracas](https://github.com/grunch/caracas)**, tomando como guía práctica y específica el **Palacio Federal Legislativo / Convento de las Concepciones** en todas las épocas del mapa (`1772`, `1843`, `1889`, `1911` y `1936`).

> **Estado actual:** integrado. [grunch/caracas#143](https://github.com/grunch/caracas/pull/143) (23-11-2026) instaló el modelo por épocas desde 1772; [grunch/caracas#160](https://github.com/grunch/caracas/pull/160), [grunch/caracas#164](https://github.com/grunch/caracas/pull/164) y [grunch/caracas#186](https://github.com/grunch/caracas/pull/186) ajustaron después la ocupación de la manzana entera y la terraza sobre la ladera. El código vive en [`src/hitos/capitolio.js`](https://github.com/grunch/caracas/blob/main/src/hitos/capitolio.js), [`src/hitos/capitolio-modelo.js`](https://github.com/grunch/caracas/blob/main/src/hitos/capitolio-modelo.js) y [`specs/08-capitolio-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-capitolio-por-epocas.md). Esta guía queda como registro del procedimiento y como plantilla para otros edificios; los números de línea citados corresponden al estado del repositorio antes de la integración.

---

## 1. Resumen histórico del edificio (para fichas, marcas y especificación)

| Campo | Valor de referencia para [grunch/caracas](https://github.com/grunch/caracas) |
|---|---|
| **ID del hito y marca** | `capitolio` |
| **Manzana / Esquinas** | NE **Las Monjas** · NO **Padre Sierra** · SO **La Bolsa** · SE **San Francisco** |
| **Ancla en mosaico 1936 (0,5 m/px)** | `x: 8690, y: 7035`, `eje: EJE_DAMERO` (`[0.9861, 0.1659]`) |
| **Huella nominal** | `92 m` (a lo largo de `eje`, E–O) × `108 m` (perpendicular, N–S) |
| **Antecedente colonial (1772–1874)** | **Real Convento de la Inmaculada Concepción (Monjas Concepciones)**, fundado en 1636–1637. Ocupaba toda la manzana (iglesia al norte orientada al este, claustro principal de dos pisos, portería al este, huerta amurallada al sur). *No confundir con el Convento de San Francisco, ubicado en la cuadra sur (`universidad`).* |
| **Daños de 1812 (corte 1843)** | El terremoto del 26 de marzo de 1812 dañó iglesia, claustros y tapias; las monjas repararon el recinto y permanecieron hasta 1874 mientras el Congreso sesionaba provisionalmente en San Francisco. |
| **Construcción del Capitolio (1872–1877)** | Presidente Antonio Guzmán Blanco; proyectista principal **Luciano Urdaneta** (con Manuel María Urbaneja, Juan Hurtado Manrique y Roberto García). **Ala Sur (Palacio Legislativo)**: inaugurada el 20 de febrero de 1873 sobre la huerta sur expropiada. **Fuente del patio**: contratada en 1875 a *The Crumlin Viaduct Works Company*. **Cariátides (*La Ley* y *La Justicia*)**: Manuel Antonio González, 1876. **Ala Norte (Palacio Federal y Salón Elíptico)**: inaugurada el 20 de febrero de 1877 con bóveda elíptica achatada original. |
| **Reforma de la cúpula (1890–1891)** | **Antonio Malaussena** diseñó en 1889 una **sobrecúpula metálica de hierro forjado y zinc con linterna calada**, fabricada en Bélgica y montada en 1890–1891 para proteger el lienzo de la *Batalla de Carabobo* (Martín Tovar y Tovar, 1888). Documentada en `congreso-1930.jpg`. |
| **Estado contemporáneo (`hoy`)** | **Palacio Federal Legislativo** (sede de la Asamblea Nacional). En **1958** se instaló la sobrecúpula dorada de aluminio anodizado actual; por ser posterior a 1936 **no** se modela en el mapa de [grunch/caracas](https://github.com/grunch/caracas), solo se menciona en `hoy` de la ficha. |

---

## 2. Cómo funciona la arquitectura de hitos por épocas en [grunch/caracas](https://github.com/grunch/caracas)

Antes de copiar cualquier modelo de `miraflores/` a [grunch/caracas](https://github.com/grunch/caracas), hay que respetar cinco reglas de arquitectura del repositorio destino (ver [`src/hitos.js`](https://github.com/grunch/caracas/blob/main/src/hitos.js), `src/hitos/lienzo.js`, `specs/08-panteon-por-epocas.md` y `specs/08-miraflores.md`):

1. **Una sola malla y un solo draw call (`lienzo.js`):**
   - **No** se cargan archivos `.glb` ni se agregan `Mesh` independientes a la escena principal.
   - Todo hito entra mediante un adaptador (`src/hitos/<edificio>.js`) que recorre el `THREE.Group` generado por el módulo procedural, transforma cada geometría con `objeto.matrixWorld`, lee `objeto.material.color.toArray()` (ya lineal en Three.js) y la vuelca al lienzo común con `p.geo(geometria, { color, mat })`.
   - Todas las geometrías y materiales temporales de Three.js deben liberarse en un bloque `finally` (`dispose()`).
   - Así el edificio hereda automáticamente **terreno/relieve (`aAncla`)**, **transición de ola entre épocas (`aVida`)**, **modo tinta y modo color**, y **sombras (`customDepthMaterial`)**.

2. **Índices de época (`vida = [nace, muere]`):**
   - En [grunch/caracas](https://github.com/grunch/caracas), las épocas son enteros del `0` al `5`:
     - `0` = 1578 (Pimentel)
     - `1` = **1772** (*Exato mapa*)
     - `2` = **1843** (Jesurún)
     - `3` = **1889** (Mestre)
     - `4` = **1911** (Razetti)
     - `5` = **1936** (DCN)
   - Una parte con `[nace, muere]` es visible en la época `e` si `nace <= e` y (`muere === 0` o `e < muere`).
   - Cada etapa distinta se declara en el arreglo `partes` del hito con intervalos **excluyentes y contiguos**, igual que en [`src/hitos/datos/panteon.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/panteon.js).

3. **Sistema de coordenadas (`lienzo.js`):**
   - En [grunch/caracas](https://github.com/grunch/caracas), dentro del marco local de un hito con `eje = EJE_DAMERO` (oeste → este):
     - `+x` local (`+a`) = **Este**
     - `+y` local (`h`) = **Arriba** (cota `0` = pie del edificio; vértices con `y < 0.01` quedan marcados como `pie = 1` para bajar hasta el terreno y no flotar en la pendiente)
     - `+z` local (`+b`) = **Sur** (a la derecha del eje)
     - `-z` local (`-b`) = **Norte**
   - **Ventaja de `src/capitolio.js`:** ya fue modelado con **exactamente estos mismos ejes** (`+X = Este`, `+Y = Arriba`, `+Z = Sur`, `-Z = Norte`, origen al centro de la manzana 92 × 108 m). Por lo tanto, el adaptador **no requiere rotación ni traslación** (`p.geo(...)` directo).

4. **Supresión de casas genéricas (`suprime`):**
   - [`src/hitos/suprimir.js`](https://github.com/grunch/caracas/blob/main/src/hitos/suprimir.js) apaga las casas genéricas del `.pak` que caen dentro de los polígonos `suprime` a partir de `hito.nace`.
   - Actualmente el hito `capitolio` en `civiles.js` tiene `nace: 3` (1889). Al cambiarlo a **`nace: 1` (1772)** para mostrar el **Convento de las Concepciones**, la supresión cubrirá automáticamente toda la manzana desde 1772 y evitará que las casas genéricas del plano de 1772 o 1843 se superpongan con el convento y su huerta.

5. **Presupuesto de triángulos y reglas de PR ([`AGENTS.md`](https://github.com/grunch/caracas/blob/main/AGENTS.md)):**
   - Cada PR en [grunch/caracas](https://github.com/grunch/caracas) debe tener **máximo 3.000 líneas de código cambiadas** (sin contar `tests/**`, `**/*.md` ni `specs/**`).
   - **Nunca** subir a [grunch/caracas](https://github.com/grunch/caracas) imágenes de `recursos/congreso/` (licencias sin verificar) ni binarios `.glb`. Solo entra código procedural limpio, especificaciones y pruebas.
   - Usar `nivelDetalle: 'ciudad'` y evaluar el presupuesto total de triángulos de la malla `hitos` (ver Sección 4).

---

## 3. Plan paso a paso para integrar el Palacio Federal Legislativo en [grunch/caracas](https://github.com/grunch/caracas)

### Paso 1 · Crear una rama nueva en [grunch/caracas](https://github.com/grunch/caracas)
```bash
cd caracas   # clon de https://github.com/grunch/caracas
git checkout main && git pull
git checkout -b feat/capitolio-por-epocas
```

### Paso 2 · Copiar el generador y los datos a [`src/hitos/`](https://github.com/grunch/caracas/tree/main/src/hitos)
Copiar desde `miraflores/`:
- `miraflores/src/capitolio-datos.js` → [`src/hitos/capitolio-datos.js`](https://github.com/grunch/caracas/blob/main/src/hitos/capitolio-datos.js)
- `miraflores/src/capitolio.js` → [`src/hitos/capitolio-modelo.js`](https://github.com/grunch/caracas/blob/main/src/hitos/capitolio-modelo.js)

Ajustes mínimos al copiar `capitolio-modelo.js`:
1. Eliminar la importación y el uso de `optimizarPanteon` (en [grunch/caracas](https://github.com/grunch/caracas), `lienzo.js` ya fusiona todos los hitos en una sola malla; no hace falta `mergeGeometries`).
2. Ajustar el import local a `import { etapaCapitolio } from './capitolio-datos.js'`.
3. Opcionalmente omitir la plataforma de base gris `caja(0, -0.15, 0, 95, 0.3, 111, 'piedra')` (o dejarla en `y = 0.02` con altura `0.04`) si se prefiere que el suelo del plano/relieve de Caracas se funda limpiamente con el borde de la acera. Mantener el parámetro `nivelDetalle = 'ciudad'` por defecto.

### Paso 3 · Crear el adaptador [`src/hitos/capitolio.js`](https://github.com/grunch/caracas/blob/main/src/hitos/capitolio.js)
Siguiendo el mismo patrón de `src/hitos/panteon.js` y `src/hitos/miraflores.js`:

```js
import { crearCapitolio } from './capitolio-modelo.js'
import { MAT } from './lienzo.js'

/**
 * Convierte cada época del Convento de las Concepciones / Palacio Federal Legislativo
 * al lienzo común de hitos (una sola malla, épocas, tinta/color, relieve y sombras).
 *
 * Ejes del modelo: +X este, +Y arriba, +Z sur, -Z norte, origen al centro de la manzana
 * 92 × 108 m. Coincide directamente con el marco de `civiles.js` (eje = EJE_DAMERO):
 * no requiere rotación ni desplazamiento adicional.
 */
export function capitolio(p, { anio, detalle = 'ciudad' }) {
  const { edificio } = crearCapitolio({ anio, optimizar: false, nivelDetalle: detalle })
  const geometrias = new Set()
  const materiales = new Set()
  edificio.updateMatrixWorld(true)
  try {
    edificio.traverse((objeto) => {
      if (!objeto.isMesh) return
      geometrias.add(objeto.geometry)
      materiales.add(objeto.material)
      const geometria = objeto.geometry.clone().applyMatrix4(objeto.matrixWorld)
      p.geo(geometria, {
        color: objeto.material.color.toArray(), // Three.js almacena color lineal
        mat: MAT.LISO,
      })
    })
  } finally {
    geometrias.forEach((g) => g.dispose())
    materiales.forEach((m) => m.dispose())
  }
}
```

> **Nota sobre relieve en pendientes (`pie = 1`):** En `lienzo.js`, todo vértice con `y < 0.01` baja automáticamente hasta el terreno para evitar muros flotantes. En `capitolio-modelo.js`, los muros, zócalos y tapias arrancan en `y = 0`, por lo que anclan correctamente; conviene revisar visualmente el borde suroeste/noreste sobre `relieve.bin` y, si hace falta, bajar la cota base del zócalo perimetral a `y = -0.8` (o marcar piezas elevadas con `flota: true`).

### Paso 4 · Registrar la parte `'capitolio'` en [`src/hitos/partes.js`](https://github.com/grunch/caracas/blob/main/src/hitos/partes.js)
1. Importar al inicio de `src/hitos/partes.js`:
   ```js
   import { capitolio } from './capitolio.js'
   ```
2. Añadir la entrada dentro de `export const PARTES = Object.freeze({ ... })`:
   ```js
   capitolio(p, medidas) { capitolio(p, medidas) },
   ```

### Paso 5 · Actualizar el hito en [`src/hitos/datos/civiles.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/civiles.js)
Reemplazar la definición genérica actual de `capitolio` (líneas 36–52 de `src/hitos/datos/civiles.js`) por las variantes por época desde **1772 (`nace: 1`)**:

```js
  Object.freeze({
    id: 'capitolio',
    nombre: 'Capitolio (Palacio Federal y Legislativo)',
    ...capitolio,
    nace: 1,
    muere: 0,
    planta: [rectanguloPx(capitolio, CAPITOLIO.ancho, CAPITOLIO.fondo)],
    suprime: [rectanguloPx(capitolio, CAPITOLIO.ancho, CAPITOLIO.fondo)],
    fuente:
      `${PLANO} (recuadro "Palacio Federal": cuatro alas alrededor de un jardín, con óvalo en el ala norte); ` +
      'plano de Mestre de 1889 (1 "Capitolio", 2 "Palacio Federal"); ' +
      'estudio por épocas en miraflores/docs/palacio-federal-legislativo.md y specs/08-capitolio-por-epocas.md.',
    verificar: [
      '1772 y 1843 representan el Convento de las Concepciones (manzana completa, iglesia al norte orientada al este, claustro principal y huerta sur); alzados y daños post-1812 son interpretativos.',
      '1889 representa el conjunto de Luciano Urdaneta (1873–1877) con la bóveda elíptica achatada original, anterior a la sobrecúpula belga de Antonio Malaussena (montada en 1890–1891).',
      '1911 y 1936 incorporan la sobrecúpula metálica de hierro y zinc con linterna calada (cotejada con fotografía histórica de ca. 1930). La sobrecúpula dorada de aluminio anodizado es de 1958 y no se incluye en los mapas hasta 1936.',
      'Se conservan el ancla (8690, 7035), el eje EJE_DAMERO y la huella nominal de 92 × 108 m; el calce fino y la supresión de casas de 1772/1843 deben verificarse contra los planos calzados.',
    ],
    // Opción recomendada (4 tramos de vida: 1911 y 1936 comparten malla ~110k triángulos en total)
    partes: [
      { tipo: 'capitolio', anio: 1772, nace: 1, muere: 2 },
      { tipo: 'capitolio', anio: 1843, nace: 2, muere: 3 },
      { tipo: 'capitolio', anio: 1889, nace: 3, muere: 4 },
      { tipo: 'capitolio', anio: 1936, nace: 4, muere: 0 },
    ],
  }),
```

*(Si el presupuesto de triángulos lo permite y se desea diferenciar también la altura de palmeras y estrellas de bandera entre 1911 y 1936, basta sustituir la última línea por `{ tipo: 'capitolio', anio: 1911, nace: 4, muere: 5 }` y `{ tipo: 'capitolio', anio: 1936, nace: 5, muere: 0 }`.)*

### Paso 6 · Enriquecer marcas y fichas históricas (`marcas-datos.js` y `fichas-datos.js`)

1. **[`src/marcas-datos.js`](https://github.com/grunch/caracas/blob/main/src/marcas-datos.js)** (entrada `capitolio`, líneas 48–50):
   - Ya nace en `1` (`1772`) con `[[1, 'Convento de las Concepciones'], [3, 'Capitolio', ...]]`.
   - Opcionalmente ajustar `alto` a `18` para que la etiqueta flote limpia sobre la linterna de Malaussena, y actualizar `fuente` / `dudas` indicando que la identificación del Convento de las Concepciones y las reformas de 1873, 1877 y 1890–1891 provienen de Wikipedia, DHV (Fundación Empresas Polar) e IAM Venezuela (manteniendo en `dudas` que las leyendas de 1772 y 1843 aún no fueron transcritas).

2. **[`src/fichas-datos.js`](https://github.com/grunch/caracas/blob/main/src/fichas-datos.js)** (entrada `capitolio`, líneas 75–83):
   Actualizar los textos por época para documentar el convento, el terremoto de 1812, la obra de Urdaneta y la sobrecúpula belga de Malaussena:

   ```js
   capitolio: {
     textos: [
       [1, 'Toda esta manzana pertenecía al Convento de las Concepciones (fundado en 1636–1637), que dio nombre a la esquina de Las Monjas. Reunía la iglesia al norte orientada hacia el este, un claustro principal de dos plantas, dependencias al oeste y una amplia huerta amurallada al sur.'],
       [2, 'El terremoto de 1812 dañó gravemente la iglesia, los claustros y las tapias del convento, aunque la comunidad permaneció aquí hasta 1874. Mientras tanto, el Congreso Nacional sesionaba provisionalmente en el vecino Convento de San Francisco, cruzando la calle hacia el sur.'],
       [3, 'Tras expropiar la huerta sur en 1872 y clausurar el convento en 1874, se levantó el conjunto neoclásico de Luciano Urdaneta: el Palacio Legislativo al sur (1873) y el Palacio Federal al norte con el Salón Elíptico y las cariátides (1877), unidos en torno al patio con la fuente de hierro de 1875. El plano de 1889 numera 1 «Capitolio» y 2 «Palacio Federal»; en esa fecha el salón aún conservaba su bóveda elíptica achatada original.'],
       [4, 'Entre 1890 y 1891 se montó la sobrecúpula metálica belga de hierro y zinc con linterna calada, proyectada por Antonio Malaussena para proteger de filtraciones la Batalla de Carabobo pintada por Martín Tovar y Tovar en 1888. Una foto de entre 1915 y 1920 muestra el salón ovalado por dentro.'],
       [5, 'El plano de 1936 rotula «Palacio Federal» dibujando las cuatro alas en torno al jardín y el óvalo del Salón Elíptico al norte, todavía coronado por la sobrecúpula de zinc y la linterna calada de Malaussena.'],
     ],
     hoy: 'el Palacio Federal Legislativo (sede de la Asamblea Nacional), coronado desde 1958 por su sobrecúpula elíptica dorada de aluminio anodizado.',
     dudas: 'Alzados coloniales de 1772 y reparaciones posteriores a 1812 son interpretaciones históricas sin levantamiento de época; las leyendas de los planos de 1772 y 1843 siguen sin transcribir.',
   },
   ```

### Paso 7 · Documentar la integración en [`specs/`](https://github.com/grunch/caracas/tree/main/specs)
Crear [`specs/08-capitolio-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-capitolio-por-epocas.md) (siguiendo el formato exacto de `specs/08-panteon-por-epocas.md`) y actualizar la fila correspondiente en `specs/07-plan-de-implementacion.md`.

---

## 4. Presupuesto medido de triángulos y optimización para escala urbana

Conteos medidos directamente sobre `crearCapitolio`:

| Época | Edificio | Modo `estudio` | Modo `ciudad` |
|---|---|---:|---:|
| `1772` | Convento de las Concepciones | 32.048 tri | **14.544 tri** |
| `1843` | Convento post-1812 | 31.148 tri | **14.064 tri** |
| `1889` | Capitolio (bóveda original 1877) | 75.920 tri | **40.476 tri** |
| `1911` | Capitolio (sobrecúpula belga 1890) | 80.056 tri | **41.788 tri** |
| `1936` | Capitolio (década de 1930) | 80.056 tri | **41.788 tri** |
| `1958+` | Referencia moderna (solo estudio) | 81.316 tri | 42.664 tri |

### Estrategias para encajar en el límite de regresión de triángulos de [grunch/caracas](https://github.com/grunch/caracas)
En [`specs/08-panteon-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-panteon-por-epocas.md) el límite global de la malla `hitos` estaba en `180.000` triángulos (`169.581` usados). Al reemplazar el Capitolio genérico:

1. **Opción 1 — 4 tramos de vida (`1772`, `1843`, `1889`, `1911–1936`):** suma **110.872 triángulos** (vs. 152.660 si se duplican 1911 y 1936). Requiere actualizar el límite de regresión en el test de hitos de [grunch/caracas](https://github.com/grunch/caracas) documentándolo en `specs/08-capitolio-por-epocas.md` (tal como se hizo en T40a para el Panteón).
2. **Opción 2 — Compartir el cuerpo neoclásico entre 1889 y 1936 (recomendada si se busca mínimo peso en GPU):**
   - Si en `capitolio-modelo.js` se añade una opción `solo: 'cuerpo' | 'cupula'` para las etapas neoclásicas:
     - Cuerpo neoclásico + patio (`nace: 3, muere: 0`): **~38.000 tri** (una sola vez para 1889, 1911 y 1936).
     - Bóveda original de 1877 (`nace: 3, muere: 4`): **~1.200 tri**.
     - Sobrecúpula belga de Malaussena (`nace: 4, muere: 0`): **~3.500 tri**.
     - Convento 1772 (`nace: 1, muere: 2`): **14.544 tri** + Convento 1843 (`nace: 2, muere: 3`): **14.064 tri**.
   - **Total combinado para las 5 épocas:** **~71.300 triángulos** (ahorra ~81.000 triángulos y mantiene **0 draw calls adicionales**).
3. **Recorte adicional opcional en `ciudad`:** eliminar la plataforma base (ya está el plano de Caracas) y reducir las palmeras a siluetas de 4 hojas o dejar que el sistema nativo `arboles.bin` de [grunch/caracas](https://github.com/grunch/caracas) ponga los árboles del patio.

---

## 5. Lista de verificación (TDD y pruebas en [grunch/caracas](https://github.com/grunch/caracas))

Antes de abrir el PR en [grunch/caracas](https://github.com/grunch/caracas) (según [`AGENTS.md`](https://github.com/grunch/caracas/blob/main/AGENTS.md)):

1. **Pruebas unitarias (`npx vitest run`):**
   - Agregar tests para el hito `capitolio`:
     - `validarHitos(HITOS, plano)` devuelve lista vacía.
     - Vidas excluyentes cubriendo desde época `1` (`1772`) hasta `5` (`1936`) sin huecos ni solapamientos.
     - Progresión de alturas verificada (`1772 > 1843`; `1911/1936 > 1889`).
     - Supresión activa desde época `1` (`suprimirTechos` apaga casas genéricas dentro de la manzana 92 × 108 m en 1772 y 1843, sin afectar cuadras vecinas como la Universidad / San Francisco al sur ni la Casa Amarilla al noreste).
     - Coordenadas y normales finitas; presupuesto de triángulos dentro del límite acordado.
2. **Pruebas E2E (`npx playwright test`):**
   - Renderizar el hito en las 5 épocas (`1772`, `1843`, `1889`, `1911`, `1936`) tanto en modo **color** como en modo **tinta**, verificando transición de ola y calce sobre el relieve.
   - Comprobar el panel de ficha del Capitolio en 1772 (*Convento de las Concepciones*), 1843, 1889, 1911 y 1936.
3. **Suite Python y build:**
   - `.venv/bin/python -m pytest tools/geo/tests -q`
   - `npm run build`
4. **Tamaño del PR (< 3.000 líneas de código):**
   ```bash
   git diff --stat origin/main...HEAD -- . ':(exclude)tests' ':(exclude)tools/geo/tests' ':(exclude)*.md' ':(exclude)specs' | tail -1
   ```
5. **No redistribuir activos de terceros:** confirmar con `git status` que no se copiaron archivos de `miraflores/recursos/congreso/` ni `.glb` dentro de [grunch/caracas](https://github.com/grunch/caracas).

---

## 6. Cómo aplicar este mismo flujo a cualquier otro edificio de `miraflores/`

Para futuros edificios (como **Casa Amarilla**, **Palacio de las Academias / Convento de San Francisco**, **Iglesia de San Francisco** o **Santa Teresa**):

1. **Diseñar en `miraflores/` con ejes compatibles con [grunch/caracas](https://github.com/grunch/caracas):** `+X` a lo largo de `eje` (normalmente `EJE_DAMERO`, este), `+Y` arriba (`y = 0` al pie del edificio), `+Z` a la derecha del eje (sur). Así el adaptador evita giros confusos.
2. **Separar siempre `*-datos.js` (cronología y certeza) de `*.js` (geometría)** y ofrecer `optimizar` + `nivelDetalle: 'estudio' | 'ciudad'`.
3. **No trasladar reformas modernas a los cortes 1772–1936:** si existen fotografías actuales como referencia de volumen, crear una etapa `HITO` aparte en el visor de `miraflores/` para cotejo visual, y pasar a [grunch/caracas](https://github.com/grunch/caracas) únicamente las etapas comprendidas entre `1772` y `1936`.
4. **Validar visualmente antes de integrar:** capturas Playwright por época + revisión de planta sin cubiertas + exportación GLB de respaldo.
5. **Integrar en [grunch/caracas](https://github.com/grunch/caracas) mediante el adaptador al `lienzo.js`** (`src/hitos/<id>-modelo.js` + `src/hitos/<id>.js` + registro en `partes.js` + actualización de `datos/*.js`, `marcas-datos.js`, `fichas-datos.js` y `specs/08-*.md`), siempre en una rama y PR dedicados.
