# Puente Dolores: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas.

Armaduras superiores, arriostramiento y tablero de madera. Luz 60 m, ancho 8 m y tablero a 5 m sobre el río: medidas históricas citadas. Las reformas desde 1915 y la desaparición posterior requieren otras variantes; la estructura de 1911 no se prolonga automáticamente.

## Comparación con referencias

Se comparó la foto con portal trapezoidal, cordón superior elevado y travesaños superiores. El modelo permite ver el entramado al ocultar el tablero. No se atribuyen automáticamente a 1936 las dimensiones de 1911.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1911 | Existe el cruce | dolores | Puente Dolores · antes de las reformas de 1915 |
| 1936 | No resuelto | Sin geometría | Estructura de 1911 retirada; estado del cruce por documentar |
| 1946 | No resuelto | Sin geometría | Estructura de 1911 retirada; estado del cruce por documentar |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=dolores&anio=1911&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/dolores-perspectiva.png), [alzado](../../entregables/puentes-guaire/dolores-alzado.png), [GLB](../../entregables/puentes-guaire/dolores.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'dolores',anio:1911,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
