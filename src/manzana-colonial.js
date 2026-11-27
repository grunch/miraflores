import * as THREE from 'three';
import {planificarManzana,PERFIL_COLONIAL,azarDeSemilla} from './manzana-plan.js';
import {puntoEnPerimetro} from './manzana-perimetro.js';
import {optimizarPanteon} from './optimizar-panteon.js';

/** Cubierta continua sobre la unión de crujías. Los bordes interiores producen patios abiertos. */
function tejado(rects,altura,paso,color){
 const xs=[...new Set(rects.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b),zs=[...new Set(rects.flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b);
 const dividir=a=>a.flatMap((v,i)=>i===a.length-1?[v]:Array.from({length:Math.ceil((a[i+1]-v)/paso)},(_,j)=>v+(a[i+1]-v)*j/Math.ceil((a[i+1]-v)/paso)));
 const X=dividir(xs),Z=dividir(zs),nx=X.length-1,nz=Z.length-1;
 const dentro=(x,z)=>rects.some(r=>Math.abs(x-r.x)<r.w/2+1e-7&&Math.abs(z-r.z)<r.d/2+1e-7);
 const celdas=Array.from({length:nx},(_,i)=>Array.from({length:nz},(_,j)=>dentro((X[i]+X[i+1])/2,(Z[j]+Z[j+1])/2)));
 const bordes=[];
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)if(celdas[i][j]){
  if(!celdas[i-1]?.[j])bordes.push([X[i],Z[j],X[i],Z[j+1]]);
  if(!celdas[i+1]?.[j])bordes.push([X[i+1],Z[j],X[i+1],Z[j+1]]);
  if(!celdas[i]?.[j-1])bordes.push([X[i],Z[j],X[i+1],Z[j]]);
  if(!celdas[i]?.[j+1])bordes.push([X[i],Z[j+1],X[i+1],Z[j+1]]);
 }
 const y=(x,z)=>{let d=Infinity;for(const [a,b,c,dz] of bordes){const px=Math.max(Math.min(a,c),Math.min(Math.max(a,c),x)),pz=Math.max(Math.min(b,dz),Math.min(Math.max(b,dz),z));d=Math.min(d,Math.hypot(x-px,z-pz));}return altura+.18+d*PERFIL_COLONIAL.pendiente;};
 const posiciones=[],colores=[],base=new THREE.Color(color),lineas=[];
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)if(celdas[i][j]){
  const x=X[i],xx=X[i+1],z=Z[j],zz=Z[j+1],cx=(x+xx)/2,cz=(z+zz)/2;
  const p=[[x,y(x,z),z],[x,y(x,zz),zz],[xx,y(xx,zz),zz],[xx,y(xx,z),z]],centro=[cx,y(cx,cz),cz];
  const variacion=.94+.1*((Math.sin(cx*71.3+cz*19.8)*43758.5)%1+1)/2;
  for(let k=0;k<4;k++){posiciones.push(...p[k],...p[(k+1)%4],...centro);for(let v=0;v<3;v++)colores.push(base.r*variacion,base.g*variacion,base.b*variacion);}
  // Juntas discretas de las tejas, exportables como geometría en detalle cercano.
  if(paso<1&&i%2===0)lineas.push([p[0],p[1]]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(posiciones,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colores,3));g.computeVertexNormals();const uv=[];for(let i=0;i<posiciones.length;i+=9){const n=g.attributes.normal,porX=Math.abs(n.getX(i/3))>Math.abs(n.getZ(i/3));for(let j=0;j<3;j++){const k=i+j*3;uv.push(posiciones[k+(porX?2:0)],posiciones[k+(porX?0:2)]);}}g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return{g,lineas};
}
export function crearManzanaColonial(opciones={},planPreparado=null){
 const detalle=opciones.detalle??'estudio';if(!['estudio','ciudad'].includes(detalle))throw new RangeError('Detalle: estudio o ciudad.');
 const plan=planPreparado??planificarManzana(opciones),manzana=new THREE.Group(),cubiertas=new THREE.Group(),vegetacion=new THREE.Group(),construcciones=new THREE.Group(),suelos=new THREE.Group();
 manzana.name='Manzana colonial';cubiertas.name='Cubiertas';vegetacion.name='Vegetación';construcciones.name='Casas y tapias';suelos.name='Suelos de los solares';manzana.add(suelos,construcciones,cubiertas,vegetacion);
 manzana.userData={generador:'manzana-colonial',version:plan.version,semilla:plan.semilla,ancho:plan.ancho,fondo:plan.fondo,detalle,lados:plan.perimetro.lados,angulos:plan.perimetro.angulos,interpretativo:true};
 const materiales=new Map(),unidad=new THREE.BoxGeometry(1,1,1),rng=azarDeSemilla(plan.semilla+'-detalle');
 function mat(color){if(!materiales.has(color))materiales.set(color,new THREE.MeshStandardMaterial({color,roughness:1}));return materiales.get(color);}
 function mesh(geo,color,x,y,z,g){const m=new THREE.Mesh(geo,typeof color==='number'?mat(color):color);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
 function caja(x,y,z,w,h,d,color,g=construcciones){const m=mesh(unidad,color,x,y,z,g);m.scale.set(w,h,d);return m;}
 function barra(a,b,r,color,g){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),dir=w.clone().sub(v);const m=mesh(new THREE.CylinderGeometry(r,r,dir.length(),4),color,...v.add(w).multiplyScalar(.5).toArray(),g);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());}
 function local(c,p){const co=Math.cos(c.giro),si=Math.sin(c.giro);return[c.x+co*p[0]+si*p[2],p[1],c.z-si*p[0]+co*p[2]];}
 function box(c,x,y,z,w,h,d,color,g=construcciones){const m=caja(...local(c,[x,y,z]),w,h,d,color,g);m.rotation.y=c.giro;return m;}
 function arbol(x,z,r,h){
  mesh(new THREE.CylinderGeometry(.15,.25,h*.7,5),0x6c5940,x,h*.35,z,vegetacion);
  for(let i=0;i<(detalle==='ciudad'?2:5);i++){
   const a=i*2.4,rr=i? r*.45:0;
   const m=mesh(new THREE.IcosahedronGeometry(1,detalle==='ciudad'?0:1),[0x536e37,0x698144,0x405f31,0x7a8848][Math.floor(rng()*4)],x+Math.cos(a)*rr,h*(.76+rng()*.15),z+Math.sin(a)*rr,vegetacion);m.scale.set(r*.8,r*.7,r*.8);
  }
 }
 const roofmat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 for(const c of plan.casas){
  // Todos los solares llegan a su alineación; los vacíos se abren hacia el interior.
  box(c,0,.015,c.profundidad/2,c.frente,.03,c.profundidad,0xb9a481,suelos);
  box(c,c.patio.x,.045,c.patio.z,c.patio.w*.9,.04,c.patio.d*.9,c.arboles.length?[0x818653,0x788052,0x8d8a5c][Math.floor(rng()*3)]:0xc0ad8d,suelos);
  for(const r of c.rects){
   box(c,r.x,c.altura/2,r.z,r.w,c.altura,r.d,c.muro);
   // Alero fino; la proyección queda dentro del solar y evita invasión de vecinos.
   box(c,r.x,c.altura-.08,r.z,r.w,.15,r.d,0x735039);
  }
  const roof=tejado(c.rects,c.altura,detalle==='ciudad'?1.8:.72,c.teja);
  roof.g.applyMatrix4(new THREE.Matrix4().makeRotationY(c.giro).setPosition(c.x,0,c.z));mesh(roof.g,roofmat,0,0,0,cubiertas).userData.colorBase=c.teja;
  if(detalle==='estudio')for(const [a,b] of roof.lineas){const aa=local(c,a),bb=local(c,b);aa[1]+=.016;bb[1]+=.016;barra(aa,bb,.012,0x88583d,cubiertas);}
  // Fachada doméstica: cal, zócalo, puertas de madera y ventanas verticales enrejadas.
  box(c,0,.33,-.025,c.frente,.65,.06,0x9d8770);
  const n=Math.max(2,Math.floor(c.frente/3.1)),puerta=Math.floor(n*.35),paso=c.frente/n;
  for(let i=0;i<n;i++){
   const x=-c.frente/2+(i+.5)*paso,esPuerta=i===puerta,w=esPuerta?1.2:.94,h=esPuerta?2.5:1.55,y=esPuerta?1.25:1.95;
   box(c,x,y,-.055,w+.22,h+.2,.11,0xeadfc6);box(c,x,y,-.13,w,h,.08,0x4b4638);box(c,x,y,-.18,w*.86,h*.95,.045,0x63523d);
   if(detalle==='estudio'){
    if(esPuerta){for(let k=0;k<5;k++)box(c,x-w*.4+k*w*.2,y,-.21,.025,h*.92,.025,0x8d7350);}
    else for(let k=0;k<5;k++)box(c,x-w*.4+k*w*.2,y,-.24,.035,h,.035,0x303c34);
   }
   if(c.altura>6){box(c,x,5.1,-.08,1.12,1.9,.1,0xeee2c9);box(c,x,5.1,-.16,.9,1.68,.07,0x5f503c);box(c,x,4.27,-.38,1.35,.14,.7,0x8c7c63);for(let k=0;k<6;k++)box(c,x-.6+k*.24,4.7,-.7,.035,.8,.035,0x353e32);box(c,x,5.08,-.7,1.35,.06,.06,0x353e32);}
  }
  // Ventanas en todos los otros muros construidos que dan a la calle.
  // Detectar el borde del perímetro también cubre solares que ocupan media o toda la manzana.
  const frentesSecundarios=[
   {eje:'x',valor:-c.frente/2,giro:Math.PI/2},
   {eje:'x',valor:c.frente/2,giro:-Math.PI/2},
   {eje:'z',valor:c.profundidad,giro:Math.PI},
  ];
  for(const f of frentesSecundarios){
   const lateral=f.eje==='x',centro=lateral?[f.valor,0,c.profundidad/2]:[0,0,f.valor];
   const [wx,,wz]=local(c,centro);
   if(Math.abs(Math.abs(wx)-plan.ancho/2)>1e-6&&Math.abs(Math.abs(wz)-plan.fondo/2)>1e-6)continue;
   const intervalos=c.rects.filter(r=>Math.abs(Math.abs(r[f.eje]-f.valor)-(lateral?r.w:r.d)/2)<1e-6)
    .map(r=>lateral?[r.z-r.d/2,r.z+r.d/2]:[r.x-r.w/2,r.x+r.w/2]).sort((a,b)=>a[0]-b[0]);
   const tramos=[];for(const tramo of intervalos){const anterior=tramos.at(-1);if(anterior&&tramo[0]<=anterior[1]+1e-6)anterior[1]=Math.max(anterior[1],tramo[1]);else tramos.push([...tramo]);}
   for(const [inicio,fin] of tramos){
    const largo=fin-inicio;if(largo<1.8)continue;
    const [x,,z]=local(c,lateral?[f.valor,0,(inicio+fin)/2]:[(inicio+fin)/2,0,f.valor]);
    const fachada={x,z,giro:c.giro+f.giro},n=Math.max(1,Math.ceil(Math.floor(largo/3.1)/2));
    box(fachada,0,.33,-.025,largo,.65,.06,0x9d8770);
    for(let i=0;i<n;i++){
     const u=-largo/2+(i+.5)*largo/n;
     for(const y of c.altura>6?[1.95,5.1]:[1.95]){
      box(fachada,u,y,-.055,1.16,1.75,.11,0xeadfc6);
      box(fachada,u,y,-.13,.94,1.55,.08,0x4b4638);
      box(fachada,u,y,-.18,.94*.86,1.55*.95,.045,0x63523d);
      if(detalle==='estudio')for(let k=0;k<5;k++)box(fachada,u-.94*.4+k*.94*.2,y,-.24,.035,1.55,.035,0x303c34);
     }
    }
   }
  }
  for(let k=0;k<Math.max(2,Math.floor(c.patio.w/3));k++){const x=c.patio.x-c.patio.w*.3+k*2.5;if(x>c.patio.x+c.patio.w*.4)break;box(c,x,1.8,c.rects[0].d+.035,.85,1.45,.09,0xeee2cb);box(c,x,1.8,c.rects[0].d+.09,.68,1.27,.08,0x5d503d);}
  // Tapias bajas que delimitan solares sin convertir el corazón en una plaza común.
  box(c,0,.85,c.profundidad-.1,c.frente,1.7,.2,0xc1ae88);
  for(const x of [-c.frente/2+.08,c.frente/2-.08])box(c,x,.85,(c.profundidad+c.rects[0].d)/2,.16,1.7,c.profundidad-c.rects[0].d,0xbba984);
  for(const a of c.arboles){const [x,,z]=local(c,[a.x,0,a.z]);arbol(x,z,a.radio,a.altura);}
 }
 for(const j of plan.jardines){
  caja(j.x,.02,j.z,j.w,.04,j.d,[0x8b8a5e,0x9b946a,0xa29672,0x838653][Math.floor(rng()*4)],suelos);
  caja(j.x-j.w*.15,.05,j.z-j.d*.25,j.w*.45,.025,j.d*.23,0xb8a17a,suelos);
  caja(j.x,.75,j.z-j.d/2,j.w,1.5,.2,0xbbaa86);caja(j.x-j.w/2,.75,j.z,.2,1.5,j.d,0xbbaa86);
  for(const a of j.arboles)arbol(j.x+a.x,j.z+a.z,a.radio,a.altura);
  for(const r of j.rects)caja(r.x,j.altura/2,r.z,r.w,j.altura,r.d,0xc5b795);
  const {g}=tejado(j.rects,j.altura,detalle==='ciudad'?1.8:.72,j.teja);mesh(g,roofmat,0,0,0,cubiertas).userData.colorBase=j.teja;
 }
 // Fusionar por material mantiene cuatro capas y pocos draw calls. El tejado conserva sus colores por vértice.
 for(const grupo of [suelos,construcciones,vegetacion])optimizarPanteon(grupo);
 // El optimizador heredado elimina atributos extra: fusionar cubiertas con color por separado.
 // Se conservan las mallas de tejado; las juntas sí se fusionan por material.
 const juntas=new THREE.Group();juntas.name='Juntas de tejas';for(const m of [...cubiertas.children])if(m.material!==roofmat)juntas.add(m);optimizarPanteon(juntas);cubiertas.add(juntas);
 manzana.updateMatrixWorld(true);
 // Hornear cada transformación antes de deformar: paredes y tejados comparten el mismo mapa.
 manzana.traverse(o=>{if(!o.isMesh)return;const anterior=o.geometry,g=anterior.clone().applyMatrix4(o.matrixWorld),p=g.attributes.position;for(let i=0;i<p.count;i++){const [x,z]=puntoEnPerimetro(p.getX(i),p.getZ(i),plan.ancho,plan.fondo,plan.perimetro.vertices);p.setXYZ(i,x,p.getY(i),z);}g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);anterior.dispose();});
 manzana.updateMatrixWorld(true);
 return{manzana,cubiertas,vegetacion,construcciones,suelos,plan,liberar(){const gs=new Set(),ms=new Set();manzana.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.add(unidad);gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}};
}
