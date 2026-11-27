import * as THREE from 'three';
import {optimizarPanteon} from './optimizar-panteon.js';

export const FUENTES_SILENCIO = [
  {titulo:'Cronología · Reurbanización El Silencio',url:'https://es.wikipedia.org/wiki/Reurbanizaci%C3%B3n_El_Silencio'},
  {titulo:'Fotografías de Jesús Yépez · Entre Rayas (2011)',url:'https://entrerayas.com/a-66-anos-de-la-inauguracion-de-la-reurbanizacion-el-silencio/'},
  {titulo:'Perspectiva histórica numerada · Stavros Stavrides, p. 2',url:'https://stavrosstavrides.com/wp-content/uploads/2023/07/Housing-Venezuela.pdf'},
  {titulo:'Fotografías de 1945 · El Archivo',url:'https://elarchivo.org/retratos-hitos-y-bastidores-el-silencio-entre-el-proyecto-y-la-cronica/'}
];

/** Estudio interpretativo de 1945, en metros nominales. X este, Z sur, Y arriba.
 * No es un levantamiento topográfico. Véase docs/integracion-caracas-el-silencio.md.
 */
export function crearElSilencio({anio=1945,optimizar=true}={}) {
  if(anio!==1945) throw new RangeError('Este estudio representa el conjunto de 1945; otras fechas requieren investigación propia.');
  const edificio=new THREE.Group(); edificio.name='El Silencio · 1945';
  edificio.userData={anio,autor:'Carlos Raúl Villanueva',interpretativo:true,unidades:'metros nominales'};
  const materiales=Object.fromEntries(Object.entries({fachada:0xe7ce92,piedra:0xaaa38d,marco:0xf0e4c6,vidrio:0x425955,hierro:0x394842,techo:0xbbb7a5,pavimento:0xd6c8ad,calle:0x858880,cesped:0x87996b,hoja:0x53794d,hojaClara:0x6d8b52,tronco:0x8a7653,agua:0x6eaaa3,escultura:0xbeb799}).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.88})]));
  const cubiertas=[],bloques=[],huellas=[];
  const cajaGeo=new THREE.BoxGeometry(1,1,1);
  function malla(g,geo,mat,x,y,z){const m=new THREE.Mesh(geo,materiales[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function caja(g,w,h,d,x,y,z,mat='fachada'){const m=malla(g,cajaGeo,mat,x,y,z);m.scale.set(w,h,d);return m;}
  const columnaGeo=new THREE.LatheGeometry([[.38,0],[.48,.15],[.43,.35],[.56,1.2],[.49,2.15],[.35,2.65],[.43,2.72],[.43,2.91]].map(p=>new THREE.Vector2(...p)),12);
  const esferaGeo=new THREE.IcosahedronGeometry(1,1);
  function arbol(g,x,z,altura=8,palma=false){
    malla(g,new THREE.CylinderGeometry(palma?.16:.22,palma?.28:.4,altura,7),'tronco',x,altura/2,z);
    if(palma){
      for(let j=0;j<9;j++){
        const a=j*Math.PI*2/9, r=3.8;
        const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(r*.55,1.05,r,0);shape.quadraticCurveTo(r*.6,-.7,0,0);
        const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.rotateZ(.22);geo.rotateY(a);
        const hoja=malla(g,geo,j%2?'hoja':'hojaClara',x,altura,z);hoja.material=materiales[j%2?'hoja':'hojaClara'];hoja.material.side=THREE.DoubleSide;
      }
    }else{const copa=malla(g,esferaGeo,'hoja',x,altura,z);copa.scale.set(3.5,3.9,3.5);const copa2=malla(g,esferaGeo,'hojaClara',x+1.3,altura+1,z-.8);copa2.scale.set(2.7,2.6,2.8);}
  }
  const entorno=new THREE.Group();entorno.name='Plazas, calles y jardines';edificio.add(entorno);
  caja(entorno,350,.3,365,0,-.23,42,'pavimento');
  // Eje de la avenida Bolívar y calles entre las siete piezas; sin torres posteriores.
  caja(entorno,240,.05,28,69,-.04,0,'calle');
  caja(entorno,38,.05,236,-24,-.04,8,'calle');
  caja(entorno,150,.05,16,63,-.04,93,'calle');
  caja(entorno,150,.05,16,63,-.04,-93,'calle');
  caja(entorno,160,.05,14,-89,-.04,132,'calle');
  caja(entorno,18,.05,175,-100,-.04,66,'calle');
  function jardin(x,z,w,d,palmas=false){
    caja(entorno,w,.12,d,x,.02,z,'cesped');
    const n=Math.max(2,Math.floor(w*d/260));
    for(let i=0;i<n;i++){const tx=x-w*.36+((i*0.61803398875)%1)*w*.72,tz=z-d*.32+((i*.381966+.2)%1)*d*.64;arbol(entorno,tx,tz, palmas?10+(i%3):5.5+(i%4),palmas);}
  }
  function nuevoBloque(id,descripcion){const g=new THREE.Group();g.name=`Bloque ${id}`;g.userData={id,descripcion};edificio.add(g);bloques.push(g);return g;}
  // Cada ala tiene comercio retranqueado, galería transitable y viviendas encima.
  function ala(g,a,b,{pisos=4,ancho=12,arcos=true,balcones=true}={}){
    const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),h=4.4+(pisos-1)*3.15;
    const parte=new THREE.Group();parte.name='Ala';parte.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);parte.rotation.y=-Math.atan2(dz,dx);g.add(parte);
    huellas.push({bloque:g.userData.id,a:[...a],b:[...b],ancho,pisos});
    caja(parte,l,h-4.3,ancho,0,(h+4.3)/2,0);
    caja(parte,l,.25,ancho+.5,0,4.3,0,'piedra');
    caja(parte,l,3.85,ancho-6,0,2.05,0,'piedra');
    caja(parte,l+1,.2,ancho+1,0,.1,0,'pavimento');
    const n=Math.max(2,Math.round(l/4.8)),paso=l/n;
    for(const lado of [-1,1]){
      const z=lado*(ancho/2-.38);
      for(let i=0;i<=n;i++)malla(parte,columnaGeo,'piedra',-l/2+i*paso,.22,z);
      for(let i=0;i<n;i++){
        const x=-l/2+(i+.5)*paso;
        if(arcos){
          // Intradós circular abierto: sólo la enjuta superior tiene geometría.
          const s=new THREE.Shape();const r=paso/2-.36;
          s.moveTo(-paso/2,4.15);s.lineTo(paso/2,4.15);s.lineTo(paso/2,2.96);s.lineTo(r,2.96);
          s.absellipse(0,2.96,r,1.08,0,Math.PI,false,0);s.lineTo(-paso/2,2.96);s.closePath();
          // Arco rebajado, con una enjuta continua hasta la losa.
          const geo=new THREE.ExtrudeGeometry(s,{depth:.6,bevelEnabled:false,curveSegments:12});
          geo.translate(0,0,-.3);
          malla(parte,geo,'fachada',x,0,z);
        }else caja(parte,paso,.8,.65,x,3.85,z,'fachada');
        caja(parte,paso-1.05,2.4,.10,x,1.65,lado*(ancho/2-3.03),'vidrio');
        caja(parte,.1,2.4,.12,x,1.65,lado*(ancho/2-3.10),'marco');
        for(let f=0;f<pisos-1;f++){
          const y=5.65+f*3.15,zz=lado*(ancho/2+.04),balcon=balcones&&(i%4===1||i%4===2);
          caja(parte,balcon?2.3:1.8,balcon?2.2:1.65,.16,x,y,zz,'marco');
          caja(parte,balcon?1.95:1.48,balcon?1.95:1.38,.18,x,y,zz+lado*.1,'vidrio');
          caja(parte,.065,balcon?1.95:1.38,.20,x,y,zz+lado*.2,'marco');
          caja(parte,balcon?2.45:2,.14,.35,x,y-(balcon?1.15:.9),zz,'piedra');
          if(balcon){
            const by=y-1.15,bz=lado*(ancho/2+.95),bw=paso*.88;
            caja(parte,bw,.2,1.95,x,by,bz,'marco');
            caja(parte,bw,.08,.09,x,by+1.08,bz+lado*.88,'hierro');
            for(let k=0;k<=8;k++)caja(parte,.05,.91,.05,x-bw/2+k*bw/8,by+.58,bz+lado*.88,'hierro');
            for(const extremo of [-1,1]){caja(parte,.1,1,1.8,x+extremo*bw/2,by+.6,bz,'marco');}
          }
        }
      }
    }
    // Ventanas de testero: también las fachadas cortas tienen huecos.
    for(const extremo of [-1,1])for(const z of [-ancho*.23,ancho*.23])for(let f=0;f<pisos-1;f++){
      const y=5.65+f*3.15,x=extremo*(l/2+.04);
      caja(parte,.16,1.65,1.8,x,y,z,'marco');
      caja(parte,.18,1.38,1.48,x+extremo*.1,y,z,'vidrio');
      caja(parte,.20,1.38,.065,x+extremo*.2,y,z,'marco');
      caja(parte,.35,.14,2,x,y-.9,z,'piedra');
    }
    const cubierta=new THREE.Group();cubierta.name=`Cubierta bloque ${g.userData.id}`;parte.add(cubierta);cubiertas.push(cubierta);
    caja(cubierta,l+.5,.28,ancho+.55,0,h+.12,0,'techo');
    for(const lado of [-1,1])caja(cubierta,l+.65,.65,.24,0,h+.52,lado*ancho/2,'marco');
    for(const lado of [-1,1])caja(cubierta,.24,.65,ancho,lado*l/2,h+.52,0,'marco');
  }
  const b1=nuevoBloque(1,'Cuerpo central elevado y alas hacia El Calvario');
  ala(b1,[-57,-55],[-57,55],{pisos:7,ancho:13});
  ala(b1,[-57,-81],[-57,-55],{ancho:13});ala(b1,[-57,55],[-57,81],{ancho:13});
  for(const z of [-75,-45,-15,15,45,75])ala(b1,[-64,z],[-94,z],{pisos:4,ancho:10,arcos:false,balcones:false});
  for(const z of [-60,-30,0,30,60])jardin(-80,z,17,14);
  for(const [id,signo] of [[2,1],[3,-1]]){
    const b=nuevoBloque(id,'Frente de la avenida Bolívar y patios abiertos');
    ala(b,[-1,signo*36],[139,signo*36],{arcos:false});
    for(const x of [5,38,71,104,133])ala(b,[x,signo*43],[x,signo*76],{ancho:10,arcos:false,balcones:false});
    for(const x of [21.5,54.5,87.5,119])jardin(x,signo*62,16,22);
  }
  const b4=nuevoBloque(4,'Pieza septentrional con alas de retorno');
  ala(b4,[-38,-113],[84,-113]);ala(b4,[-38,-119],[-38,-145],{ancho:10,balcones:false});ala(b4,[84,-119],[84,-145],{ancho:10,balcones:false});jardin(23,-133,96,19);
  const b5=nuevoBloque(5,'Pieza occidental quebrada al pie de El Calvario');
  ala(b5,[-151,8],[-151,91]);ala(b5,[-145,8],[-116,17],{balcones:false});ala(b5,[-145,91],[-119,82],{balcones:false});jardin(-132,49,17,49);
  const b6=nuevoBloque(6,'Patio triangular');
  ala(b6,[-93,91],[-39,100],{ancho:10});ala(b6,[-39,100],[-52,120],{ancho:10,balcones:false});ala(b6,[-52,120],[-93,91],{ancho:10,balcones:false});jardin(-62,105,7,5);
  const b7=nuevoBloque(7,'Manzana de patio cerrado; primer bloque inaugurado en 1944');
  ala(b7,[-93,149],[-20,149]);ala(b7,[-93,208],[-20,208]);ala(b7,[-93,155],[-93,202],{ancho:12});ala(b7,[-20,155],[-20,202],{ancho:12});jardin(-56,178,50,35);
  // Dos islas de la plaza Urdaneta (hoy O’Leary), abiertas al eje Bolívar.
  const plazas=new THREE.Group();plazas.name='Plaza Urdaneta y Plaza Miranda';edificio.add(plazas);
  function fuente(x,z){
    const vaso=malla(plazas,new THREE.CylinderGeometry(7.3,7.3,.6,48),'piedra',x,.4,z);vaso.scale.z=.72;
    const agua=malla(plazas,new THREE.CylinderGeometry(6.8,6.8,.08,48),'agua',x,.74,z);agua.scale.z=.72;
    caja(plazas,2.8,.9,2.2,x,1.15,z,'escultura');
    // Siluetas alusivas a Las Toninas; no reproducción escultórica de Narváez.
    for(const signo of [-1,1]){
      const torso=malla(plazas,esferaGeo,'escultura',x+signo*.8,2.15,z);torso.scale.set(.65,1.05,.48);torso.rotation.z=signo*.38;
      const cabeza=malla(plazas,esferaGeo,'escultura',x+signo*1.1,3.2,z);cabeza.scale.set(.34,.43,.34);
      const pez=malla(plazas,esferaGeo,'escultura',x+signo*2,1.5,z);pez.scale.set(1.5,.5,.5);pez.rotation.z=signo*.4;
    }
  }
  for(const z of [-49,49]){
    caja(plazas,27,.22,57,-23,.12,z,'pavimento');fuente(-23,z);
    for(const dx of [-9,9])for(const dz of [-21,21])arbol(plazas,-23+dx,z+dz,10,true);
    for(const dz of [-16,16]){caja(plazas,7,.17,1,-23,.65,z+dz,'piedra');for(const dx of [-2.5,2.5])caja(plazas,.3,.6,.8,-23+dx,.35,z+dz,'piedra');}
  }
  caja(plazas,53,.2,66,20,.12,179,'pavimento');
  for(const x of [3,37])for(const z of [157,178,199]){caja(plazas,10,.1,12,x,.26,z,'cesped');arbol(plazas,x,z,7);}
  caja(plazas,1.8,2.3,1.8,20,1.35,178,'piedra');
  edificio.userData.huellas=huellas;
  if(optimizar)optimizarPanteon(edificio);
  return {edificio,bloques,cubiertas,plazas,entorno,huellas,anio};
}
