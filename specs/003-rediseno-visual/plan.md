# Plan 003 — Rediseño visual

Spec: `specs/003-rediseno-visual/spec.md` (Aprobada 2026-10-28). Cambio solo visual: no hay
lógica nueva, ni datos nuevos, ni textos nuevos. Los planes 001 y 002 siguen vigentes.

## 1. Archivos y responsabilidades

| Archivo | Cambio | RF |
|---|---|---|
| `styles.css` | Se reescribe por bloques (ver 3): variables de la paleta en `:root`, base, botones, cabecera, tarjetas, formularios y campos, tabla, avisos. | Todos |
| `index.html` | Solo dos metas en `<head>`: `<meta name="color-scheme" content="dark">` y `<meta name="theme-color" content="#100E1C">`. Nada más. | RF-24, RNF-4 |
| `app.js` (bloque 2) | Solo la clase `principal` en 5 botones (ver 4) y una línea `touchstart` en `iniciar()`. Ninguna otra línea cambia. | RF-3, RF-4, RF-26 |
| `tests/` | Sin cambios (ver 6). | RNF-6 |

Prohibido en esta spec (RNF-6, RNF-7, DA-13): tocar la lógica, los datos o los textos;
`appearance: none` en `select` o `input[type=file]`; fuentes o imágenes descargadas;
estados `:hover`; `manifest` o metas de pantalla completa / barra translúcida.

## 2. Funciones puras

Ninguna nueva ni modificada. "Hoy" no interviene en esta spec (solo se simula en las
pruebas de Chrome de RF-17, como en la 001: `sessionStorage.hoy`).

## 3. `styles.css` por bloques

Orden del archivo (importa: a igual especificidad gana lo último, ver 7.1).

### 3.1 Paleta en `:root` (un solo sitio por color)
```css
:root {
  --fondo: #100E1C;            /* página, cabecera y campos */
  --tarjeta: #1E1C2C;
  --hundido: #15131F;          /* zona de la tabla dentro de la tarjeta */
  --texto: #F2F1F7;
  --texto-secundario: #8D8AA0; /* también borde de los campos */
  --texto-desactivado: #9693AA;
  --azul: #6DB6F2;             /* botón principal, pestaña activa, foco, borde de la pregunta */
  --azul-relieve: #3F86C9;
  --texto-principal: #100E1C;
  --boton: #2C2A3D;            /* secundario, desactivado y línea de la cabecera */
  --boton-pulsado: #242235;
  --error: #FF6B6B;
  --fondo-error: #2A1620;
  --hecho: #6EE7A0;
}
```
Ningún otro hex aparece en el resto del archivo (se comprueba con una búsqueda de `#` fuera
de `:root`). RF-1 y Definiciones (Paleta).

### 3.2 Base — RF-1, RF-2, RNF-3, RNF-4, RNF-5
- `html, body { background: var(--fondo) }` (las dos: el rebote de Safari enseña el de `html`).
- `body`: `color: var(--texto)`, `font-family: system-ui, -apple-system, sans-serif` (ya
  está; sin `@font-face` ni enlaces externos), `font-size: 16px`.
