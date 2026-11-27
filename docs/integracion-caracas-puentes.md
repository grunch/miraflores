# Instalar los puentes del Guaire en Caracas

Los modelos se revisan primero en [el catálogo de Miraflores](puentes-guaire/README.md).
No son edificios sobre un terreno plano: **no reutilizar sin adaptar el anclaje vertical
por vértice de las casas**. Este paso es necesario para conservar una rasante coherente.

## Archivos y contrato

Copiar `src/puentes-guaire.js`, `src/puentes-guaire-datos.js` y
`src/patrimonio-geometria.js` a un módulo de hitos, manteniendo sus imports relativos.
Dependencias: Three y BufferGeometryUtils. No cargar GLB ni otro renderer en producción.

```js
import {crearPuente} from './puentes-guaire.js';
const estudio=crearPuente({id:'sucre',anio:1911,nivelDetalle:'ciudad'});
if (estudio.etapa.modelo) {
  // Convertir meshes al lienzo de Caracas únicamente después del calce y rasante.
}
```

Salida: `edificio`, `tablero`, `etapa`, `ficha`, `metadatos`. +X longitudinal,
+Y vertical; origen horizontal al centro. La altura `cotaTablero` se refiere al datum
nominal del estudio. `tablero` es una capa separada que permite inspeccionar la estructura;
no equivale a la capa de tejados del mapa ni debe desaparecer al ocultar techos de casas.

## Calce, cotas y entorno

1. Crear rama desde main actualizado; leer AGENTS, reglas de construcción y referencias.
2. Digitalizar por época las dos cabezas, eje y huella del puente en su plano. Mantener
   evidencia de píxeles originales, transformación, error y fuente. La marca Sucre en
   `(9710,9430)` y Hierro en `(9430,9440)` son anclas aproximadas del mosaico, no mediciones.
3. Ajustar el eje +X a las dos cabezas. Registrar pendiente del tablero y cota absoluta
   de ambos accesos. Ajustar longitud de apoyos hasta el terreno o lecho; no deformar
   barandas, armaduras ni tablero con el muestreo individual del relieve.
4. El adaptador debe conservar posiciones y normales al convertir los meshes a `p.geo`.
   Usar materiales del lienzo y sus colores lineales; las piezas tienen volumen, no
   dependen de materiales de doble cara. Mantener grupos para estudiar por separado
   apoyos, tablero y estructura antes de fusionarlos.
5. No vaciar toda la manzana ni rectificar el río. Reservar solo huella y accesos medidos,
   con sus fechas; conservar jardines, casas y chaguaramos ajenos al tablero.
6. Definir partes por estructura: Constitución en 1889 y Sucre metálico en 1911.
   Para 1936/1946 el cruce Sucre existe pero falta el modelo de concreto. Hierro cambia
   en 1937. No usar `presente` como prueba de disponibilidad de geometría: comprobar
   `etapa.modelo`; `null` no es autorización para borrar el cruce del mapa.
7. Conservar nombre y fecha de estructura como campos distintos. El puente 19 de Diciembre
   no debe recibir automáticamente su nombre posterior 9 de Diciembre.

## Verificación y entrega

Comparar cámaras idénticas en las seis épocas, vistas de costado y desde el cauce,
color/tinta, terreno y transición temporal. Probar alturas de estribos, continuidad
con la calle y ausencia de casas o árboles dentro del paso. Medir geometría y FPS
con el script del repo al integrar; el agrupamiento de materiales no mide FPS.

Regenerar reservas/datos afectados y publicarlos por el flujo de Caracas, sin binarios
en git. PR ready, ≤3000 líneas de código, fuentes y capturas; no cerrar #272 mientras
falten cruces o etapas de su alcance.

## Límites del estudio

Dimensiones no citadas, espesores, ornamentación y colores son interpretativos.
Las guías individuales identifican la evidencia utilizada. El Paraíso reconstruido,
Bolívar/Los Leones y sustituciones no documentadas visualmente siguen pendientes.
Los recursos de terceros son de consulta, no texturas ni fotografías redistribuidas.
