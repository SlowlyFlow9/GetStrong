# MEMORY.md

## Estado
- 001-rutinas validada (43 RF); RF-8 probado en el iPhone el 2026-10-27.
- 002 implementada y validada (APROBADO, 16/16 RF, 84 tests); siguiente paso, publicar en
  GitHub Pages y recoger el feedback del uso real en el iPhone (casilla pendiente en tasks.md).
- Ideas futuras: notificación del domingo (exige servidor), historial, reordenar ejercicios.

## Decisiones
- Stack: HTML/CSS/JS puros + localStorage. Nombres en español: el usuario lee el código sin traducir.
- Nunca borrar ni sobrescribir datos sin acción del usuario: solo existen en localStorage, sin copia.
- `app.js` es script normal (Chrome bloquea módulos en file://): `module.exports` si existe
  `module`, `iniciar()` si existe `document`.
- Avisos en rojo en la página (`<p class="aviso">`), nunca `alert()`; solo `confirm()` para borrar.
- Todo cambio por `cambiar(nuevos)`: guarda y solo si va bien sustituye `datos` (así se sabe si
  ha ido bien: `datos === nuevos`). Las funciones de cambio hacen `structuredClone` y devuelven
  la copia, así si `guardar` falla nada cambia. `htmlAviso()` pinta y vacía `pantalla.aviso`.
- Eventos por delegación en `#vista` con atributos `data-*` (`data-dia`, `data-empezar`...).
- `cargar()` no captura JSON roto (datos vacíos sobrescribirían lo guardado). Validaciones
  devuelven `''` o el texto del error. `leerPeso`/`leerReps`: `null` = vacío, `NaN` = no válido.
- `erroresEntreno` usa posiciones desde 0; `previo(pesos, titulo, n)`, `n` desde 1.
- "✓ Hecho" vive en la entrada del día de `plan` (quitar/borrar la elimina; reasignar la conserva).
- Fotos: miniatura canvas 400 px JPEG 0,7 (~38 KB). `avisarSiBloqueada()` = RF-39.
- Entreno: el `input` guarda sin repintar (no se pierde el foco). `terminarEntreno` no valida:
  antes `erroresEntreno`; `.erroneo` se añade tras `pintar()`.
- 002: `cargar()` = `migrar(...)`: añade `id` determinista (`rutinaId-posición`) y
  `pendientes: []` sin escribir (se guarda con el primer `cambiar()`).
- 002: `ejerciciosDelEntreno` (rutina + `anadidos`) es la única fuente de títulos y números.
  Sin hacer = `leerPeso(kg) === null`, al final de la cola; la pregunta es `pendientes[0]`.
- 002: `alTerminar` hace un solo `cambiar()` (un setItem: sin espacio no se guarda nada a medias).
- 002: `alEmpezar` (solo entreno nuevo, respeta RF-38) activa `pantalla.preguntar` antes de
  `cambiar()` (que ya repinta) y la quita si no se ha guardado. Continuar/RF-38 no la tocan.
- 002: borrar rutina/ejercicio olvida sus pendientes en el mismo cambio; renombrar no.

## Errores a evitar
- Chrome: la extensión no abre `file://` (usar `python3 -m http.server`); si no conecta,
  headless por CDP sustituyendo `window.confirm`. 375 px solo en headless (la ventana no baja de 500).
- Pruebas: "hoy" simulado con `Page.addScriptToEvaluateOnNewDocument` + `sessionStorage.hoy`;
  "sin espacio" llenando `localStorage` y haciendo crecer el JSON (foto grande). El 404 de
  `favicon.ico` no es de la app.
- iPhone: `index.html` desde Archivos no ejecuta JS (usar la web publicada).
- Nunca `new Date('AAAA-MM-DD')` (UTC): usar `fechaDeClave`. Sumar días con `new Date(a, m, d + n)`.
  Semanas de lunes a domingo. Funciones de fecha reciben `hoy` como parámetro.
- En `escapar`, `&` el primero.
- Definir siempre `color` en los botones: Safari en el iPhone pone el suyo (salía blanco sobre
  blanco y en Chrome no se veía). Arreglado en la regla común `button` el 2026-10-28.
