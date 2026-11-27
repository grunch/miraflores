import * as THREE from 'three';
import {optimizarPanteon} from './optimizar-panteon.js';
import {etapaCasaAmarilla} from './casa-amarilla-datos.js';

/** Modelo original interpretativo. Metros aproximados; +Z este/plaza, +X norte.
 * El rectángulo nominal 46×54 sirve para revisión, NO es un levantamiento.
 * El solar colonial no implica que toda su superficie estuviera edificada.
 */
export function crearCasaAmarilla({anio=1772,optimizar=true}={}) {
  const etapa=etapaCasaAmarilla(anio), {colonial,neoclasica,cubiertaMixta}=etapa;
  const edificio=new THREE.Group(),cubiertas=new THREE.Group();
  edificio.name=etapa.nombre;cubiertas.name='Cubiertas desmontables';edificio.add(cubiertas);
  edificio.userData={id:'casa-amarilla',anio,etapa:etapa.id,medidasVerificadas:false,frente:'+Z = este',huella:[46,54]};
  const colores={muro:neoclasica?0xe4c46f:0xdacbad,cal:0xf0e6d0,piedra:0x8c8271,zocalo:0x585856,madera:0x574333,oscuro:0x292e2b,hierro:0x343b38,patio:0xb9a58b,teja:0xa2694d,tejaClara:0xb57d57,tejaOscura:0x88583f,losa:0xb6b0a1,amarillo:0xffcd00,azul:0x003da5,rojo:0xd82337,blanco:0xffffff,dorado:0xbca25c};
  const mats=Object.fromEntries(Object.entries(colores).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.92})]));
  const unidad=new THREE.BoxGeometry(1,1,1);
  function malla(geo,mat,x,y,z,g=edificio){const m=new THREE.Mesh(geo,mats[mat]);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
  function caja(x,y,z,w,h,d,mat='muro',g=edificio){const m=malla(unidad,mat,x,y,z,g);m.scale.set(w,h,d);return m;}
  function grupo(x,z,rot=0,nombre='',padre=edificio){const g=new THREE.Group();g.name=nombre;g.position.set(x,0,z);g.rotation.y=rot;padre.add(g);return g;}
  function barra(a,b,r=.035,mat='hierro',g=edificio){const u=new THREE.Vector3(...a),v=new THREE.Vector3(...b),d=v.clone().sub(u);const m=malla(new THREE.CylinderGeometry(r,r,d.length(),6),mat,...u.add(v).multiplyScalar(.5).toArray(),g);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
  function extruir(s,prof,mat,x,y,z,g=edificio){return malla(new THREE.ExtrudeGeometry(s,{depth:prof,bevelEnabled:false,curveSegments:16}),mat,x,y,z,g);}
  function perfil(puntos,mat,g=edificio){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(puntos.flat(),3));geo.computeVertexNormals();return malla(geo,mat,0,0,0,g);}
  function moldura(x,y,z,w,d,g=edificio){caja(x,y,z,w,.16,d,'cal',g);caja(x,y+.18,z,w+.18,.19,d+.18,'cal',g);caja(x,y+.35,z,w+.38,.12,d+.38,'cal',g);}
  function baranda(x,y,z,w,g=edificio,madera=false){
    const mat=madera?'madera':'hierro';
    for(const dy of [0,.95])caja(x,y+dy,z,w,.08,.09,mat,g);
    for(let u=-w/2;u<=w/2+.01;u+=.24){caja(x+u,y+.47,z,.045,.95,.05,mat,g);if(neoclasica){const aro=malla(new THREE.TorusGeometry(.11,.023,4,10),mat,x+u,y+.47,z,g);aro.scale.y=1.65;}}
  }
  function ventana(x,y,w,h,g,balcon=false,reja=false,ornamento=false){
    caja(x,y+h/2,-.29,w,h,.14,'oscuro',g);
    for(const signo of [-1,1]){
      caja(x+signo*(w/2+.1),y+h/2,.07,.19,h+.3,.22,'cal',g);
      caja(x+signo*w*.32,y+h/2,-.16,w*.29,h-.12,.1,'madera',g);
      for(let v=.2;v<h;v+=.34)caja(x+signo*w*.32,y+v,-.08,w*.28,.035,.04,'piedra',g);
    }
    caja(x,y+h+.08,.08,w+.4,.18,.24,'cal',g);caja(x,y-.08,.1,w+.45,.17,.35,'cal',g);
    caja(x,y+h/2,-.1,.055,h,.07,'cal',g);caja(x,y+h*.6,-.09,w,.05,.07,'cal',g);
    if(balcon){
      caja(x,y-.15,.55,w+.7,.22,1.25,'piedra',g);baranda(x,y,1.13,w+.6,g,colonial);
      for(const signo of [-1,1]){barra([x+signo*(w+.6)/2,y,0],[x+signo*(w+.6)/2,y,1.13],.04,'hierro',g);barra([x+signo*(w+.6)/2,y+.95,0],[x+signo*(w+.6)/2,y+.95,1.13],.04,'hierro',g);for(const z of [.3,.6,.9])caja(x+signo*(w+.6)/2,y+.47,z,.04,.95,.04,'hierro',g);}
    }
    if(reja){for(let u=-w/2+.15;u<w/2;u+=.23)caja(x+u,y+h/2,.18,.035,h,.045,'hierro',g);for(const v of [.25,h*.5,h-.25])caja(x,y+v,.18,w,.045,.05,'hierro',g);}
    if(ornamento){
      const s=new THREE.Shape();s.moveTo(-w*.55,0);s.quadraticCurveTo(-w*.15,.05,-.24,.5);s.quadraticCurveTo(0,.8,.24,.5);s.quadraticCurveTo(w*.15,.05,w*.55,0);s.closePath();extruir(s,.16,'cal',x,y+h+.19,.03,g);
      malla(new THREE.TorusGeometry(.17,.05,6,16),'cal',x,y+h+.51,.24,g);
    }
  }
  // Vanos reales en el muro: las puertas comunican con el zaguán.
  function fachada(w,h,positions,g,{sobre=false,porte=0,interior=false}={}){
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
    const vanos=[];
    for(const x of positions)for(const superior of [false,true]){
      const entrada=!superior&&Math.abs(x-porte)<.1;
      const y=superior?6.25:entrada?.12:1.05,ww=entrada?2.65:1.65,hh=superior?3.05:entrada?4.55:3.45;
      const p=new THREE.Path();p.moveTo(x-ww/2,y);p.lineTo(x-ww/2,y+hh);p.lineTo(x+ww/2,y+hh);p.lineTo(x+ww/2,y);p.closePath();s.holes.push(p);
      vanos.push({x,y,w:ww,h:hh,superior,entrada});
    }
    extruir(s,.65,'muro',0,0,-.65,g);
    for(const [inicio,fin] of (positions.includes(porte)?[[-w/2,porte-1.4],[porte+1.4,w/2]]:[[-w/2,w/2]])){if(fin>inicio)caja((inicio+fin)/2,.35,-.33,fin-inicio,.7,.72,neoclasica?'zocalo':'piedra',g);}
    for(const t of vanos){
      if(t.entrada){
        for(const signo of [-1,1])caja(t.x+signo*(t.w/2+.15),2.42,.14,.3,4.8,.38,'cal',g);
        moldura(t.x,4.85,.12,t.w+.9,.55,g);
        if(neoclasica){for(const signo of [-1,1]){caja(t.x+signo*1.85,2.5,.12,.4,5,.5,'cal',g);caja(t.x+signo*1.85,5.15,.12,.65,.28,.65,'cal',g);}}
        // Dos hojas abiertas, el zaguán sigue siendo visible.
        for(const signo of [-1,1]){const hoja=caja(t.x+signo*1.2,2.3,-1.1,.17,4.35,1.5,'madera',g);hoja.rotation.y=signo*.16;}
      }else ventana(t.x,t.y,t.w,t.h,g,t.superior&&!interior,!t.superior,neoclasica&&!t.superior&&!sobre);
    }
    if(!colonial)caja(0,5.65,.04,w,.21,.24,'cal',g);
    moldura(0,h-.12,-.1,w,.8,g);
    if(neoclasica&&!interior){
      caja(0,h+.95,-.22,w,1.55,.48,'muro',g);moldura(0,h+1.65,-.2,w,.65,g);
      for(let x=-w/2+.65;x<w/2;x+=.65)caja(x,h-.25,.3,.17,.22,.2,'cal',g);
      for(const x of positions){caja(x,h+.95,.04,3.7,.055,.08,'cal',g);for(const dx of [-1.85,1.85])caja(x+dx,h+1.05,.04,.055,.8,.08,'cal',g);caja(x,h+1.44,.04,3.7,.055,.08,'cal',g);}
    }
    // Cadenas de esquina observadas en las referencias.
    if(!colonial)for(const signo of [-1,1])for(let y=.85;y<h-.2;y+=.48)caja(signo*(w/2-.3),y,-.04,.6,.44,.19,'cal',g);
  }
  function techoAnular(cx,cz,w,d,iw,id,y,fondoPlano=false){
    const ext=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],int=[[-iw/2,-id/2],[iw/2,-id/2],[iw/2,id/2],[-iw/2,id/2]];
    const mid=ext.map((p,i)=>[(p[0]+int[i][0])/2,(p[1]+int[i][1])/2]);
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      if(fondoPlano&&i===0){caja(cx,y,cz-(d+id)/4,w,.28,(d-id)/2,'losa',cubiertas);continue;}
      for(const borde of [ext,int]){
        const a=[cx+borde[i][0],y,cz+borde[i][1]],b=[cx+borde[j][0],y,cz+borde[j][1]],c=[cx+mid[j][0],y+2.4,cz+mid[j][1]],e=[cx+mid[i][0],y+2.4,cz+mid[i][1]];
        const puntos=[a,b,c,a,c,e];const cara=perfil(puntos,'teja',cubiertas);cara.material.side=THREE.DoubleSide;
        const n=Math.ceil(new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b))/.4);
        for(let k=0;k<=n;k++){
          const t=k/n;const p=a.map((v,l)=>v+(b[l]-v)*t),q=e.map((v,l)=>v+(c[l]-v)*t);p[1]+=.04;q[1]+=.04;barra(p,q,.045,k%4===0?'tejaOscura':'tejaClara',cubiertas);
        }
      }
      barra([cx+mid[i][0],y+2.48,cz+mid[i][1]],[cx+mid[j][0],y+2.48,cz+mid[j][1]],.13,'tejaClara',cubiertas);
    }
  }
  function arcada(long,y,g,n=4,madera=false){
    const pas=long/n,r=(pas-.5)/2;
    for(let i=0;i<=n;i++){
      const x=-long/2+i*pas;
      if(madera){caja(x,y+2.3,0,.21,4.6,.23,'madera',g);caja(x,y+4.45,0,1.0,.2,.3,'madera',g);}
      else {malla(new THREE.CylinderGeometry(.22,.28,3.15,12),'cal',x,y+1.8,0,g);caja(x,y+.2,0,.65,.4,.65,'cal',g);caja(x,y+3.4,0,.72,.23,.72,'cal',g);}
    }
    if(madera)caja(0,y+4.65,0,long,.35,.35,'madera',g);
    else for(let i=0;i<n;i++){
      const x=-long/2+(i+.5)*pas,s=new THREE.Shape();s.moveTo(-pas/2,5.25);s.lineTo(-pas/2,3.5);s.lineTo(-r,3.5);s.absarc(0,3.5,r,Math.PI,0,true);s.lineTo(pas/2,3.5);s.lineTo(pas/2,5.25);s.closePath();extruir(s,.5,'cal',x,y,-.25,g);
    }
    if(y>1)baranda(0,y+.25,.05,long,g,madera);
  }
  function patio(cx,cz,w,d,madera){
    caja(cx,.12,cz,w,.2,d,'patio');
    // Galerías perimetrales abiertas en ambos niveles.
    for(const [x,z,l,rot] of [[cx,cz+d/2,w,0],[cx,cz-d/2,w,Math.PI],[cx+w/2,cz,d,Math.PI/2],[cx-w/2,cz,d,-Math.PI/2]]){
      const g=grupo(x,z,rot,'Galería del patio');arcada(l,.3,g,Math.ceil(l/4.2),madera);arcada(l,5.55,g,Math.ceil(l/4.2),madera);caja(0,5.45,-1.1,l,.3,2.6,'cal',g);
    }
    // Juntas de solado, sin inventar una fuente monumental.
    for(let x=-w/2;x<=w/2;x+=1)caja(cx+x,.225,cz,.02,.015,d,'piedra');
    for(let z=-d/2;z<=d/2;z+=1)caja(cx,.225,cz+z,w,.015,.02,'piedra');
  }
  function cuerpo(cx,cz,w,d,iw,id,{colonialPatio=false,porte=0}={}){
    const h=10.8;
    caja(cx,.12,cz,w,.24,d,'piedra');
    // Crujías vacías en planta baja, pisos altos alrededor del patio.
    for(const yy of [5.4]){caja(cx,yy,cz+(d+id)/4,w,.3,(d-id)/2,'madera');caja(cx,yy,cz-(d+id)/4,w,.3,(d-id)/2,'madera');for(const signo of [-1,1])caja(cx+signo*(w+iw)/4,yy,cz,(w-iw)/2,.3,id,'madera');}
    const cantidad=colonialPatio?3:7,posiciones=Array.from({length:cantidad},(_,i)=>(i-(cantidad-1)/2)*(w-6)/(cantidad-1));
    fachada(w,h,posiciones,grupo(cx,cz+d/2,0,'Fachada este'),{porte});
    fachada(d,h,Array.from({length:7},(_,i)=>(i-3)*(d-6)/6),grupo(cx+w/2,cz,Math.PI/2,'Fachada norte'),{porte:999,sobre:true});
    caja(cx,h/2,cz-d/2,w,h,.65);caja(cx-w/2,h/2,cz,.65,h,d);
    // Cerramientos detrás de los corredores; portones al interior aproximados.
    for(const [x,z,l,rot] of [[cx,cz+(id/2+2.5),iw,Math.PI],[cx,cz-(id/2+2.5),iw,0],[cx+(iw/2+2.5),cz,id,-Math.PI/2],[cx-(iw/2+2.5),cz,id,Math.PI/2]]){
      const g=grupo(x,z,rot,'Interior de crujía');fachada(l,10.8,[-l*.3,0,l*.3],g,{porte:0,sobre:true,interior:true});
    }
    patio(cx,cz,iw,id,colonialPatio||!neoclasica);
    techoAnular(cx,cz,w+.9,d+.9,iw-1,id-1,h+.4,cubiertaMixta);
  }
  // Plataforma de estudio: delimita el solar, no una plaza ni acera histórica inventada.
  caja(0,-.16,0,47,.3,55,'piedra');
  if(colonial){
    // Cabildo al sur (izquierda); cárcel al norte. Dos patios son una hipótesis explícita.
    cuerpo(-11.5,9,22,35,10,15,{colonialPatio:true});cuerpo(11.5,9,22,35,10,15,{colonialPatio:true});
    for(const x of [-22.6,0,22.6])caja(x,1.55,-18,.55,3.1,18,'muro');caja(0,1.55,-26.6,46,3.1,.55);
    caja(11.5,2,-21,14,4,7,'muro');
    // Casamata posterior: existencia documentada, forma y dimensiones hipotéticas.
    caja(11.5,4.1,-21,14.6,.35,7.6,'losa',cubiertas);
  }else{
    cuerpo(neoclasica?4.5:0,0,neoclasica?37:46,54,neoclasica?17:23,28);
    if(neoclasica){
      // Pared continua: puerta única y balcón común con tres vanos pequeños.
      // Referencias del usuario: puerta-arcos-1.png y puerta-arcos-2.png.
      const g=grupo(-18.5,27,0,'Pabellón conmemorativo de 1810');
      function arco(w,h,Tipo=THREE.Shape){
        const s=new Tipo(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);
        s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);s.closePath();return s;
      }
      const pared=new THREE.Shape();pared.moveTo(-4.5,0);pared.lineTo(4.5,0);pared.lineTo(4.5,10.8);pared.lineTo(-4.5,10.8);pared.closePath();
      const vanos=[{x:0,y:.15,w:3.5,h:4.95},...[-2.5,0,2.5].map(x=>({x,y:6.25,w:1.75,h:3.35}))];
      for(const v of vanos){
        const hueco=arco(v.w,v.h,THREE.Path);
        // Trasladar el contorno sin perder la curva circular del arco.
        const puntos=hueco.getPoints(24).map(p=>new THREE.Vector2(p.x+v.x,p.y+v.y));
        pared.holes.push(new THREE.Path(puntos.reverse()));
        const marco=arco(v.w+.38,v.h+.19),interior=arco(v.w,v.h,THREE.Path);
        marco.holes.push(new THREE.Path(interior.getPoints(24).reverse()));
        extruir(marco,.18,'cal',v.x,v.y,.03,g);
        extruir(arco(v.w,v.h),.12,'madera',v.x,v.y,-.28,g);
        if(v.y>1){
          // Carpintería acristalada de los tres balcones, no una galería abierta.
          extruir(arco(v.w-.22,v.h-.15),.02,'oscuro',v.x,v.y+.08,-.14,g);
          for(const dx of [-v.w*.27,v.w*.27])caja(v.x+dx,v.y+1.5,-.08,v.w*.36,2.7,.06,'losa',g);
          caja(v.x,v.y+1.55,-.02,.1,3.1,.1,'madera',g);
          for(const yy of [.55,1.9])caja(v.x,v.y+yy,-.02,v.w,.09,.1,'madera',g);
        }else{
          // Dos hojas talladas: dos rombos por hoja y panel inferior rectangular.
          caja(0,1.82,-.07,.1,3.35,.14,'madera',g);
          for(const x of [-.82,.82]){
            for(const y of [1.83,2.87]){
              caja(x,y,-.09,1.45,.97,.14,'oscuro',g);
              caja(x,y,-.01,1.35,.9,.12,'madera',g);
              for(const escala of [1,.82]){
                const puntos=[[x,y+.45*escala,.1],[x+.4*escala,y,.1],[x,y-.45*escala,.1],[x-.4*escala,y,.1],[x,y+.45*escala,.1]];
                for(let i=0;i<4;i++)barra(puntos[i],puntos[i+1],.032,'madera',g);
              }
              const rombo=caja(x,y,.1,.23,.23,.055,'dorado',g);rombo.rotation.z=Math.PI/4;
            }
            for(const ancho of [.91,.76]){
              for(const dx of [-ancho/2,ancho/2])caja(x+dx,.74,.04,.055,.83,.07,'madera',g);
              for(const yy of [.33,1.15])caja(x,yy,.04,ancho,.055,.07,'madera',g);
            }
          }
          caja(0,3.52,-.02,3.45,.18,.18,'madera',g);
          for(let x=-1.55;x<1.6;x+=.23)caja(x,3.52,.09,.09,.085,.04,'dorado',g);
          const medallon=malla(new THREE.SphereGeometry(.3,16,12),'dorado',0,4.3,.05,g);medallon.scale.set(.82,1.25,.22);
          const borde=malla(new THREE.TorusGeometry(.32,.035,6,32),'madera',0,4.3,.11,g);borde.scale.set(.83,1.25,1);

        }
      }
      extruir(pared,.65,'muro',0,0,-.65,g);
      // Relieves originales simplificados, guiados por las dos fotos de detalle.
      function curva(puntos,r=.028,mat='cal'){
        const camino=new THREE.CatmullRomCurve3(puntos.map(p=>new THREE.Vector3(...p)));
        return malla(new THREE.TubeGeometry(camino,Math.max(12,puntos.length*3),r,5,false),mat,0,0,0,g);
      }
      function voluta(x,y,z,tam=.22,signo=1,mat='cal'){
        const puntos=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2.3,r=tam*(1-i/29);puntos.push([x+signo*r*Math.cos(a),y+r*Math.sin(a),z]);}curva(puntos,tam*.13,mat);
      }
      function hoja(x,y,z,escala=1,mat='cal'){
        const forma=new THREE.Shape();forma.moveTo(0,-.27);forma.bezierCurveTo(-.25,-.02,-.17,.16,0,.28);forma.bezierCurveTo(.17,.16,.25,-.02,0,-.27);
        const m=extruir(forma,.045,mat,x,y,z,g);m.scale.setScalar(escala);
        curva([[x,y-.2*escala,z+.07],[x+.03*escala,y,z+.09],[x,y+.2*escala,z+.07]],.017*escala,mat);
      }
      function mascaron(x,y,escala=.7){
        const cara=malla(new THREE.SphereGeometry(.15,10,8),'cal',x,y,.24,g);cara.scale.set(escala,escala*1.15,.45);
        for(const signo of [-1,1]){voluta(x+signo*.17*escala,y+.1*escala,.24,.13*escala,signo);hoja(x+signo*.14*escala,y-.14*escala,.22,.6*escala);}
        hoja(x,y-.26*escala,.24,.65*escala);
      }
      function pilastra(x,y,h,w){
        // Marco blanco que deja el campo amarillo hundido, no una columna exenta.
        for(const dx of [-w/2,w/2])caja(x+dx,y+h/2,.1,.12,h,.2,'cal',g);
        for(const yy of [y,y+h])caja(x,yy,.13,w+.12,.14,.25,'cal',g);
        moldura(x,y+h,.12,w+.25,.4,g);mascaron(x,y+h-.48,.85);
      }
      for(const x of [-4.12,-1.25,1.25,4.12])pilastra(x,6.2,2.5,.57);
      for(const x of [-4.12,4.12]){
        pilastra(x,.5,5.12,.55);
        for(const y of [2.25,3.5,4.7]){
          for(const signo of [-1,1])voluta(x+signo*.12,y,.24,.17,signo);
          hoja(x,y-.31,.24,.7);
        }
      }
      for(const x of [-2.02,2.02])pilastra(x,.4,3.05,.45);
      for(const x of [-3.25,3.25]){
        caja(x,.27,-.12,2.45,.54,.8,'zocalo',g);
        caja(x,1.13,.08,1.5,.09,.16,'cal',g);caja(x,.63,.08,1.5,.1,.16,'cal',g);
        for(const dx of [-.75,0,.75])caja(x+dx,.88,.08,.07,.5,.16,'cal',g);
      }
      // Molduras concéntricas de los cuatro arcos, con impostas comunes arriba.
      for(const v of vanos){
        for(const aumento of [.1,.31,.53]){
          const r=(v.w+aumento)/2,cy=v.y+v.h-v.w/2;
          const puntos=Array.from({length:33},(_,i)=>[v.x+r*Math.cos(i*Math.PI/32),cy+r*Math.sin(i*Math.PI/32),.19]);
          curva(puntos,.025);
        }
      }
      // Clave saliente con hoja de acanto sobre el arco de la puerta.
      const clave=new THREE.Shape();clave.moveTo(-.16,0);clave.lineTo(.16,0);clave.lineTo(.3,.63);clave.lineTo(-.3,.63);clave.closePath();
      extruir(clave,.28,'cal',0,4.88,.13,g);hoja(0,5.18,.43,.9);moldura(0,5.51,.25,.7,.55,g);
      // Rosetas radiales en las enjutas del arco.
      for(const x of [-2.85,2.85]){
        for(let i=0;i<20;i++){
          const a=i*Math.PI/10,petalo=malla(new THREE.SphereGeometry(.09,6,5),'cal',x+Math.cos(a)*.23,4.7+Math.sin(a)*.23,.19,g);
          petalo.scale.set(.55,1.6,.35);petalo.rotation.z=a-Math.PI/2;
        }
        malla(new THREE.TorusGeometry(.14,.035,6,24),'cal',x,4.7,.25,g);
      }
      // Tablero conmemorativo: sin transcribir letras ilegibles de las capturas.
      caja(0,5.69,.23,1.16,.26,.12,'losa',g);
      for(let y=5.6;y<5.79;y+=.04)caja(0,y,.298,.83,.012,.012,'piedra',g);
      caja(0,5.46,.06,8.5,.12,.3,'cal',g);
      for(const signo of [-1,1]){
        curva([[signo*.85,5.66,.3],[signo*1.4,5.58,.3],[signo*2,5.76,.3],[signo*2.6,5.61,.3],[signo*3.2,5.7,.3]],.045);
        for(const x of [1.2,2.05,2.9]){voluta(signo*x,5.7,.3,.12,signo);hoja(signo*x,5.57,.3,.35);}
      }
      // Losa escalonada: el centro del balcón sobresale más que sus extremos.
      for(const [y,h,ancho,prof] of [[6.17,.13,8.8,1.15],[6.04,.13,8.65,1.05],[5.91,.13,8.5,.95]]){
        caja(0,y,prof/2,ancho,h,prof+.18,'cal',g);caja(0,y,prof/2+.14,6.55,h,prof+.46,'cal',g);
      }
      // Herrería con paños de rombos, volutas y abanico central.
      for(const y of [6.28,7.23])caja(0,y,1.27,8,.07,.075,'hierro',g);
      for(let x=-4;x<=4.01;x+=.5){
        caja(x,6.75,1.27,.035,.95,.045,'hierro',g);
        const pts=[[x+.25,6.45,1.27],[x+.43,6.75,1.27],[x+.25,7.05,1.27],[x+.07,6.75,1.27],[x+.25,6.45,1.27]];
        if(x<3.9)for(let i=0;i<4;i++)barra(pts[i],pts[i+1],.019,'hierro',g);
      }
      for(const x of [-3.7,-2.7,-1.7,1.7,2.7,3.7])for(const y of [6.43,7.08])voluta(x,y,1.29,.13,Math.sign(x),'hierro');
      for(let i=0;i<=12;i++){const a=i*Math.PI/12;barra([0,6.36,1.3],[Math.cos(a)*.78,6.36+Math.sin(a)*.65,1.3],.018,'hierro',g);}
      for(const x of [-4,4]){const lateral=grupo(x,0,Math.PI/2,'Retorno de balcón',g);baranda(-.64,6.28,0,1.28,lateral);}
      // Cornisa con ménsulas y friso vegetal.
      moldura(0,10.65,0,9,.85,g);
      for(let x=-4;x<=4;x+=.75){
        caja(x,10.43,.19,.18,.35,.44,'cal',g);hoja(x+.35,10.3,.17,.45);
      }
      caja(0,11.35,-.1,9,.18,.55,'cal',g);caja(0,12.3,-.1,9,.2,.6,'cal',g);
      const perfilBalaustre=[[.11,0],[.13,.06],[.07,.12],[.06,.25],[.14,.4],[.15,.49],[.09,.62],[.07,.72],[.12,.8]].map(p=>new THREE.Vector2(...p));
      for(let x=-4.1;x<=4.2;x+=.44)malla(new THREE.LatheGeometry(perfilBalaustre,10),'cal',x,11.44,-.1,g);
      for(const x of [-4.35,-1.45,1.45,4.35])caja(x,11.83,-.1,.3,.88,.42,'cal',g);
      caja(-18.5,5.5,18.5,9,11,.6);caja(-22.7,5.5,22.5,.6,11,9);
      caja(-18.5,5.4,22.1,8.2,.3,8.2,'cal');
      caja(-18.5,5.5,-4.5,9,11,37);
      // Tejado del pabellón y su crujía; no anticipar las platabandas modernas.
      const a=[-23,11.3,27],b=[-14,11.3,27],c=[-14,11.3,-27],d=[-23,11.3,-27],r=[-18.5,13.5,22.5],t=[-18.5,13.5,-22.5];
      perfil([a,b,r,b,c,t,b,t,r,c,d,t,d,a,r,d,r,t],'teja',cubiertas);
      for(let z=-22;z<=22;z+=.42)for(const x of [-23,-14])barra([x,11.34,z],[-18.5,13.54,z],.045,'tejaClara',cubiertas);
      barra(r,t,.12,'tejaClara',cubiertas);
      // Remate circular de la portada principal, no el escudo nacional detallado.
      const s=new THREE.Shape();s.moveTo(-2.2,0);s.lineTo(-2.2,.8);s.absarc(0,.8,2.2,Math.PI,0,true);s.lineTo(2.2,0);s.closePath();extruir(s,.5,'cal',4.5,12.3,26.75);
      malla(new THREE.TorusGeometry(.75,.12,8,32),'piedra',4.5,14,27.3);const escudo=malla(new THREE.SphereGeometry(.55,12,8),'muro',4.5,14,27.28);escudo.scale.set(.8,1.2,.2);
      barra([4.5,14.5,27],[4.5,18,27],.045,'hierro');
      const bandera=grupo(4.55,27,0,'Bandera de Venezuela');
      bandera.userData={estrellas:7,disposicion:anio<1905?'seis y una central':anio<1930?'circunferencia':'arco'};
      const ancho=3.1,alto=1.95;
      const ondear=(u,v)=>[u,17.85-v-.12*u/ancho,.18*Math.sin(u*2.8+v*.8)*u/ancho];
      for(let franja=0;franja<3;franja++){
        const puntos=[];
        for(let i=0;i<32;i++)for(let j=0;j<6;j++){
          const u=i*ancho/32,v=(franja+j/6)*alto/3,du=ancho/32,dv=alto/18;
          const a=ondear(u,v),b=ondear(u+du,v),c=ondear(u+du,v+dv),d=ondear(u,v+dv);puntos.push(a,b,c,a,c,d);
        }
        const m=perfil(puntos,['amarillo','azul','rojo'][franja],bandera);m.material.side=THREE.DoubleSide;
      }
      const centros=anio<1905?[[0,0],...Array.from({length:6},(_,i)=>[.32*Math.cos(i*Math.PI/3),.24*Math.sin(i*Math.PI/3)])]:
        Array.from({length:7},(_,i)=>anio<1930?[.32*Math.cos(i*2*Math.PI/7),.24*Math.sin(i*2*Math.PI/7)]:[.56*Math.cos(Math.PI+i*Math.PI/6),.3*Math.sin(Math.PI+i*Math.PI/6)+.13]);
      for(const [dx,dy] of centros){
        const estrella=new THREE.Shape();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.029:.069;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?estrella.lineTo(x,y):estrella.moveTo(x,y);}estrella.closePath();
        const geo=new THREE.ShapeGeometry(estrella),pos=geo.attributes.position;
        for(let i=0;i<pos.count;i++){const p=ondear(ancho*.52+dx+pos.getX(i),alto/2+dy+pos.getY(i));pos.setXYZ(i,p[0],p[1],p[2]+.012);}geo.computeVertexNormals();
        const m=malla(geo,'blanco',0,0,0,bandera);m.material.side=THREE.DoubleSide;
      }
      // Emblema reducido en el cantón: no reproduce la heráldica en detalle.
      const centro=ondear(.4,.3),emblema=malla(new THREE.SphereGeometry(.14,12,8),'dorado',centro[0],centro[1],centro[2]+.03,bandera);emblema.scale.set(.8,1,.12);

    }
  }
  if(optimizar)optimizarPanteon(edificio);
  return {edificio,cubiertas,etapa};
}
