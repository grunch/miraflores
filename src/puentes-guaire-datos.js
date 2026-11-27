const SILVA='https://www.academia.edu/8853323/tradici%C3%B3n_acad%C3%A9mica_y_la_imagen_del_dise%C3%B1o_estructural';
const FAC='https://fundaayc.com/2023/10/15/sabia-usted-107/';
export const ANIOS_PUENTES=[1772,1843,1889,1911,1936,1946];
const fuentes=[['Silva Contreras, Tecnología y Construcción 20-II (2004), pp. 29–42',SILVA],['Fotografías históricas reproducidas por FAC',FAC]];
export const CATALOGO_PUENTES={
 sucre:{nombre:'Constitución / Sucre',anioVista:1911,radioVista:31,fuentes,nota:'Dos estructuras en el mismo cruce de la calle Sur 7: Constitución en 1889 y Sucre metálico en 1911. Sucre: luz documentada de 60 m; ancho y altura interpretativos. Desde 1936 existe el sustituto de concreto, cuyo alzado falta: no se conserva aquí el puente metálico trasladado.'},
 hierro:{nombre:'Puente de Hierro · Regeneración',anioVista:1889,radioVista:47,fuentes,nota:'Vigas inferiores, columnas y barandas según grabado histórico. Nueve apoyos intermedios documentados; longitud total, altura y pigmentos de este estudio son nominales. La sustitución de 1937 impide reutilizar este modelo en 1946.'},
 dolores:{nombre:'Puente Dolores',anioVista:1911,radioVista:31,fuentes,nota:'Armaduras superiores, arriostramiento y tablero de madera. Luz 60 m, ancho 8 m y tablero a 5 m sobre el río: medidas históricas citadas. Las reformas desde 1915 y la desaparición posterior requieren otras variantes; la estructura de 1911 no se prolonga automáticamente.'},
 restaurador:{nombre:'Puente Restaurador',anioVista:1911,radioVista:52,fuentes,nota:'Paseo con plazoleta central y veinte faroles. Largo 100,50 m y ancho 8 m documentados. Radio de plazoleta, apoyos y ornamentación simplificada interpretativos. Las reparaciones de 1932 no permiten asegurar una restitución idéntica en las fechas posteriores.'},
 diciembre:{nombre:'Puente 19 de Diciembre',anioVista:1911,radioVista:31,fuentes,nota:'Vigas inferiores: tramo central de 30 m y dos laterales de 15 m. Pilas de concreto. Se modela el núcleo de tres vanos; los accesos adicionales del alzado publicado no están incluidos. Ancho, detalle de barandas y cotas verticales interpretativos.'},
 ayacucho:{nombre:'Puente Ayacucho',anioVista:1936,radioVista:33,fuentes:[...fuentes,['FAC: inauguración de 1924','https://fundaayc.com/2022/09/08/1924-inauguracion-del-puente-ayacucho/']],nota:'Arcos de concreto, montantes abiertos y balaustrada según fotografía histórica. Modelo de proporciones interpretativas; no se trasladan las ampliaciones viales actuales. Debe medirse la luz y el perfil de cada vano antes de instalar.'},
};
export function estadoPuente(id,anio){
 if(!CATALOGO_PUENTES[id]||!ANIOS_PUENTES.includes(anio))throw new RangeError('Puente o época no admitidos');
 let presente=false,modelo=null,fase='Este puente todavía no existe';
 if(id==='sucre'&&anio>=1889){presente=true;modelo=anio===1889?'constitucion':anio===1911?'bowstring':null;fase=anio===1889?'Puente Constitución · estructura anterior':anio===1911?'Puente Sucre · estructura metálica de 1895':'Puente Sucre de concreto · alzado pendiente';}
 if(id==='hierro'&&anio>=1889){presente=true;modelo=anio<1946?'hierro':null;fase=modelo?'Puente de Hierro · estructura anterior a 1937':'Puente sustituto de 1937 · alzado pendiente';}
 if(id==='dolores'&&anio>=1911){presente=anio===1911?true:null;modelo=anio===1911?'dolores':null;fase=modelo?'Puente Dolores · antes de las reformas de 1915':'Estructura de 1911 retirada; estado del cruce por documentar';}
 if(['restaurador','diciembre'].includes(id)&&anio>=1911){presente=anio===1911?true:null;modelo=anio===1911?id:null;fase=modelo?'Estructura documentada hacia 1911':'Reformas posteriores · variante no restituida';}
 if(id==='ayacucho'&&anio>=1936){presente=true;modelo='ayacucho';fase='Puente Ayacucho · posterior a 1924';}
 return {id,anio,presente,modelo,fase};
}
