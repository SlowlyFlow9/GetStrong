# CLAUDE.md

Guía para Claude Code en este repositorio.

## Proyecto
GetStrong: webapp personal para planificar el entrenamiento. Permite crear rutinas (ejercicios, series, repeticiones) y asignarlas a los días de la semana que el usuario quiera.

El usuario está empezando a programar: el código debe ser simple, comentado en español y fácil de seguir.

## Reglas fijas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.
- Solo HTML, CSS y JavaScript puros: sin frameworks, librerías, npm ni paso de compilación.
- La app son `index.html`, `styles.css` y `app.js`. Los datos se guardan en `localStorage` (sin servidor ni cuentas).
- Todos los textos de la interfaz en español.
- Fechas siempre en hora local, nunca en UTC. No uses `new Date('YYYY-MM-DD')`.
- Todo texto del usuario que se pinte con `innerHTML` pasa por `escapar()`.
- Los campos (`input`, `select`, `textarea`) miden al menos 16 px para que el iPhone no amplíe la pantalla.
- No añadas funcionalidades que no se hayan pedido.
- Actualiza `MEMORY.md` al terminar cada tarea.

## Memoria
- Al empezar, lee `MEMORY.md`. Al terminar una tarea, actualízalo: estado, decisiones (con su porqué) y errores a evitar.
- Máximo ~50 líneas, sin datos sensibles.

## Comandos
- Tests: `node --test` (la lógica pura va en `tests/`).

## Cómo ejecutarlo
Abre `index.html` en el navegador. No hay build ni linter. Tras cada cambio, verifica en Chrome (consola limpia y vista móvil a 375 px).

## Flujo SDD
`/sdd-constitution` → `/sdd-spec NNN-nombre idea` → `/clarify` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` → `/sdd-validate`
