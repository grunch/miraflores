import * as THREE from 'three';
import { optimizarPanteon } from './optimizar-panteon.js';
import { etapaSanFrancisco } from './san-francisco-datos.js';

/**
 * Estudio arquitectónico procedural de la Iglesia de San Francisco (Caracas)
 * para las cinco épocas de grunch/caracas: 1772, 1843, 1889, 1911 y 1936.
 *
 * Sistema de coordenadas del estudio:
 * - Origen (0, 0, 0) al centro de la planta de la nave (19,6 m ancho × 62 m largo).
 * - +Z = Norte (fachada principal mirando a Av. Universidad / Capitolio, en z = +31).
 * - -Z = Sur (interior de la nave hacia el altar mayor / testero plano, en z = -31).
 * - -X = Este (costado hacia Esquina de San Francisco / Capilla Orden Tercera).
 * - +X = Oeste (costado hacia el antiguo Convento de San Francisco / Palacio de las Academias;
 *               aquí se ubica el campanario de espadaña triple en 1772 y 1843).
 *
 * Integración exacta en grunch/caracas (src/hitos/datos/iglesias.js, ancla (8768, 7198), eje = SUR):
 *   const q = p.en(31, 0, 0, -Math.PI / 2)
 * Lleva z = +31 → a = 0 (pie de fachada), z = -31 → a = +62 (sur), +X → +b (oeste).
 */
