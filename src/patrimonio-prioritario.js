import {construirHijosDios} from './patrimonio-hijos-dios.js';
import {construirConcordia} from './patrimonio-concordia.js';
import {construirCementerioSur} from './patrimonio-cementerio-sur.js';
import {construirHospitalVargas} from './patrimonio-hospital-vargas.js';
import * as T from 'three';
import {construirTemplo} from './patrimonio-templos.js';
import {taller} from './patrimonio-geometria.js';
import {CATALOGO_PATRIMONIO,estadoPatrimonio,ANIOS_PATRIMONIO} from './patrimonio-prioritario-datos.js';
export {CATALOGO_PATRIMONIO,estadoPatrimonio,ANIOS_PATRIMONIO};

function metropolitano(t,techo){
 const {caja,cilindro,grupo,muro,anillo,techoAnular,cornisa,reja,pieza}=t;
 // Paso interpretativo alineado con la puerta central; las demás gradas siguen cerradas.
 const anilloAbierto=(ri,ro,y,h,mat)=>{
  const a=-Math.PI/2+Math.PI/32,b=3*Math.PI/2-Math.PI/32,s=new T.Shape();
  s.absarc(0,0,ro,a,b,false);s.lineTo(ri*Math.cos(b),ri*Math.sin(b));
  s.absarc(0,0,ri,b,a,true);s.closePath();
  const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:18});
  geo.rotateX(-Math.PI/2);pieza(geo,mat,0,y,0);
 };
 cilindro(18,18,.12,0,.13,0,'arena');anilloAbierto(18,18.2,0,1.2,'madera');
 for(let i=0;i<14;i++)anilloAbierto(18.5+i*.64,19.14+i*.64,.2+i*.39,.3,'madera');
 anilloAbierto(28.3,28.7,0,7.2,'cal');
 for(let i=1;i<48;i++){const a=i*Math.PI/24,x=27.8*Math.sin(a),z=27.8*Math.cos(a);cilindro(.12,.12,8.4,x,4.2,z,'hierro');}
 techoAnular(23.6,29,8.6,9.7);
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const g=grupo(0,0,0,a,techo);caja(.075,.1,5.5,0,9.15,26.2,'hierro',g).rotation.x=-.2;}
 const frente=grupo(0,0,32);
 muro(44,6.1,.55,[-18,-9,0,9,18].map(x=>({x,w:x===0?4:2.7,h:4.7,y:.1,reja:x!==0,mat:x===0?null:undefined,rect:true})),frente);
 for(const x of [-21,-12,-4,4,12,21]){caja(.6,6.3,.9,x,3.15,.12,'claro',frente);caja(.95,.3,1.1,x,5.9,.12,'claro',frente);}
 for(const x of [-4,4])for(const y of [1.3,2.2,3.1,4,4.9])caja(.72,.18,1,x,y,.18,'zocalo',frente);
 cornisa(44,6.15,0,frente);reja(43,.75,0,6.65,0,frente);
 // Frontones curvos: central alto y dos remates laterales, como en las fotos de 1906.
 for(const [x,w,y] of [[0,8,6.7],[-19,5,6.5],[19,5,6.5]]){
  // Banda de mampostería con molduras: la fotografía muestra un remate macizo, no un tubo.
  const r=w/2,s=new T.Shape();s.absarc(0,0,r,0,Math.PI,false);
  s.lineTo(-r+.55,0);s.absarc(0,0,r-.55,Math.PI,0,true);s.closePath();
  pieza(new T.ExtrudeGeometry(s,{depth:.35,bevelEnabled:false,curveSegments:16}),'claro',x,y,0,frente);
  for(const rr of [r-.08,r-.45])pieza(new T.TorusGeometry(rr,.065,4,24,Math.PI),'ocre',x,y,.39,frente);
  caja(.65,1.6,.7,x-w/2,y-.6,0,'claro',frente);caja(.65,1.6,.7,x+w/2,y-.6,0,'claro',frente);
  cilindro(.25,.4,.6,x,y+w/2+.3,0,'ocre',frente);cilindro(.12,.28,.6,x,y+w/2+.9,0,'claro',frente);
 }
 for(const side of [-1,1]){caja(.55,5.8,10,side*22,2.9,27,'cal');caja(16,5.5,.5,side*14,2.75,22,'cal');}
 caja(44,.3,10,0,5.8,27,'metal',techo);
}
function nuevoCirco(t,techo,meta){
 const {caja,cilindro,grupo,muro,anillo,techoAnular,pieza,vano,cornisa,reja}=t;
 meta.ruedoAbierto=true;meta.torres=2;
 cilindro(24,24,.14,0,.07,0,'arena');anillo(24,24.3,0,1.4,'ocre');
 for(let i=0;i<21;i++)anillo(24.5+i*.65,25.15+i*.65,.3+i*.36,.3,'piedra');
 anillo(39,39.65,0,9.4,'ocre');anillo(39.1,40,9.3,.4,'claro');
 for(let i=0;i<48;i++){
  const a=i*Math.PI/24;const g=grupo(39.6*Math.sin(a),0,39.6*Math.cos(a),a);vano(1.3,3.2,0,2.5,.08,g,'sombra',true);caja(.45,9.6,.65,1.8,4.8,0,'claro',g);
 }
 // Cubierta solo sobre la grada alta; el proyecto de cubrir el ruedo no se materializó.
 techoAnular(34.5,40,11,12);
 for(let i=0;i<40;i++){const a=i*Math.PI/20;cilindro(.11,.11,3.7,34.5*Math.sin(a),9.2,34.5*Math.cos(a),'hierro');}
 const f=grupo(0,0,44);
 muro(30,13,.7,[{x:-9,w:3.8,h:4.4,y:.12,reja:true,rect:true},{x:0,w:4.6,h:4.4,y:.12,reja:true,rect:true},{x:9,w:3.8,h:4.4,y:.12,reja:true,rect:true},{x:-9,w:3.8,h:4.4,y:7.2},{x:0,w:5.3,h:5.5,y:6.3,rect:true},{x:9,w:3.8,h:4.4,y:7.2}],f,'ocre');
 for(const x of [-14,-5,5,14]){caja(.6,13.8,1.2,x,6.9,.2,'claro',f);caja(1,.4,1.5,x,12.7,.2,'claro',f);}
 cornisa(31,5.3,.25,f);cornisa(31,13.1,.25,f);
 // Portada central arqueada, de dos órdenes, y antepechos calados.
 for(const r of [4.7,5.1])pieza(new T.TorusGeometry(r,.19,8,36,Math.PI),'claro',0,13.3,.25,f);
 caja(1.5,.35,1.2,0,18.6,.25,'claro',f);
 for(const x of [-9,0,9]){caja(5.4,.23,1.5,x,6.4,1,'claro',f);reja(5,1.1,x,6.5,1.6,f);}
 for(const sign of [-1,1]){
  const x=sign*17.8;const tower=grupo(x,0,0,0,f);
  muro(5.8,14.8,1,[{x:0,w:1.8,h:6,y:7}],tower,'ocre');
  for(const xx of [-2.8,2.8])caja(.55,15.2,4,xx,7.6,-1.3,'claro',tower);
  caja(6,.4,5.7,0,14.9,-1.5,'claro',tower);caja(6.6,.3,6.3,0,15.3,-1.5,'claro',tower);
  for(const xx of [-1.6,1.6])for(const zz of [-3.1,.1]){cilindro(.18,.23,4,xx,17.5,zz,'claro',tower);cilindro(.32,.32,.2,xx,19.55,zz,'claro',tower);}
  const roof=grupo(x,0,42.5,0,techo);caja(5.8,.35,5.8,0,19.8,0,'claro',roof);
  // Pequeñas cúpulas estriadas, no torres cónicas inventadas.
  const pts=[new T.Vector2(0,23),new T.Vector2(.2,22.4),new T.Vector2(1.1,21.9),new T.Vector2(1.9,21.3),new T.Vector2(2.1,20.6),new T.Vector2(1.9,20.1)];
  pieza(new T.LatheGeometry(pts.reverse(),32),'claro',0,0,0,roof);cilindro(.06,.1,1,0,23.45,0,'hierro',roof);
  for(const yy of [20.5,21.1])pieza(new T.TorusGeometry(yy===20.5?2:1.95,.09,6,32),'ocre',0,yy,0,roof).rotation.x=Math.PI/2;
  const side=grupo(sign*31,0,0,0,f);muro(17,7.5,.6,[{x:0,w:3.6,h:4.3,y:.1,reja:true}],side,'ocre');cornisa(17,7.7,0,side);
  pieza(new T.TorusGeometry(3.4,.2,8,24,Math.PI),'claro',0,8,.1,side);caja(8,.3,.8,0,8,.1,'claro',side);
 }
 for(const x of [-21,21])caja(.6,12,10,x,6,39,'ocre');caja(42,.35,8,0,13.4,40,'metal',techo);
}
function rotunda(t,techo,meta){
 const {caja,cilindro,grupo,muro,anillo,tejado,reja,pieza}=t;
 meta.diametroPatio=24;meta.recintos=2;meta.centrosPatios=[[-19,0],[19,0]];
 // Dos recintos: ampliación norte descrita por Polar; separaciones nominales.
 for(const xc of [-19,19]){
 const recinto=grupo(xc,0,0),cubierta=grupo(xc,0,0,0,techo);
 cilindro(12,12,.12,0,.06,0,'verde',recinto);
 // Anillo de celdas, dos pisos; las puertas son huecos geométricos.
 for(let i=0;i<24;i++){
  const a=i*2*Math.PI/24;const g=grupo(14.8*Math.sin(a),0,14.8*Math.cos(a),a+Math.PI,recinto);
  muro(3.96,7.1,.6,[{x:0,w:.9,h:2.1,y:.15,mat:'madera'},{x:0,w:.9,h:2.1,y:3.8,mat:'madera'}],g);
  const wall=grupo(0,0,0,a,recinto);caja(.35,7.1,3.9,0,3.55,16.6,'cal',wall);
 }
 anillo(11.8,14.9,3.5,.2,'madera',recinto);anillo(11.8,12,4.5,.1,'madera',recinto);
 // Pasarela abierta con baranda, no fachada exterior acristalada.
 for(let i=0;i<48;i++){const a=i*Math.PI/24;cilindro(.06,.06,1,11.8*Math.sin(a),4.1,11.8*Math.cos(a),'madera',recinto);}
 for(const x of [-18.5,18.5])caja(.7,7.4,37.7,x,3.7,0,'cal',recinto);
 for(const z of [-18.5,18.5])caja(37.7,7.4,.7,0,3.7,z,'cal',recinto);
 t.techoAnular(14.2,18.5,7.6,8.4,cubierta,'teja');
 }
 const f=grupo(0,0,23);muro(75.7,4.7,.6,[{x:28,w:1.6,h:2.8,y:.08,reja:true,rect:true},...[-33,-27,-21,-15,-9,-3,3,9,15,21,34].map(x=>({x,w:.8,h:1.4,y:2.2,reja:true,rect:true}))],f);
 for(const side of [-1,1])caja(.6,4.7,4.5,side*37.5,2.35,20.7,'cal');tejado(76.2,5.6,4.7,0,20.7);
 // Garita saliente de la fotografía, sobre el cuerpo de acceso.
 cilindro(1.35,.65,1.2,28,4.6,23.5,'cal');cilindro(1.35,1.35,3.2,28,6.8,23.5,'cal');
 for(const dx of [-.7,0,.7])caja(.18,.8,.08,28+dx,7.1,24.7,'sombra');
 const cap=pieza(new T.SphereGeometry(1.4,20,10,0,2*Math.PI,0,Math.PI/2),'teja',28,8.4,23.5,techo);cap.scale.y=.55;
 cilindro(.06,.12,.7,28,9.3,23.5,'hierro',techo);
}
export function crearPatrimonio({id='metropolitano',anio=1911,nivelDetalle='estudio'}={}){
 if(!['estudio','ciudad'].includes(nivelDetalle))throw new RangeError('Nivel de detalle no válido');
 const etapa=estadoPatrimonio(id,anio),ficha=CATALOGO_PATRIMONIO[id];const edificio=new T.Group();edificio.name=ficha.nombre;
 const cubiertas=new T.Group();cubiertas.name='Cubiertas';
 const metadatos={id,anio,unidades:'metros nominales',frente:'+Z',dimensionesInterpretativas:true,nota:ficha.nota};edificio.userData={...metadatos};
 if(etapa.presente!==true)return {edificio,cubiertas,etapa,ficha,metadatos};
 edificio.add(cubiertas);const t=taller(edificio,cubiertas,nivelDetalle);
 if(id==='metropolitano')metropolitano(t,cubiertas);
 if(id==='nuevo-circo')nuevoCirco(t,cubiertas,metadatos);
 if(id==='rotunda')rotunda(t,cubiertas,metadatos);
 if(id==='concordia')construirConcordia(t,cubiertas,metadatos);
 if(id==='hijos-dios')construirHijosDios(t,cubiertas,metadatos);
 if(id==='cementerio-sur')construirCementerioSur(t,cubiertas,anio,metadatos);
 if(id==='hospital-vargas')construirHospitalVargas(t,cubiertas,anio,metadatos);
 if(['santa-rosalia','san-juan','san-jose','san-agustin'].includes(id))construirTemplo(t,cubiertas,id,metadatos);
 t.cerrar();edificio.userData={...metadatos};return {edificio,cubiertas,etapa,ficha,metadatos};
}
