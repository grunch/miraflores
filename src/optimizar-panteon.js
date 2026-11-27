import {Mesh} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Fusiona piezas hermanas de material uniforme conservando los grupos de torres y cubiertas.
 * Solo para estas mallas estáticas: no se aplica a objetos animados ni materiales con texturas.
 */
export function optimizarPanteon(raiz) {
  const originales=new Set();
  function agrupar(grupo){
    for(const hijo of [...grupo.children])if(hijo.isGroup)agrupar(hijo);
    const lotes=new Map();
    for(const hijo of grupo.children){
      if(!hijo.isMesh)continue;
      const material=hijo.material;
      if(!lotes.has(material))lotes.set(material,[]);
      lotes.get(material).push(hijo);
    }
    for(const [material,piezas] of lotes){
      if(piezas.length<2)continue;
      const geometrías=piezas.map(pieza=>{
        pieza.updateMatrix();
        const geo=pieza.geometry.index?pieza.geometry.toNonIndexed():pieza.geometry.clone();
        geo.applyMatrix4(pieza.matrix);
        // No hay texturas en estos materiales; todos los lotes comparten posición y normal.
        for(const nombre of Object.keys(geo.attributes))if(!['position','normal'].includes(nombre))geo.deleteAttribute(nombre);
        return geo;
      });
      const geometria=mergeGeometries(geometrías,false);
      if(!geometria)throw new Error('No se pudo fusionar la geometría del Panteón.');
      geometria.computeBoundingBox();geometria.computeBoundingSphere();
      const combinado=new Mesh(geometria,material);combinado.name='Piezas de '+grupo.name;
      combinado.castShadow=true;combinado.receiveShadow=true;grupo.add(combinado);
      for(const pieza of piezas){grupo.remove(pieza);originales.add(pieza.geometry);}
      geometrías.forEach(geo=>geo.dispose());
    }
  }
  agrupar(raiz);
  // Algunas piezas no fusionadas todavía pueden compartir la geometría unitaria.
  raiz.traverse(obj=>{if(obj.geometry)originales.delete(obj.geometry);});
  originales.forEach(geo=>geo.dispose());
  return raiz;
}
