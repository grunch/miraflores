import * as T from 'three';

/** Volumen interpretativo del conjunto de pabellones documentado en Mestre 1889. */
export function construirHospitalVargas(t, cubiertas, anio, meta) {
  const {caja, grupo, muro, pieza, tejado, cornisa} = t;
  const enObra = anio === 1889;
  meta.orientacion = 'eje norte-sur; acceso principal al oeste';
  meta.faseConstructiva = enObra ? 'planta del hospital en obras, 1889' : 'conjunto de pabellones';
  meta.dimensionesInterpretativas = true;

  // Bloque de dirección y servicios que articula las alas al norte y al sur.
  const central = grupo(0, 0, 0);
  caja(30, .35, 24, 0, .18, 0, 'piedra', central);
  caja(28, 5.6, 22, 0, 3.05, 0, 'cal', central);
  for (const z of [-10.9, 10.9]) {
    for (let x = -12; x <= 12; x += 6) {
      caja(.45, 5.9, .55, x, 3.05, z, 'claro', central);
      caja(.85, .3, .8, x, 6.05, z, 'claro', central);
    }
  }
  // Entrada occidental: se mantiene sobria; la fuente no permite fijar un alzado ornamental.
  const acceso = grupo(-14.1, 0, 0, Math.PI / 2, central);
  muro(8, 5.6, .35, [
    {x:0, w:2.2, h:3.4, y:.02, rect:true, mat:null},
    {x:-5, w:1.25, h:2.2, y:1.1}, {x:5, w:1.25, h:2.2, y:1.1},
  ], acceso, 'cal');
  cornisa(28, 5.9, 0, central);

  // Cada ala tiene dos filas de cinco salas, abiertas hacia un jardín longitudinal.
  // La posición y medidas son aproximadas; la planta de 1889 sí dibuja la disposición.
  meta.alas = [];
  for (const [ala, inicio, paso] of [['norte', -16, -11], ['sur', 16, 11]]) {
    const centroZ = inicio + paso * 2;
    const largoJardin = 66;
    caja(10, .12, largoJardin, 0, .08, centroZ, 'verde');
    for (const z of [centroZ - largoJardin / 2, centroZ + largoJardin / 2]) {
      caja(.18, 1.1, .18, -5.1, .55, z, 'claro');
      caja(.18, 1.1, .18, 5.1, .55, z, 'claro');
    }
    for (let i = 0; i < 5; i++) {
      const z = inicio + paso * i;
      for (const lado of [-1, 1]) {
        const pabellon = grupo(lado * 23, 0, z, lado < 0 ? Math.PI / 2 : -Math.PI / 2);
        caja(9.3, .3, 16, 0, .15, 0, 'piedra', pabellon);
        // Pórtico hacia el jardín y muros de sala con vanos de ventilación.
        muro(9.3, 4.8, .3, [
          {x:-2.65, w:1.45, h:2.3, y:1.05}, {x:0, w:1.45, h:2.3, y:1.05},
          {x:2.65, w:1.45, h:2.3, y:1.05},
        ], pabellon, 'cal');
        caja(.3, 4.8, 16, -4.5, 2.4, 0, 'cal', pabellon);
        caja(.3, 4.8, 16, 4.5, 2.4, 0, 'cal', pabellon);
        caja(9.3, 4.8, .3, 0, 2.4, -5.1, 'cal', pabellon);
        for (const x of [-3.7, 0, 3.7]) caja(.38, 4.7, .4, x, 2.35, 5.05, 'claro', pabellon);
        if (!enObra) {
          const cubierta = grupo(lado * 23, 0, z, lado < 0 ? Math.PI / 2 : -Math.PI / 2, cubiertas);
          if (anio < 1936) {
            const g = new T.BufferGeometry();
            g.setAttribute('position', new T.Float32BufferAttribute([
              -5.2,5.05,-5.5, 0,6.35,-5.5, 0,6.35,5.5,
              -5.2,5.05,-5.5, 0,6.35,5.5, -5.2,5.05,5.5,
              0,6.35,-5.5, 5.2,5.05,-5.5, 5.2,5.05,5.5,
              0,6.35,-5.5, 5.2,5.05,5.5, 0,6.35,5.5,
            ], 3));
            g.computeVertexNormals();
            const techo = pieza(g, 'teja', 0, 0, 0, cubierta);
            techo.material.side = T.DoubleSide;
          } else caja(9.8, .3, 16.5, 0, 5.05, 0, 'metal', cubierta);
        }
      }
    }
    // Galería sencilla a cada lado del jardín, inspirada en la lámina de 1892.
    if (!enObra) for (const lado of [-1, 1]) {
      const x = lado * 17.5;
      for (let i = 0; i <= 16; i++) {
        const z = centroZ - largoJardin / 2 + i * largoJardin / 16;
        caja(.18, 4.1, .18, x, 2.05, z, 'claro');
      }
      caja(.25, .22, largoJardin, x, 4.15, centroZ, 'madera');
    }
    meta.alas ??= [];
    meta.alas.push(ala);
  }

  // Estatua de José María Vargas, documentada en el patio desde diciembre de 1891.
  if (anio >= 1911) {
    caja(2.2, .8, 2.2, 0, .4, 12.5, 'piedra');
    caja(.5, 2.2, .5, 0, 1.9, 12.5, 'ocre');
    const busto = pieza(new T.SphereGeometry(.55, 10, 8), 'piedra', 0, 3.25, 12.5);
    busto.scale.set(.7, 1.2, .65);
  }

  // Renovaciones documentadas desde 1930: cubiertas planas; no se inventa
  // la ubicación de pabellones que las fuentes fechan, pero no geolocalizan.
  if (anio >= 1936) {
    meta.cubiertas = 'planas, siguiendo la reforma descrita desde 1930';
  }
}
