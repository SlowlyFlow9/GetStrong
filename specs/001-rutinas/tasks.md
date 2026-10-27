# Tareas 001 — Rutinas

Spec: `spec.md` · Plan: `plan.md`. Una tarea por sesión, en este orden. En cada una:
test en rojo → código → `node --test` en verde → (si hay interfaz) Chrome a 375 px con
consola limpia y campos de 16 px → marcar la tarea → actualizar `MEMORY.md`.

## Lógica pura (solo `app.js` bloque 1 y `tests/`)

- [x] **T1. Fechas, textos y esqueleto de `app.js`.** RF-1, RF-2, RF-24, RF-37, RNF-5
  - Archivos: `app.js` (bloque de lógica, `if (typeof document ...) iniciar()` y
    `module.exports`), `tests/fechas.test.js`.
  - Test primero: `claveFecha`, `fechaDeClave`, `diasDeSemana(hoy, 0|1)` con hoy = martes
    27/10/2026 (26/10-1/11 y 2/11-8/11), domingo 1/11/2026, lunes 2/11/2026 (ya no
    incluye 26/10) y domingo 25/10/2026 (cambio de hora); `textoDia("2026-10-27")` =
    "martes 27/10"; `textoDiasAsignados` con 1, 2 y 3 días; `normalizar`, `coinciden`
    ("Sentadilla" = "sentadilla ", ≠ "Sentadilla búlgara"); `escapar` con `< > & " '`.
  - Hecho cuando: `node --test` en verde y `require('../app.js')` no da error en node.

- [x] **T2. Validaciones.** RF-5, RF-6, RF-10, RF-11, RF-12, RF-13, RF-31, RF-32
  - Archivos: `app.js`, `tests/validacion.test.js`.
  - Test primero: `validarRutina` ("   ", " pierna " con "Pierna", renombrar "Torso" a
    "PIERNA", renombrar una rutina a su propio nombre sí vale); `leerSeries` ("0", "21",
    "abc", "3", "20"); `validarEjercicio` (título vacío, sin foto, repetido en la misma
    rutina, propio índice al editar); `leerPeso` ("22,5" y "22.5" → 22.5, "0" → 0, "" →
    null, "-5" y "abc" → NaN); `leerReps`; `erroresEntreno` señala ejercicio, serie y
    campo con su mensaje.
  - Hecho cuando: `node --test` en verde.

- [x] **T3. Rutinas, ejercicios y plan semanal.** RF-4, RF-7, RF-15, RF-16, RF-18,
  RF-20, RF-21, RF-22, RF-35, RF-39, RF-40
  - Archivos: `app.js`, `tests/rutinas.test.js`.
  - Test primero: `datosVacios`; `guardarRutina` crea y renombra; `guardarEjercicio`
    añade 15 en orden y edita título/foto/series; `borrarEjercicio`; `diasAsignados` con
    hoy = 27/10/2026 devuelve 27/10 y 6/11 pero no 19/10; `borrarRutina` vacía 19/10,
    27/10 y 6/11; `asignarRutina` sustituye y solo afecta a ese día; "✓ Hecho" se quita al
    asignar otra rutina, al quitar la rutina y al borrar la rutina, y no vuelve al
    reasignar la misma; `rutinaBloqueada`, `diaBloqueado`; los datos de entrada no cambian.
  - Hecho cuando: `node --test` en verde.

- [x] **T4. Previo y entrenamiento.** RF-16, RF-26, RF-27, RF-28, RF-29, RF-30, RF-33,
  RF-34, RF-35, RF-41
  - Archivos: `app.js`, `tests/entreno.test.js`.
  - Test primero: `previo` ("–", "0", "22,5", compartido entre rutinas, errata = "–",
    título cambiado = "–" y volver al antiguo = 60); `puedeEmpezar` con hoy = 28/10/2026
    (lunes 26 y viernes 30 sí, 2/11 no, rutina sin ejercicios no); `empezarEntreno`;
    `escribirValor`; `sumarSerie`/`quitarSerie` (19→20, no pasa de 20, no baja de 1,
    `rutina.series` intacto); `terminarEntreno` (guarda 22,5 y 0, vacía mantiene 40, serie
    4 añadida guarda 50, reps no se guardan, marca "✓ Hecho", `entrenamiento = null`, y
    funciona con fecha 1/11 cuando hoy = 2/11).
  - Hecho cuando: `node --test` en verde.

