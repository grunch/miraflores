/**
 * Cronología, fuentes y criterios de representación para la Iglesia de San Francisco
 * (oficialmente Iglesia de la Inmaculada Concepción), entre las esquinas de San Francisco
 * y La Bolsa, en la Avenida Universidad de Caracas.
 *
 * Épocas exactas del mapa de grunch/caracas:
 *   1 = 1772 · 2 = 1843 · 3 = 1889 · 4 = 1911 · 5 = 1936
 */

export const FUENTES_SAN_FRANCISCO = Object.freeze([
  {
    titulo: 'Wikipedia · Iglesia de San Francisco (Caracas)',
    url: 'https://es.wikipedia.org/wiki/Iglesia_de_San_Francisco_(Caracas)',
  },
  {
    titulo: 'Wikimedia Commons · Litografía ca. 1845 (Iglesia y parte del Convento de San Francisco)',
    url: 'https://commons.wikimedia.org/wiki/File:Iglesia_de_San_Francisco_c1845.jpg',
  },
  {
    titulo: 'Wikimedia Commons · Categoría Iglesia de San Francisco (Caracas) — fachada Hurtado Manrique e interior',
    url: 'https://commons.wikimedia.org/wiki/Category:Iglesia_de_San_Francisco_(Caracas)',
  },
  {
    titulo: 'Fundación Arquitectura y Ciudad · Iglesia de San Francisco y reforma de Juan Hurtado Manrique',
    url: 'https://fundaayc.com/',
  },
  {
    titulo: 'Guía Caracas / Catálogo del Patrimonio Cultural (IPC)',
    url: 'https://guiaccs.com/',
  },
]);

export const ANIOS_SAN_FRANCISCO = Object.freeze([1772, 1843, 1889, 1911, 1936]);

