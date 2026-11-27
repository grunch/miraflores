# Puente Ayacucho: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas.

Arcos de concreto, montantes abiertos y balaustrada según fotografía histórica. Modelo de proporciones interpretativas; no se trasladan las ampliaciones viales actuales. Debe medirse la luz y el perfil de cada vano antes de instalar.

## Comparación con referencias

La fotografía histórica muestra dos arcos de concreto, montantes abiertos y baranda superior. Se comparó el alzado, no solo la perspectiva. Arcos parabólicos aproximados: no son un cálculo ni el perfil levantado del original.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1911 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1936 | Existe el cruce | ayacucho | Puente Ayacucho · posterior a 1924 |
| 1946 | Existe el cruce | ayacucho | Puente Ayacucho · posterior a 1924 |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=ayacucho&anio=1936&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/ayacucho-perspectiva.png), [alzado](../../entregables/puentes-guaire/ayacucho-alzado.png), [GLB](../../entregables/puentes-guaire/ayacucho.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'ayacucho',anio:1936,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).
- [FAC: inauguración de 1924](https://fundaayc.com/2022/09/08/1924-inauguracion-del-puente-ayacucho/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
