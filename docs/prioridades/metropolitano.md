# Circo Metropolitano: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/257. **Estado: integrado en Caracas en 1911 y 1936 ([grunch/caracas#284](https://github.com/grunch/caracas/pull/284), fusionado el 27-11-2026).**

## Evidencia y comparación visual

Fotos FAC de fachada, una fechada 1906: cinco accesos enrejados rectangulares, pilastras, cornisa y frontones curvos. Se corrigieron los vanos inicialmente arqueados después de comparar el render. El diámetro documentado del ruedo es 36 m; no convierte la huella exterior nominal en un levantamiento. No se usó como guía principal la imagen de 1906 cuya identificación como Metropolitano fue cuestionada en comentarios.

Ruedo de 36 m citado en la referencia; fachada de rejas y frontones contrastada con fotografías. Huella total, colores y graderío interpretativos. Demolición fechada en 1942 o 1945 según fuente: ausente en 1946.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1889 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1911 | Propuesta visible | Edificio en pie |
| 1936 | Propuesta visible | Edificio en pie |
| 1946 | Sin modelo: no corresponde | Demolido antes de esta época |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=metropolitano&anio=1911. Capturas en [perspectiva](../../entregables/prioridades/metropolitano-perspectiva.png), [fachada](../../entregables/prioridades/metropolitano-fachada.png) y [planta](../../entregables/prioridades/metropolitano-planta.png). [GLB de estudio](../../entregables/prioridades/metropolitano.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'metropolitano', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 60 × 68 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(7905, 7905)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Fachadas de 1906 y cronología](https://fundaayc.com/category/crono-arquitectura-venezuela/1940-1949/1945/).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.

## Calce preparado para Caracas

Lectura del mosaico DCN 1936, recorte 7500,7500–8350,8350: centro (7909,7895), eje horizontal [-.98,-.2], frente a la calle al norte. Radio exterior nominal 29 m; margen visual estimado ±3 m. El ruedo conserva 36 m de diámetro. Adaptador en `src/hitos/metropolitano.js`, modelo extraído y primitivas compartidas con Nuevo Circo. Vida [4,6), colisiones anulares y reserva estricta de círculo + portada; terraza 58 × 66 m. El plano de 1911 confirma el símbolo anular en la misma cuadra; la diferencia esquemática de unos 22 m no demuestra traslado ni ampliación. Continuidad declarada como hipótesis.

## Acceso al ruedo (revisión de PR #284)

Se representa la puerta central abierta y se reserva un paso axial entre la calle y el ruedo. El corte de las gradas, de unos 3,5 m en su extremo interior, es una interpretación funcional del modelo: las fotografías documentan las puertas, pero no permiten reconstruir la distribución interior de los accesos. No debe citarse como una medida histórica. Las gradas laterales conservan colisiones. La supresión de casas y árboles sigue cubriendo el solar completo, incluido el paso.

La regresión comprueba el recorrido con `pasoAPie` en 1911 y 1936 y un rayo a 1,7 m de altura verifica que la geometría visible tampoco tapa ese recorrido.
