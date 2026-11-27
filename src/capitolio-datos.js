/**
 * Cronología, fuentes y criterios de representación para el solar del
 * Palacio Federal Legislativo (Capitolio Federal) y el antiguo Convento de las Concepciones.
 *
 * Épocas del mapa de grunch/caracas: 1772 (1), 1843 (2), 1889 (3), 1911 (4), 1936 (5).
 * Se añade 1958 como hito de referencia contemporánea (sobrecúpula dorada de aluminio anodizado)
 * para cotejar las fotografías actuales de recursos/congreso sin trasladar esa cúpula a 1889–1936.
 */

export const FUENTES_CAPITOLIO = Object.freeze([
  {
    titulo: 'Wikipedia · Congreso Nacional de Venezuela (sedes históricas)',
    url: 'https://es.wikipedia.org/wiki/Congreso_Nacional_de_Venezuela',
  },
  {
    titulo: 'Wikipedia · Palacio Federal Legislativo (Capitolio Federal)',
    url: 'https://es.wikipedia.org/wiki/Palacio_Federal_Legislativo',
  },
  {
    titulo: 'Fundación Empresas Polar · Diccionario de Historia de Venezuela (Capitolio y Antonio Malaussena)',
    url: 'https://bibliofep.fundacionempresaspolar.org/',
  },
  {
    titulo: 'IAM Venezuela · Palacio Federal Legislativo (catálogo IPC)',
    url: 'https://iamvenezuela.org/',
  },
  {
    titulo: 'Fundación Arquitectura y Ciudad · Capitolio Federal y Salón Elíptico',
    url: 'https://fundaayc.com/',
  },
]);

export const ANIOS_CAPITOLIO = Object.freeze([1772, 1843, 1889, 1911, 1936, 1958]);
export const ANIOS_MAPA_CARACAS = Object.freeze([1772, 1843, 1889, 1911, 1936]);

