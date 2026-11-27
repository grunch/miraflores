# La Concordia de Villanueva: estudio e instalación

Issue [#258](https://github.com/grunch/caracas/issues/258). Estudio creado en Miraflores; **integrado en Caracas ([grunch/caracas#285](https://github.com/grunch/caracas/pull/285), fusionado el 27-11-2026)**.
No corresponde a la plaza remodelada de 1961 ni a su estado actual.

## Evidencia

- [Plano DCN, fotografías de 1946](https://archive.org/details/WCWdb_18051), edición catalogada [1950?]: jardines longitudinales y elemento circular central. El inmueble al este queda fuera de la plaza. Se usa la calibración existente de Caracas, no una coordenada obtenida de la marca antigua.
- [Fotografías históricas reproducidas en Caracas en Retrospectiva, 4-02-2012](https://mariafsigillo.blogspot.com/2012/02/la-rotunda-y-plaza-de-la-concordia.html): templete circular, pilares exteriores rectangulares, columnas interiores, alero y cubierta de poca pendiente, bancos y setos. Una postal acredita edición de Ora Chapellín; fechas de toma y licencia no establecidas. Consulta local en `recursos/rotunda-concordia/`, no redistribuir imágenes.
- [Polar, Carlos Raúl Villanueva](https://bibliofep.fundacionempresaspolar.org/media/1280009/200_educadores_vnzlns_lw.pdf): cronología de la plaza en 1940 (página 265 del PDF, sección dedicada a Villanueva; consultada completa el 27-11-2026). Su presencia en 1946 se apoya además en el plano. No se anticipa a 1936.

Las fotografías no son planos: dimensiones, ocho pilares y ocho columnas,
disposición de bancos y especies vegetales son interpretativos. El mapa permite
aproximar contorno y posición del templete, no reconstruir cada parterre al centímetro.

## Ver y exportar

Abrir `prioridades.html?edificio=concordia&anio=1946`, usar los botones de vista
y descargar GLB. El selector también permite comparar con La Rotunda. El modelo
se construye mediante `construirConcordia` de `src/patrimonio-concordia.js`;
`crearPatrimonio({id:'concordia',anio:1946,nivelDetalle:'ciudad'})` agrupa sus mallas.

Las capturas propias están en `entregables/concordia/`. La fase es exclusiva
para 1946 en las épocas disponibles; las pruebas impiden su aparición en 1936.

## Instalar en Caracas

1. Copiar el constructor a `src/hitos/concordia-modelo.js`, reutilizando el taller del Nuevo Circo. El adaptador usa el lienzo compartido; no cargar GLB ni crear otro renderer.
2. Ancla de estudio: (8595,8478), eje [.98,.2] en píxeles del mosaico DCN1936. Rectángulo nominal 44×124 m; centro del templete local (2,-7), próximo al círculo del mapa. Error visual aproximado varios metros, no catastro.
3. Registrar `concordia` con vida [6,0), reserva de la franja occidental y colisión solo del basamento del templete. No suprimir el edificio oriental. Reemplazar los árboles genéricos interiores por la vegetación del jardín para evitar solapes.
4. Registrar por separado `rotunda` [3,5) y `solar-rotunda` [5,6). La cárcel ocupa solo su parcela sur, no el Cuartel del Hoyo. El solar reproduce la zona libre del plano de 1936 sin inventar ruinas ni un templete prematuro.
5. Añadir marcas/fichas, pruebas de vida/colisiones/reservas y comparación de las seis épocas. Medir geometría, carga y build; adjuntar capturas al PR ready y atender revisiones antes de fusionar.
6. Tras fusión, regenerar/publicar los derivados que consuman HITOS según el procedimiento de Caracas. No cerrar el issue hasta verificar todo su alcance.

## Precisión del calce

Con `tools/geo/mapa_1946.py:calibrar`, el círculo inspeccionado en el original
(6573,5682) se transforma aproximadamente a (8601.7,8465.2). El contorno leído
produce esquinas próximas a (8578,8347), (8665,8365), (8614,8610), (8523,8591).
Se aproxima con el rectángulo nominal; no se confunden coordenadas del original
con las del mosaico base. La licencia del escaneo consta como dudosa en su ficha;
solo los renders propios acompañan el PR.

Integración en Caracas: [grunch/caracas#285](https://github.com/grunch/caracas/pull/285), fusionado el 27-11-2026. [Capturas propias de estudio e integración](https://gist.github.com/grunch/0ffb2840e77443183db2185b3986dcb2).