- `input, select, textarea, button { font-size: 16px; font-family: inherit }` se mantiene.
- Títulos: `h2 { font-size: 18px; font-weight: 700 }` ("Ejercicios", título de sección) y
  `.dia-cabecera h2, .formulario h2 { font-size: 24px }` (título del Día y de "Nuevo /
  Editar ejercicio"). Sin clases nuevas: son los únicos `h2` en esos contenedores.
- Textos secundarios en `var(--texto-secundario)`: `.vacio`, `.ejercicio-series`,
  `.formulario label`, `p.rutina-nombre` (nombre de la rutina en el Día), `.tabla-series th`
  y la columna Previo (3.7).
- `.hecho { color: var(--hecho) }`. RF-13, RF-17.
- `main` conserva `max-width: 600px; margin: 0 auto`. RNF-8.

### 3.3 Botones — RF-3 a RF-9, RF-25, RF-26
Regla común `button` = **botón secundario**; `.principal` lo sobrescribe; las pestañas
también (3.4).
```css
button {
  padding: 10px 14px; border: 0; border-radius: 12px;
  background: var(--boton); color: var(--texto);          /* RF-6, RF-7: siempre definido */
  -webkit-tap-highlight-color: transparent;               /* RF-4: sin recuadro gris */
  cursor: pointer;
}
button:active:not(:disabled) { background: var(--boton-pulsado); }   /* RF-26, sin transición */
button:disabled {                                          /* RF-7, RF-8 */
  background: var(--boton); color: var(--texto-desactivado);
  opacity: 1; cursor: default;                             /* Safari baja la opacidad por su cuenta */
}
.principal {                                               /* RF-3 */
  background: var(--azul); color: var(--texto-principal);
  border-bottom: 4px solid var(--azul-relieve);
  transition: margin-top 0.1s, border-bottom-width 0.1s;  /* RF-4: 0,1 s */
}
.principal:active:not(:disabled) {                         /* RF-4: hundido */
  background: var(--azul);                                 /* que no herede el gris pulsado */
  margin-top: 2px; border-bottom-width: 2px;               /* +2 arriba, −2 abajo: lo de debajo no se mueve */
}
.principal:disabled {                                      /* RF-8: sin relieve */
  background: var(--boton); color: var(--texto-desactivado);
  border-bottom-color: var(--boton);                       /* P1 a), confirmada */
}
@media (prefers-reduced-motion: reduce) { .principal { transition: none; } }  /* RF-5 */
:focus-visible { outline: 2px solid var(--azul); outline-offset: 2px; }       /* RF-9 */
```
- **Sin ninguna regla `:hover`** (RF-25). El navegador no cambia un botón con `background`
  propio al pasar el puntero.
- `.boton-ancho` se queda (`display: block; width: 100%`).
- `.quitar { padding: 6px 10px; font-size: 16px }` (secundario compacto, RF-19, RNF-3).
- `.sumar` sigue siendo secundario; sus márgenes van en 3.7.

### 3.4 Cabecera y pestañas — RF-11, RF-12
- `.cabecera`: `position: sticky; top: 0; background: var(--fondo);
  border-bottom: 1px solid var(--boton)`.
- `.pestanas button`, `.pestanas button:active` (las dos, ver 7.1): `background: transparent;
  color: var(--texto-secundario); border-radius: 0; border-bottom: 3px solid transparent;
  padding: 12px 0`.
- `.pestanas button.activa`: `color: var(--azul); font-weight: 700;
  border-bottom-color: var(--azul)`. El botón tiene `flex: 1`, así la línea ocupa todo su
  ancho.
- `.aviso-entreno`: `color: var(--texto)` sobre el fondo de la cabecera; su "Continuar"
  usa la regla común (secundario) con el relleno compacto que ya tiene.

### 3.5 Tarjetas — RF-13, RF-14, RF-15, RF-18, RF-21, RNF-2
- `.dia, .rutina, li.ejercicio, .tarjeta, .pregunta { background: var(--tarjeta);
  border-radius: 16px }`, con relleno de 16 px (salvo `.tarjeta`, 3.7).
- Títulos de tarjeta 18 px y 700: `.dia-nombre`, `span.rutina-nombre`, `.ejercicio-titulo`.
  `p.rutina-nombre` (Día) se queda normal, 16 px y secundario (misma clase, ver 7.1).
- `.pregunta`: `border: 2px solid var(--azul)`; `.pregunta p { overflow-wrap: anywhere }`
  (un título de 50 letras sin espacios en la pregunta no debe desbordar, RNF-2). Sus
  botones "Añadir" y "No" no llevan `principal`.
- `.miniatura`: `width: 56px; height: 56px; border-radius: 50%; object-fit: cover`
  (ya recorta sin deformar). Misma clase en Editar rutina y en el Día. RF-15, RF-18.
- Los `overflow-wrap: anywhere` de `.rutina-nombre` y `.ejercicio-texto` se mantienen.
- **Decisión confirmada por el usuario (2026-10-28, ajuste de T5, RF-15):** en Editar rutina,
  "Editar" y "Borrar" van debajo del título y las series, a la derecha de la foto, que ocupa
  las dos filas (como Liftoff). Solo CSS: `li.ejercicio { display: grid;
  grid-template-columns: 56px minmax(0, 1fr) }` y `li.ejercicio .miniatura { grid-row: span 2 }`.
  Motivo: en fila, el título se quedaba en ~87 px y partía "Dominadas" ("Domina / das").
  Ahora mide 247 px. `li.rutina` y la tarjeta del Día (`div.ejercicio`) no cambian.

### 3.6 Formularios y campos — RF-16, RF-23, RNF-3
- Solo los campos de texto se pintan: `input[type="text"] { background: var(--fondo);
  color: var(--texto); border: 1px solid var(--texto-secundario); border-radius: 12px;
  padding: 10px }`. Cubre "Nueva rutina", nombre, título, series, KG y REPS.
- `select` y `input[type="file"]` **sin colores ni `appearance`**: los pinta el navegador
  en oscuro gracias a la meta `color-scheme` (RF-23, RF-24, DA-13). Por eso los colores no
  van en `.campo` (la lleva también el selector de foto): `.campo` queda solo para el
  ancho y el margen.
- `.vista-previa { border-radius: 16px; max-width: 100% }`. RF-16.
- Los botones de los formularios siguen en `.fila` (alineados por `align-items: stretch`,
  así "Guardar" en relieve y "Cancelar" miden lo mismo de alto).

### 3.7 Vista Día y tabla — RF-17 a RF-22, RNF-2
- `.botones-dia { flex-direction: column }`: "Empezar/Terminar entrenamiento" y "Editar
  rutina" uno debajo de otro y a todo el ancho; en la semana siguiente "Editar rutina"
  solo, también a todo el ancho. Sin cambiar el marcado.
- `.tarjeta { padding: 0; overflow: hidden }` y `.tarjeta .ejercicio { padding: 16px;
  background: transparent }`: la cabecera (foto + título) lleva el relleno y la tabla
  llega a los dos bordes; `overflow: hidden` recorta la tabla con las esquinas de 16 px.
- `.tabla-series { background: var(--hundido); width: 100% }`; sin líneas entre filas
  (P2 a), confirmada).