export function etapaSanFrancisco(anio) {
  if (!ANIOS_SAN_FRANCISCO.includes(anio)) {
    throw new RangeError('El estudio admite los cinco años de grunch/caracas: 1772, 1843, 1889, 1911 y 1936.');
  }

  const colonial = anio < 1887;
  const postTerremoto = anio === 1843;
  const conCeiba = anio >= 1889;
  const indiceCaracas = { 1772: 1, 1843: 2, 1889: 3, 1911: 4, 1936: 5 }[anio];

  const fichas = {
    1772: {
      id: 'san-francisco-colonial-1772',
      nombre: 'Iglesia de San Francisco (reforma de 1745)',
      subtitulo: 'Templo colonial de tres naves · portada barroca y campanario lateral oeste',
      historia:
        'Anexa al primer convento franciscano de Caracas (fundado hacia 1574–1578 y trazado en mampostería por Antonio Ruiz de Ullán en 1587–1593). Reconstruida tras el terremoto de 1641 y reformada en 1745 (Fray Andrés Vélez), cuando se reconstruyeron las tres naves, se amplió la puerta principal y se añadió el campanario lateral. En 1772 albergaba catorce altares, las capillas de la Orden Tercera y del Santo Niño de Belén y las tres esculturas genovesas de mármol traídas en 1655.',
      certeza:
        'Media-alta en la portada barroca de un solo portal, tres calles con nichos, frontón con pináculos y campanario de espadaña triple al oeste (tomados retrospectivamente de la litografía de ca. 1845). Medidas exactas de la torre de 1745 y detalles de los muros laterales coloniales son aproximaciones interpretativas.',
    },
    1843: {
      id: 'san-francisco-republicana-1843',
      nombre: 'Iglesia de San Francisco (ca. 1845)',
      subtitulo: 'Tras el terremoto de 1812, proclamación de 1813 y exequias de Bolívar en 1842',
      historia:
        'A diferencia de otros templos caraqueños, San Francisco resistió en pie el terremoto de 1812 con daños reparables. Aquí Simón Bolívar recibió el título de Libertador el 6 de agosto de 1813 y el 17 de diciembre de 1842 se celebraron sus solemnes exequias. Tras la extinción del convento en 1837 pasó al obispado. La litografía de hacia 1845 documenta su portada barroca de tres calles con nichos, la espadaña de tres arcos y chapitel piramidal en el flanco oeste y muros exteriores encalados con zócalo oscuro.',
      certeza:
        'Alta en la silueta frontal, la portada barroca y la torre-espadaña oeste gracias a la litografía de ca. 1845 (catalogada en grunch/caracas, fuentes/imagenes/1845-commons-iglesia-de-san-francisco). Los contrafuertes laterales de consolidación y la distribución exacta de la nave trasera son interpretativos.',
    },
    1889: {
      id: 'san-francisco-hurtado-1889',
      nombre: 'Iglesia de San Francisco · Reforma de Hurtado Manrique',
      subtitulo: 'Nueva fachada neoclásica / neobarroca (1887–1889) · sin torre campanario',
      historia:
        'Por orden de Antonio Guzmán Blanco, el arquitecto Juan Hurtado Manrique remodeló por completo la fachada entre 1887 y 1889 (1888 según Wikipedia), sustituyendo la portada barroca colonial y suprimiendo el campanario frontal para armonizar con la fachada neogótica del antiguo convento (entonces Universidad Central). Su nueva fachada de inspiración en Il Gesù abre tres puertas rectangulares, reubica sobre repisas las tres esculturas genovesas de 1655, abre un gran óculo circular y remata con volutas y frontón curvo partido. Frente al templo crece la Ceiba de San Francisco (plantada hacia 1866).',
      certeza:
        'Alta en la composición de la fachada de tres puertas, pilastras dóricas, óculo, volutas, frontón partido y ausencia de torre (cotejada con fotografías históricas y actuales). La fecha exacta de conclusión de detalles ornamentales oscila entre 1888 y 1890 según las fuentes; la paleta crema-piedra de 1889 es una aproximación.',
    },
    1911: {
      id: 'san-francisco-1911',
      nombre: 'Iglesia de San Francisco (Centenario)',
      subtitulo: 'Envolvente académica consolidada junto a la Universidad Central y la Ceiba',
      historia:
        'En el plano de Razetti de 1911 el templo conserva íntegramente la fachada neoclásica/neobarroca de Juan Hurtado Manrique, flanqueada al oeste por la Universidad Central (hoy Palacio de las Academias) y frente al Palacio Federal Legislativo al norte. En el interior permanecen intactos los retablos barrocos dorados coloniales de Domingo Gutiérrez y la cubierta tradicional de madera y teja criolla.',
      certeza:
        'Alta en la continuidad de la envolvente de Hurtado Manrique (no se inventan reformas arquitectónicas inexistentes entre 1889 y 1911). El tamaño de la Ceiba de San Francisco (~45 años) y el matiz ocre-gris de la fachada son aproximaciones de época.',
    },
    1936: {
      id: 'san-francisco-1936',
      nombre: 'Iglesia de San Francisco (década de 1930)',
      subtitulo: 'Templo bajo custodia jesuita (desde 1922) · plano DCN de 1936',
      historia:
        'Administrada por los padres jesuitas desde 1922, la iglesia aparece rotulada «Iglesia San Francisco» en el plano de la Dirección de Cartografía Nacional de 1936 con su planta rectangular de tres naves (aprox. 19 × 62 m) y fachada orientada al norte. Conserva la fachada de Hurtado Manrique en tonos ocre y piedra gris, techos de teja criolla y, frente al atrio, la ya monumental Ceiba de San Francisco. (La restauración interior de techos y pisos por Luis Malaussena fue posterior, en 1953, y la declaratoria como Monumento Histórico Nacional en 1956.)',
      certeza:
        'Alta en la fachada principal, costado este con pilastras, cubierta de teja criolla y planta interior de tres naves con arcos y pilares dóricos. La restauración de 1953 no se aplica retroactivamente a 1936.',
    },
  };

  return {
    anio,
    colonial,
    postTerremoto,
    conCeiba,
    indiceCaracas,
    ...fichas[anio],
  };
}
