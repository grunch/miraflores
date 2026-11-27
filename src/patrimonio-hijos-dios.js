import * as T from 'three';
// Lectura aproximada DCN1936; ver docs/prioridades/hijos-dios-georreferencia.json.
import {CONTORNO_HIJOS,DIVISIONES_HIJOS} from './patrimonio-hijos-dios-planta.js';
export {CONTORNO_HIJOS,DIVISIONES_HIJOS};

export function construirHijosDios(t,cubiertas,metadatos){
 const {caja,grupo,pieza,cipres,cruz}=t;
 Object.assign(metadatos,{recintos:3,hilerasNichos:4,capillaDocumentada:false,
  plantaAproximada:'DCN1936, continuidad topológica cotejada1889/1946'});
 const shape=new T.Shape();
 CONTORNO_HIJOS.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);
 pieza(geo,'verde',0,.12,0).name='recinto-cartografico';
 // Altura5.5m/espesor.65m y dimensiones de nichos son interpretativos.
 // Cuatro hileras observables en fotos; no se atribuyen nombres a los sepulcros.
 function tramo(a,b,dosCaras=false){
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);
  const g=grupo((a[0]+b[0])/2,0,(a[1]+b[1])/2,-Math.atan2(dz,dx));
  caja(l,5.5,.65,0,2.75,0,'cal',g);
  for(const cara of dosCaras?[-1,1]:[1]){
   const n=Math.max(1,Math.floor((l-1)/2.3));
   for(let k=0;k<n;k++)for(let r=0;r<4;r++){
    const x=(k-(n-1)/2)*(l-1)/n;
    const placa=pieza(new T.PlaneGeometry(1.65,1.0),(k+r)%7===0?'sombra':'piedra',x,.85+r*1.2,cara*.36,g);
    if(cara<0)placa.rotation.y=Math.PI;
   }
  }
 }
 // Polígono en sentido horario en pantalla: +Z local de cada tramo da al patio.
 for(let i=0;i<CONTORNO_HIJOS.length;i++){
  const a=CONTORNO_HIJOS[i],b=CONTORNO_HIJOS[(i+1)%CONTORNO_HIJOS.length];
  if(i===CONTORNO_HIJOS.length-1){
   // Abertura sur del recinto central. Ancho4m interpretativo, sin portal inventado.
   tramo(a,[8,a[1]]);tramo([4,b[1]],b);
  }else tramo(a,b);
 }
 for(const [a,b] of DIVISIONES_HIJOS)tramo(a,b,true);
 // Campos abiertos: sepulturas dispersas, no cuadrícula pretendidamente catastral.
 for(const [cx,cz,w] of [[-46,0,40],[20,1,36],[65,6,28]]){
  for(let i=0;i<12;i++){
   const x=cx+(((i*17)%23)/23-.5)*w,z=cz+(((i*13)%19)/19-.5)*30;
   caja(1.5,.25,2.5,x,.25,z,'piedra');
   if(i%3===0)cruz(x,.4,z-1,1.2);else caja(.8,.9,.18,x,.7,z-1,'piedra');
  }
 }
 // Vegetación tipológica; no inventario de árboles individuales.
 for(const [x,z,h] of [[-65,-19,9],[-28,-20,10],[-54,17,8],[4,-13,9],[35,17,8],[68,15,9],[79,2,10]])cipres(x,z,h);
}
