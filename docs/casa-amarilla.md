# Casa Amarilla: estudio por épocas

Visor: `http://localhost:5174/casa-amarilla.html`. Fecha de consulta: 22 de noviembre de 2026.
Estudio hecho en Miraflores e integrado en [grunch/caracas](https://github.com/grunch/caracas) con [grunch/caracas#139](https://github.com/grunch/caracas/pull/139) (22-11-2026).

## Evidencia histórica

[Wikipedia](https://es.wikipedia.org/wiki/Casa_Amarilla_de_Caracas) sitúa la terminación del Ayuntamiento
al sur de la cárcel en diciembre de 1750. El cuarto de manzana se refiere al solar primigenio descrito
para 1578; no demuestra una superficie construida ni unas dimensiones modernas. El Cabildo protagoniza
los sucesos de abril de 1810. El terremoto de 1812 dañó ambos inmuebles. La inauguración del conjunto
reunido como Casa de Gobierno fue en 1842, y la remodelación de Hurtado Manrique en 1874.

El [Diccionario de Historia de Venezuela de Fundación Empresas Polar](https://bibliofep.fundacionempresaspolar.org/dhv/entradas/c/casa-amarilla/)
describe una cárcel de dos plantas en la representación de 1766, con solares posteriores y una
casamata incorporada tras 1745. Documenta arquerías añadidas en 1874, pintura amarilla en 1877,
asignación completa a Cancillería en 1912, sustitución parcial de techos hacia 1930, ampliación en
1938 y sustitución del resto de tejados en 1957. Estas fechas impiden usar una cubierta contemporánea
en todos los mapas. Su descripción del patio dice dórico; Wikipedia dice jónico. El modelo usa
columnas simplificadas sin declarar resuelta esa discrepancia.

[IAM Venezuela](https://iamvenezuela.org/2016/07/casa-amarilla/), citando el catálogo del IPC de 2007,
describe dos niveles, corredores con arcadas, cornisa que oculta el alero y portada con remate circular.
Esto guía la lectura de las imágenes, pero no sustituye un plano acotado.

## Qué se modela

| Año | Modelo | Certeza / decisión de representación |
|---|---|---|
| 1772 | Ayuntamiento al sur y cárcel al norte, dos plantas, patios independientes, corral posterior y casamata | Alzado hipotético; no se dispone de levantamiento colonial. Las galerías de madera, alturas y vanos son interpretación tipológica. |
| 1810 | Misma geometría colonial; información del Cabildo | No hay evidencia consultada que justifique inventar una reforma entre estas fechas. No se identifica un balcón concreto como el original. |
| 1843 | Conjunto reunido, patio amplio, fachada sobria, tejados y balcones | La pintura atribuida a Bolet de 1870 orienta retrospectivamente la silueta; no es prueba contemporánea de 1843. |
| 1889 | Fachada amarilla, molduras, balcones, remate, pabellón sur con puerta única y balcón común de tres vanos arqueados y patio de arcadas | Se cotejan litografía, axonometría y fotos; medidas y ornamento reducido son aproximados. |
| 1911 | Misma envolvente que 1889; cambia la ficha | No se impone una transformación exterior sin evidencia. La ficha evita llamar Cancillería a todo el inmueble antes de 1912. |
| 1936 | Envolvente neoclásica y cubierta mixta | La platabanda se coloca atrás como hipótesis explícita: falta un plano que localice las sustituciones. No se incorpora la casa añadida en 1938. |

El intervalo 1812–1842 no se representa como una séptima etapa: no existe ese corte en el mapa actual,
y las reparaciones intermedias necesitan más investigación. El hecho histórico se explica en la ficha.
Tampoco se presenta la versión 1936 como una reconstrucción de la casa actual.

## Referencias visuales aportadas

Revisadas las cinco imágenes en `recursos/casa-amarilla/`:

- `Screenshot_2026-11-22_16-41-05.png`: lámina con pie «Casa Amarilla, residencia presidencial» y
  «Litografía de H. Neun». Dos niveles, siete ejes contando la portada central, balcones individuales,
  cadenas de esquina, remate curvo y pabellón de tres arcos a la izquierda. Fecha de la lámina sin verificar.
- `Screenshot_2026-11-22_16-44-27.png`: reproducción de la pintura atribuida a Bolet; fachada clara,
  tejado visible, balcones y portada. El edificio de arcos al otro lado de la calle NO se incorpora a la casa.
- `Screenshot_2026-11-22_16-43-57.png`: axonometría de patio, cubierta inclinada y pabellón lateral.
  Autor y fecha desconocidos; se usa para relaciones espaciales, no para afirmar un estado fechado.
- `Casa-Amarilla_YPM-1-1.jpg`: detalle de esquina, zócalo oscuro, enmarcados blancos, cornisa,
  pretil y hierro de balcones. Foto moderna, no evidencia directa de 1772.
- `Haiman-el-troudi-historias-y-anecdotas-de-la-casa-amarilla-05-1024x729.jpg`: frente moderno;
  sirve para proporciones de vanos y color aproximado, no como muestra cromática calibrada.

No se publican las referencias ni se convierten en texturas. Licencias de las imágenes aportadas
sin verificar. Geometría y materiales procedurales originales. Los enlaces documentan la investigación;
no se atribuye a esas fuentes la autoría de los volúmenes hipotéticos.

## Medidas, ejes y límites

La huella nominal del estudio es 46 × 54 m: retoma las dimensiones aproximadas del hito ya existente
en [`src/hitos/datos/civiles.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/civiles.js), no una medición nueva. El modelo colonial ocupa ese solar
con edificios y espacio abierto posterior. Es una envolvente de trabajo, no prueba de que los linderos
coloniales y republicanos coincidan. Antes de integrar debe contrastarse con la manzana de cada plano.

Y es vertical; el origen está al centro del solar; +Z es el frente oriental, hacia la plaza; +X norte.
La geometría no está georreferenciada. La plataforma fina delimita el estudio, no representa una
acera histórica documentada. La bandera sobre el asta se incorpora desde 1889, con disposición de estrellas por época.

Las proporciones de crujías, patios coloniales, casamata, galerías y cuerpos traseros son hipótesis.
La ornamentación está simplificada; el remate contiene un relieve abstracto, no una reproducción del
escudo. No hay interiores amueblados ni reconstrucción de los murales. Tejas representadas por
superficies y nervios, no por piezas de barro individuales. Laterales medianeros simplificados.

## Entrega y revisión

- `src/casa-amarilla.js`: `crearCasaAmarilla({anio, optimizar:true})` devuelve edificio, cubiertas y etapa.
- `src/casa-amarilla-datos.js`: información en español y selección temporal explícita.
- `casa-amarilla.html`: comparación manteniendo el encuadre, cuatro cámaras, cubiertas desmontables,
  fuentes, incertidumbre y exportación GLB completa, incluso si las cubiertas están ocultas en el visor.
- `entregables/casa-amarilla/`: capturas y seis GLB, uno por fecha ofrecida.
- `scripts/validar-casa-amarilla.mjs`: verifica carga, épocas, cubiertas, exportaciones, móvil y continuidad
  de los estudios anteriores. `npm test` incluye límites cronológicos y geometrías finitas.

## Integración en Caracas

Integrada en [grunch/caracas#139](https://github.com/grunch/caracas/pull/139); ver [`src/hitos/casa-amarilla.js`](https://github.com/grunch/caracas/blob/main/src/hitos/casa-amarilla.js) y [`specs/08-casa-amarilla-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-casa-amarilla-por-epocas.md). Antes de ese PR, el hito de Caracas nacía en índice 3 y no representaba el antecedente colonial. Estos fueron los criterios de la integración:

1. Incorporar variantes para índices 1 (1772), 2 (1843), 3 (1889), 4 (1911), 5 (1936).
   El año 1810 queda como hito informativo; no inventar un mapa nuevo ni cambiar los índices.
2. Calzar solar y orientación contra los planos. El ancla existente (8822, 6770) es candidata, no
   una comprobación del nuevo modelo. Revisar la supresión de edificios genéricos en cada etapa.
3. Adaptar las mallas al lienzo común de Caracas: shader de épocas, tinta y elevación del terreno.
   Los GLB detallados son entregables de revisión, no un sustituto directo de ese adaptador.
4. Incorporar las fichas históricas desde 1772 y atribuciones; no publicar las imágenes aportadas
   sin comprobar su licencia. Mantener incertidumbres en las fichas.
5. Reducir geometría y llamadas de dibujo para escala urbana; ejecutar las comprobaciones de
   Caracas y seguir su flujo de PR. Actualizar el plan en el repositorio de destino en ese momento.



## Corrección del pabellón y bandera

Las nuevas referencias `puerta-arcos-1.png` y `puerta-arcos-2.png` muestran una pared continua:
una puerta de madera con arco abajo y tres puertas-ventanas arqueadas pequeñas arriba, detrás de
una única baranda de balcón. Se sustituyeron las dos galerías abiertas de la versión inicial por
ese frente, con pilastras, molduras y pretil de balaustres. Se aplica desde 1889 según la indicación
del usuario; las fotografías modernas precisan la forma, no certifican por sí solas todos los detalles históricos.

`bandera.png` orienta la posición sobre el remate y el asta. La enseña es geometría ondulada original,
sin incorporar la fotografía como textura. Las siete estrellas siguen las disposiciones históricas:
seis alrededor de una central en 1889, circunferencia en 1911 y arco en 1936, según
[Fundación Empresas Polar, Bandera Nacional](https://bibliofep.fundacionempresaspolar.org/dhv/entradas/b/bandera-nacional/).
El pequeño emblema del cantón es esquemático; no reproduce la heráldica histórica en detalle.

### Segunda revisión del detalle de portada

Se añadieron las bandas concéntricas de los arcos, pilastras con campos amarillos y relieves blancos,
clave con hoja de acanto, rosetas radiales, placa conmemorativa y volutas del friso. La carpintería
incluye dos rombos por hoja y paneles inferiores; el balcón tiene losa escalonada y herrería con
rombos, volutas y abanico central. Los balaustres del pretil tienen perfil torneado. La vista
«Detalle de portada» permite inspeccionar estos cambios desde 1889.

Los pequeños mascarones, talla vegetal y medallón son aproximaciones escultóricas originales.
La placa indica el lugar de la inscripción mediante líneas, sin inventar una transcripción ilegible.
Las fotografías modernas sirven para afinar el detalle solicitado; no prueban la antigüedad de
cada adorno por separado. No se añaden elementos transitorios como guirnaldas navideñas o carteles.
