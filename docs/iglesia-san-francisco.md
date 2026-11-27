# Iglesia de San Francisco (Caracas): estudio por épocas (1772–1936)

Visor interactivo: `http://localhost:5176/san-francisco.html` (`npm run dev -- --port 5176`).
Estudio hecho en Miraflores e integrado en [grunch/caracas](https://github.com/grunch/caracas) con [grunch/caracas#184](https://github.com/grunch/caracas/pull/184).

---

## 1. Reseña histórica y evolución arquitectónica

La **Iglesia de San Francisco** (oficialmente *Iglesia de la Inmaculada Concepción*), situada entre las esquinas de **San Francisco** y **La Bolsa** en la actual **Avenida Universidad** (Parroquia Catedral, Caracas), es uno de los templos más importantes de la historia colonial y republicana venezolana:

- **1574–1593 (fundación y primer templo):** Fray Alonso Vidal y ocho frailes fundan el convento franciscano (hacia 1574–1578, nombrado ya en el plano de Pimentel de 1578). Entre 1587 y 1593 el maestro alarife **Antonio Ruiz de Ullán** traza y levanta la iglesia de mampostería anexa al convento (hoy Palacio de las Academias).
- **1641 y 1655:** Severos daños por el terremoto de San Bernabé (1641) motivan su reconstrucción. En **1655** Juan de Angulo trae desde **Génova (Italia)** las tres célebres **esculturas de mármol** —*La Inmaculada Concepción*, *San Juan Bautista* y *San Francisco de Asís*— que aún presiden la fachada.
- **1745 (reforma colonial de Fray Andrés Vélez):** Se reconstruyen las **tres naves** de planta rectangular con testero plano y pilares dóricos, se amplía la puerta principal, se levanta una **portada barroca de tres calles** con nichos y frontón triangular con pináculos, y se agrega el **campanario lateral oeste** (espadaña de tres arcos y chapitel piramidal de teja en el enlace con el convento). En **1772** el templo contaba con **catorce altares** (entre ellos el *Retablo del Santo Niño de Belén* de Domingo Gutiérrez, 1762–1765, y la *Capilla de la Orden Tercera*).
- **1812, 1813, 1837 y 1842:** A diferencia de la mayoría de las iglesias caraqueñas, San Francisco resistió en pie el terremoto del 26 de marzo de **1812** con daños reparables. En su interior Simón Bolívar fue proclamado **El Libertador** el 6 de agosto de **1813**, y el 17 de diciembre de **1842** se celebraron sus exequias al repatriarse sus restos. Tras la disolución del convento en **1837**, el templo pasó al obispado.
- **~1866 (La Ceiba de San Francisco):** Se planta frente a la iglesia la célebre ceiba patrimonial que acompaña desde entonces el perfil de la esquina.
- **1887–1890 (reforma de Juan Hurtado Manrique):** Por orden del presidente **Antonio Guzmán Blanco** (Wikipedia data la reforma en **1888**; fuentes arquitectónicas sitúan el proceso entre 1887 y 1890), el arquitecto **Juan Hurtado Manrique** sustituye por completo la fachada colonial barroca por una monumental **fachada neoclásica / neobarroca** inspirada en *Il Gesù* de Roma:
  - **Suprime la torre campanario frontal**, acentuando la horizontalidad académica en armonía con la fachada neogótica de la vecina Universidad Central (Palacio de las Academias).
  - Abre **tres puertas rectangulares** de madera tallada (central con frontón curvo partido; laterales con medallones circulares y lunetos semicirculares ciegos).
  - Reubica las tres esculturas genovesas de mármol de 1655 sobre repisas: *La Inmaculada Concepción* centrada sobre la cornisa principal bajo un **gran óculo circular**, y *San Juan Bautista* (este) y *San Francisco de Asís* (oeste) entre pilastras dóricas pareadas.
  - Corona el segundo cuerpo con **aletas con volutas en espiral**, jarrones pináculos y un **frontón curvo partido** con escotadura nítida flanqueando una **peineta central con guirnalda**.
- **1922–1936:** En **1922** el templo pasa a custodia de los padres jesuitas. El plano de la Dirección de Cartografía Nacional de **1936** lo rotula «Iglesia San Francisco» con su huella de ~19 × 62 m y fachada orientada al norte.
- **Hitos posteriores a 1936 (no aplicados retroactivamente):** Restauración de techos de madera de carreto y pisos de mármol por **Luis Malaussena** en **1953**, y declaratoria como **Monumento Histórico Nacional** el **6 de abril de 1956** (Gaceta Oficial N.º 25.020).

---

## 2. Qué se modela por fecha (los 5 años de [grunch/caracas](https://github.com/grunch/caracas))

| Año | Índice [grunch/caracas](https://github.com/grunch/caracas) | Fachada y volumetría | Certeza y referencias |
|---|:---:|---|---|
| **1772** | `1` | **Portada barroca de 1745** (un solo portal arqueado central, tres calles con nichos, ventana coral, frontón triangular y pináculos) + **campanario oeste de tres arcos y chapitel piramidal de teja**. Tres naves con techos de teja criolla. Sin Ceiba. | Media-alta en fachada (litografía de ca. 1845 aplicada retrospectivamente al estado posterior a 1745). Alzados laterales coloniales e interior simplificado son interpretativos. |
| **1843** | `2` | **Iglesia de San Francisco ca. 1845** (post-1812 y exequias de Bolívar de 1842): conserva la portada barroca y la espadaña oeste de tres arcos con chapitel ligeramente más bajo, muros encalados con pátina, zócalo oscuro y contrafuertes laterales de consolidación. Sin Ceiba. | Alta en portada barroca y campanario oeste gracias a `1845-commons-iglesia-de-san-francisco` (Wikimedia Commons). Contrafuertes laterales interpretativos. |
| **1889** | `3` | **Nueva fachada de Juan Hurtado Manrique (1887–1889)**: **sin torre campanario**, tres puertas rectangulares, pilastras dóricas, tres estatuas genovesas en repisas, gran óculo circular, lunetos laterales, volutas en espiral y frontón curvo partido con peineta y guirnalda. Costado este articulado con pilastras. Paleta crema-piedra y Ceiba joven (~23 años, opcional en visor). | Alta en la composición de fachada (cotejada con fotografías históricas y actuales de Wikimedia Commons). Paleta cromática de 1889 aproximada. |
| **1911** | `4` | **Envolvente consolidada de Hurtado Manrique** (sin inventar reformas inexistentes), paleta ocre-gris suave y Ceiba en crecimiento (~45 años, opcional). | Alta en continuidad arquitectónica. |
| **1936** | `5` | **Templo bajo custodia jesuita (plano DCN 1936)**: fachada de Hurtado Manrique en paleta ocre-dorado y piedra gris-pizarra, techo de teja criolla y Ceiba monumental (~70 años, opcional). No se introducen cambios de 1953 ni edificaciones modernas circundantes. | Alta en fachada, costado este, cubiertas de teja y distribución interior de tres naves con retablos dorados (visible al ocultar cubiertas). |

---

## 3. Referencias visuales consultadas

Se consultaron fuentes documentales e imágenes públicas únicamente como referencia geométrica e histórica (no se copian ni redistribuyen archivos de imagen ni texturas):

1. **`original.jpg` de [`fuentes/imagenes/1845-commons-iglesia-de-san-francisco/`](https://github.com/grunch/caracas/tree/main/fuentes/imagenes/1845-commons-iglesia-de-san-francisco) en grunch/caracas (catalogada en su `ficha.json`; el escaneo no está versionado)** (litografía de ca. 1845, dominio público en Wikimedia Commons): documento directo para `1772` y `1843` — portada barroca de un solo portal con nichos, volutas, frontón triangular y el campanario oeste de tres arcos con chapitel piramidal.
2. **Wikimedia Commons (`Category:Iglesia de San Francisco (Caracas)`):** fotografías de fachada (`Iglesia_Fachada.jpg`, `Iglesia_San_Francisco_Caracas_2010.JPG`, `San_Francisco_Church.JPG`, `Iglesia_de_San_Francisco_Caracas.jpg`), costado este histórico (`Esquina_de_San_Francisco_en_Caracas_-_Venezuel_a_(1970).jpg`) e interior (`Iglesia_de_San_Francisco,_Caracas_02.jpg`, `03.jpg`) que precisan las tres puertas, el posicionamiento exacto de *La Inmaculada Concepción* sobre la cornisa principal, el óculo circular, la escotadura del frontón partido, las volutas en espiral, las pilastras del muro este y las arcadas dóricas con retablos dorados interiores.

---

## 4. Ejes, entregables y pruebas

- **Ejes del estudio:** origen `(0, 0, 0)` al centro de la planta (`19,6 × 62 m`); `+Z` = Norte (fachada principal en `z = +31`), `-Z` = Sur (nave hacia el testero plano en `z = -31`), `-X` = Este (Esquina de San Francisco), `+X` = Oeste (hacia el antiguo convento / Palacio de las Academias).
- **Código y pruebas:**
  - `src/san-francisco-datos.js` — cronología, fuentes y fichas en español.
  - `src/san-francisco.js` — `crearSanFrancisco({ anio, optimizar: true, nivelDetalle: 'estudio' | 'ciudad', conCeiba })`.
  - `san-francisco.html` y `src/san-francisco-visor.js` — visor con 6 cámaras, selector de las 5 épocas, toggle de cubiertas, toggle de la Ceiba y exportación GLB.
  - `tests/san-francisco.test.js` y `scripts/validar-san-francisco.mjs` — validación unitaria y Playwright (capturas + 5 GLB en `entregables/san-francisco/`).
- **Integración en [grunch/caracas](https://github.com/grunch/caracas):** fusionada en [grunch/caracas#184](https://github.com/grunch/caracas/pull/184); el procedimiento seguido está en [docs/integracion-caracas-san-francisco.md](integracion-caracas-san-francisco.md).
