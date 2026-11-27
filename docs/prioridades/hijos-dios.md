# Cementerio de los Hijos de Dios: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/250. **Estado: modelo integrado en Caracas ([grunch/caracas#287](https://github.com/grunch/caracas/pull/287), fusionado el 27-11-2026).** Las marcas y fichas se habían añadido antes ([#234](https://github.com/grunch/caracas/pull/234) y la corrección cronológica [#280](https://github.com/grunch/caracas/pull/280)).

## Evidencia y comparación visual

Fotografías y pinturas reproducidas en Contexturas: nichos superpuestos, muros altos, cipreses y vegetación de abandono. No se ha identificado evidencia suficiente para la capilla independiente que incluye el estudio antiguo. El plano de 1889 lo rotula Concepción. La equivalencia de nombres está corroborada en el Boletín de la Academia Nacional de la Historia, 2009, n.º 365, https://biblat.unam.mx/hevila/BoletindelaAcademiaNacionaldelaHistoriaCaracas/2009/vol92/no365/5.pdf. La revisión conserva tres recintos y entrantes del plano1936; debe comprobarse su calce urbano en cada época antes de instalar. Las sepulturas son tipologías, no tumbas identificadas.

Tres recintos con cuatro hileras de nichos, cipreses y sepulturas dispersas. Se retiró la capilla independiente no documentada. Contorno aproximado1936, con topología cotejada en1889/1946; no catastro individual de tumbas. En todas las épocas visibles posteriores a 1856 ya se representa como recinto cerrado al uso, no desaparecido.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1889 | Propuesta visible | Recinto cerrado al uso, con estructuras todavía en pie |
| 1911 | Propuesta visible | Recinto cerrado al uso, con estructuras todavía en pie |
| 1936 | Propuesta visible | Recinto cerrado al uso, con estructuras todavía en pie |
| 1946 | Propuesta visible | Recinto cerrado al uso, con estructuras todavía en pie |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=hijos-dios&anio=1911. Capturas en [perspectiva](../../entregables/hijos-dios-revisado/perspectiva.png), [fachada](../../entregables/hijos-dios-revisado/frente.png) y [planta](../../entregables/hijos-dios-revisado/planta.png). [GLB de estudio](../../entregables/hijos-dios-revisado/hijos-dios.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'hijos-dios', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Envolvente orientativa170 × 68m; el solar es poligonal, no rectangular. Constructor independiente `src/patrimonio-hijos-dios.js`. Esta envolvente: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(8700, 3690)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando `src/patrimonio-hijos-dios.js` y `src/patrimonio-hijos-dios-planta.js`, ajustando su import relativo y creando la factoría/adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Pinturas y fotografías de los nichos](https://contexturas.org/el-cementerio-de-los-hijos-de-dios/).
- [Apertura, cierre y demolición](https://fundaayc.com/2018/02/09/1951-desaparece-el-cementerio-de-los-hijos-de-dios/).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.

## Revisión cartográfica 27-11-2026

[Digitalización aproximada del plano1936](hijos-dios-georreferencia.json), cotejada con1946: tres recintos contiguos, sector occidental prolongado hacia el norte y borde noreste escalonado. Se reemplazaron el rectángulo98×116m, la capilla y la distribución del estudio antiguo. Los enlaces anteriores apuntan ahora a los renders y GLB revisados. El plano1889 conserva tres compartimientos, pero difiere en proporciones: no se deduce una obra de esa diferencia sin corroboración. Los puntos digitalizados tienen precisión gráfica, no catastral.

Verificación local: dos pruebas específicas y20 pruebas de patrimonio pasan. El test de recinto falló primero sobre el modelo antiguo. Se inspeccionaron perspectiva y planta contra los recortes1936/1946; el entrante noreste queda sin suelo. Capturas con errores de navegador vacíos. Altura5,5m, espesores, ancho de entrada4m, dimensiones de nichos, sepulturas y árboles son interpretativos. El arco visto en una fotografía no se sitúa sin evidencia de su ubicación. El recinto central tiene una abertura sur sin ornamentación atribuida. No hay una reforma documentada para variar geometría entre1889 y1946; las diferencias gráficas se declaran como límite.

### Apoyo en Caracas

La vista de estudio usa suelo plano para inspeccionar la planta. La integración debe apoyar el recinto en la ladera por vértice, subdividiendo las caras extensas (4m), sin aplanar todo el sector. La malla gruesa del terreno puede cruzar el pavimento fino; ocultar solo el interior poligonal durante la vida del hito y tras levantarse por completo. Conservar el terreno original fuera de su contorno, antes de1889 y con los edificios acostados. Esto requiere pruebas urbanas además de los renders del estudio.
