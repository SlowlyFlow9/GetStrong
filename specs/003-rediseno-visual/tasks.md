# Tareas 003 — Rediseño visual

Spec: `spec.md` · Plan: `plan.md`. Una tarea por sesión, en este orden. Ninguna se publica
hasta T8: entre tareas la app debe verse coherente o, como mínimo, usable (todo texto
legible sobre su fondo).

Criterios comunes de "hecho" en TODAS las tareas (además de los propios):
- `node --test` en verde, **84/84**, sin tocar ningún archivo de `tests/`.
- Chrome headless a 375 px (plan 6.2): capturas de las vistas que toca la tarea,
  `document.documentElement.scrollWidth === 375` en cada una y consola limpia.
- `input`, `select`, `textarea` (y "Quitar") con `fontSize` ≥ 16px.
- En `app.js` el diff solo tiene `class=` en botones y, en T2, la línea `touchstart`
  (RNF-6, RNF-7); ningún texto cambia.
- Ningún hex fuera de `:root` en `styles.css`; ninguna regla `:hover`.
- `MEMORY.md` actualizado (estado, decisiones y errores a evitar).

## Base y piezas comunes

- [x] **T1. Paleta, fondo oscuro, textos y tarjetas.** RF-1, RF-2, RF-13 (colores), RF-24, RNF-4, RNF-5, RNF-8
  - Archivos: `index.html` (las dos metas), `styles.css` (`:root` con la paleta; `html,
    body`; textos secundarios; `h2` 18 px y `.dia-cabecera h2, .formulario h2` 24 px;
    títulos de tarjeta 18 px y 700; `p.rutina-nombre` secundario; `.hecho`; fondo y
    esquinas de `.dia`, `.rutina`, `li.ejercicio`, `.tarjeta`, `.pregunta`; quitar las
    líneas grises de la tabla y poner `th` en secundario).
  - Los botones siguen con su estilo de hoy (blancos con texto oscuro): legibles sobre lo
    oscuro hasta T2. Los campos los pinta el navegador en oscuro por `color-scheme`.
  - Hecho cuando: en todas las vistas `html` y `body` miden fondo #100E1C y texto
    #F2F1F7; tarjetas #1E1C2C con radio ≥ 16 px; títulos con los tamaños de RF-2; en la
    pestaña Red, recargar no pide ninguna fuente ni nada de otro dominio; `index.html` solo
    cambia en las dos metas; criterios comunes.

- [x] **T2. Botones: secundario, principal, desactivado, pulsado y foco.** RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-25, RF-26
  - Archivos: `styles.css` (bloque 3.3 del plan: `button`, `button:active:not(:disabled)`,
    `button:disabled`, `.principal`, `.principal:active:not(:disabled)`,
    `.principal:disabled`, `prefers-reduced-motion`, `:focus-visible`, `.quitar`),
    `app.js` (`class="principal"` en "Crear", "Añadir ejercicio", "Guardar" del
    ejercicio, "Empezar" y "Terminar entrenamiento"; línea `touchstart` en `iniciar()`).
  - Las pestañas quedarán grises hasta T3 (usables).
  - Hecho cuando: por pantalla, como mucho un botón con fondo #6DB6F2 (ninguno en Semana)
    y borde inferior de 4 px #3F86C9; el resto #2C2A3D / #F2F1F7 y "Borrar" no rojo; con
    `mousePressed` en "Crear" baja 2 px (`marginTop` 2px, `borderBottomWidth` 2px) y la
    lista no se mueve, `transitionDuration` 0.1s y 0s con reducción de movimiento emulada;
    "Editar" pulsado mide #242235 y no se mueve; `mouseMoved` no cambia nada; "Empezar"
    de una rutina vacía y "+ Serie" con la serie 20 miden #2C2A3D / #9693AA, sin borde
    azul y no cambian al pulsar; con el entreno de otro día abierto "Empezar" es azul y
    activo; Tab por Rutinas da contorno #6DB6F2; criterios comunes.

