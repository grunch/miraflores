# Trinidad en 1772: investigación para grunch/caracas#268

Estado: variante de estudio creada en Miraflores; todavía sin integración en Caracas ([issue #268](https://github.com/grunch/caracas/issues/268) abierto). Complementa el
[estudio del Panteón](panteon-nacional.md). No equivale a cerrar el issue.

## Qué cambia respecto al diagnóstico inicial

La fecha de inauguración posterior a 1772 no prueba que solo hubiera cimientos.
Una transcripción atribuida a la visita pastoral de Mariano Martí del 2 de agosto
de 1772 describe un edificio avanzado: fábrica de calicanto y mampostería,
bóvedas, tres naves, tres entradas hacia el sur y dos campanarios sin terminar.
La sacristía tenía espacios altos y bajos y un corredor de tabla y teja.

La transcripción aparece indexada en *Memorias de Venezuela*, especial 56
(julio de 2018), y en la compilación alojada en CLACSO, p.132:

- https://culturavenezuela.com/wp-content/uploads/2023/04/MDV56-WEB.pdf
- https://biblioteca-repositorio.clacso.edu.ar/libreria_cm_archivos/pdf_1524.pdf

Consulta 27-11-2026: se pudo leer el fragmento indexado, pero las descargas
completas fallaron (servidor/403). No se ha inspeccionado la página original del
informe de Martí. La atribución debe mantenerse explícita y no presentarse como
consulta directa del manuscrito. La referencia secundaria
https://lainventadera.com/2026/09/19/el-obrero-que-echo-las-bases-del-panteon-nacional/
remite a Pardo Stolk, *El Panteón Nacional*, pp.26–27; falta comprobar edición y páginas.

## Contraste cartográfico realizado

Se inspeccionó el raster local de PARES de 1772 ya calzado sobre DCN 1936:
`fuentes/derivados/1772/calzado.tif` (derivado que genera el pipeline de [grunch/caracas](https://github.com/grunch/caracas); no está versionado). El JSON declara recorte de origen
(6202,4136), escala 0,5 m/px y RMS del calce 18,73 m. Recorte consultado en
coordenadas del mosaico base: (9000,4900)–(9800,5700).

El sector muestra edificación roja y solares/huertos; permite estudiar ocupación,
pero no alturas de campanarios ni cantidad de cuerpos terminados. Fuente:
https://pares.cultura.gob.es/ParesBusquedas20/catalogo/description/26112
(AGI, MP-VENEZUELA,174, fecha de catálogo 9-7-1772).
No equiparar ese mapa de julio con una visita de agosto sin indicar la diferencia.

## Requisitos de una variante fundamentada

1. No copiar el Panteón neogótico de 1889 ni las tres torres de 1930.
2. No convertir automáticamente 1772 en ruinas: el terremoto es posterior.
3. Representar el volumen abovedado y las dos torres en obra solo después de
   verificar la transcripción. La altura exacta de la obra seguirá siendo una
   aproximación declarada, no un dato del texto.
4. Cotejar la fachada colonial con Bellermann sin asumir que el daño de 1812
   conserva cada detalle de 1772. Ninguna aguja, rosetón ni portada posterior.
5. Medir huella y orientación sobre las fuentes. El ancla actual del Panteón en
   Caracas tiene orientación y dimensiones heredadas, todavía interpretativas.
6. Crear primero la variante en Miraflores, pruebas de fechas/cubiertas y visor;
   después adaptador, reserva y revisión de las seis épocas en Caracas.

La evidencia nueva justifica investigar un edificio avanzado, no inventar una
obra rasa para evitar la investigación. Las proporciones sin fuente se deberán
explicar como decisiones del modelo, separadas de los atributos documentados.


## Verificación de la transcripción y estudio realizado

Se localizó la publicación del propio editor: [Carlos Alfredo Marín, 27-7-2018](https://memoriasdevenezuela.wordpress.com/2018/07/27/la-arquitectura-de-un-pardo-en-la-caracas-colonial/).
El recuadro está incluido como imagen `ccs10.jpg`, por eso no aparecía en el texto
HTML. Se descargó e inspeccionó completo: confirma los atributos descritos arriba.
Ficha y archivo en `recursos/trinidad-1772/`. Se trata de una transcripción editorial,
no de la consulta del manuscrito. La imagen superior muestra ruinas posteriores:
no es una vista del edificio intacto en 1772.

El visor principal admite ahora **1772**. `src/trinidad-1772.js` crea tres cubiertas
abovedadas longitudinales, arcadas interiores, tres accesos al frente sur,
campanarios abiertos sin remates y sacristía posterior con corredor de teja.
El frente central se aproxima mediante el resto colonial dibujado por Bellermann;
no se trasladan agujas, rosetones ni la torre de 1930. Esta extrapolación a 1772
queda declarada, no demostrada por el dibujo de las ruinas.

Las medidas nominales 23×55 m de la nave se heredan del estudio anterior,
no proceden de la visita. Las alturas y el grado de avance de cada campanario,
la disposición de la sacristía, las ventanas y los colores son interpretativos.
La fase solo responde al año 1772; no se prolonga hasta 1781 sin otra investigación.

Capturas y GLB propios en `entregables/trinidad-1772/`; ejecutar el visor con
`npm run dev -- --port 5250` y elegir 1772. Pruebas de límites temporales,
cubiertas, torres y conservación geométrica al agrupar las mallas en
`tests/panteon.test.js`.
