# Plan 004 — Compartir rutinas

Spec: `specs/004-compartir-rutinas/spec.md` (aprobada). Se construye sobre los planes 001,
002 y 003, que siguen vigentes: mismos tres archivos, mismo `cambiar()` con un solo
`setItem`, avisos en la página con `htmlAviso()` (nunca `alert()`), eventos por delegación
en `#vista` con `data-*`, botón secundario por defecto y como mucho un `class="principal"`
por pantalla.

## 1. Archivos y responsabilidades

| Archivo | Cambio |
|---|---|
| `app.js` bloque 1 (lógica) | Funciones puras nuevas: `archivoRutina`, `nombreArchivo`, `leerArchivoRutina`, `importarRutina`. Exportadas. Ninguna función existente cambia. |
| `app.js` bloque 2 (`alEditarRutina`) | Deja abrir "Editar rutina" de la rutina del entrenamiento abierto (sección 6, RF-15). |
| `app.js` bloque 2 (interfaz) | Botón "Compartir" en `htmlEditarRutina` + `alCompartir` + `descargar`; botón "Importar" y `<input type="file" hidden>` en `htmlRutinas` + `alElegirArchivo`; pregunta de RF-7 en `htmlRutinas` + `pantalla.importando` + `alImportarConNombre`; una línea en `pintar()`; ramas nuevas en `click`, `change` y `submit` de `#vista`. |
| `styles.css` | Una regla: separación entre "Añadir ejercicio" y "Compartir" (`.boton-ancho + .boton-ancho`). La pregunta reutiliza `.pregunta` (tarjeta con borde azul de la 002/003). |
| `index.html` | Sin cambios. |
| `tests/compartir.test.js` | Nuevo: las cuatro funciones y la regla de "Resolver el nombre". |

Los tests de las specs 001 y 002 **no se tocan** y siguen en verde.

## 2. Formato del archivo de rutina

```json
{
  "app": "GetStrong",
  "version": 1,
  "nombre": "Pierna",
  "ejercicios": [
    { "titulo": "Sentadilla", "foto": "data:image/jpeg;base64,...", "series": 3 },
    { "titulo": "Prensa", "foto": "data:image/jpeg;base64,...", "series": 4 }
  ]
}
```

- Solo esos campos: sin `id`, días, Previo, pendientes ni entrenamiento (definición
  "Archivo de rutina", RF-2).
- La foto es la miniatura ya guardada (`data:image/jpeg;base64,...`, ~38 KB): no se
  vuelve a procesar.
- `version` se escribe y no se comprueba al importar (decisión aprobada).
- Se escribe con `JSON.stringify(objeto, null, 2)`: legible si alguien lo abre, y el
  tamaño lo dominan las fotos.

## 3. Funciones puras (bloque 1)

| Función | Qué hace | RF |
|---|---|---|
| `archivoRutina(rutina)` | Devuelve el **texto** del archivo (sección 2) a partir de una rutina guardada: `nombre` tal cual y, por cada ejercicio en orden, `{ titulo, foto, series }`. No toca la rutina recibida. | RF-1, RF-2, RF-13, RF-14 |
| `nombreArchivo(nombre)` | `nombre.replace(/[\/\\:*?"<>\|]/g, '-') + '.json'`. "Pierna/Glúteo" → "Pierna-Glúteo.json". | RF-1, RF-13 |
| `leerArchivoRutina(texto)` | Comprueba si el texto es un "Archivo válido". Si lo es devuelve una rutina limpia `{ nombre, ejercicios: [{ titulo, foto, series }] }` con nombre y títulos **recortados** y sin campos de más; si no, `null`. Nunca lanza errores. | RF-5, RF-10, RF-14 |
| `importarRutina(datos, id, rutina, nombre)` | Copia de `datos` (`structuredClone`) con la rutina añadida **al final** de `rutinas`: `{ id, nombre: nombre.trim(), ejercicios }`, cada ejercicio `{ id: id + '-' + i, titulo, foto, series }`. No toca `plan`, `pesos`, `pendientes` ni `entrenamiento`. | RF-5, RF-6, RF-8, RF-14, RF-16 |

Ninguna depende de la fecha, así que ninguna recibe "hoy".

