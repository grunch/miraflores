import * as T from 'three';
import {taller} from './patrimonio-geometria.js';
import {optimizarPanteon} from './optimizar-panteon.js';

export const ETAPA_TRINIDAD_1772=Object.freeze({desde:1772,hasta:1773,id:'trinidad-obras',nombre:'Iglesia de la Santísima Trinidad',detalle:'Bóvedas y dos campanarios inconclusos · descripción de Martí (1772); dimensiones interpretativas'});
/** Fase puntual documentada, no interpolar hasta la inauguración. +Z es el frente sur. */
export function crearTrinidad1772({optimizar=true}={}){
 const edificio=new T.Group(),cubiertas=new T.Group();edificio.name='Santísima Trinidad en obras';cubiertas.name='Cubiertas';edificio.add(cubiertas);
 const {caja,grupo,muro,pieza,cornisa}=taller(edificio,cubiertas,'ciudad');
 // Dimensiones de estudio heredadas: nave de 23×55 m, sin pretensión de levantamiento.
 caja(25,.18,67,0,.09,-5,'piedra');
 function boveda(nombre,x,y,z,r,largo){
  const s=new T.Shape();s.moveTo(r,0);s.absarc(0,0,r,0,Math.PI,false);
  s.lineTo(-r+.35,0);s.absarc(0,0,r-.35,Math.PI,0,true);s.closePath();
  const m=pieza(new T.ExtrudeGeometry(s,{depth:largo,bevelEnabled:false,curveSegments:20}),'cal',x,y,z,cubiertas);m.name=nombre;
 }
 for(const lado of [-1,1]){
  const pared=grupo(lado*11.15,0,0,lado*Math.PI/2);
  muro(54,8.2,.7,[-20,-10,0,10,20].map(x=>({x,y:4.5,w:1.2,h:2.4})),pared);
  // Cuatro órdenes longitudinales: las dos líneas interiores delimitan la nave mayor;
  // las exteriores separan pasos estrechos junto a las capillas, según la descripción.
  for(const x of [lado*4.5,lado*9.2])for(let z=-23;z<=23;z+=7.6){
   caja(.65,5.8,.65,x,3.1,z,'cal');caja(.95,.25,.95,x,6.1,z,'claro');
   if(z<22){
    const arco=new T.Shape();arco.moveTo(-3.8,8);arco.lineTo(-3.8,6);
    arco.lineTo(-3.35,6);arco.quadraticCurveTo(0,9.1,3.35,6);
    arco.lineTo(3.8,6);arco.lineTo(3.8,8);arco.closePath();
    const a=pieza(new T.ExtrudeGeometry(arco,{depth:.65,bevelEnabled:false,curveSegments:12}),'cal',x-.325,0,z+3.8);
    a.rotation.y=Math.PI/2;
   }
  }
  caja(.65,2.2,53,lado*4.5,9,-.5,'cal');
  boveda(`Bóveda nave lateral ${lado}`,lado*7.9,8,-27,3.15,53);
 }
 boveda('Bóveda nave central',0,10,-27,4.65,53);
 caja(23,8.2,.7,0,4.3,-27,'cal');
 const frente=grupo(0,0,27);
 muro(23,10.7,.9,[{x:-7.7,w:2.7,h:5.8,y:.2},{x:0,w:4.2,h:7.6,y:.2},{x:7.7,w:2.7,h:5.8,y:.2}],frente);
 const alto=grupo(0,10.7,27);
 muro(8.6,5.2,.9,[{x:0,w:1.2,h:2.8,y:.3}],alto);
 // El cuerpo central se aproxima con el frente colonial que sobrevive en Bellermann;
 // no se trasplantan el rosetón ni las agujas neogóticas de 1875.
 for(const x of [-4.1,-3.4,3.4,4.1])caja(.22,15.5,.3,x,8,27.65,'claro');
 cornisa(9,10.1,27);cornisa(9,16.1,27);
 for(const lado of [-1,1]){
  const voluta=new T.CatmullRomCurve3(Array.from({length:33},(_,i)=>{const a=i/32*Math.PI*3,r=1.15*(1-i/40);return new T.Vector3(lado*(2.1+Math.cos(a)*r),17.2+Math.sin(a)*r,27.6)}));
  pieza(new T.TubeGeometry(voluta,32,.12,5,false),'claro');
  const torre=grupo(lado*8.7,0,24.2);torre.name=`Campanario en obra ${lado}`;
  for(const x of [-2.1,2.1])caja(.7,12.5,5.7,x,6.45,0,'cal',torre);
  caja(4.8,12.5,.7,0,6.45,-2.5,'cal',torre);
  // Coronación horizontal abierta: grado exacto de avance desconocido.
  caja(4.8,1.8,.7,0,11.8,2.5,'cal',torre);
 }
 caja(1.5,2,.8,0,17.4,27,'cal');cornisa(2,18.4,27);
 // Sacristía posterior abovedada y corredor contiguo de teja: disposición nominal.
 for(const x of [-10.5,10.5])caja(.7,6.2,9,x,3.3,-32,'cal');
 caja(21,6.2,.7,0,3.3,-36.5,'cal');
 for(const x of [-7,0,7])boveda('Bóveda sacristía',x,6.3,-36.5,3.5,9);
 const corredor=caja(22,.25,2.5,0,6.5,-38,'teja',cubiertas);corredor.rotation.x=-.12;
 edificio.userData={id:'panteon',anio:1772,etapa:ETAPA_TRINIDAD_1772.id,unidad:'metro',fachada:'+Z',interpretativo:true,fuente:'https://memoriasdevenezuela.wordpress.com/2018/07/27/la-arquitectura-de-un-pardo-en-la-caracas-colonial/',limite:'Descripción de Martí reproducida por Memorias de Venezuela. Alturas, anchuras, planta de sacristía y grado de avance de torres interpretativos; frente colonial aproximado con Bellermann posterior.'};
 if(optimizar)optimizarPanteon(edificio);
 return {edificio,cubiertas,etapa:ETAPA_TRINIDAD_1772};
}
