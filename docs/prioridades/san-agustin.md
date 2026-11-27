# Iglesia de San Agustín: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/259. **Estado: integrado en Caracas en 1936 y 1946 ([grunch/caracas#286](https://github.com/grunch/caracas/pull/286), fusionado el 27-11-2026).**

## Evidencia y comparación visual

El [catálogo original del IPC, Lo construido, tomo 2](https://albaciudad.org/wp-content/uploads/2017/01/Libertador-Construido2.pdf), páginas impresas 216–217 (página 110 del PDF), describe construcción de 1924–1930, torre de 32 m y cúpula de 24 m. Se consultó el PDF completo el 27-11-2026. Tres naves, crucero y cabecera se inscriben en un rectángulo; la central duplica la altura de las laterales. La cúpula es rebajada, sobre tambor con óculos. La portada combina cuerpos bajos con balaustradas y una torre central de tres cuerpos, rematada por campanario octagonal.

La foto reproducida por [FAC](https://fundaayc.com/2015/01/08/1930%E2%80%A2-iglesia-san-agustin-santa-rosalia/) permite contrastar arcos y cornisas, pero no tiene fecha de toma: **1930 es la fecha del hecho de la entrada, no una fecha probada de la fotografía**. Licencia no establecida; consulta local sin redistribución.

El constructor independiente `src/patrimonio-san-agustin.js` reemplaza el estudio anterior, que omitía la cúpula y reutilizaba una envolvente genérica. Campanario geométricamente abierto, cubierta octagonal y cúpula a las alturas publicadas. Longitud, ancho, posición exacta del crucero, ocho óculos, alturas nominales de naves (9/18 m), materiales de cubiertas y pigmentos son interpretativos. No se reconstruyen retablos, vitrales figurativos ni pintura interior sin evidencia. La continuidad del alzado entre 1936 y 1946 sigue siendo una aproximación explícita, no una reforma demostrada.

Los recortes del plano DCN de 1936 y del plano basado en fotos de 1946 confirman el recinto al oeste de Los Isleños. Se adopta su contorno dibujado como envolvente cartográfica aproximada, no como mensura de muros o lindes. El frente sur hacia Este 14 se infiere de la dirección del IPC y del eje longitudinal del plano; colegio y casa cural quedan fuera. No añadir la avenida Fuerzas Armadas posterior a estas épocas.

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

Abrir http://127.0.0.1:5250/prioridades.html?edificio=san-agustin&anio=1936. Capturas en [perspectiva](../../entregables/san-agustin-revisada/perspectiva.png), [fachada](../../entregables/san-agustin-revisada/frente.png) y [planta](../../entregables/san-agustin-revisada/planta.png). [GLB de estudio](../../entregables/san-agustin-revisada/san-agustin-1936.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'san-agustin', anio:1936, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Envolvente cartográfica aproximada 32 × 63 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(9775, 8790)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando el constructor independiente `src/patrimonio-san-agustin.js` y sus dependencias, y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente `san-agustin`. Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [FAC: terminación en 1930 y foto histórica](https://fundaayc.com/2015/01/08/1930%E2%80%A2-iglesia-san-agustin-santa-rosalia/).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.

## Validación del estudio revisado

Capturas actuales en `entregables/san-agustin-revisada/` (perspectiva, frente, planta, patio). Prueba geométrica de alturas 24/32 m y rayo que atraviesa el campanario sin una caja maciza; 20 pruebas del catálogo pasan. Sigue pendiente la integración georreferenciada en Caracas y su PR; no se trata la marca existente como huella medida.

## Calce de la planta

La [lectura georreferenciada](san-agustin-georreferencia.json) conserva los cuatro puntos del contorno 1936 y su centro `(9756.5,8777)`. Promedios de lados: aproximadamente 32.47 × 62.73 m. El plano de fotos de 1946 confirma continuidad del recinto, no cada pared interior. La precisión de decimales solo permite reproducir el cálculo; no expresa exactitud de mensura. El nuevo cuerpo nominal mide 30 × 56 m; cornisas y escalones completan una envolvente próxima a 32 × 63 m, sin estirar la altura ni convertir la cúpula circular en elipse. Se conserva margen por el grosor de línea. No se afirma que toda zona blanca sea edificio construido ni que los espacios residuales fueran jardines. La validación urbana deberá cotejar este calce con calles y manzanas antes de publicar.

## Integración en Caracas

Fusionada en [grunch/caracas#286](https://github.com/grunch/caracas/pull/286), fusionado el 27-11-2026 (rama `feat/san-agustin`). Aparece desde índice5 y continúa en6; reserva32×63m, frente sur, sin añadir terraza al shader. Las [capturas comparables de las seis épocas](https://gist.github.com/grunch/e717cc8b4e8e4b2e9319c5886a26e136) son renders propios. Las pruebas urbanas y la medición de rendimiento se documentan en el PR. Datos públicos todavía pendientes de regenerar/publicar con la integración fusionada.
