/** Fechas del visor: sin trasladar la fachada de 1874 a la Caracas colonial. */
export const FUENTES_CASA = Object.freeze([
  {titulo:'Wikipedia · cronología',url:'https://es.wikipedia.org/wiki/Casa_Amarilla_de_Caracas'},
  {titulo:'Fundación Empresas Polar · Diccionario de Historia de Venezuela',url:'https://bibliofep.fundacionempresaspolar.org/dhv/entradas/c/casa-amarilla/'},
  {titulo:'IAM Venezuela · ficha basada en el catálogo del IPC',url:'https://iamvenezuela.org/2016/07/casa-amarilla/'},
]);
export const ANIOS_CASA = Object.freeze([1772,1810,1843,1889,1911,1936]);
export function etapaCasaAmarilla(anio) {
  if(!ANIOS_CASA.includes(anio))throw new RangeError('El estudio admite 1772, 1810, 1843, 1889, 1911 y 1936.');
  const colonial=anio<1812, neoclasica=anio>=1874;
  return {
    anio, colonial, neoclasica, cubiertaMixta:anio>=1930,
    id:colonial?'cabildo-y-carcel':neoclasica?'casa-amarilla':'casa-de-gobierno',
    nombre:colonial?'Ayuntamiento y Real Cárcel':neoclasica?'Casa Amarilla':'Casa de Gobierno',
    subtitulo:({1772:'Dos inmuebles coloniales · solar de un cuarto de manzana',1810:'La Casa del Cabildo · 19 de abril',1843:'El conjunto reunido en 1842',1889:'Residencia presidencial · reforma de Hurtado Manrique',1911:'Después de la residencia presidencial',1936:'Cancillería · cubiertas parcialmente reformadas'})[anio],
    historia:({1772:'El Ayuntamiento estaba terminado en 1750, contiguo a la cárcel. Se representa el conjunto anterior a su unificación.',1810:'El Cabildo fue escenario del 19 de abril de 1810. No se supone una reforma arquitectónica entre 1772 y 1810.',1843:'Tras los daños de 1812 y posteriores reparaciones, los inmuebles se reunieron como Casa de Gobierno en 1842.',1889:'La reforma de 1874 transformó la fachada y añadió el pabellón sur. El nombre y el color amarillo se consolidaron en 1877.',1911:'Se mantiene la envolvente del siglo XIX. La asignación de todo el inmueble a Relaciones Exteriores ocurrió en 1912.',1936:'Se representa la reforma parcial de cubiertas de hacia 1930; la sustitución restante llegó en 1957. No se añade la ampliación de 1938.'})[anio],
    certeza:colonial?'Baja en el alzado: volúmenes, patios y ritmo de vanos son hipótesis. No se ha localizado un levantamiento de 1750.':anio===1843?'Media en la silueta: Bolet (1870) se usa retrospectivamente; no prueba todos los detalles de 1843.':'Media en fachada; baja en medidas y distribución posterior. La ubicación exacta de las platabandas de 1930 es hipotética.',
  };
}
