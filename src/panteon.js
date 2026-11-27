import {crearTrinidad1772,ETAPA_TRINIDAD_1772} from './trinidad-1772.js';
import * as THREE from 'three';
import {optimizarPanteon} from './optimizar-panteon.js';

export const ETAPAS_PANTEON = Object.freeze([
  ETAPA_TRINIDAD_1772,
  {desde:1812,hasta:1875,id:'trinidad-ruinas',nombre:'Iglesia de la Santísima Trinidad',detalle:'Ruinas tras el terremoto de 1812 · referencia Bellermann, 1842–1845'},
  {desde:1875,hasta:1911,id:'panteon-neogotico',nombre:'Panteón Nacional',detalle:'Fachada del siglo XIX · dos agujas y rosetón central'},
  {desde:1911,hasta:1930,id:'panteon-chataing',nombre:'Panteón Nacional',detalle:'Reforma de Alejandro Chataing · ventana ojival y nueva crestería'},
  {desde:1930,hasta:1937,id:'panteon-mujica',nombre:'Panteón Nacional',detalle:'Reforma de Manuel Mujica Millán · tres torres, central elevada'},
]);
export function etapaPanteon(anio) {
  if (!Number.isInteger(anio)) throw new TypeError('El año debe ser un entero.');
  const etapa=ETAPAS_PANTEON.find(e=>anio>=e.desde&&anio<e.hasta);
  if(!etapa) throw new RangeError('Estudio disponible para 1772 y 1812–1936. Otros años coloniales requieren otra fase.');
  return etapa;
}

