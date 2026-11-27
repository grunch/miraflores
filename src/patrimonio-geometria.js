import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Primitivas de estudio. +Z frente; metros nominales. Materiales sin texturas externas. */
export function taller(edificio,cubiertas,nivelDetalle){
 const colores={cal:0xe6d6b9,claro:0xf6ead2,ocre:0xbb8651,zocalo:0x897b66,teja:0xa55236,metal:0x6f7773,hierro:0x414e49,madera:0x644832,sombra:0x383a32,arena:0xc4a67b,camino:0xc7b99a,verde:0x829568,hoja:0x486644,tronco:0x6b543a,piedra:0xc3bba8};
 const materiales=Object.fromEntries(Object.entries(colores).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:.9})]));
 const segmentos=nivelDetalle==='ciudad'?12:24;
 const curvas=nivelDetalle==='ciudad'?4:12;
 function pieza(geo,mat,x=0,y=0,z=0,g=edificio){const m=new T.Mesh(geo,materiales[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 const caja=(w,h,d,x,y,z,mat='cal',g=edificio)=>pieza(new T.BoxGeometry(w,h,d),mat,x,y,z,g);
 const cilindro=(r1,r2,h,x,y,z,mat='cal',g=edificio)=>pieza(new T.CylinderGeometry(r1,r2,h,segmentos),mat,x,y,z,g);
 function grupo(x=0,y=0,z=0,angulo=0,padre=edificio){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angulo;padre.add(g);return g;}
 function arco(w,h,rect=false){if(rect){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();return s;}const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();return s;}
 function vano(w,h,x,y,z,g=edificio,mat='sombra',reja=false,rect=false){
  const s=arco(w+.26,h+.15,rect);s.holes.push(new T.Path(arco(w,h,rect).getPoints(curvas)));
  pieza(new T.ExtrudeGeometry(s,{depth:.2,bevelEnabled:false,curveSegments:curvas}),'claro',x,y,z,g);
  if(mat)pieza(new T.ShapeGeometry(arco(w,h,rect),curvas),mat,x,y,z-.16,g);
  if(reja){for(let xx=-w/2+.22;xx<w/2;xx+=.3)caja(.045,h-(rect?0:w/2),.06,x+xx,y+(h-(rect?0:w/2))/2,z+.12,'hierro',g);for(const yy of [h*.2,h*.45])caja(w,.055,.06,x,y+yy,z+.12,'hierro',g);}
 }
 function muro(w,h,d,vanos,g=edificio,mat='cal'){
  const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
  for(const v of vanos){s.holes.push(new T.Path(arco(v.w,v.h,v.rect).getPoints(curvas).map(p=>new T.Vector2(p.x+v.x,p.y+(v.y??.04)))));vano(v.w,v.h,v.x,v.y??.04,d/2+.015,g,v.mat===undefined?'sombra':v.mat,v.reja,v.rect);}
  const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:curvas});geo.translate(0,0,-d/2);pieza(geo,mat,0,0,0,g);
 }
 function anillo(ri,ro,y,h,mat='cal',g=edificio){
  const s=new T.Shape();s.absarc(0,0,ro,0,2*Math.PI,false);const p=new T.Path();p.absarc(0,0,ri,0,2*Math.PI,true);s.holes.push(p);
  const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:nivelDetalle==='ciudad'?24:48});geo.rotateX(-Math.PI/2);return pieza(geo,mat,0,y,0,g);
 }
 function techoAnular(ri,ro,yi,yo,g=cubiertas,mat='metal'){
  const n=96,p=[],ind=[];
  for(let i=0;i<=n;i++){const a=i*2*Math.PI/n;for(const [r,y] of [[ri,yi],[ro,yo]])p.push(r*Math.sin(a),y,r*Math.cos(a));}
  for(let i=0;i<n;i++){const a=i*2;ind.push(a,a+1,a+2,a+1,a+3,a+2);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(ind);geo.computeVertexNormals();const m=pieza(geo,mat,0,0,0,g);m.material.side=T.DoubleSide;return m;
 }
 function tejado(w,d,y,x=0,z=0,g=cubiertas){const geo=new T.CylinderGeometry(0,1,1,4,1);geo.rotateY(Math.PI/4);const m=pieza(geo,'teja',x,y+1,z,g);m.scale.set(w/Math.SQRT2,2,d/Math.SQRT2);return m;}
 function cornisa(w,y,z,g=edificio){for(const [yy,dd,hh] of [[y,.6,.2],[y+.3,.85,.2]])caja(w,hh,dd,0,yy,z,'claro',g);}
 function reja(w,h,x,y,z,g=edificio){for(let xx=-w/2;xx<=w/2;xx+=.35)caja(.06,h,.07,x+xx,y+h/2,z,'hierro',g);for(const yy of [.15,h*.65,h])caja(w,.07,.09,x,y+yy,z,'hierro',g);}
 function cipres(x,z,h=10){cilindro(.18,.3,h*.5,x,h*.25,z,'tronco');const m=pieza(new T.SphereGeometry(1,12,8),'hoja',x,h*.57,z);m.scale.set(h*.13,h*.49,h*.13);}
 function cruz(x,y,z,h=1.3,g=edificio){caja(.13,h,.15,x,y+h/2,z,'claro',g);caja(h*.55,.13,.15,x,y+h*.72,z,'claro',g);}
 function cerrar(){
  edificio.updateMatrixWorld(true);
  if(nivelDetalle!=='ciudad')return;
  // Agrupar por material, conservando cubiertas separadas para el visor y la integración.
  for(const destino of [edificio,cubiertas]){
   const grupos=new Map(),retirar=[];
   destino.traverse(o=>{if(!o.isMesh)return;let p=o.parent;while(p&&p!==destino){if(p===cubiertas&&destino===edificio)return;p=p.parent;}
    const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.deleteAttribute('uv');
    const lista=grupos.get(o.material)||{geometrias:[],castShadow:false,receiveShadow:false};lista.geometrias.push(geo);lista.castShadow||=o.castShadow;lista.receiveShadow||=o.receiveShadow;grupos.set(o.material,lista);retirar.push(o);
   });
   for(const o of retirar){o.removeFromParent();o.geometry.dispose();}
   for(const [material,grupo] of grupos){const g=mergeGeometries(grupo.geometrias);grupo.geometrias.forEach(g=>g.dispose());const m=new T.Mesh(g,material);m.castShadow=grupo.castShadow;m.receiveShadow=grupo.receiveShadow;destino.add(m);}
  }
 }
 return {pieza,caja,cilindro,grupo,arco,vano,muro,anillo,techoAnular,tejado,cornisa,reja,cipres,cruz,cerrar};
}
