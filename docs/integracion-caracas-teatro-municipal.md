# Teatro Municipal: estudio e instalación en Caracas

## Cronología y referencias

El edificio abrió en **1881**: [Fundarte, 136 años de historia](https://fundarte.gob.ve/web/2017/01/02/teatro-municipal-con-136-anos-de-historia/).
Por ello corresponde a los mapas **1889, 1911 y 1936** (índices 3, 4 y 5). No aparece en 1772 ni en 1843, cuando el sitio estaba vinculado a San Pablo.
La [entrada de Wikipedia](https://es.wikipedia.org/wiki/Teatro_Municipal_de_Caracas) fue el punto de partida, contrastado con Fundarte y fotografías.

La forma contemporánea no sirve para estas épocas: el pórtico semicircular fue demolido en **1949**, documentado por [Fundación Arquitectura y Ciudad](https://fundaayc.com/2026/05/27/). La reforma de 1930 no se convierte aquí en un cambio exterior inventado: las tres épocas comparten la misma envolvente.

Referencias visuales inspeccionadas:

- [Foto de la década de 1880, Commons](https://commons.wikimedia.org/wiki/File:Teatro_municipal3.gif): planta curva, pórtico, ventanas y linterna. Commons atribuye autor desconocido y dominio público; consultar su ficha antes de redistribuir.
- [Postal histórica, Cámara de Caracas](https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/teatro-municipal-un-poco-de-su-historia/): ventanas pareadas del vestíbulo, arcos superiores, óculos, pilastras, cornisas y capiteles.
- Fotografía frontal de 1947 reproducida por Fundación Arquitectura y Ciudad: confirma la persistencia del pórtico anterior a su demolición.
- Plano DCN de 1936, mosaico del proyecto: silueta rayada al sur de San Pablo. Frente al norte, sala ovalada detrás.

Las fotos de Cámara y Fundación tienen licencia de reproducción sin verificar: se conservan como referencias locales en `recursos/teatro-municipal/`, no como texturas ni archivos públicos del sitio. Las capturas del modelo son renders originales.

## Criterio y límites

Modelo procedural exterior: sala elíptica, vestíbulo curvo, peristilo, capiteles simplificados, vanos arqueados, carpinterías, óculos, molduras, cornisa denticulada, techo bajo y linterna. No incluye interiores ni estatua de la plazoleta.

**No es un levantamiento**. Huella nominal ~38 × 65 m y linterna ~24 m. El plano guía centro y orientación, pero el ajuste fino, la altura, la caja escénica y el número exacto de elementos menores son interpretativos. La gama de estuco cálido, piedra clara y cubierta gris verdosa es una decisión visual: una postal coloreada no certifica pigmentos históricos.

## Revisarlo en el estudio independiente de Miraflores

Ejecutar desde el directorio `miraflores`, no desde Caracas:

```sh
npm run dev -- --port 5178
```

Abrir `http://localhost:5178/teatro-municipal.html?anio=1889`. Permite girar, ver fachada/planta/posterior, ocultar cubiertas, cambiar entre 1881/1889/1911/1936 y exportar GLB. La exportación es para estudio: Caracas genera geometría, no descarga ese GLB.

API:

```js
import {crearTeatroMunicipal} from './src/teatro-municipal.js';
const {edificio,cubiertas,etapa}=crearTeatroMunicipal({anio:1889,nivelDetalle:'ciudad'});
```

`+X` apunta al este y `−Z` al frente norte. Origen nominal del cuerpo principal; metros. Años no representados producen `RangeError`. `nivelDetalle: 'ciudad'` reduce segmentos curvos; las proporciones permanecen iguales.

## Instalar en [grunch/caracas](https://github.com/grunch/caracas)

Integrado en [grunch/caracas#218](https://github.com/grunch/caracas/pull/218) (26-11-2026); ver [`src/hitos/datos/teatro-municipal.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/teatro-municipal.js) y [`specs/08-teatro-municipal.md`](https://github.com/grunch/caracas/blob/main/specs/08-teatro-municipal.md). Los pasos siguientes registran el procedimiento aplicado.

1. Copiar `src/teatro-municipal.js` como `src/hitos/teatro-municipal-modelo.js`. Mantener ambas copias sincronizadas. Solo depende de `three`.
2. Crear el adaptador `src/hitos/teatro-municipal.js`: invocar el generador en detalle ciudad, actualizar matrices y pasar cada geometría transformada a `p.geo` con color lineal del material y `MAT.LISO`. Liberar geometrías/materiales originales; el lienzo libera las copias que recibe. No añadir una escena ni un renderer nuevos.
3. Registrar `teatroMunicipal` en `src/hitos/partes.js` y la definición en `src/hitos/datos/civiles.js`.
4. Definición `src/hitos/datos/teatro-municipal.js`: centro nominal `(8350,7697)` píxeles del mosaico DCN, `EJE_DAMERO`; `nace:3`, `muere:0`; una parte compartida. Usar la planta compuesta de sala y vestíbulo para colisiones y una reserva de supresión de 44 × 72 m, centrada 5 m hacia el norte. Incluye el resguardo inmediato para que las casas genéricas no corten el peristilo; no vacía toda la plazoleta.
5. Conservar el identificador `teatro-municipal` de marcas y fichas. Sus nombres de San Pablo siguen vigentes antes de 1889. Actualizar el texto histórico y sus límites. El catálogo de edificios consume los hitos automáticamente.
6. La reserva `sinArboles: planta` retira árboles interiores desde 1889 mediante `suprimirArbolesDeHitos`, al cargar `arboles.bin` con `reservas: HITOS`. Conserva árboles anteriores, posiciones y semillas, y no modifica el paquete. Evita que un antiguo árbol de patio atraviese el peristilo. El hito hereda relieve, aparición temporal, tinta/color y geometría agrupada del lienzo común. Comprobar que las casas genéricas no atraviesan el teatro y que no aparece antes de 1881.
7. Validar tests de geometría y épocas, build y pruebas del navegador. Comparar las mismas cámaras en 1772/1843/1889/1911/1936 antes y después. Medir rendimiento en main y rama con `tests/e2e/medir-rendimiento.mjs`.
8. Las reservas offline de hitos pueden invalidar pasos del generador: ejecutar `npm run datos:al-dia` y registrar si hace falta regenerar. No modificar ni publicar paquetes generados sin ejecutar las verificaciones del pipeline. La geometría del teatro se entrega en JavaScript, no requiere un GLB en el release de datos.

La integración se desarrolla en una rama limpia, separada de cambios locales ajenos. Abrir PR **ready**, con capturas antes/después y límites explícitos; no fusionarlo automáticamente.

## Evidencia visual de la integración

[Galería de capturas originales](https://gist.github.com/grunch/fbbe30713c85b1665531972dfe974c19): estudio, fachada, planta y comparación antes/después de 1772, 1843, 1889, 1911 y 1936. Cámara de ciudad: `{x:-330,z:440,dist:160,yaw:3.6,pitch:0.65}`, 1280 × 800, Chromium con ANGLE/OpenGL en RTX 2060.

Antes de ajustar la agrupación temporal de árboles, 1772 y 1843 dieron cero diferencias. La comparación final registra **25 píxeles de borde diferentes de 1.024.000 (0,0024 %)** en cada una: se conservan las manzanas y no aparece el teatro. En las otras tres épocas se revisó el pórtico original, las ventanas, la linterna y la retirada de casas que atravesaban su reserva. También se verificaron tinta, ocultación de cubiertas en el estudio y exportación GLB. Es una comprobación del agente con Playwright y lectura de capturas, no una prueba manual del responsable.

El catálogo distingue el nacimiento del edificio de la marca del lugar: San Pablo se mantiene desde 1772, pero «Teatro Municipal» abre su modelo en 1889. El mismo criterio corrige el año de apertura del catálogo para los modelos existentes de Universidad y Santa Capilla; sus marcas y geometrías no cambian.

No existe `tools/geo/reglas_mapa.py` en la base de este PR: no se atribuyen mediciones a esa herramienta pendiente. El paquete geográfico se conserva; la supresión de casas se aplica al cargar los hitos.
