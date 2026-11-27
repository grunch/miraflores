# Patrimonio prioritario — estudios e instalación

Diez estudios en Miraflores, vinculados a los issues #249, #250, #257, #258 y #259. Seis ya están integrados en [grunch/caracas](https://github.com/grunch/caracas): Nuevo Circo ([#283](https://github.com/grunch/caracas/pull/283)), Circo Metropolitano ([#284](https://github.com/grunch/caracas/pull/284)), La Rotunda y La Concordia ([#285](https://github.com/grunch/caracas/pull/285)), San Agustín ([#286](https://github.com/grunch/caracas/pull/286)), Hijos de Dios ([#287](https://github.com/grunch/caracas/pull/287)) y Cementerio General del Sur ([#288](https://github.com/grunch/caracas/pull/288)). Santa Rosalía, San Juan, San José y Hospital Vargas siguen solo en Miraflores. La cronología y la arquitectura se validan por separado: un estado `presente: null` significa incertidumbre, no ausencia histórica.

Abrir http://localhost:5182/prioridades.html (`npm run dev -- --port 5182`). Selector de edificio, seis épocas, cuatro vistas, cubiertas, detalle ciudad y GLB.

| Estudio | Guía | Issue |
|---|---|---|
| Iglesia de Santa Rosalía | [Instalación y límites](santa-rosalia.md) | #259 |
| San Juan Bautista · Capuchinos | [Instalación y límites](san-juan.md) | #259 |
| Iglesia de San José | [Instalación y límites](san-jose.md) | #259 |
| Iglesia de San Agustín | [Instalación y límites](san-agustin.md) | #259 |
| Circo Metropolitano | [Instalación y límites](metropolitano.md) | #257 |
| Nuevo Circo | [Instalación y límites](nuevo-circo.md) | #257 |
| La Rotunda | [Instalación y límites](rotunda.md) | #258 |
| Cementerio de los Hijos de Dios | [Instalación y límites](hijos-dios.md) | #250 |
| Cementerio General del Sur | [Instalación y límites](cementerio-sur.md) | #250 |
| Hospital Vargas | [Evidencia, fases e instalación](hospital-vargas.md) | #249 |

## Verificación

`node --test tests/prioridades.test.js`: cronología, incertidumbre, geometría finita y huella igual entre detalle estudio/ciudad. `node scripts/validar-prioridades.mjs`: seis épocas por edificio, vistas, cubiertas, exportación y móvil; escribe `entregables/prioridades/validacion.json`. Es verificación automatizada del agente, no revisión manual del responsable.
