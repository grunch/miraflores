# Puente 19 de Diciembre: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas.

Vigas inferiores: tramo central de 30 m y dos laterales de 15 m. Pilas de concreto. Se modela el núcleo de tres vanos; los accesos adicionales del alzado publicado no están incluidos. Ancho, detalle de barandas y cotas verticales interpretativos.

## Comparación con referencias

El alzado de 1910 distingue el vano central triangulado y los laterales de vigas. El modelo separa ambos sistemas. Se excluyen las prolongaciones de acceso: falta levantar su alineación y rasante.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1911 | Existe el cruce | diciembre | Estructura documentada hacia 1911 |
| 1936 | No resuelto | Sin geometría | Reformas posteriores · variante no restituida |
| 1946 | No resuelto | Sin geometría | Reformas posteriores · variante no restituida |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=diciembre&anio=1911&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/diciembre-perspectiva.png), [alzado](../../entregables/puentes-guaire/diciembre-alzado.png), [GLB](../../entregables/puentes-guaire/diciembre.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'diciembre',anio:1911,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