- `.tabla-series td { font-size: 20px }` (número de serie y Previo) y `.celda { font-size:
  20px }` (KG y REPS). `.tabla-series td:nth-child(2) { color: var(--texto-secundario) }`
  (Previo). El botón "Quitar" no hereda los 20 px porque `button` fija 16 px.
- `.celda`: `width: 64px; padding: 6px 4px; text-align: center` (estilo de 3.6 por ser
  `type="text"`). Si a 375 px no cabe "102,5" entero o hay scroll horizontal, se para y
  se pregunta al usuario (DA-19); no se baja de 20 px por cuenta propia.
- `.celda.erroneo { border: 2px solid var(--error); background: var(--fondo-error);
  color: var(--error) }`. RF-20.
- `.sumar { margin: 12px 16px 16px }` (debajo de la tabla, sobre la tarjeta).

### 3.8 Avisos — RF-10
- `.aviso { color: var(--error); background: var(--fondo-error);
  border: 1px solid var(--error); border-radius: 12px }`. Mismo sitio que hoy (lo decide
  `htmlAviso()`, que no cambia).

## 4. Cambios en `app.js` (solo marcado y una línea)

| Función | Botón | Cambio | RF |
|---|---|---|---|
| `htmlRutinas` | "Crear" | `<button type="submit" class="principal">` | RF-3, RF-14 |
| `htmlEditarRutina` | "Añadir ejercicio" | `class="boton-ancho principal"` | RF-3, RF-15 |
| `htmlEjercicio` | "Guardar" | `<button type="submit" class="principal">` | RF-3, RF-16 |
| `htmlDia` | "Terminar entrenamiento" | `class="principal"` | RF-3, RF-17 |
| `htmlDia` | "Empezar entrenamiento" | `class="principal"` (también cuando lleva `disabled`: lo apaga `.principal:disabled`) | RF-3, RF-8, RF-17 |

