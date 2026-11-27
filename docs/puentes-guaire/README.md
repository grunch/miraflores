# Estudios de puentes del Guaire

Seis cruces, siete estructuras: Constitución y Sucre comparten selector, pero tienen geometrías distintas. Primero en Miraflores; no integrados en Caracas. La cronología de las fichas (Constitución en 1889, Sucre metálico en 1911, Sucre de concreto desde 1936 y la sustitución del de Hierro en 1937) ya se corrigió en [grunch/caracas#281](https://github.com/grunch/caracas/pull/281); los modelos 3D siguen sin instalar.

[Visor](http://localhost:5182/puentes-guaire.html) · [Guía de integración](../integracion-caracas-puentes.md).

- [Constitución / Sucre](sucre.md)
- [Puente de Hierro · Regeneración](hierro.md)
- [Puente Dolores](dolores.md)
- [Puente Restaurador](restaurador.md)
- [Puente 19 de Diciembre](diciembre.md)
- [Puente Ayacucho](ayacucho.md)

Conservan explícitamente la diferencia entre existencia del cruce, estado indeterminado y modelo disponible. No incluyen el Paraíso de 1895 ni Bolívar/Los Leones: faltan modelos y calce propios. No se cierra #272 por esta entrega parcial.

Validar: `node --test tests/puentes-guaire.test.js`, `node scripts/validar-puentes.mjs`. La validación del visor cubre 36 combinaciones de época, alzados, GLB y móvil.
