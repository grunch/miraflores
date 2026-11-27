# Instalar la fase de Trinidad de 1772 en Caracas

Relacionado con [grunch/caracas#268](https://github.com/grunch/caracas/issues/268). Estudio y evidencia: [dossier](trinidad-1772-investigacion.md).
Todavía no instalado (27-11-2026): esta guía acompaña al modelo de Miraflores, no certifica un despliegue.

## Contrato geométrico

`crearTrinidad 1772({optimizar:true})` en `src/trinidad-1772.js` devuelve
`{edificio,cubiertas,etapa}` con metros nominales, +Y arriba, frente hacia +Z y
origen en el centro de la nave. El catálogo solo admite 1772 para esta fase.
`crearPanteon({anio:1772})` expone el mismo modelo desde el visor principal.

Depende del taller de `patrimonio-geometria.js` y del agrupador de mallas
`optimizar-panteon.js`. Para Caracas, reutilizar el taller equivalente de hitos,
no copiar todos los demás modelos. El lienzo ya agrupa por material; puede
omitirse el agrupador del estudio siempre que las geometrías resultantes sean iguales.
No cargar el GLB ni crear un segundo renderer.

## Ubicación y fases

1. Cotejar el solar y frente con PARES1772 y DCN1936. El ancla actual del Panteón
   es interpretativa; no presentarla como un perímetro medido. El error del calce
   de 1772 es considerable y debe figurar en el dossier.
2. Conservar el adaptador actual del Panteón: lleva el frente +Z a la fachada
   anclada mediante el giro existente. Verificar puntos de prueba antes de
   incluir la sacristía posterior, que supera la huella del estudio anterior.
3. Añadir una parte con vida [1,2) y año 1772. Mantener idénticas las partes de 1843,
   1889,1911 y 1936. Cambiar la marca para que Trinidad exista en 1772, con ficha
   explícita de obras, sin llamarla Panteón Nacional.
4. Reserva de solar y colisiones exclusivas de esta fase. No extender su huella
   posterior a todas las épocas ni reservarla antes de 1772. Conservar calles,
   vegetación vecina y el resto de la manzana.
5. Probar nave cubierta en 1772 frente a ruinas abiertas en 1843, sin agujas
   neogóticas ni torre central moderna. Medir costes y capturar las seis épocas.
6. Publicar PR ready independiente o apilado, con fuentes, límites, tests,
   capturas y revisión. Regenerar/publicar las salidas del pipeline que dependan
   de HITOS después de la fusión, siguiendo el flujo de Caracas.

## Precisión histórica

La transcripción editorial de la visita de Martí sostiene bóvedas, tres entradas
al sur y campanarios inconclusos. No sostiene alturas exactas, ventanas ni
pigmentos. Esos detalles del estudio son interpretativos. La fachada central se
aproxima a partir del dibujo posterior de Bellermann: esto debe seguir visible en
la ficha. La imagen editorial consultada no tiene licencia establecida y no
puede viajar como textura ni foto de la aplicación.