No llevan `principal`: "Ver", "Editar", "Borrar", "Editar rutina", "Guardar" del nombre,
"Cancelar", "Quitar", "+ Serie", "Continuar", "Añadir", "No" (RF-6).

`touchstart`, primera línea de `iniciar()` tras `datos = cargar()` (solo corre en el
navegador, los tests no lo ven):
```js
// Safari en el iPhone solo aplica :active (botón hundido u oscurecido) si la página
// escucha algún toque; este listener vacío basta (RF-4, RF-26).
document.addEventListener('touchstart', () => {}, { passive: true });
```

## 5. Decisiones (con la alternativa descartada)
1. **Variables CSS en `:root`**. Cada color en un sitio; cambiar un tono es una línea.
   Descartado: hex repetidos por todo el archivo (fácil dejar uno viejo).
2. **La regla `button` es el secundario** y solo el principal lleva clase. Así cualquier
   botón olvidado sale gris con su color definido (lección de Safari, RF-7). Descartado:
   una clase `secundario` en 11 botones (más marcado y riesgo de olvidar uno).
3. **Hundido con `margin-top` +2 y `border-bottom-width` −2.** El alto total no cambia, así
   que lo de debajo no se mueve, y el relieve sigue siendo un borde medible (RF-3).
   Descartado: `box-shadow` como relieve (RF-3 pide borde inferior de 4 px) y solo
   `transform` (al encoger el borde, el contenido de debajo subiría 2 px).
4. **Títulos y columna Previo por selector** (`.dia-cabecera h2`, `.formulario h2`,
   `td:nth-child(2)`) en vez de clases nuevas: menos cambios en `app.js`. Descartado:
   clases `titulo-pantalla` y `previo` (RNF-6 las permitiría, pero no hacen falta).
5. **Campos: colores solo en `input[type="text"]`.** Descartado: estilizar `select` y el
   selector de foto (exigiría `appearance: none` o perder la flecha, fuera de alcance).
6. **Botones del Día en columna por CSS** (`.botones-dia`). Descartado: añadir
   `boton-ancho` a cada botón en `htmlDia`.
7. **Sin test nuevo** (ver 6).

## 6. Estrategia de pruebas

### 6.1 `node --test`
- Debe seguir en **84/84** sin tocar ningún test. Se ejecuta tras cada tarea: demuestra
  que añadir clases y la línea `touchstart` no rompe la carga de `app.js` en node.
- **No se añade ningún test**: no hay función pura nueva ni cambiada (principio 4 pide
  test por función pura). Un test que leyera `styles.css` o `index.html` buscando textos
  solo comprobaría cadenas, se rompería con cualquier cambio de formato y no prueba lo que
  importa (cómo se ve). Eso se verifica midiendo en Chrome (6.2).

### 6.2 Chrome headless a 375 px (CDP)
Scripts de base en
`/private/tmp/claude-501/-Volumes-1TB-Documents-Negocios-GetStrong/43a0bdc7-d870-44b8-8a01-7e334126b42e/scratchpad/`
(`cdp.mjs`, `botones.mjs`). Servir con `python3 -m http.server` (no `file://`), ventana de
375 px, `window.confirm` sustituido y "hoy" simulado (`sessionStorage.hoy` con
`Page.addScriptToEvaluateOnNewDocument`) en el miércoles 28/10/2026.

**Datos de prueba** (pegados en `localStorage['getstrong']`): "Pierna" con "Sentadilla"
(3 series, con Previo) y "Prensa"; una rutina vacía; una rutina con nombre de 50 letras sin
espacios; un ejercicio de título de 50 letras y otro con `<b>&"'`; un día hecho; un
pendiente.

