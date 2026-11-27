# Instalar los estudios prioritarios de Miraflores en Caracas

## Entrega y límites

[Catálogo y guías por edificio](prioridades/README.md). Los diez modelos se hicieron **primero en Miraflores**, con visor, GLB, capturas y cronología. Estado en [grunch/caracas](https://github.com/grunch/caracas) a 27-11-2026: integrados Nuevo Circo ([#283](https://github.com/grunch/caracas/pull/283)), Circo Metropolitano ([#284](https://github.com/grunch/caracas/pull/284)), La Rotunda y La Concordia ([#285](https://github.com/grunch/caracas/pull/285)), San Agustín ([#286](https://github.com/grunch/caracas/pull/286)), Cementerio de los Hijos de Dios ([#287](https://github.com/grunch/caracas/pull/287)) y Cementerio General del Sur ([#288](https://github.com/grunch/caracas/pull/288)). Pendientes: Santa Rosalía, San Juan y San José ([issue #259](https://github.com/grunch/caracas/issues/259)) y el modelo del Hospital Vargas ([issue #249](https://github.com/grunch/caracas/issues/249); su ficha se corrigió en [#236](https://github.com/grunch/caracas/pull/236)). Las fechas de las marcas se corrigen por separado; ninguna corrección de un nombre certifica el modelo arquitectónico.

El conjunto de La Rotunda y la extensión del Cementerio del Sur son estudios de núcleos, no restituciones completas. Las iglesias con fotografías modernas requieren fechar sus elementos antes de instalarlas. El visor explica estas limitaciones y evita fabricar alzados en épocas indeterminadas.

## Archivos y contrato

Copiar juntos, manteniendo los imports relativos:

- `src/patrimonio-prioritario.js`
- `src/patrimonio-prioritario-datos.js`
- `src/patrimonio-geometria.js`
- `src/patrimonio-templos.js`

Destino: las integraciones fusionadas usan un adaptador por edificio en [`src/hitos/`](https://github.com/grunch/caracas/tree/main/src/hitos) (por ejemplo [`src/hitos/nuevo-circo.js`](https://github.com/grunch/caracas/blob/main/src/hitos/nuevo-circo.js) con sus datos en [`src/hitos/datos/`](https://github.com/grunch/caracas/tree/main/src/hitos/datos)); seguir ese patrón en lugar de una carpeta común. Dependencia: `three`, incluida su utilidad `BufferGeometryUtils`. No copiar el visor, CSS, fotografías de referencia ni exportadores al arranque del mapa.

```js
import {crearPatrimonio} from './estudios-prioritarios/patrimonio-prioritario.js'
import {MAT} from './lienzo.js'

export function patrimonioPrioritario(p, {id, anio}) {
  const {edificio, etapa} = crearPatrimonio({id, anio, nivelDetalle:'ciudad'})
  if (etapa.presente !== true) return
  edificio.updateMatrixWorld(true)
  const geometrias = new Set(), materiales = new Set()
  try {
    edificio.traverse(o => {
      if (!o.isMesh) return
      geometrias.add(o.geometry)
      materiales.add(o.material)
      p.geo(o.geometry.clone().applyMatrix4(o.matrixWorld), {
        color: o.material.color.toArray(), mat: MAT.LISO,
      })
    })
  } finally {
    geometrias.forEach(g => g.dispose())
    materiales.forEach(m => m.dispose())
  }
}
```

Es el mismo patrón del adaptador existente `src/hitos/teatro-municipal.js`. El lienzo se encarga de época, color/tinta y elevación. No añadir meshes persistentes a la escena principal, otro renderer ni un loader GLB por edificio.

**Atención a cubiertas:** el estudio usa superficies anulares abiertas con material de doble cara; el adaptador debe conservar caras visibles por ambos lados si el material del lienzo es de una sola cara (duplicar índices con orientación inversa o generar espesor). Comprobar desde el patio, no solo desde arriba. No convertir la bandera `DoubleSide` en un supuesto de compatibilidad del shader de Caracas.

## Implantación y vida

1. Abrir una rama desde `origin/main` actualizado. Mantener un PR por edificio o cambio independiente, ≤3000 líneas de código sin documentación/tests.
2. Leer `specs/13-reglas-de-construccion.md` y `fuentes/imagenes/README.md` de Caracas. Usar los planos originales para localizar solar, frente y relación con calles.
3. Los modelos tienen **+Z al frente**, +Y vertical y origen nominal en el centro. Esto difiere del frente −Z del Teatro Municipal. Calcular el giro desde el azimut medido; no copiar su orientación sin convertirla.
4. Las coordenadas de las guías son anclas existentes de marcas en píxeles del mosaico DCN. Convertir usando `coords`, nunca tratarlas como metros ni como WGS84. Ajustar dimensiones con evidencia y conservar la calibración en una ficha.
5. Registrar parte en `src/hitos/partes.js`, definición en `src/hitos/datos/` e incorporación a `HITOS`. Definir planta/huella y reserva de casas/árboles con los mismos límites temporales. No ocupar la calzada ni toda la manzana por comodidad.
6. Índices: 1=1772, 2=1843, 3=1889, 4=1911, 5=1936, 6=1946. `muere` es exclusivo. Metropolitano debe vivir en 4–5 (`nace:4,muere:6`); Nuevo Circo en 5–6. Cementerios desde 3; Hijos de Dios cerrado sigue presente. Para Rotunda en 1936 no hay decisión automática sin resolver el corte del mapa.
7. `estadoPatrimonio(...).presente === null` indica evidencia insuficiente, no inexistencia: conservar la explicación en ficha, no reservar un vacío ni fabricar una ruina. Las iglesias anteriores a su fachada reconstruida necesitan otra variante antes de integrarse.
8. Enlazar marcas y fichas existentes. Respetar ids: estudio `metropolitano` → marca `circo-metropolitano`; `hijos-dios` → `hijos-de-dios`; los demás coinciden. Para las otras épocas conservar nombres, casas y suelo existentes salvo cambios justificados.

## Validación, datos y PR

- Ejecutar tests de presencia, límites y geometría. Comprobar dimensiones y triángulos del modo ciudad; su agrupación reduce llamadas de dibujo, pero no constituye por sí sola una medición de FPS en Caracas.
- Comparar main/rama con las mismas cámaras en las seis épocas, color/tinta, vista alta/baja y modos de calidad. Verificar patios abiertos, fachadas y cubiertas, y que las reservas no retiren vecinos o vegetación fuera del solar.
- Ejecutar las verificaciones del repo, build y `tests/e2e/medir-rendimiento.mjs` cuando se integre geometría. Registrar qué fue automatizado y qué debe revisar una persona.
- Revisar `npm run datos:al-dia`. Regenerar solo las salidas dependientes de las reservas modificadas; publicar por el flujo `datos-*`, sin binarios en git. No sobrescribir los archivos generados a mano.
- PR **ready**, con fuentes por fecha, capturas originales, límites y vínculo al issue. No cerrar un issue de conjunto por entregar únicamente su núcleo, una marca o una investigación parcial.

## Reproducir esta entrega

```sh
npm test
npm run build
npm run dev -- --port 5182 --strictPort
# En otra terminal:
node scripts/validar-prioridades.mjs
```

Visor: http://localhost:5182/prioridades.html. Artefactos locales: `entregables/prioridades/`. Fotos ajenas en `recursos/prioridades/` son solo consulta y quedan fuera del build. Los GLB y renders son del estudio procedural.
