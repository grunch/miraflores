# Santísima Trinidad / Panteón Nacional

Estudio independiente para las épocas de Caracas: **1772, 1843, 1889, 1911 y 1936**. Las variantes de 1843–1936 ya están integradas en [grunch/caracas](https://github.com/grunch/caracas) ([grunch/caracas#87](https://github.com/grunch/caracas/pull/87), 20-11-2026); la de 1772 se prepara por separado ([issue #268](https://github.com/grunch/caracas/issues/268)). Las cinco variantes tienen geometría diferente; no son cambios de nombre sobre una misma fachada.

## Cronología y criterio visual

- **1781**: inauguración de la iglesia (consagración en 1783 según Fundación Arquitectura y Ciudad). La página de Wikipedia del Panteón menciona 1780; se adopta 1781 siguiendo la referencia específica de la iglesia y FAC. No hay aquí un modelo de la iglesia intacta: no se debe deducir su forma completa de las ruinas.
- **1812–1874 / mapa 1843**: ruinas de la iglesia, fachada colonial central con pilastras y volutas, acceso de medio punto, arcadas abiertas y naves sin cubierta. El dibujo de Bellermann es la referencia directa para 1843. No se reproduce el arco efímero del recibimiento de los restos de Bolívar de 1842. El estado de ruina se usa como aproximación fuera del año documentado, sin simular las reconstrucciones parciales de las décadas siguientes.
- **1875–1910 / mapa 1889**: Panteón inaugurado el 28 de octubre de 1875; decreto de conversión de 1874. Dos torres con agujas, tres portales ojivales, rosetón circular central y pináculos. Referencia: fotografía de Federico Lessmann catalogada por El Archivo como 1885–1900. Su uso para el año exacto 1875 es una extrapolación; para 1889 el rango sí resulta compatible.
- **1911–1929 / mapa 1911**: reforma de Alejandro Chataing terminada en 1911. Se conservan dos torres, pero cambia el cuerpo central: ventana ojival en lugar de rosetón, coronación horizontal sobre los cuerpos laterales y nueva crestería. Se compararon el alzado del concurso y la fotografía de la obra terminada publicados por FAC; un proyecto por sí solo no demuestra lo construido.
- **1930–1936 / mapa 1936**: reforma de Manuel Mujica Millán, fachada neobarroca con torre central más alta, dos torres laterales menores y remates cupulados. Se adopta 1930 como fecha de disponibilidad, no 1929 (fecha de proyecto/trabajos en otras fuentes). No se añaden el Foro Libertador de 1980–1983 ni el Mausoleo de 2013.

El generador admite el año1772 y el intervalo1812–1936. Fuera de ellos lanza un error: no se prolonga la obra de1772 hasta la inauguración. Véase [investigación y variante1772](trinidad-1772-investigacion.md).

## Referencias descargadas e inspeccionadas

Se conservan en `recursos/panteon/` como apoyo interno. No se incluyen en `dist/`, ni se incorporan como texturas del modelo. Licencias de reproducción no verificadas: no asumir que se pueden publicar las fotografías por estar accesibles en Internet.

| Archivo | Fuente y atribución | Uso |
|---|---|---|
| `trinidad-1844.webp` | [Villegas Editores, La ruta de Humboldt](https://www.100libroslibres.com/la-ruta-de-humboldt-tomo-1-caracas), dibujo de Ferdinand Bellermann fechado 1844 | Fachada colonial y ruinas |
| `panteon-siglo-xix.jpg` | [El Archivo, registro 27613](https://elarchivo.org/producto/panteon-nacional/), Federico Lessmann, circa 1885–1900 | Rosetón, agujas, portales y molduras anteriores a Chataing |
| `panteon-chataing-1911.jpg` | [FAC, concurso de 1910](https://fundaayc.com/2019/01/01/1910-remodelacion-integral-del-panteon-nacional/), alzado de Alejandro Chataing | Propuesta de reforma, cotejada con fotografía |
| `fac-colonial-y-1875.png` | [FAC, Postal 191](https://fundaayc.com/2019/12/15/algo-mas-sobre-la-postal-no-191/), imagen 1, procedencia IAM Venezuela | Bellermann y vista distante anterior a la conversión; la foto no permite resolver toda la fachada de 1875 |
| `fac-vista-1911.jpeg` | Misma página, imagen 2, colección FAC | Volumetría en el paisaje |
| `fac-fachada-1911.jpg` | Misma página, imagen 3, colección Crono Arquitectura Venezuela | Obra terminada de Chataing: ventana ojival central |
| `fac-reforma-1930.png` | Misma página, imagen 5, collage con distintas procedencias indicadas por FAC | Torre central, proporciones relativas y fachada de Mujica |
| `panteon-reforma.jpg` | [Cámara de Caracas, Biografía del Panteón](https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/biografia-del-panteon-nacional/) | Postal de la fachada posterior a la reforma; fecha de toma no establecida |

Página de recopilación aportada por el usuario: https://fundaayc.com/tag/panteon-nacional/ . Consulta: 20 de noviembre de 2026. El dibujo colonial también está catalogado en [`fuentes/imagenes/1843-commons-ruinas-de-la-trinidad-bellermann/ficha.json`](https://github.com/grunch/caracas/blob/main/fuentes/imagenes/1843-commons-ruinas-de-la-trinidad-bellermann/ficha.json) (Commons, circa 1842–1845).

## Alcance del modelo

Modelo procedural original, no fotogrametría. Fachadas guiadas por imágenes; planta, laterales, daños, materiales, escalas y cubiertas son interpretativos. Huella adoptada de aproximadamente 23 × 55 m, siguiendo la estimación del hito existente en Caracas, **no una medición**. La torre de 1930 es una aproximación a la altura de 46 m citada por FAC. Faltan escultura, inscripciones, texturas de desgaste, distribución interior comprobada y ajuste georreferenciado. Los vanos del Panteón usan superficies oscuras; las arcadas de las ruinas sí son abiertas.

## Uso e integración futura

```js
import {crearPanteon} from './panteon.js';
const {edificio, cubiertas, etapa} = crearPanteon({anio: 1843});
escena.add(edificio);
```

Y vertical; +Z apunta a la fachada; origen al centro longitudinal de la nave a cota de terreno. `cubiertas` permite inspeccionar la planta. `etapaPanteon(anio)` entrega la etapa, con final exclusivo. Para los índices de Caracas: 2 → 1843, 3 → 1889, 4 → 1911, 5 → 1936; no pasar el índice como año.

Antes de integrar: resolver la huella, orientación, terreno, materiales de época y reducción de draw calls. En Caracas, la marca ya comienza en 1843, pero el hito en `src/hitos/datos/iglesias.js` comienza en época 3 y tiene dos torres en todas las épocas: habrá que reemplazar esa geometría y resolver la aparición del edificio en época 2.

Los GLB en `entregables/` incluyen únicamente el edificio de cada etapa, sin suelo del visor ni luces. Los rangos son anuales: no se simulan fechas dentro del año de inauguración ni meses de obra.

## Validación realizada

- `npm run build`: correcto; Vite advierte del tamaño del bundle de Three.js (>500 kB).
- `node --test tests/panteon.test.js`: dos pruebas correctas (límites de etapas, cubiertas, torre central y coordenadas finitas).
- Playwright: cambio entre las cuatro épocas, exportación de los cuatro GLB y regreso a Miraflores, sin errores JavaScript. Capturas de escritorio y móvil en `entregables/`.
- Inspección visual de las capturas; corregidos muros centrales que sobresalían de la cubierta y encuadre móvil. Los modelos detallados aún necesitan optimización antes de incorporarlos al mapa de ciudad.

## Segunda pasada de detalle

Se cotejaron nuevamente las imágenes locales de Lessmann, el alzado de Chataing y el collage de la reforma de 1930:

- Agujas neogóticas con nervios y diagonales; campanas esquemáticas en 1889; molduras de frontones, trébol central y arcatura decorativa.
- Remates ornamentales diferenciados en 1911, con pilastras y arcos ciegos. Las proporciones de los detalles pequeños siguen siendo interpretativas.
- Portales laterales adintelados en 1936, coronamientos curvos y cúpulas modeladas por perfil de revolución. Los nervios de cúpula son una simplificación, no un levantamiento.
- Volutas espirales en el frente colonial.

El cambio de año conserva ahora la cámara para comparar las fachadas. El visor enlaza la referencia correspondiente sin publicar las imágenes descargadas.

### Optimización y controles reproducibles

`crearPanteon({anio, optimizar: true})` fusiona las piezas hermanas del mismo material, conservando los grupos y el interruptor de cubiertas. Es la opción predeterminada. Para editar piezas individuales, usar `optimizar: false`. Esta fusión no reduce la cantidad de triángulos: antes de colocar muchos edificios todavía conviene preparar niveles de detalle.

Pruebas de equivalencia comprueban triángulos, límites espaciales y reducción de mallas en las cuatro variantes. En el visor de escritorio, la variante de 1911 pasó de 1.849 a 47 llamadas de dibujo; 1889 de 1.807 a 47; 1936 de 867 a 125; 1843 de 301 a 39. Son mediciones de esta escena, no una medición del mapa de Caracas.

- `node --test tests/panteon.test.js`: cuatro pruebas, correctas (incluida la variante de 1772).
- `npm run build`: correcto; se mantiene la advertencia de tamaño del bundle.
- Con el servidor en el puerto 5174, `npm run validar:visor` regenera capturas de perspectiva, fachada, móvil y los cuatro GLB. Puede cambiarse el origen con `VISOR_URL`. El script usa Playwright disponible en las dependencias compartidas del entorno; una instalación independiente debe instalarlo y descargar Chromium.

Integración: 1843–1936 fusionadas en [grunch/caracas#87](https://github.com/grunch/caracas/pull/87) ([`src/hitos/panteon.js`](https://github.com/grunch/caracas/blob/main/src/hitos/panteon.js), [`specs/08-panteon-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-panteon-por-epocas.md)). La fase de 1772 sigue pendiente: ver la [guía de instalación](instalacion-trinidad-1772-caracas.md).