### 3.1 `leerArchivoRutina` en pseudocódigo
```
intentar objeto = JSON.parse(texto); si falla → null          // jpg, archivo roto (RF-10)
si objeto no es un objeto (null, número, lista...) → null
si objeto.app !== 'GetStrong' → null
si nombre no es texto → null
nombre = objeto.nombre.trim(); si vacío o nombre.length > 50 → null
si objeto.ejercicios no es una lista → null                     // [] sí vale (RF-14)
limpia = { nombre, ejercicios: [] }
para cada e de objeto.ejercicios:
    si e no es objeto, e.titulo no es texto, e.foto no es texto o e.series no es número → null
    si e.titulo.trim().length > 50 → null
    si e.foto no empieza por /^data:image\/[\w.+-]+;base64,/ o e.foto.length > 204800 → null
    si validarEjercicio(limpia, null, e.titulo, e.foto, String(e.series)) !== '' → null
        // reutiliza la 001: título vacío, sin foto, título repetido y series 1-20 (leerSeries)
    limpia.ejercicios.push({ titulo: e.titulo.trim(), foto: e.foto, series: e.series })
devolver limpia
```
- "Longitud" = `.length` del texto recortado: es lo mismo que cuenta `maxlength="50"`
  (definición "Longitud").
- `String(e.series)` + `leerSeries` rechaza 3.5, -1, 0, 21 y `1e21`; el `typeof` previo
  rechaza `"3"` y `[3]`.
- Un enlace `http(s)://` no empieza por `data:image/` → no válido.
- Los campos de más (`"autor"`) no se copian: se ignoran.
- La validez se comprueba aquí, antes de mirar si el nombre se repite (RF-10).

### 3.2 "Resolver el nombre" = `validarRutina(datos, null, nombre)` (sin función nueva)
| Momento | `validarRutina` devuelve | Qué hace la interfaz | RF |
|---|---|---|---|
| Archivo válido recién elegido | `''` | importar con `rutina.nombre` | RF-5 |
| Archivo válido recién elegido | `'Ya hay una rutina con ese nombre'` | abrir la pregunta | RF-7 |
| Pulsar "Importar" en la pregunta | `''` | importar con lo escrito (recortado) | RF-8 |
| Pulsar "Importar" en la pregunta | el texto del error | aviso, pregunta abierta con lo escrito | RF-8 |

El archivo válido nunca tiene nombre vacío, así que al elegirlo solo puede salir "repetido".
Los tests de 3.2 van en `tests/compartir.test.js` con los casos de la spec.

## 4. Interfaz (bloque 2)

### 4.1 Compartir (RF-1, RF-2, RF-3, RF-13, RF-14, RF-15)
- `htmlEditarRutina`: debajo de "Añadir ejercicio" (que sigue siendo el único principal),
  `<button type="button" class="boton-ancho" data-compartir="si">Compartir</button>`.
- `alCompartir()`:
  ```
  rutina = la de pantalla.idRutina
  archivo = new File([archivoRutina(rutina)], nombreArchivo(rutina.nombre), { type: 'application/json' })
  si navigator.canShare existe y navigator.canShare({ files: [archivo] }):
      navigator.share({ files: [archivo] }).catch(error => {
          si error.name !== 'AbortError': descargar(archivo)   // RF-13; AbortError = cerrado (RF-3)
      })
  si no: descargar(archivo)                                    // RF-13
  ```
  Todo es síncrono hasta `navigator.share`: el navegador exige que se llame dentro del
  toque. No hay `cambiar()` ni `pintar()`: no cambia nada guardado (RF-2) ni sale aviso.
- `descargar(archivo)`: crea un `<a>` con `href = URL.createObjectURL(archivo)` y
  `download = archivo.name`, le hace `click()` y revoca la dirección con
  `setTimeout(..., 1000)` (revocarla al momento puede cortar la descarga).
- Con `file://` (no es contexto seguro) `navigator.canShare` no existe → descarga. Chrome
  en Android no admite compartir `.json` (`canShare` da `false`) → descarga.

### 4.2 Importar (RF-4, RF-5, RF-10, RF-11, RF-12, RF-14, RF-15, RF-16)
- `htmlRutinas`, formulario "Nueva rutina" (sin pregunta abierta): en la misma `.fila`,
  campo + "Crear" (principal) + `<button type="button" data-importar="si">Importar</button>`
  (secundario), y fuera de la fila `<input type="file" id="archivo-importar" hidden>`.
  **Sin `accept`**: la spec pide poder elegir cualquier archivo y en el iPhone un `.json`
  saldría gris con `accept=".json"`.
