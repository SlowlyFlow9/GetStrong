# MEMORY.md

## Estado
- 001 validada (43 RF; RF-8 probado en el iPhone el 2026-10-27). 002 validada y publicada.
- 003-rediseno-visual (oscuro, Liftoff): validada (APROBADO, 84/84) y publicada; falta la prueba en el iPhone.
- 004-compartir-rutinas: T1-T8 hechas (100 tests; repaso headless de punta a punta en verde). Sigue `/sdd-validate`; T9 (push + iPhone) la hace el usuario.
- Ideas: aviso del domingo (exige servidor), historial, reordenar.

## Decisiones
- Stack: HTML/CSS/JS puros + localStorage. Nombres en español: el usuario lee el código sin traducir.
- Nunca borrar ni sobrescribir datos sin acción del usuario: solo existen en localStorage, sin copia.
- `app.js` es script normal (file:// bloquea módulos): `module.exports` si hay `module`, `iniciar()` si hay `document`.
- Avisos en la página (`<p class="aviso">`), nunca `alert()`; solo `confirm()` para borrar. Todo cambio por `cambiar(nuevos)`:
  guarda y solo si va bien sustituye `datos` (`datos === nuevos` = ha ido bien). Funciones de cambio: `structuredClone` + devolver copia.
- Eventos por delegación en `#vista` con atributos `data-*` (`data-dia`, `data-empezar`...).
- `cargar()` no captura JSON roto (datos vacíos sobrescribirían lo guardado). Validaciones: `''` o el error. `leerPeso`/`leerReps`: `null` vacío, `NaN` no válido.
- `erroresEntreno` desde 0; `previo(pesos, titulo, n)` desde 1. "✓ Hecho" vive en `plan[día]`.
- Fotos: miniatura canvas 400 px JPEG 0,7 (~38 KB). `avisarSiBloqueada()` = RF-39. Entreno: el `input` guarda sin repintar (no pierde el foco). `terminarEntreno` no valida: antes `erroresEntreno`; `.erroneo` tras `pintar()`.
- 002: `cargar()` = `migrar(...)`: `id` determinista (`rutinaId-posición`) y `pendientes: []` sin escribir.
- 002: `ejerciciosDelEntreno` (rutina + `anadidos`) única fuente de títulos; sin hacer = `leerPeso(kg) === null`.
  `alTerminar`: un solo `cambiar()`. `alEmpezar` activa `pantalla.preguntar` antes de `cambiar()` y la quita si no se guarda.
- 003: colores solo como variables en `:root` (styles.css). Fondo en `html, body` (rebote de
  Safari). `select`/file sin estilo: los oscurece la meta `color-scheme`.
- 003: `button` = secundario; solo 5 botones llevan `principal` (uno olvidado sale gris y legible).
  Hundido = `margin-top` +2 y borde −2 (lo de debajo no se mueve). `touchstart` vacío: `:active` en iOS.
- 003: pestañas = texto sin fondo; `.pestanas button:active` tras `button:active:not(:disabled)`. `.tarjeta` sin relleno + `overflow: hidden`.
- 004 T1-T3: `archivoRutina`/`importarRutina` copian campo a campo (con `structuredClone` se colaría `id`); ids `id-posición`.
  `leerArchivoRutina` reutiliza `validarEjercicio` (`typeof number` antes: "3" no vale), nunca lanza. Nombre: `validarRutina(datos, null, n)`.
- 004 T4: `alCompartir` síncrono hasta `navigator.share` (exige el toque); sin `canShare` (file://, Android con .json)
  o error ≠ `AbortError` → `descargar()` con `<a download>`, revocando la URL a 1 s. Ni `cambiar()` ni `pintar()`.
- 004 T5-T6: "Importar" hace `click()` a `#archivo-importar` (hidden, sin `accept`) → `alElegirArchivo` → `importar()` → `cambiar()`.
  `pantalla.importando` (solo memoria) cambia Crear por `.pregunta` (sin CSS nuevo); `pintar()` lo borra fuera de Rutinas, `importar()` siempre.
  `archivo.text()` con `.catch` (iCloud sin descargar = NotReadableError): mismo aviso de RF-10, solo si sigue en Rutinas.
- 004 T7 (RF-15, opción A): `alEditarRutina` siempre abre "Editar rutina" (para poder compartir); el bloqueo
  de RF-39 vive en cada acción (`alGuardarNombre`, `avisarSiBloqueada`, `alBorrarRutina`). Acción nueva = su comprobación.

## Errores a evitar
- Chrome: la extensión no abre `file://`; headless por CDP (Node 24 trae `WebSocket`), `confirm` con `Page.handleJavaScriptDialog`.
  Repaso completo reutilizable: `scratchpad/t8/prueba.mjs` (vistas 001-004, 375 px, consola). Descargas: `Browser.setDownloadBehavior` en la sesión del navegador (no la de la página).
  Importar: `DOM.setFileInputFiles`; el `click()` con `userGesture: true` y `Page.setInterceptFileChooserDialog`
  (si no, la consola avisa "File chooser dialog can only be shown with a user activation").
- iPhone: `index.html` desde Archivos no ejecuta JS. "Sin espacio": llenar `localStorage` y que crezca el JSON (foto grande).
  "Hoy" simulado: `Page.addScriptToEvaluateOnNewDocument` + `sessionStorage.hoy`. El 404 de `favicon.ico` no es de la app.
- Nunca `new Date('AAAA-MM-DD')` (UTC): usar `fechaDeClave`. Sumar días con `new Date(a, m, d + n)`.
  Semanas de lunes a domingo. Funciones de fecha reciben `hoy` como parámetro.
- Definir siempre `color` en los botones: Safari en el iPhone pone el suyo (salía blanco sobre
  blanco y en Chrome no se veía). Arreglado en la regla común `button` el 2026-10-28.
- 003: campos solo en `input[type="text"]` (gana a `.campo`/`.celda`; el file con `.campo` queda nativo y en
  Chrome ya trae `appearance: none` de serie). Ningún hex fuera de `:root`. Ni ":hover" en el CSS.
- Datos de prueba: foto obligatoria (sin ella, imagen rota); pendiente ≠ título de la rutina (se olvida).
