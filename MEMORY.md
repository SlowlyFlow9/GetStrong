# MEMORY.md

## Estado
- Spec `001-rutinas` terminada y validada (APROBADO, 43 RF, 43 tests en verde). RF-8 (cámara y
  galería) probado por el usuario en su iPhone el 2026-10-27.
- Siguiente: spec 002 de ejercicios pendientes (notas en `specs/002-ejercicios-pendientes/notas.md`).
- Ideas futuras: notificación del domingo (exige servidor: cambiar antes la constitución),
  historial y resumen mensual, reordenar ejercicios.
- Probar en el iPhone: `python3 -m http.server 8000` en el proyecto y abrir `http://<IP del Mac>:8000`.

## Decisiones
- Stack: HTML/CSS/JS puros + localStorage. Nombres en español: el usuario lee el código sin traducir.
- Nunca borrar ni sobrescribir datos sin acción del usuario: los datos solo existen en localStorage y no hay copia.
- `app.js` es script normal (Chrome bloquea módulos en file://); exporta con `module.exports` si
  existe `module` y arranca `iniciar()` solo si existe `document`. Arriba solo funciones y constantes.
- Avisos en rojo en la página (`<p class="aviso">`), nunca `alert()`; solo `confirm()` para borrar.
- Semanas de lunes a domingo; `diasDeSemana` suma días con `new Date(a, m, d + n)` para que el
  cambio de hora no salte ni repita días.
- Interfaz: todo cambio pasa por `cambiar(nuevos)` (guarda y solo si va bien sustituye `datos`).
  `htmlAviso()` pinta y vacía `pantalla.aviso`; cada vista lo pone arriba de su contenido.
  Eventos por delegación en `#vista`: `data-dia`, `data-ver`, `data-empezar`, `data-editar`, `data-borrar`, `data-form`, `data-*-ejercicio`, `data-volver`.
- Vista Día: "Editar rutina" reutiliza `data-editar` (RF-39 ya incluido). `alEmpezar` aplica
  RF-38 y nunca reinicia el entreno abierto del mismo día (se perdería lo escrito).
- `cargar()` no captura JSON roto a propósito: datos vacíos sobrescribirían lo guardado.
- Validaciones devuelven `''` o el texto exacto del error; `validarEjercicio` solo el primero
  (título, imagen, repetido, series). `leerPeso`/`leerReps`: `null` = vacío, `NaN` = no válido.
- `erroresEntreno` usa posiciones desde 0 (`serie: 0` es la "Serie 1" en pantalla).
- Funciones de cambio (`guardarRutina`, `asignarRutina`...) hacen `structuredClone` y devuelven
  la copia: si `guardar` falla, los datos en memoria siguen intactos.
- "✓ Hecho" vive en la entrada del día de `plan`: quitar/borrar elimina la entrada, así la marca
  no puede volver al reasignar. Asignar la misma rutina no toca nada (conserva la marca).
- Ejercicios: vista 'ejercicio' con `pantalla.indice` (null = nuevo) y `pantalla.foto` (la foto
  sobrevive a los repintados). `repintarEjercicio()` conserva título y series escritos. Aviso
  justo encima de "Guardar"; botón "Cancelar" vuelve a 'editar'. Miniatura con canvas (lado
  mayor 400 px, JPEG 0,7, fondo blanco): ~38 KB por foto; 20 fotos ≈ 0,8 MB.
  `avisarSiBloqueada()` aplica RF-39 en abrir/guardar/borrar ejercicio. `alElegirFoto` no
  repinta si ya se salió del formulario y, si el archivo no es imagen, conserva la foto anterior.
- Entreno (T9): en la vista Día, si `entrenamiento.fecha === clave`, la tabla es
  Serie/Previo/KG/REPS (`data-ejercicio/serie/campo`), "Terminar entrenamiento" va donde
  estaba "Empezar" y el aviso de la vista Día va justo encima de esos botones. `input` guarda
  sin repintar (no se pierde el foco). `terminarEntreno` no valida: antes `erroresEntreno`;
  `.erroneo` se añade tras `pintar()`. Aviso RF-37 en `#aviso-entreno` con `#continuar`.
- `previo(pesos, titulo, n)`: `n` desde 1 (como en pantalla); `pesos[titulo normalizado][n]`.

## Errores a evitar
- La extensión de Chrome puede no estar conectada: T5-T9 se verificaron con Chrome headless
  por CDP (scripts en el scratchpad), sustituyendo `window.confirm`. Fotos de prueba: File
  hecho con canvas y asignado a `input.files` con DataTransfer. "Hoy" simulado (T9):
  `Page.addScriptToEvaluateOnNewDocument` que cambia `Date` según `sessionStorage.hoy`.
- En el iPhone, abrir `index.html` desde Archivos no ejecuta JS (vista previa): usar la web publicada.
- Nunca `new Date('AAAA-MM-DD')` (UTC): usar `fechaDeClave`. Nunca sumar días en ms (cambio de hora).
- Funciones de fecha sin `new Date()` dentro: reciben `hoy` como parámetro.
- En `escapar`, sustituir `&` el primero.