**Capturas** (una por vista y estado): Semana actual, Siguiente, Rutinas (con aviso de
error), Editar rutina (con ejercicios y vacía), Ejercicio nuevo (con foto y con error),
Día sin entreno, Día con entreno (3 series; "-5" señalado; 20 series; bloque de
preguntas), Día con el entreno de otro día abierto, Día de la semana siguiente, Día de
rutina vacía, y "Crear" pulsado.

**Mediciones** (`getComputedStyle`, colores en `rgb()`):

| Hex | rgb | Hex | rgb |
|---|---|---|---|
| #100E1C | 16, 14, 28 | #2C2A3D | 44, 42, 61 |
| #1E1C2C | 30, 28, 44 | #242235 | 36, 34, 53 |
| #15131F | 21, 19, 31 | #9693AA | 150, 147, 170 |
| #F2F1F7 | 242, 241, 247 | #FF6B6B | 255, 107, 107 |
| #8D8AA0 | 141, 138, 160 | #2A1620 | 42, 22, 32 |
| #6DB6F2 | 109, 182, 242 | #6EE7A0 | 110, 231, 160 |
| #3F86C9 | 63, 134, 201 | | |

- `html` y `body`: `backgroundColor` = fondo; `body` `color` = texto (RF-1).
- Botón principal: fondo, color, `borderBottomWidth` 4px y color relieve,
  `borderTopLeftRadius` ≥ 12px; todos los demás botones con fondo #2C2A3D (RF-3, RF-6). Por
  pantalla: contar botones con fondo azul (≤ 1; 0 en Semana y Día de la semana siguiente).
- Pulsado: `Input.dispatchMouseEvent` `mousePressed` sobre "Crear" → `marginTop` 2px,
  `borderBottomWidth` 2px y el `getBoundingClientRect().top` de la lista no cambia; sobre
  "Editar" → fondo #242235 y su rect no cambia (RF-4, RF-26). `transitionDuration` 0.1s,
  y 0s con `Emulation.setEmulatedMedia` `prefers-reduced-motion: reduce` (RF-5).
- `mouseMoved` sobre "Crear", "Editar" y "Rutinas": nada cambia (RF-25).
- Desactivados ("Empezar" en rutina vacía, "+ Serie" con la 20): fondo #2C2A3D, color
  #9693AA, sin borde azul, y pulsarlos no cambia nada (RF-8).
- Tab por Rutinas: `outlineColor` #6DB6F2 en cada elemento enfocado (RF-9).
- Títulos: `fontSize` ≥ 24px y `fontWeight` ≥ 700 en el Día y en el formulario; 18px en
  "Ejercicios"; ≥ 18px y 700 en títulos de tarjeta (RF-2).
- Tabla: fondo #15131F; ancho de la tabla = ancho de la tarjeta; `fontSize` ≥ 20px en
  número, Previo y celdas; Previo y `th` en #8D8AA0; la celda con "102,5" tiene
  `scrollWidth <= clientWidth` (RF-18, RF-19).
- Campos de texto: fondo, color y borde de RF-23; `fontSize` ≥ 16px en `input`, `select`
  y "Quitar" (RNF-3).
- Error: `.aviso` y `.celda.erroneo` con sus colores y bordes de 1 y 2 px (RF-10, RF-20).
- En cada vista, `document.documentElement.scrollWidth === 375` (RNF-2).
- Red: ningún `requestWillBeSent` de fuentes ni de otro dominio (RF-2, RNF-5).
- Consola limpia (`Runtime.consoleAPICalled` / `exceptionThrown`; el 404 de
  `favicon.ico` no es de la app).

### 6.3 iPhone (tras publicar, la hace el usuario)
Web publicada y app de la pantalla de inicio: botón hundido y secundario oscurecido al
mantener el dedo sin recuadro gris (RF-4, RF-26), desactivados legibles (RF-7, RF-8),
desplegable con flecha y lista en oscuro, selector de foto legible (RF-23, RF-24), rebote
arriba y abajo sin franjas blancas (RNF-4), tocar campos sin zoom (RNF-3).

## 7. Riesgos

