# Instrucciones para agentes

Este proyecto puede tener **varios agentes trabajando a la vez** (Claude, Codex, Gemini u otros) en el mismo directorio o en worktrees del mismo repositorio. Antes de modificar cualquier archivo, sigue el protocolo de coordinación. No es opcional.

## Protocolo de coordinación

La coordinación se hace con `node scripts/agentes.mjs`. **No edites a mano los archivos de coordinación.**

**Es un protocolo cooperativo:** nada impide físicamente editar un archivo sin reclamarlo. Los reclamos solo protegen a los agentes que siguen este protocolo, así que cumplirlo es obligatorio.

El script sí garantiza que los propios archivos de coordinación nunca tengan dos escritores:

- toda modificación del estado ocurre dentro de un mutex global que el sistema operativo libera si el proceso muere, así que si dos agentes reclaman lo mismo a la vez, solo uno lo obtiene;
- cada archivo se escribe de forma atómica: nunca se ve a medias;
- la bitácora solo admite añadir entradas, nunca editarlas.

Por eso no hay que esperar ni reintentar: si un reclamo falla, es que otro agente tiene el recurso.

Los datos viven en `.git/agentes/`, compartido por todos los worktrees y nunca versionado.

### 1. Al empezar

```sh
node scripts/agentes.mjs estado        # quién trabaja, qué tiene reclamado y notas recientes
node scripts/agentes.mjs iniciar --agente "<modelo y herramienta>" --tarea "<qué vas a hacer>" [--rama <rama>]
```

`iniciar` imprime tu **ID de sesión**. Guárdalo y úsalo en todos los comandos siguientes. Lee la bitácora: otros agentes pueden haber dejado hallazgos que te afectan.

### 2. Antes de tocar archivos

```sh
node scripts/agentes.mjs reclamar --id <ID> src/teatro-municipal.js docs/integracion-caracas-teatro-municipal.md puerto:5178
```

- Reclama **todo** lo que vayas a modificar, incluidos los archivos que crees y los puertos de los servidores que levantes (`puerto:NNNN`; los validadores usan puertos fijos, ver README). También puedes reclamar otros recursos con nombre, como `glb:casa-amarilla`.
- Reclamar un directorio (`docs/prioridades`) bloquea todo lo que contiene. Reclama lo más concreto posible.
- Es todo o nada: si sale el código 2 (`CONFLICTO`), no obtuviste ninguno. **No toques ese recurso.** Elige otra tarea, pide coordinación con `nota` o vuelve a intentarlo más tarde.
- Si en mitad del trabajo necesitas otro archivo, reclámalo antes de editarlo.
- Leer no requiere reclamo.

### 3. Mientras trabajas

```sh
node scripts/agentes.mjs latido --id <ID> [--tarea "<tarea actualizada>"]   # cada 10 minutos como máximo
node scripts/agentes.mjs nota --id <ID> "<hallazgo útil para otros agentes>"
```

- Una sesión sin latido durante **30 minutos** se considera abandonada y cualquier agente puede tomar sus reclamos. **No puede revivir:** `latido` y `reclamar` fallan con «caducada». En ese caso ejecuta `terminar`, revisa con `estado` qué tomaron otros, inicia una sesión nueva y vuelve a reclamar. **Después de volver a reclamar, relee cada archivo desde el disco** y reconcilia tus cambios pendientes con su contenido actual antes de escribir: mientras tu sesión estuvo caducada, otro agente pudo editarlo y liberarlo.
- **Comandos largos** (build, validadores, capturas): lánzalos con `node scripts/agentes.mjs ejecutar --id <ID> -- <comando>`. Así se emiten latidos cada 10 minutos mientras corren y se devuelve el código de salida del comando. Un único latido antes de lanzarlos no basta si duran más de 30 minutos. Si la sesión caduca mientras corre (por ejemplo, porque la máquina se suspendió), `ejecutar` detiene el comando y falla: inicia otra sesión y vuelve a reclamar antes de seguir.
- Usa `nota` para compartir lo que otros deberían saber: un error en un dato compartido, un cambio de API, una prueba rota que no es tuya o una decisión tomada. Es la memoria compartida entre agentes. Una línea por nota; nada de secretos.
- `liberar --id <ID> <rutas>` suelta lo que ya no necesitas.

### 4. Al terminar (también si abandonas la tarea)

```sh
node scripts/agentes.mjs terminar --id <ID> --resumen "<qué cambió, qué quedó pendiente>"
```

Esto libera tus reclamos, borra tu sesión y deja el resumen en la bitácora. Si encuentras sesiones `[INACTIVA]`, `node scripts/agentes.mjs limpiar` las retira.

## Git con varios agentes

- **Preferible:** trabaja en tu propio worktree y rama (`git worktree add ../miraflores-<tarea> -b <rama>`). La coordinación sigue funcionando porque `.git/agentes` es común. Aun así, reclama los archivos: dos ramas que tocan lo mismo acaban en conflicto de fusión.
- En un directorio compartido, haz stage **solo de tus archivos reclamados** (`git add <rutas>`). Nunca uses `git add -A`, `git add .`, `git commit -a`, `git stash`, `git checkout -- .`, `git reset --hard` ni `git clean`: arrastran o destruyen el trabajo de otros agentes.
- Si git informa de `index.lock`, otro agente está ejecutando git. Espera unos segundos y reintenta; no borres el lock.
- **Operaciones que cambian el árbol de trabajo** (`git pull`, `rebase`, `merge`, `checkout`/`switch` de rama, `restore`): **prohibidas en el directorio compartido**. Pueden modificar archivos que otro agente ya leyó y que luego sobrescribiría con su copia vieja, y ningún reclamo impide que entre una sesión nueva entretanto. Hazlas solo en tu propio worktree. `estado` muestra el directorio de cada sesión.
- Antes de hacer push, actualiza tu rama con `git pull --rebase` desde tu worktree. No reescribas historia publicada.
- Mensajes de commit en español con prefijo convencional: `feat:`, `fix:`, `docs:`, `test:`…

## Contexto del proyecto

- Leer [README.md](README.md): visores, estudios, validadores y estado de integración en [grunch/caracas](https://github.com/grunch/caracas).
- `npm test` debe pasar antes de terminar. Los validadores de `scripts/validar-*.mjs` necesitan un servidor de desarrollo en el puerto indicado (reclámalo).
- No publiques ni copies a `entregables/` las imágenes de `recursos/`: su licencia no está verificada.
- Referencia el proyecto hermano por su repositorio, [grunch/caracas](https://github.com/grunch/caracas), nunca por una ruta local.
