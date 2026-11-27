# Nuevo Circo: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/257. **Estado: integrado en Caracas en 1936 y 1946 ([grunch/caracas#283](https://github.com/grunch/caracas/pull/283), fusionado el 27-11-2026).**

## Evidencia y comparación visual

Foto histórica FAC: torres simétricas, pequeñas cúpulas con linterna abierta, tres accesos inferiores, balcones, arco central y alas laterales. La cubierta del redondel no se ejecutó según Cámara de Caracas: el ruedo permanece abierto. Se corrigió la orientación de las normales de las cúpulas al revisar las capturas. Número de gradas, profundidad y radio son interpretativos.

Dos torres, balcones, pórtico y remate central según foto histórica. Ruedo abierto: la cubierta total proyectada no se ejecutó. Dimensiones y pigmentos nominales, no levantamiento.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1889 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1911 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1936 | Propuesta visible | Edificio en pie |
| 1946 | Propuesta visible | Edificio en pie |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=nuevo-circo&anio=1936. Capturas en [perspectiva](../../entregables/prioridades/nuevo-circo-perspectiva.png), [fachada](../../entregables/prioridades/nuevo-circo-fachada.png) y [planta](../../entregables/prioridades/nuevo-circo-planta.png). [GLB de estudio](../../entregables/prioridades/nuevo-circo.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'nuevo-circo', anio:1936, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 84 × 94 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(10330, 8230)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Fachada histórica de inauguración](https://fundaayc.com/category/crono-arquitectura-venezuela/1910-1919/1919/).
- [Historia y cubierta no ejecutada](https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/el-nuevo-circo-de-caracas/).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.

## Adaptación a Caracas (PR #283)

Centro contrastado en DCN 1936: `(10316,8234)` px, portada al noroeste. La integración ajusta planta y portada, añade cubierta con espesor, reserva temporal y plataforma del solar para despejar el ruedo. Usa 26.398 triángulos y conserva una sola geometría para 1936/1946. Detalles y límites en `caracas/docs/nuevo-circo-integracion.md`; no copiar la huella nominal del estudio sin ese ajuste.