### 7.1 Especificidad (selectores que se pisan)
| Regla | Especificidad | Riesgo y solución |
|---|---|---|
| `button:active:not(:disabled)` | 0,2,1 | Gana a `.pestanas button` (0,1,1): las pestañas se oscurecerían al pulsar. Solución: `.pestanas button:active` (0,2,1) declarada después. |
| `button:disabled` | 0,1,1 | Gana a `.principal` (0,1,0): bien, el desactivado no sale azul. `.principal:disabled` (0,2,0) quita además el relieve. |
| `.principal:active:not(:disabled)` | 0,3,0 | Gana al gris pulsado; por eso repite `background: var(--azul)`. |
| `.rutina-nombre` vs `p.rutina-nombre` | 0,1,0 / 0,1,1 | Misma clase: título de tarjeta en Rutinas y texto secundario en el Día. `p.rutina-nombre` debe poner color, 16 px y peso normal. |
| `li.ejercicio` vs `.tarjeta .ejercicio` | 0,1,1 / 0,2,0 | La cabecera de la tarjeta del Día no debe pintar otra tarjeta: `background: transparent`, relleno propio. |
| `.campo` vs `input[type="text"]` | 0,1,0 / 0,1,1 | Colores solo en `input[type="text"]`; el selector de foto (`.campo` de tipo file) queda nativo. |
| `.tabla-entreno td` vs `.tabla-series td` | 0,1,1 ambas | La de entreno va después y solo cambia el relleno. |

### 7.2 `:active` en iOS
Safari ignora `:active` si no hay listener de toque: lo resuelve la línea `touchstart`. El
recuadro gris se quita con `-webkit-tap-highlight-color: transparent`. Solo se puede
confirmar en el iPhone (6.3).

### 7.3 Controles nativos
- `select` y `input[type=file]` dependen de `color-scheme: dark`; iOS puede pintarlos a su
  manera (aceptado, RF-23). No se les pone fondo para no perder la flecha.
- Safari pone a `button:disabled` su propio color y, en algunas versiones, menos
  opacidad: por eso `color` y `opacity: 1` explícitos (RF-7, lección de MEMORY.md).
- `-webkit-text-fill-color`: si en Safari el texto de un campo o botón desactivado sale
  con otro color, se añade `-webkit-text-fill-color: currentColor` en esa regla.

### 7.4 Tabla a 375 px con 20 px
Ancho útil de la tarjeta: 375 − 2·16 = 343 px. Estimado: Serie ~40 + Previo ~60 + KG 68 +
REPS 68 + "Quitar" ~72 + rellenos ~20 ≈ 328 px. Margen de unos 15 px: hay que medirlo con
"102,5" y con 20 series. Si no cabe, se pregunta (DA-19). No se usa `overflow-wrap` global
(partiría números en celdas estrechas).

### 7.5 Lo que ya existe y se reaprovecha
`.pestanas` (flex: 1), `.aviso-entreno` (relleno compacto de "Continuar"), `.celda.erroneo`
(lo añade `alTerminar` tras `pintar()`), `.pregunta`, `.boton-ancho`, `.miniatura`
(`object-fit: cover`), `.fila` (`min-width: 0` del campo), `.dia-controles select`
(`min-width: 0`). Se cambian sus colores y medidas, no sus nombres.

## 8. Trazabilidad RF → archivo y selector

