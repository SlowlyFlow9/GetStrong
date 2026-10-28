# Tareas 002 — Ejercicios pendientes

Spec: `spec.md` · Plan: `plan.md`. Una tarea por sesión, en este orden. En cada una:
test en rojo → código → `node --test` en verde (los 43 de la 001 también; sus archivos
de test no se tocan) → (si hay interfaz) Chrome a 375 px con consola limpia y campos de
16 px → marcar la tarea → actualizar `MEMORY.md`.

Regla para todas: funciones de cambio con `structuredClone`; todo cambio por `cambiar()`;
ningún `alert()`; `escapar()` en todo texto del usuario, también en atributos (`src`).

## Migración y lógica pura (solo `app.js` bloque 1 y `tests/`)

- [x] **T1. Migración e id por ejercicio.** RF-16 (y principio 5)
  - Archivos: `app.js` (`migrar`; `cargar` pasa por `migrar`; `alGuardarEjercicio` pone
    `id`), `tests/migracion.test.js`.
  - Test primero: ejercicios sin id → `rutinaId-0`, `rutinaId-1`; con id → se conserva;
    `pendientes: []` si falta y uno existente intacto; quitando `id` y `pendientes`
    añadidos queda `deepEqual` a la entrada (no se pierde nada); `migrar(migrar(x))` =
    `migrar(x)`; la entrada no cambia; `entrenamiento` antiguo `{ fecha, rutinaId, series }`
    sale idéntico.
  - Hecho cuando: `node --test` en verde; en Chrome, con el JSON antiguo de `plan.md` 2.1
    pegado en `localStorage` (entreno abierto incluido), la app carga, "Continuar" abre el
    entreno con lo escrito y la consola está limpia; `localStorage` no cambia hasta el
    primer cambio del usuario y entonces aparecen los ids (DevTools > Application); un
    ejercicio nuevo recibe `nuevoId()` y uno editado conserva su id.

- [x] **T2. Ejercicios añadidos en el entreno: vista uniforme, series y Previo.** RF-12, RF-13
  - Archivos: `app.js` (`ejerciciosDelEntreno`; ampliar `terminarEntreno`, `sumarSerie`,
    `quitarSerie`), `tests/pendientes.test.js`.
  - Test primero: entreno con un añadido hecho a mano (`numeros: [2, 3, 4]`):
    `ejerciciosDelEntreno` devuelve rutina + añadido en orden; sumar → 5; con último 19
    sumar → 20 y no pasa; con solo `[3]` quitar no hace nada; quitar 2,3,4,5 → 2,3,4;
    `terminarEntreno` con 85 en la fila de la serie 2 → `previo(..., 'Prensa', 2)` = "85";
    `erroresEntreno` señala "-5" en la fila del añadido; entreno sin `anadidos` funciona.
  - Hecho cuando: `node --test` en verde (los tests de la 001 de `sumarSerie` y
    `terminarEntreno` siguen pasando).

- [x] **T3. Guardar pendientes al terminar.** RF-1, RF-2, RF-3, RF-14, RF-15
  - Archivos: `app.js` (`existeOrigen`, `guardarPendientes`), `tests/pendientes.test.js`.
  - Test primero: aceptaciones de RF-1 (serie 3; Prensa 1-4; serie 4 añadida), RF-2 (peso
    0; peso sin REPS), RF-3 (serie quitada); orden de la tabla y al final de la cola; RF-14
    (añadido 1-4 con peso en la 1 → 2, 3, 4, mismo título, foto y origen); excepción de
    RF-15 (origen borrado con el entreno abierto → no vuelve); la entrada no cambia.
  - Hecho cuando: `node --test` en verde.

- [x] **T4. La cola de preguntas: olvidar, aceptar, rechazar.** RF-5, RF-8, RF-9, RF-10, RF-11, RF-15
  - Archivos: `app.js` (`olvidarCoincidentes`, `textoPregunta`, `aceptarPendiente`,
    `rechazarPendiente`, `olvidarSinOrigen`), `tests/pendientes.test.js`.
  - Test primero: `textoPregunta` con 1 ("1 serie") y 4 series; `olvidarCoincidentes`
    ("sentadilla " olvida "Sentadilla", otros se quedan en su orden); `aceptarPendiente`
    (al final, en orden de aceptación, filas vacías por número, rutina intacta, título y
    foto del pendiente aunque el origen cambió); `rechazarPendiente`; `olvidarSinOrigen`
    (rutina borrada, ejercicio borrado, renombrado y borrado); secuencias de la spec:
    "Curl" antes que "Prensa" de dos entrenos, RF-5 aceptación 4 ("Prensa" y después
    "Curl") y RF-11 aceptación 3 ("Sentadilla" y después "Prensa").
  - Hecho cuando: `node --test` en verde.

## Interfaz (`app.js` bloque 2 y `styles.css`)

- [x] **T5. Terminar guarda los pendientes.** RF-1, RF-2, RF-3, RF-4, RF-16
  - Archivos: `app.js` (`alTerminar`: validar → `pantalla.preguntar = false` →
    `cambiar(terminarEntreno(guardarPendientes(datos)))`).
  - Sin test nuevo (usa T3).
  - Hecho cuando: en Chrome, tras las aceptaciones de RF-1 a RF-3, `datos.pendientes` (consola
    o DevTools > Application) tiene lo esperado y sigue tras recargar; con "-5" no termina,
    sale "Peso no válido" y `pendientes` no cambia (RF-4); con `localStorage` lleno sale
    "No queda espacio para guardar", el entreno sigue abierto y no cambian ni Previo ni
    pendientes; el día se marca "✓ Hecho"; consola limpia.

