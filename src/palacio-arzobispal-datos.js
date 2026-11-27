export const ANIOS_ARZOBISPAL=Object.freeze([1772,1843,1889,1911,1936,2025]);
export const FUENTES_ARZOBISPAL=Object.freeze([
 {titulo:'IPC / IAM · historia, seis vanos y restauración de 1979–1980',url:'https://iamvenezuela.org/2016/06/palacio-arzobispal/'},
 {titulo:'Postal Bernardo Roswaag · fachada histórica (fecha aproximada)',url:'https://fotogaleriaweb.wordpress.com/2016/09/19/la-postal-el-instagran-de-la-caracas-de-antano/'},
 {titulo:'JoseGre12 · fachada norte, 2025 · Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:Palacio_Arzobispal_Caracas.jpg'},
 {titulo:'Guillermo Ramos Flamerich · fachada restaurada · Commons',url:'https://commons.wikimedia.org/wiki/File:Palacio_Arzobispal,_Caracas.jpg'},
 {titulo:'Arquidiócesis de Caracas · erección en 1803',url:'https://arquidiocesiscaracas.com/fundacion/'},
]);
export function etapaArzobispal(anio){
 if(!ANIOS_ARZOBISPAL.includes(anio))throw new RangeError('Año no disponible para el Palacio Arzobispal.');
 const colonial=anio<1876,actual=anio===2025;
 return {anio,colonial,actual,id:colonial?'colonial':actual?'restaurado':'guzmancista',nombre:anio===1772?'Palacio Episcopal':'Palacio Arzobispal',
 subtitulo:colonial?'Residencia y despacho · hipótesis anterior a 1876':actual?'Referencia actual · después de la restauración':'Reforma de 1876–1877 · cornisa y pretil',
 historia:colonial?'El conjunto ya existía en el siglo XVIII. Se propone una casa de dos plantas, zaguanes y patios. El nombre cambia tras la creación de la Arquidiócesis en 1803; no se inventa una reforma entre 1772 y 1843.':actual?'Las fotografías modernas muestran seis balcones, dos accesos y alero de tejas. IAM/IPC registra una restauración de la fachada en 1979–1980. Esta vista sirve para comparar, no es una época del mapa.':'La postal de Bernardo Roswaag muestra vanos de arco rebajado, balcones de hierro, bandas horizontales, cornisa y pretil con paneles. Se propone esta misma envolvente para 1889, 1911 y 1936, sin inventar cambios entre esas fechas.',
 certeza:colonial?'Baja: sin alzado colonial ni linderos acotados. Seis ejes y dos patios se proyectan retrospectivamente como hipótesis, no como hechos de 1772.':actual?'Media en la fachada norte; medidas, laterales, cubiertas y planta interior son interpretativos.':'Media en los elementos de fachada; baja en su datación precisa. La postal está rotulada circa 1920 por un sitio secundario. Su aplicación a 1889 y 1936 es una hipótesis de continuidad. Colores no verificados.'};
}