export function crearSanFrancisco({
  anio = 1772,
  optimizar = true,
  nivelDetalle = 'estudio',
  conCeiba = null,
} = {}) {
  const etapa = etapaSanFrancisco(anio);
  const ciudad = nivelDetalle === 'ciudad';
  const mostrarCeiba = conCeiba ?? (etapa.conCeiba && !ciudad);
  const segCol = ciudad ? 6 : 10;
  const segArco = ciudad ? 8 : 16;

  const edificio = new THREE.Group();
  const cubiertas = new THREE.Group();
  const ceibaGrupo = new THREE.Group();
  edificio.name = etapa.nombre;
  cubiertas.name = 'Cubiertas desmontables';
  ceibaGrupo.name = 'Ceiba de San Francisco';
  edificio.add(cubiertas);
  edificio.add(ceibaGrupo);

  edificio.userData = {
    id: 'san-francisco',
    anio,
    etapa: etapa.id,
    colonial: etapa.colonial,
    medidasVerificadas: false,
    frente: '+Z = norte (Av. Universidad), -Z = sur (nave), -X = este (Esq. San Francisco), +X = oeste (Convento/Academias)',
    huella: [19.6, 62],
  };

  // Paleta histórica calibrada por etapa (sin imágenes externas como textura).
  const colores = etapa.colonial
    ? {
        muro: etapa.postTerremoto ? 0xe1d8c6 : 0xebe5d6,
        parche: 0xcabca5,
        moldura: etapa.postTerremoto ? 0xefe9db : 0xf6f2e8,
        panel: 0xe6dcc8,
        zocalo: 0x676158,
        piedra: 0x8d8578,
        madera: 0x563925,
        maderaOscura: 0x3b2517,
        oscuro: 0x202120,
        marmol: 0xf4f1ea,
        oro: 0xd4a438,
        bronce: 0x6f5932,
        hierro: 0x2c302e,
        piso: 0xd9d2c4,
        pisoOscuro: 0xb9b09f,
        teja: 0xa65f42,
        tejaClara: 0xb97150,
        tejaOscura: 0x874a32,
        tronco: 0x5c5347,
        copa: 0x3f6432,
        cesped: 0x53773f,
      }
    : {
        // 1889 crema-piedra, 1911 ocre suave, 1936 ocre-dorado clásico con molduras gris-piedra
        muro: anio === 1889 ? 0xe5d3a7 : anio === 1911 ? 0xdfb972 : 0xdca74c,
        parche: 0xc9b898,
        moldura: anio === 1889 ? 0xcacdc9 : anio === 1911 ? 0xb5bcbe : 0x9aa4a9,
        panel: anio === 1889 ? 0xf2eee5 : anio === 1911 ? 0xedeae1 : 0xeeece6,
        zocalo: 0x686e70,
        piedra: 0x8e918e,
        madera: 0x5a371f,
        maderaOscura: 0x3d2414,
        oscuro: 0x1e2020,
        marmol: 0xf5f2eb,
        oro: 0xd4a438,
        bronce: 0x6c5733,
        hierro: 0x282d2b,
        piso: 0xddd7cb,
        pisoOscuro: 0xbbb4a6,
        teja: 0xa75e40,
        tejaClara: 0xba704f,
        tejaOscura: 0x884a31,
        tronco: 0x5a5248,
        copa: 0x3e6532,
        cesped: 0x51783e,
      };

  const mats = Object.fromEntries(
    Object.entries(colores).map(([k, color]) => [
      k,
      new THREE.MeshStandardMaterial({
        color,
        roughness: k === 'oro' ? 0.36 : k === 'marmol' ? 0.55 : k === 'bronce' ? 0.48 : 0.9,
        metalness: k === 'oro' ? 0.42 : k === 'bronce' || k === 'hierro' ? 0.25 : 0.02,
      }),
    ])
  );

  const unidad = new THREE.BoxGeometry(1, 1, 1);

  function malla(geo, mat, x, y, z, g = edificio) {
    const m = new THREE.Mesh(geo, mats[mat]);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  }

  function caja(x, y, z, w, h, d, mat = 'muro', g = edificio) {
    const m = malla(unidad, mat, x, y, z, g);
    m.scale.set(w, h, d);
    return m;
  }

  function grupo(x, z, rot = 0, nombre = '', padre = edificio) {
    const g = new THREE.Group();
    g.name = nombre;
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    padre.add(g);
    return g;
  }

  function barra(a, b, r = 0.05, mat = 'hierro', g = edificio) {
    const u = new THREE.Vector3(...a);
    const v = new THREE.Vector3(...b);
    const dir = v.clone().sub(u);
    const len = dir.length();
    if (len < 1e-4) return null;
    const m = malla(
      new THREE.CylinderGeometry(r, r, len, ciudad ? 4 : 6),
      mat,
      (u.x + v.x) * 0.5,
      (u.y + v.y) * 0.5,
      (u.z + v.z) * 0.5,
      g
    );
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  }

  function extruir(shape, prof, mat, x, y, z, g = edificio) {
    return malla(
      new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: false, curveSegments: segArco }),
      mat,
      x,
      y,
      z,
      g
    );
  }

  function perfil(puntos, mat, g = edificio) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(puntos.flat(), 3));
    geo.computeVertexNormals();
    const m = malla(geo, mat, 0, 0, 0, g);
    m.material.side = THREE.DoubleSide;
    return m;
  }

  function jarron(x, y, z, escala = 1, mat = 'moldura', g = edificio) {
    // Pináculo / florero clásico de piedra sobre cornisas y frontones
    caja(x, y + 0.14 * escala, z, 0.44 * escala, 0.28 * escala, 0.44 * escala, mat, g);
    malla(new THREE.CylinderGeometry(0.14 * escala, 0.19 * escala, 0.26 * escala, segCol), mat, x, y + 0.4 * escala, z, g);
    const copa = malla(new THREE.SphereGeometry(0.24 * escala, segCol, 6), mat, x, y + 0.72 * escala, z, g);
    copa.scale.set(1, 1.35, 1);
    malla(new THREE.ConeGeometry(0.12 * escala, 0.26 * escala, segCol), mat, x, y + 1.12 * escala, z, g);
  }

  function estatuaMarmol(x, yBase, z, escala = 1, g = edificio) {
    // Esculturas genovesas de mármol de 1655 (Inmaculada Concepción, San Juan Bautista, San Francisco)
    caja(x, yBase + 0.1 * escala, z, 0.52 * escala, 0.2 * escala, 0.44 * escala, 'moldura', g);
    malla(new THREE.CylinderGeometry(0.18 * escala, 0.24 * escala, 0.95 * escala, segCol), 'marmol', x, yBase + 0.66 * escala, z, g);
    malla(new THREE.CylinderGeometry(0.21 * escala, 0.17 * escala, 0.42 * escala, segCol), 'marmol', x, yBase + 1.32 * escala, z, g);
    malla(new THREE.SphereGeometry(0.15 * escala, 8, 6), 'marmol', x, yBase + 1.66 * escala, z + 0.02, g);
  }

  function cruzHierro(x, y, z, h = 1.4, g = edificio) {
    caja(x, y + h * 0.5, z, 0.12, h, 0.12, 'hierro', g);
    caja(x, y + h * 0.68, z, h * 0.58, 0.12, 0.12, 'hierro', g);
  }

  function aplanarGrupo(raiz, excluir = []) {
    raiz.updateMatrixWorld(true);
    const invRaiz = raiz.matrixWorld.clone().invert();
    const mallas = [];
    const subgrupos = [];
    for (const hijo of [...raiz.children]) {
      if (excluir.includes(hijo)) continue;
      if (hijo.isGroup) {
        subgrupos.push(hijo);
        hijo.traverse((o) => {
          if (o.isMesh) mallas.push(o);
        });
      }
    }
    for (const m of mallas) {
      const rel = invRaiz.clone().multiply(m.matrixWorld);
      const geo = m.geometry.clone().applyMatrix4(rel);
      const clon = new THREE.Mesh(geo, m.material);
      clon.castShadow = m.castShadow;
      clon.receiveShadow = m.receiveShadow;
      raiz.add(clon);
    }
    for (const sg of subgrupos) {
      raiz.remove(sg);
    }
  }

  // Plataforma / atrio fino de implantación (solo en modo estudio; en ciudad se omite para fundir con el plano)
  if (!ciudad) {
    caja(0, -0.15, 3.8, 29, 0.3, 76, 'piedra');
    // Acera norte frente a la fachada
    caja(0, 0.06, 35.0, 27, 0.12, 7.6, 'piso');
  }

  // ============================================================================
  // 1. CUERPO DE TRES NAVES, PRESBITERIO Y MUROS LATERALES (largo 62 m, ancho 19,6 m)
  // ============================================================================
  const zFrente = 31.0;
  const zFondo = -31.0;
  const largoNave = zFrente - zFondo; // 62 m
  const anchoTotal = 19.6;
  const xLat = anchoTotal / 2; // 9.8 m
  const xNaveCentral = 4.3; // nave central 8.6 m, naves laterales 5.5 m c/u
  const hLateral = etapa.colonial ? 7.4 : 7.8;
  const hCentral = etapa.colonial ? 10.6 : 11.2;

  // Solado interior de mármol / baldosa + grada del presbiterio
  caja(0, 0.12, 0, anchoTotal - 0.8, 0.24, largoNave - 1.2, 'piso');
  caja(0, 0.28, -24.5, anchoTotal - 1.4, 0.36, 12.0, 'pisoOscuro');

  // Muros perimetrales exteriores: Este (-X), Oeste (+X) y Testero plano Sur (z = -31)
  caja(-xLat + 0.38, hLateral / 2, -0.4, 0.76, hLateral, largoNave - 0.8, 'muro');
  caja(xLat - 0.38, hLateral / 2, -0.4, 0.76, hLateral, largoNave - 0.8, 'muro');
  caja(0, hCentral / 2, zFondo + 0.45, anchoTotal, hCentral, 0.9, 'muro');
  // Zócalo perimetral oscuro
  caja(-xLat + 0.34, 0.65, -0.4, 0.86, 1.3, largoNave - 0.6, 'zocalo');
  caja(xLat - 0.34, 0.65, -0.4, 0.86, 1.3, largoNave - 0.6, 'zocalo');
  caja(0, 0.65, zFondo + 0.42, anchoTotal + 0.14, 1.3, 0.98, 'zocalo');

  // Muros altos de la nave central (clerestorio sobre las arcadas interiores)
  for (const sgn of [-1, 1]) {
    caja(sgn * xNaveCentral, hLateral + (hCentral - hLateral) / 2, -0.4, 0.58, hCentral - hLateral, largoNave - 1.4, 'muro');
    // Ventanas altas del clerestorio (como se ven en la foto interior img_3.jpg)
    for (let zv = -22; zv <= 22; zv += 7.4) {
      caja(sgn * xNaveCentral, hLateral + 1.65, zv, 0.72, 1.45, 1.15, 'oscuro');
      caja(sgn * (xNaveCentral + 0.34), hLateral + 1.65, zv, 0.14, 1.65, 1.35, 'moldura');
    }
  }

  // Detalle de la fachada lateral ESTE (-X, Esquina de San Francisco)
  if (etapa.colonial) {
    // Alero y cornisa sencilla; en 1843 contrafuertes reforzados tras el sismo de 1812
    caja(-xLat - 0.05, hLateral - 0.18, -0.4, 0.42, 0.36, largoNave - 0.6, 'moldura');
    const nContraf = etapa.postTerremoto ? 8 : 5;
    for (let i = 0; i < nContraf; i++) {
      const zc = -26 + (i / (nContraf - 1)) * 50;
      const prof = etapa.postTerremoto ? 1.15 : 0.72;
      caja(-xLat - prof / 2, hLateral * 0.44, zc, prof, hLateral * 0.88, 0.95, etapa.postTerremoto ? 'parche' : 'muro');
      caja(-xLat - prof / 2, hLateral * 0.89, zc, prof + 0.14, 0.22, 1.08, 'teja');
    }
  } else {
    // 1889–1936: muro clásico articulado con pilastras dóricas, cornisa y pretil (foto more_0.jpg e img_2.jpg!)
    caja(-xLat - 0.1, hLateral + 0.15, -0.4, 0.56, 0.72, largoNave - 0.4, 'moldura');
    caja(-xLat + 0.06, hLateral + 0.9, -0.4, 0.48, 0.85, largoNave - 0.6, 'moldura');
    const nPil = 9;
    for (let i = 0; i < nPil; i++) {
      const zp = -27 + (i / (nPil - 1)) * 54;
      caja(-xLat - 0.14, hLateral * 0.48, zp, 0.32, hLateral - 0.4, 0.82, 'moldura');
      caja(-xLat - 0.2, 0.7, zp, 0.44, 1.35, 0.96, 'zocalo');
      caja(-xLat - 0.2, hLateral - 0.45, zp, 0.44, 0.32, 0.98, 'moldura');
    }
    // Remate lateral suave en la esquina NE (alineado con la cornisa lateral)
    caja(-xLat + 0.06, hLateral + 1.35, zFrente - 2.6, 0.44, 0.38, 4.2, 'moldura');
  }

  // ============================================================================
  // 2. INTERIOR DE TRES NAVES, ARCADAS DÓRICAS Y RETABLOS BARROCOS (img_3.jpg)
  // ============================================================================
  const interior = grupo(0, 0, 0, 'Interior de tres naves');
  const zPilares = [-18, -10.5, -3, 4.5, 12, 19.5, 25.5];
  for (const sgn of [-1, 1]) {
    for (const zp of zPilares) {
      caja(sgn * xNaveCentral, 3.6, zp, 0.92, 7.2, 0.92, 'panel', interior);
      caja(sgn * xNaveCentral, 0.55, zp, 1.12, 1.1, 1.12, 'moldura', interior);
      caja(sgn * xNaveCentral, 6.75, zp, 1.16, 0.34, 1.16, 'moldura', interior);
    }
    // Arcadas de medio punto entre pilares (solo en estudio para cuidar triángulos en ciudad)
    if (!ciudad) {
      for (let i = 0; i < zPilares.length - 1; i++) {
        const z0 = zPilares[i];
        const z1 = zPilares[i + 1];
        const luz = z1 - z0;
        const r = Math.min(2.6, (luz - 0.95) / 2);
        const sArc = new THREE.Shape();
        sArc.moveTo(-luz / 2, 7.4);
        sArc.lineTo(-luz / 2, 4.6);
        sArc.lineTo(-r, 4.6);
        sArc.absarc(0, 4.6, r, Math.PI, 0, true);
        sArc.lineTo(luz / 2, 4.6);
        sArc.lineTo(luz / 2, 7.4);
        sArc.closePath();
        const aM = extruir(sArc, 0.62, 'panel', sgn * xNaveCentral - 0.31, 0, (z0 + z1) / 2, interior);
        aM.rotation.y = Math.PI / 2;
      }
      // Tirantes horizontales de madera colonial (carpintería de par y nudillo)
      for (let zt = -16; zt <= 24; zt += 5.0) {
        caja(0, hCentral - 0.45, zt, xNaveCentral * 2 - 0.4, 0.24, 0.24, 'madera', interior);
      }
    }
  }

  // Arco toral del presbiterio (z = -18.5)
  const sToral = new THREE.Shape();
  sToral.moveTo(-xNaveCentral, hCentral);
  sToral.lineTo(-xNaveCentral, 5.2);
  sToral.lineTo(-3.6, 5.2);
  sToral.absarc(0, 5.2, 3.6, Math.PI, 0, true);
  sToral.lineTo(xNaveCentral, 5.2);
  sToral.lineTo(xNaveCentral, hCentral);
  sToral.closePath();
  extruir(sToral, 0.7, 'panel', 0, 0, -18.8, interior);

  // Retablo Mayor dorado (Inmaculada Concepción) y retablos laterales (Orden Tercera / Santo Niño de Belén)
  function retabloBarroco(x, z, ancho, alto, g) {
    caja(x, alto / 2 + 0.45, z, ancho, alto, 0.65, 'oro', g);
    caja(x, 0.72, z + 0.75, ancho * 0.72, 1.05, 1.15, 'marmol', g);
    for (let i = -2; i <= 2; i++) {
      malla(
        new THREE.CylinderGeometry(0.14, 0.16, alto * 0.85, 6),
        'oro',
        x + (i / 2) * (ancho * 0.42),
        alto * 0.48 + 0.45,
        z + 0.36,
        g
      );
    }
    caja(x, alto * 0.52 + 0.45, z + 0.38, ancho + 0.3, 0.3, 0.45, 'oro', g);
    malla(new THREE.CylinderGeometry(ancho * 0.26, ancho * 0.36, 1.4, 8), 'oro', x, alto + 1.0, z, g);
  }
  retabloBarroco(0, zFondo + 1.25, 6.2, 8.6, interior);
  retabloBarroco(-7.0, zFondo + 1.25, 3.8, 5.8, interior); // Capilla de la Orden Tercera (Este)
  retabloBarroco(7.0, zFondo + 1.25, 3.8, 5.8, interior);  // Capilla del Santo Niño de Belén (Oeste)

  // ============================================================================
  // 3. CUBIERTAS DE TEJA CRIOLLA (en `cubiertas`, desmontables)
  // ============================================================================
  function techoNave(cx, cz, ancho, largo, yBase, alto, g = cubiertas) {
    const hw = ancho / 2 + 0.45;
    const hl = largo / 2 + 0.35;
    const izq = [
      [cx - hw, yBase, cz - hl], [cx - hw, yBase, cz + hl], [cx, yBase + alto, cz + hl],
      [cx - hw, yBase, cz - hl], [cx, yBase + alto, cz + hl], [cx, yBase + alto, cz - hl],
    ];
    const der = [
      [cx + hw, yBase, cz + hl], [cx + hw, yBase, cz - hl], [cx, yBase + alto, cz - hl],
      [cx + hw, yBase, cz + hl], [cx, yBase + alto, cz - hl], [cx, yBase + alto, cz + hl],
    ];
    perfil(izq, 'teja', g);
    perfil(der, 'teja', g);
    // Tímpano trasero sur
    perfil([[cx - ancho / 2, yBase, cz - largo / 2], [cx + ancho / 2, yBase, cz - largo / 2], [cx, yBase + alto, cz - largo / 2]], 'muro', g);
    barra([cx, yBase + alto + 0.08, cz - hl], [cx, yBase + alto + 0.08, cz + hl], 0.14, 'tejaClara', g);
    const paso = ciudad ? 3.2 : 1.15;
    for (let u = cz - hl + 0.4; u <= cz + hl - 0.3; u += paso) {
      const tono = Math.round(u) % 3 === 0 ? 'tejaOscura' : 'tejaClara';
      barra([cx - hw, yBase + 0.04, u], [cx, yBase + alto + 0.04, u], 0.055, tono, g);
      barra([cx + hw, yBase + 0.04, u], [cx, yBase + alto + 0.04, u], 0.055, tono, g);
    }
  }

  function techoFaldónLateral(sgn, largo, yExt, yInt, g = cubiertas) {
    const xOut = sgn * (xLat + 0.42);
    const xIn = sgn * (xNaveCentral - 0.15);
    const z0 = zFondo - 0.25;
    const z1 = zFrente - 0.45;
    const pts = sgn > 0
      ? [[xIn, yInt, z0], [xIn, yInt, z1], [xOut, yExt, z1], [xIn, yInt, z0], [xOut, yExt, z1], [xOut, yExt, z0]]
      : [[xOut, yExt, z0], [xOut, yExt, z1], [xIn, yInt, z1], [xOut, yExt, z0], [xIn, yInt, z1], [xIn, yInt, z0]];
    perfil(pts, 'teja', g);
    const paso = ciudad ? 3.4 : 1.25;
    for (let u = z0 + 0.5; u <= z1 - 0.4; u += paso) {
      barra([xIn, yInt + 0.04, u], [xOut, yExt + 0.04, u], 0.05, 'tejaClara', g);
    }
  }

  // Nave central + presbiterio ligeramente realzado + dos naves laterales
  techoNave(0, 5.2, 9.2, 49.0, hCentral - 0.1, 3.0, cubiertas);
  techoNave(0, -24.5, 9.6, 13.0, hCentral + 0.4, 3.2, cubiertas);
  techoFaldónLateral(-1, largoNave, hLateral - 0.1, hLateral + 1.9, cubiertas);
  techoFaldónLateral(1, largoNave, hLateral - 0.1, hLateral + 1.9, cubiertas);

  // ============================================================================
  // 4A. FACHADA COLONIAL BARROCA (1772 y 1843 — cotejo con litografía ca. 1845)
  // ============================================================================
  if (etapa.colonial) {
    const fachadaCol = grupo(0, zFrente, 0, 'Fachada Barroca 1745');

    // Muro pantalla completo de la fachada (sin puertas laterales, como muestra el grabado de ca. 1845)
    const sMuroF = new THREE.Shape();
    sMuroF.moveTo(-xLat, 0);
    sMuroF.lineTo(-xLat, 9.2);
    sMuroF.lineTo(-5.8, 9.2);
    sMuroF.quadraticCurveTo(-4.6, 9.4, -4.2, 11.4);
    sMuroF.lineTo(0, 14.2);
    sMuroF.lineTo(4.2, 11.4);
    sMuroF.quadraticCurveTo(4.6, 9.4, 5.8, 9.2);
    sMuroF.lineTo(xLat, 9.2);
    sMuroF.lineTo(xLat, 0);
    sMuroF.closePath();
    extruir(sMuroF, 0.95, 'muro', 0, 0, -0.95, fachadaCol);

    // Zócalo oscuro en los paños laterales (igual a la litografía ca. 1845)
    for (const sgn of [-1, 1]) {
      caja(sgn * 7.1, 0.78, 0.05, 5.4, 1.56, 0.18, 'zocalo', fachadaCol);
      // Moldura superior del muro pantalla lateral y jarrones pináculos
      caja(sgn * 7.8, 9.25, 0.06, 4.1, 0.24, 0.45, 'moldura', fachadaCol);
      jarron(sgn * 9.3, 9.35, 0.06, 0.85, 'moldura', fachadaCol);
      jarron(sgn * 5.8, 9.35, 0.06, 0.72, 'moldura', fachadaCol);
    }

    // Portada retablo barroca central de 3 calles y 2 cuerpos + frontón (x = -4.2..+4.2)
    caja(0, 5.1, 0.12, 8.2, 10.2, 0.28, 'moldura', fachadaCol);
    // Zócalos de la portada
    for (const sgn of [-1, 1]) {
      caja(sgn * 2.85, 0.85, 0.35, 2.5, 1.7, 0.62, 'piedra', fachadaCol);
    }

    // Portal central único en arco de medio punto (ampliado en 1745)
    const sPortal = new THREE.Shape();
    sPortal.moveTo(-1.45, 0);
    sPortal.lineTo(-1.45, 3.45);
    sPortal.absarc(0, 3.45, 1.45, Math.PI, 0, true);
    sPortal.lineTo(1.45, 0);
    sPortal.closePath();
    extruir(sPortal, 0.35, 'madera', 0, 0.1, -0.05, fachadaCol);
    // Clave y arquivolta moldeada del arco principal
    const arqv = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.18, 6, segArco, Math.PI), mats.moldura);
    arqv.position.set(0, 3.55, 0.32);
    fachadaCol.add(arqv);
    caja(0, 5.2, 0.42, 0.45, 0.55, 0.35, 'moldura', fachadaCol);

    // 4 columnas barrocas del primer cuerpo (y = 1.7..5.6) + 4 columnas del segundo cuerpo (y = 6.1..9.6)
    for (const cx of [-3.75, -1.95, 1.95, 3.75]) {
      malla(new THREE.CylinderGeometry(0.24, 0.28, 3.85, segCol), 'moldura', cx, 3.65, 0.45, fachadaCol);
      caja(cx, 5.65, 0.45, 0.72, 0.28, 0.72, 'moldura', fachadaCol);
      // Segundo cuerpo
      malla(new THREE.CylinderGeometry(0.21, 0.25, 3.35, segCol), 'moldura', cx, 7.85, 0.42, fachadaCol);
      caja(cx, 9.6, 0.42, 0.68, 0.26, 0.68, 'moldura', fachadaCol);
    }
    // Entablamentos quebrados entre cuerpos
    caja(0, 5.95, 0.48, 8.6, 0.42, 0.85, 'moldura', fachadaCol);
    caja(0, 9.95, 0.44, 8.5, 0.42, 0.8, 'moldura', fachadaCol);

    // Hornacinas barrocas en calles laterales (2 bajas + 2 altas) y hornacina central de la Inmaculada
    for (const [nx, ny, conEst] of [
      [-2.85, 2.35, false], [2.85, 2.35, false],
      [-2.85, 6.75, true], [2.85, 6.75, true],
      [0, 6.55, true],
    ]) {
      const wN = nx === 0 ? 1.35 : 0.96;
      const hN = nx === 0 ? 2.45 : 2.15;
      caja(nx, ny + hN / 2, 0.24, wN, hN, 0.26, 'oscuro', fachadaCol);
      caja(nx, ny - 0.12, 0.38, wN + 0.4, 0.22, 0.42, 'moldura', fachadaCol);
      const arcoN = new THREE.Mesh(new THREE.TorusGeometry(wN / 2 + 0.1, 0.11, 5, 10, Math.PI), mats.moldura);
      arcoN.position.set(nx, ny + hN - 0.35, 0.34);
      fachadaCol.add(arcoN);
      if (conEst) estatuaMarmol(nx, ny + 0.05, 0.34, nx === 0 ? 0.95 : 0.82, fachadaCol);
    }

    // Tercer cuerpo / ático con ventana coral, volutas barrocas y frontón triangular (litografía ca. 1845)
    caja(0, 11.4, 0.26, 3.9, 2.6, 0.52, 'moldura', fachadaCol);
    caja(0, 11.35, 0.48, 1.35, 1.9, 0.22, 'maderaOscura', fachadaCol);
    for (const sgn of [-1, 1]) {
      malla(new THREE.CylinderGeometry(0.18, 0.2, 2.45, segCol), 'moldura', sgn * 1.65, 11.35, 0.48, fachadaCol);
      // Voluta lateral en S uniendo el ático con el segundo cuerpo
      const sVol = new THREE.Shape();
      sVol.moveTo(0, 0);
      sVol.lineTo(0, 2.4);
      sVol.quadraticCurveTo(1.2, 2.2, 2.2, 0);
      sVol.closePath();
      const vM = extruir(sVol, 0.36, 'moldura', sgn * 1.85, 10.15, 0.16, fachadaCol);
      if (sgn < 0) vM.scale.x = -1;
      jarron(sgn * 3.85, 10.18, 0.4, 0.78, 'moldura', fachadaCol);
      jarron(sgn * 2.0, 12.75, 0.42, 0.72, 'moldura', fachadaCol);
    }
    // Frontón triangular coronando la portada barroca
    const sFr = new THREE.Shape();
    sFr.moveTo(-2.35, 0);
    sFr.lineTo(0, 1.65);
    sFr.lineTo(2.35, 0);
    sFr.closePath();
    extruir(sFr, 0.56, 'moldura', 0, 12.65, 0.12, fachadaCol);
    cruzHierro(0, 14.3, -0.35, 1.35, fachadaCol);

    // CAMPANARIO COLONIAL OESTE DE TRES ARCOS + CHAPITEL PIRAMIDAL (litografía ca. 1845!)
    // Situado en el extremo oeste (+X) enlazando la iglesia con el antiguo Convento de San Francisco
    const camp = grupo(xLat + 1.85, zFrente - 1.9, 0, 'Campanario Colonial Oeste');
    const hCamp = etapa.postTerremoto ? 11.6 : 12.2;
    // Cuerpo de base + segundo nivel (portería lateral con arco y ventana alta)
    caja(0, 4.3, 0, 4.4, 8.6, 4.6, etapa.postTerremoto ? 'parche' : 'muro', camp);
    caja(0, 0.78, 0.04, 4.55, 1.56, 4.7, 'zocalo', camp);
    // Portada lateral arqueada en planta baja mirando al norte (+Z)
    const sPortLat = new THREE.Shape();
    sPortLat.moveTo(-0.85, 0);
    sPortLat.lineTo(-0.85, 2.3);
    sPortLat.absarc(0, 2.3, 0.85, Math.PI, 0, true);
    sPortLat.lineTo(0.85, 0);
    sPortLat.closePath();
    extruir(sPortLat, 0.25, 'madera', 0, 0.1, 2.22, camp);
    for (const sgn of [-1, 1]) {
      caja(sgn * 1.45, 2.05, 2.34, 0.42, 3.9, 0.28, 'moldura', camp);
      caja(sgn * 1.45, 6.2, 2.34, 0.36, 3.6, 0.26, 'moldura', camp);
    }
    caja(0, 4.2, 2.36, 4.7, 0.34, 0.5, 'moldura', camp);
    caja(0, 6.1, 2.32, 1.1, 1.85, 0.2, 'maderaOscura', camp);
    caja(0, 8.4, 0.1, 4.8, 0.38, 4.9, 'moldura', camp);

    // Tercer cuerpo: espadaña frontal de TRES ARCOS con campanas (rasgo inconfundible en ca. 1845!)
    const hEsp = hCamp - 8.5;
    caja(0, 8.5 + hEsp, 2.15, 4.85, 0.38, 0.7, 'moldura', camp);
    for (const px of [-2.0, -0.68, 0.68, 2.0]) {
      caja(px, 8.5 + hEsp / 2, 2.15, 0.46, hEsp, 0.56, 'moldura', camp);
    }
    // Campanas de bronce colgadas en los tres arcos
    for (const cx of [-1.34, 0, 1.34]) {
      malla(new THREE.ConeGeometry(0.32, 0.62, 7), 'bronce', cx, 8.5 + hEsp * 0.58, 2.15, camp);
    }
    for (const jx of [-1.95, 0, 1.95]) {
      jarron(jx, 8.7 + hEsp, 2.18, 0.62, 'moldura', camp);
    }
    // Chapitel piramidal de teja tras la espadaña (visible en la litografía de ca. 1845!)
    caja(0, 8.5 + hEsp * 0.42, -0.35, 4.2, hEsp * 0.85, 4.1, 'muro', camp);
    const chap = malla(new THREE.ConeGeometry(3.15, etapa.postTerremoto ? 2.1 : 2.75, 4), 'teja', 0, 8.5 + hEsp * 0.85 + (etapa.postTerremoto ? 1.05 : 1.38), -0.35, cubiertas);
    chap.rotation.y = Math.PI / 4;
    chap.position.set(xLat + 1.85, 8.5 + hEsp * 0.85 + (etapa.postTerremoto ? 1.05 : 1.38), zFrente - 2.25);
    jarron(xLat + 1.85, 8.5 + hEsp * 0.85 + (etapa.postTerremoto ? 2.1 : 2.75), zFrente - 2.25, 0.65, 'moldura', cubiertas);
  } else {
    // ============================================================================
    // 4B. FACHADA DE JUAN HURTADO MANRIQUE (1889, 1911 y 1936 — sin torre)
    //     Cotejo directo con img_0.jpg, img_1.jpg, more_0.jpg y more_3.jpg
    // ============================================================================
    const fachadaHM = grupo(0, zFrente, 0, 'Fachada Juan Hurtado Manrique (1888)');

    // Cuerpo inferior completo (x ∈ [-9.9, +9.9], y = 0..8.1 m)
    caja(0, 4.05, -0.45, 19.8, 8.1, 0.9, 'muro', fachadaHM);
    // Paño central blanco-marfil (como en img_0.jpg e img_1.jpg)
    caja(0, 4.05, 0.03, 5.4, 8.0, 0.14, 'panel', fachadaHM);
    // Zócalo continuo gris-piedra (interrumpido en las tres puertas)
    for (const [zx, zw] of [[-9.25, 1.3], [-4.4, 3.8], [4.4, 3.8], [9.25, 1.3]]) {
      caja(zx, 0.65, 0.18, zw, 1.3, 0.42, 'zocalo', fachadaHM);
    }

    // 3 PUERTAS RECTANGULARES DE MADERA TALLADA (central + dos laterales)
    function puertaRect(x, w, h, esCentral) {
      // Hueco y hojas de madera tallada con cuarterones
      caja(x, h / 2 + 0.08, 0.02, w, h, 0.24, 'madera', fachadaHM);
      caja(x, h / 2 + 0.08, 0.12, 0.12, h, 0.08, 'maderaOscura', fachadaHM);
      if (!ciudad) {
        for (const sgn of [-1, 1]) {
          for (let py = 0.8; py < h - 0.5; py += 1.05) {
            caja(x + sgn * (w * 0.25), py, 0.14, w * 0.34, 0.72, 0.06, 'maderaOscura', fachadaHM);
          }
        }
      }
      // Jambas y dintel moldurado
      for (const sgn of [-1, 1]) {
        caja(x + sgn * (w / 2 + 0.26), h / 2 + 0.1, 0.18, 0.46, h + 0.2, 0.34, 'moldura', fachadaHM);
      }
      caja(x, h + 0.38, 0.22, w + 1.1, 0.42, 0.44, 'moldura', fachadaHM);
      if (esCentral) {
        // Entablamento central, placa conmemorativa y frontón curvo partido bajo la cornisa principal
        caja(x, h + 0.92, 0.22, w + 0.8, 0.72, 0.34, 'moldura', fachadaHM);
        caja(x, h + 0.92, 0.4, 1.4, 0.44, 0.08, 'marmol', fachadaHM);
        caja(x, h + 1.38, 0.32, w + 1.4, 0.26, 0.58, 'moldura', fachadaHM);
        // Dos semiarcos del frontón curvo partido (enmarcando la base de la repisa)
        for (const sgn of [-1, 1]) {
          const sSeg = new THREE.Shape();
          sSeg.moveTo(0, 0);
          sSeg.quadraticCurveTo(0.65, 0.58, 1.25, 0.72);
          sSeg.lineTo(1.25, 0.4);
          sSeg.quadraticCurveTo(0.65, 0.26, 0, -0.16);
          sSeg.closePath();
          const mSeg = extruir(sSeg, 0.42, 'moldura', sgn * 2.15, h + 1.52, 0.1, fachadaHM);
          if (sgn > 0) mSeg.scale.x = -1;
        }
        // Repisa central proyectada sobre la cornisa principal + La Inmaculada Concepción (1655)
        // (exactamente entre la cornisa principal y el gran óculo, como en more_3.jpg!)
        malla(new THREE.CylinderGeometry(0.56, 0.32, 0.52, 10), 'moldura', x, 8.28, 0.56, fachadaHM);
        estatuaMarmol(x, 8.54, 0.56, 0.96, fachadaHM);
      } else {
        // Puertas laterales: medallón circular blanco sobre el dintel (img_0.jpg y more_3.jpg!)
        caja(x, h + 1.35, 0.14, w + 0.55, 1.55, 0.22, 'moldura', fachadaHM);
        malla(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 14), 'moldura', x, h + 1.35, 0.22, fachadaHM).rotation.x = Math.PI / 2;
        malla(new THREE.CylinderGeometry(0.46, 0.46, 0.26, 14), 'marmol', x, h + 1.35, 0.25, fachadaHM).rotation.x = Math.PI / 2;
      }
    }

    puertaRect(0, 2.9, 5.15, true);
    puertaRect(-7.45, 2.25, 4.55, false);
    puertaRect(7.45, 2.25, 4.55, false);

    // Dos machones intermedios con pilastras dóricas pareadas y las estatuas de San Juan Bautista y San Francisco
    for (const sgn of [-1, 1]) {
      const cx = sgn * 4.15;
      caja(cx, 3.9, 0.22, 2.75, 7.6, 0.42, 'muro', fachadaHM);
      for (const dx of [-1.18, 1.18]) {
        caja(cx + dx, 4.05, 0.34, 0.58, 7.4, 0.46, 'moldura', fachadaHM);
        caja(cx + dx, 7.52, 0.4, 0.78, 0.3, 0.58, 'moldura', fachadaHM);
      }
      // Recuadro interior moldurado + repisa semicircular + estatua de mármol de 1655
      caja(cx, 4.35, 0.43, 1.65, 4.8, 0.08, 'moldura', fachadaHM);
      caja(cx, 4.35, 0.46, 1.38, 4.45, 0.08, 'muro', fachadaHM);
      // Repisa y estatua (San Juan Bautista a la izquierda/Este, San Francisco a la derecha/Oeste)
      malla(new THREE.CylinderGeometry(0.54, 0.3, 0.45, 10), 'moldura', cx, 2.35, 0.58, fachadaHM);
      estatuaMarmol(cx, 2.58, 0.56, 0.96, fachadaHM);
      // Pilastras de las esquinas exteriores (±9.55)
      caja(sgn * 9.55, 4.05, 0.28, 0.78, 7.6, 0.48, 'moldura', fachadaHM);
    }

    // Gran entablamento y cornisa horizontal continua entre primer y segundo cuerpo (y = 7.75..8.55)
    caja(0, 7.95, 0.34, 20.4, 0.44, 0.78, 'moldura', fachadaHM);
    caja(0, 8.32, 0.42, 20.8, 0.34, 0.98, 'moldura', fachadaHM);

    // Lunetos semicirculares ciegos sobre las dos puertas laterales (y = 8.48..9.95, exactos a more_3.jpg!)
    for (const sgn of [-1, 1]) {
      const lx = sgn * 7.45;
      const sLun = new THREE.Shape();
      sLun.absarc(0, 0, 1.55, 0, Math.PI, false);
      sLun.closePath();
      extruir(sLun, 0.24, 'panel', lx, 8.48, 0.08, fachadaHM);
      const aLun = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.18, 6, segArco, Math.PI), mats.moldura);
      aLun.position.set(lx, 8.48, 0.26);
      fachadaHM.add(aLun);
      // Aleta lateral en pendiente suave con voluta en espiral y jarrón exterior
      const sAleta = new THREE.Shape();
      sAleta.moveTo(0, 0);
      sAleta.lineTo(0, 2.6);
      sAleta.quadraticCurveTo(1.8, 1.65, 4.45, 0.95);
      sAleta.lineTo(4.45, 0);
      sAleta.closePath();
      const mAl = extruir(sAleta, 0.52, 'muro', sgn * 5.4, 8.45, -0.22, fachadaHM);
      if (sgn < 0) mAl.scale.x = -1;
      // Moldura superior inclinada de la aleta
      barra([sgn * 5.4, 11.1, 0.22], [sgn * 9.8, 9.45, 0.22], 0.16, 'moldura', fachadaHM);
      // Voluta en espiral tallada junto al cuerpo central (inconfundible en img_0.jpg y more_3.jpg!)
      const vol = malla(new THREE.TorusGeometry(0.55, 0.14, 6, 14), 'moldura', sgn * 6.08, 10.1, 0.26, fachadaHM);
      vol.scale.set(1, 1.15, 1);
      malla(new THREE.SphereGeometry(0.2, 8, 6), 'moldura', sgn * 6.08, 10.1, 0.32, fachadaHM);
      // Jarrón de esquina
      jarron(sgn * 9.45, 9.55, 0.2, 0.72, 'moldura', fachadaHM);
    }

    // SEGUNDO CUERPO CENTRAL (y = 8.45..13.8 m, x ∈ [-5.5, +5.5])
    caja(0, 11.15, -0.35, 11.0, 5.4, 0.78, 'muro', fachadaHM);
    // Campo central claro con el gran ÓCULO CIRCULAR
    caja(0, 11.1, 0.06, 5.4, 5.2, 0.14, 'panel', fachadaHM);
    // Machones laterales superiores con pilastras dóricas pareadas
    for (const sgn of [-1, 1]) {
      const cx = sgn * 4.15;
      caja(cx, 11.15, 0.2, 2.75, 5.3, 0.36, 'muro', fachadaHM);
      for (const dx of [-1.18, 1.18]) {
        caja(cx + dx, 11.15, 0.32, 0.56, 5.2, 0.42, 'moldura', fachadaHM);
      }
      caja(cx, 11.15, 0.38, 1.55, 4.1, 0.08, 'moldura', fachadaHM);
      caja(cx, 11.15, 0.41, 1.28, 3.8, 0.08, 'muro', fachadaHM);
    }

    // Gran Óculo / Rosetón Circular (x = 0, y = 11.75, r = 1.48 m — dejando aire limpio sobre La Inmaculada!)
    malla(new THREE.CylinderGeometry(1.26, 1.26, 0.42, segArco), 'oscuro', 0, 11.75, 0.08, fachadaHM).rotation.x = Math.PI / 2;
    malla(new THREE.TorusGeometry(1.4, 0.22, 8, segArco), 'moldura', 0, 11.75, 0.26, fachadaHM);
    malla(new THREE.TorusGeometry(1.66, 0.11, 6, segArco), 'oro', 0, 11.75, 0.28, fachadaHM);
    if (!ciudad) {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        barra([0, 11.75, 0.22], [Math.cos(ang) * 1.24, 11.75 + Math.sin(ang) * 1.24, 0.22], 0.045, 'madera', fachadaHM);
      }
    }

    // Cornisa superior del segundo cuerpo (y = 13.75..14.2)
    caja(0, 13.9, 0.34, 11.7, 0.44, 0.85, 'moldura', fachadaHM);

    // REMATE SUPERIOR INCONFUNDIBLE DE SAN FRANCISCO (cotejo directo con more_3.jpg e img_0.jpg!):
    // Frontón curvo PARTIDO con clara escotadura flanqueando una peineta central más alta con guirnalda
    // 1. Peineta central elevada (x ∈ [-1.95, +1.95], y = 14.1..17.25)
    const sPeineta = new THREE.Shape();
    sPeineta.moveTo(-1.95, 0);
    sPeineta.lineTo(-1.95, 2.35);
    sPeineta.quadraticCurveTo(0, 3.25, 1.95, 2.35);
    sPeineta.lineTo(1.95, 0);
    sPeineta.closePath();
    extruir(sPeineta, 0.68, 'muro', 0, 14.1, -0.24, fachadaHM);
    // Cornisa arqueada sobresaliente de la peineta central
    const sCornC = new THREE.Shape();
    sCornC.moveTo(-2.3, 2.28);
    sCornC.quadraticCurveTo(0, 3.22, 2.3, 2.28);
    sCornC.lineTo(2.3, 2.66);
    sCornC.quadraticCurveTo(0, 3.6, -2.3, 2.66);
    sCornC.closePath();
    extruir(sCornC, 0.88, 'moldura', 0, 14.1, -0.18, fachadaHM);
    // Guirnalda colgante (festón) sobre la peineta central
    const guir = malla(new THREE.TorusGeometry(1.12, 0.085, 5, 12, Math.PI * 0.72), 'moldura', 0, 16.55, 0.46, fachadaHM);
    guir.rotation.z = Math.PI * 1.14;
    // Remate superior con jarrón
    jarron(0, 17.32, 0.24, 0.65, 'moldura', fachadaHM);

    // 2. Dos alas del FRONTÓN CURVO PARTIDO claramente separadas de la peineta por un escalón
    for (const sgn of [-1, 1]) {
      // Murete bajo enlazando la escotadura entre la peineta y el ala partida
      caja(sgn * 2.2, 14.75, 0.08, 0.75, 1.3, 0.52, 'muro', fachadaHM);
      // Ala partida exterior (x de ±2.45 a ±5.45, subiendo hasta un corte nítido en ±2.45)
      const sAlaF = new THREE.Shape();
      sAlaF.moveTo(0, 0);
      sAlaF.lineTo(0, 2.15);
      sAlaF.quadraticCurveTo(1.55, 1.45, 3.05, 0);
      sAlaF.closePath();
      const mAF = extruir(sAlaF, 0.58, 'muro', sgn * 2.45, 14.1, -0.22, fachadaHM);
      if (sgn < 0) mAF.scale.x = -1;
      // Moldura curva de coronación con corte vertical neto en el extremo interior del frontón partido
      const sMF = new THREE.Shape();
      sMF.moveTo(-0.08, 2.08);
      sMF.quadraticCurveTo(1.58, 1.42, 3.22, -0.05);
      sMF.lineTo(3.22, 0.28);
      sMF.quadraticCurveTo(1.58, 1.78, -0.08, 2.46);
      sMF.closePath();
      const mMF = extruir(sMF, 0.82, 'moldura', sgn * 2.45, 14.1, -0.18, fachadaHM);
      if (sgn < 0) mMF.scale.x = -1;
      // Corte lateral vertical de la moldura del frontón partido
      caja(sgn * 2.48, 15.32, 0.22, 0.26, 2.38, 0.72, 'moldura', fachadaHM);
      jarron(sgn * 5.05, 14.22, 0.22, 0.7, 'moldura', fachadaHM);
    }
  }

  // ============================================================================
  // 5. LA CEIBA DE SAN FRANCISCO (plantada hacia 1866 — presente desde 1889 en estudio)
  // ============================================================================
  if (mostrarCeiba) {
    const escalaC = anio === 1889 ? 0.58 : anio === 1911 ? 0.82 : 1.05;
    const cxC = -6.8;
    const czC = zFrente + 6.2;
    // Jardinera baja en la acera
    malla(new THREE.CylinderGeometry(2.5, 2.7, 0.42, 12), 'piedra', cxC, 0.22, czC, ceibaGrupo);
    malla(new THREE.CylinderGeometry(2.2, 2.2, 0.16, 12), 'cesped', cxC, 0.44, czC, ceibaGrupo);
    // Tronco grueso característico con contrafuertes radiculares (como en img_1.jpg y img_2.jpg!)
    const hTronco = 11.2 * escalaC;
    malla(new THREE.CylinderGeometry(0.68 * escalaC, 1.18 * escalaC, hTronco, 9), 'tronco', cxC, 0.4 + hTronco / 2, czC, ceibaGrupo);
    // Franja blanca patrimonial en la base del tronco (solo en 1936 o sutil en tronco)
    if (anio >= 1936) {
      malla(new THREE.CylinderGeometry(1.06 * escalaC, 1.14 * escalaC, 1.4, 9), 'marmol', cxC, 1.3, czC, ceibaGrupo);
    }
    // Ramas principales abiertas en abanico y copa amplia de ceiba
    const ramas = [
      [-4.2, 5.2, -1.8, 3.6], [4.0, 5.6, -1.2, 3.8],
      [-2.5, 6.4, 3.2, 3.5], [2.8, 5.8, 3.1, 3.4],
      [0.2, 7.6, 0.4, 4.2],
    ];
    for (const [dx, dy, dz, rad] of ramas) {
      const p0 = [cxC, 0.4 + hTronco * 0.86, czC];
      const p1 = [cxC + dx * escalaC, 0.4 + hTronco + dy * escalaC * 0.72, czC + dz * escalaC];
      barra(p0, p1, 0.34 * escalaC, 'tronco', ceibaGrupo);
      const copa = malla(
        new THREE.DodecahedronGeometry(rad * escalaC, 1),
        'copa',
        p1[0],
        p1[1] + 0.9 * escalaC,
        p1[2],
        ceibaGrupo
      );
      copa.scale.set(1.25, 0.68, 1.25);
    }
  }

  if (optimizar) {
    aplanarGrupo(cubiertas);
    aplanarGrupo(ceibaGrupo);
    aplanarGrupo(edificio, [cubiertas, ceibaGrupo]);
    optimizarPanteon(edificio);
  }

  return { edificio, cubiertas, ceiba: ceibaGrupo, etapa };
}