- [x] **T3. Cabecera, pestañas y aviso del entrenamiento.** RF-11, RF-12
  - Archivos: `styles.css` (`.cabecera`, `.pestanas button`, `.pestanas button:active`,
    `.pestanas button.activa`, `.aviso-entreno`).
  - Hecho cuando: cabecera #100E1C con línea inferior #2C2A3D y fija al desplazar; la
    pestaña activa en #6DB6F2, negrita y subrayada en todo su ancho, las otras #8D8AA0, y
    pulsarlas (`mousePressed`) no cambia su fondo; en Editar rutina y Ejercicio la activa
    es "Rutinas"; con un entreno abierto el aviso sale en #F2F1F7 y "Continuar" es
    secundario y lleva al entreno; criterios comunes.

- [x] **T4. Campos de texto y avisos de error.** RF-10, RF-20, RF-23
  - Archivos: `styles.css` (`input[type="text"]`, `.campo` solo ancho y margen, `.aviso`,
    `.celda.erroneo`). `select` y `input[type=file]` sin colores ni `appearance`.
  - Hecho cuando: "Nueva rutina", título, series, KG y REPS miden fondo #100E1C, texto
    #F2F1F7 y borde #8D8AA0; el desplegable del día conserva su flecha y se lee; guardar
    un ejercicio sin título muestra el aviso con texto y borde de 1 px #FF6B6B sobre
    #2A1620 junto a "Guardar"; "-5" en KG + "Terminar" deja esa celda con borde de 2 px,
    texto #FF6B6B y fondo #2A1620 (y las demás no); criterios comunes.

## Vistas

- [x] **T5. Semana, Rutinas, Editar rutina y Ejercicio.** RF-2, RF-13, RF-14, RF-15, RF-16, RNF-2
  - Archivos: `styles.css` (rellenos de las tarjetas, `.miniatura` círculo de 56 px,
    `.ejercicio-titulo`, `.ejercicio-series`, `.vista-previa` 16 px, `.formulario label`,
    `.boton-ancho`).
  - Hecho cuando: Semana con 7 tarjetas, "✓ Hecho" en #6EE7A0 y "No hay rutina…" en gris;
    3 rutinas en 3 tarjetas y un nombre de 50 letras partido sin desbordar; "Sentadilla"
    con foto en círculo de 56 px sin deformar (probar foto vertical y apaisada), "3
    series" en gris y "Añadir ejercicio" azul, en relieve y a todo el ancho; rutina vacía
    con el mensaje en gris; "Nuevo ejercicio" ≥ 24 px y 700, vista previa con radio de
    16 px sin desbordar, "Guardar" azul y "Cancelar" gris; "Ejercicios" 18 px;
    criterios comunes.

- [x] **T6. Vista Día: botones, tarjeta con tabla hundida y bloque de preguntas.** RF-17, RF-18, RF-19, RF-21, RF-22, RNF-2, RNF-3
  - Archivos: `styles.css` (`.botones-dia` en columna, `.tarjeta` sin relleno y con
    `overflow: hidden`, `.tarjeta .ejercicio`, `.tabla-series` #15131F, números a 20 px,
    `td:nth-child(2)` secundario, `.celda`, `.quitar`, `.sumar`, `.pregunta`,
    `.pregunta p`).
  - Hecho cuando (hoy simulado = miércoles 28/10/2026): las 4 aceptaciones de RF-17
    (Empezar azul y Editar rutina gris debajo, a todo el ancho; Terminar único azul;
    otro día abierto → Empezar azul y avisa; semana siguiente solo Editar rutina); la
    tabla #15131F mide lo mismo de ancho que la tarjeta, números ≥ 20 px y Previo/`th` en
    #8D8AA0; con el entreno abierto y 3 series, Serie/Previo/KG/REPS y "Quitar" caben a
    375 px y "102,5" se ve entero (`scrollWidth <= clientWidth` en la celda); con 20 series
    sigue sin scroll horizontal; una sola serie sin "Quitar"; bloque de preguntas antes de
    la primera tarjeta con borde 2 px #6DB6F2, "Añadir"/"No" grises y un título de 50
    letras sin desbordar; rutina vacía con el mensaje en gris. Si la tabla no cabe con
    20 px: parar y preguntar al usuario (DA-19); criterios comunes.

