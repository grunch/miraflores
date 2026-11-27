import * as T from 'three';

/** IPC, Lo construido, pp.216–217: alturas publicadas; planta y detalles nominales. */
export function construirSanAgustin(t,techo,meta){
 const {caja,cilindro,grupo,muro,pieza,cornisa,cruz}=t;
 Object.assign(meta,{tipo:'San Agustín según descripción IPC',naves:3,alturaTorre:32,alturaCupula:24,interiores:'Crucero y tres naves; sin retablos ni decoración pictórica inventada'});
 const ancho=30,fondo=56,zFrente=28,zCruce=-18;
 // Ajuste nominal dentro del contorno aprox.32×63m leído en DCN1936/1946.
 // No es mensura catastral; se conservan alturas y cúpula circular, sin escalar el grupo.
 caja(ancho+.8,.5,fondo+.8,0,.25,0,'piedra');
 for(let i=0;i<4;i++)caja(8,.15*(i+1),1.1,0,.075*(i+1),zFrente+3.8-i*.9,'piedra');
 // Naves laterales bajas; la central y el crucero mantienen doble altura.
 for(const lado of [-1,1]){
  const lateral=grupo(lado*15,0,0,lado*Math.PI/2);
  muro(fondo,9,.55,[-22,-11,0,11,22].map(x=>({x,w:1.7,h:3.4,y:3.2})),lateral);
  const arcada=grupo(lado*5,0,0,Math.PI/2);
  muro(fondo-1,9,.6,[-22,-11,0,11,22].map(x=>({x,w:7.4,h:7.2,y:.5,mat:null})),arcada);
  const alta=grupo(lado*5,9,0,lado*Math.PI/2);
  muro(fondo,9,.45,[-24,-9,3,15,24].map(x=>({x,w:3,h:5.2,y:1.8})),alta);
  caja(10,.3,fondo,lado*10,9.15,0,'piedra',techo);
  // Cornisa de la nave baja; no sustituye el campanario por una torre lateral.
  caja(.7,.35,fondo+.4,lado*15,9.2,0,'claro');
 }
 caja(ancho,9,.55,0,4.5,-zFrente,'cal');caja(10,9,.55,0,13.5,-zFrente,'cal');
 for(const z of [zCruce-4,zCruce+4]){
  const g=grupo(0,9,z);muro(ancho,9,.45,[{x:0,w:9.5,h:8.8,y:0,mat:null}],g);
 }
 for(const lado of [-1,1]){
  const extremo=grupo(lado*15,9,zCruce,lado*Math.PI/2);
  muro(8,9,.45,[{x:0,w:2.8,h:4.8,y:1.4}],extremo);
 }
 // Cubierta alrededor del tambor: vano circular, sin dejar esquinas abiertas al cielo.
 const apoyo=new T.Shape();apoyo.moveTo(-5,-5);apoyo.lineTo(5,-5);apoyo.lineTo(5,5);apoyo.lineTo(-5,5);apoyo.closePath();
 const abertura=new T.Path();abertura.absarc(0,0,4.2,0,Math.PI*2,true);apoyo.holes.push(abertura);
 const losa=new T.ExtrudeGeometry(apoyo,{depth:.3,bevelEnabled:false,curveSegments:24});losa.rotateX(-Math.PI/2);
 pieza(losa,'piedra',0,18,zCruce,techo);
 // Cubiertas planas simplificadas, material no certificado; cruce libre bajo cúpula.
 caja(10,.3,42,0,18.15,7,'piedra',techo);
 caja(10,.3,6,0,18.15,-25,'piedra',techo);
 for(const lado of [-1,1])caja(10,.3,8,lado*10,18.15,zCruce,'piedra',techo);
 const f=grupo(0,0,zFrente);
 muro(ancho,9,.65,[-10,0,10].map(x=>({x,w:x===0?4.2:3.1,h:x===0?6.4:5.8,y:.6,mat:'madera'})),f);
 for(const x of [-14.8,-4.9,4.9,14.8]){caja(.7,9.4,.9,x,4.7,.25,'claro',f);caja(1,.35,1.1,x,8.8,.3,'claro',f);}
 cornisa(31,9,.35,f);
 // Parapetos con balaustres en los dos cuerpos bajos.
 for(const lado of [-1,1]){
  const x=lado*10;caja(10,.22,1.1,x,9.35,.6,'claro',f);caja(10,.18,.35,x,10.55,1,'claro',f);
  for(let j=0;j<20;j++)cilindro(.09,.14,1,x-4.75+j*.5,9.95,1,'claro',f);
 }
 const segundo=grupo(0,9,0,0,f);
 muro(10,9,.6,[{x:0,w:3.5,h:6.2,y:1.1}],segundo);
 for(const x of [-4.9,4.9])caja(.7,9.4,.9,x,4.7,.35,'claro',segundo);
 pieza(new T.TorusGeometry(2.6,.18,8,32,Math.PI),'claro',0,15.7,.55,f);
 cornisa(10.8,18,.3,f);
 // Frontón del acceso, separado de la ventana del segundo cuerpo.
 const fronton=new T.Shape();fronton.moveTo(-3.1,7);fronton.lineTo(3.1,7);fronton.lineTo(0,9);fronton.closePath();
 pieza(new T.ExtrudeGeometry(fronton,{depth:.35,bevelEnabled:false}),'claro',0,0,.7,f);
 const zTorre=zFrente-2;
 caja(7,3.6,6.6,0,20,zTorre,'cal');caja(8,.35,7.6,0,22,zTorre,'claro');
 // Ocho apoyos y arcos: centro del campanario físicamente abierto.
 const r=3.25;
 for(let i=0;i<8;i++){
  const a=Math.PI/8+i*Math.PI/4;cilindro(.2,.28,4.5,r*Math.sin(a),24.4,zTorre+r*Math.cos(a),'claro');
  const medio=(i+1)*Math.PI/4,g=grupo(r*Math.cos(Math.PI/8)*Math.sin(medio),0,zTorre+r*Math.cos(Math.PI/8)*Math.cos(medio),medio);
  pieza(new T.TorusGeometry(r*Math.sin(Math.PI/8),.16,6,20,Math.PI),'claro',0,25.35,0,g);
 }
 cilindro(3.9,3.9,.35,0,26.8,zTorre,'claro',techo);
 pieza(new T.ConeGeometry(3.9,4,8),'metal',0,28.975,zTorre,techo);
 cruz(0,30.975,zTorre,1.025,techo);
 // Cúpula rebajada sobre tambor con óculos, sobre el crucero.
 const radio=4.3,altoTambor=3.7,baseTambor=18.3;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,g=grupo(radio*Math.sin(a),baseTambor,zCruce+radio*Math.cos(a),a,techo);
  const w=2*radio*Math.tan(Math.PI/8),s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,altoTambor);s.lineTo(-w/2,altoTambor);s.closePath();
  const hueco=new T.Path();hueco.absarc(0,2,.65,0,2*Math.PI,true);s.holes.push(hueco);
  pieza(new T.ExtrudeGeometry(s,{depth:.25,bevelEnabled:false,curveSegments:12}),'cal',0,0,0,g);
  pieza(new T.CircleGeometry(.64,24),'sombra',0,2,.1,g);
 }
 const domo=pieza(new T.SphereGeometry(4.8,32,16,0,2*Math.PI,0,Math.PI/2),'claro',0,22,zCruce,techo);domo.scale.y=2/4.8;
}
