/** Cierra los huecos del parcelario alrededor de la reserva conservando el perímetro. */
export function ajustarContacto(manzana,libre,destino,vertices){
 const corte=(valor,eje)=>{
  const otro=1-eje,p=[];
  for(let i=0;i<4;i++){const a=vertices[i],b=vertices[(i+1)%4];if(Math.abs(a[otro]-b[otro])<1e-8){if(Math.abs(valor-a[otro])<1e-6)p.push(a[eje],b[eje]);continue;}const t=(valor-a[otro])/(b[otro]-a[otro]);if(t>=-1e-6&&t<=1+1e-6)p.push(a[eje]+t*(b[eje]-a[eje]));}
  return p.length?[Math.min(...p),Math.max(...p)]:null;
 };
 const interpolar=(v,a,b,c,d)=>Math.abs(b-a)<1e-8?c:c+(v-a)/(b-a)*(d-c);
 const mover=(v,otro,eje)=>{
  const borde=corte(otro,eje);if(!borde)return v;
  const [min,max]=borde;if(v<min||v>max)return v;
  const k=eje===0?'x':'z',a=Math.max(min,libre[k+'0']),b=Math.min(max,libre[k+'1']);
  if(a>=b)return v;
  const c=Math.abs(a-min)<1e-6?min:Math.max(min,Math.min(max,destino[k+'0'])),d=Math.abs(b-max)<1e-6?max:Math.max(c,Math.min(max,destino[k+'1']));
  return v<a?interpolar(v,min,a,min,c):v>b?interpolar(v,b,max,d,max):interpolar(v,a,b,c,d);
 };
 manzana.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=mover(p.getX(i),p.getZ(i),0),z=mover(p.getZ(i),x,1);p.setXYZ(i,x,p.getY(i),z);}
  o.geometry.computeVertexNormals();o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
 });
}
export function ampliarReservaVacia(reserva,parcelas,limites){
 const r={...reserva};
 const cruza=(a0,a1,b0,b1)=>a0<b1-1e-7&&a1>b0+1e-7;
 r.x0=Math.max(limites.x0,...parcelas.filter(p=>p.x1<=r.x0+1e-7&&cruza(p.z0,p.z1,r.z0,r.z1)).map(p=>p.x1));
 r.x1=Math.min(limites.x1,...parcelas.filter(p=>p.x0>=r.x1-1e-7&&cruza(p.z0,p.z1,r.z0,r.z1)).map(p=>p.x0));
 r.z0=Math.max(limites.z0,...parcelas.filter(p=>p.z1<=r.z0+1e-7&&cruza(p.x0,p.x1,r.x0,r.x1)).map(p=>p.z1));
 r.z1=Math.min(limites.z1,...parcelas.filter(p=>p.z0>=r.z1-1e-7&&cruza(p.x0,p.x1,r.x0,r.x1)).map(p=>p.z0));
 return r;
}