## Cierre

- [x] **T7. Repaso final.** RF-1 a RF-26, RNF-1 a RNF-8
  - Archivos: ninguno salvo arreglos que salgan del repaso.
  - Hecho cuando: un script recorre todas las vistas y estados de plan 6.2 con capturas
    y todas las mediciones en verde; todos los casos límite de la spec revisados
    (incluido `<b>&"'` tal cual); diff total revisado: `index.html` solo las dos metas,
    `app.js` solo 5 `class=` y la línea `touchstart`; `node --test` 84/84; consola limpia;
    `MEMORY.md` actualizado. Después, `/sdd-validate` por el reviewer: APROBADO (2026-10-28).

- [x] **T8. Publicación.** (solo tras la validación APROBADA del reviewer)
  - Archivos: ninguno nuevo. `git add index.html styles.css app.js MEMORY.md specs/003-rediseno-visual/`
    (sin `._index.html`), commit en español y `git push` a `main`.
  - Hecho cuando: `gh api repos/{owner}/{repo}/pages/builds/latest --jq .status` devuelve
    `built` con el commit nuevo y la web publicada se ve oscura (recargar sin caché).
  - [ ] **Prueba del usuario en el iPhone** (web publicada y app de la pantalla de inicio;
    recargar para que no salga la versión vieja):
    1. Semana: fondo oscuro; arrastrar más allá del principio y del final: lo que asoma
       es oscuro, no blanco (RNF-4).
    2. Rutinas: mantener el dedo en "Crear": se hunde, sin recuadro gris, y vuelve al
       soltar (RF-4); en "Editar": se oscurece sin moverse (RF-26).
    3. Tocar "Nueva rutina", KG y REPS: no hay zoom (RNF-3).
    4. Abrir el desplegable de un día: lista en oscuro y con flecha (RF-23, RF-24).
    5. "Nuevo ejercicio": el selector de foto se lee sobre el fondo (RF-23).
    6. Rutina vacía → "Empezar entrenamiento" gris y legible; ejercicio con 20 series →
       "+ Serie" gris y legible; ningún botón blanco sobre claro ni oscuro sobre oscuro
       (RF-7, RF-8).
    7. Si alguna versión de Safari no tiñe la barra de arriba, no es un fallo (RF-24).

## Cobertura RF → tarea

| RF | Tareas | RF | Tareas |
|---|---|---|---|
| RF-1 | T1, T7 | RF-14 | T2, T5, T7 |
| RF-2 | T1, T5, T7 | RF-15 | T2, T5, T7 |
| RF-3 | T2, T7 | RF-16 | T2, T5, T7 |
| RF-4 | T2, T7, T8 (iPhone) | RF-17 | T2, T6, T7 |
| RF-5 | T2, T7 | RF-18 | T6, T7 |
| RF-6 | T2, T7 | RF-19 | T6, T7 |
| RF-7 | T2, T7, T8 (iPhone) | RF-20 | T4, T7 |
| RF-8 | T2, T7, T8 (iPhone) | RF-21 | T6, T7 |
| RF-9 | T2, T7 | RF-22 | T6, T7 |
| RF-10 | T4, T7 | RF-23 | T4, T7, T8 (iPhone) |
| RF-11 | T3, T7 | RF-24 | T1, T7, T8 (iPhone) |
| RF-12 | T3, T7 | RF-25 | T2, T7 |
| RF-13 | T1, T5, T7 | RF-26 | T2, T7, T8 (iPhone) |
| RNF-1 a RNF-8 | T1 a T7; RNF-3 y RNF-4 también en T8 (iPhone) | | |
