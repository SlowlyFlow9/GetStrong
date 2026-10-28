# MEMORY.md

## Estado
- 001 validada (43 RF; RF-8 probado en el iPhone el 2026-10-27). 002 validada y publicada.
- 003-rediseno-visual (oscuro, Liftoff): validada (APROBADO, 84/84) y publicada; falta la prueba en el iPhone.
- Ideas: aviso del domingo (exige servidor), historial, reordenar.

## Decisiones
- Stack: HTML/CSS/JS puros + localStorage. Nombres en español: el usuario lee el código sin traducir.
- Nunca borrar ni sobrescribir datos sin acción del usuario: solo existen en localStorage, sin copia.
- `app.js` es script normal (file:// bloquea módulos): `module.exports` si hay `module`, `iniciar()` si hay `document`.
- Avisos en la página (`<p class="aviso">`), nunca `alert()`; solo `confirm()` para borrar. Todo cambio por `cambiar(nuevos)`: guarda y solo si va bien sustituye `datos` (así se sabe si
  ha ido bien: `datos === nuevos`). Las funciones de cambio hacen `structuredClone` y devuelven
  la copia, así si `guardar` falla nada cambia. `htmlAviso()` pinta y vacía `pantalla.aviso`.
- Eventos por delegación en `#vista` con atributos `data-*` (`data-dia`, `data-empezar`...).
- `cargar()` no captura JSON roto (datos vacíos sobrescribirían lo guardado). Validaciones
  devuelven `''` o el texto del error. `leerPeso`/`leerReps`: `null` = vacío, `NaN` = no válido.
- `erroresEntreno` desde 0; `previo(pesos, titulo, n)` desde 1. "✓ Hecho" vive en `plan[día]`.
- Fotos: miniatura canvas 400 px JPEG 0,7 (~38 KB). `avisarSiBloqueada()` = RF-39. Entreno: el `input` guarda sin repintar (no pierde el foco). `terminarEntreno` no valida: antes `erroresEntreno`; `.erroneo` tras `pintar()`.
- 002: `cargar()` = `migrar(...)`: `id` determinista (`rutinaId-posición`) y `pendientes: []` sin escribir.
- 002: `ejerciciosDelEntreno` (rutina + `anadidos`) es la única fuente de títulos y números.
  Sin hacer = `leerPeso(kg) === null`, al final de la cola; la pregunta es `pendientes[0]`.
- 002: `alTerminar` hace un solo `cambiar()` (un setItem: sin espacio no se guarda nada a medias).
- 002: `alEmpezar` (solo entreno nuevo, respeta RF-38) activa `pantalla.preguntar` antes de
  `cambiar()` (que ya repinta) y la quita si no se ha guardado. Continuar/RF-38 no la tocan.
- 003: colores solo como variables en `:root` (styles.css). Fondo en `html, body` (rebote de
  Safari). `select`/file sin estilo: los oscurece la meta `color-scheme`.
- 003: `button` = secundario; solo 5 botones llevan `principal` (uno olvidado sale gris y legible).
  Hundido = `margin-top` +2 y borde −2 (lo de debajo no se mueve). `touchstart` vacío: `:active` en iOS.
- 003: pestañas = texto sin fondo; `.pestanas button:active` en la misma regla y después de
  `button:active:not(:disabled)` (misma fuerza, gana la última). Subrayado: borde 3 px (transparente si inactiva).
- 003 T5: tarjetas con relleno 16; `.miniatura` círculo de 56 (también en el Día). `li.ejercicio`
  en rejilla (decisión del usuario): foto en 2 filas, botones debajo del título (en fila partía "Dominadas").
- 003 T6: `.tarjeta` sin relleno + `overflow: hidden` (tabla de borde a borde); `.tabla-series .celda`
  gana a `input[type="text"]`. Tabla a 20 px: natural 311 de 343 px ("102,5": 48 en 54).

## Errores a evitar
- Chrome: la extensión no abre `file://` (usar `python3 -m http.server`); si no conecta,
  headless por CDP sustituyendo `window.confirm`. 375 px solo en headless (la ventana no baja de 500).
- Pruebas: "hoy" simulado con `Page.addScriptToEvaluateOnNewDocument` + `sessionStorage.hoy`;
  "sin espacio" llenando `localStorage` y haciendo crecer el JSON (foto grande). El 404 de
  `favicon.ico` no es de la app.
- iPhone: `index.html` desde Archivos no ejecuta JS (usar la web publicada).
- Nunca `new Date('AAAA-MM-DD')` (UTC): usar `fechaDeClave`. Sumar días con `new Date(a, m, d + n)`.
  Semanas de lunes a domingo. Funciones de fecha reciben `hoy` como parámetro.
- Definir siempre `color` en los botones: Safari en el iPhone pone el suyo (salía blanco sobre
  blanco y en Chrome no se veía). Arreglado en la regla común `button` el 2026-10-28.
- 003: campos solo en `input[type="text"]` (gana a `.campo`/`.celda`; el file con `.campo` queda nativo y en
  Chrome ya trae `appearance: none` de serie). Ningún hex fuera de `:root`. Ni ":hover" en el CSS.
- Datos de prueba: foto obligatoria (sin ella, imagen rota); pendiente ≠ título de la rutina (se olvida).
