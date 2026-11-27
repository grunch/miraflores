# Palacio Federal Legislativo y Convento de las Concepciones: estudio por épocas

Visor interactivo: `http://localhost:5175/capitolio.html` (`npm run dev -- --port 5175`).
Estudio hecho en Miraflores e integrado en [grunch/caracas](https://github.com/grunch/caracas) con [grunch/caracas#143](https://github.com/grunch/caracas/pull/143) y los ajustes posteriores [grunch/caracas#160](https://github.com/grunch/caracas/pull/160), [grunch/caracas#164](https://github.com/grunch/caracas/pull/164) y [grunch/caracas#186](https://github.com/grunch/caracas/pull/186).

---

## 1. Aclaratoria histórica: ¿Convento de San Francisco o de las Concepciones?

La manzana completa que hoy ocupa el **Palacio Federal Legislativo (Capitolio Federal)** —delimitada por las esquinas de **Las Monjas (NE)**, **Padre Sierra (NO)**, **La Bolsa (SO)** y **San Francisco (SE)**, diagonal al ángulo suroeste de la Plaza Bolívar— estuvo ocupada en **1772** y **1843** por el **Convento de la Inmaculada Concepción** (**Convento de las Reverendas Madres Concepcionistas** o **Monjas Concepciones**), **no** por el Convento de San Francisco.

¿Por qué la confusión habitual al leer sobre el [Congreso Nacional de Venezuela](https://es.wikipedia.org/wiki/Congreso_Nacional_de_Venezuela)?

- **Convento de San Francisco (cuadra inmediatamente al sur, cruzando la actual Av. Universidad):** fundado por frailes franciscanos en el siglo XVI junto a la Iglesia de San Francisco. Durante gran parte del siglo XIX sirvió como **sede provisional del Congreso Nacional** y sede de la **Universidad Central de Venezuela** (reformado en estilo neogótico en la década de 1870 por Juan Hurtado Manrique; hoy es el **Palacio de las Academias**).
- **Convento de las Concepciones (esta manzana, inmediatamente al norte del anterior):** fundado en **1636–1637** sobre la casa donada por doña Juana de Villela. Fue el primer convento femenino de clausura de Caracas y ocupó la manzana completa (que legó el nombre a la **Esquina de Las Monjas**) hasta que Antonio Guzmán Blanco expropió su huerta sur en **1872** y decretó la clausura y demolición total del monasterio en **1874** para erigir el Capitolio Federal.

Esta distinción coincide exactamente con las marcas ya declaradas en [`src/marcas-datos.js`](https://github.com/grunch/caracas/blob/main/src/marcas-datos.js):
- `capitolio` (`x: 8690, y: 7035`): `1772 → Convento de las Concepciones`, `1889+ → Capitolio`.
- `universidad` (`x: 8645, y: 7192`, al sur): `1772 → Convento de San Francisco`, `1889+ → Universidad`.

---

## 2. Evidencia histórica y evolución arquitectónica

### Etapa colonial y republicana temprana (1637–1874)
- **1636–1637:** Fundación formal del *Real Convento de la Limpia e Inmaculada Concepción*.
- **Siglo XVIII (1772):** Apogeo económico y constructivo del monasterio. A partir de descripciones del plano del Archivo General de Indias (1775), la visita del obispo Mariano Martí y representaciones del siglo XVIII (como el cuadro de *Nuestra Señora de Caracas* de 1766), el conjunto ocupaba toda la manzana con:
  - **Iglesia conventual** en el costado **norte**, orientada hacia el **este** (hacia la Esquina de Las Monjas y la Plaza Mayor), con nave de mampostería, portada colonial y campanario.
  - **Portería y refectorio** en el costado **este** (Las Monjas – San Francisco).
  - **Claustro principal de dos plantas** con celdas altas y corredores porticados en torno a un patio interior con pila de agua.
  - **Dependencias de servicio** (enfermería, cocina, servidumbre) hacia el oeste y sur del claustro.
  - **Amplia huerta interior amurallada** ocupando el sector sur de la manzana, cercada por altas tapias de cal y canto.
- **26 de marzo de 1812:** El terremoto destruye o daña gravemente la iglesia, los claustros altos y las tapias. La comunidad de monjas realiza reparaciones austeras y permanece en la manzana hasta 1874.

### Construcción del Capitolio y Palacio Federal (1872–1877)
Proyecto neoclásico y neobarroco dirigido por el ingeniero y arquitecto **Luciano Urdaneta** (con colaboración de Manuel María Urbaneja, Juan Hurtado Manrique y Roberto García):
- **21 de septiembre de 1872:** Inicio de las obras sobre la huerta sur expropiada del convento.
- **20 de febrero de 1873:** Inauguración del cuerpo sur (**Palacio Legislativo**), destinado a las cámaras del Congreso, frente a la actual Avenida Universidad y el antiguo Convento de San Francisco / Universidad.
- **Mayo de 1874:** Decreto de extinción de conventos, exclaustración de las monjas concepciones y demolición del resto del monasterio.
- **Junio de 1875:** Contratación con la firma británica *The Crumlin Viaduct Works Company* de la **fuente ornamental de hierro fundido** (diseño de Manuel María Urbaneja, inspirada en la Plaza de la Concordia de París) para el patio central ajardinado.
- **Noviembre de 1876:** Escultura de las dos **cariátides** (*La Ley* y *La Justicia*) por el artista venezolano **Manuel Antonio González** para el pórtico norte del Palacio Federal.
- **20 de febrero de 1877:** Inauguración del cuerpo norte (**Palacio Federal**), con el **Salón Elíptico** (originalmente cubierto por una **bóveda elíptica achatada sin linterna alta**) y las alas laterales este y oeste cerrando la manzana en torno al patio central.
- **Octubre de 1888:** Inauguración en el plafón interior del Salón Elíptico del lienzo monumental de la *Batalla de Carabobo* de **Martín Tovar y Tovar**.

### Evolución de la cúpula del Salón Elíptico (1889 → 1911/1936 → 1958)
Este es uno de los hallazgos más importantes para evitar anacronismos entre épocas:
- **1889 (bóveda original de 1877):** En junio de 1889 el Ministerio de Obras Públicas comisiona al arquitecto **Antonio Malaussena** para resolver filtraciones que ponían en peligro el lienzo de Tovar y Tovar. Por tanto, en el corte de **1889** el edificio todavía mostraba su **bóveda elíptica baja original**, sin la sobrecúpula belga.
- **1890–1891 (sobrecúpula belga de Malaussena, visible en 1911 y 1936):** Malaussena diseñó y mandó fabricar en **Bélgica** una **sobrecúpula metálica de hierro forjado y planchas de zinc**, coronada por una **linterna cilíndrico-ovalada calada con rosetones y persianas**, montada entre 1890 y 1891. Esta configuración es exactamente la que documenta la fotografía histórica `recursos/congreso/congreso-1930.jpg`.
- **1958 (sobrecúpula dorada de aluminio anodizado, estado actual):** En 1958 se instaló la gran **sobrecúpula elíptica dorada de aluminio anodizado** con tambor de celosía metálica y cupulín dorado que eleva el conjunto hasta ~26 metros, documentada en las cuatro fotografías modernas aportadas en `recursos/congreso/`.

---

## 3. Qué se modela por fecha

| Año | Tipo | Edificio modelado | Certeza y decisiones clave |
|---|---|---|---|
| **1772** | `MAPA` (índice 1) | **Convento de las Concepciones** (manzana completa 92 × 108 m) | Iglesia al norte orientada al este con campanario en Esquina de Las Monjas, portería al este, claustro principal de dos plantas con pila, patio de servicio al oeste y huerta amurallada al sur. Alzados interpretativos (no hay levantamiento colonial). |
| **1843** | `MAPA` (índice 2) | **Convento de las Concepciones (post-1812)** | Conserva la manzana completa y el claustro activo; representa reparaciones tras el terremoto de 1812: contrafuertes reforzados, espadaña más baja en lugar del campanario colonial y reducción del ala oeste del claustro a una planta. Reconstrucción interpretativa. |
| **1889** | `MAPA` (índice 3) | **Capitolio y Palacio Federal (Luciano Urdaneta)** | Conjunto neoclásico completo: Palacio Federal norte con pórtico curvo, cariátides (1876) y escalinata al patio; Palacio Legislativo sur (1873); ala este dividida por arco ceremonial con jardín frontal; ala oeste continua; fuente británica (1875) y chaguaramos jóvenes. **Bóveda elíptica achatada original de 1877**, antes de la sobrecúpula belga. |
| **1911** | `MAPA` (índice 4) | **Capitolio Federal · Sobrecúpula de 1890** | Incorpora la **sobrecúpula metálica belga de hierro y zinc con linterna calada** de Antonio Malaussena (1890–1891), chaguaramos más altos y bandera de 7 estrellas en circunferencia. |
| **1936** | `MAPA` (índice 5) | **Palacio Federal Legislativo (década de 1930)** | Cotejado directamente con `congreso-1930.jpg`: muros ocre-crema, columnas corintias blancas con capiteles de bronce, frontones triangulares en pabellones de esquina, sobrecúpula de zinc con linterna calada, chaguaramos maduros y bandera con arco de 7 estrellas (ley de 1930). |
| **1958+** | `HITO` (referencia moderna) | **Palacio Federal Legislativo · Cúpula Dorada** | Cotejado contra las 4 fotos modernas de `recursos/congreso/`: sobrecúpula elíptica dorada de aluminio anodizado con tambor de celosía y cupulín dorado, acabado exterior blanco marfil y techos metálicos rojos en alas laterales y norte. No entra en el mapa de [grunch/caracas](https://github.com/grunch/caracas) (que termina en 1936), sirve como referencia visual contemporánea. |

---

## 4. Cotejo con las referencias visuales de `recursos/congreso/`

Las cinco imágenes aportadas sirvieron únicamente como guía volumétrica e histórica (no se publican ni se usan como texturas; licencias de terceros sin verificar):

1. **`congreso-1930.jpg`** (fotografía histórica coloreada, ca. 1930): guía directa para `1911` y `1936`. Muestra el pabellón de esquina con **frontón triangular**, portada arqueada lateral con gradas, pilastras y columnas corintias blancas con capiteles oscuros, muros crema-ocre y, al fondo sobre la azotea, la **linterna calada con rosetones circulares** de la sobrecúpula belga de Malaussena.
2. **`14407977-4632652c.jpg`** (vista aérea completa desde el NE): define la composición exacta de toda la manzana: Salón Elíptico con cúpula elíptica dorada elongada E–O al norte; pabellones de esquina con frontones; ala este de dos niveles remetida con jardín de calle, pequeña fuente octogonal, techos rojos y **arco ceremonial central** con parapeto curvo; ala oeste continua de dos niveles; ala sur frente al Palacio de las Academias; patio central con plaza circular, fuente y densos chaguaramos.
3. **`congreso2.jpeg`** (vista aérea oblicua NE): confirma los techos metálicos rojos dentro de pretiles blancos en el ala norte y ala este, la proporción de la cúpula dorada respecto al tambor de celosía y la relación con la aguja neogótica del Palacio de las Academias al sur.
4. **`73f1ad4b36a3943db71050dc335ea510.jpg`** (vista desde el patio hacia el Salón Elíptico): guía directa del **pórtico curvo sur** sobre terraza elevada con 6 columnas corintias, **medallón circular del Escudo Nacional** flanqueado por puertas arqueadas de madera y la **gran escalinata monumental** con barandas bajando al patio.
5. **`istockphoto-1294499711-170667a.jpg`** (fachada norte a nivel peatonal): precisa el ritmo de **5 columnas corintias** por ala flanqueante, ventanas arqueadas con rejas, verja perimetral de hierro, cariátides flanqueando el ingreso curvo, balaustrada superior con remate del escudo y capiteles de bronce oscuro.

---

## 5. Ejes, medidas y entregables

- **Ejes (compatibles sin rotación con [grunch/caracas](https://github.com/grunch/caracas)):** origen `(0, 0, 0)` en el centro de la manzana sobre cota `y = 0`; `+X` = Este (hacia Las Monjas / Plaza Bolívar), `-X` = Oeste (Padre Sierra / La Bolsa), `+Z` = Sur (Av. Universidad / Palacio Legislativo / Huerta), `-Z` = Norte (Palacio Federal / Salón Elíptico / Iglesia).
- **Huella nominal:** `92 m (E–O) × 108 m (N–S)`, igual a `CAPITOLIO` en [`src/hitos/datos/civiles.js`](https://github.com/grunch/caracas/blob/main/src/hitos/datos/civiles.js).
- **Código y pruebas:**
  - `src/capitolio-datos.js` — cronología, fuentes y fichas.
  - `src/capitolio.js` — `crearCapitolio({ anio, optimizar: true, nivelDetalle: 'estudio' | 'ciudad' })`.
  - `capitolio.html` y `src/capitolio-visor.js` — visor interactivo con 6 cámaras, cubiertas desmontables y exportación GLB.
  - `tests/capitolio.test.js` — pruebas unitarias (cronología, límites, vértices finitos, cubiertas y reducción de triángulos en modo `ciudad`).
  - `scripts/validar-capitolio.mjs` — validación Playwright con capturas y exportación de los 6 GLB en `entregables/capitolio/`.
- **Integración en [grunch/caracas](https://github.com/grunch/caracas):** fusionada en [grunch/caracas#143](https://github.com/grunch/caracas/pull/143); el procedimiento seguido está en [docs/integracion-caracas-capitolio.md](integracion-caracas-capitolio.md).
