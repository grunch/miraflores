# Puente de Hierro · Regeneración: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas. La cronología de las fichas (Constitución en 1889, Sucre metálico en 1911, Sucre de concreto desde 1936 y la sustitución del de Hierro en 1937) ya se corrigió en [grunch/caracas#281](https://github.com/grunch/caracas/pull/281); los modelos 3D siguen sin instalar.

Vigas inferiores, columnas y barandas según grabado histórico. Nueve apoyos intermedios documentados; longitud total, altura y pigmentos de este estudio son nominales. La sustitución de 1937 impide reutilizar este modelo en 1946.

## Comparación con referencias

El grabado muestra baranda, vigas trianguladas bajo el tablero, columnas y estribos. Se omiten los chaguaramos del modelo exportable: pertenecen al paisaje, no a la estructura. No se exporta una estructura de 1875 como puente de 1946.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | Existe el cruce | hierro | Puente de Hierro · estructura anterior a 1937 |
| 1911 | Existe el cruce | hierro | Puente de Hierro · estructura anterior a 1937 |
| 1936 | Existe el cruce | hierro | Puente de Hierro · estructura anterior a 1937 |
| 1946 | Existe el cruce | Sin geometría | Puente sustituto de 1937 · alzado pendiente |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=hierro&anio=1889&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/hierro-perspectiva.png), [alzado](../../entregables/puentes-guaire/hierro-alzado.png), [GLB](../../entregables/puentes-guaire/hierro.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'hierro',anio:1889,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
