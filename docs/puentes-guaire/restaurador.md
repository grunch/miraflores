# Puente Restaurador: estudio previo e instalación

Issue [#272](https://github.com/grunch/caracas/issues/272). Modelo en Miraflores, todavía sin instalación en Caracas.

Paseo con plazoleta central y veinte faroles. Largo 100,50 m y ancho 8 m documentados. Radio de plazoleta, apoyos y ornamentación simplificada interpretativos. Las reparaciones de 1932 no permiten asegurar una restitución idéntica en las fechas posteriores.

## Comparación con referencias

La referencia muestra un paseo bajo con faroles y ensanche central. El modelo abre las barandas hacia los dos bordes de la plazoleta; no pone una barrera atravesando el paseo. No reproduce cada arabesco de fundición.

## Épocas

| Año | Presencia | Modelo | Interpretación |
|---|---|---|---|
| 1772 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1843 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1889 | No corresponde | Sin geometría | Este puente todavía no existe |
| 1911 | Existe el cruce | restaurador | Estructura documentada hacia 1911 |
| 1936 | No resuelto | Sin geometría | Reformas posteriores · variante no restituida |
| 1946 | No resuelto | Sin geometría | Reformas posteriores · variante no restituida |

`presente:true` con `modelo:null` significa que el cruce existía pero este estudio no restituye su estructura. No reservar un vacío por falta de modelo.

## Revisar y exportar

[Visor](http://localhost:5182/puentes-guaire.html?edificio=restaurador&anio=1911&detalle=ciudad), [perspectiva](../../entregables/puentes-guaire/restaurador-perspectiva.png), [alzado](../../entregables/puentes-guaire/restaurador-alzado.png), [GLB](../../entregables/puentes-guaire/restaurador.glb).

## Instalación

Seguir la [guía común](../integracion-caracas-puentes.md). Importar `crearPuente({id:'restaurador',anio:1911,nivelDetalle:'ciudad'})`. Las unidades son metros de estudio; +X longitudinal, +Y vertical. El centro está en el eje del cruce, no en la cabeza del puente. El datum y=0 no es una cota geográfica.

Antes de instalar: medir ambos estribos en cada plano, orientación, ancho de cauce y rasante. Ajustar las dimensiones interpretativas, sin escalar las documentadas arbitrariamente. Anclas de marcas existentes no son linderos ni elevaciones. Para un puente, seguir el terreno en cada vértice deformaría el tablero: requiere elevación común y apoyos ajustados por separado.

## Fuentes

- [Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42](https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural).
- [Fotografías históricas reproducidas por FAC](https://fundaayc.com/2023/10/15/sabia-usted-107/).

Las fotografías consultadas quedan en `recursos/puentes-guaire` con fines de referencia, fuera del build y de los paquetes entregables. Licencia de reproducción no establecida. Renders y geometría procedural propios.