- `click` en `data-importar` → `document.getElementById('archivo-importar').click()`.
- `change` en `#archivo-importar` → `alElegirArchivo(evento.target.files[0])`:
  ```
  si no hay archivo: salir                                     // se cerró el selector
  archivo.text().then(texto => {
      si pantalla.vista !== 'rutinas': salir                   // ya se fue (como alElegirFoto)
      rutina = leerArchivoRutina(texto)
      si rutina === null: aviso 'Este archivo no es una rutina válida'; pintar(); salir   // RF-10
      si validarRutina(datos, null, rutina.nombre) !== '':                                  // RF-7
          pantalla.importando = rutina; pintar(); salir
      importar(rutina, rutina.nombre)                                                       // RF-5
  })
  ```
- `importar(rutina, nombre)`: `pantalla.importando = null;
  cambiar(importarRutina(datos, nuevoId(), rutina, nombre))`. Si no cabe, `guardar()` deja
  "No queda espacio para guardar" y `datos` no cambia (RF-11). Se guarda en
  `localStorage` como todo lo demás (RF-12).
- Ids (RF-16): la rutina recibe un `nuevoId()` y cada ejercicio `id + '-' + posición`.
  Nunca se reutiliza nada del archivo (no trae ids).
- Sin bloqueo por entrenamiento abierto: importar no toca la rutina del entreno (RF-15).

### 4.3 Pregunta de RF-7 (RF-7, RF-8, RF-9)
- `pantalla.importando`: rutina leída del archivo esperando nombre, o `null`. Solo en
  memoria: al recargar desaparece sola (RF-9).
- `pintar()`: primera línea nueva `if (pantalla.vista !== 'rutinas') pantalla.importando = null;`
  — cualquier cambio de pantalla (pestañas, "Continuar", "Editar"...) cancela (RF-9).
- `htmlRutinas` con `pantalla.importando`: en lugar del formulario "Nueva rutina",
  ```html
  <form class="formulario pregunta" data-form="importar">
    <p>Ya tienes una rutina llamada {escapar(nombre)}. Escribe otro nombre para importarla.</p>
    <div class="fila">
      <input id="nombre-rutina" type="text" maxlength="50" autocomplete="off"
             aria-label="Nombre de la rutina" value="{escapar(nombre)}">
    </div>
    <div class="fila">
      <button type="submit" class="principal">Importar</button>
      <button type="button" data-cancelar-importar="si">Cancelar</button>
    </div>
  </form>
  ```
  (la maqueta exacta de filas la ajusta T6 a 375 px). El campo reutiliza `id="nombre-rutina"`,
  así el `submit` ya lo lee y hereda 16 px y `maxlength` (RF-8, RF-14 de la 001). La lista
  de rutinas sigue debajo, sin cambios.
- `submit` con `data-form="importar"` → `alImportarConNombre(nombre)`:
  ```
  error = validarRutina(datos, null, nombre)
  si error: aviso error; pintar(); devolver lo escrito al campo; salir      // RF-8
  importar(pantalla.importando, nombre)                                     // RF-8
  ```
  (mismo patrón que `alGuardarNombre`).
- "Cancelar" → `pantalla.importando = null; pintar()` (RF-9).

## 5. Decisiones

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| "Resolver el nombre" es `validarRutina(datos, null, nombre)` + la tabla 3.2 | Una función `resolverNombre` nueva que devuelva `'importar' / 'preguntar' / aviso` | `validarRutina` ya hace exactamente esa comprobación (vacío, coincidencia sin mayúsculas ni espacios); una función nueva la repetiría. Los tests de la regla se escriben igual. |
| Ids de los ejercicios importados = `idRutina + '-' + posición` | Pasar a `importarRutina` una lista de ids o la función `nuevoId` | Mantiene la función pura y sin parámetros raros. Es el mismo esquema que `migrar` (plan 002, 2.3): basta con ser único dentro de la rutina, y la rutina tiene un `nuevoId()` propio. No choca con `nuevoId()` (un solo guion). |
| `leerArchivoRutina` reutiliza `validarEjercicio` | Repetir las reglas de título, foto, repetido y series | Así "lo que una rutina hecha a mano no admitiría" es literalmente la misma regla. |
| `archivoRutina` devuelve el texto | Devolver el objeto y hacer `JSON.stringify` en la interfaz | El test comprueba el archivo entero, también que es JSON correcto. |
| Elegir archivo con `<input type="file" hidden>` + botón que le hace `click()` | Estilizar el `<input type="file">` | El botón sale con el estilo secundario de la 003 sin CSS nuevo; el input visible no se puede igualar. |
| `pantalla.importando` se borra en `pintar()` si la vista no es Rutinas | Borrarlo en cada manejador de navegación | Una línea cubre todas las formas de salir, también las futuras. |
| Pregunta con la clase `.pregunta` | Estilo nuevo | Ya es la tarjeta con borde azul de la 003 (RNF-7). |
| Si no queda espacio al importar desde la pregunta, la pregunta se cierra | Mantenerla abierta | La spec solo pide no importar y avisar (RF-11); cerrarla es una línea menos y no pierde datos. |