## Interfaz (`index.html`, `styles.css`, `app.js` bloque 2)

Regla para T5-T10: ningún `alert()`. Errores y avisos van en `pantalla.aviso` y se ven
como `<p class="aviso">` en rojo dentro de la página, junto al formulario o la vista
(plan, decisión 1). Solo las confirmaciones de borrado usan `confirm()`.

- [x] **T5. Estructura, guardado seguro y vista Semana.** RF-1, RF-2, RF-3, RF-20,
  RF-21, RF-22, RF-23, RF-24, RF-35, RF-40, RF-42, RF-43
  - Archivos: `index.html`, `styles.css`, `app.js`.
  - Sin test nuevo (usa T1 y T3). `cargar`, `guardar` (try/catch que deja "No queda
    espacio para guardar" en `pantalla.aviso`), `pintar` con el `<p class="aviso">` y su
    estilo `.aviso` en rojo, cabecera con pestañas y botón "Rutinas" (vista vacía por
    ahora), vista Semana con `<select>` por día y botón "Ver", "No hay rutina para este
    día." y "✓ Hecho". Bloqueo de RF-40 con aviso en la página.
  - Hecho cuando: con doble clic en `index.html` se ve "Esta semana" con 26/10-1/11 y
    "Siguiente" con 2/11-8/11; asignar en "Siguiente" no cambia "Esta semana"; recargar
    conserva el plan; llenar `localStorage` desde la consola y asignar muestra "No queda
    espacio para guardar" en rojo dentro de la página (sin ventana `alert`) sin cambiar
    nada, y el aviso desaparece al repintar; 375 px sin scroll horizontal; consola limpia.
    (Para probar, crear rutinas desde la consola o esperar a T6.)

- [x] **T6. Vista Rutinas: crear, renombrar y borrar.** RF-3, RF-4, RF-5, RF-6, RF-14,
  RF-17, RF-18, RF-39
  - Archivos: `app.js`, `styles.css`.
  - Sin test nuevo (usa T2 y T3).
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-4, RF-5, RF-6, RF-14,
    RF-17 (rutina) y RF-18 (incluido el día pasado vacío en DevTools > Application); los
    errores de RF-5, RF-6 y el bloqueo de RF-39 salen en rojo junto al formulario o la
    lista, sin `alert`; borrar pide `confirm()` con el texto de RF-18 ("Esta rutina está
    asignada al martes 27/10. ¿Borrarla?"); un nombre `<b>&"'` se ve tal cual; uno de 50 caracteres no desborda a 375 px; consola
    limpia.

- [x] **T7. Editar rutina y ejercicios con foto.** RF-7, RF-8, RF-9, RF-10, RF-11,
  RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-19, RF-39
  - Archivos: `app.js`, `styles.css`.
  - Sin test nuevo (usa T2 y T3). Miniatura 400 px / JPEG 0,7; "No se ha podido cargar la
    imagen" si el archivo no es imagen; bloqueo RF-39 al abrir la edición (se comprueba
    del todo en T9).
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-7, RF-10 a RF-17 y RF-19;
    20 ejercicios con fotos de 3 MB o más se guardan y se ven tras recargar; con varios
    errores a la vez solo se ve el primero (título, imagen, título repetido, series) en
    rojo junto a "Guardar", sin `alert`; un .txt da "No se ha podido cargar la imagen" en
    la página; borrar un ejercicio pide `confirm()`; consola limpia a 375 px. RF-8 queda pendiente de
    probar en el iPhone del usuario.

- [x] **T8. Vista del día.** RF-19, RF-25, RF-26, RF-27, RF-28, RF-38
  - Archivos: `app.js`, `styles.css`.
  - Sin test nuevo (usa T4). Tarjetas con miniatura, título y tabla Serie / Previo;
    "Empezar entrenamiento" solo en la semana actual y desactivado sin ejercicios;
    "Editar rutina"; RF-38 con aviso en la página y salto al entrenamiento abierto.
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-25, RF-27 y RF-28; el
    Previo muestra "22,5" con coma; consola limpia a 375 px.

- [x] **T9. Entrenamiento: escribir, series, terminar y aviso.** RF-26, RF-29, RF-30,
  RF-31, RF-32, RF-33, RF-34, RF-35, RF-36, RF-37, RF-38, RF-39, RF-40, RF-41
  - Archivos: `app.js`, `styles.css`.
  - Sin test nuevo (usa T2 y T4). Tabla con KG/REPS, guardado en cada `input` sin
    repintar, "+ Serie" y "Quitar", "Terminar entrenamiento" con `.erroneo` en todos los
    campos erróneos y el mensaje del primero como aviso en la página, aviso
    "Entrenamiento del <día> sin terminar. Continuar" en todas las vistas.
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-26, RF-29 a RF-41 (RF-41
    cambiando la fecha del sistema o con el test de T4); con dos campos erróneos ambos
    se marcan y solo sale el mensaje del primero, en rojo junto a "Terminar
    entrenamiento" y sin `alert`; los bloqueos de RF-39 y RF-40 salen en la página;
    consola limpia a 375 px y campos sin zoom (16 px).

- [x] **T10. Repaso final.** RF-8, RF-42, RF-43
  - [x] Foto de cámara y de galería en su iPhone (RF-8): probado por el usuario el 2026-10-27, cámara y galería OK.
  - Archivos: ninguno salvo arreglos que salgan del repaso.
  - Hecho cuando: recorrido completo de RF-42 (crear, asignar, entrenar, recargar: todo
    sigue); todas las pantallas en español; casos límite de la spec revisados en Chrome a
    375 px con consola limpia; buscar `alert(` en `app.js` no da resultados; foto de cámara y de galería probadas en el iPhone del
    usuario; `node --test` en verde.

## Cobertura RF → tarea

| RF | Tareas | RF | Tareas | RF | Tareas |
|---|---|---|---|---|---|
| RF-1 | T1, T5 | RF-16 | T3, T4, T7 | RF-31 | T2, T9 |
| RF-2 | T1, T5 | RF-17 | T6, T7 | RF-32 | T2, T9 |
| RF-3 | T5, T6 | RF-18 | T3, T6 | RF-33 | T4, T9 |
| RF-4 | T3, T6 | RF-19 | T7, T8 | RF-34 | T4, T9 |
| RF-5 | T2, T6 | RF-20 | T3, T5 | RF-35 | T3, T4, T5, T9 |
| RF-6 | T2, T6 | RF-21 | T3, T5 | RF-36 | T9 |
| RF-7 | T3, T7 | RF-22 | T3, T5 | RF-37 | T1, T9 |
| RF-8 | T7, T10 | RF-23 | T5 | RF-38 | T8, T9 |
| RF-9 | T7 | RF-24 | T1, T5 | RF-39 | T3, T6, T7, T9 |
| RF-10 | T2, T7 | RF-25 | T8 | RF-40 | T3, T5, T9 |
| RF-11 | T2, T7 | RF-26 | T4, T8, T9 | RF-41 | T4, T9 |
| RF-12 | T2, T7 | RF-27 | T4, T8 | RF-42 | T5, T10 |
| RF-13 | T2, T7 | RF-28 | T4, T8 | RF-43 | T5, T10 |
| RF-14 | T6, T7 | RF-29 | T4, T9 | | |
| RF-15 | T3, T7 | RF-30 | T4, T9 | | |
