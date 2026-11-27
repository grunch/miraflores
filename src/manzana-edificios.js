import * as THREE from 'three';
import {ajustarContacto,ampliarReservaVacia} from './manzana-contacto.js';
import {crearPalacio} from './palacio.js';
import {crearPalacioArzobispal} from './palacio-arzobispal.js';
import {crearCasaAmarilla} from './casa-amarilla.js';
import {crearCapitolio} from './capitolio.js';
import {crearPanteon} from './panteon.js';
import {crearSanFrancisco} from './san-francisco.js';
import {planificarManzana,recetaDeManzana,PERFIL_COLONIAL} from './manzana-plan.js';
import {puntoEnPerimetro} from './manzana-perimetro.js';
import {crearManzanaColonial} from './manzana-colonial.js';
export const EDIFICIOS_MANZANA={miraflores:{nombre:'Palacio de Miraflores',crear:crearPalacio},arzobispal:{nombre:'Palacio Arzobispal',crear:crearPalacioArzobispal},'casa-amarilla':{nombre:'Casa Amarilla',crear:crearCasaAmarilla},capitolio:{nombre:'Capitolio',crear:crearCapitolio},panteon:{nombre:'Panteón Nacional',crear:crearPanteon},'san-francisco':{nombre:'Iglesia de San Francisco',crear:crearSanFrancisco}};
function liberar(raiz){const gs=new Set(),ms=new Set();raiz.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
const limites=p=>({x0:Math.min(...p.map(v=>v[0])),x1:Math.max(...p.map(v=>v[0])),z0:Math.min(...p.map(v=>v[1])),z1:Math.max(...p.map(v=>v[1]))});
const solapa=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.z0<b.z1&&a.z1>b.z0;
export function crearManzanaCompuesta(opciones={}){
 if(opciones.version!==undefined&&opciones.version!==PERFIL_COLONIAL.version)throw new Error('Versión de perfil incompatible.');
 const {edificio='',esquina='SE',anio=1911,contacto='separado',separacion=2}=opciones;
 if(!edificio){const m=crearManzanaColonial(opciones);m.receta=recetaDeManzana(m.plan);return m;}
 if(!['adosado','separado'].includes(contacto))throw new Error('Contacto inválido.');
 if(!Number.isFinite(separacion)||separacion<0||separacion>15)throw new Error('Separación: usa entre 0 y 15 metros.');
 const margen=contacto==='adosado'?0:separacion;
 if(!EDIFICIOS_MANZANA[edificio])throw new Error('Edificio desconocido.');
 if(!['NO','NE','SE','SO'].includes(esquina))throw new Error('Esquina inválida.');
 if(![1772,1843,1889,1911,1936].includes(anio))throw new Error('Época inválida.');
 const plan=planificarManzana(opciones),modelo=EDIFICIOS_MANZANA[edificio].crear({anio,nivelDetalle:opciones.detalle??'estudio',conCeiba:false}),raiz=modelo.edificio??modelo.palacio;
 try{
  raiz.rotation.y=esquina.startsWith('N')?Math.PI:0;raiz.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(raiz),w=b.max.x-b.min.x,d=b.max.z-b.min.z;
  const vertices=plan.perimetro.vertices,ext=limites(vertices),objetivo=vertices[['NO','NE','SE','SO'].indexOf(esquina)];
  const dentro=([x,z])=>vertices.every((a,i)=>{const c=vertices[(i+1)%4];return(c[0]-a[0])*(z-a[1])-(c[1]-a[1])*(x-a[0])>=-1e-7;});
  let mejor=null,distancia=Infinity;
  // Buscar un solar rectangular que quepa entero: el hito nunca se deforma con la manzana.
  for(let i=0;i<=80;i++)for(let j=0;j<=80;j++){
   const x=ext.x0+(ext.x1-ext.x0)*i/80,z=ext.z0+(ext.z1-ext.z0)*j/80;
   const r={x0:x-w/2-.6,x1:x+w/2+.6,z0:z-d/2-.6,z1:z+d/2+.6};
   if(![[r.x0,r.z0],[r.x1,r.z0],[r.x1,r.z1],[r.x0,r.z1]].every(dentro))continue;
   const distanciaActual=(x-objetivo[0])**2+(z-objetivo[1])**2;
   if(distanciaActual<distancia){distancia=distanciaActual;mejor={...r,x,z};}
  }
  if(!mejor)throw new Error(`${EDIFICIOS_MANZANA[edificio].nombre} necesita un solar de ${Math.ceil(w+1.2)} × ${Math.ceil(d+1.2)} m. Amplía los lados o cambia los ángulos.`);
  raiz.position.x+=mejor.x-(b.min.x+b.max.x)/2;raiz.position.z+=mejor.z-(b.min.z+b.max.z)/2;
  const areaLote=(c)=>{const co=Math.cos(c.giro??0),si=Math.sin(c.giro??0);return limites([[-c.frente/2,0],[c.frente/2,0],[c.frente/2,c.profundidad],[-c.frente/2,c.profundidad]].map(([x,z])=>puntoEnPerimetro(c.x+co*x+si*z,c.z-si*x+co*z,plan.ancho,plan.fondo,vertices)));};
  const destino={x0:mejor.x-w/2-margen,x1:mejor.x+w/2+margen,z0:mejor.z-d/2-margen,z1:mejor.z+d/2+margen};
  const casas=plan.casas.filter(c=>!solapa(areaLote(c),destino));
  const jardines=plan.jardines.filter(j=>!solapa(areaLote({x:j.x,z:j.z-j.d/2,frente:j.w,profundidad:j.d}),destino));
  const preparado={...plan,casas,jardines,estadisticas:{...plan.estadisticas,casas:casas.length,patios:casas.length,jardines:jardines.length}};
  const m=crearManzanaColonial(opciones,preparado);
  const parcelas=[...casas.map(areaLote),...jardines.map(j=>areaLote({x:j.x,z:j.z-j.d/2,frente:j.w,profundidad:j.d}))];
  const libre=ampliarReservaVacia(destino,parcelas,ext);
  ajustarContacto(m.manzana,libre,destino,vertices);
  m.reservaContacto=destino;m.reservaOriginal=libre;
  m.manzana.add(raiz);raiz.name=EDIFICIOS_MANZANA[edificio].nombre;
  m.edificioExterno=raiz;m.cubiertasExternas=modelo.cubiertas;m.reserva=mejor;m.casasSustituidas=plan.casas.length-casas.length;
  m.receta={...recetaDeManzana(plan),edificio,esquina,anio,contacto,separacion};
  m.manzana.userData.composicion=m.receta;
  return m;
 }catch(e){liberar(raiz);throw e;}
}
