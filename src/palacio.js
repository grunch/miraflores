import * as THREE from 'three';

/** Metros aproximados. Origen al centro del patio, Y vertical, fachada principal hacia +Z. */
export function crearPalacio() {
 const palacio=new THREE.Group(); palacio.name='Palacio de Miraflores';
 const cubiertas=new THREE.Group();cubiertas.name='Cubiertas';palacio.add(cubiertas);
 const colores={muro:0xe7ddc8,piedra:0xb7aa94,blanco:0xf7efdc,teja:0x914635,oscuro:0x353b36,oro:0xb49b60,agua:0x55858b,piso:0xc4bdb0};
 const materiales=Object.fromEntries(Object.entries(colores).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:.85})]));
 const cajaGeo=new THREE.BoxGeometry(1,1,1);
 function pieza(g,m,x,y,z,grupo=palacio){const o=new THREE.Mesh(g,materiales[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;grupo.add(o);return o;}
 function caja(x,y,z,a,h,f,m='muro',g=palacio){const o=pieza(cajaGeo,m,x,y,z,g);o.scale.set(a,h,f);return o;}
 function cilindro(x,y,z,r,h,m='blanco',g=palacio,r2=r){return pieza(new THREE.CylinderGeometry(r2,r,h,12),m,x,y,z,g);}
 function cubierta(x,z,a,f,y,h){
  const v=[-a/2,0,-f/2,a/2,0,-f/2,a/2,0,f/2,-a/2,0,f/2,-a/2+1.7,h,-f/2+1.7,a/2-1.7,h,-f/2+1.7,a/2-1.7,h,f/2-1.7,-a/2+1.7,h,f/2-1.7];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0,4,7,6,4,6,5]);geo.computeVertexNormals();pieza(geo,'teja',x,y,z,cubiertas);
  caja(x,y+h+.08,z,a-3.3,.16,f-3.3,'teja',cubiertas);
 }
 function arco(ancho,alto,espesor){const r=ancho/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(-r,alto-r);s.absarc(0,alto-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:espesor,bevelEnabled:false,curveSegments:16});}
 function ventana(x,y,z,g,ancho=1.4,alto=3.4){
  pieza(arco(ancho+.42,alto+.23,.12),'blanco',x,y-.08,z,g);
  pieza(arco(ancho,alto,.16),'oscuro',x,y,z+.13,g);
  for(const dx of [-.42,0,.42]) caja(x+dx,y+alto*.43,z+.32,.055,alto*.82,.05,'oro',g);
  caja(x,y+alto*.47,z+.33,ancho,.065,.06,'oro',g);
  caja(x,y-.14,z+.13,ancho+.65,.18,.5,'blanco',g);
  const flor=pieza(new THREE.SphereGeometry(.19,8,6),'oro',x,y+alto+.53,z+.15,g);flor.scale.set(1.8,.7,.4);
 }
 function balaustrada(largo,y,z,g){
  caja(0,y,z,largo,.22,.45,'blanco',g);caja(0,y+1,z,largo,.18,.5,'blanco',g);
  for(let x=-largo/2+.25;x<largo/2;x+=.6){cilindro(x,y+.5,z,.09,.85,'blanco',g,.07);cilindro(x,y+.45,z,.14,.28,'blanco',g);}
 }
 function fachada(largo,x,z,rot,entradas=[]){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;palacio.add(g);
  caja(0,4.65,-.35,largo,8,.7,'muro',g);
  for(const [y,h,f] of [[.65,.55,1],[1.1,.18,1.1],[8.5,.3,1.1],[8.85,.25,1.4],[9.15,.22,1.65]])caja(0,y,0,largo+.3,h,f,'blanco',g);
  const n=Math.round(largo/3.7);for(let i=0;i<n;i++){const x=-largo/2+(i+.5)*largo/n;if(!entradas.some(a=>Math.abs(a-x)<2.4))ventana(x,2.15,.05,g);}
  for(let i=0;i<=n;i++){const x=-largo/2+i*largo/n;if(entradas.some(a=>Math.abs(a-x)<1.7))continue;caja(x,4.7,.08,.45,7.2,.35,'piedra',g);caja(x,7.95,.18,.7,.3,.5,'blanco',g);}
  balaustrada(largo,9.35,0,g);return g;
 }
 caja(0,.1,0,61,.2,54,'piso');caja(0,.45,0,54,.7,46,'piedra');caja(0,.84,0,28,.12,22,'piso');
 // Crujías y galerías alrededor de un patio abierto.
 // El frente tiene dos portales laterales y un cuerpo central adelantado.
 const frente=fachada(52,0,22,0,[-13,13]);frente.name='Frente con dos accesos';
 fachada(52,0,-22,Math.PI);
 fachada(44,26,0,Math.PI/2,[15]);
 fachada(44,-26,0,-Math.PI/2,[-5.5]);
 const central=fachada(18,0,23.4,0);central.name='Cuerpo central adelantado';
 caja(-9,4.6,22.7,.4,8,1.4);caja(9,4.6,22.7,.4,8,1.4);
 for(const [x,z,a,f] of [[0,-17,52,10],[-21,0,10,24],[21,0,10,24]]){caja(x,8.5,z,a,.35,f);cubierta(x,z,a+.4,f+.4,9,3.5);}
 caja(0,8.5,17,52,.35,10);cubierta(0,18,19,11,9.5,4.7);
 function galeria(largo,x,z,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;palacio.add(g);const n=Math.round(largo/3.5),paso=largo/n;
  for(let i=0;i<=n;i++){const a=-largo/2+i*paso;cilindro(a,3.4,0,.19,5,'blanco',g);caja(a,1.05,0,.65,.3,.65,'piedra',g);caja(a,5.85,0,.65,.3,.65,'blanco',g);}
  for(let i=0;i<n;i++){const a=-largo/2+(i+.5)*paso;const s=new THREE.Shape();const r=paso/2;s.moveTo(-r,8);s.lineTo(-r,5.9);s.absarc(0,5.9,r,Math.PI,0,true);s.lineTo(r,8);s.closePath();pieza(new THREE.ExtrudeGeometry(s,{depth:.45,bevelEnabled:false,curveSegments:16}),'blanco',a,0,-.2,g);}
  caja(0,8.2,0,largo,.25,.8,'blanco',g);balaustrada(largo,8.45,0,g);
 }
 galeria(30,0,11,Math.PI);galeria(30,0,-11,0);galeria(22,-15,0,Math.PI/2);galeria(22,15,0,-Math.PI/2);
 // Pabellones elevados del frente y cuerpos de esquina posteriores.
 for(const x of [-20,20]){caja(x,11,18,7.2,4,8,'muro');for(const dx of [-3.3,3.3])caja(x+dx,11,22.15,.45,4,.35,'piedra');ventana(x,9.7,22.15,palacio,1.8,2.25);caja(x,13,18,7.9,.4,8.7,'blanco');cubierta(x,18,8,8.8,13.2,3.2);
  const disco=pieza(new THREE.TorusGeometry(.65,.18,8,24),'blanco',x,14.2,22.35);caja(x,13.55,22.3,2.5,.2,.35,'blanco');
 }
 for(const x of [-20,20]){caja(x,9.5,-17,9,2,10);cubierta(x,-17,9.7,10.7,10.6,3.4);}
 // Cuatro accesos identificables en las vistas de 1911. Coordenadas locales aproximadas.
 function acceso(nombre,x,z,rot,dorada=false){
  const g=new THREE.Group();g.name=nombre;g.position.set(x,0,z);g.rotation.y=rot;palacio.add(g);
  g.userData={tipo:'acceso',referencia:dorada?'09-31-33 / 09-31-46':'09-30-24 / 09-30-39 / 09-31-00'};
  // Portón de dos hojas y montantes, sin superponer una ventana al hueco.
  pieza(arco(2.9,5.25,.12),'blanco',0,1.2,.12,g);
  pieza(arco(2.5,5,.16),'oscuro',0,1.25,.26,g);
  for(const dx of [-.85,0,.85])caja(dx,3.25,.46,.08,4,.09,'oro',g);
  caja(0,4.3,.46,2.5,.09,.09,'oro',g);
  for(const dx of [-.6,.6]){caja(dx,1.95,.48,1,.95,.1,'piedra',g);cilindro(dx*.25,2.9,.58,.055,.18,'oro',g);}
  // Descanso y nueve peldaños ascendentes hasta la puerta.
  caja(0,.7,1.15,3.6,1.4,2.3,'blanco',g);
  for(let i=0;i<9;i++){const altura=.15*(i+1);caja(0,altura/2,5.1-i*.34,3.6,altura,.36,'blanco',g);}
  for(const lado of [-1,1]){
   caja(lado*1.9,1.05,1.2,.35,2.1,2.4,'blanco',g);
   const pasamano=caja(lado*1.9,1.43,3.7,.24,.18,3.4,'blanco',g);pasamano.rotation.x=.415;
   for(let i=0;i<9;i++){const z=2.3+i*.34,y=1.35-i*.15;cilindro(lado*1.9,y+.38,z,.075,.76,'blanco',g);}
   caja(lado*1.9,.55,5.2,.55,1.1,.55,'blanco',g);
   cilindro(lado*1.9,3.4,2.05,.105,4.2,'oscuro',g,.075);
   cilindro(lado*1.9,1.6,2.05,.2,.55,'oscuro',g,.12);
   caja(lado*1.9,5.35,2.05,.45,.18,.45,'oscuro',g);
  }
  // Marquesina inclinada de hierro, con borde vuelto: independiente del tejado principal.
  const techo=new THREE.Group();techo.name='Marquesina '+nombre;techo.position.copy(g.position);techo.rotation.copy(g.rotation);cubiertas.add(techo);
  const perfil=[[0,6.4],[1,6.05],[2,5.68],[3,5.55],[3.5,5.7]];
  for(let i=0;i<perfil.length-1;i++){
   const [za,ya]=perfil[i],[zb,yb]=perfil[i+1];const d=Math.hypot(zb-za,yb-ya);
   const panel=caja(0,(ya+yb)/2,(za+zb)/2,4.7,.1,d,'teja',techo);panel.rotation.x=-Math.atan2(yb-ya,zb-za);
   for(const x of [-2.4,2.4]){const borde=caja(x,(ya+yb)/2,(za+zb)/2,.1,.19,d,'oscuro',techo);borde.rotation.x=panel.rotation.x;}
  }
  caja(0,5.65,3.5,4.95,.16,.16,'oscuro',techo);
  for(let x=-2.3;x<=2.3;x+=.28){const voluta=pieza(new THREE.TorusGeometry(.12,.025,6,12),'oscuro',x,5.5,3.5,techo);voluta.scale.y=1.4;}
 }
 acceso('Acceso frontal izquierdo',-13,22,0);
 acceso('Acceso frontal derecho',13,22,0);
 acceso('Acceso lateral posterior',26,-15,Math.PI/2);
 acceso('Puerta Dorada',-26,-5.5,-Math.PI/2,true);
 // Fuente del patio.
 cilindro(0,1,0,3,.32,'blanco',palacio);cilindro(0,1.19,0,2.7,.08,'agua');cilindro(0,1.9,0,.25,1.4,'piedra');cilindro(0,2.65,0,1.15,.22,'blanco',palacio,.75);cilindro(0,3.15,0,.15,.8,'piedra');cilindro(0,3.6,0,.6,.16,'blanco');
 for(const x of [-11,11])for(const z of [-7,7]){caja(x,1,z,2.4,.3,2.4,'blanco');cilindro(x,1.5,z,.7,.8,'piedra');const planta=pieza(new THREE.SphereGeometry(.9,10,8),'oscuro',x,2.2,z);planta.scale.y=.8;}
 palacio.userData={unidad:'metro',epocaReferencia:1911,dimensionesAproximadas:true,fachada:'+Z',origen:'Centro del patio, cota de implantación'};
 return {palacio,cubiertas};
}
