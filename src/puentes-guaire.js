import * as T from 'three';
import {taller} from './patrimonio-geometria.js';
import {CATALOGO_PUENTES,ANIOS_PUENTES,estadoPuente} from './puentes-guaire-datos.js';
export {CATALOGO_PUENTES,ANIOS_PUENTES,estadoPuente};
/** +X longitudinal, +Y vertical. Origen al centro del cruce, datum de estudio en y=0. */
export function crearPuente({id='sucre',anio=1911,nivelDetalle='estudio'}={}){
 if(!['estudio','ciudad'].includes(nivelDetalle))throw new RangeError('Detalle no admitido');
 const etapa=estadoPuente(id,anio),edificio=new T.Group(),tablero=new T.Group();edificio.name=`puente-${id}-${anio}`;tablero.name='tablero';edificio.add(tablero);
 const ficha=CATALOGO_PUENTES[id],metadatos={id,modelo:etapa.modelo,cotaTablero:0,apoyosIntermedios:0,dimensionesInterpretativas:true,orientacion:'+X longitudinal',instalado:false};
 if(!etapa.modelo)return {edificio,tablero,cubiertas:tablero,etapa,ficha,metadatos};
 const t=taller(edificio,tablero,nivelDetalle),{caja,cilindro,pieza}=t;
 const tipo=etapa.modelo;let L=60,W=8,Y=5,N=0;
 if(tipo==='constitucion'){L=59.56;W=6.76;N=2;}
 if(tipo==='hierro'){L=90;W=7;N=9;}
 if(tipo==='restaurador'){L=100.5;N=8;}
 if(tipo==='diciembre'){L=60;N=2;}
 if(tipo==='ayacucho'){L=64;W=10;Y=7;N=1;}
 Object.assign(metadatos,{largo:L,ancho:W,cotaTablero:Y,apoyosIntermedios:N});
 function barra(a,b,ancho=.13,prof=ancho,mat='hierro',padre=edificio){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);const m=caja(ancho,d.length(),prof,...p.clone().add(q).multiplyScalar(.5).toArray(),mat,padre);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function farol(x,z,h=3){cilindro(.06,.12,h,x,Y+h/2,z,'hierro');caja(.5,.1,.5,x,Y+h-.1,z,'hierro');caja(.31,.5,.31,x,Y+h+.2,z,'claro');cilindro(0,.36,.35,x,Y+h+.6,z,'hierro');}
 function baranda(x0,x1,z,mat='hierro',base=Y){
  for(const h of [.15,1.05])barra([x0,base+h,z],[x1,base+h,z],.07,.1,mat);
  const n=Math.ceil((x1-x0)/.65);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;barra([x,base+.12,z],[x,base+1.05,z],.055,.055,mat);}
 }
 // Tablero con espesor real; al ocultarlo quedan vigas y arriostramientos visibles.
 caja(L,.28,W,0,Y-.14,0,['constitucion','dolores','bowstring','hierro'].includes(tipo)?'madera':'camino',tablero);
 for(const z of [-1,1])caja(L,.18,.8,0,Y+.05,z*(W/2-.4),'piedra',tablero);
 for(const x of [-L/2,L/2]){caja(2,Y,W+1,x,Y/2,0,'piedra');for(const z of [-W/2,W/2])caja(2,Y+1.1,.7,x,(Y+1.1)/2,z,'piedra');}
 if(tipo==='bowstring'||tipo==='dolores'){
  const n=tipo==='bowstring'?8:12,H=tipo==='bowstring'?8:7;
  const altura=i=>Y+(tipo==='bowstring'?H*(1-Math.pow(2*i/n-1,2)):H*(.72+.28*Math.sin(Math.PI*i/n)));
  for(const z of [-W/2+.3,W/2-.3]){
   barra([-L/2,Y-.3,z],[L/2,Y-.3,z],.32,.25);
   for(let i=0;i<n;i++){
    const x=-L/2+i*L/n,xx=x+L/n,ya=altura(i),yb=altura(i+1);
    barra([x,ya,z],[xx,yb,z],.28,.24);barra([x,Y,z],[x,ya,z],.15,.18);
    if(tipo==='dolores'||i>0&&i<n-1){barra([x,Y+.2,z],[xx,yb,z],.09,.09);barra([x,ya,z],[xx,Y+.2,z],.09,.09);}
   }
   baranda(-L/2,L/2,z);
  }
  for(let i=1;i<n;i++){const x=-L/2+i*L/n;if(tipo==='dolores'){barra([x,altura(i),-W/2+.3],[x,altura(i),W/2-.3],.2,.18);if(i<n-1)barra([x,altura(i),-W/2+.3],[x+L/n,altura(i+1),W/2-.3],.09,.09);}}
  // Vigas transversales bajo el tablero, no pilas ficticias dentro del río.
  for(let i=0;i<=n;i++)caja(.18,.35,W,-L/2+i*L/n,Y-.4,0,'hierro');
 }else if(tipo==='ayacucho'){
  const luz=L/2;
  caja(2,Y,W+1,0,Y/2,0,'piedra');
  for(const centro of [-L/4,L/4])for(const z of [-W*.37,W*.37]){
   const n=24,alto=4.8;
   for(let i=0;i<n;i++){
    const x=centro-luz/2+i*luz/n,xx=x+luz/n;
    const y=1+alto*(1-Math.pow((x-centro)/(luz/2),2)),yy=1+alto*(1-Math.pow((xx-centro)/(luz/2),2));
    barra([x,y,z],[xx,yy,z],.6,.7,'cal');
   }
   for(let i=1;i<8;i++){const x=centro-luz/2+i*luz/8,y=1+alto*(1-Math.pow((x-centro)/(luz/2),2));caja(.35,Y-y,.6,x,(Y+y)/2,z,'cal');}
  }
  for(const z of [-W/2,W/2]){
   for(const y of [Y+.2,Y+1.2])caja(L,.2,.45,0,y,z,'claro');
   for(let x=-L/2;x<=L/2;x+=.8){cilindro(.1,.15,.9,x,Y+.7,z,'claro');}
  }
  for(const x of [-L/2,0,L/2])for(const z of [-W/2,W/2])farol(x,z);
 }else{
  const pilares=tipo==='diciembre'?[-15,15]:Array.from({length:N},(_,i)=>-L/2+(i+1)*L/(N+1));
  for(const x of pilares)for(const z of [-W*.34,W*.34]){
   if(tipo==='diciembre'){caja(1.4,Y-1.3,1.8,x,(Y-1.3)/2,z,'piedra');}
   else{caja(1.3,.8,1.3,x,.4,z,'piedra');cilindro(tipo==='constitucion'?.125:.17,tipo==='constitucion'?.125:.23,Y-1.4,x,(Y-1.4)/2+.5,z,'hierro');caja(.8,.3,.65,x,Y-.8,z,'hierro');}
  }
  if(tipo==='diciembre')for(const x of pilares)caja(2,Y-1.3,W+.2,x,(Y-1.3)/2,0,'piedra');
  const n=Math.ceil(L/3);
  for(const z of [-W*.34,W*.34]){
   for(const y of [Y-.35,Y-1.2])barra([-L/2,y,z],[L/2,y,z],.16,.18);
   for(let i=0;i<n;i++){const x=-L/2+i*L/n,xx=x+L/n;if(tipo==='diciembre'&&(x< -15||xx>15)){caja(L/n,.85,.12,(x+xx)/2,Y-.77,z,'hierro');continue;}barra([x,Y-.35,z],[xx,Y-1.2,z],.09,.09);barra([x,Y-1.2,z],[xx,Y-.35,z],.09,.09);}
  }
  if(tipo==='restaurador'){
   // Dos ensanches semicirculares dejan la calzada longitudinal libre.
   const R=6.5;cilindro(R,R,.28,0,Y-.14,0,'camino',tablero);
   for(const lado of [-1,1])for(let i=0;i<30;i++){
    const a=Math.asin((W/2)/R)+(Math.PI-2*Math.asin((W/2)/R))*i/30,b=Math.asin((W/2)/R)+(Math.PI-2*Math.asin((W/2)/R))*(i+1)/30;
    const x=R*Math.cos(a),z=lado*R*Math.sin(a),xx=R*Math.cos(b),zz=lado*R*Math.sin(b);
    for(const h of [.2,1.1])barra([x,Y+h,z],[xx,Y+h,zz],.08,.08);barra([x,Y+.2,z],[x,Y+1.1,z],.05,.05);
   }
   const borde=Math.sqrt(R*R-W*W/4);
   for(const z of [-W/2,W/2]){baranda(-L/2,-borde,z);baranda(borde,L/2,z);}
   for(let i=0;i<10;i++)for(const z of [-W/2,W/2])farol(-L/2+2+i*(L-4)/9,z);
  }else{
   for(const z of [-W/2,W/2])baranda(-L/2,L/2,z,tipo==='constitucion'?'madera':'hierro');
   for(const x of [-L/2+1,L/2-1])for(const z of [-W/2,W/2])farol(x,z);
  }
 }
 t.cerrar();return {edificio,tablero,cubiertas:tablero,etapa,ficha,metadatos};
}
