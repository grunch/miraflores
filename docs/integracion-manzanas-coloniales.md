# Generador de manzanas coloniales · integración en Caracas

Esta herramienta se desarrolla y revisa en Miraflores. Su paleta y su regla de densidad ya se usan en [grunch/caracas](https://github.com/grunch/caracas): manzanas de 1772 ([grunch/caracas#210](https://github.com/grunch/caracas/pull/210), [grunch/caracas#211](https://github.com/grunch/caracas/pull/211)), continuidad de 1843 y 1889 ([grunch/caracas#214](https://github.com/grunch/caracas/pull/214), [grunch/caracas#216](https://github.com/grunch/caracas/pull/216)), patios verdes ([grunch/caracas#217](https://github.com/grunch/caracas/pull/217)) y manzanas completas de 1911, 1936 y 1946 ([grunch/caracas#239](https://github.com/grunch/caracas/pull/239), [grunch/caracas#240](https://github.com/grunch/caracas/pull/240), [grunch/caracas#241](https://github.com/grunch/caracas/pull/241)). Ver [`specs/14-manzanas-coloniales-1772.md`](https://github.com/grunch/caracas/blob/main/specs/14-manzanas-coloniales-1772.md) a [`specs/17-manzanas-1889.md`](https://github.com/grunch/caracas/blob/main/specs/17-manzanas-1889.md).
Visor: `http://localhost:5178/manzana-colonial.html` (`npm run dev -- --port 5178`).

## Contrato de la herramienta

```js
import {crearManzanaColonial} from './src/manzana-colonial.js';

const modelo = crearManzanaColonial({
  cantidadCasas: 16,                  // obligatorio: entero de 1 a 48
  lados: [96, 80, 96, 80],           // norte, este, sur, oeste; metros
  angulos: [90, 90, 90, 90],         // NO, NE, SE, SO; interiores, grados
  semilla: 'caracas-manzana-0042',    // identidad estable, no Math.random()
  vegetacion: 0.65,                  // 0–1; propensión a árboles
  detalle: 'ciudad',                 // 'estudio' para revisar detalles
});
escena.add(modelo.manzana);
// modelo.plan: solares, casas, patios, anexos, perímetro y estadísticas.
// modelo.cubiertas.visible = false; modelo.vegetacion.visible = false;
// Al sustituirlo: escena.remove(modelo.manzana); modelo.liberar();
```

`cantidadCasas` determina **exactamente** el número de viviendas, no una probabilidad. Los cobertizos, tapias y anexos interiores no cuentan como viviendas nuevas.

- 1–8: representación de residencias de élite, solares extensos, grandes patios cerrados, mayor posibilidad de dos plantas y más jardín privado. El solar se reparte entre las viviendas sin un huerto central colectivo.
- 9–20: tejido intermedio, casas de tamaños variados en cuatro frentes y anexos interiores.
- 21–48: viviendas humildes, solares estrechos, predominio de una planta y menores patios; más plantas L/U. La cantidad solicitada se distribuye proporcionalmente entre los cuatro frentes.

Estos umbrales son una **regla visual solicitada por el usuario**, no una clasificación histórica de habitantes. No se deben usar para atribuir renta o clase social a un lugar real sin fuentes. Los edificios de una misma manzana conservan pequeñas variaciones.

La manzana admite lados de 60 a 140 m y esquinas convexas de 30° a 150°. Los ángulos omitidos son `[90,90,90,90]`. En ese caso los lados opuestos deben medir lo mismo. Si se omiten los lados, se usa un cuadrado de 96 m; `ancho` y `fondo` son atajos para un rectángulo. Preferir siempre `lados` en las recetas definitivas.

**Las cuatro longitudes y cuatro ángulos no son independientes:** deben sumar 360° y cerrar el polígono, con una tolerancia de 3 cm para longitudes redondeadas. Un error produce `RangeError`; no se cambia silenciosamente el último lado. Se rechaza también una cantidad que obligue a frentes menores de 4 m en el reparto de referencia. Para esa combinación hay que aumentar dimensiones o reducir viviendas.

Ejemplo oblicuo válido:

```js
crearManzanaColonial({
  cantidadCasas: 12, semilla: 'cuadra-oblicua',
  lados: [100,80,100,80], angulos: [75,105,75,105],
  detalle: 'ciudad',
});
```

Los vértices se construyen en orden NO→NE→SE→SO. El norte local es −Z, este +X; Y es altura. Se centra el promedio de los cuatro vértices en el origen. El tejido se reparte primero en un rectángulo de referencia y se transforma de forma bilineal al cuadrilátero: comparte linderos, sin grietas entre solares. Las alturas se conservan; la planta y las carpinterías se adaptan al sesgo. Es una solución estilizada, no un parcelario catastral. Los ángulos extremos requieren revisión visual.

## Recetas reproducibles y ciudad uniforme

El perfil compartido está en `src/manzana-plan.js`, **versión 4**. Agrupa paleta de cal y tejas, pendiente, proporciones, distribución y regla de densidad. Mantener un solo perfil para toda la ciudad. Variar semilla, cantidad y perímetro; no crear un estilo distinto en cada llamada.

```js
import {recetaDeManzana,planDesdeReceta} from './src/manzana-plan.js';
const receta = recetaDeManzana(modelo.plan); // serializable, con lados y ángulos
const plan = planDesdeReceta(JSON.parse(JSON.stringify(receta)));
const reconstruido = crearManzanaColonial({...receta, detalle:'ciudad'});
```

Verificar primero la receta con `planDesdeReceta`: rechaza versiones incompatibles. El LOD no altera el parcelario. Guardar recetas en el repositorio destino vinculadas a un ID estable del parcelario; la semilla no debe cambiar al recargar, mover la cámara o cambiar de LOD. No cambiarla por año salvo que esté justificado sustituir el tejido completo. Cambiar las reglas exige subir la versión y migrar las recetas conscientemente.

CLI sin navegador (genera `receta.json` y `planta.json`):

```sh
node scripts/generar-manzana.mjs --cantidadCasas 16 --semilla caracas-manzana-0042 --lados 96,80,96,80 --angulos 90,90,90,90 --vegetacion 0.65 --salida entregables/cuadra-0042
```

El visor exporta JSON y GLB. El GLB contiene la manzana y sus capas, incluidas las ocultas; no incluye luces ni la calle de presentación. Para ciudad, preferir el generador y recetas al GLB de estudio.

## Archivos que se necesitarán en Caracas

Copiar, cuando se autorice integrar:

- `src/manzana-plan.js`: reparto puro y perfil.
- `src/manzana-perimetro.js`: cierre, áreas y transformación del perímetro.
- `src/manzana-colonial.js`: geometría.
- `src/optimizar-panteon.js`: dependencia local de fusión; adaptar el import al organizarlos en una carpeta del destino.

No copiar el visor, fotografías, luces o calles de muestra al render de la ciudad. Las referencias aportadas tienen procedencia/licencia sin verificar; se usan para estudio local. No hay texturas fotográficas en el modelo.

## Implantación sobre los planos

1. Identificar el polígono interior de la manzana **entre líneas de fachada**, no los ejes de las calles. Convertir coordenadas del plano a metros con `crearCoords(...).aMundo(x,y)`. Calcular lados y ángulos de ese polígono. No tratar píxeles como metros.
2. Guardar ID, receta, ancla, eje, vida y fuente del contorno. El generador representa forma y estilo; no inventa la ubicación, cantidad histórica de casas ni año de construcción.
3. Girar el modelo por el rumbo del primer lado y trasladarlo al promedio de los vértices. Para Three.js, si ese lado en mundo es `(dx,dz)`, usar `rotation.y = -Math.atan2(dz,dx)`. El modelo ya está centrado. No escalar arbitrariamente después: cambiar las longitudes en la receta.
4. Reservar previamente hitos, plazas, iglesias y otros solares conocidos. Este prototipo ocupa una manzana completa: **no recorta polígonos con agujeros ni evita automáticamente un hito**. No usarlo sobre un hito existente. Un contorno de más de cuatro vértices requiere otro reparto, no forzarlo a un cuadrado.
5. Sustituir los techos genéricos anteriores solo dentro de la huella exacta y durante la vida asignada. Usar el contrato de `zonasDeSupresion`/`suprimirTechos` de Caracas; verificar calles, cruces y huellas colindantes. No superponer el GLB sobre las casas existentes.

## Material de Caracas y rendimiento

La malla del estudio usa `MeshStandardMaterial`. No hereda por sí sola tinta/color, ola, relieve ni vida. Para una prueba pequeña, el pintor de `src/hitos/lienzo.js` admite la geometría con colores lineales. Los tejados llevan `userData.colorBase` y UV métricas para `MAT.TEJA`; su variación fina por vértice es propia del visor y se sustituye por el patrón del shader de Caracas:

```js
// Fragmento del adaptador EN CARACAS; imports relativos según carpeta final.
import {crearManzanaColonial} from './manzana-colonial.js';
import {MAT} from '../hitos/lienzo.js';

export function pintarManzana(p, receta) {
  const m = crearManzanaColonial({...receta, detalle:'ciudad'});
  m.manzana.updateMatrixWorld(true);
  try {
    m.manzana.traverse(o => {
      if (!o.isMesh) return;
      const esTeja = Number.isInteger(o.userData.colorBase);
      p.geo(o.geometry.clone().applyMatrix4(o.matrixWorld), {
        color: esTeja ? o.userData.colorBase : o.material.color.toArray(),
        mat: esTeja ? MAT.TEJA : MAT.LISO,
      });
    });
  } finally { m.liberar(); }
}
```

El pintor `p` debe traer el marco, vida y ancla correctos. Sus UV permanecen locales; no renormalizarlas al tamaño de la manzana. El contrato actual del lienzo consume y libera la copia de geometría pasada a `p.geo`.

**No registrar toda la ciudad como cientos de hitos detallados.** Para producción, generar/cachear por tesela, fusionar por material o usar los atributos del lienzo, y activar detalle por distancia. Usar `detalle:'ciudad'`; la versión de estudio modela juntas y carpintería y no es el presupuesto urbano. Medir triángulos reales de la geometría, no el contador de render que también puede contar sombras. No ampliar silenciosamente los presupuestos de Caracas.

El modelo parte de cota cero y todavía no adapta cada vivienda al terreno. Un único anclaje aplana la manzana; no es suficiente en calles con pendiente. Antes de integrar en zonas inclinadas, generar ancla por solar, conservar las alturas del edificio y resolver escalones/zócalos y tapias que siguen el terreno. El adaptador anterior sirve para un prototipo plano, no da por resuelto ese trabajo.

## Comparación visual con las tres referencias

Archivos aportados: `manzanas-pueblo-colonial-01.jpg`, `02.jpg`, `03.jpg`, copiados en `recursos/manzanas/`.

- **01:** rectángulos de viviendas de anchuras distintas, tejados en L/U, huecos interiores y vegetación dispersa. Se conservaron la alineación de fachadas y la fragmentación de cubiertas.
- **02:** manzanas densas de terracota con pequeños patios y algunos solares mayores. Se ajustó la primera versión: el centro era demasiado vacío y regular (38 % de ocupación); la segunda llegó aproximadamente al 57 %, con huertos desiguales y anexos.
- **03:** mezcla de casonas de patio amplio y parcelas menores, medianeras y quiebres de cubierta. La cantidad de viviendas ahora controla ese contraste; las manzanas oblicuas se adaptan al contorno solicitado.

No se reproducen las piscinas, autos, equipos, ni los techos metálicos y azoteas modernas visibles en las fotografías: el perfil solicitado es colonial. Las fachadas no se pueden reconstruir fielmente desde estas vistas aéreas; se usan puertas, ventanas y rejas domésticas simplificadas. El resultado sigue la organización y paleta del tejido, con representación tridimensional estilizada, no fotogrametría ni exactitud histórica demostrada.

## Validación antes de integrar

- `npm test`: determinismo, receta, cantidad exacta 1–48, diferencias de tamaño, 100 repartos sin solapes locales, patios libres, cierre y medidas de polígonos y reducción de LOD.
- `npm run build`.
- `node scripts/validar-manzana.mjs`: controles, casos 4/16/32 casas, perímetro oblicuo, error de cierre, referencia visual, GLB/JSON y móvil.
- Comparar capturas de planta y perspectiva con las tres fotos usando «Comparar referencias».
- En Caracas, añadir comprobaciones del anclaje, supresión, calle libre, época, relieve y shader; ejecutar las pruebas exigidas por su `AGENTS.md`.

Esta guía prepara una integración futura. No se ha agregado la manzana a Caracas.

### Ancho de los tejados (perfil 4)

Las crujías crecen con la raíz cuadrada de la superficie del solar: una residencia grande tiene franjas de cubierta más anchas que una casa pequeña. El ancho se limita proporcionalmente al frente y al fondo para mantener el patio abierto. Esta proporción sigue la referencia aérea aportada del Museo Diocesano de Coro; no representa una medición histórica del inmueble. Al cambiar esta regla, las recetas pasan a la versión 4; las recetas anteriores se rechazan para evitar reproducir silenciosamente otro modelo.

### Componer con los edificios existentes

En el visor, **Incluir edificio existente** permite elegir Miraflores, Palacio Arzobispal, Casa Amarilla, Capitolio, Panteón o San Francisco. Elegir la esquina y la época regenera la composición. Miraflores conserva su estudio de referencia de 1911. Para el Capitolio de 1911, probar lados de 140 m; el visor avisa cuando el volumen no cabe.

```js
import {crearManzanaCompuesta} from './manzana-edificios.js';
const conjunto = crearManzanaCompuesta({
  cantidadCasas: 16,
  lados: [96, 96, 96, 96],
  angulos: [90, 90, 90, 90],
  semilla: 'cuadra-arzobispado',
  edificio: 'arzobispal', // '' genera solo casas
  esquina: 'SE',        // NO, NE, SE, SO
  anio: 1911,
  detalle: 'ciudad',
});
escena.add(conjunto.manzana);
const receta = conjunto.receta;
const replica = crearManzanaCompuesta({...receta, detalle: 'ciudad'});
```

La cantidad indica las viviendas del reparto inicial. El edificio sustituye solares y jardines completos que intersecten su reserva; `plan.estadisticas.casas` indica las viviendas restantes y `casasSustituidas` las retiradas. No se comprimen viviendas para mantener la cifra inicial. Las casas y anexos restantes se ajustan alrededor de la reserva según el modo de contacto; el hito conserva su geometría. La reserva usa límites rectangulares conservadores, incluida la geometría saliente del modelo. El hito mantiene su escala y proporciones, incluso si la manzana es oblicua; se orienta hacia el norte o sur según la esquina. No es una reproducción de su emplazamiento histórico.

El GLB incluye casas e hito. Para reproducir una receta compuesta, utilizar **crearManzanaCompuesta**, no el planificador de casas aislado. El control de tejados maneja ambas cubiertas. Cada composición admite un edificio externo. Para añadir otro edificio al catálogo, registrar su fábrica en `EDIFICIOS_MANZANA`, devolver `{edificio, cubiertas}` y añadir la opción correspondiente al selector. La raíz debe usar metros, cota de implantación cero y fachada hacia +Z, o adaptarse en su fábrica.

Al trasladar esta herramienta a Caracas, incluir también `manzana-edificios.js` y las fábricas y módulos de datos que importa; evitar dibujar por segunda vez un hito ya registrado en el mapa. Revisar las épocas disponibles de cada edificio antes de usarlo en una manzana histórica. Validación: `node scripts/validar-manzana-edificios.mjs`.

### Edificio adosado o separado

El selector **Encuentro con las casas** acepta `contacto: 'adosado'` (sin retiro) o `contacto: 'separado'`, con `separacion` entre 0 y 15 metros (por defecto 2). Ambos valores se conservan en URL y receta JSON. Ejemplo: `crearManzanaCompuesta({...receta, contacto: 'separado', separacion: 4})`.

El retiro se mide desde la envolvente exterior del modelo, incluidos sus salientes, hacia las construcciones vecinas; no es una distancia al eje del muro. En modo adosado se elimina ese retiro. Se ajusta el tejido circundante mediante un remapeo continuo de las coordenadas horizontales, conservando los bordes de la manzana; el edificio incluido no cambia de escala. Las viviendas pueden cambiar de ancho o profundidad. Los patios y las irregularidades del perímetro pueden dejar tramos abiertos; no se rellena cada hueco con una construcción nueva. `reservaContacto` describe la reserva final y `reservaOriginal` la zona libre antes del ajuste. El plan de solares es el reparto previo a ese ajuste: para trasladar la composición se debe utilizar la geometría de `crearManzanaCompuesta` y copiar también `manzana-contacto.js`.