/** Modelo interpretativo: metros aproximados, Y arriba, frente +Z, origen centro de la nave a nivel de suelo. */
export function crearPanteon({anio=1843,optimizar=true}={}) {
  if(anio===1772)return crearTrinidad1772({optimizar});
  const etapa=etapaPanteon(anio), ruina=anio<1875, moderno=anio>=1930, chataing=anio>=1911;
  const edificio=new THREE.Group(); edificio.name=etapa.nombre;
  const cubiertas=new THREE.Group(); cubiertas.name='Cubiertas'; edificio.add(cubiertas);
  const mats=Object.fromEntries(Object.entries({muro:ruina?0xb2a18a:0xe5dfcd,moldura:0xf2e9d4,piedra:0x928876,oscuro:0x35332c,teja:0x895644,metal:0x54786d,ruina:0x8f7961}).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.9})]));
  const box=new THREE.BoxGeometry(1,1,1);
  function mesh(geo,mat,x,y,z,g=edificio){const m=new THREE.Mesh(geo,mats[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function caja(x,y,z,w,h,d,mat='muro',g=edificio){const m=mesh(box,mat,x,y,z,g);m.scale.set(w,h,d);return m;}
  function perfil(puntos,prof,mat,x,y,z,g=edificio){const s=new THREE.Shape();puntos.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth:prof,bevelEnabled:false}),mat,x,y,z,g);}
  function arco(w,h,ojiva=false){const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(-r,h-r);if(ojiva){s.quadraticCurveTo(-r,h-.35,0,h+.4);s.quadraticCurveTo(r,h-.35,r,h-r);}else s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return s;}
  function vano(x,y,z,w,h,ojiva=false,g=edificio,relleno='oscuro'){
    for(const [a,b,d,mat] of [[w+.65,h+.35,0,'moldura'],[w+.25,h+.12,.08,'piedra'],[w,h,.16,relleno]])mesh(new THREE.ExtrudeGeometry(arco(a,b,ojiva),{depth:.09,bevelEnabled:false,curveSegments:16}),mat,x,y,z+d,g);
    if(relleno==='oscuro')for(let dx=-w/2+.25;dx<w/2;dx+=.3)caja(x+dx,y+(h-w/2)/2,z+.3,.035,h-w/2,.04,'piedra',g);
  }
  function cornisa(x,y,z,w,d,g=edificio){for(const [dy,a,b] of [[0,.2,.2],[.22,.3,.45],[.43,.15,.65]])caja(x,y+dy,z,w+b,a,d+b,'moldura',g);}
  function cruz(x,y,z,escala=1){caja(x,y,z,.12*escala,1.6*escala,.12*escala,'oscuro');caja(x,y+.2*escala,z,.85*escala,.12*escala,.12*escala,'oscuro');}
  function barra(a,b,r=.045,mat='moldura',g=edificio){
    const inicio=new THREE.Vector3(...a),fin=new THREE.Vector3(...b),delta=fin.clone().sub(inicio);
    const m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),6),mat,...inicio.clone().add(fin).multiplyScalar(.5).toArray(),g);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
  }
  function curva(puntos,r=.07,mat='moldura',g=edificio){
    const camino=new THREE.CatmullRomCurve3(puntos.map(p=>new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(camino,Math.max(16,puntos.length*3),r,6,false),mat,0,0,0,g);
  }
  function aguja(x,y,z,r,h){
    if(r<1){mesh(new THREE.CylinderGeometry(0,r,h,8),'piedra',x,y+h/2,z);}
    else {
      // Las agujas grandes de las fotos tienen nervios y diagonales visibles, no conos macizos.
      mesh(new THREE.CylinderGeometry(r*.7,r,1.3,8),'muro',x,y+.65,z);
      const punto=(nivel,lado)=>{const t=nivel/7,a=lado*Math.PI/4;return [x+Math.cos(a)*r*.8*(1-t),y+1.3+(h-1.3)*t,z+Math.sin(a)*r*.8*(1-t)];};
      for(let lado=0;lado<8;lado++){
        barra(punto(0,lado),[x,y+h,z],.055,'piedra');
        for(let k=0;k<7;k++){
          barra(punto(k,lado),punto(k,lado+1),.04,'piedra');
          barra(punto(k,lado),punto(k+1,lado+1),.035,'piedra');
        }
      }
    }
    cruz(x,y+h+.5,z,.6);
  }
  function floron(x,y,z,r=.25){
    for(let i=0;i<4;i++){const a=i*Math.PI/2;mesh(new THREE.SphereGeometry(r*.6,8,6),'moldura',x+Math.cos(a)*r,y+Math.sin(a)*r,z);}
    mesh(new THREE.SphereGeometry(r*.65,8,6),'piedra',x,y,z+.1);
  }
  function pinaculoChataing(x,y,z){
    caja(x,y+.6,z,.65,1.2,.65,'moldura');vano(x,y+.25,z+.34,.25,.7,true);
    perfil([[-.5,0],[.5,0],[0,.65]],.7,'moldura',x,y+1.2,z-.35);
    barra([x,y+1.8,z],[x,y+3.1,z],.065);for(const dy of [1.9,2.5,3])floron(x,y+dy,z,.16);
  }
  function voluta(x,y,z,signo=1){
    const puntos=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*3.3,r=.08+.72*i/48;puntos.push([x+signo*Math.cos(a)*r,y+Math.sin(a)*r,z]);}
    curva(puntos,.12);
  }
  function cubierta(x,z,w,l,y,h){perfil([[-w/2,0],[w/2,0],[0,h]],l,'teja',x,y,z-l/2,cubiertas);}
  function roseton(x,y,z,r){mesh(new THREE.CircleGeometry(r,32),'oscuro',x,y,z);for(const a of [r,r+.25])mesh(new THREE.TorusGeometry(a,.12,8,40),'moldura',x,y,z+.1);for(let i=0;i<10;i++){const a=i*Math.PI/5;const m=caja(x+Math.sin(a)*r/2,y+Math.cos(a)*r/2,z+.15,.045,r,.04,'piedra');m.rotation.z=-a;}}
  caja(0,.4,0,26,.8,58,'piedra');caja(0,.84,0,23,.08,55,'moldura');
  for(let i=0;i<6;i++)caja(0,(i+1)*.07,31-i*.5,24,(i+1)*.14,.55,'piedra');
  // Muros de las naves. Los cortes de los restos son deterministas, no escombros aleatorios por recarga.
  if(ruina){
    for(const lado of [-1,1])for(let i=0;i<11;i++){
      const z=-25+i*4.7,h=2.8+((i*7+(lado+1)*3)%9)*.55;
      perfil([[-2.35,0],[2.35,0],[2.35,h-.7],[1.2,h-.3],[.5,h],[-.3,h-.8],[-1.6,h+.4],[-2.35,h]],.9,'ruina',0,0,0).rotation.y=0;
      const pieza=edificio.children.at(-1);pieza.position.set(lado*11.1,.85,z);pieza.rotation.y=Math.PI/2;
    }
    // Arcadas abiertas que sobreviven sin cubierta, vistas en el dibujo de Bellermann.
    for(const lado of [-1,1])for(let i=0;i<7;i++){
      const g=new THREE.Group();g.position.set(lado*4.4,.85,-24+i*7);g.rotation.y=Math.PI/2;edificio.add(g);
      caja(-3,4,0,1,8,1,'muro',g);caja(3,4,0,1,8,1,'muro',g);
      const s=new THREE.Shape();s.moveTo(-3.5,10);s.lineTo(-3.5,6);s.lineTo(-2.5,6);s.absarc(0,6,2.5,Math.PI,0,true);s.lineTo(3.5,6);s.lineTo(3.5,10);s.closePath();mesh(new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}),'muro',0,0,-.5,g);
    }
    // Fachada colonial central, vano realmente abierto.
    caja(-3.15,8,27,2.1,14.3,1);caja(3.15,8,27,2.1,14.3,1);caja(0,11.9,27,4.2,6.5,1);
    const s=new THREE.Shape();s.moveTo(-2.1,9);s.lineTo(-2.1,5.5);s.absarc(0,5.5,2.1,Math.PI,0,true);s.lineTo(2.1,9);s.closePath();mesh(new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}),'moldura',0,0,26.5);
    for(const x of [-3.9,-3.25,3.25,3.9]){caja(x,8,27.65,.25,14,.3,'moldura');cornisa(x,14.8,27.7,.5,.5);}
    cornisa(0,15.2,27,8.8,1.1);cornisa(0,9,27,8.5,1);
    vano(0,10.3,27.55,1.1,3);caja(0,17.1,27,1.5,2.5,.8);cornisa(0,18.3,27,1.9,1);
    for(const x of [-2,2])voluta(x,16.6,27.5,Math.sign(x));
    for(let i=0;i<40;i++){const m=mesh(new THREE.DodecahedronGeometry(.25+(i%4)*.14,0),'ruina',Math.sin(i*19)*10,1.1,-24+(i*13%49));m.scale.y=.65;}
  }else{
    for(const lado of [-1,1]){
      caja(lado*11,6.5,0,1,11.5,55);cornisa(lado*11,12.2,0,1.2,55);
      const g=new THREE.Group();g.position.set(lado*11.55,0,0);g.rotation.y=lado*Math.PI/2;edificio.add(g);
      for(let z=-22;z<=22;z+=7.3){vano(z,5.5,0,1.6,4,!moderno,g);caja(z+2.7,6,0,.5,10.5,.5,'moldura',g);}
      caja(lado*4.7,8.4,0,.65,15.2,51);cubierta(lado*8,0,6.5,54,12.5,1.8);
    }
    caja(0,7,-27,23,12.5,1);cubierta(0,0,10.2,54,16,4);
    for(const lado of [-1,1])for(let z=-23;z<24;z+=6)caja(lado*4.7,5,z,.8,8.3,.8,'moldura');
    caja(0,8.3,27,23,15,1);
    if(!moderno){
      for(const x of [-6.1,0,6.1]){vano(x,.9,27.6,x===0?4:3.3,7.6,true);if(x!==0||chataing)vano(x,10.1,27.6,2.8,4.4,true);}
      if(!chataing)roseton(0,12.1,27.7,1.45);
      cornisa(0,9,27,23,1.3);cornisa(0,16,27,10,1.4);
      perfil([[-4.5,0],[4.5,0],[0,4]],.9,'moldura',0,16.7,26.8);
      perfil([[-3.7,0],[3.7,0],[0,3.2]],.15,'muro',0,17,27.75);
      for(const lado of [-1,1]){
        barra([lado*4.3,16.9,28],[0,20.8,28],.12);
        for(let k=0;k<8;k++)floron(lado*(4.15-k*.5),17.3+k*.46,28,.13);
      }
      if(chataing){barra([0,20.7,27],[0,22.4,27],.08);for(const y of [21,21.7,22.3])floron(0,y,27,.2);}
      else {cruz(0,21.1,27);for(const [x,y] of [[-.4,17.7],[.4,17.7],[0,18.3]])roseton(x,y,28,.32);}
      for(const x of [-4.7,4.7]){
        for(const dx of [-.45,0,.45]){caja(x+dx,5,28.2,.12,7.5,.15,'moldura');vano(x+dx,12,28.2,.26,2.5,true,edificio,'muro');}
        cornisa(x,10,28.1,1.5,.5);cornisa(x,14.8,28.1,1.5,.5);
      }
      for(let x=-7;x<=7;x+=.55){
        const puntos=[];for(let i=0;i<=10;i++){const a=Math.PI+i*Math.PI/10;puntos.push([x+Math.cos(a)*.22,8.88+Math.sin(a)*.22,27.85]);}curva(puntos,.05);
      }
      for(const x of [-4.7,4.7]){caja(x,8.6,27.8,.7,15.6,.6,'moldura');if(chataing)pinaculoChataing(x,17,27);else aguja(x,17,27,.7,3.8);}
      for(const x of [-9.2,9.2]){
        caja(x,12,25.2,4.6,22.3,5.2);vano(x,3,27.9,1,3,true);vano(x,11,27.9,1.9,5.8,true);vano(x,19,27.9,1.6,3.2,true);
        for(const dx of [-2,2])caja(x+dx,12,28,.22,21,.3,'moldura');
        for(const y of [9,17,23])cornisa(x,y,25.3,4.8,5.3);
        perfil([[-2.3,0],[2.3,0],[0,2.4]],.5,'moldura',x,17.4,27.7);
        aguja(x,23.6,25.3,2,7.4);
        for(const lado of [-1,1]){
          const lateral=new THREE.Group();lateral.position.set(x+lado*2.32,0,25.2);lateral.rotation.y=lado*Math.PI/2;edificio.add(lateral);
          vano(0,19,.03,1.5,3.2,true,lateral);vano(0,11,.03,1.7,5.8,true,lateral);
        }
        for(let dx=-2;dx<=2;dx+=.4)caja(x+dx,22.65,28,.08,.65,.16,'moldura');
        if(!chataing){
          for(const y of [11.7,14.1]){
            mesh(new THREE.CylinderGeometry(.19,.43,.55,12),'piedra',x,y,28.2);
            barra([x,y+.2,28.2],[x,y+.75,28.2],.06,'oscuro');
          }
          floron(x,18.5,28.3,.37);
        }
        for(const dx of [-1.9,1.9])for(const dz of [-1.9,1.9])aguja(x+dx,23.6,25.3+dz,.3,1.7);
      }
      if(chataing){
        cornisa(0,15.5,27,23,1.2);
        for(let x=-7;x<=7;x+=.55)mesh(new THREE.TorusGeometry(.21,.075,5,12),'moldura',x,16.25,27.7);
      }
      for(const x of [-4.1,-3.6,3.6,4.1])caja(x,4.9,28,.17,7.6,.2,'moldura');
    }else{
      for(const x of [-6.6,6.6]){
        // Portales laterales adintelados de la reforma, distintos del acceso central de medio punto.
        caja(x,4.35,27.6,4.5,7.1,.25,'moldura');caja(x,4.25,27.8,3.7,6.7,.15,'oscuro');
        for(const dx of [-2.25,2.25]){caja(x+dx,4.5,27.9,.4,7.5,.65,'moldura');cornisa(x+dx,8.1,27.8,.6,.8);}
        cornisa(x,8.5,27.5,5.2,1);vano(x,11,27.6,1.2,2.6);
        curva([[x-2.6,15.5,27.7],[x-1.4,15,27.7],[x,14.7,27.7],[x+1.4,15,27.7],[x+2.6,15.5,27.7]],.18);
      }
      function torre(x,z,w,alto){
        const g=new THREE.Group();g.name=x===0?'Torre central':'Torre lateral';g.position.set(x,0,z);edificio.add(g);
        caja(0,alto/2,0,w,alto,w,'muro',g);
        for(const dx of [-w/2+.25,w/2-.25])caja(dx,alto/2,w/2+.15,.25,alto,.3,'moldura',g);
        vano(0,alto*.48,w/2+.05,w*.35,alto*.28,false,g);
        cornisa(0,alto,0,w+.3,w+.3,g);
        mesh(new THREE.CylinderGeometry(w*.48,w*.58,4,8),'muro',0,alto+2.6,0,g);
        for(let i=0;i<4;i++){const f=new THREE.Group();f.rotation.y=i*Math.PI/2;g.add(f);vano(0,alto+1,f.position.z+w*.5,w*.25,2.4,false,f);}
        cornisa(0,alto+4.6,0,w,w,g);
        mesh(new THREE.CylinderGeometry(w*.32,w*.4,1.8,12),'moldura',0,alto+5.8,0,g);
        // Perfil abombado y estrechado en la coronación, según la postal de la reforma.
        const perfilCupula=[[0,2.9],[.12,2.8],[.25,2.5],[.34,2.1],[.4,1.5],[.37,.8],[.3,.25],[.3,0]].map(([r,h])=>new THREE.Vector2(r*w,h*w/4));
        mesh(new THREE.LatheGeometry([...perfilCupula].reverse(),24),'metal',0,alto+6.5,0,g);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;curva(perfilCupula.slice(1).map(p=>[Math.cos(a)*p.x,alto+6.5+p.y,Math.sin(a)*p.x]),.04,'moldura',g);
        }
        for(const dx of [-w*.43,w*.43]){
          curva([[dx,alto-1,w/2+.2],[dx*1.13,alto-.1,w/2+.2],[dx,alto+.9,w/2+.2]],.12,'moldura',g);
          caja(dx,alto+2.4,w*.49,.24,3,.28,'moldura',g);
        }
        cruz(x,alto+6.5+2.9*w/4+.6,z,.8);
      }
      torre(-9.4,24.8,4.4,20);torre(9.4,24.8,4.4,20);torre(0,27,6.4,35);
      vano(0,.9,30.3,3.7,8.8);cornisa(0,10,30.1,7.3,1.2);
      roseton(0,12.5,30.3,.7);
      curva([[-3.7,10.6,30.7],[-2.8,10.7,30.7],[-1.7,11.9,30.7],[-.8,12.1,30.7],[0,11.8,30.7],[.8,12.1,30.7],[1.7,11.9,30.7],[2.8,10.7,30.7],[3.7,10.6,30.7]],.18);
      for(const x of [-2.5,2.5]){caja(x,5.3,30.5,.55,9.2,.8,'moldura');cornisa(x,9.7,30.5,.8,.9);}
      voluta(-1.2,12.5,30.5,-1);voluta(1.2,12.5,30.5,1);
    }
  }
  edificio.userData={id:'panteon',anio,etapa:etapa.id,unidad:'metro',fachada:'+Z',dimensionesAproximadas:true,origen:'Centro de la nave, cota del terreno',fuente:'https://fundaayc.com/tag/panteon-nacional/',limite:'Reconstrucción interpretativa. Laterales, planta y proporciones sin levantamiento; estudio limitado a 1812–1936.'};
  if(optimizar)optimizarPanteon(edificio);
  return {edificio,cubiertas,etapa};
}