- [x] **T6. Ejercicios añadidos en la tabla.** RF-9, RF-12, RF-13
  - Archivos: `app.js` (`htmlDia` recorre `ejerciciosDelEntreno`; `htmlTablaEntreno`
    con `numeros`), `styles.css` si hace falta.
  - Sin test nuevo (usa T2 y T4). Para probar antes de T7, aceptar desde la consola:
    `cambiar(aceptarPendiente(datos))`.
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-9 (filas 2, 3, 4; Previo 80
    en la 2 y "–" en las otras; foto y título antiguos; rutina sin "Prensa"), RF-12 (85/10
    tras recargar; fila 5; fila 3 sola sin "Quitar"; 20 con "+ Serie" desactivado; "-5"
    señalado) y RF-13; un título `<b>&"'` se ve tal cual; consola limpia a 375 px.

- [x] **T7. Bloque de preguntas al empezar.** RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11
  - Archivos: `app.js` (`pantalla.preguntar`, `alEmpezar`, bloque en `htmlDia`,
    `data-aceptar` / `data-rechazar` en el `click`), `styles.css` (`.pregunta`).
  - Sin test nuevo (usa T4).
  - Hecho cuando: en Chrome se cumplen las aceptaciones de RF-5 (texto exacto, arriba y
    antes de la primera tabla, escribir 40 sin que se esconda, orden), RF-6, RF-7 (con hoy
    simulado = 28/10 y entreno del 27/10 abierto tras recargar), RF-8, RF-10 y RF-11 (Rutinas
    → Continuar, Esta semana → día, recarga, terminar sin responder); sin ventanas del
    navegador; título con `<b>&"'` en la pregunta se ve tal cual; consola limpia a 375 px y
    botones de 16 px.

- [x] **T8. Borrar el origen olvida sus pendientes.** RF-14, RF-15
  - Archivos: `app.js` (`alBorrarRutina` y `alBorrarEjercicio` con `olvidarSinOrigen`).
  - Sin test nuevo (usa T3 y T4).
  - Hecho cuando: en Chrome se cumplen las 4 aceptaciones de RF-15 (rutina borrada,
    ejercicio borrado, renombrado y borrado, y "Prensa" añadida con "Pierna" borrada: sigue,
    guarda 85 de Previo y no vuelve a preguntarse); un pendiente borrado que estaba a la
    vista en el bloque ya no sale; consola limpia.

- [x] **T9. Repaso final.** RF-1 a RF-16
  - Archivos: ninguno salvo arreglos que salgan del repaso; `spec.md` → "implementada"
    solo tras `/sdd-validate`.
  - Hecho cuando: recorrido completo con datos del formato 001 (migración real del
    `localStorage` del usuario, sin pérdida: mismo número de rutinas, ejercicios, días y
    pesos); todos los casos límite de la spec revisados en Chrome a 375 px con consola
    limpia; buscar `alert(` en `app.js` no da resultados; `node --test` en verde (43 de la
    001 + los nuevos); prueba en el iPhone (bloque y tablas sin zoom).
  - [ ] **Prueba del usuario en el iPhone** (pendiente):
    1. En el Mac, en la carpeta del proyecto: `python3 -m http.server 8000`.
    2. IP del Mac: Ajustes del Sistema > Wi-Fi > Detalles (o `ipconfig getifaddr en0`).
    3. En el iPhone (misma wifi), Safari: `http://<IP del Mac>:8000`.
    4. Asigna una rutina a hoy, "Empezar entrenamiento", escribe peso solo en la serie 1
       de un ejercicio y "Terminar entrenamiento".
    5. Asigna otra rutina (sin ese ejercicio) a otro día de esta semana y empiézala: sale
       "Te quedó sin hacer… ¿Añadirlo a este entrenamiento?". Escribe un peso en la tabla
       con el bloque a la vista (no debe hacer zoom) y pulsa "Añadir".
    6. El ejercicio sale al final con sus filas originales: escribe KG y REPS (sin zoom,
       teclado numérico), "+ Serie" y "Quitar", y "Terminar entrenamiento".
    7. Comprueba que nada se sale por los lados ni obliga a desplazar en horizontal.

## Cobertura RF → tarea

| RF | Tareas | RF | Tareas |
|---|---|---|---|
| RF-1 | T3, T5, T9 | RF-9 | T4, T6, T7, T9 |
| RF-2 | T3, T5, T9 | RF-10 | T4, T7, T9 |
| RF-3 | T3, T5, T9 | RF-11 | T4, T7, T9 |
| RF-4 | T5, T9 | RF-12 | T2, T6, T9 |
| RF-5 | T4, T7, T9 | RF-13 | T2, T6, T9 |
| RF-6 | T7, T9 | RF-14 | T3, T8, T9 |
| RF-7 | T7, T9 | RF-15 | T3, T4, T8, T9 |
| RF-8 | T4, T7, T9 | RF-16 | T1, T5, T9 |
