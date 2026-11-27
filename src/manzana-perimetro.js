const RAD=Math.PI/180;
/** Vértices NO, NE, SE, SO; lados norte, este, sur, oeste. Metros, plano XZ. */
export function resolverPerimetro({lados=[96,96,96,96],angulos=[90,90,90,90]}={}){
 if(!Array.isArray(lados)||lados.length!==4||!lados.every(v=>Number.isFinite(v)&&v>=60&&v<=140))throw new RangeError('Indica cuatro lados de 60 a 140 m: norte, este, sur y oeste.');
 if(!Array.isArray(angulos)||angulos.length!==4||!angulos.every(v=>Number.isFinite(v)&&v>=30&&v<=150))throw new RangeError('Indica cuatro ángulos interiores de 30° a 150°: NO, NE, SE y SO.');
 if(Math.abs(angulos.reduce((a,b)=>a+b,0)-360)>.01)throw new RangeError('Los cuatro ángulos interiores deben sumar 360°.');
 const vertices=[[0,0]];let x=0,z=0,direccion=0;
 for(let i=0;i<4;i++){
  x+=lados[i]*Math.cos(direccion);z+=lados[i]*Math.sin(direccion);
  if(i<3)vertices.push([x,z]);direccion+=(180-angulos[(i+1)%4])*RAD;
 }
 const errorCierre=Math.hypot(x,z);
 if(errorCierre>.03)throw new RangeError(`El perímetro no cierra: faltan ${errorCierre.toFixed(2)} m. Con 90° los lados opuestos deben ser iguales; revisa longitudes y ángulos.`);
 const cx=vertices.reduce((s,v)=>s+v[0],0)/4,cz=vertices.reduce((s,v)=>s+v[1],0)/4;
 const puntos=vertices.map(([x,z])=>[x-cx,z-cz]);
 const area=Math.abs(puntos.reduce((s,p,i)=>s+p[0]*puntos[(i+1)%4][1]-p[1]*puntos[(i+1)%4][0],0))/2;
 return{lados:[...lados],angulos:[...angulos],vertices:puntos,area,errorCierre};
}
/** Interpolación bilineal; conserva cada lindero y reparte el tejido dentro del cuadrilátero convexo. */
export function puntoEnPerimetro(x,z,ancho,fondo,vertices){
 const u=(x+ancho/2)/ancho,v=(z+fondo/2)/fondo,pesos=[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v];
 return[vertices.reduce((s,p,i)=>s+p[0]*pesos[i],0),vertices.reduce((s,p,i)=>s+p[1]*pesos[i],0)];
}
export function areaLocalEnPerimetro(x,z,w,d,ancho,fondo,vertices){
 const p=[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]].map(([a,b])=>puntoEnPerimetro(a,b,ancho,fondo,vertices));
 return Math.abs(p.reduce((s,v,i)=>s+v[0]*p[(i+1)%4][1]-v[1]*p[(i+1)%4][0],0))/2;
}
