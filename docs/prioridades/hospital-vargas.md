# Hospital Vargas — issue #249

Issue: https://github.com/grunch/caracas/issues/249. **Estado: propuesta en Miraflores; el modelo no está instalado en Caracas (27-11-2026).** La ficha de Caracas ya distingue las obras de 1889 ([#236](https://github.com/grunch/caracas/pull/236)).

Estudio previo de un pabellón hospitalario para 1889, 1911, 1936 y 1946. En el selector de `prioridades.html`, el Hospital Vargas aparece con los demás modelos de patrimonio.

## Evidencia que guía el modelo

- El plano de Mestre de 1889 identifica el Hospital Vargas con el número 43 y dibuja un conjunto de pabellones. El calce revisado en Caracas sitúa el recorte en `[9000, 4000, 10200, 5100]` de las coordenadas base; la ficha del mapa resta el origen `[6399, 2305]`. La planta se usa para separar pabellones, no para afirmar que todo estaba terminado.
- La [Guía de Caracas](https://guiaccs.com/obras/hospital-vargas/) atribuye el proyecto al ingeniero Jesús Muñoz Tébar y describe un hospital de una planta, orientado norte-sur, con acceso al oeste, núcleo central y dos alas, una para hombres y otra para mujeres. Describe dos filas de cinco salas en cada ala, separadas por un jardín largo. Su área publicada (19.800 m²) no se usa para escalar cada pieza del modelo.
- El grabado del [Cojo Ilustrado de enero de 1892](https://www.libroria.com/museo/obras/El%20Cojo%20Ilustrado/1892/pdf/CI_18920101.pdf), p. 12, identifica el interior como departamento de mujeres y muestra el patio longitudinal con salas y galerías enfrentadas. Solo se conserva el enlace; la imagen no se copia al proyecto.
- Roger Escalona, en la [Sociedad Venezolana de Historia de la Medicina](https://revista.svhm.org.ve/ediciones/2006/1-2/art-3), registra la inauguración del 1 de enero de 1891 y la entrada de pacientes en julio. La etapa de 1889 se rotula “en obras”; no se inventa porcentaje, estructura incompleta ni andamiaje.
- Caracas en 450 resume reformas desde 1930: sustitución de techos de madera ojivales por platabandas, cambios de pisos y reformas de las capillas norte y sur. El estudio solo cambia las cubiertas a planas desde 1936; no reproduce reformas interiores que el visor no representa.
- El reporte médico de 1953 registra los pabellones Carlos J. Bello y Ángel Larralde (1939), además del pabellón para lactantes (1939). Las fuentes consultadas no fijan su posición dentro del predio; por eso no se dibujan como anexos geolocalizados. Esto queda pendiente para #249.

## Límites

Las medidas del edificio, la posición exacta dentro del solar, el acabado de las fachadas, la forma de las cubiertas y el diseño de las galerías son interpretativos. El modelo generaliza la planta que sí muestra el mapa y las descripciones del esquema de pabellones; no atribuye al grabado de 1892 dimensiones ni rasgos invisibles. El estado de 1946 conserva el conjunto conocido con cubierta plana: no pretende inventariar cada adición hospitalaria.

## Archivos del estudio

- `src/patrimonio-hospital-vargas.js`: composición del núcleo, las dos alas y sus salas, jardín y cubierta por época.
- `src/patrimonio-prioritario.js`: registro del constructor.
- `src/patrimonio-prioritario-datos.js`: ficha, cronología y fuentes.
- `tests/prioridades.test.js`: presencia temporal, estado de obras en 1889, alas, cubierta y dimensiones nominales.

## Instalación en [grunch/caracas](https://github.com/grunch/caracas)

La rama de integración debe partir de `main` vigente y no debe cerrar #249 hasta localizar o descartar con evidencia las ampliaciones aceptadas por el issue.

1. Copiar `src/patrimonio-hospital-vargas.js` a `src/hitos/hospital-vargas.js` y adaptar la construcción a las primitivas de hitos, relieve y materiales compartidos de Caracas.
2. Enlazar el constructor desde `src/hitos.js` y su vida en `src/hitos/partes.js`. Conservar la presencia física desde 1889, con estado de obra, y las cubiertas planas desde 1936. No inventar la ubicación de los anexos de 1939.
3. Georreferenciar la huella con el raster de 1889/1911 y el sistema de coordenadas del proyecto; el rótulo actual `(9660, 4640)` es una marca, no el centro medido del solar.
4. Añadir una ficha de evidencia por época y reservas para suprimir casas/árboles solamente donde el contorno cartográfico las respalde. Mantener las manzanas vecinas fuera de la huella.
5. Ejecutar pruebas de unidad y Playwright para las seis épocas visibles, guardar capturas del antes y después con la misma cámara, comparar las reglas de construcción de todas las épocas y medir carga/geometría. En 1578 revisar plano y medición aunque no sea visible en la línea de tiempo.
6. Verificar visualmente colisiones, continuidad entre pabellones, cubiertas y suelo con relieve; actualizar esta guía con las rutas y mediciones reales del PR.

## Verificación local

`npm test` y `npm run build` validan el estudio en Miraflores. Las capturas de este modelo se deben revisar con los mapas originales y el grabado enlazado antes de integrar. El grabado histórico solo está enlazado: sus derechos de redistribución no se presumen.
