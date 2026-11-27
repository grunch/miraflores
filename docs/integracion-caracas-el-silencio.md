# El Silencio: estudio e integración en Caracas

Modelo procedimental de la Reurbanización El Silencio de Carlos Raúl Villanueva. El estudio representa **el conjunto inaugurado en 1945**: siete bloques, galerías comerciales, viviendas con balcones, patios, la plaza General Rafael Urdaneta (hoy O’Leary) y la plaza Miranda.

**Integrado en Caracas** con [grunch/caracas#219](https://github.com/grunch/caracas/pull/219), fusionado el 26-11-2026, como vista parcial de 1945 sobre la base de 1936.

## Abrir y revisar

Desde Miraflores: `npm install`, `npm run dev`, abrir `/el-silencio.html`. El visor incluye conjunto, planta, plaza, soportales, balcones, selección individual de los siete bloques, cubiertas y descarga GLB. El enlace «El Silencio · 1945» aparece en la portada. Las capturas están en `docs/capturas/el-silencio-*.png`.

## Fechas y evidencia

- 25 de julio de 1942: comienzo de las demoliciones del barrio anterior.
- 4 de enero de 1943: inicio de las obras de construcción.
- 5 de julio de 1944: inauguración del bloque 7.
- 26 de agosto de 1945: inauguración del conjunto terminado.

Fuentes: [Wikipedia](https://es.wikipedia.org/wiki/Reurbanizaci%C3%B3n_El_Silencio), [Entre Rayas, texto y fotografías de Jesús Yépez](https://entrerayas.com/a-66-anos-de-la-inauguracion-de-la-reurbanizacion-el-silencio/) y [Cámara de Caracas, primer bloque](https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/inauguracion-del-primer-bloque-de-el-silencio/).

La [perspectiva histórica numerada reproducida por Stavros Stavrides, página 2](https://stavrosstavrides.com/wp-content/uploads/2023/07/Housing-Venezuela.pdf) orienta la disposición relativa de los siete bloques, las alas hacia El Calvario y los patios abiertos de los bloques 2 y 3. Las [fotografías históricas de El Archivo](https://elarchivo.org/retratos-hitos-y-bastidores-el-silencio-entre-el-proyecto-y-la-cronica/) y las fotografías de Entre Rayas permiten contrastar la volumetría y los soportales. El [artículo de la Cámara de Caracas sobre Villanueva](https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/villanueva-y-la-reurbanizacion-del-silencio/) describe la diferencia de altura del bloque 1.

## Alcance y límites de la reconstrucción

Se modelan el cuerpo alto del bloque 1 (siete niveles), cuerpos bajos de cuatro niveles, alas y patios diferenciados, columnas ensanchadas, arquerías y galerías adinteladas, comercios retranqueados, balcones proyectados con barandillas y cubiertas planas con pretiles. Las galerías tienen espacio libre real debajo de las viviendas.

**No es un levantamiento:** las longitudes, anchuras, ángulos y distribución exacta de vanos son nominales; la implantación debe ajustarse a cartografía georreferenciada antes de instalarla. El trazado quebrado del bloque 5 simplifica sus curvas y desniveles. Faltan los chaflanes y algunas transiciones de esquina. Los cuerpos se representan a una cota común; no se ha reconstruido la topografía de El Calvario. La vegetación y el mobiliario son interpretativos. Los tonos crema, piedra y carpintería proceden de referencias fotográficas posteriores, **no de un estudio de pigmentos de 1945**.

Las dos fuentes incluyen siluetas alusivas a las esculturas de Francisco Narváez; **no son reproducciones fieles de Las Toninas**. No se han incorporado las torres del Centro Simón Bolívar, el metro ni instalaciones contemporáneas. Las imágenes descargadas en `recursos/el-silencio` son referencias de consulta: no se emplean como texturas ni se presupone permiso para redistribuirlas. Las capturas del modelo son renders propios.

## API reutilizable

Copiar `src/el-silencio.js` y `src/optimizar-panteon.js` juntos a la carpeta de modelos del destino; mantener la importación relativa entre ellos. El generador utiliza Three.js y `BufferGeometryUtils` de la misma instalación. No requiere fotos, texturas remotas ni el visor.

```js
import {crearElSilencio} from './el-silencio.js';
const modelo = crearElSilencio({anio: 1945});
scene.add(modelo.edificio);
// Consultar/seleccionar edificios sin regenerar la urbanización.
const bloque7 = modelo.bloques.find(b => b.userData.id === 7);
// Ocultar cubiertas conservando las fachadas y los patios.
modelo.cubiertas.forEach(g => { g.visible = false; });
```

Devuelve `edificio` (raíz), `bloques` (siete grupos identificados), `cubiertas` (grupos), `plazas`, `entorno`, `huellas` y `anio`. `huellas` describe cada ala mediante extremos locales `a`, `b`, `ancho`, `pisos` y número de bloque. La raíz almacena estos datos y el carácter interpretativo en `userData`.

Coordenadas: **X al este, Z al sur, Y arriba**; unidades en metros nominales. El origen está en el eje de la avenida Bolívar, próximo a la plaza central. No contiene coordenadas WGS84. No asumir que el punto `(0,0,0)` del estudio corresponde al origen del mapa.

`optimizar: true` fusiona geometrías estáticas por material conservando grupos de bloque y de cubierta. Es la opción predeterminada. `optimizar: false` sirve para inspección de piezas. No construir el conjunto en cada frame. Para retirar el modelo, eliminar su raíz y liberar geometrías/materiales una sola vez por recurso compartido.

## Instalar en [grunch/caracas](https://github.com/grunch/caracas)

**Integración fusionada en [grunch/caracas#219](https://github.com/grunch/caracas/pull/219)** (rama `feat/el-silencio-1945`). Se añadió una vista parcial de 1945 sobre la base de 1936; los siete bloques se construyen sobre huellas OSM georreferenciadas, manteniendo el lenguaje arquitectónico del estudio. Se sustituyen 333 casas únicamente desde 1945. La implementación y sus límites están en [`specs/08-el-silencio.md`](https://github.com/grunch/caracas/blob/main/specs/08-el-silencio.md) y el modelo en [`src/hitos/el-silencio.js`](https://github.com/grunch/caracas/blob/main/src/hitos/el-silencio.js). Los pasos siguientes describen los criterios de integración, ya aplicados en ese PR; sirven de referencia para revisiones posteriores. No sustituir el barrio histórico de 1772, 1843, 1889, 1911 o 1936 por estos bloques.

1. Crear una rama limpia desde la rama base actual de Caracas. Añadir primero una época con fecha igual o posterior a 1945 si el destino aún no la tiene. Revisar el registro de épocas, sus índices, rangos de visibilidad, selector, mapas y pruebas: no introducir un índice numérico suelto suponiendo que existe.
2. Copiar el generador y su utilidad de fusión. Registrar un único conjunto histórico `el-silencio` con fecha inicial de conjunto completo en 1945. La API acepta exclusivamente `anio: 1945`; no aplicar automáticamente el mismo estado a décadas posteriores sin revisar sus cambios. Para 1944 haría falta un estado parcial documentado, no el conjunto completo.
3. Localizar la plaza O’Leary, el eje de Bolívar y los límites de cada bloque sobre el mapa de esa época. Transformar las coordenadas locales a las unidades del mapa mediante la misma conversión utilizada por los demás edificios. Ajustar huellas y giros en el generador con datos medidos; una escala uniforme aproximada sirve para una previsualización, no como georreferenciación final.
4. Reservar las huellas de **las siete piezas y las plazas**, no una sola manzana rectangular. Excluir los solares sustituidos del generador colonial en la nueva época para evitar superposición. Conservar sus representaciones antiguas en los mapas anteriores. El grupo `entorno` contiene calles y jardines esquemáticos; mantenerlo para la previsualización y sustituir sus superficies de calle por el trazado real del mapa al integrar. `plazas` puede conservarse como grupo independiente.
5. Añadir la ficha histórica, autoría, fechas y fuentes. Mantener visibles las limitaciones de reconstrucción. Las galerías, balcones y colores deben usar los mismos materiales del estudio; comprobar iluminación, exposición y gestión de color del destino antes de alterar la paleta.
6. Verificar en navegador la ausencia antes de 1942, la incorporación del estado completo desde 1945, la falta de casas duplicadas, las vías libres, patios abiertos, escala, orientación, detalle cercano y coste de renderizado. Comparar capturas del estudio y del mapa con iluminación equivalente. Publicar un PR ready con capturas de conjunto, planta y detalle.

Para una importación GLB, usar «Descargar conjunto GLB». Exporta el conjunto completo incluso si el visor tiene un bloque aislado o las cubiertas ocultas. Se recomienda el generador como fuente editable; el GLB es una instantánea de 1945.
