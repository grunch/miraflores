# Guía de integración en [grunch/caracas](https://github.com/grunch/caracas): Iglesia de San Francisco por épocas (1772–1936)

Este documento describe **cómo integrar modelos procedurales de `miraflores/` en [grunch/caracas](https://github.com/grunch/caracas)** y detalla el paso a paso exacto para sustituir el hito genérico actual de la **Iglesia de San Francisco** por sus variantes históricas en las **cinco épocas del mapa (`1772`, `1843`, `1889`, `1911` y `1936`)**.

> **Estado actual:** integrado en [grunch/caracas#184](https://github.com/grunch/caracas/pull/184) (24-11-2026). Ver [`src/hitos/datos/san-francisco.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/san-francisco.js) y [`specs/08-san-francisco-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-san-francisco-por-epocas.md). Esta guía queda como registro del procedimiento; los números de línea citados corresponden al estado del repositorio antes de la integración.

---

## 1. Ficha técnica e histórica del edificio para [grunch/caracas](https://github.com/grunch/caracas)

| Campo | Valor de referencia en [grunch/caracas](https://github.com/grunch/caracas) |
|---|---|
| **ID del hito y marca** | `san-francisco` |
| **Nombre oficial y popular** | Iglesia de la Inmaculada Concepción · **Iglesia de San Francisco** |
| **Ubicación** | Avenida Universidad, entre esquinas de **San Francisco** (este) y **La Bolsa** (oeste), contigua al antiguo Convento de San Francisco (`universidad` / Palacio de las Academias) y frente al Capitolio (`capitolio`) |
| **Ancla en mosaico 1936 (0,5 m/px)** | `x: 8768, y: 7198` (pie de la fachada norte), `eje: SUR` (`[-0.1659, 0.9861]`) |
| **Huella en `datos/iglesias.js`** | `largo: 62 m` (a lo largo de `eje`, norte → sur), `ancho: 19 m` (en `san-francisco.js`: `19,6 m`; en `1772`/`1843` el campanario oeste asoma ~4 m hacia `+b`, colindando con el antiguo convento) |
| **Corrección histórica clave frente al hito genérico actual** | El hito genérico de [`src/hitos/datos/iglesias.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/iglesias.js) dibuja la misma fachada clásica **con una torre campanario en todas las épocas (1772–1936)**. En realidad: **(a)** en **1772 y 1843** tenía la **portada barroca de 1745** (un solo portal arqueado) y una **torre-espadaña oeste de tres arcos con chapitel piramidal** (documentada por la litografía de ca. 1845); **(b)** desde **1888–1889** la reforma de **Juan Hurtado Manrique** sustituyó la portada por una **fachada neoclásica/neobarroca de tres puertas, óculo circular, volutas y frontón curvo partido SIN torre campanario**. |
| **Hitos históricos de la ficha** | Fundación franciscana (1574–1578); traza de Antonio Ruiz de Ullán (1587–1593); terremoto de 1641; esculturas genovesas de mármol (1655); reforma de 1745 (Fray Andrés Vélez); resistencia al terremoto de 1812; proclamación de Simón Bolívar como *Libertador* (6 de agosto de 1813); disolución del convento (1837); exequias de Bolívar (17 de diciembre de 1842); plantación de la Ceiba de San Francisco (ca. 1866); nueva fachada de Juan Hurtado Manrique (1887–1889); administración jesuita (1922); restauración de Luis Malaussena (1953) y Monumento Histórico Nacional (1956). |

---

## 2. Transformación exacta de ejes al marco de [grunch/caracas](https://github.com/grunch/caracas)

En [`src/hitos/datos/iglesias.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/iglesias.js), la Iglesia de San Francisco se ancla en el **pie central de su fachada norte** (`x: 8768, y: 7198`) con `eje = SUR`:
- **`+a`** avanza **62 m hacia el Sur** (entrando por la nave desde la fachada hasta el testero plano).
- **`+b`** apunta hacia el **Oeste** (hacia la Universidad / Palacio de las Academias); **`-b`** apunta hacia el **Este** (Esquina de San Francisco).

En `miraflores/src/san-francisco.js`, el modelo está centrado en `(0, 0, 0)` con:
- **`+Z` = Norte** (plano de la fachada en `z = +31`, fondo en `z = -31`).
- **`+X` = Oeste** (lado del convento y del campanario colonial de 1745).
- **`-X` = Este** (lado de la Esquina de San Francisco).

Por lo tanto, el adaptador en [grunch/caracas](https://github.com/grunch/caracas) aplica **exactamente la misma transformación de una línea usada en `src/hitos/panteon.js`**:

```js
const q = p.en(31, 0, 0, -Math.PI / 2)
```

Verificación de los 4 puntos cardinales bajo `q = p.en(31, 0, 0, -Math.PI / 2)` (`(a, h, b) = (31 - z, y, +x)`):
- Fachada Norte `(x = 0, z = +31)` → `(a = 0, b = 0)` — **exactamente sobre el ancla `(8768, 7198)`**.
- Testero plano Sur `(x = 0, z = -31)` → `(a = +62, b = 0)` — **exactamente al fondo de la nave**.
- Costado Oeste / campanario 1745 `(x = +9.8..+13.8, z = +31)` → `(a = 0, b = +9.8..+13.8)` — **exactamente hacia el Convento / Universidad al oeste**.
- Costado Este `(x = -9.8, z = +31)` → `(a = 0, b = -9.8)` — **exactamente hacia la Esquina de San Francisco al este**.

---

## 3. Presupuesto medido de triángulos (muy liviano para [grunch/caracas](https://github.com/grunch/caracas))

Conteos medidos directamente en `crearSanFrancisco`:

| Época | Descripción | Modo `estudio` | Modo `ciudad` (sin Ceiba ni plataforma) |
|---|---|---:|---:|
| `1772` | Portada barroca 1745 + campanario oeste | 13.628 tri | **6.460 tri** |
| `1843` | Post-1812 (ca. 1845) + contrafuertes | 13.700 tri | **6.532 tri** |
| `1889` | Reforma Hurtado Manrique (sin torre) | 15.734 tri | **7.002 tri** |
| `1911` | Envolvente Hurtado Manrique | 15.734 tri | **7.002 tri** |
| `1936` | Envolvente Hurtado Manrique (ocre-gris) | 15.770 tri | **7.002 tri** |
| **Total 5 tramos** | `[1,2), [2,3), [3,4), [4,5), [5,0)` | 74.566 tri | **33.998 tri** |
| **Total 3 tramos (recomendado)** | `[1,2)` 1772 · `[2,3)` 1843 · `[3,0)` 1889–1936 | — | **19.994 tri** |

> **Recomendación de rendimiento:** como la geometría exterior de Hurtado Manrique no cambia entre `1889`, `1911` y `1936`, usar **3 tramos de vida** (`1772`, `1843`, `1889–1936`) añade apenas **~20.000 triángulos** al buffer único de `hitos` con **0 draw calls adicionales**. Si además se desea reflejar el matiz cromático crema (`1889`) → ocre (`1936`), usar 4 o 5 tramos sigue costando solo ~27k–34k triángulos en total.

---

## 4. Pasos exactos de integración en [grunch/caracas](https://github.com/grunch/caracas)

### Paso 1 · Crear rama en [grunch/caracas](https://github.com/grunch/caracas)
```bash
cd caracas   # clon de https://github.com/grunch/caracas
git checkout main && git pull
git checkout -b feat/san-francisco-por-epocas
```

### Paso 2 · Copiar los módulos del modelo a [`src/hitos/`](https://github.com/grunch/caracas/tree/main/src/hitos)
Copiar desde `miraflores/`:
- `miraflores/src/san-francisco-datos.js` → [`src/hitos/san-francisco-datos.js`](https://github.com/grunch/caracas/blob/main/src/hitos/san-francisco-datos.js)
- `miraflores/src/san-francisco.js` → [`src/hitos/san-francisco-modelo.js`](https://github.com/grunch/caracas/blob/main/src/hitos/san-francisco-modelo.js)

Ajustes mínimos al copiar `san-francisco-modelo.js`:
1. Quitar el `import { optimizarPanteon }` y el bloque `if (optimizar) { ... }` (el `lienzo.js` de [grunch/caracas](https://github.com/grunch/caracas) ya fusiona todos los hitos en una sola malla).
2. Cambiar el import relativo a `import { etapaSanFrancisco } from './san-francisco-datos.js'`.
3. Mantener `conCeiba: false` cuando `nivelDetalle === 'ciudad'` para **no duplicar** la Ceiba de San Francisco que gestiona la capa de árboles (`datos/arboles.bin`).

### Paso 3 · Crear el adaptador [`src/hitos/san-francisco.js`](https://github.com/grunch/caracas/blob/main/src/hitos/san-francisco.js)
```js
import { crearSanFrancisco } from './san-francisco-modelo.js'
import { MAT } from './lienzo.js'

/**
 * Vuelca el modelo por épocas de la Iglesia de San Francisco al lienzo común de hitos.
 * +Z del modelo es el norte (fachada en z = +31); en datos/iglesias.js el ancla está
 * al pie de esa fachada y +a entra hacia el sur: p.en(31, 0, 0, -Math.PI / 2).
 * La Ceiba se omite en ciudad para no solaparse con datos/arboles.bin.
 */
export function sanFrancisco(p, { anio }) {
  const { edificio } = crearSanFrancisco({ anio, optimizar: false, nivelDetalle: 'ciudad', conCeiba: false })
  const geometrias = new Set()
  const materiales = new Set()
  const q = p.en(31, 0, 0, -Math.PI / 2)
  edificio.updateMatrixWorld(true)
  try {
    edificio.traverse((objeto) => {
      if (!objeto.isMesh) return
      geometrias.add(objeto.geometry)
      materiales.add(objeto.material)
      q.geo(objeto.geometry.clone().applyMatrix4(objeto.matrixWorld), {
        color: objeto.material.color.toArray(),
        mat: MAT.LISO,
      })
    })
  } finally {
    geometrias.forEach((g) => g.dispose())
    materiales.forEach((m) => m.dispose())
  }
}
```

### Paso 4 · Registrar la parte `'sanFrancisco'` en [`src/hitos/partes.js`](https://github.com/grunch/caracas/blob/main/src/hitos/partes.js)
1. Importar al inicio:
   ```js
   import { sanFrancisco } from './san-francisco.js'
   ```
2. Registrar dentro de `export const PARTES = Object.freeze({ ... })`:
   ```js
   sanFrancisco(p, medidas) { sanFrancisco(p, medidas) },
   ```

### Paso 5 · Sustituir la definición genérica en [`src/hitos/datos/iglesias.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/iglesias.js)
Reemplazar la entrada `san-francisco` (líneas 27–34 de `src/hitos/datos/iglesias.js`) conservando el ancla `(8768, 7198)` y `eje: SUR`:

```js
  Object.freeze({
    id: 'san-francisco',
    nombre: 'Iglesia de San Francisco',
    x: 8768,
    y: 7198,
    eje: SUR,
    nace: 1,
    muere: 0,
    // Incluye 20 m de ancho de la nave; en 1772–1843 el campanario oeste se enlaza con el antiguo convento
    planta: [rectanguloPx({ x: 8768, y: 7198, eje: SUR }, 62, 20, 31, 0)],
    suprime: [rectanguloPx({ x: 8768, y: 7198, eje: SUR }, 62, 20, 31, 0)],
    fuente:
      `${PLANO} (rótulo "Iglesia San Francisco"); plano de Mestre de 1889 (templo VII); ` +
      'litografía de ca. 1845 (fuentes/imagenes/1845-commons-iglesia-de-san-francisco); ' +
      'estudio por épocas en miraflores/docs/iglesia-san-francisco.md y specs/08-san-francisco-por-epocas.md.',
    verificar: [
      '1772 y 1843 reproducen la portada barroca colonial de 1745 (un portal, nichos con las esculturas genovesas de 1655 y frontón triangular) y el campanario de tres arcos al oeste según la litografía de ca. 1845.',
      'Desde 1889 se representa la fachada neoclásica/neobarroca de Juan Hurtado Manrique (1887–1889), con tres puertas, óculo circular, volutas, frontón curvo partido y sin torre campanario.',
      'Verificar el encaje en el límite oeste (+b) entre el campanario colonial de 1772–1843 y el solar del hito universidad (antiguo Convento de San Francisco).',
      'La Ceiba de San Francisco (plantada hacia 1866) no se duplica en la malla del hito; revisar si aparece en datos/arboles.bin.',
    ],
    // Opción recomendada (3 tramos = 19.994 triángulos; usar 5 tramos si se desean matices de color en 1889/1911/1936)
    partes: [
      { tipo: 'sanFrancisco', anio: 1772, nace: 1, muere: 2 },
      { tipo: 'sanFrancisco', anio: 1843, nace: 2, muere: 3 },
      { tipo: 'sanFrancisco', anio: 1936, nace: 3, muere: 0 },
    ],
  }),
```

*(Si se prefieren las 5 etapas separadas con evolución cromática crema → ocre, declarar `1772 [1,2)`, `1843 [2,3)`, `1889 [3,4)`, `1911 [4,5)`, `1936 [5,0)` — total `33.998` triángulos.)*

### Paso 6 · Actualizar [`src/fichas-datos.js`](https://github.com/grunch/caracas/blob/main/src/fichas-datos.js) (y revisar `marcas-datos.js`)
En [`src/fichas-datos.js`](https://github.com/grunch/caracas/blob/main/src/fichas-datos.js), enriquecer la ficha `san-francisco` (líneas 92–98):

```js
  'san-francisco': {
    textos: [
      [1, 'La iglesia de la Inmaculada Concepción, anexa al convento franciscano (nombrado ya en 1578 y trazado por Antonio Ruiz de Ullán hacia 1587–1593). Reconstruida tras el terremoto de 1641 y reformada en 1745, luce una portada barroca de un solo portal con las tres esculturas genovesas de mármol (1655) y un campanario de tres arcos en su costado oeste.'],
      [2, 'Resistió en pie el terremoto de 1812. Aquí Bolívar recibió el título de Libertador en 1813 y se celebraron sus exequias en 1842. Una litografía de hacia 1845 muestra su portada barroca de tres calles, el campanario oeste con chapitel de teja y, a su derecha, el frente bajo del antiguo convento.'],
      [3, 'Templo VII en el plano de 1889. Entre 1887 y 1889 Juan Hurtado Manrique remodeló por completo la fachada por encargo de Guzmán Blanco: suprimió el campanario, abrió tres puertas rectangulares, reubicó las estatuas de 1655 bajo un gran óculo circular y coronó el conjunto con volutas y un frontón curvo partido.'],
      [5, 'En el plano de 1936 aparece como «Iglesia San Francisco», bajo custodia jesuita desde 1922, frente a la ya centenaria Ceiba de San Francisco y contigua a la Universidad Central.'],
    ],
    hoy: 'la Iglesia de San Francisco (Monumento Histórico Nacional desde 1956), junto al Palacio de las Academias y la Ceiba de San Francisco.',
    dudas: 'Alzados laterales de 1772, contrafuertes post-1812 y matices cromáticos de 1889–1936 son interpretativos. La restauración interior de Luis Malaussena (1953) es posterior al último mapa.',
  },
```

### Paso 7 · Especificación y plan en [`specs/`](https://github.com/grunch/caracas/tree/main/specs)
- Crear [`specs/08-san-francisco-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-san-francisco-por-epocas.md) siguiendo el formato de `specs/08-panteon-por-epocas.md`.
- Actualizar la fila correspondiente en [`specs/07-plan-de-implementacion.md`](https://github.com/grunch/caracas/blob/main/specs/07-plan-de-implementacion.md).

---

## 5. Lista de comprobación antes de abrir el PR en [grunch/caracas](https://github.com/grunch/caracas)

1. **Pruebas unitarias (`npx vitest run`):**
   - `validarHitos(HITOS, plano)` sin errores.
   - Vidas excluyentes cubriendo `[1, 2)`, `[2, 3)` y `[3, 0)` (o hasta `[5, 0)`).
   - Comprobar que en `1772` y `1843` el hito tiene mayor ancho hacia `+b` (campanario oeste) y que desde `1889` desaparece el campanario frontal y sube el frontón partido central (`y ≈ 18 m`).
   - Comprobar encaje sin choque visual con `universidad` (hito adyacente al oeste) y con `capitolio` al norte.
   - Verificar presupuesto de triángulos de la malla `hitos` (ajustando el umbral de regresión si corresponde, documentándolo en `specs/08-san-francisco-por-epocas.md`).
2. **Pruebas E2E (`npx playwright test`):**
   - Capturas en `1772`, `1843`, `1889`, `1911` y `1936` en modo **color** y **tinta** mirando hacia el sur desde la esquina de San Francisco / Capitolio, validando la transición de la portada barroca de 1745 a la fachada de Hurtado Manrique en 1889.
3. **Suite geo y build:**
   - `.venv/bin/python -m pytest tools/geo/tests -q`
   - `npm run build`
4. **Límite de tamaño del PR (< 3.000 líneas de código, [`AGENTS.md`](https://github.com/grunch/caracas/blob/main/AGENTS.md)):**
   ```bash
   git diff --stat origin/main...HEAD -- . ':(exclude)tests' ':(exclude)tools/geo/tests' ':(exclude)*.md' ':(exclude)specs' | tail -1
   ```
5. **Higiene de licencias:** verificar con `git status` que no se incluyen imágenes externas ni binarios `.glb` en el repositorio destino.
