import * as THREE from 'three';

export const ANIOS_TEATRO = Object.freeze([1881,1889,1911,1936]);
export const FUENTES_TEATRO = Object.freeze([
  {titulo:'Fundarte · Inauguración en 1881',url:'https://fundarte.gob.ve/web/2017/01/02/teatro-municipal-con-136-anos-de-historia/'},
  {titulo:'Fundación Arquitectura y Ciudad · Demolición del pórtico en 1949',url:'https://fundaayc.com/2026/05/27/'},
  {titulo:'Commons · Fotografía del teatro en la década de 1880',url:'https://commons.wikimedia.org/wiki/File:Teatro_municipal3.gif'},
  {titulo:'Cámara de Caracas · Historia y postal del edificio',url:'https://camaradecaracas.com/la-camara-caracas-y-sus-historias/cronicas-de-la-ciudad/teatro-municipal-un-poco-de-su-historia/'},
]);

/** Reconstrucción exterior anterior a 1949. Metros nominales, +X este, −Z frente norte.
 * Medidas y pigmentos interpretativos; no es un levantamiento arquitectónico. */
export function crearTeatroMunicipal({anio=1889,nivelDetalle='estudio'}={}) {
  if(!ANIOS_TEATRO.includes(anio))throw new RangeError('Año del Teatro Municipal no representado');
  const edificio=new THREE.Group();edificio.name='Teatro Municipal — pórtico histórico';
  const cubiertas=new THREE.Group();cubiertas.name='Cubiertas';edificio.add(cubiertas);
  let destino=edificio;
  const segmentos=nivelDetalle==='ciudad'?12:24;
  const materiales=Object.fromEntries(Object.entries({muro:0xc6ab8a,piedra:0xe8dcc5,zocalo:0x8e8676,vidrio:0x344b4b,madera:0x564236,metal:0x56675f,techo:0x797b6b}).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.85})]));
  function pieza(geo,mat,x=0,y=0,z=0,grupo=destino){const m=new THREE.Mesh(geo,materiales[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;grupo.add(m);return m;}
  function caja(w,h,d,x,y,z,mat='piedra',grupo=destino){return pieza(new THREE.BoxGeometry(w,h,d),mat,x,y,z,grupo);}
  function cilindro(r1,r2,h,x,y,z,mat='piedra',grupo=destino){return pieza(new THREE.CylinderGeometry(r1,r2,h,segmentos),mat,x,y,z,grupo);}
  function banda(rx,rz,y,h,mat='piedra',inicio=0,fin=Math.PI*2,cz=3,grupo=destino){
    const s=new THREE.Shape(),n=nivelDetalle==='ciudad'?32:64;
    for(let i=0;i<=n;i++){const a=inicio+(fin-inicio)*i/n,x=Math.sin(a)*rx,z=cz-Math.cos(a)*rz;i?s.lineTo(x,-z):s.moveTo(x,-z);}
    for(let i=n;i>=0;i--){const a=inicio+(fin-inicio)*i/n;s.lineTo(Math.sin(a)*(rx-.45),-(cz-Math.cos(a)*(rz-.45)));}
    s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return pieza(g,mat,0,y,0,grupo);
  }
  function arco(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();return s;}
  function vano(grupo,x,y,w,h,puerta=false){
    const exterior=arco(w+.32,h+.16),hueco=new THREE.Path(arco(w,h).getPoints(segmentos));exterior.holes.push(hueco);
    pieza(new THREE.ExtrudeGeometry(exterior,{depth:.22,bevelEnabled:false,curveSegments:segmentos/2}),'piedra',x,y,.1,grupo);
    pieza(new THREE.ShapeGeometry(arco(w,h),segmentos/2),puerta?'madera':'vidrio',x,y,.04,grupo);
    caja(.08,h-w/2,.08,x,y+(h-w/2)/2,.15,'piedra',grupo);
    for(const yy of [h*.28,h*.55,h-w/2])caja(w,.07,.08,x,y+yy,.15,'piedra',grupo);
    for(let i=1;i<6;i++){const a=i*Math.PI/6,l=w/2;const m=caja(.065,l,.07,x+Math.cos(a)*l/2,y+h-w/2+Math.sin(a)*l/2,.15,'piedra',grupo);m.rotation.z=a-Math.PI/2;}
  }
  function oculo(grupo,x,y,r){
    pieza(new THREE.CircleGeometry(r,segmentos),'vidrio',x,y,.03,grupo);
    pieza(new THREE.TorusGeometry(r+.08,.11,6,segmentos),'piedra',x,y,.12,grupo);
    caja(r*1.8,.07,.08,x,y,.15,'piedra',grupo);caja(.07,r*1.8,.08,x,y,.15,'piedra',grupo);
  }
  function panel(x,z,angulo,w,h,alto=0,ventanas='lateral'){
    const g=new THREE.Group();g.position.set(x,alto,z);g.rotation.y=angulo;destino.add(g);
    // Las aberturas atraviesan el muro: no son rectángulos pintados sobre un sólido.
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
    const agujero=(xx,yy,ww,hh)=>{const p=new THREE.Path(arco(ww,hh).getPoints(segmentos).map(v=>new THREE.Vector2(v.x+xx,v.y+yy)));s.holes.push(p);vano(g,xx,yy,ww,hh);};
    if(ventanas==='doble'){agujero(-w*.23,.5,w*.34,2.7);agujero(w*.23,.5,w*.34,2.7);oculo(g,0,4.1,.5);
      pieza(new THREE.TorusGeometry(w*.45,.09,6,segmentos,Math.PI),'piedra',0,2.1,.12,g);}
    else if(ventanas==='vestibulo'){agujero(0,.7,2.3,6.5);agujero(0,10,2,3.2);}
    else {agujero(0,.7,Math.min(2.2,w*.52),5.4);oculo(g,0,7.2,.48);oculo(g,0,11,1.12);}
    const geo=new THREE.ExtrudeGeometry(s,{depth:.45,bevelEnabled:false,curveSegments:segmentos/2});geo.translate(0,0,-.45);pieza(geo,'muro',0,0,0,g);
    for(const xx of [-w/2+.14,w/2-.14]){caja(.26,h-.5,.22,xx,(h-.5)/2,.1,'piedra',g);caja(.6,.3,.38,xx,h-.35,.1,'piedra',g);}
    return g;
  }
  // Sala elíptica: laterales en paños tangentes. El frente se une al vestíbulo.
  const n=24,rx=18,rz=23;
  for(let i=0;i<n;i++){
    const a=(i+.5)*2*Math.PI/n;if(Math.cos(a)>.72)continue;
    const x=rx*Math.sin(a),z=3-rz*Math.cos(a),nx=Math.sin(a)/rx,nz=-Math.cos(a)/rz;
    const w=2*Math.PI/n*Math.hypot(rx*Math.cos(a),rz*Math.sin(a))+.08;
    panel(x,z,Math.atan2(nx,nz),w,13.5);
  }
  for(const [r,y,h,mat] of [[.3,0,.6,'zocalo'],[.2,8.5,.3,'piedra'],[.55,9,.32,'piedra'],[.3,13.5,.35,'piedra'],[.7,14,.28,'piedra']])banda(rx+r,rz+r,y,h,mat);
  // Vestíbulo y peristilo semicircular, visible en la fotografía de los años 1880 y la de 1947.
  const portico=new THREE.Group();portico.name='Pórtico histórico';edificio.add(portico);destino=portico;
  portico.scale.set(.8,1,.8);portico.position.z=-13;
  caja(.45,8.5,9,-10.25,4.25,-17,'muro');caja(.45,8.5,9,10.25,4.25,-17,'muro');
  caja(21,8.5,.45,0,4.25,-12.5,'muro');
  const entrada=new THREE.Group();entrada.position.z=-21.5;entrada.rotation.y=Math.PI;destino.add(entrada);
  const pared=new THREE.Shape();pared.moveTo(-10.5,0);pared.lineTo(10.5,0);pared.lineTo(10.5,8.5);pared.lineTo(-10.5,8.5);pared.closePath();
  for(const x of [-6,0,6]){pared.holes.push(new THREE.Path(arco(3.2,6.4).getPoints(segmentos).map(v=>new THREE.Vector2(v.x+x,v.y+.7))));vano(entrada,x,.7,3.2,6.4,true);}
  const paredGeo=new THREE.ExtrudeGeometry(pared,{depth:.45,bevelEnabled:false});paredGeo.translate(0,0,-.45);pieza(paredGeo,'muro',0,0,0,entrada);
  for(let i=0;i<=6;i++){
    const a=-Math.PI/2+i*Math.PI/6,x=12*Math.sin(a),z=-19-12*Math.cos(a);
    cilindro(.9,1,.35,x,.55,z,'zocalo');cilindro(.72,.85,.3,x,.85,z);cilindro(.46,.59,7.2,x,4.6,z);
    cilindro(.75,.5,.35,x,8.35,z);caja(1.6,.32,1.6,x,8.65,z);
    for(const dx of [-.5,.5])for(const dz of [-.5,.5])cilindro(.22,.12,.4,x+dx,8.25,z+dz);
  }
  for(const [r,y,h] of [[12.8,.02,.2],[12.6,.22,.2],[12.4,.42,.2],[12.7,8.85,.28],[12.85,9.25,.25],[12.6,9.65,.22],[12.5,15.05,.3],[12.8,15.45,.25]])banda(r,r,y,h,'piedra',-Math.PI/2,Math.PI/2,-19);
  for(let i=0;i<6;i++){
    const a=-Math.PI/2+(i+.5)*Math.PI/6;
    panel(12*Math.sin(a),-19-12*Math.cos(a),Math.PI-a,6.45,5.2,9.9,'doble');
  }
  // Cornisa denticulada del pórtico.
  for(let i=0;i<72;i++){const a=-Math.PI/2+i*Math.PI/71;const m=caja(.13,.22,.3,12.65*Math.sin(a),9.52,-19-12.65*Math.cos(a));m.rotation.y=-a;}
  destino=edificio;
  for(const signo of [-1,1]){
    panel(signo*11.1,-14.7,signo*2.39,4.8,13.5);
    for(const z of [-16.75,-22.25])panel(signo*8.4,z,signo*Math.PI/2,5.55,15.45,0,'vestibulo');
  }
  // Cubierta de la sala y linterna, sin aplicar tejas modernas a la fotografía histórica.
  const roof=cilindro(2,18.6,4,0,16.2,3,'techo',cubiertas);roof.scale.z=23.6/18.6;
  cilindro(2,2,2.3,0,19.35,3,'vidrio',cubiertas);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;cilindro(.1,.1,2.4,2*Math.sin(a),19.35,3+2*Math.cos(a),'piedra',cubiertas);}
  cilindro(2.25,2.25,.22,0,20.55,3,'piedra',cubiertas);
  const cupula=pieza(new THREE.SphereGeometry(2.25,segmentos,8,0,Math.PI*2,0,Math.PI/2),'metal',0,20.65,3,cubiertas);cupula.scale.y=.8;
  cilindro(.04,.08,1.3,0,22.9,3,'metal',cubiertas);
  const frontal=pieza(new THREE.CylinderGeometry(0,12.5,1.6,32,1,false,Math.PI/2,Math.PI),'techo',0,16.4,-28.2,cubiertas);frontal.scale.set(.8,1,.8);
  pieza(new THREE.CylinderGeometry(12.4,12.4,.3,32,1,false,Math.PI/2,Math.PI),'piedra',0,9.05,-19,portico);
  caja(24,.3,5,0,9.05,-16.5,'piedra',portico);
  caja(19.2,.25,14,0,15.65,-21.2,'techo',cubiertas);
  // Caja escénica posterior: volumen interpretativo sin inventar ornamentos no documentados.
  caja(18,12,8,0,6,20,'muro');caja(18.8,.4,8.8,0,12.2,20,'piedra');caja(18.4,.3,8.4,0,12.5,20,'techo',cubiertas);
  return {edificio,cubiertas,etapa:{anio,nombre:anio===1881?'Teatro Guzmán Blanco':'Teatro Municipal',subtitulo:'La fachada semicircular anterior a 1949',historia:'Inaugurado en 1881. El pórtico original, las columnas y el vestíbulo curvo permanecen en las épocas de 1889, 1911 y 1936. La reforma de 1930 no se representa como un cambio exterior sin evidencia.',certeza:'Forma exterior basada en fotografías históricas. Dimensiones nominales, pintura, caja escénica y detalles menores interpretativos. No se anticipa la demolición del pórtico de 1949.'}};
}
