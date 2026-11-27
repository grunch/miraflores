import * as THREE from 'three';
import { optimizarPanteon } from './optimizar-panteon.js';
import { etapaCapitolio } from './capitolio-datos.js';

/**
 * Estudio arquitectónico procedural del solar del Palacio Federal Legislativo
 * (Capitolio Federal) y el antiguo Convento de las Concepciones (1772–1958).
 *
 * Sistema de coordenadas compatible sin giro con grunch/caracas (src/hitos/datos/civiles.js):
 * - Origen (0, 0, 0) al centro de la manzana, cota de implantación y = 0.
 * - +X = Este (Las Monjas / San Francisco, hacia Plaza Bolívar).
 * - -X = Oeste (Padre Sierra / La Bolsa).
 * - +Y = Arriba (metros aproximados).
 * - -Z = Norte (Calle Oeste 2: Iglesia de las Concepciones en 1772–1843 /
 *               Palacio Federal y Salón Elíptico con cúpula desde 1889).
 * - +Z = Sur (Avenida Universidad, frente al antiguo Convento de San Francisco /
 *             Palacio de las Academias: Huerta conventual en 1772–1843 /
 *             Palacio Legislativo desde 1889).
 *
 * Huella nominal de la manzana completa: 92 m (E–O) × 108 m (N–S).
 * Medidas y ornamentos interpretativos para revisión visual; no constituyen levantamiento.
 */
