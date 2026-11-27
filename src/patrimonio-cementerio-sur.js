import * as T from 'three';

// Calco de la huella y la red visible en el plano DCN de 1936.
// Las coordenadas de referencia son el recorte 5800,11200–8800,14200
// del mosaico (0,5 m/px), reducido a 1200 px. No es un lindero catastral.
const mapa=p=>({x:1.25*p[0]-650,z:1.25*p[1]-650});
const contorno1936=[[215,427],[249,396],[294,372],[351,356],[425,351],[500,358],[575,367],[648,378],[710,392],[768,412],[808,438],[830,470],[831,510],[819,552],[829,592],[847,625],[812,654],[765,678],[714,693],[662,691],[610,675],[558,657],[504,644],[449,638],[393,632],[337,624],[283,614],[236,601],[198,582],[174,564],[181,529],[192,490],[202,457]].map(mapa);
// 1889/1911 no tienen huella mensurable en los planos de la ciudad consultados.
// Este contorno orgánico solo delimita el esquema interpretativo de cuatro cuarteles.
const contornoTemprano=[[-108,-74],[-82,-89],[-30,-92],[26,-88],[80,-79],[107,-61],[109,-20],[106,24],[96,61],[65,82],[13,91],[-40,87],[-83,79],[-106,52],[-110,12]].map(([x,z])=>({x,z}));

function ponerSuelo(t,puntos){
 const s=new T.Shape();s.moveTo(puntos[0].x,-puntos[0].z);
 for(const p of puntos.slice(1))s.lineTo(p.x,-p.z);s.closePath();
 const geo=new T.ShapeGeometry(s,1);geo.rotateX(-Math.PI/2);
 const suelo=t.pieza(geo,'verde',0,.08,0);suelo.receiveShadow=false;suelo.castShadow=false;
}
function distanciaSegmento(p,a,b){
 const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz||1;
 const f=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l));
 return Math.hypot(p.x-(a.x+f*dx),p.z-(a.z+f*dz));
}
function dentro(p,poly){
 let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if(((a.z>p.z)!==(b.z>p.z))&&(p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x))c=!c;
 }return c;
}
function recortarCamino(a,b){
 const f=.04,delta={x:(b.x-a.x)*f,z:(b.z-a.z)*f};
 return [{x:a.x+delta.x,z:a.z+delta.z},{x:b.x-delta.x,z:b.z-delta.z}];
}
function dibujarCamino(t,a,b,ancho){
 const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),m=t.caja(l,.3,ancho,(a.x+b.x)/2,.5,(a.z+b.z)/2,'camino');
 m.rotation.y=Math.atan2(-dz,dx);m.castShadow=false;m.receiveShadow=false;
}
function crear(t,anio,meta){
 const {caja,cilindro,pieza,cruz}=t;
 const n1936=anio===1936,usaCalco1936=anio>=1936,poly=usaCalco1936?contorno1936:contornoTemprano;
 meta.trazado=n1936?'calco aproximado de huella y calles interiores del plano DCN de 1936':anio===1946?'referencia geométrica de 1936; no hay calco independiente del plano de 1946 disponible':'esquema interpretativo de cuatro cuarteles; no medible en los mapas de la ciudad de 1889/1911';
 meta.secciones=usaCalco1936?3:4;meta.huellaInterpretativa=anio!==1936;meta.areaCartografiada=n1936;meta.huellaDeReferencia=usaCalco1936?1936:null;
 ponerSuelo(t,poly);
 const caminos=[];
 if(usaCalco1936){
  // Eje de acceso y calles transversales digitalizadas de forma aproximada.
  caminos.push([[194,550],[812,482],5.5]);
  for(const [x0,y0,x1,y1] of [[322,367,338,614],[422,352,430,635],[523,360,538,650],[625,372,649,675],[728,397,751,665]])caminos.push([[x0,y0],[x1,y1],3.7]);
  for(const [y,x0,x1] of [[423,290,788],[474,235,817],[525,206,815],[582,193,817],[628,271,800]])caminos.push([[x0,y],[x1,y-8],3.3]);
 }else{
  // El reglamento de 1876 describe cuatro cuarteles y dos avenidas N–S de 4m.
  // Su ubicación dentro de la propiedad y la huella dibujada aquí son interpretativas.
  caminos.push([[-35,-91],[-35,88],4],[[35,-91],[35,88],4]);
 }
 for(const [[x0,y0],[x1,y1],w] of caminos){
  const a=usaCalco1936?mapa([x0,y0]):{x:x0,z:y0},b=usaCalco1936?mapa([x1,y1]):{x:x1,z:y1},tramo=recortarCamino(a,b);
  dibujarCamino(t,tramo[0],tramo[1],w);
 }

 // Sepulturas tipológicas deterministas, interrumpidas por las avenidas.
 const paso=usaCalco1936?24:20,margin=usaCalco1936?12:8;let tumba=0,monumento=0;
 const minX=Math.min(...poly.map(p=>p.x)),maxX=Math.max(...poly.map(p=>p.x)),minZ=Math.min(...poly.map(p=>p.z)),maxZ=Math.max(...poly.map(p=>p.z));
 for(let z=minZ+margin,iz=0;z<maxZ-margin;z+=paso,iz++)for(let x=minX+margin,ix=0;x<maxX-margin;x+=paso,ix++){
  const p={x:x+((iz%2)*paso*.45),z};if(!dentro(p,poly))continue;
  const cerca= caminos.some(([aa,bb,w])=>distanciaSegmento(p,usaCalco1936?mapa(aa):{x:aa[0],z:aa[1]},usaCalco1936?mapa(bb):{x:bb[0],z:bb[1]})<w/2+3);
  if(cerca||((ix*7+iz*11)%13===0))continue;
  const piedra=caja(1.35,.22,2.4,p.x,.25,p.z,'piedra');piedra.castShadow=false;piedra.receiveShadow=false;tumba++;
  if((ix*5+iz*3)%17===0){const pedestal=caja(1.45,.65,.35,p.x,.65,p.z-1.1,'claro');pedestal.castShadow=false;pedestal.receiveShadow=false;monumento++;}
 }
 // Arbolado genérico; el mapa indica árboles, no identifica su especie.
 let arboles=0;const pasoArbol=usaCalco1936?47:28;
 for(let z=minZ+20,iz=0;z<maxZ-20;z+=pasoArbol,iz++)for(let x=minX+20,ix=0;x<maxX-20;x+=pasoArbol,ix++){
  const p={x:x+((iz%2)*14),z:z+((ix%3)*7)};if(!dentro(p,poly))continue;
  if(caminos.some(([aa,bb,w])=>distanciaSegmento(p,usaCalco1936?mapa(aa):{x:aa[0],z:aa[1]},usaCalco1936?mapa(bb):{x:bb[0],z:bb[1]})<w/2+6))continue;
  if((ix*3+iz*5)%(usaCalco1936?4:3)!==0)continue;
  const h=5+((ix*7+iz*11)%4);
  const trunk=cilindro(.13,.22,h*.35,p.x,h*.175,p.z,'tronco');trunk.castShadow=false;trunk.receiveShadow=false;
  const crown=pieza(new T.SphereGeometry(1,8,6),'hoja',p.x,h*.52,p.z);crown.scale.set(1.25,h*.48,1.25);crown.castShadow=false;crown.receiveShadow=false;arboles++;
 }
 meta.conteoTipologico={tumbas:tumba,panteonesInterpretativos:monumento,arboles};
}

export function construirCementerioSur(t,techo,anio,meta){crear(t,anio,meta);}
