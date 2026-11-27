# Iglesia de San José: estudio y guía de instalación

Issue: https://github.com/grunch/caracas/issues/259. **Estado: propuesta en Miraflores; no instalada en Caracas (27-11-2026).**

## Evidencia y comparación visual

Foto moderna: fachada de dos órdenes, frontón y torre lateral. El catálogo fotográfico de FESIP aporta una referencia histórica a revisar a resolución completa. Fundación de parroquia en 1889 no equivale a terminación del alzado: ese año queda indeterminado. Los daños de 1900 y su reparación necesitan cotejo; la variante 1911 es una propuesta de estudio, no una fachada certificada.

Estudio de envolvente con fachada de dos órdenes y torre lateral. 1889 es fecha parroquial y no se usa como prueba de esta fachada terminada. Falta fechar las reparaciones posteriores al sismo de 1900; el alzado propuesto no está listo para instalación histórica automática.

## Matriz de épocas

| Año | Respuesta del generador | Criterio |
|---|---|---|
| 1772 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1843 | Sin modelo: no corresponde | Todavía no existe en esta época |
| 1889 | Sin geometría: evidencia insuficiente | Parroquia creada; fecha del alzado por verificar |
| 1911 | Propuesta visible | Edificio en pie |
| 1936 | Propuesta visible | Edificio en pie |
| 1946 | Propuesta visible | Edificio en pie |

Los años con propuesta visible no certifican cada detalle. Se comparte geometría donde no hay una reforma suficientemente descrita; eso evita inventar variaciones pero no prueba que el edificio fuese idéntico. Las fases inciertas no se convierten en edificios acabados ni en ruinas aleatorias.

## Ver y exportar

Abrir http://localhost:5182/prioridades.html?edificio=san-jose&anio=1911. Capturas en [perspectiva](../../entregables/prioridades/san-jose-perspectiva.png), [fachada](../../entregables/prioridades/san-jose-fachada.png) y [planta](../../entregables/prioridades/san-jose-planta.png). [GLB de estudio](../../entregables/prioridades/san-jose.glb).

```js
import {crearPatrimonio} from './patrimonio-prioritario.js';
const {edificio,cubiertas,etapa,metadatos}=crearPatrimonio({
  id:'san-jose', anio:1911, nivelDetalle:'ciudad'
});
// Comprobar etapa.presente === true antes de reservar un solar.
```

Metros nominales, +Y vertical, **+Z hacia la fachada**, origen en el centro del volumen principal. Huella orientativa 37 × 48 m: NO usarla como reserva catastral automática. El ancla actual de la marca en Caracas es **(10635, 5370)**, en píxeles del mosaico base; no es el perímetro ni prueba orientación.

## Instalar en Caracas

1. Aplicar la [guía común](../integracion-caracas-prioridades.md) copiando los cuatro módulos y creando el adaptador de geometría. No añadir un segundo renderer ni descargar el GLB en producción.
2. Georreferenciar el solar en cada plano: medir límites y azimut; resolver los límites descritos arriba. Ajustar parámetros del modelo si hace falta, conservando esta evidencia. No escalar de forma diferente cada época sin una reforma documentada.
3. Registrar hito y parte con los índices 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. Los estados indeterminados requieren decisión histórica documentada antes de incorporarlos.
4. Enlazar la marca existente (para Hijos de Dios usar `hijos-de-dios`, aunque el id de estudio es `hijos-dios`; para Metropolitano, `circo-metropolitano`). Crear reserva solo del contorno confirmado y solo durante su vida. Las plazas posteriores y las calles no forman parte de la reserva del edificio desaparecido.
5. Comparar mismas cámaras en las seis épocas; verificar casas, árboles, calles, relieve, tinta/color y el estado antes/después de su aparición. Completar ficha y fuentes sin presentar hipótesis como hechos.
6. Medir coste de geometría en main y rama. El modo ciudad agrupa por material y cubiertas, pero el presupuesto definitivo depende de la integración. Abrir PR ready con capturas y sin cerrar el issue hasta cumplir todo su alcance.

## Referencias

- [Arquidiócesis: parroquia de 1889](https://arquidiocesiscaracas.com/parroquia-san-jose-de-narauli/).
- [Catálogo de fotografía histórica: iglesia de San José](https://fesitpven.com.ve/wp-content/uploads/2024/03/Catalogo-de-fotografia-2024_.pdf).
- [Referencia contemporánea de fachada](https://www.minube.com.mx/rincon/iglesia-san-jose-a3675792).

Fotografías descargadas en `recursos/prioridades` solo para consulta. Licencias no establecidas: no se incluyen como texturas ni se redistribuyen en el build. Las capturas enlazadas son renders propios. Dimensiones no citadas y colores son interpretativos.
