import {construirSanAgustin} from './patrimonio-san-agustin.js';
import * as T from 'three';
/** Estudios de envolvente, no restituciones de las fases coloniales sin alzados. */
export function construirTemplo(t,techo,id,meta){
 if(id==='san-agustin')return construirSanAgustin(t,techo,meta);
 const {caja,cilindro,grupo,muro,vano,tejado,pieza,cornisa,reja,cruz}=t;
 const ancho=25,fondo=44,alto=10;
 meta.tipo='estudio de envolvente';meta.interiores='naves y arcadas; sin retablos no documentados';
 caja(ancho+.6,.18,fondo+.6,0,.09,0,'piedra');
 for(const lado of [-1,1]){
  const g=grupo(lado*ancho/2,0,0,lado*Math.PI/2);
  muro(fondo,alto,.65,[-14,-7,0,7,14].map(x=>({x,w:1.6,h:3.5,y:4.4})),g);
  for(let z=-fondo/2+2;z<fondo/2;z+=7){caja(.8,alto,.8,lado*(ancho/2+.2),alto/2,z,'claro');}
 }
 caja(ancho,alto,.65,0,alto/2,-fondo/2,'cal');
 // Naves separadas por arcadas, vistas al ocultar cubiertas.
 for(const side of [-1,1]){
  const g=grupo(side*ancho*.2,0,0,Math.PI/2);muro(fondo-1,alto+1,.55,[-16,-8,0,8,16].map(x=>({x,w:5.5,h:7,y:.1,mat:null})),g);
 }
 tejado(ancho*.43,fondo-.8,alto+1.5,0,-.3);
 for(const side of [-1,1])tejado(ancho*.3,fondo-.8,alto,side*ancho*.35,-.3);
 const front=grupo(0,0,fondo/2);
 const puertaX=[-8,0,8];
 muro(ancho,alto+1,.75,puertaX.map(x=>({x,w:x===0?3:2.4,h:5.5,y:.15,mat:'madera',rect:id==='santa-rosalia'})),front,id==='san-juan'?'ocre':'cal');
 for(const x of puertaX){
  for(const dx of [-2.2,2.2]){
   caja(.9,.5,1.1,x+dx,.4,.7,'claro',front);cilindro(.3,.38,7.6,x+dx,4.4,.7,'claro',front);caja(.9,.4,1.15,x+dx,8.4,.7,'claro',front);
  }
 }
 cornisa(ancho+.8,8.8,.45,front);cornisa(ancho+.8,10,.45,front);
 function fronton(w,h,y,g=front){
  const s=new T.Shape();s.moveTo(-w/2,y);s.lineTo(w/2,y);s.lineTo(0,y+h);s.closePath();pieza(new T.ExtrudeGeometry(s,{depth:.45,bevelEnabled:false}),'cal',0,0,.2,g);
  const largo=Math.hypot(w/2,h);for(const side of [-1,1]){const m=caja(largo,.25,.85,side*w/4,y+h/2,.4,'claro',g);m.rotation.z=-side*Math.atan2(h,w/2);}caja(w+.5,.3,.85,0,y,.4,'claro',g);
 }
 function balcon(x,y,w,g=front){caja(w,.22,1.1,x,y,1,'claro',g);reja(w-.2,1,x,y+.15,1.5,g);}
 function cupula(x,z,y,r){cilindro(r,r,2,x,y+1,z,'cal',techo);for(let i=0;i<12;i++){const a=i*Math.PI/6;const g=grupo(x+r*Math.sin(a),y+.3,z+r*Math.cos(a),a,techo);vano(.6,1.4,0,0,.03,g);}
  pieza(new T.SphereGeometry(r,32,16,0,Math.PI*2,0,Math.PI/2),'claro',x,y+2,z,techo);cruz(x,y+2+r,z,1.6,techo);
 }
 function torre(x,z,y,h,estilo){
  caja(6,h,6,x,y+h/2,z,'cal');
  for(const yy of [y+h*.45,y+h]){caja(6.7,.3,6.7,x,yy,z,'claro');caja(6.5,.3,6.5,x,yy+.4,z,'claro');}
  for(let side=0;side<4;side++){const a=side*Math.PI/2;const g=grupo(x+3.05*Math.sin(a),y+h*.5,z+3.05*Math.cos(a),a);vano(2.8,h*.38,0,0,.05,g,'sombra');}
  if(estilo==='aguja'){const g=grupo(x,0,z,0,techo);cilindro(0,3.3,6,0,y+h+3.5,0,'metal',g);cruz(0,y+h+6.6,0,1.7,g);}
  else cupula(x,z,y+h+.6,3.1);
 }
 if(id==='santa-rosalia'){
  fronton(15,3.7,10.5);cruz(0,14.4,fondo/2+.5,1.5);
  for(const x of [-8,0,8]){const g=grupo(x,0,.5,0,front);fronton(3.3,.9,6.2,g);}
  for(let x=-ancho/2;x<ancho/2;x+=.7)cilindro(.09,.14,1,x,11.3,fondo/2,'claro');caja(ancho,.2,.4,0,11.9,fondo/2,'claro');
  torre(-16,fondo/2-4,0,17,'cupula');cupula(0,-12,alto+1.7,4.5);
 }else if(id==='san-juan'){
  muro(21,5,.55,[-8,0,8].map(x=>({x,w:2.5,h:3.5,y:.6,rect:true})),grupo(0,10.4,0,0,front),'ocre');
  for(const x of [-8,0,8])balcon(x,10.8,3.4);
  cornisa(26,15.5,.5,front);pieza(new T.TorusGeometry(5,.22,8,32,Math.PI),'claro',0,15.8,.4,front);cruz(0,21,fondo/2+.5,1.3);
  torre(15,fondo/2-4,0,19,'cupula');
 }else if(id==='san-jose'){
  const up=grupo(0,10.4,0,0,front);muro(14,7,.7,[{x:0,w:2.6,h:4.1,y:1}],up);
  for(const x of [-5.5,-3.3,3.3,5.5]){cilindro(.25,.31,6,x,3.3,.6,'claro',up);caja(.8,.3,.85,x,6.5,.6,'claro',up);}
  fronton(15,3.2,17.6);cruz(0,21,fondo/2+.5,1.6);torre(-16,fondo/2-4,0,19,'cupula');
 }
}