export function crearCapitolio({ anio = 1772, optimizar = true, nivelDetalle = 'estudio' } = {}) {
  const etapa = etapaCapitolio(anio);
  const ciudad = nivelDetalle === 'ciudad';
  const segCol = ciudad ? 6 : 10;
  const segCupulaU = ciudad ? 16 : 32;
  const segCupulaV = ciudad ? 8 : 16;

  const edificio = new THREE.Group();
  const cubiertas = new THREE.Group();
  edificio.name = etapa.nombre;
  cubiertas.name = 'Cubiertas desmontables';
  edificio.add(cubiertas);
  edificio.userData = {
    id: 'capitolio',
    anio,
    etapa: etapa.id,
    cupula: etapa.cupula,
    medidasVerificadas: false,
    frente: '-Z = norte (Palacio Federal / Iglesia), +Z = sur (Palacio Legislativo / Huerta), +X = este',
    huella: [92, 108],
  };

  // Paleta de materiales calibrada según etapa (sin usar fotos externas como texturas).
  const esBlancoModerno = anio >= 1958;
  const colores = etapa.convento
    ? {
        muro: etapa.postTerremoto ? 0xdfd4bf : 0xe9e1cf,
        muroParche: 0xcabaa0,
        cal: 0xf2ece0,
        piedra: 0x8e8474,
        zocalo: 0x6f6659,
        madera: 0x5c422f,
        oscuro: 0x262624,
        hierro: 0x353937,
        patio: 0xc4b399,
        tierra: 0xa79272,
        cesped: 0x6a804d,
        copa: 0x486235,
        copaClara: 0x5a7741,
        agua: 0x56848f,
        teja: 0xa56245,
        tejaClara: 0xb97452,
        tejaOscura: 0x894e35,
        bronce: 0x7c643b,
      }
    : {
        muro: esBlancoModerno ? 0xeeeae0 : 0xdec89e,
        cal: esBlancoModerno ? 0xf7f5ee : 0xf2ebdc,
        piedra: 0x999286,
        zocalo: 0x666058,
        madera: 0x4b3526,
        oscuro: 0x232625,
        hierro: 0x2a312e,
        bronce: 0x5d4b31,
        patio: 0xd3cbbd,
        sendero: 0xe2dcd0,
        cesped: 0x527a40,
        seto: 0x3e6231,
        tronco: 0x8d877a,
        capitelPalma: 0x4d7438,
        hojaPalma: 0x3d6830,
        agua: 0x4b8d9a,
        techoRojo: esBlancoModerno ? 0xb54e3c : 0xa55742,
        techoPlano: 0xbeb8ab,
        zinc: 0x82898d,
        zincClaro: 0xa2a9ad,
        linterna: esBlancoModerno ? 0xb9bec0 : 0xc4bca8,
        oro: 0xd6a636,
        oroBrillo: 0xe6be54,
        amarillo: 0xffcd00,
        azul: 0x003da5,
        rojo: 0xd82337,
        blanco: 0xffffff,
      };

  const mats = Object.fromEntries(
    Object.entries(colores).map(([k, color]) => {
      const esOro = k === 'oro' || k === 'oroBrillo';
      const esMetal = k === 'zinc' || k === 'zincClaro' || k === 'bronce' || k === 'hierro';
      return [
        k,
        new THREE.MeshStandardMaterial({
          color,
          roughness: esOro ? 0.34 : esMetal ? 0.52 : k === 'agua' ? 0.28 : 0.9,
          metalness: esOro ? 0.48 : esMetal ? 0.25 : 0.02,
        }),
      ];
    })
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
      new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: false, curveSegments: ciudad ? 6 : 12 }),
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

  // ============================================================================
  // Helper: aplana subgrupos estáticos manteniendo intacto `cubiertas` para
  // que `optimizarPanteon` reduzca las llamadas de dibujo de ~900 a ~25.
  // ============================================================================
  function aplanarGrupo(raiz, excluir = null) {
    raiz.updateMatrixWorld(true);
    const invRaiz = raiz.matrixWorld.clone().invert();
    const mallas = [];
    const subgrupos = [];
    for (const hijo of [...raiz.children]) {
      if (hijo === excluir) continue;
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

  function finalizar() {
    if (!optimizar) return { edificio, cubiertas, etapa };
    aplanarGrupo(cubiertas);
    aplanarGrupo(edificio, cubiertas);
    optimizarPanteon(edificio);
    return { edificio, cubiertas, etapa };
  }

  // Plataforma fina de manzana (94 × 110 m, y = -0.30..0)
  caja(0, -0.15, 0, 95, 0.3, 111, 'piedra');

  // ============================================================================
  // BLOQUE A: CONVENTO DE LAS CONCEPCIONES (1772 y 1843)
  // ============================================================================
  if (etapa.convento) {
    const post = etapa.postTerremoto;

    function techoDosAguas(cx, cz, largo, ancho, y, alto, ejeZ = false, g = cubiertas) {
      const gr = grupo(cx, cz, ejeZ ? Math.PI / 2 : 0, 'Techo a dos aguas', g);
      const al = 0.55;
      const hw = largo / 2 + al;
      const hd = ancho / 2 + al;
      const f1 = [
        [-hw, y, -hd], [hw, y, -hd], [hw, y + alto, 0],
        [-hw, y, -hd], [hw, y + alto, 0], [-hw, y + alto, 0],
      ];
      const f2 = [
        [hw, y, hd], [-hw, y, hd], [-hw, y + alto, 0],
        [hw, y, hd], [-hw, y + alto, 0], [hw, y + alto, 0],
      ];
      perfil(f1, 'teja', gr);
      perfil(f2, 'teja', gr);
      // Tímpanos cerrados
      for (const s of [-1, 1]) {
        const tri = s > 0
          ? [[largo / 2, y, -ancho / 2], [largo / 2, y, ancho / 2], [largo / 2, y + alto, 0]]
          : [[-largo / 2, y, ancho / 2], [-largo / 2, y, -ancho / 2], [-largo / 2, y + alto, 0]];
        perfil(tri, 'muro', gr);
      }
      // Cumbrera
      barra([-hw, y + alto + 0.08, 0], [hw, y + alto + 0.08, 0], 0.14, 'tejaClara', gr);
      // Nervaduras de tejas criollas
      const paso = ciudad ? 2.6 : 1.1;
      for (let u = -hw + 0.4; u <= hw - 0.3; u += paso) {
        const tono = Math.round(u) % 3 === 0 ? 'tejaOscura' : 'tejaClara';
        barra([u, y + 0.05, -hd], [u, y + alto + 0.05, 0], 0.055, tono, gr);
        barra([u, y + 0.05, hd], [u, y + alto + 0.05, 0], 0.055, tono, gr);
      }
    }

    function techoMediaAgua(cx, cz, largo, ancho, yBajo, alto, rotY = 0, g = cubiertas) {
      // Cae hacia +Z local
      const gr = grupo(cx, cz, rotY, 'Techo a media agua', g);
      const hw = largo / 2 + 0.35;
      const hd = ancho / 2 + 0.35;
      const pts = [
        [-hw, yBajo + alto, -hd], [hw, yBajo + alto, -hd], [hw, yBajo, hd],
        [-hw, yBajo + alto, -hd], [hw, yBajo, hd], [-hw, yBajo, hd],
      ];
      perfil(pts, 'teja', gr);
      const paso = ciudad ? 2.5 : 1.15;
      for (let u = -hw + 0.4; u <= hw - 0.3; u += paso) {
        barra([u, yBajo + alto + 0.04, -hd], [u, yBajo + 0.04, hd], 0.05, 'tejaClara', gr);
      }
    }

    function ventanaColonial(x, y, z, w, h, rotY = 0, conReja = true, g = edificio) {
      const vg = grupo(x, z, rotY, 'Ventana colonial', g);
      caja(0, y + h / 2, 0.02, w, h, 0.14, 'oscuro', vg);
      caja(0, y + h + 0.12, 0.08, w + 0.42, 0.2, 0.22, 'cal', vg);
      caja(0, y - 0.12, 0.12, w + 0.46, 0.2, 0.3, 'piedra', vg);
      for (const s of [-1, 1]) {
        caja(s * (w / 2 + 0.12), y + h / 2, 0.07, 0.2, h + 0.24, 0.18, 'cal', vg);
      }
      if (conReja) {
        for (let u = -w / 2 + 0.18; u <= w / 2 - 0.15; u += 0.28) {
          caja(u, y + h / 2, 0.16, 0.045, h, 0.045, 'madera', vg);
        }
        caja(0, y + h * 0.5, 0.17, w, 0.055, 0.055, 'madera', vg);
      }
    }

    function arbolFrutal(x, z, escala = 1, g = edificio) {
      malla(
        new THREE.CylinderGeometry(0.16 * escala, 0.26 * escala, 2.5 * escala, ciudad ? 5 : 7),
        'madera',
        x,
        1.25 * escala,
        z,
        g
      );
      const copa = malla(
        new THREE.DodecahedronGeometry(1.85 * escala, ciudad ? 0 : 1),
        Math.round(x + z) % 2 === 0 ? 'copa' : 'copaClara',
        x,
        3.2 * escala,
        z,
        g
      );
      copa.scale.set(1.15, 0.85, 1.15);
    }

    function cipres(x, z, h = 8.5, g = edificio) {
      malla(new THREE.CylinderGeometry(0.14, 0.22, 1.6, 5), 'madera', x, 0.8, z, g);
      malla(new THREE.ConeGeometry(1.15, h, ciudad ? 6 : 8), 'copa', x, 1.4 + h / 2, z, g);
    }

    // 1. IGLESIA CONVENTUAL DE LA INMACULADA CONCEPCIÓN (costado norte, orientada al este)
    const hIglesia = post ? 8.8 : 9.6;
    const iglesia = grupo(13.5, -45.5, 0, 'Iglesia de las Concepciones');
    // Nave principal: 62 m (E–O, x = -31..+31 local -> mundo -17.5..+44.5) × 14.4 m (N–S)
    caja(0, hIglesia / 2, 0, 62, hIglesia, 14.4, 'muro', iglesia);
    caja(0, 0.55, 0, 62.6, 1.1, 14.9, 'zocalo', iglesia);
    // Cornisa superior
    caja(0, hIglesia - 0.18, 0, 62.8, 0.36, 15.1, 'cal', iglesia);

    // Contrafuertes exteriores a lo largo de la calle norte (más gruesos en 1843 tras 1812)
    const nContraf = post ? 8 : 6;
    for (let i = 0; i < nContraf; i++) {
      const cx = -27 + (i / (nContraf - 1)) * 52;
      const prof = post ? 1.55 : 1.0;
      const altC = post ? hIglesia * 0.88 : hIglesia * 0.78;
      caja(cx, altC / 2, -7.2 - prof / 2, 1.15, altC, prof, post ? 'muroParche' : 'muro', iglesia);
      caja(cx, altC + 0.14, -7.2 - prof / 2, 1.25, 0.22, prof + 0.15, 'teja', iglesia);
    }
    // Ventanas altas (clerestorio conventual) en el muro norte
    for (let x = -22; x <= 22; x += 7.3) {
      ventanaColonial(x, hIglesia - 3.0, -7.25, 1.15, 1.65, Math.PI, true, iglesia);
    }

    // Portada barroca-colonial en el extremo ESTE (x = +31 local -> mundo +44.5, hacia Esquina de Las Monjas)
    const portada = grupo(31.05, 0, Math.PI / 2, 'Portada oriental de la Iglesia', iglesia);
    // Cuerpo central resaltado
    caja(0, hIglesia / 2, 0.25, 11.2, hIglesia, 0.65, 'cal', portada);
    // Dos pares de pilastras coloniales
    for (const px of [-4.4, -2.5, 2.5, 4.4]) {
      caja(px, hIglesia * 0.45, 0.62, 0.68, hIglesia * 0.86, 0.45, 'cal', portada);
      caja(px, hIglesia * 0.88, 0.68, 0.92, 0.34, 0.56, 'cal', portada);
    }
    // Puerta de arco de medio punto
    const sPuerta = new THREE.Shape();
    sPuerta.moveTo(-1.55, 0);
    sPuerta.lineTo(-1.55, 3.1);
    sPuerta.absarc(0, 3.1, 1.55, Math.PI, 0, true);
    sPuerta.lineTo(1.55, 0);
    sPuerta.closePath();
    extruir(sPuerta, 0.4, 'madera', 0, 0.15, 0.35, portada);
    // Cornisa intermedia y frontón mixtilíneo colonial
    caja(0, 6.2, 0.65, 11.6, 0.42, 0.8, 'cal', portada);
    const sFronton = new THREE.Shape();
    sFronton.moveTo(-5.4, 0);
    sFronton.quadraticCurveTo(-3.2, 0.4, -2.4, 2.2);
    sFronton.quadraticCurveTo(0, 4.4, 2.4, 2.2);
    sFronton.quadraticCurveTo(3.2, 0.4, 5.4, 0);
    sFronton.closePath();
    extruir(sFronton, 0.6, 'cal', 0, hIglesia - 0.1, 0.1, portada);
    // Óculo del coro
    malla(new THREE.TorusGeometry(0.85, 0.16, 6, ciudad ? 10 : 16), 'cal', 0, 7.75, 0.72, portada);
    malla(new THREE.CylinderGeometry(0.75, 0.75, 0.18, 12), 'oscuro', 0, 7.75, 0.58, portada).rotation.x = Math.PI / 2;
    // Cruz superior
    caja(0, hIglesia + 4.35, 0.4, 0.18, 1.5, 0.18, 'hierro', portada);
    caja(0, hIglesia + 4.65, 0.4, 0.85, 0.18, 0.18, 'hierro', portada);

    // Campanario (1772) vs Espadaña reparada post-terremoto (1843) en la Esquina de Las Monjas (NE)
    if (!post) {
      const torre = grupo(26.2, -6.4, 0, 'Campanario Esquina de Las Monjas', iglesia);
      caja(0, 6.2, 0, 5.4, 12.4, 5.4, 'muro', torre);
      caja(0, 12.4, 0, 5.9, 0.4, 5.9, 'cal', torre);
      // Cuerpo de campanas con arcos en las cuatro caras
      for (const [sx, sz] of [[-2.1, -2.1], [2.1, -2.1], [-2.1, 2.1], [2.1, 2.1]]) {
        caja(sx, 14.3, sz, 1.15, 3.6, 1.15, 'cal', torre);
      }
      caja(0, 16.2, 0, 5.7, 0.55, 5.7, 'cal', torre);
      // Campana de bronce
      malla(new THREE.ConeGeometry(0.65, 1.0, 8), 'bronce', 0, 14.5, 0, torre);
      // Chapitel piramidal de teja/cal y cruz
      malla(new THREE.ConeGeometry(3.75, 3.1, 4), 'teja', 0, 18.0, 0, torre).rotation.y = Math.PI / 4;
      caja(0, 20.1, 0, 0.14, 1.35, 0.14, 'hierro', torre);
      caja(0, 20.4, 0, 0.72, 0.14, 0.14, 'hierro', torre);
    } else {
      // 1843: base reforzada del campanario dañado + espadaña sobria de dos vanos
      const esp = grupo(26.2, -6.4, 0, 'Espadaña reparada 1843', iglesia);
      caja(0, 4.9, 0, 5.4, 9.8, 5.4, 'muroParche', esp);
      caja(0, 9.9, 0, 5.8, 0.36, 5.8, 'cal', esp);
      // Muro de espadaña mirando al este
      caja(1.6, 11.8, 0, 0.85, 3.5, 4.8, 'cal', esp);
      for (const dz of [-1.2, 1.2]) {
        caja(1.6, 11.4, dz, 0.95, 1.8, 1.05, 'oscuro', esp);
        malla(new THREE.ConeGeometry(0.36, 0.65, 7), 'bronce', 1.6, 11.6, dz, esp);
      }
      caja(1.6, 13.7, 0, 1.0, 0.3, 5.2, 'cal', esp);
      malla(new THREE.ConeGeometry(1.1, 1.3, 4), 'cal', 1.6, 14.4, 0, esp).rotation.y = Math.PI / 4;
      caja(1.6, 15.5, 0, 0.12, 1.0, 0.12, 'hierro', esp);
    }

    // Techo de teja criolla de la iglesia (en cubiertas)
    techoDosAguas(13.5, -45.5, 62, 14.4, hIglesia, 3.8, false, cubiertas);

    // 2. CLAUSTRO PRINCIPAL DE DOS PLANTAS + ALA ESTE (PORTERÍA Y REFECTORIO)
    // Rectángulo exterior del claustro: x ∈ [-22, +45] (67 m), z ∈ [-38.3, +16.5] (54.8 m)
    // Patio interior del claustro: x ∈ [-10, +33] (43 m), z ∈ [-27.5, +5.5] (33 m)
    const hAlaEste = post ? 8.0 : 8.4;
    const hAlaSurCl = 8.2;
    const hAlaOesteCl = post ? 4.9 : 8.2; // En 1843 el ala oeste del claustro se reduce a 1 planta tras 1812

    // Ala Norte del Claustro (sacristía y coro alto/bajo adosados a la iglesia: x = -10..+33, z = -38.3..-27.5)
    caja(11.5, hAlaEste / 2, -32.9, 43.0, hAlaEste, 10.8, 'muro');
    techoDosAguas(11.5, -32.9, 43.0, 10.8, hAlaEste, 2.3, false, cubiertas);

    // Ala Este (Portería y Refectorio, x = +33..+45, z = -38.3..+16.5 -> largo 54.8, ancho 12)
    caja(39.0, hAlaEste / 2, -10.9, 12.0, hAlaEste, 54.8, 'muro');
    caja(39.0, 0.45, -10.9, 12.4, 0.9, 55.2, 'zocalo');
    techoDosAguas(39.0, -10.9, 54.8, 12.0, hAlaEste, 2.7, true, cubiertas);

    // Fachada exterior Este (calle Las Monjas – San Francisco): portería y ventanas de clausura
    const fEsteConv = grupo(45.05, -10.9, Math.PI / 2, 'Fachada Este Convento');
    // Portería conventual (portón de madera con arco)
    caja(8.0, 2.15, 0.12, 3.0, 4.3, 0.35, 'cal', fEsteConv);
    caja(8.0, 1.95, 0.25, 2.3, 3.8, 0.22, 'madera', fEsteConv);
    caja(8.0, 4.45, 0.22, 3.6, 0.32, 0.5, 'cal', fEsteConv);
    for (let u = -22; u <= 22; u += 5.5) {
      if (Math.abs(u - 8.0) > 2.8) ventanaColonial(u, 1.35, 0.05, 1.2, 2.0, 0, true, fEsteConv);
      ventanaColonial(u, 5.1, 0.05, 1.15, 1.75, 0, true, fEsteConv);
    }

    // Ala Sur del Claustro (x = -22..+33, z = +5.5..+16.5 -> largo 55, ancho 11)
    caja(5.5, hAlaSurCl / 2, 11.0, 55.0, hAlaSurCl, 11.0, post ? 'muroParche' : 'muro');
    techoDosAguas(5.5, 11.0, 55.0, 11.0, hAlaSurCl, 2.5, false, cubiertas);

    // Ala Oeste del Claustro (x = -22..-10, z = -38.3..+5.5 -> largo 43.8, ancho 12)
    caja(-16.0, hAlaOesteCl / 2, -16.4, 12.0, hAlaOesteCl, 43.8, post ? 'muroParche' : 'muro');
    techoDosAguas(-16.0, -16.4, 43.8, 12.0, hAlaOesteCl, post ? 2.1 : 2.6, true, cubiertas);

    // Corredores porticados interiores del claustro principal (en los 4 lados del patio)
    const patioCl = grupo(11.5, -11.0, 0, 'Claustro Principal');
    // Suelo empedrado del patio (43 × 33 m)
    caja(0, 0.08, 0, 43.0, 0.16, 33.0, 'patio', patioCl);
    // Cuatro canteros verdes en cruz + pila colonial al centro
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        caja(sx * 9.5, 0.16, sz * 6.8, 13.0, 0.14, 8.2, 'cesped', patioCl);
        arbolFrutal(sx * 9.5, sz * 6.8, 0.9, patioCl);
      }
    }
    // Pila octogonal de agua colonial
    malla(new THREE.CylinderGeometry(2.6, 2.8, 0.72, 8), 'piedra', 0, 0.42, 0, patioCl);
    malla(new THREE.CylinderGeometry(2.1, 2.1, 0.15, 8), 'agua', 0, 0.72, 0, patioCl);
    malla(new THREE.CylinderGeometry(0.45, 0.65, 1.5, 8), 'piedra', 0, 1.15, 0, patioCl);
    malla(new THREE.CylinderGeometry(1.1, 0.35, 0.38, 8), 'piedra', 0, 1.95, 0, patioCl);

    function galeriaClaustro(largo, x, z, rotY, dosPisos) {
      const gg = grupo(x, z, rotY, 'Corredor claustro', patioCl);
      const nTramos = Math.max(4, Math.round(largo / 3.8));
      const paso = largo / nTramos;
      // Planta baja: pilares de mampostería y vigas
      for (let i = 0; i <= nTramos; i++) {
        const u = -largo / 2 + i * paso;
        caja(u, 1.95, 0, 0.46, 3.9, 0.46, 'cal', gg);
        caja(u, 3.82, 0, 0.66, 0.24, 0.66, 'cal', gg);
      }
      caja(0, 4.15, 0, largo, 0.55, 0.5, 'cal', gg);
      caja(0, 4.1, -1.65, largo, 0.28, 3.4, 'madera', gg);
      // Planta alta: pies derechos de madera, zapatas y baranda
      if (dosPisos) {
        for (let i = 0; i <= nTramos; i++) {
          const u = -largo / 2 + i * paso;
          caja(u, 6.0, 0, 0.24, 3.4, 0.24, 'madera', gg);
          caja(u, 7.52, 0, 0.95, 0.22, 0.28, 'madera', gg);
        }
        caja(0, 7.72, 0, largo, 0.3, 0.32, 'madera', gg);
        // Baranda colonial de madera
        caja(0, 5.15, 0.05, largo, 0.1, 0.1, 'madera', gg);
        caja(0, 4.45, 0.05, largo, 0.08, 0.08, 'madera', gg);
        const pBar = ciudad ? 1.1 : 0.45;
        for (let u = -largo / 2 + 0.3; u < largo / 2; u += pBar) {
          caja(u, 4.8, 0.05, 0.055, 0.72, 0.055, 'madera', gg);
        }
      }
    }

    // 4 corredores del claustro principal (remetidos 3.2 m dentro del patio)
    galeriaClaustro(36.6, 0, -13.3, 0, true);
    galeriaClaustro(36.6, 0, 13.3, Math.PI, true);
    galeriaClaustro(26.6, 18.3, 0, -Math.PI / 2, true);
    galeriaClaustro(26.6, -18.3, 0, Math.PI / 2, !post);

    // Tejadillos a media agua cubriendo los corredores del claustro
    techoMediaAgua(11.5, -26.0, 38.0, 4.2, 7.5, 1.3, 0, cubiertas);
    techoMediaAgua(11.5, 4.0, 38.0, 4.2, 7.5, 1.3, Math.PI, cubiertas);
    techoMediaAgua(31.5, -11.0, 28.0, 4.2, 7.5, 1.3, -Math.PI / 2, cubiertas);
    techoMediaAgua(-8.5, -11.0, 28.0, 4.2, post ? 4.4 : 7.5, 1.2, Math.PI / 2, cubiertas);

    // 3. DEPENDENCIAS DE SERVICIO Y SEGUNDO PATIO (sector noroeste y oeste, x = -45..-22, z = -52..+16)
    const hDep = 4.6;
    // Pabellón norte-oeste (noviciado / enfermería)
    caja(-33.5, hDep / 2, -46.5, 23.0, hDep, 11.0, 'muro');
    techoDosAguas(-33.5, -46.5, 23.0, 11.0, hDep, 2.2, false, cubiertas);
    // Pabellón oeste a lo largo de Padre Sierra – La Bolsa
    caja(-40.5, hDep / 2, -13.0, 9.0, hDep, 56.0, post ? 'muroParche' : 'muro');
    techoDosAguas(-40.5, -13.0, 56.0, 9.0, hDep, 2.0, true, cubiertas);
    // Patio de servicio oeste (x = -36..-22, z = -41..+14)
    caja(-29.0, 0.06, -13.5, 14.0, 0.12, 55.0, 'tierra');
    malla(new THREE.CylinderGeometry(1.4, 1.5, 0.85, 8), 'piedra', -29.0, 0.45, -14.0);
    malla(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 8), 'agua', -29.0, 0.82, -14.0);
    arbolFrutal(-29.0, -28.0, 0.95);
    arbolFrutal(-29.0, 1.0, 1.05);

    // 4. GRAN HUERTA CONVENTUAL AMURALLADA (toda la mitad sur de la manzana: z = +16.5..+53.5, x = -45..+45)
    caja(0, 0.05, 35.0, 90.0, 0.1, 37.0, 'tierra');
    // Cuadrantes cultivados de la huerta
    for (const cx of [-30, -10, 10, 30]) {
      for (const cz of [25.5, 43.5]) {
        caja(cx, 0.12, cz, 16.5, 0.1, 13.5, 'cesped');
      }
    }
    // Estanque / alberca de riego central de la huerta
    caja(0, 0.45, 34.5, 7.2, 0.9, 5.2, 'piedra');
    caja(0, 0.82, 34.5, 6.2, 0.16, 4.2, 'agua');

    // Arbolado frutal y cipreses de la huerta de clausura
    const arbolesHuerta = [
      [-34, 24, 1.1], [-25, 27, 0.95], [-14, 24, 1.05], [-6, 28, 0.9],
      [8, 25, 1.15], [16, 27, 0.95], [27, 24, 1.05], [35, 28, 1.0],
      [-35, 43, 1.15], [-24, 45, 1.0], [-13, 42, 1.1], [11, 44, 1.05],
      [23, 42, 1.1], [34, 45, 0.95],
    ];
    for (const [ax, az, sc] of arbolesHuerta) arbolFrutal(ax, az, sc);
    for (const [cx, cz] of [[-40, 21], [-40, 48], [40, 21], [40, 48], [-19, 34.5], [19, 34.5]]) {
      cipres(cx, cz, 8.8);
    }

    // Casilla de jardinería y aperos apoyada contra la tapia sureste
    caja(34.0, 2.0, 48.0, 16.0, 4.0, 7.5, 'muro');
    techoMediaAgua(34.0, 48.0, 16.0, 7.5, 3.6, 1.2, Math.PI, cubiertas);

    // Tapias perimetrales de clausura (4.6 m de alto con albardilla de teja) cerrando toda la manzana
    const hTapia = 4.6;
    function tapia(x, z, w, d) {
      caja(x, hTapia / 2, z, w, hTapia, d, post ? 'muroParche' : 'muro');
      caja(x, 0.4, z, w + 0.12, 0.8, d + 0.12, 'zocalo');
      caja(x, hTapia + 0.18, z, w + 0.25, 0.34, d + 0.25, 'teja');
    }
    // Tapia Sur (San Francisco – La Bolsa)
    tapia(0, 53.2, 90.6, 0.85);
    // Portón de servicio en el muro sur
    caja(-12.0, 1.9, 53.35, 3.2, 3.8, 0.75, 'madera');
    caja(-12.0, 4.05, 53.4, 3.9, 0.42, 0.95, 'cal');
    // Tapia Este sur (cerrando la huerta hacia San Francisco)
    tapia(44.9, 34.8, 0.85, 37.0);
    // Tapia Oeste sur (cerrando la huerta hacia La Bolsa)
    tapia(-44.9, 34.8, 0.85, 37.0);
    // Contrafuertes en las tapias
    for (let x = -40; x <= 40; x += 10) {
      caja(x, 2.1, 53.75, 0.7, 4.2, 0.55, 'muro');
    }
    for (let z = 20; z <= 50; z += 10) {
      caja(45.4, 2.1, z, 0.55, 4.2, 0.7, 'muro');
      caja(-45.4, 2.1, z, 0.55, 4.2, 0.7, 'muro');
    }

    return finalizar();
  }

  // ============================================================================
  // BLOQUE B: PALACIO FEDERAL LEGISLATIVO / CAPITOLIO FEDERAL (1889–1958)
  // ============================================================================

  // --- Piezas neoclásicas reutilizables ---
  function columnaCorintia(x, yBase, z, alto = 7.6, radio = 0.42, g = edificio) {
    // Pedestal cuadrado con zócalo oscuro y fuste blanco + capitel corintio oscuro/bronce
    const hPed = 1.1;
    const hCap = 0.78;
    const hFuste = alto - hPed - hCap;
    caja(x, yBase + 0.16, z, radio * 2.9, 0.32, radio * 2.9, 'zocalo', g);
    caja(x, yBase + 0.65, z, radio * 2.55, 0.72, radio * 2.55, 'cal', g);
    caja(x, yBase + hPed - 0.04, z, radio * 2.75, 0.16, radio * 2.75, 'cal', g);
    malla(
      new THREE.CylinderGeometry(radio * 0.88, radio * 1.02, hFuste, segCol),
      'cal',
      x,
      yBase + hPed + hFuste / 2,
      z,
      g
    );
    // Collarino y capitel corintio de bronce oscuro (como en las fotos de recursos/congreso)
    malla(
      new THREE.CylinderGeometry(radio * 1.38, radio * 0.88, hCap * 0.78, segCol),
      'bronce',
      x,
      yBase + hPed + hFuste + hCap * 0.38,
      z,
      g
    );
    caja(x, yBase + alto - 0.1, z, radio * 2.95, 0.2, radio * 2.95, 'bronce', g);
  }

  function cariatide(x, yBase, z, rotY = 0, g = edificio) {
    // Escultura alegórica neoclásica (La Ley y La Justicia, Manuel Antonio González, 1876)
    const cg = grupo(x, z, rotY, 'Cariátide', g);
    caja(0, yBase + 1.15, 0, 1.35, 2.3, 1.35, 'cal', cg);
    caja(0, yBase + 2.38, 0, 1.52, 0.2, 1.52, 'cal', cg);
    // Figura drapeada estilizada
    malla(new THREE.CylinderGeometry(0.36, 0.5, 2.8, segCol), 'cal', 0, yBase + 3.85, 0, cg);
    malla(new THREE.CylinderGeometry(0.42, 0.34, 1.15, segCol), 'cal', 0, yBase + 5.75, 0, cg);
    malla(new THREE.SphereGeometry(0.28, 8, 6), 'cal', 0, yBase + 6.62, 0.04, cg);
    // Capitel / canasto sobre la cabeza sosteniendo el entablamento
    malla(new THREE.CylinderGeometry(0.55, 0.34, 0.62, segCol), 'cal', 0, yBase + 7.22, 0, cg);
    caja(0, yBase + 7.56, 0, 1.28, 0.2, 1.28, 'cal', cg);
  }

  function vanoArqueado(x, y, z, w, h, rotY = 0, esPuerta = false, g = edificio) {
    const vg = grupo(x, z, rotY, esPuerta ? 'Puerta arqueada' : 'Ventana arqueada', g);
    const r = w / 2;
    const hRect = Math.max(0.4, h - r);
    const s = new THREE.Shape();
    s.moveTo(-r, 0);
    s.lineTo(-r, hRect);
    s.absarc(0, hRect, r, Math.PI, 0, true);
    s.lineTo(r, 0);
    s.closePath();
    extruir(s, 0.16, esPuerta ? 'madera' : 'oscuro', 0, y, -0.06, vg);
    // Moldura de jambas y arco
    for (const sgn of [-1, 1]) {
      caja(sgn * (r + 0.14), y + hRect / 2, 0.08, 0.24, hRect, 0.2, 'cal', vg);
    }
    const arco = new THREE.Mesh(
      new THREE.TorusGeometry(r + 0.12, 0.13, 5, ciudad ? 8 : 14, Math.PI),
      mats.cal
    );
    arco.position.set(0, y + hRect, 0.08);
    vg.add(arco);
    if (!esPuerta) {
      caja(0, y - 0.12, 0.14, w + 0.65, 0.22, 0.36, 'cal', vg);
      if (!ciudad) {
        for (let u = -r + 0.25; u < r - 0.15; u += 0.36) {
          caja(u, y + hRect / 2, 0.11, 0.04, hRect, 0.04, 'hierro', vg);
        }
        caja(0, y + hRect * 0.5, 0.12, w, 0.05, 0.05, 'hierro', vg);
      }
    }
  }

  function balaustrada(x, y, z, largo, rotY = 0, g = edificio) {
    const bg = grupo(x, z, rotY, 'Balaustrada', g);
    caja(0, y + 0.1, 0, largo, 0.2, 0.36, 'cal', bg);
    caja(0, y + 1.08, 0, largo, 0.18, 0.4, 'cal', bg);
    const paso = ciudad ? 1.2 : 0.55;
    for (let u = -largo / 2 + 0.35; u <= largo / 2 - 0.3; u += paso) {
      caja(u, y + 0.58, 0, 0.13, 0.82, 0.13, 'cal', bg);
    }
    // Pilastrillas de remate cada ~5 m
    const nPil = Math.max(2, Math.round(largo / 5.5));
    for (let i = 0; i <= nPil; i++) {
      const u = -largo / 2 + (i / nPil) * largo;
      caja(u, y + 0.62, 0, 0.52, 1.15, 0.48, 'cal', bg);
    }
  }

  function frontonTriangular(x, y, z, ancho, alto, prof, rotY = 0, g = edificio) {
    const fg = grupo(x, z, rotY, 'Frontón triangular', g);
    const s = new THREE.Shape();
    s.moveTo(-ancho / 2, 0);
    s.lineTo(0, alto);
    s.lineTo(ancho / 2, 0);
    s.closePath();
    extruir(s, prof, 'muro', 0, y, -prof / 2, fg);
    // Cornisas inclinadas resaltadas
    const hip = Math.hypot(ancho / 2, alto);
    const ang = Math.atan2(alto, ancho / 2);
    for (const sgn of [-1, 1]) {
      const c = caja(sgn * ancho * 0.25, y + alto * 0.52, 0.12, hip + 0.45, 0.34, prof + 0.42, 'cal', fg);
      c.rotation.z = -sgn * ang;
    }
    caja(0, y - 0.14, 0.12, ancho + 0.6, 0.32, prof + 0.45, 'cal', fg);
  }

  function verjaHierro(x, z, largo, rotY = 0, g = edificio) {
    const vg = grupo(x, z, rotY, 'Verja perimetral', g);
    caja(0, 0.22, 0, largo, 0.44, 0.34, 'piedra', vg);
    caja(0, 0.48, 0, largo, 0.1, 0.4, 'cal', vg);
    caja(0, 1.75, 0, largo, 0.08, 0.08, 'hierro', vg);
    caja(0, 0.72, 0, largo, 0.07, 0.07, 'hierro', vg);
    const paso = ciudad ? 1.0 : 0.38;
    for (let u = -largo / 2 + 0.2; u <= largo / 2 - 0.15; u += paso) {
      caja(u, 1.24, 0, 0.04, 1.32, 0.04, 'hierro', vg);
    }
    const nPost = Math.max(2, Math.round(largo / 6.5));
    for (let i = 0; i <= nPost; i++) {
      const u = -largo / 2 + (i / nPost) * largo;
      caja(u, 1.05, 0, 0.36, 2.1, 0.36, 'piedra', vg);
      caja(u, 2.15, 0, 0.44, 0.16, 0.44, 'cal', vg);
    }
  }

  function banderaVenezuela(x, yMastil, z, alturaMastil = 5.4, g = cubiertas) {
    // Asta + enseña ondulada con disposición histórica de las 7 estrellas
    malla(new THREE.CylinderGeometry(0.055, 0.085, alturaMastil, 6), 'cal', x, yMastil + alturaMastil / 2, z, g);
    malla(new THREE.SphereGeometry(0.14, 8, 6), 'oroBrillo', x, yMastil + alturaMastil + 0.08, z, g);

    const wB = 3.1;
    const hB = 2.05;
    const yBase = yMastil + alturaMastil - hB - 0.12;
    const franjas = ['rojo', 'azul', 'amarillo'];
    const segs = ciudad ? 3 : 6;
    const dx = wB / segs;
    for (let s = 0; s < segs; s++) {
      const u = (s + 0.5) * dx;
      const onda = Math.sin((s / segs) * Math.PI * 1.9) * 0.18;
      for (let f = 0; f < 3; f++) {
        caja(x + u, yBase + (f + 0.5) * (hB / 3), z + onda, dx + 0.03, hB / 3, 0.055, franjas[f], g);
      }
    }
    // Estrellas blancas sobre la franja azul central según época
    if (!ciudad) {
      const yAzul = yBase + hB * 0.5;
      const cxE = x + wB * 0.5;
      const puntos = [];
      if (anio === 1889) {
        // 6 alrededor de 1 central
        puntos.push([0, 0]);
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          puntos.push([Math.cos(a) * 0.25, Math.sin(a) * 0.2]);
        }
      } else if (anio === 1911) {
        // 7 en circunferencia
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          puntos.push([Math.cos(a) * 0.28, Math.sin(a) * 0.21]);
        }
      } else {
        // 7 en arco (ley de 1930 en adelante)
        for (let k = 0; k < 7; k++) {
          const a = Math.PI * 0.15 + (k / 6) * Math.PI * 0.7;
          puntos.push([-Math.cos(a) * 0.55, Math.sin(a) * 0.22 - 0.08]);
        }
      }
      for (const [ex, ey] of puntos) {
        const onda = Math.sin(((cxE + ex - x) / wB) * Math.PI * 1.9) * 0.18;
        caja(cxE + ex, yAzul + ey, z + onda + 0.04, 0.085, 0.085, 0.03, 'blanco', g);
        caja(cxE + ex, yAzul + ey, z + onda - 0.04, 0.085, 0.085, 0.03, 'blanco', g);
      }
    }
  }

  function chaguaramo(x, z, altura, g = edificio) {
    // Palmera real venezolana: tronco esbelto claro + capitel verde + penacho radial
    const hTronco = altura * 0.76;
    const hCap = altura * 0.14;
    malla(new THREE.CylinderGeometry(0.2, 0.36, hTronco, ciudad ? 5 : 7), 'tronco', x, hTronco / 2, z, g);
    malla(new THREE.CylinderGeometry(0.24, 0.22, hCap, ciudad ? 5 : 7), 'capitelPalma', x, hTronco + hCap / 2, z, g);
    const yCopa = hTronco + hCap;
    const nHojas = ciudad ? 6 : 11;
    for (let i = 0; i < nHojas; i++) {
      const ang = (i / nHojas) * Math.PI * 2 + (x * 0.13);
      const incl = i % 2 === 0 ? 0.45 : 0.82;
      const len = altura * (i % 2 === 0 ? 0.24 : 0.2);
      const hoja = caja(
        x + Math.cos(ang) * len * 0.48,
        yCopa + (0.65 - incl) * 1.3,
        z + Math.sin(ang) * len * 0.48,
        len,
        0.16,
        0.65,
        'hojaPalma',
        g
      );
      hoja.rotation.y = -ang;
      hoja.rotation.z = -incl + 0.35;
    }
  }

  // ============================================================================
  // 1. ALA NORTE — PALACIO FEDERAL Y SALÓN ELÍPTICO (z = -52..-31, x = -45..+45)
  // ============================================================================
  const zNorteCentro = -42.5;
  const hOrdenN = 9.4;
  const hEntabN = 11.1;

  // 1A. Cuerpo central del Salón Elíptico (núcleo ovalado E–O: rx=14.4, rz=9.2)
  const salonEliptico = grupo(0, zNorteCentro, 0, 'Salón Elíptico');
  const tamborBase = malla(
    new THREE.CylinderGeometry(1, 1, hEntabN, segCupulaU),
    'muro',
    0,
    hEntabN / 2,
    0,
    salonEliptico
  );
  tamborBase.scale.set(14.6, 1, 9.4);
  const zocSalon = malla(
    new THREE.CylinderGeometry(1, 1, 1.25, segCupulaU),
    'zocalo',
    0,
    0.625,
    0,
    salonEliptico
  );
  zocSalon.scale.set(14.9, 1, 9.7);

  // Pórtico curvo NORTE del Salón Elíptico (hacia -Z: columnas corintias, cariátides y balaustrada)
  const rxPortN = 15.8;
  const rzPortN = 10.6;
  const nArcoN = ciudad ? 10 : 20;
  // Entablamento curvo y losa del pórtico norte
  const sCanopyN = new THREE.Shape();
  sCanopyN.moveTo(-15.8, 0);
  for (let i = 0; i <= nArcoN; i++) {
    const a = Math.PI + (i / nArcoN) * Math.PI;
    sCanopyN.lineTo(Math.cos(a) * rxPortN, Math.sin(a) * rzPortN);
  }
  sCanopyN.lineTo(15.8, 0);
  sCanopyN.closePath();
  const losaPorticoN = extruir(sCanopyN, 1.55, 'cal', 0, hEntabN, 0, salonEliptico);
  losaPorticoN.rotation.x = Math.PI / 2;

  // Escalinata norte de acceso al Palacio Federal
  for (let e = 0; e < 5; e++) {
    const sc = 1 + (4 - e) * 0.045;
    const esc = malla(
      new THREE.CylinderGeometry(1, 1, 0.24, segCupulaU, 1, false, Math.PI * 0.55, Math.PI * 0.9),
      'piedra',
      0,
      0.12 + e * 0.24,
      0,
      salonEliptico
    );
    esc.scale.set(rxPortN * sc, 1, rzPortN * sc);
    esc.rotation.y = Math.PI;
  }

  // Columnas corintias del pórtico curvo norte + 2 cariátides (La Ley y La Justicia) en el centro
  const angsColN = [-0.42, -0.31, -0.2, -0.1, 0.1, 0.2, 0.31, 0.42];
  for (const frac of angsColN) {
    const a = -Math.PI / 2 + frac * Math.PI;
    const cx = Math.cos(a) * (rxPortN - 0.65);
    const cz = Math.sin(a) * (rzPortN - 0.65);
    if (Math.abs(frac) < 0.13) {
      cariatide(cx, 1.2, cz, Math.PI, salonEliptico);
    } else {
      columnaCorintia(cx, 1.2, cz, hOrdenN - 1.2, 0.44, salonEliptico);
    }
  }
  // Puertas y ventanas arqueadas en el muro norte del Salón Elíptico
  for (const frac of [-0.26, -0.14, 0, 0.14, 0.26]) {
    const a = -Math.PI / 2 + frac * Math.PI;
    const cx = Math.cos(a) * 14.55;
    const cz = Math.sin(a) * 9.35;
    const rot = Math.atan2(cx / (14.6 * 14.6), cz / (9.4 * 9.4));
    vanoArqueado(cx, 1.35, cz, Math.abs(frac) < 0.05 ? 2.8 : 2.0, 5.2, rot, Math.abs(frac) < 0.18, salonEliptico);
  }
  // Balaustrada curva norte y remate central con Escudo Nacional (segmentos exactos sobre el arco)
  const nBalN = ciudad ? 10 : 22;
  const ptsBalN = [];
  for (let i = 0; i <= nBalN; i++) {
    const a = -Math.PI * 0.94 + (i / nBalN) * Math.PI * 0.88;
    const bx = Math.cos(a) * (rxPortN - 0.35);
    const bz = Math.sin(a) * (rzPortN - 0.35);
    ptsBalN.push([bx, bz]);
    caja(bx, hEntabN + 0.55, bz, 0.24, 0.98, 0.24, 'cal', salonEliptico);
  }
  for (let i = 0; i < ptsBalN.length - 1; i++) {
    const [x0, z0] = ptsBalN[i];
    const [x1, z1] = ptsBalN[i + 1];
    barra([x0, hEntabN + 1.08, z0], [x1, hEntabN + 1.08, z1], 0.14, 'cal', salonEliptico);
    barra([x0, hEntabN + 0.14, z0], [x1, hEntabN + 0.14, z1], 0.15, 'cal', salonEliptico);
  }
  // Remate central con escudo nacional sobre el pórtico norte
  caja(0, hEntabN + 1.15, -rzPortN + 0.25, 5.2, 2.2, 0.65, 'cal', salonEliptico);
  malla(new THREE.CylinderGeometry(1.18, 1.18, 0.26, 14), 'bronce', 0, hEntabN + 1.2, -rzPortN - 0.08, salonEliptico).rotation.x = Math.PI / 2;
  malla(new THREE.CylinderGeometry(0.75, 0.75, 0.32, 12), 'oro', 0, hEntabN + 1.2, -rzPortN - 0.12, salonEliptico).rotation.x = Math.PI / 2;
  malla(new THREE.TorusGeometry(1.5, 0.22, 6, 14, Math.PI), 'cal', 0, hEntabN + 2.15, -rzPortN + 0.25, salonEliptico);

  // Pórtico curvo SUR del Salón Elíptico (hacia el patio +Z, con gran escalinata — foto 73f1ad4b!)
  const rxPortS = 15.6;
  const rzPortS = 11.4;
  const sCanopyS = new THREE.Shape();
  sCanopyS.moveTo(-15.6, 0);
  for (let i = 0; i <= nArcoN; i++) {
    const a = (i / nArcoN) * Math.PI;
    sCanopyS.lineTo(Math.cos(a) * rxPortS, Math.sin(a) * rzPortS);
  }
  sCanopyS.lineTo(15.6, 0);
  sCanopyS.closePath();
  const losaPorticoS = extruir(sCanopyS, 1.25, 'cal', 0, hEntabN - 0.2, 0, salonEliptico);
  losaPorticoS.rotation.x = Math.PI / 2;
  // Plataforma alta de la terraza sur (y = 2.6 m)
  const platS = extruir(sCanopyS, 2.6, 'piedra', 0, 2.6, 0, salonEliptico);
  platS.rotation.x = Math.PI / 2;
  // Columnas corintias de la terraza sur mirando al patio
  for (const frac of [-0.36, -0.22, -0.075, 0.075, 0.22, 0.36]) {
    const a = Math.PI / 2 + frac * Math.PI;
    const cx = Math.cos(a) * (rxPortS - 0.75);
    const cz = Math.sin(a) * (rzPortS - 0.75);
    columnaCorintia(cx, 2.6, cz, hOrdenN - 2.35, 0.38, salonEliptico);
  }
  // Medallón circular del Escudo de Venezuela y dos puertas arqueadas flanqueándolo (foto 73f1ad4b!)
  malla(new THREE.CylinderGeometry(1.75, 1.75, 0.22, 16), 'cal', 0, 6.2, 9.48, salonEliptico).rotation.x = Math.PI / 2;
  malla(new THREE.CylinderGeometry(1.15, 1.15, 0.28, 12), 'oro', 0, 6.2, 9.58, salonEliptico).rotation.x = Math.PI / 2;
  for (const sgn of [-1, 1]) {
    const a = Math.PI / 2 + sgn * 0.16 * Math.PI;
    const cx = Math.cos(a) * 14.5;
    const cz = Math.sin(a) * 9.35;
    vanoArqueado(cx, 2.7, cz, 2.2, 4.7, sgn * 0.34, true, salonEliptico);
  }
  // Gran escalinata monumental bajando de la terraza curva al patio central (12 peldaños)
  const nPel = ciudad ? 7 : 12;
  for (let i = 0; i < nPel; i++) {
    const t = i / (nPel - 1);
    const yPel = 2.5 - t * 2.42;
    const zPel = rzPortS - 0.4 + t * 6.4;
    const wPel = 21.0 + t * 3.0;
    caja(0, yPel / 2, zPel, wPel, yPel, 0.72, 'piedra', salonEliptico);
  }
  // Barandas inclinadas flanqueando la gran escalinata
  for (const sgn of [-1, 1]) {
    const bar = caja(sgn * 11.4, 1.85, rzPortS + 2.8, 0.52, 1.15, 7.2, 'cal', salonEliptico);
    bar.rotation.x = 0.34;
    caja(sgn * 12.1, 0.65, rzPortS + 6.4, 0.9, 1.3, 0.9, 'cal', salonEliptico);
  }

  // 1B. Alas laterales columnadas del Palacio Federal (Este y Oeste del Salón Elíptico)
  for (const sgn of [-1, 1]) {
    const cxAla = sgn * 24.5;
    // Cuerpo interior retrasado tras el peristilo norte
    caja(cxAla, hEntabN / 2, -41.5, 20.5, hEntabN, 12.8, 'muro');
    caja(cxAla, 0.6, -41.5, 20.8, 1.2, 13.1, 'zocalo');
    // Entablamento volado y pretil perimetral hueco dejando ver la cubierta roja (foto congreso2.jpeg!)
    caja(cxAla, hOrdenN + 0.85, -43.0, 21.0, 1.7, 16.0, 'cal');
    // Pretiles en los 4 bordes del ala norte
    caja(cxAla, hEntabN + 0.9, -50.5, 20.6, 1.8, 0.65, 'muro');
    caja(cxAla, hEntabN + 1.85, -50.5, 21.1, 0.28, 0.95, 'cal');
    caja(cxAla, hEntabN + 0.75, -35.5, 20.6, 1.5, 0.65, 'muro');
    caja(cxAla, hEntabN + 1.55, -35.5, 21.1, 0.26, 0.9, 'cal');
    // Techo de cubierta metálica roja / terraza (en cubiertas)
    caja(cxAla, hEntabN + 0.35, -43.0, 19.8, 0.32, 14.2, 'techoRojo', cubiertas);
    // Plataforma y 5 columnas corintias en la fachada norte (como en istockphoto y congreso-1930!)
    caja(cxAla, 0.6, -49.2, 20.6, 1.2, 3.6, 'piedra');
    for (let i = 0; i < 5; i++) {
      const xCol = sgn * (16.5 + i * 4.0);
      columnaCorintia(xCol, 1.2, -50.1, hOrdenN - 1.2, 0.42);
    }
    // Ventanas arqueadas con reja detrás de las columnas norte y en la cara al patio
    for (let i = 0; i < 4; i++) {
      const xv = sgn * (18.5 + i * 4.0);
      vanoArqueado(xv, 1.5, -47.95, 2.0, 5.1, Math.PI, false);
      vanoArqueado(xv, 1.5, -35.05, 1.9, 4.9, 0, false);
    }
  }

  // 1C. Pabellones de esquina NE y NW con FRONTONES TRIANGULARES (foto congreso-1930 y congreso2!)
  for (const sgn of [-1, 1]) {
    const cxPab = sgn * 39.8;
    const pab = grupo(cxPab, -43.0, 0, sgn > 0 ? 'Pabellón Noreste' : 'Pabellón Noroeste');
    caja(0, hEntabN / 2, 0, 10.6, hEntabN, 17.2, 'muro', pab);
    caja(0, 0.62, 0, 11.0, 1.24, 17.6, 'zocalo', pab);
    caja(0, hOrdenN + 0.85, 0, 11.4, 1.7, 18.0, 'cal', pab);
    // Pilastras corintias pareadas y almohadillado en las esquinas
    for (const dx of [-4.6, -2.5, 2.5, 4.6]) {
      caja(dx, 5.2, -8.72, 0.72, 8.2, 0.34, 'cal', pab);
      caja(dx, 9.15, -8.76, 0.96, 0.55, 0.44, 'bronce', pab);
    }
    for (const dz of [-7.6, -3.0, 3.0, 7.6]) {
      caja(sgn * 5.42, 5.2, dz, 0.34, 8.2, 0.72, 'cal', pab);
      caja(sgn * 5.46, 9.15, dz, 0.44, 0.55, 0.96, 'bronce', pab);
    }
    // Portada arqueada lateral (hacia Este en NE, hacia Oeste en NW) con escalinata (foto congreso-1930!)
    vanoArqueado(sgn * 5.38, 1.4, 0, 2.5, 5.2, sgn * Math.PI / 2, true, pab);
    for (let e = 0; e < 4; e++) {
      caja(sgn * (5.9 + e * 0.42), 0.15 + (3 - e) * 0.26, 0, 0.5, 0.3 + (3 - e) * 0.52, 4.4, 'piedra', pab);
    }
    // Ventanas arqueadas en cara norte del pabellón
    for (const dx of [-2.4, 2.4]) {
      vanoArqueado(dx, 1.5, -8.68, 2.0, 5.1, Math.PI, false, pab);
    }
    // Frontón triangular clásico mirando al Este (en NE) y al Oeste (en NW)
    frontonTriangular(sgn * 5.2, hEntabN + 0.15, 0, 17.2, 3.1, 0.9, sgn * Math.PI / 2, pab);
    // Ático norte del pabellón
    caja(0, hEntabN + 0.95, -8.3, 10.8, 1.8, 0.65, 'muro', pab);
    caja(0, hEntabN + 1.9, -8.3, 11.2, 0.28, 0.95, 'cal', pab);
    // Cubierta del pabellón (en cubiertas)
    caja(0, hEntabN + 1.25, 0, 9.8, 0.35, 16.0, esBlancoModerno ? 'techoRojo' : 'techoPlano', cubiertas);
    const techPab = cubiertas.children[cubiertas.children.length - 1];
    techPab.position.set(cxPab, hEntabN + 1.25, -43.0);
  }

  // 1D. LA CÚPULA ELÍPTICA DEL SALÓN ELÍPTICO (en cubiertas, evoluciona fielmente por fecha!)
  const cupulaGrupo = grupo(0, zNorteCentro, 0, 'Cúpula del Salón Elíptico', cubiertas);
  // Losa base elíptica sobre el Salón Elíptico
  const losaElip = malla(new THREE.CylinderGeometry(1, 1, 0.5, segCupulaU), 'techoPlano', 0, hEntabN + 0.25, 0, cupulaGrupo);
  losaElip.scale.set(14.0, 1, 8.9);

  if (etapa.cupula === 'original-1877') {
    // 1889: Bóveda elíptica achatada original de Luciano Urdaneta (antes de Malaussena 1890–1891)
    const tambor = malla(new THREE.CylinderGeometry(1, 1, 1.2, segCupulaU), 'cal', 0, hEntabN + 0.8, 0, cupulaGrupo);
    tambor.scale.set(12.2, 1, 7.8);
    const boveda = malla(
      new THREE.SphereGeometry(1, segCupulaU, segCupulaV, 0, Math.PI * 2, 0, Math.PI * 0.5),
      'zinc',
      0,
      hEntabN + 1.35,
      0,
      cupulaGrupo
    );
    boveda.scale.set(12.1, 3.7, 7.7);
    // Lucernario bajo de coronación + pequeña asta
    const luc = malla(new THREE.CylinderGeometry(1, 1, 1.15, 16), 'cal', 0, hEntabN + 5.15, 0, cupulaGrupo);
    luc.scale.set(2.8, 1, 1.8);
    const cap = malla(
      new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      'zincClaro',
      0,
      hEntabN + 5.7,
      0,
      cupulaGrupo
    );
    cap.scale.set(2.9, 0.8, 1.9);
    banderaVenezuela(0, hEntabN + 6.45, 0, 4.2, cupulaGrupo);
  } else if (etapa.cupula === 'belga-1890') {
    // 1911 y 1936: Sobrecúpula metálica belga de Antonio Malaussena (hierro y zinc) + linterna calada (foto congreso-1930!)
    const tambor = malla(new THREE.CylinderGeometry(1, 1, 1.45, segCupulaU), 'cal', 0, hEntabN + 0.9, 0, cupulaGrupo);
    tambor.scale.set(12.6, 1, 8.2);
    const domo = malla(
      new THREE.SphereGeometry(1, segCupulaU, segCupulaV, 0, Math.PI * 2, 0, Math.PI * 0.5),
      'zinc',
      0,
      hEntabN + 1.6,
      0,
      cupulaGrupo
    );
    domo.scale.set(12.5, 5.5, 8.1);
    // Costillas meridianas de hierro forjado
    const nCost = ciudad ? 10 : 18;
    for (let i = 0; i < nCost; i++) {
      const a = (i / nCost) * Math.PI * 2;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const phi = (k / 6) * Math.PI * 0.48;
        pts.push([
          Math.cos(a) * Math.sin(phi) * 12.62,
          hEntabN + 1.6 + Math.cos(phi) * 5.58,
          Math.sin(a) * Math.sin(phi) * 8.22,
        ]);
      }
      for (let k = 0; k < pts.length - 1; k++) barra(pts[k], pts[k + 1], 0.085, 'zincClaro', cupulaGrupo);
    }
    // Linterna calada ornamental (congreso-1930.jpg: tambor alto con persianas bajas, rosetones arriba y cornisa)
    const yLint = hEntabN + 6.9;
    const rxL = 3.2;
    const rzL = 2.4;
    const hLint = 4.1;
    // Cuerpo interior calado
    const nuc = malla(new THREE.CylinderGeometry(1, 1, hLint * 0.55, 16), 'linterna', 0, yLint + hLint * 0.28, 0, cupulaGrupo);
    nuc.scale.set(rxL * 0.92, 1, rzL * 0.92);
    const osc = malla(new THREE.CylinderGeometry(1, 1, hLint * 0.42, 16), 'oscuro', 0, yLint + hLint * 0.74, 0, cupulaGrupo);
    osc.scale.set(rxL * 0.82, 1, rzL * 0.82);
    // Anillos de base, imposta y cornisa volada de la linterna
    for (const [yy, sc] of [[yLint + 0.1, 1.06], [yLint + hLint * 0.52, 1.04], [yLint + hLint, 1.14]]) {
      const an = malla(new THREE.CylinderGeometry(1, 1, 0.24, 16), 'cal', 0, yy, 0, cupulaGrupo);
      an.scale.set(rxL * sc, 1, rzL * sc);
    }
    // Montantes verticales y rosetones calados superiores (rasgo distintivo en congreso-1930.jpg)
    const nMon = ciudad ? 8 : 14;
    for (let i = 0; i < nMon; i++) {
      const a = (i / nMon) * Math.PI * 2;
      const mx = Math.cos(a) * rxL;
      const mz = Math.sin(a) * rzL;
      caja(mx, yLint + hLint * 0.5, mz, 0.18, hLint, 0.18, 'cal', cupulaGrupo);
      if (!ciudad) {
        const aMid = ((i + 0.5) / nMon) * Math.PI * 2;
        const ros = malla(
          new THREE.TorusGeometry(0.46, 0.08, 4, 10),
          'cal',
          Math.cos(aMid) * rxL * 0.96,
          yLint + hLint * 0.74,
          Math.sin(aMid) * rzL * 0.96,
          cupulaGrupo
        );
        ros.rotation.y = -aMid + Math.PI / 2;
      }
    }
    // Remate bajo y asta con bandera
    const capB = malla(
      new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      'zincClaro',
      0,
      yLint + hLint + 0.08,
      0,
      cupulaGrupo
    );
    capB.scale.set(rxL * 0.95, 0.95, rzL * 0.95);
    banderaVenezuela(0, yLint + hLint + 0.95, 0, 5.2, cupulaGrupo);
  } else {
    // 1958+: Sobrecúpula elíptica dorada de aluminio anodizado + tambor de celosía + cupulín dorado
    // (cotejo directo con 14407977-4632652c.jpg, congreso2.jpeg, 73f1ad4b...jpg e istockphoto!)
    const tambor = malla(new THREE.CylinderGeometry(1, 1, 1.85, segCupulaU), 'cal', 0, hEntabN + 1.05, 0, cupulaGrupo);
    tambor.scale.set(13.1, 1, 8.7);
    const cornTamb = malla(new THREE.CylinderGeometry(1, 1, 0.32, segCupulaU), 'cal', 0, hEntabN + 2.02, 0, cupulaGrupo);
    cornTamb.scale.set(13.4, 1, 9.0);

    const domoOro = malla(
      new THREE.SphereGeometry(1, segCupulaU, segCupulaV, 0, Math.PI * 2, 0, Math.PI * 0.5),
      'oro',
      0,
      hEntabN + 2.05,
      0,
      cupulaGrupo
    );
    domoOro.scale.set(13.0, 7.6, 8.6);

    // Costillas meridianas doradas y anillos horizontales de planchas de aluminio anodizado
    const nCost = ciudad ? 12 : 24;
    for (let i = 0; i < nCost; i++) {
      const a = (i / nCost) * Math.PI * 2;
      const pts = [];
      for (let k = 0; k <= 7; k++) {
        const phi = 0.26 + (k / 7) * (Math.PI * 0.49 - 0.26);
        pts.push([
          Math.cos(a) * Math.sin(phi) * 13.1,
          hEntabN + 2.05 + Math.cos(phi) * 7.66,
          Math.sin(a) * Math.sin(phi) * 8.7,
        ]);
      }
      for (let k = 0; k < pts.length - 1; k++) barra(pts[k], pts[k + 1], 0.08, 'oroBrillo', cupulaGrupo);
    }
    for (const phi of [0.55, 0.9, 1.25]) {
      const anillo = malla(
        new THREE.TorusGeometry(1, 0.008, 4, segCupulaU),
        'oroBrillo',
        0,
        hEntabN + 2.05 + Math.cos(phi) * 7.62,
        0,
        cupulaGrupo
      );
      anillo.rotation.x = Math.PI / 2;
      anillo.scale.set(Math.sin(phi) * 13.08, Math.sin(phi) * 8.68, 8);
    }

    // Tambor elíptico de celosía metálica (linterna) + cupulín ovoidal dorado
    const yLint = hEntabN + 9.2;
    const rxL = 3.25;
    const rzL = 2.45;
    const hLint = 3.9;
    const baseL = malla(new THREE.CylinderGeometry(1, 1, 0.55, 18), 'cal', 0, yLint + 0.1, 0, cupulaGrupo);
    baseL.scale.set(rxL * 1.08, 1, rzL * 1.08);
    const celosia = malla(new THREE.CylinderGeometry(1, 1, hLint, 20), 'linterna', 0, yLint + hLint / 2 + 0.25, 0, cupulaGrupo);
    celosia.scale.set(rxL, 1, rzL);
    // Nervios verticales dorados en el tambor de la linterna
    const nNerv = ciudad ? 8 : 14;
    for (let i = 0; i < nNerv; i++) {
      const a = (i / nNerv) * Math.PI * 2;
      caja(Math.cos(a) * (rxL + 0.04), yLint + hLint / 2 + 0.25, Math.sin(a) * (rzL + 0.04), 0.14, hLint, 0.14, 'oroBrillo', cupulaGrupo);
    }
    const collarSup = malla(new THREE.CylinderGeometry(1, 1, 0.34, 18), 'oroBrillo', 0, yLint + hLint + 0.35, 0, cupulaGrupo);
    collarSup.scale.set(rxL * 1.06, 1, rzL * 1.06);
    const cupulin = malla(
      new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
      'oro',
      0,
      yLint + hLint + 0.45,
      0,
      cupulaGrupo
    );
    cupulin.scale.set(rxL * 1.03, 3.1, rzL * 1.03);
    banderaVenezuela(0, yLint + hLint + 3.45, 0, 5.4, cupulaGrupo);
  }

  // ============================================================================
  // 2. ALA SUR — PALACIO LEGISLATIVO (1873, z = +35..+52, x = -45..+45)
  // ============================================================================
  const alaSur = grupo(0, 43.5, 0, 'Ala Sur · Palacio Legislativo');
  const hSur = 10.6;
  // Cuerpo principal rectangular (90 × 15.6 m)
  caja(0, hSur / 2, 0, 90.0, hSur, 15.6, 'muro', alaSur);
  caja(0, 0.55, 0, 90.4, 1.1, 16.0, 'zocalo', alaSur);
  caja(0, hSur - 0.5, 0, 90.8, 1.1, 16.4, 'cal', alaSur);
  balaustrada(0, hSur + 0.05, 7.9, 89.0, 0, alaSur);
  balaustrada(0, hSur + 0.05, -7.9, 89.0, 0, alaSur);

  // Pórtico central monumental mirando al SUR (+Z, Avenida Universidad / Palacio de las Academias)
  caja(0, hSur - 0.5, 9.6, 30.0, 1.4, 4.4, 'cal', alaSur);
  caja(0, 0.55, 9.6, 30.4, 1.1, 4.8, 'piedra', alaSur);
  for (let i = 0; i < 8; i++) {
    const xc = -13.3 + (i / 7) * 26.6;
    columnaCorintia(xc, 1.1, 11.2, hSur - 2.25, 0.42, alaSur);
  }
  // Escalinata de acceso sur
  for (let e = 0; e < 5; e++) {
    caja(0, 0.12 + e * 0.2, 12.2 + (4 - e) * 0.45, 29.0 + (4 - e) * 0.6, 0.24, 0.52, 'piedra', alaSur);
  }
  // Frontón / remate central del Palacio Legislativo
  frontonTriangular(0, hSur + 0.25, 11.3, 18.0, 2.8, 0.9, 0, alaSur);
  // Tres portales monumentales bajo el pórtico sur
  for (const xp of [-7.0, 0, 7.0]) {
    vanoArqueado(xp, 1.2, 7.86, 2.5, 5.4, 0, true, alaSur);
  }
  // Ventanas arqueadas en las alas laterales sur y en el frente al patio (-Z)
  for (const sgn of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const xv = sgn * (18.5 + i * 5.1);
      vanoArqueado(xv, 1.4, 7.86, 2.0, 5.0, 0, false, alaSur);
      caja(xv - sgn * 2.55, 5.1, 7.9, 0.65, 8.2, 0.28, 'cal', alaSur);
    }
    // Pabellones de esquina SE y SW ligeramente sobresalientes
    caja(sgn * 40.5, hSur / 2 + 0.4, 0, 9.6, hSur + 0.8, 16.6, 'muro', alaSur);
    caja(sgn * 40.5, hSur + 0.85, 0, 10.2, 0.4, 17.2, 'cal', alaSur);
    frontonTriangular(sgn * 45.2, hSur + 0.8, 0, 16.2, 2.4, 0.75, sgn * Math.PI / 2, alaSur);
  }
  // Galería neoclásica hacia el patio central (-Z local)
  caja(0, 0.4, -9.2, 62.0, 0.8, 3.2, 'piedra', alaSur);
  caja(0, hSur - 0.5, -9.2, 62.0, 1.1, 3.4, 'cal', alaSur);
  const nColPatioS = ciudad ? 9 : 15;
  for (let i = 0; i < nColPatioS; i++) {
    const xc = -29.0 + (i / (nColPatioS - 1)) * 58.0;
    columnaCorintia(xc, 0.8, -10.3, hSur - 1.8, 0.34, alaSur);
  }
  for (let i = 0; i < 9; i++) {
    const xv = -24.0 + i * 6.0;
    vanoArqueado(xv, 1.1, -7.86, 2.1, 5.1, Math.PI, i === 4, alaSur);
  }

  // Cubierta inclinada roja del Ala Sur (en cubiertas)
  const techoSurG = grupo(0, 43.5, 0, 'Cubierta Ala Sur', cubiertas);
  const sTS = new THREE.Shape();
  sTS.moveTo(-7.2, 0);
  sTS.lineTo(0, 2.3);
  sTS.lineTo(7.2, 0);
  sTS.closePath();
  const mTS = extruir(sTS, 86.0, 'techoRojo', -43.0, hSur + 0.1, 0, techoSurG);
  mTS.rotation.y = Math.PI / 2;

  // ============================================================================
  // 3. ALA ESTE — DOS CUERPOS DE DOS PISOS + ARCO CEREMONIAL + JARDÍN DE CALLE
  //    (cotejo directo con 14407977-4632652c.jpg y congreso2.jpeg)
  // ============================================================================
  const hLat = 10.1;
  for (const [nombre, zCentro, largo] of [
    ['Ala Este · Bloque Norte', -20.5, 28.0],
    ['Ala Este · Bloque Sur', 20.5, 29.0],
  ]) {
    const bE = grupo(33.2, zCentro, 0, nombre);
    // Cuerpo de dos niveles (11.6 m de fondo × largo)
    caja(0, hLat / 2, 0, 11.6, hLat, largo, 'muro', bE);
    caja(0, 0.45, 0, 12.0, 0.9, largo + 0.4, 'zocalo', bE);
    // Imposta entre primer y segundo nivel + cornisa + pretil
    caja(0, 5.2, 0, 12.0, 0.28, largo + 0.4, 'cal', bE);
    caja(0, hLat - 0.35, 0, 12.3, 0.75, largo + 0.6, 'cal', bE);
    caja(0, hLat + 0.55, 0, 11.9, 1.05, largo + 0.2, 'cal', bE);
    // Dos niveles de ventanas y pilastras hacia calle Este (+X) y hacia patio (-X)
    const nVen = Math.max(4, Math.round(largo / 4.8));
    for (let i = 0; i < nVen; i++) {
      const zv = -largo / 2 + 2.6 + (i / (nVen - 1)) * (largo - 5.2);
      vanoArqueado(5.86, 1.15, zv, 1.65, 3.25, Math.PI / 2, false, bE);
      vanoArqueado(5.86, 5.85, zv, 1.55, 2.95, Math.PI / 2, false, bE);
      vanoArqueado(-5.86, 1.15, zv, 1.65, 3.25, -Math.PI / 2, false, bE);
      vanoArqueado(-5.86, 5.85, zv, 1.55, 2.95, -Math.PI / 2, false, bE);
      caja(5.9, hLat / 2, zv + 2.3, 0.26, hLat - 0.8, 0.55, 'cal', bE);
    }
    // Corredor porticado hacia el patio central (-X)
    caja(-7.3, 0.3, 0, 3.0, 0.6, largo, 'piedra', bE);
    caja(-7.3, 5.15, 0, 3.0, 0.35, largo, 'cal', bE);
    caja(-7.3, hLat - 0.35, 0, 3.2, 0.65, largo, 'cal', bE);
    for (let i = 0; i <= nVen; i++) {
      const zp = -largo / 2 + 0.8 + (i / nVen) * (largo - 1.6);
      caja(-8.5, 2.7, zp, 0.48, 4.5, 0.48, 'cal', bE);
      caja(-8.5, 7.45, zp, 0.42, 4.3, 0.42, 'cal', bE);
    }
    // Cubierta roja a dos aguas (claramente visible en 14407977-4632652c.jpg y congreso2.jpeg!)
    const sTE = new THREE.Shape();
    sTE.moveTo(-5.4, 0);
    sTE.lineTo(0, 2.35);
    sTE.lineTo(5.4, 0);
    sTE.closePath();
    extruir(sTE, largo - 0.8, 'techoRojo', 33.2, hLat + 0.15, zCentro - (largo - 0.8) / 2, cubiertas);
  }

  // Arco Ceremonial de Entrada Oriental (entre los dos bloques del Ala Este, z = -6.5..+6.0)
  const arcoEste = grupo(33.5, -0.25, 0, 'Arco Ceremonial Oriental');
  // Dos pilares monumentales + arco de paso central + parapeto curvo ascendente (foto aérea!)
  for (const sgn of [-1, 1]) {
    caja(0, 4.6, sgn * 5.4, 4.6, 9.2, 2.4, 'cal', arcoEste);
    caja(0, 9.4, sgn * 5.4, 5.0, 0.55, 2.8, 'cal', arcoEste);
  }
  const sArcoE = new THREE.Shape();
  sArcoE.moveTo(-5.8, 0);
  sArcoE.lineTo(-5.8, 10.6);
  sArcoE.quadraticCurveTo(0, 12.6, 5.8, 10.6);
  sArcoE.lineTo(5.8, 0);
  sArcoE.lineTo(4.1, 0);
  sArcoE.lineTo(4.1, 5.2);
  sArcoE.absarc(0, 5.2, 4.1, 0, Math.PI, false);
  sArcoE.lineTo(-4.1, 0);
  sArcoE.closePath();
  const mArcoE = extruir(sArcoE, 2.6, 'cal', -1.3, 0, 0, arcoEste);
  mArcoE.rotation.y = Math.PI / 2;
  // Pavimento de acceso atravesando el arco
  caja(3.0, 0.08, 0, 18.0, 0.16, 8.6, 'sendero', arcoEste);

  // Jardín frontal del costado Este + pequeña fuente octogonal + verja de hierro (foto aérea!)
  for (const [jz, jLargo] of [[-20.5, 24.5], [20.5, 25.0]]) {
    caja(42.2, 0.1, jz, 5.8, 0.16, jLargo, 'cesped');
    caja(42.2, 0.24, jz, 4.0, 0.18, jLargo - 4.0, 'seto');
    verjaHierro(45.5, jz, jLargo + 1.5, Math.PI / 2);
  }
  // Pequeña fuente en el jardín este-norte (visible en 14407977-4632652c.jpg)
  malla(new THREE.CylinderGeometry(1.75, 1.9, 0.55, 8), 'piedra', 42.2, 0.35, -20.5);
  malla(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 8), 'agua', 42.2, 0.6, -20.5);
  malla(new THREE.CylinderGeometry(0.32, 0.45, 1.0, 8), 'cal', 42.2, 0.9, -20.5);

  // ============================================================================
  // 4. ALA OESTE — CUERPO CONTINUO DE DOS PISOS (x = -45..-31, z = -35..+35)
  // ============================================================================
  const alaOeste = grupo(-38.0, 0, 0, 'Ala Oeste');
  const largoOeste = 70.0;
  caja(0, hLat / 2, 0, 13.6, hLat, largoOeste, 'muro', alaOeste);
  caja(0, 0.45, 0, 14.0, 0.9, largoOeste + 0.4, 'zocalo', alaOeste);
  caja(0, 5.2, 0, 14.0, 0.28, largoOeste + 0.4, 'cal', alaOeste);
  caja(0, hLat - 0.35, 0, 14.3, 0.75, largoOeste + 0.6, 'cal', alaOeste);
  caja(0, hLat + 0.55, 0, 13.9, 1.05, largoOeste + 0.2, 'cal', alaOeste);

  const nVenO = 12;
  for (let i = 0; i < nVenO; i++) {
    const zv = -30.5 + (i / (nVenO - 1)) * 61.0;
    const esCentro = Math.abs(zv) < 3.5;
    vanoArqueado(-6.86, 1.15, zv, esCentro ? 2.4 : 1.7, esCentro ? 4.2 : 3.25, -Math.PI / 2, esCentro, alaOeste);
    vanoArqueado(-6.86, 5.85, zv, 1.6, 2.95, -Math.PI / 2, false, alaOeste);
    vanoArqueado(6.86, 1.15, zv, 1.7, 3.25, Math.PI / 2, esCentro, alaOeste);
    vanoArqueado(6.86, 5.85, zv, 1.6, 2.95, Math.PI / 2, false, alaOeste);
    caja(-6.9, hLat / 2, zv + 2.75, 0.26, hLat - 0.8, 0.55, 'cal', alaOeste);
  }
  // Galería interior de dos niveles hacia el patio central (+X)
  caja(8.4, 0.3, 0, 3.2, 0.6, largoOeste, 'piedra', alaOeste);
  caja(8.4, 5.15, 0, 3.2, 0.35, largoOeste, 'cal', alaOeste);
  caja(8.4, hLat - 0.35, 0, 3.4, 0.65, largoOeste, 'cal', alaOeste);
  for (let i = 0; i <= nVenO; i++) {
    const zp = -33.0 + (i / nVenO) * 66.0;
    caja(9.6, 2.7, zp, 0.48, 4.5, 0.48, 'cal', alaOeste);
    caja(9.6, 7.45, zp, 0.42, 4.3, 0.42, 'cal', alaOeste);
  }
  // Cubierta del Ala Oeste (en cubiertas)
  caja(-38.0, hLat + 0.45, 0, 12.6, 0.3, largoOeste - 1.0, 'techoPlano', cubiertas);

  // ============================================================================
  // 5. PATIO CENTRAL AJARDINADO, FUENTE DE 1875 Y CHAGUARAMOS
  // ============================================================================
  const patioCentral = grupo(-1.5, 4.0, 0, 'Patio Central');
  // Solado base del patio (55 × 58 m)
  caja(0, 0.06, 0, 55.0, 0.12, 58.0, 'patio', patioCentral);
  // Cuatro grandes canteros ajardinados con brocal
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      caja(sx * 14.2, 0.14, sz * 15.2, 20.0, 0.16, 21.0, 'piedra', patioCentral);
      caja(sx * 14.2, 0.19, sz * 15.2, 19.0, 0.14, 20.0, 'cesped', patioCentral);
    }
  }
  // Plaza circular central y paseos axiales pavimentados
  malla(new THREE.CylinderGeometry(10.2, 10.4, 0.18, ciudad ? 14 : 28), 'sendero', 0, 0.11, 0, patioCentral);
  caja(0, 0.12, 0, 6.8, 0.16, 56.0, 'sendero', patioCentral);
  caja(0, 0.12, -4.2, 54.0, 0.16, 6.4, 'sendero', patioCentral);

  // Fuente ornamental de hierro fundido (1875, The Crumlin Viaduct Works / Manuel María Urbaneja)
  const fuente = grupo(0, 0, 0, 'Fuente Ornamental de 1875', patioCentral);
  malla(new THREE.CylinderGeometry(4.4, 4.7, 0.72, ciudad ? 10 : 16), 'piedra', 0, 0.44, 0, fuente);
  malla(new THREE.CylinderGeometry(3.8, 3.8, 0.14, ciudad ? 10 : 16), 'agua', 0, 0.76, 0, fuente);
  malla(new THREE.CylinderGeometry(0.95, 1.35, 1.45, 10), 'bronce', 0, 1.35, 0, fuente);
  malla(new THREE.CylinderGeometry(2.35, 0.85, 0.48, 12), 'bronce', 0, 2.25, 0, fuente);
  malla(new THREE.CylinderGeometry(1.95, 1.95, 0.1, 12), 'agua', 0, 2.48, 0, fuente);
  malla(new THREE.CylinderGeometry(0.42, 0.62, 1.3, 10), 'bronce', 0, 3.05, 0, fuente);
  malla(new THREE.CylinderGeometry(1.25, 0.45, 0.36, 12), 'bronce', 0, 3.78, 0, fuente);
  malla(new THREE.CylinderGeometry(0.16, 0.28, 0.9, 8), 'bronce', 0, 4.35, 0, fuente);

  // Chaguaramos (palmeras reales): altura fiel a cada fecha (jóvenes en 1889 → majestuosos en 1936/1958)
  const alturaBasePalma = anio === 1889 ? 7.2 : anio === 1911 ? 11.4 : 15.2;
  const palmasPos = ciudad
    ? [
        [-11, -12], [11, -12], [-11, 12], [11, 12],
        [-18, -3], [18, -3], [-18, 18], [18, 18],
      ]
    : [
        [-9.5, -10.5], [9.5, -10.5], [-9.5, 10.5], [9.5, 10.5],
        [-16.5, -18.5], [16.5, -18.5], [-16.5, 18.5], [16.5, 18.5],
        [-18.5, -9.5], [18.5, -9.5], [-18.5, 9.5], [18.5, 9.5],
        [-9.5, -20.5], [9.5, -20.5], [-9.5, 20.5], [9.5, 20.5],
      ];
  palmasPos.forEach(([px, pz], idx) => {
    const varH = ((idx % 3) - 1) * 1.1;
    chaguaramo(px, pz, alturaBasePalma + varH, patioCentral);
  });

  // Verjas perimetrales en el borde norte (como en istockphoto-1294499711) y faroles de época
  verjaHierro(-25.5, -53.2, 26.0, 0);
  verjaHierro(25.5, -53.2, 26.0, 0);
  for (const fx of [-10.5, 10.5, -33.0, 33.0]) {
    malla(new THREE.CylinderGeometry(0.12, 0.22, 3.8, 6), 'hierro', fx, 1.9, -52.2);
    malla(new THREE.SphereGeometry(0.32, 6, 5), 'cal', fx, 4.0, -52.2);
  }

  return finalizar();
}
