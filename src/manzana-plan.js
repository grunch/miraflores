import {resolverPerimetro,areaLocalEnPerimetro} from './manzana-perimetro.js';
/** Perfil compartido: cambiar versión cuando cambien reglas o paleta. Metros nominales. */
export const PERFIL_COLONIAL=Object.freeze({version:4,muros:[0xe2d7bd,0xe9e1cb,0xd5c398,0xcdb089,0xdbbe92,0xc9987b],tejas:[0xa45f3d,0xb06c45,0x965538,0xb87850,0x8b513c,0xad6547],pendiente:.46});
export function azarDeSemilla(semilla){let h=2166136261;for(const c of String(semilla)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function dimension(v,n){if(!Number.isFinite(v)||v<60||v>140)throw new RangeError(`${n}: usa entre 60 y 140 metros.`);return v;}
export function planificarManzana({cantidadCasas,semilla='caracas-1772-01',ancho=96,fondo=96,lados,angulos,vegetacion=.65}={}){
 if(typeof semilla!=='string'||!semilla.trim()||semilla.length>120)throw new TypeError('La semilla debe ser un texto de 1 a 120 caracteres.');
 if(!Number.isInteger(cantidadCasas)||cantidadCasas<1||cantidadCasas>48)throw new RangeError('cantidadCasas es obligatoria: entero entre 1 y 48.');
 dimension(ancho,'Ancho');dimension(fondo,'Fondo');if(!Number.isFinite(vegetacion)||vegetacion<0||vegetacion>1)throw new RangeError('Vegetación: valor de 0 a 1.');
 const perimetro=resolverPerimetro({lados:lados??[ancho,fondo,ancho,fondo],angulos});ancho=(perimetro.lados[0]+perimetro.lados[2])/2;fondo=(perimetro.lados[1]+perimetro.lados[3])/2;
 const rnd=azarDeSemilla(semilla),entre=(a,b)=>a+(b-a)*rnd(),elegir=a=>a[Math.floor(rnd()*a.length)];
 const norte=fondo*entre(.26,.32),sur=fondo*entre(.26,.32),oeste=ancho*entre(.24,.3),este=ancho*entre(.24,.3);
 const casas=[],densidad=Math.max(0,Math.min(1,(cantidadCasas-4)/28)),perfil=cantidadCasas<=8?'elite':cantidadCasas<=20?'intermedia':'humilde';
 function banda(largo,profundidad,x,z,giro,lado,n,esquinas=false){
  const minimo=4,pesos=Array.from({length:n},()=>entre(.58,1.55)),total=pesos.reduce((a,b)=>a+b,0);let cursor=-largo/2;
  for(let i=0;i<n;i++){
   const frente=minimo+(largo-n*minimo)*pesos[i]/total,c=cursor+frente/2;cursor+=frente;
   const esquina=esquinas&&(i===0||i===n-1),tipo=perfil==='elite'?'O':esquina?'U':elegir(densidad>.6?['L','L','U','U','O']:['L','U','U','O','O']);
   // El ancho construido crece con la escala del solar, no solo con su frente.
   // Los límites proporcionales conservan patios abiertos incluso en solares estrechos.
   const escalaTejado=Math.sqrt(frente*profundidad/400);
   const altura=rnd()<(1-densidad)*.38?entre(6.4,7.4):entre(3.1,4.4),crujia=Math.min(frente*.29,profundidad*.28,entre(4.2,6.1)*escalaTejado),principal=Math.min(profundidad*.34,entre(5.7,7.6)*escalaTejado),hasta=profundidad*(esquina?1:entre(.83,.99));
   const rects=[{x:0,z:principal/2,w:frente,d:principal}];
   rects.push({x:-frente/2+crujia/2,z:(principal+hasta)/2,w:crujia,d:hasta-principal});
   if(tipo!=='L')rects.push({x:frente/2-crujia/2,z:(principal+hasta)/2,w:crujia,d:hasta-principal});
   if(tipo==='O')rects.push({x:0,z:hasta-crujia/2,w:frente-2*crujia,d:crujia});
   const patio={x:tipo==='L'?crujia/2:0,z:(principal+hasta-(tipo==='O'?crujia:0))/2,w:frente-crujia*(tipo==='L'?1:2),d:hasta-principal-(tipo==='O'?crujia:0)};
   const arboles=[];if(rnd()<vegetacion*(1-densidad*.4)){const cantidad=1+Math.floor(rnd()*3);for(let j=0;j<cantidad;j++){const radio=Math.min(3.8,Math.min(patio.w,patio.d)*entre(.13,.23));arboles.push({x:patio.x+entre(-.25,.25)*patio.w,z:patio.z+entre(-.27,.27)*patio.d,radio,altura:entre(3.4,6.3)});}}
   casas.push({id:`${lado}-${i}`,x:x+Math.cos(giro)*c,z:z-Math.sin(giro)*c,giro,frente,profundidad,tipo,altura,crujia,rects,patio,arboles,muro:elegir(PERFIL_COLONIAL.muros),teja:elegir(PERFIL_COLONIAL.tejas),esquina});
  }
 }
 // +z local entra al lote; las fachadas miran hacia -z. Esquinas asignadas solo a norte/sur.
 const medio=fondo-norte-sur,centroZ=(norte-sur)/2;
 const interior={x:(oeste-este)/2,z:centroZ,w:ancho-oeste-este,d:medio};
 if(cantidadCasas<=8){
  if(cantidadCasas===1)banda(ancho,fondo,0,-fondo/2,0,'norte',1,true);
  else{const nN=Math.ceil(cantidadCasas/2),nS=Math.floor(cantidadCasas/2);banda(ancho,fondo/2,0,-fondo/2,0,'norte',nN,true);banda(ancho,fondo/2,0,fondo/2,Math.PI,'sur',nS,true);}
 }else{
  const largos=[ancho,ancho,medio,medio],cuentas=[1,1,1,1],capacidades=largos.map(l=>Math.floor(l/4));
  if(cantidadCasas>capacidades.reduce((a,b)=>a+b,0))throw new RangeError('Demasiadas casas para estas dimensiones: amplía la manzana o reduce la cantidad.');
  for(let n=4;n<cantidadCasas;n++){let mejor=-1,valor=-1;for(let i=0;i<4;i++)if(cuentas[i]<capacidades[i]&&largos[i]/(cuentas[i]+1)>valor){mejor=i;valor=largos[i]/(cuentas[i]+1);}cuentas[mejor]++;}
  banda(ancho,norte,0,-fondo/2,0,'norte',cuentas[0],true);
  banda(ancho,sur,0,fondo/2,Math.PI,'sur',cuentas[1],true);
  banda(medio,oeste,-ancho/2,centroZ,Math.PI/2,'oeste',cuentas[2]);
  banda(medio,este,ancho/2,centroZ,-Math.PI/2,'este',cuentas[3]);
 }
 const jardines=[];
 function dividirJardin(x,z,w,d,n){
  if(n>0&&Math.max(w,d)>19){const fr=entre(.36,.65);if(w>d){dividirJardin(x-w*(1-fr)/2,z,w*fr,d,n-1);dividirJardin(x+w*fr/2,z,w*(1-fr),d,n-1);}else{dividirJardin(x,z-d*(1-fr)/2,w,d*fr,n-1);dividirJardin(x,z+d*fr/2,w,d*(1-fr),n-1);}return;}
  const arboles=[],rw=w*entre(.55,.85),rd=Math.min(d*.34,entre(4.2,6));
  const rects=[{x:x+(w-rw)/2-.3,z:z+d/2-rd/2-.3,w:rw,d:rd}];
  if(rnd()<.7){const wing=Math.min(w*.28,4.5),depth=d-rd-.6;rects.push({x:x+w/2-wing/2-.3,z:z-d/2+depth/2+.3,w:wing,d:depth});}
  for(let k=0;k<Math.round(vegetacion*3);k++)arboles.push({x:entre(-.3,.05)*w,z:entre(-.27,.08)*d,radio:entre(1.3,2.5),altura:entre(3.5,6)});
  jardines.push({x,z,w,d,arboles,rects,altura:entre(2.6,3.5),teja:elegir(PERFIL_COLONIAL.tejas)});
 }
 if(cantidadCasas>8)dividirJardin(interior.x,interior.z,interior.w,interior.d,3);
 const areaRect=(c,r)=>{const co=Math.cos(c.giro),si=Math.sin(c.giro),x=c.x+co*r.x+si*r.z,z=c.z-si*r.x+co*r.z;return areaLocalEnPerimetro(x,z,Math.abs(co)*r.w+Math.abs(si)*r.d,Math.abs(si)*r.w+Math.abs(co)*r.d,ancho,fondo,perimetro.vertices);};
 const superficieTechos=casas.reduce((s,c)=>s+c.rects.reduce((t,r)=>t+areaRect(c,r),0),0)+jardines.reduce((s,j)=>s+j.rects.reduce((t,r)=>t+areaLocalEnPerimetro(r.x,r.z,r.w,r.d,ancho,fondo,perimetro.vertices),0),0);
 const superficieSolares=casas.reduce((s,c)=>s+areaRect(c,{x:0,z:c.profundidad/2,w:c.frente,d:c.profundidad}),0);
 return {version:PERFIL_COLONIAL.version,cantidadCasas,perfil,densidad,semilla,ancho,fondo,vegetacion,perimetro,casas,jardines,interior,estadisticas:{superficieMediaSolar:superficieSolares/casas.length,casas:casas.length,patios:casas.length,jardines:jardines.length,ocupacion:superficieTechos/perimetro.area}};
}
export function recetaDeManzana(plan){return{version:plan.version,cantidadCasas:plan.cantidadCasas,semilla:plan.semilla,lados:plan.perimetro.lados,angulos:plan.perimetro.angulos,vegetacion:plan.vegetacion};}
export function planDesdeReceta(receta){if(receta.version!==PERFIL_COLONIAL.version)throw new RangeError('Versión de perfil incompatible.');return planificarManzana(receta);}
