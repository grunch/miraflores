# Palacio Arzobispal · estudio por épocas

Visor: `http://localhost:5176/palacio-arzobispal.html`. Ejecutar `npm run dev -- --port 5176`.
Modelo original procedural en `src/palacio-arzobispal.js`, sin texturas fotográficas. Integrado en [grunch/caracas](https://github.com/grunch/caracas) con [grunch/caracas#146](https://github.com/grunch/caracas/pull/146) (23-11-2026); ver [`specs/08-palacio-arzobispal-por-epocas.md`](https://github.com/grunch/caracas/blob/main/specs/08-palacio-arzobispal-por-epocas.md).

## Referencias consultadas el 22 de noviembre de 2026

1. [IAM Venezuela / Catálogo IPC 2004–2007](https://iamvenezuela.org/2016/06/palacio-arzobispal/).
   Describe seis vanos por nivel, dos accesos y patios con galerías. Registra reforma de fachada en el período guzmancista y restauración en 1979–1980. Su relato distingue el antecedente junto a la Catedral del asentamiento posterior en Gradillas; por ello **1637 no demuestra por sí solo la antigüedad de todos los muros actuales**. La propia ficha mezcla distintas fechas y no aporta levantamiento.
2. [Postal Bernardo Roswaag n.º 98, 3197](https://fotogaleriaweb.wordpress.com/2016/09/19/la-postal-el-instagran-de-la-caracas-de-antano/), reproducida por FotoGalería, que la sitúa circa 1920 y vincula la selección al Archivo Fotografía Urbana. Imagen observada: marcos altos con arco rebajado, balcones metálicos, bandas de entrepiso, cornisa y pretil de recuadros. La datación del sitio es aproximada; no se deduce de la estampa impresa. El encuadre incluye una fachada prolongada hacia inmuebles vecinos: no se atribuye toda la longitud al palacio.
3. [JoseGre12, fachada norte, 1 de marzo de 2025](https://commons.wikimedia.org/wiki/File:Palacio_Arzobispal_Caracas.jpg). Imagen observada: seis balcones, accesos en extremos, amarillo intenso, alero expuesto y ausencia del pretil de la postal. Miniatura guardada localmente; CC BY-SA 4.0 según Commons.
4. [Guillermo Ramos Flamerich, fachada restaurada](https://commons.wikimedia.org/wiki/File:Palacio_Arzobispal,_Caracas.jpg). Blanco, alero, marcos discretos y seis balcones. Archivo subido en 2007; la fecha de subida no prueba la de la toma. CC BY 2.5 según la ficha. No se usa el blanco o amarillo moderno como prueba cromática histórica.
5. [Arquidiócesis de Caracas, Fundación](https://arquidiocesiscaracas.com/fundacion/). Confirma la erección de la provincia eclesiástica en 1803 y su ejecución en 1804. En 1772 se usa «Palacio Episcopal».

Las copias de consulta están en `recursos/palacio-arzobispal/`. La postal tiene derechos de la reproducción sin verificar; se conserva para estudio, no se incorpora al build ni al GLB. Las fotos modernas mantienen sus atribuciones en este documento. No se confunden las imágenes del patio municipal, Museo Sacro o Casa Amarilla con patios de este palacio.

## Qué se modela

| Fecha | Criterio |
|---|---|
| 1772 | Hipótesis colonial: dos plantas, alero de tejas, huecos adintelados y balcones. El reparto en seis ejes y dos patios se extrapola; no está acreditado para esta fecha. |
| 1843 | Misma hipótesis geométrica, nombre arzobispal. No se inventa una reforma posterior al terremoto sin alzado fiable. |
| 1889 | Interpretación posterior a 1876–1877: arcos rebajados, cornisa, bandas y pretil. Retroproyección de la postal, pendiente de comprobar con un alzado de 1889. |
| 1911 y 1936 | Misma envolvente histórica; hipótesis de continuidad. No hay evidencia suficiente para introducir cambios entre ambas. |
| 2025 | Comparación moderna: alero sin pretil, muro amarillo y marcos sencillos según la fotografía. No se presenta como fecha del mapa de Caracas. |

Fachada norte: seis ejes y seis balcones individuales de hierro; dos puertas de dos hojas y cuatro ventanas bajas enrejadas. Cuarterones, marcos y ménsulas se simplifican. La fachada lateral, la medianera y la distribución interior se proponen para cerrar un volumen revisable; no provienen de un plano medido.

Huella nominal **34 × 36 m**, altura de cornisa alrededor de 9,5 m y dos patios simétricos. Son decisiones de modelado, no medidas documentadas. +Z apunta al norte/plaza, +X al oeste; el frente oriental de Gradillas queda en −X. No se ha georreferenciado el modelo. El edificio municipal contiguo queda fuera. Los paños de muro tienen perforaciones geométricas y las cubiertas se pueden ocultar.

No se modelan banderas modernas, escudos vigentes, placas ilegibles, fuentes ni estatuas de otros patios. La fachada colonial y la reconstrucción histórica necesitan revisión antes de integrarse.

## Revisión y exportación

- Selector de seis fechas; perspectiva, fachada, planta, patio y detalle de portada.
- Descarga GLB independiente por fecha, con cubiertas separadas y exportables aun si están ocultas.
- `npm test`: cronología, dimensiones nominales, geometría finita y piezas desmontables, además de las pruebas de estudios anteriores.
- `node scripts/validar-palacio-arzobispal.mjs`: carga, seis fechas, vistas, descarga GLB, móvil y convivencia con los estudios anteriores. `VISOR_URL` permite cambiar el puerto.
- `npm run build`: incluye la nueva entrada `palacio-arzobispal.html`.
- Capturas y GLB en `entregables/palacio-arzobispal/`.
