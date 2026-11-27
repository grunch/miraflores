# Constitución / Sucre: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas. La cronología de las fichas (Constitución en 1889, Sucre metálico en 1911, Sucre de concreto desde 1936 y la sustitución del de Hierro en 1937) ya se corrigió en [grunch/caracas#281](https://github.com/grunch/caracas/pull/281); los modelos 3D siguen sin instalar.

Dos estructuras en el mismo cruce de la calle Sur 7: Constitución en 1889 y Sucre metálico en 1911. Sucre: luz documentada de 60 m; ancho y altura interpretativos. Desde 1936 existe el sustituto de concreto, cuyo alzado falta: no se conserva aquí el puente metálico trasladado.

## Comparación con referencias

El alzado fotografiado tiene cordón superior poligonal y montantes sobre el tablero. El estudio distingue esa forma del tablero bajo del Constitución. El sustituto de concreto no se dibuja sin alzado. Las referencias difieren 1925/1930, ambas anteriores a 1936.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | Existe el cruce | constitucion | Puente Constitución · estructura anterior |
| 1911 | Existe el cruce | bowstring | Puente Sucre · estructura metálica de 1895 |
| 1936 | Existe el cruce | Sin geometría | Puente Sucre de concreto · alzado pendiente |
| 1946 | Existe el cruce | Sin geometría | Puente Sucre de concreto · alzado pendiente |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=sucre&anio=1911&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/sucre-perspectiva.png), [alzado](../../entregables/puentes-guaire/sucre-alzado.png), [GLB](../../entregables/puentes-guaire/sucre.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'sucre',anio:1911,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
