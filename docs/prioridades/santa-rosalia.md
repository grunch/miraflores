# Iglesia de Santa Rosalía: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/259. **Estado: propuesta en Miraflores; no instalada en Caracas (27-11-2026).**

## Evidencia y comparación visual

Fotografía contemporánea atribuida a Alexandra Blanco / El Nacional: tres portadas, columnas, frontón, balaustrada y torre con cúpula. Se usa como estudio de proporciones; no demuestra que todas las cúpulas existiesen en 1843. Las referencias sitúan reconstrucciones después de 1812 y de 1900. El alzado colonial de 1772 se mantiene indeterminado, sin copiar esta fachada hacia atrás.

Envolvente neoclásica posterior a 1812, con torre lateral y tres accesos. Las fotos modernas guían proporciones, no certifican cada detalle de 1843/1889. La reconstrucción de 1904–1908 y sus cúpulas requieren contraste con vistas fechadas. 1772 queda sin geometría: no se retrotrae esta fachada.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin geometría: evidencia insuficiente | Templo antecedente documentado; alzado colonial sin resolver |
| 1843 | Propuesta visible | Edificio en pie |
| 1889 | Propuesta visible | Edificio en pie |
| 1911 | Propuesta visible | Edificio en pie |
| 1936 | Propuesta visible | Edificio en pie |
| 1946 | Propuesta visible | Edificio en pie |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=santa-rosalia&anio=1911. Capturas en [perspectiva](../../entregables/prioridades/santa-rosalia-perspectiva.png), [fachada](../../entregables/prioridades/santa-rosalia-fachada.png) y [planta](../../entregables/prioridades/santa-rosalia-planta.png). [GLB de estudio](../../entregables/prioridades/santa-rosalia.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'santa-rosalia', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 36 × 48 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(9080, 8545)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Historia de la parroquia y reconstrucciones](https://parroquiasantarosalia.wordpress.com/santa-rosa/).
- [Descripción arquitectónica y fotografía](https://www.urbipedia.org/hoja/Iglesia_de_Santa_Rosal%C3%ADa_%28Caracas%29).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.
