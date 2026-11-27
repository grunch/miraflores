# San Juan Bautista · Capuchinos: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/259. **Estado: propuesta en Miraflores; no instalada en Caracas (27-11-2026).**

## Evidencia y comparación visual

Directorio parroquial: fachada de tres accesos con balcones y torre lateral. La guía histórica sitúa obras entre 1841 y 1868. El estudio solo muestra la envolvente terminada desde 1889; en 1843 informa obra sin inventar un porcentaje de avance. Debe fecharse cada detalle del alzado con imágenes anteriores a su integración en el mapa.

Estudio de fachada de tres accesos, balcones y torre lateral. El estado exacto de obra de 1843 no está probado: no se muestra el templo terminado. Medidas, color y persistencia de todos los adornos desde 1889 son hipótesis para revisar antes de integrar.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin geometría: evidencia insuficiente | Obras del templo: avance exacto sin documentar |
| 1889 | Propuesta visible | Edificio en pie |
| 1911 | Propuesta visible | Edificio en pie |
| 1936 | Propuesta visible | Edificio en pie |
| 1946 | Propuesta visible | Edificio en pie |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=san-juan&anio=1911. Capturas en [perspectiva](../../entregables/prioridades/san-juan-perspectiva.png), [fachada](../../entregables/prioridades/san-juan-fachada.png) y [planta](../../entregables/prioridades/san-juan-planta.png). [GLB de estudio](../../entregables/prioridades/san-juan.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'san-juan', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 37 × 48 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(6935, 8335)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Guía histórico-cultural: obras 1841–1868](https://bibliodor.wordpress.com/wp-content/uploads/2012/03/parroquia-san-juan.pdf).
- [Referencia exterior de la parroquia](https://arquidiocesis-caracas-directorio.webnode.es/arciprestazgo-de-san-juan-bautista/san-juan-bautista/).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.