| RF | Dónde |
|---|---|
| RF-1 | `styles.css`: `:root`, `html, body`, textos secundarios (3.2) |
| RF-2 | `styles.css`: `body` (fuente del sistema), `h2`, `.dia-cabecera h2`, `.formulario h2`, títulos de tarjeta |
| RF-3 | `styles.css`: `.principal`; `app.js`: 5 botones (4) |
| RF-4 | `styles.css`: `.principal:active:not(:disabled)`, `transition`, tap highlight; `app.js`: `touchstart` |
| RF-5 | `styles.css`: `@media (prefers-reduced-motion: reduce)` |
| RF-6 | `styles.css`: regla `button` |
| RF-7 | `styles.css`: `button`, `button:disabled` (color y fondo siempre definidos) |
| RF-8 | `styles.css`: `button:disabled`, `.principal:disabled`, `:not(:disabled)` en los `:active` |
| RF-9 | `styles.css`: `:focus-visible` |
| RF-10 | `styles.css`: `.aviso` |
| RF-11 | `styles.css`: `.cabecera`, `.pestanas button`, `.pestanas button:active`, `.activa` |
| RF-12 | `styles.css`: `.aviso-entreno`, `.aviso-entreno button` |
| RF-13 | `styles.css`: `.dia`, `.dia-nombre`, `.hecho`, `.vacio` |
| RF-14 | `styles.css`: `.rutina`, `span.rutina-nombre`, `.fila`; `app.js`: "Crear" |
| RF-15 | `styles.css`: `li.ejercicio`, `.miniatura`, `.ejercicio-titulo`, `.ejercicio-series`, `h2`, `.boton-ancho`; `app.js`: "Añadir ejercicio" |
| RF-16 | `styles.css`: `.formulario h2`, `.formulario label`, `.campo`, `.vista-previa`; `app.js`: "Guardar" |
| RF-17 | `styles.css`: `.dia-cabecera h2`, `p.rutina-nombre`, `.botones-dia`; `app.js`: Empezar/Terminar |
| RF-18 | `styles.css`: `.tarjeta`, `.tarjeta .ejercicio`, `.tabla-series`, `td`, `th`, `td:nth-child(2)` |
| RF-19 | `styles.css`: `.celda`, `.quitar`, `.sumar`, `.tabla-entreno td` |
| RF-20 | `styles.css`: `.celda.erroneo` |
| RF-21 | `styles.css`: `.pregunta`, `.pregunta p` |
| RF-22 | `styles.css`: `.vacio` |
| RF-23 | `styles.css`: `input[type="text"]`; `select` y `input[type=file]` sin tocar |
| RF-24 | `index.html`: metas `color-scheme` y `theme-color` |
| RF-25 | `styles.css`: ninguna regla `:hover` |
| RF-26 | `styles.css`: `button:active:not(:disabled)`; `app.js`: `touchstart` |
| RNF-1 | Paleta de la spec (contrastes ya calculados) + mediciones 6.2 |
| RNF-2 | `overflow-wrap` existentes y `.pregunta p`; medición `scrollWidth` |
| RNF-3 | `input, select, textarea, button { font-size: 16px }`, `.quitar` |
| RNF-4 | `html, body` con fondo + `color-scheme` + `theme-color` |
| RNF-5 | Sin `@font-face` ni recursos externos |
| RNF-6 | Solo los cambios de 4 en `app.js`; 84/84 |
| RNF-7 | Ningún texto cambia (revisar el diff de `app.js`: solo `class=` y la línea `touchstart`) |
| RNF-8 | `main { max-width: 600px; margin: 0 auto }` |

## 9. Preguntas abiertas (la spec no lo decide) — resueltas
- **P1. Altura de "Empezar entrenamiento" desactivado.** a) Conserva el borde inferior de
  4 px pintado del mismo gris que el fondo: mide lo mismo que activo y no se ve relieve.
  b) Sin borde inferior: 4 px más bajo que cuando está activo. **Recomendación: a)**
  (la pantalla no "salta" al pasar de una rutina vacía a una con ejercicios). **Resuelta: a), confirmado por el usuario, 2026-10-28.**
- **P2. Líneas entre filas de la tabla.** a) Sin líneas, como Liftoff (hoy hay una gris
  clara que en oscuro desentona). b) Línea de 1 px en #2C2A3D. **Recomendación: a)**
  (menos ruido y no usa un color de la paleta para algo que la spec no menciona). **Resuelta: a), confirmado por el usuario, 2026-10-28.**
- **P3. Esquinas de los campos de texto** (la spec fija las de tarjetas y botones, no las
  de los campos). a) 12 px, como los botones. b) Las de hoy (casi rectas).
  **Recomendación: a)**. **Resuelta: a), confirmado por el usuario, 2026-10-28.**

Las tres se confirmaron con la opción a), que es la que ya está escrita en 3.3, 3.6 y 3.7.
