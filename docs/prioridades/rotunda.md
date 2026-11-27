# La Rotunda: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/258. **Estado: integrado en Caracas ([grunch/caracas#285](https://github.com/grunch/caracas/pull/285), fusionado el 27-11-2026).**

## Evidencia y comparación visual

Foto exterior atribuida a Jorge Peña en Caracas en Retrospectiva: fachada austera con vanos rectos y garita saliente; Polar describe patio de 24 m, dos niveles y celdas radiales dentro de muros cuadrados. El estudio incluye dos recintos norte/sur; su separación y alzado son nominales, no una restitución métrica de la ampliación de 1881. Corrección de lectura: el n.º 28 de Mestre es un circo; la cárcel es el n.º 30, sin patios dibujados. Nunca usar ese n.º 28 para georreferenciar La Rotunda.

Patio de 24 m, celdas en dos niveles, muros exteriores y cuerpo de guardia. La ampliación norte se representa a partir del proyecto de 1881 y la documentación posterior de dos patios. Falta comprobar la fecha exacta de terminación: su presencia ya en 1889 se mantiene como hipótesis, no como apertura fechada. El n.º 30 del plano de 1889 localiza la cárcel pero no dibuja sus patios. Alturas y guardia interpretativas. El estado cartográfico de 1936 se representa como solar libre; el día efectivo del derribo no está establecido.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1889 | Propuesta visible | Recinto penitenciario anterior a la demolición |
| 1911 | Propuesta visible | Recinto penitenciario anterior a la demolición |
| 1936 | Sin cárcel; solar libre | Estado observado en el plano DCN de 1936 |
| 1946 | Sin modelo: no corresponde | Cárcel demolida; el solar ya no corresponde a este modelo |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=rotunda&anio=1911. Capturas en [perspectiva](../../entregables/prioridades/rotunda-perspectiva.png), [fachada](../../entregables/prioridades/rotunda-fachada.png) y [planta](../../entregables/prioridades/rotunda-planta.png). [GLB de estudio](../../entregables/prioridades/rotunda.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'rotunda', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 77 × 46 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(8660, 8560)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Descripción del recinto y cronología](https://bibliofep.fundacionempresaspolar.org/dhv/entradas/l/la-rotunda/).
- [Fachada e interior históricos](https://mariafsigillo.blogspot.com/2012/02/la-rotunda-y-plaza-de-la-concordia.html).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.

## Actualización de contraste, 27-11-2026

Se verificó `origin/main` ffaec48 y los PRs fusionados: solo existe la marca,
no un modelo de la cárcel. El estudio previo de un recinto era incompleto y se
amplió a dos, con centros nominales (-19,0)/(19,0) y patios de24m.
El n.º39 de Razetti1911 es Cárcel Pública; el n.º40 inmediato al norte es
Cuartel del Hoyo, que no forma parte del modelo. Mestre1889 separa igualmente
la parcela30 de la29; sus dibujos no muestran patios interiores.

La [cronología de Polar](https://bibliofep.fundacionempresaspolar.org/_custom/static/cronologia_hv/zoom/s20/1936-15.html)
registra una resolución de demolición en abril1936 (Gaceta18.921), sin precisar
día en esa celda. El recorte DCN1936 (8400,8250)–(8950,8850) muestra el solar
mayormente libre y un cuerpo en el lado oriental: no se debe deducir una cárcel
íntegra por la mera fecha de las fotos aéreas de marzo. Subsiste una discrepancia
con una referencia a decreto de enero1937 pendiente de cotejo. La integración representa el solar libre observado en el plano, sin atribuir un día de derribo. Véase [la guía de La Concordia](concordia.md) para la transición a 1946.


### Frente hacia Sur 2

La transcripción del decreto publicada por Caracas en Retrospectiva sitúa la
cárcel en Sur2, entre Hospital y La Cárcel. En los planos, ese es el borde oeste
del solar. Los dos patios norte/sur se disponen por ello a lo largo de X local,
con +Z hacia el frente occidental al instalar. La guardia ocupa el lado largo;
la garita se coloca junto al acceso hacia el extremo sur. Distribución y medidas
exactas del cuerpo de guardia interpretativas. La foto con vanos arqueados y dos
pisos (`referencia-1.jpg`) no se usa para sustituir la fachada de garita: su lado
y fecha no están establecidos y difiere de la vista titulada La Rotunda.

Integración en Caracas: [grunch/caracas#285](https://github.com/grunch/caracas/pull/285), fusionado el 27-11-2026. [Capturas propias de estudio e integración](https://gist.github.com/grunch/0ffb2840e77443183db2185b3986dcb2).
