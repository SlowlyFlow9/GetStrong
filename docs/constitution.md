# Constitución — GetStrong

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Simplicidad primero**: HTML, CSS y JS puros, solo en `index.html`, `styles.css` y `app.js`. Sin frameworks, librerías, npm ni build. Los datos viven solo en `localStorage`, sin servidor ni cuentas. Para usar la app basta con abrir `index.html` en el navegador.
2. **La spec manda**: nada se implementa sin un RF aprobado en la spec activa (`specs/NNN-nombre/`). Los cambios siguen siempre el orden spec → plan y tareas → código. No se añaden funcionalidades que no se hayan pedido. Si falta una decisión, se para y se pregunta. Ninguna fase avanza sin aprobación explícita.
3. **Lógica separada de interfaz**: los cálculos son funciones puras, sin DOM ni `localStorage`. Las que dependen de la fecha reciben "hoy" como parámetro. Las fechas van siempre en hora local, nunca con `new Date('YYYY-MM-DD')`.
4. **Tests como puerta**: cada función pura tiene su test en `tests/` y se prueba con `node --test`, sin instalar paquetes. Cada tarea empieza con su test en rojo y no se cierra hasta verlo en verde. Cada cambio se revisa en Chrome: consola limpia, vista a 375 px y campos (`input`, `select`, `textarea`) de al menos 16 px. Al terminar cada tarea se actualiza `MEMORY.md`.
5. **Los datos del usuario son sagrados**: todo texto del usuario que se pinte con `innerHTML` pasa antes por `escapar()`. Los datos guardados nunca se borran ni se sobrescriben sin una acción explícita del usuario.
6. **Idioma y sencillez**: interfaz, comentarios y nombres de variables y funciones en español. El código tiene que ser simple y fácil de seguir para quien empieza a programar.