## 6. Abrir "Editar rutina" con el entrenamiento abierto (RF-15; decidido: opción A)

"Compartir" está en "Editar rutina" (RF-1) y hoy `alEditarRutina` no deja **abrir** esa
pantalla para la rutina del entrenamiento abierto, así que no se cumpliría RF-15 ("con un
entrenamiento abierto de 'Pierna', compartir 'Pierna'"). El usuario ha elegido dejarla abrir.

- **Cambio:** `alEditarRutina(id)` pierde el `if (rutinaBloqueada(...))`: siempre hace
  `pantalla.vista = 'editar'; pantalla.idRutina = id; pintar();`. Se actualiza su
  comentario (ya no menciona RF-39). Nada más cambia.
- **Por qué basta:** cada acción de edición ya comprueba el bloqueo por su cuenta y muestra
  "Termina el entrenamiento antes de editar esta rutina" sin cambiar nada:
  | Acción en "Editar rutina" | Quién la bloquea hoy |
  |---|---|
  | "Guardar" del nombre (renombrar) | `alGuardarNombre` (`id !== null && rutinaBloqueada`) |
  | "Añadir ejercicio" | `alAbrirEjercicio(null)` → `avisarSiBloqueada()` |
  | "Editar" de un ejercicio (título, foto, series) | `alAbrirEjercicio(i)` → `avisarSiBloqueada()` |
  | "Borrar" de un ejercicio | `alBorrarEjercicio` → `avisarSiBloqueada()` (antes del `confirm`) |
  | "Borrar" la rutina (en la lista) | `alBorrarRutina` (`rutinaBloqueada`) |
  | "Compartir" | sin bloqueo: no cambia nada guardado (RF-2, RF-15) |
- **Efecto visible:** el aviso sale al intentar cada acción, no al pulsar "Editar". RF-39
  de la 001 se sigue cumpliendo (habla de "intentar editar o borrar", no de abrir).
- `rutinaBloqueada` (función pura, con test en `tests/rutinas.test.js`) no cambia.

## 7. Estrategia de tests (`node --test`)

`tests/compartir.test.js` (mismo estilo que los demás: `node:test`, `assert/strict`,
`require('../app.js')`). Foto de prueba corta: `'data:image/jpeg;base64,AAAA'`.

- `archivoRutina`: "Pierna" con Sentadilla 3 y Prensa 4 → `JSON.parse` da exactamente
  `{ app, version: 1, nombre, ejercicios: [{ titulo, foto, series }...] }` en orden, sin
  `id`; rutina vacía "Core" → `ejercicios: []`; no modifica la rutina recibida.
- `nombreArchivo`: "Pierna" → "Pierna.json"; "Pierna/Glúteo" → "Pierna-Glúteo.json";
  `a/b\c:d*e?f"g<h>i|j` → `a-b-c-d-e-f-g-h-i-j.json`.
- `leerArchivoRutina`:
  - ida y vuelta: `leerArchivoRutina(archivoRutina(rutina))` = la rutina sin ids; también "Core".
  - recorta: nombre "  Pierna  " y título " Prensa " → "Pierna" y "Prensa".
  - campo de más (`autor`, también dentro de un ejercicio) → válido y no aparece en el resultado.
  - `null` en: texto que no es JSON (contenido de un jpg), `null`, `[]`, `"hola"`; sin
    `app` o `app: "Otra"`; nombre vacío, "   ", no texto, 51 caracteres (50 vale, y
    también 50 con espacios alrededor); `ejercicios` ausente o no lista; ejercicio sin
    foto, foto `https://...`, foto de 204.801 caracteres (204.800 vale); título vacío,
    de 51 o repetido (" sentadilla " frente a "Sentadilla"); series 0, 21, 3.5, `"3"`.
  - nunca lanza (todos los casos anteriores dentro de `assert.doesNotThrow` o devolviendo `null`).
- `importarRutina`: añade al final con el nombre recortado, ejercicios en orden con
  `id + '-0'`, `id + '-1'`; `plan`, `pesos`, `pendientes` y `entrenamiento` iguales
  (`deepEqual`), también con un entreno abierto (RF-15); no modifica `datos`; RF-6:
  borrar un ejercicio de la copia (`borrarEjercicio`) no cambia la original; importar dos
  veces con ids distintos da ejercicios con ids distintos (RF-16); rutina vacía (RF-14).
- Regla 3.2 con `validarRutina`: " Pierna " frente a "Pierna" → repetido; "Pierna de
  Juan" → `''`; " pierna " → repetido; `''` y "   " → "La rutina necesita un nombre".

Interfaz (no se prueba con `node --test`): Chrome headless por CDP a 375 px, consola
limpia, `scrollWidth === 375`, campos ≥ 16 px:
- Importar: `DOM.setFileInputFiles` sobre `#archivo-importar` con archivos preparados en
  el scratchpad (válido, repetido, jpg, 21 series, foto `https://`, foto grande, sin
  `app`, campo de más, "Core").
- Compartir sin menú (RF-13): app abierta con `file://` en Chrome headless (la extensión
  no abre `file://`, MEMORY.md), `Browser.setDownloadBehavior` a una carpeta del
  scratchpad, pulsar "Compartir" y comprobar el archivo descargado y su nombre.
- Sin espacio (RF-11): llenar `localStorage` como en la 001/002.
- Entrenamiento abierto (RF-15, sección 6): ver T7; `node --test` demuestra que
  `rutinaBloqueada` sigue igual (test de la 001 sin tocar).
- iPhone (RF-1, RF-4): en la web publicada, tras publicar.

## 8. Tabla RF → dónde → verificación

| RF | Dónde | Verificación |
|---|---|---|
| RF-1 | `archivoRutina`, `nombreArchivo`, `alCompartir` (`navigator.share`) | Test + iPhone (web publicada) |
| RF-2 | `alCompartir` sin `cambiar()`; archivo sin días | Test (archivo) + Chrome (recargar: sigue asignada al martes) |
| RF-3 | `catch` ignora `AbortError` | iPhone (cerrar el menú: sin aviso) |
| RF-4 | Botón "Importar" + `#archivo-importar` sin `accept` | Chrome (secundario, junto a "Crear") + iPhone (elegir en Archivos) |
| RF-5 | `leerArchivoRutina`, `validarRutina`, `importarRutina` | Test + Chrome |
| RF-6 | `importarRutina` (copia con `structuredClone`, ids nuevos) | Test + Chrome |
| RF-7 | `pantalla.importando`, pregunta en `htmlRutinas` | Chrome |
| RF-8 | `alImportarConNombre` con `validarRutina`; `maxlength="50"` | Test (regla 3.2) + Chrome |
| RF-9 | "Cancelar", línea en `pintar()`, `pantalla` solo en memoria | Chrome (cancelar, Semana y volver, recargar) |
| RF-10 | `leerArchivoRutina` antes que el nombre | Test + Chrome |
| RF-11 | `cambiar()` / `guardar()` existentes | Chrome (`localStorage` lleno) |
| RF-12 | `localStorage` vía `cambiar()` | Chrome (recargar) |
| RF-13 | `descargar` cuando no hay `canShare` o falla | Test (`nombreArchivo`) + Chrome headless con `file://` |
| RF-14 | Todas aceptan `ejercicios: []` | Test + Chrome |
| RF-15 | Ningún bloqueo nuevo; `alEditarRutina` deja abrir (sección 6) | Test (`importarRutina` con entreno) + Chrome (T7) |
| RF-16 | `nuevoId()` + `id-posición` en `importarRutina` | Test + Chrome |
| RNF-6 | El archivo no lleva direcciones; validación independiente de la copia | Prueba en el iPhone entre dos copias publicadas |
| RNF-7 | Un solo `principal` por pantalla, `.pregunta` | Chrome (medir botones azules) |