export function etapaCapitolio(anio) {
  if (!ANIOS_CAPITOLIO.includes(anio)) {
    throw new RangeError('El estudio admite 1772, 1843, 1889, 1911, 1936 y 1958.');
  }

  const convento = anio < 1872;
  const postTerremoto = anio === 1843;
  const cupula = convento
    ? 'ninguna'
    : anio === 1889
      ? 'original-1877'
      : anio < 1958
        ? 'belga-1890'
        : 'dorada-1958';

  const etiquetaMapa = anio === 1958 ? 'HITO' : 'MAPA';
  const indiceCaracas = { 1772: 1, 1843: 2, 1889: 3, 1911: 4, 1936: 5, 1958: null }[anio];

  const fichas = {
    1772: {
      id: 'convento-concepciones-1772',
      nombre: 'Convento de las Concepciones',
      subtitulo: 'Real Convento de la Inmaculada Concepción · manzana completa',
      historia:
        'En 1772 toda la manzana entre las esquinas de Las Monjas, Padre Sierra, La Bolsa y San Francisco pertenecía al Convento de las Reverendas Madres de la Inmaculada Concepción (fundado en 1636–1637), no al de San Francisco, que estaba en la cuadra sur. Se organiza con la iglesia conventual al norte orientada hacia el este, portería en el costado oriental, claustro principal de dos plantas, dependencias de servicio al oeste y una amplia huerta amurallada al sur.',
      certeza:
        'Alta en la identidad del inmueble y su ocupación de manzana completa; baja en alzados y medidas exactas. No existe levantamiento fotográfico colonial: la iglesia norte orientada al este, los dos pisos del claustro y la huerta sur se interpretan a partir de descripciones del plano de 1775 (AGI), crónicas del obispo Martí y tipología conventual caraqueña.',
    },
    1843: {
      id: 'convento-concepciones-1843',
      nombre: 'Convento de las Concepciones (post-1812)',
      subtitulo: 'Claustro reparado tras el terremoto de 1812 · manzana completa',
      historia:
        'El terremoto del 26 de marzo de 1812 causó graves daños en la iglesia, claustros y tapias del convento, aunque la comunidad permaneció en la manzana hasta su exclaustración en 1874. Mientras tanto, el Congreso Nacional sesionaba provisionalmente en el vecino Convento de San Francisco (hoy Palacio de las Academias, al sur). Se representan reparaciones austeras: contrafuertes, espadaña más baja en lugar del campanario colonial y reducción parcial de la planta alta oeste.',
      certeza:
        'Alta en la permanencia del convento y los daños de 1812; baja en el alcance físico exacto de las reparaciones de 1843. La sustitución del campanario por espadaña y los contrafuertes son una reconstrucción interpretativa coherente con la Caracas republicana temprana.',
    },
    1889: {
      id: 'capitolio-urdaneta-1889',
      nombre: 'Capitolio y Palacio Federal',
      subtitulo: 'Proyecto de Luciano Urdaneta (1873–1877) · bóveda elíptica original',
      historia:
        'Tras expropiar la huerta sur en 1872 y clausurar el convento en 1874, Antonio Guzmán Blanco levantó el conjunto neoclásico de Luciano Urdaneta: el Palacio Legislativo al sur (inaugurado el 20 de febrero de 1873) y el Palacio Federal al norte con el Salón Elíptico y las cariátides de Manuel Antonio González (20 de febrero de 1877), articulados por dos alas laterales en torno al patio con la fuente británica de 1875. En 1889 el Salón Elíptico conservaba su bóveda elíptica achatada original, antes del montaje de la sobrecúpula belga.',
      certeza:
        'Media-alta en planta general, cuatro alas, cariátides (1876), fuente (1875) y ausencia de la linterna belga (comisionada en junio de 1889 y montada en 1890–1891). El perfil exacto de la bóveda achatada de 1877 y la altura de los chaguaramos jóvenes son aproximaciones.',
    },
    1911: {
      id: 'capitolio-malaussena-1911',
      nombre: 'Capitolio Federal · Sobrecúpula de 1890',
      subtitulo: 'Sobrecúpula belga de hierro y zinc con linterna calada (Antonio Malaussena)',
      historia:
        'Para corregir filtraciones que amenazaban el lienzo de la Batalla de Carabobo (1888) de Martín Tovar y Tovar, Antonio Malaussena diseñó en 1889 una sobrecúpula metálica de hierro forjado y planchas de zinc fabricada en Bélgica y montada entre 1890 y 1891, rematada por una linterna calada ornamental. El plano de Razetti (1911) registra el conjunto consolidado con jardines y palmeras en crecimiento.',
      certeza:
        'Media-alta en la existencia de la sobrecúpula metálica belga de 1890–1891 y su linterna calada (documentada retrospectivamente por la foto histórica congreso-1930.jpg). La bandera muestra las siete estrellas en circunferencia vigentes en 1911.',
    },
    1936: {
      id: 'capitolio-1936',
      nombre: 'Palacio Federal Legislativo (década de 1930)',
      subtitulo: 'Sobrecúpula de Malaussena, fachada ocre-crema y chaguaramos altos',
      historia:
        'El plano de la Dirección de Cartografía Nacional de 1936 rotula «Palacio Federal» dibujando las cuatro alas alrededor del jardín central y el óvalo del Salón Elíptico al norte. La fotografía histórica de hacia 1930 (recursos/congreso/congreso-1930.jpg) muestra los muros en tono ocre-crema claro con columnas corintias blancas, frontones triangulares en los pabellones de esquina y la linterna calada metálica sobre la cúpula.',
      certeza:
        'Alta en la fachada norte, pabellones con frontón triangular y linterna calada gracias al cotejo directo con congreso-1930.jpg. La bandera adopta el arco de siete estrellas (ley de 1930). La coloración de archivo se interpreta como paleta ocre-crema aproximada, no calibrada.',
    },
    1958: {
      id: 'palacio-federal-1958',
      nombre: 'Palacio Federal Legislativo · Cúpula Dorada',
      subtitulo: 'Reforma de 1958 · sobrecúpula elíptica de aluminio anodizado dorado',
      historia:
        'En 1958 se instaló la característica sobrecúpula elíptica de aluminio anodizado dorado con tambor de celosía metálica y cupulín dorado que eleva el conjunto hasta cerca de 26 metros. Esta etapa es posterior al último mapa de grunch/caracas (1946), pero se incluye como hito de cotejo directo frente a las vistas aéreas y frontales actuales de recursos/congreso.',
      certeza:
        'Alta en volumetría exterior, cúpula elíptica dorada, escalinata curva hacia el patio, arco de acceso oriental, techos rojos laterales y jardines, cotejados contra las cuatro fotografías modernas en recursos/congreso/. Las dimensiones exactas siguen siendo aproximadas para revisión.',
    },
  };

  return {
    anio,
    convento,
    postTerremoto,
    cupula,
    etiquetaMapa,
    indiceCaracas,
    ...fichas[anio],
  };
}
