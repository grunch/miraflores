import * as T from 'three';

/** Estudio de 1946: proporciones nominales; foto histórica y jardín del plano DCN. */
export function construirConcordia(t,techo,meta){
 const {caja,cilindro,grupo,anillo,pieza}=t;
 Object.assign(meta,{templete:true,columnasInteriores:8,pilaresExteriores:8,alturaNominal:9.4});
 caja(44,.12,124,0,.06,0,'verde');
 // Paseos y cuatro parterres: esquema del plano, no inventario botánico.
 caja(6,.16,124,0,.1,0,'camino');caja(44,.16,14,0,.1,0,'camino');
 for(const x of [-19,19])caja(3,.16,124,x,.1,0,'camino');
 for(const z of [-58,58])caja(41,.16,3,0,.1,z,'camino');
 for(const z of [-41,41]){
  caja(20,.16,20,0,.16,z,'camino');caja(17,.2,17,0,.2,z,'verde');
  for(const x of [-8.5,8.5])caja(.65,.65,17,x,.52,z,'hoja');
  for(const dz of [-8.5,8.5])caja(17,.65,.65,0,.52,z+dz,'hoja');
 }
 for(const z of [-23,23])for(const x of [-7,7])cilindro(2.5,2.5,.5,x,.38,z,'hoja');
 const base=grupo(2,0,-7),techoBase=grupo(2,0,-7,0,techo);
 // Basamento circular, pilares rectangulares exteriores y columnas interiores.
 for(const [r,y,h] of [[8.3,.3,.3],[7.8,.55,.2],[7.3,.78,.25]])cilindro(r,r,h,0,y,0,'piedra',base);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,ex=6.6*Math.sin(a),ez=6.6*Math.cos(a),g=grupo(ex,0,ez,a,base);
  caja(1.1,7.1,.72,0,4.45,0,'claro',g);
  for(const y of [1.15,2.2,3.3,4.4,5.5,6.6])caja(1.13,.045,.76,0,y,0,'zocalo',g);
  caja(1.45,.25,1,0,8.05,0,'claro',g);
  const x=5.1*Math.sin(a),z=5.1*Math.cos(a);
  cilindro(.25,.34,6.85,x,4.35,z,'claro',base);
  cilindro(.43,.36,.2,x,7.88,z,'claro',base);caja(.92,.18,.92,x,8.04,z,'claro',base);
 }
 anillo(6.15,7.25,8.15,.6,'claro',base);anillo(6,7.45,8.75,.2,'claro',base);
 // Cubierta cónica de poca pendiente y alero, visibles en las fotografías.
 cilindro(0,7.7,.95,0,9.3,0,'teja',techoBase);
 cilindro(7.65,7.65,.12,0,8.85,0,'claro',techoBase);
 // Bancos y vegetación de jardín; las especies y el número son interpretativos.
 for(const z of [-12,12])for(const x of [-11,11]){
  caja(3.8,.2,1,x,.75,z,'piedra');for(const dx of [-1.35,1.35])caja(.25,.6,.7,x+dx,.4,z,'piedra');
 }
 for(const x of [-12,12])for(const z of [-50,-31,31,50]){
  cilindro(.12,.2,3.4,x,1.8,z,'tronco');
  const copa=pieza(new T.SphereGeometry(1,10,7),'hoja',x,4,z);copa.scale.set(2.5,1.7,2.4);
 }
}
