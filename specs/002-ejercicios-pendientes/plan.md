# Plan 002 — Ejercicios pendientes

Spec: `specs/002-ejercicios-pendientes/spec.md` (Aprobada 2026-10-28). Se construye sobre
el plan 001, que sigue vigente: mismos archivos, mismo `cambiar()`, mismo `guardar()` en
una sola clave, mismos avisos en la página (nunca `alert()`).

## 1. Archivos y responsabilidades

| Archivo | Cambio |
|---|---|
| `app.js` bloque 1 (lógica) | Funciones nuevas: `migrar`, `ejerciciosDelEntreno`, `existeOrigen`, `guardarPendientes`, `olvidarCoincidentes`, `textoPregunta`, `aceptarPendiente`, `rechazarPendiente`, `olvidarSinOrigen`. Se amplían `terminarEntreno`, `sumarSerie` y `quitarSerie` para los ejercicios añadidos. Todas exportadas. |
| `app.js` bloque 2 (interfaz) | `cargar` pasa por `migrar`; `pantalla.preguntar`; bloque de preguntas en la vista Día; tarjetas de los ejercicios añadidos; `alEmpezar`, `alTerminar`, `alBorrarRutina`, `alBorrarEjercicio`, `alGuardarEjercicio` y el `click` de `#vista`. |
| `styles.css` | Estilo del bloque de preguntas (`.pregunta`), 375 px, botones de 16 px. |
| `index.html` | Sin cambios. |
| `tests/migracion.test.js` | Nuevo: `migrar`. |
| `tests/pendientes.test.js` | Nuevo: el resto de funciones de esta spec. |

Los 4 archivos de tests de la 001 **no se tocan** y deben seguir en verde. Eso obliga a
tres decisiones (ver 3.4): `datosVacios()` y `empezarEntreno()` no cambian, y
`entrenamiento.anadidos` es opcional.

## 2. Modelo de datos

### 2.1 Antes (formato 001, lo que hay hoy en `localStorage['getstrong']`)

```json
{
  "rutinas": [
    { "id": "lq3k9x-a1b2", "nombre": "Pierna", "ejercicios": [
      { "titulo": "Sentadilla", "foto": "data:image/jpeg;base64,...", "series": 3 },
      { "titulo": "Prensa", "foto": "data:image/jpeg;base64,...", "series": 4 }
    ] },
    { "id": "lq4m2z-c3d4", "nombre": "Torso", "ejercicios": [
      { "titulo": "Press banca", "foto": "data:image/jpeg;base64,...", "series": 3 }
    ] }
  ],
  "plan": { "2026-10-27": { "rutinaId": "lq3k9x-a1b2", "hecho": false } },
  "pesos": { "prensa": { "1": 80 } },
  "entrenamiento": {
    "fecha": "2026-10-27", "rutinaId": "lq3k9x-a1b2",
    "series": [
      [ { "kg": "40", "reps": "10" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" } ],
      [ { "kg": "80", "reps": "" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" } ]
    ]
  }
}
```

### 2.2 Después (formato 002)

```json
{
  "rutinas": [
    { "id": "lq3k9x-a1b2", "nombre": "Pierna", "ejercicios": [
      { "id": "lq3k9x-a1b2-0", "titulo": "Sentadilla", "foto": "data:...", "series": 3 },
      { "id": "lq3k9x-a1b2-1", "titulo": "Prensa", "foto": "data:...", "series": 4 }
    ] },
    { "id": "lq4m2z-c3d4", "nombre": "Torso", "ejercicios": [
      { "id": "lq4m2z-c3d4-0", "titulo": "Press banca", "foto": "data:...", "series": 3 },
      { "id": "lr1a2b-e5f6", "titulo": "Remo", "foto": "data:...", "series": 3 }
    ] }
  ],
  "plan": { "2026-10-28": { "rutinaId": "lq4m2z-c3d4", "hecho": false } },
  "pesos": { "prensa": { "1": 80 } },
  "pendientes": [
    { "titulo": "Sentadilla", "foto": "data:...", "numeros": [2, 3],
      "origen": { "rutinaId": "lq3k9x-a1b2", "ejercicioId": "lq3k9x-a1b2-0" } }
  ],
  "entrenamiento": {
    "fecha": "2026-10-28", "rutinaId": "lq4m2z-c3d4",
    "series": [
      [ { "kg": "60", "reps": "8" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" } ],
      [ { "kg": "", "reps": "" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" } ],
      [ { "kg": "85", "reps": "10" }, { "kg": "", "reps": "" }, { "kg": "", "reps": "" } ]
    ],
    "anadidos": [
      { "titulo": "Prensa", "foto": "data:...", "numeros": [2, 3, 4],
        "origen": { "rutinaId": "lq3k9x-a1b2", "ejercicioId": "lq3k9x-a1b2-1" } }
    ]
  }
}
```

En el ejemplo, "Torso" tiene 2 ejercicios, así que `series[0]` y `series[1]` son los de la
rutina y `series[2]` es el primer añadido (`anadidos[0]`, "Prensa" con las series 2, 3 y 4).

### 2.3 (a) Id por ejercicio
- Cada ejercicio lleva `id`. Los nuevos reciben `nuevoId()` en `alGuardarEjercicio`; al
  editar se conserva el `id` que tenía (la interfaz lo copia en el objeto que pasa a
  `guardarEjercicio`, que no cambia).
- Los ejercicios guardados sin `id` reciben en la migración `rutina.id + '-' + posición`
  (`"lq3k9x-a1b2-0"`). Es determinista (el mismo cada vez que se carga) y no puede chocar
  con un `nuevoId()`, que solo tiene un guion. Basta con que el id sea único dentro de su
  rutina: el origen siempre va con `rutinaId`.
- **Por qué**: el origen de un pendiente tiene que sobrevivir a que se borre o renombre un
  ejercicio anterior de la rutina (la posición cambia, el título se puede editar).
- **Descartado**: identificar el origen por título (RF-15 exige olvidarlo aunque se haya
  renombrado) o por posición (borrar un ejercicio anterior apuntaría al siguiente).

### 2.4 (b) Migración: `migrar(datos)`
Función pura, devuelve una copia (`structuredClone`):
1. A cada ejercicio sin `id` le pone `rutina.id + '-' + i`. Los que ya tienen `id` no se tocan.
2. Si no hay `pendientes`, pone `pendientes: []`.
3. No toca nada más: ni `plan`, ni `pesos`, ni `entrenamiento`.

`cargar()` pasa a ser `migrar(texto === null ? datosVacios() : JSON.parse(texto))`.

Cómo se garantiza que no se pierde nada (principio 5):
- **Solo añade campos**, nunca quita ni cambia uno existente. Test: quitando a lo migrado
  los `id` y `pendientes` añadidos, queda exactamente lo de entrada (`deepEqual`).
- **No escribe al cargar**: la migración vive en memoria y se guarda con el primer
  `cambiar()` del usuario. Si nunca cambia nada, `localStorage` sigue tal cual. Como los
  ids son deterministas, cargar dos veces sin guardar da los mismos ids. Así abrir la app
  no puede fallar por espacio ni dejar nada a medias.
- **Idempotente**: `migrar(migrar(x))` = `migrar(x)`. Test.
- **Entreno abierto con formato antiguo**: `{ fecha, rutinaId, series }` sigue siendo
  válido tal cual, porque `anadidos` es opcional (ausente = ninguno). Test: un entreno
  antiguo migrado se puede escribir, sumar/quitar series y terminar, y deja sus pendientes.
- Si el JSON está roto, `cargar()` sigue sin capturarlo (decisión de la 001): datos vacíos
  sobrescribirían lo guardado.
- **Descartado**: guardar la versión del formato (`version: 2`). Con un solo cambio de
  formato, "le falta el campo" ya dice si hay que migrar.

### 2.5 (c) Ejercicios añadidos en `entrenamiento`
- `series` sigue indexado por posición: primero los ejercicios de la rutina (`0..n-1`, con
  `n = rutina.ejercicios.length`) y detrás los añadidos, en el orden en que se aceptan.
- `anadidos[k]` describe la posición `n + k`: `{ titulo, foto, numeros, origen }`.
  `numeros[j]` es el número de serie que se ve en la fila `j` (el original). Va en
  paralelo a `series[n + k]`: al sumar una serie se añade `último + 1`; al quitarla, se
  quita el último.
- La posición es estable mientras el entreno está abierto porque su rutina no se puede
  editar (RF-39 de la 001).
- **Por qué**: `escribirValor`, `erroresEntreno`, `alEscribir` y los `data-ejercicio` /
  `data-serie` de la 001 funcionan sin cambios con los añadidos (RF-12: misma validación
  gratis).
- **Descartado**: rehacer `entrenamiento` como lista de `{ id, titulo, foto, filas }`.
  Más limpio, pero rompe tests de la 001 y obliga a convertir el entreno abierto.

### 2.6 (d) Cola de pendientes y preguntas sin responder
- **Cola**: `datos.pendientes` (en `localStorage`, RF-16). El orden del array es el orden
  de llegada: `guardarPendientes` añade siempre al final (RF-5, RF-14).
- **Pregunta a la vista**: siempre la primera de la cola, `datos.pendientes[0]`.
  "Añadir" y "No" la quitan de la cola en el mismo `cambiar()` (se guarda al momento); los
  no respondidos siguen en la cola y conservan su sitio (RF-11).
- **"Hay preguntas abiertas"**: `pantalla.preguntar` (solo en memoria, `false` al
  arrancar). Se pone a `true` al empezar un entrenamiento nuevo y a `false` al terminarlo.
  El bloque se pinta si `pantalla.preguntar` y hay entreno abierto en ese día y la cola no
  está vacía. Al recargar vale `false`: no se pregunta hasta el siguiente "Empezar" (RF-7,
  RF-11).
- Mientras hay un entreno abierto no pueden llegar pendientes nuevos (solo se crean al
  terminar), así que la cola durante el entreno es exactamente "los del principio, menos
  los respondidos y los olvidados por RF-15".
- **Descartado**: guardar en `pantalla` una lista de preguntas propia. Habría que
  mantenerla al día con RF-15 y con las respuestas; con `pendientes[0]` sale sola.

### 2.7 Tamaño en `localStorage`
- Cada pendiente y cada añadido copia su foto (~38 KB). Aceptar mueve la foto de
  `pendientes` a `anadidos` (no la duplica); terminar la vuelve a mover si queda pendiente.
- Crecimiento acotado: un pendiente se olvida al empezar cualquier entreno de una rutina
  con ese título (RF-8), así que en la práctica hay como mucho uno por ejercicio. Peor caso
  razonable: 20 ejercicios con foto en rutinas + 20 pendientes ≈ 1,5 MB de ~5 MB.
- Si no cabe: `guardar()` falla, aparece "No queda espacio para guardar" y, como todo va
  en un solo `setItem`, no se guarda nada a medias (ni Previo ni pendientes, el entreno no
  termina). Para liberar espacio el usuario puede responder "No" o borrar ejercicios.
- Límite conocido: si algún día no cabe, se podría guardar en el pendiente solo una
  referencia a la foto del origen cuando no ha cambiado. No se hace ahora (la spec pide
  copia y el tamaño no lo exige).

## 3. Funciones puras (bloque 1)

### 3.1 Nuevas
| Función | Qué hace | RF |
|---|---|---|
| `migrar(datos)` | Ver 2.4. | RF-16, principio 5 |
| `ejerciciosDelEntreno(datos)` | Lista, en el orden de la tabla, de `{ titulo, foto, numeros, origen }` para cada posición de `entrenamiento.series`: los de la rutina (`numeros` = 1..filas, `origen` = `{ rutinaId, ejercicioId: ejercicio.id }`) y después `entrenamiento.anadidos \|\| []`. La usan `terminarEntreno`, `guardarPendientes`, `sumarSerie` y la interfaz. | RF-9, RF-12, RF-13 |
| `existeOrigen(datos, origen)` | `true` si existe la rutina `origen.rutinaId` y tiene un ejercicio con `id === origen.ejercicioId`. | RF-14, RF-15 |
| `guardarPendientes(datos)` | Para cada ejercicio del entreno, en orden: los `numeros` de sus filas con `leerPeso(kg) === null` son las series sin hacer; si hay alguna y `existeOrigen`, añade al final de `pendientes` `{ titulo, foto, numeros: sinHacer, origen }`. No cierra el entreno. | RF-1, RF-2, RF-3, RF-14, RF-15 |
| `olvidarCoincidentes(datos)` | Quita de `pendientes` los que `coinciden` en título con algún ejercicio de la rutina del entreno abierto. | RF-8 |
| `textoPregunta(pendiente)` | "Te quedó sin hacer Prensa (4 series). ¿Añadirlo a este entrenamiento?" ("1 serie" en singular). Texto plano: se escapa al pintar. | RF-5 |
| `aceptarPendiente(datos)` | Quita `pendientes[0]`, lo añade a `entrenamiento.anadidos` (lo crea si falta) y añade a `series` una fila vacía por cada número. No toca la rutina. | RF-9 |
| `rechazarPendiente(datos)` | Quita `pendientes[0]`. | RF-10 |
| `olvidarSinOrigen(datos)` | Quita los pendientes con `!existeOrigen`. Se llama tras borrar una rutina o un ejercicio. | RF-15 |

### 3.2 Ampliadas
| Función | Cambio | RF |
|---|---|---|
| `terminarEntreno(datos)` | Recorre `ejerciciosDelEntreno`: Previo por `normalizar(titulo)` y `numeros[j]` (no `j + 1`). Para la rutina da lo mismo que hoy. | RF-13 |
| `sumarSerie(datos, i)` | Suma solo si el último número es menor que 20; en un añadido, también añade `último + 1` a `numeros`. En la rutina equivale a "menos de 20 filas" (test de la 001 intacto). | RF-12 |
| `quitarSerie(datos, i)` | Igual que hoy (quita la última fila si hay más de 1); en un añadido, también quita el último de `numeros`. | RF-12 |

Sin cambios: `datosVacios`, `empezarEntreno`, `escribirValor`, `erroresEntreno`,
`guardarEjercicio`, `borrarEjercicio`, `borrarRutina`.

### 3.3 Pseudocódigo
```
"Empezar entrenamiento" (alEmpezar, clave):
    si hay otro entreno abierto: aviso RF-38 y salto, SIN tocar pantalla.preguntar   // RF-7
    si no puede empezar: salir
    pantalla.preguntar = true
    cambiar(olvidarCoincidentes(empezarEntreno(datos, clave)))                       // RF-8

"Terminar entrenamiento" (alTerminar):
    errores = erroresEntreno(...)          // cuenta también las filas de los añadidos (RF-12)
    si hay errores: igual que la 001 y salir                                          // RF-4
    pantalla.preguntar = false
    cambiar(terminarEntreno(guardarPendientes(datos)))     // un solo setItem: todo o nada

"Añadir" / "No":  cambiar(aceptarPendiente(datos)) / cambiar(rechazarPendiente(datos))

Borrar rutina / ejercicio (tras confirm):
    cambiar(olvidarSinOrigen(borrarRutina(datos, id)))                                // RF-15
    cambiar(olvidarSinOrigen(borrarEjercicio(datos, idRutina, indice)))
```

### 3.4 Decisiones para no romper los 43 tests de la 001
- `datosVacios()` no añade `pendientes` (su test compara el objeto exacto): lo añade
  `migrar`, por la que pasa `cargar()`.
- `empezarEntreno()` no añade `anadidos` (su test compara el objeto exacto):
  `ejerciciosDelEntreno` lee `anadidos || []` y `aceptarPendiente` lo crea.
- `pendientes` se trata en funciones nuevas (`guardarPendientes`, `olvidarSinOrigen`...)
  en vez de dentro de `terminarEntreno`, `borrarRutina` o `borrarEjercicio`, porque los
  datos de ejemplo de los tests de la 001 no tienen `pendientes`.
- **Descartado**: cambiar los tests de la 001 para el formato nuevo (la 001 está validada).

## 4. Interfaz (bloque 2)

- `pantalla.preguntar` (ver 2.6).
- **Bloque de preguntas** en `htmlDia`, solo con el entreno de ese día abierto,
  `pantalla.preguntar` y cola no vacía: `<div class="pregunta"><p>` +
  `escapar(textoPregunta(datos.pendientes[0]))` + `</p>` y los botones
  `<button data-aceptar="si">Añadir</button>` y `<button data-rechazar="si">No</button>`.
  Va arriba, antes de la primera tarjeta (posición exacta: decisión 1, confirmada). Escribir en las
  tablas no lo esconde: `input` no repinta (RF-5).
- **Tarjetas** con el entreno abierto: `htmlDia` recorre `ejerciciosDelEntreno(datos)` (no
  `rutina.ejercicios`), así salen los añadidos detrás con su foto y título copiados (con
  `escapar`, también en `src`). `htmlTablaEntreno` recibe `numeros`: muestra `numeros[j]`
  en "Serie" y `previo(pesos, titulo, numeros[j])`; "+ Serie" `disabled` si el último
  número es 20; "Quitar" en la última fila si hay más de una (RF-9, RF-12).
- `data-ejercicio` sigue siendo la posición en `series`: los añadidos son `n + k`.
- `alGuardarEjercicio`: `id: pantalla.indice === null ? nuevoId() : rutina.ejercicios[pantalla.indice].id`.
- "Continuar", tocar el día y el salto de RF-38 no tocan `pantalla.preguntar`: si había
  preguntas sin responder, siguen; si no, no aparecen (RF-7, RF-11).
- Sin `alert()`. Textos en español. Botones a 16 px.

### Decisiones de pantalla (confirmadas por el usuario el 2026-10-28)
1. Posición del bloque: debajo de "Terminar entrenamiento" / "Editar rutina" y
   encima de la primera tarjeta (la spec solo exige "arriba, antes de las tablas").
2. Los ejercicios añadidos se ven igual que los de la rutina, sin etiqueta "Añadido"
   (la spec no la pide).
3. El bloque muestra solo el texto y los dos botones, sin la foto del pendiente.
4. Tras "Añadir", la página no se desplaza hasta el ejercicio añadido (queda al final).
5. Si no queda espacio al terminar, el entrenamiento no termina hasta que el usuario libere
   espacio (ver 2.7).

## 5. Estrategia de tests (`node --test`)

- `tests/migracion.test.js`: ejercicios sin id reciben `rutinaId-i`; los que tienen id lo
  conservan; añade `pendientes: []` sin tocar uno existente; no pierde nada (quitando lo
  añadido, `deepEqual` con la entrada); idempotente; no modifica la entrada; un entreno
  abierto antiguo sigue igual y con él funcionan `escribirValor`, `sumarSerie`,
  `quitarSerie`, `guardarPendientes` y `terminarEntreno`.
- `tests/pendientes.test.js` (datos de ejemplo ya migrados, hoy = miércoles 28/10/2026):
  - `guardarPendientes`: aceptaciones de RF-1 (serie 3; Prensa 1-4; serie 4 añadida),
    RF-2 (peso 0; peso sin REPS), RF-3 (serie quitada), orden de la tabla, se añaden al
    final; RF-14 (añadido con 1-4 y peso en la 1 → 2, 3, 4 con el mismo origen, título y
    foto); excepción de RF-15 (origen borrado → no vuelve).
  - `ejerciciosDelEntreno`, `terminarEntreno` con añadidos (RF-13: 85 en la fila 2 →
    `previo(..., 'Prensa', 2)` = "85"), `sumarSerie`/`quitarSerie` en añadidos (2,3,4 → 5;
    19 → 20 y no más; solo fila 3 no se quita).
  - `olvidarCoincidentes` ("sentadilla " olvida "Sentadilla"); `textoPregunta` (1 y 4
    series); `aceptarPendiente` (al final, en orden de aceptación, rutina intacta, título y
    foto del pendiente aunque el origen haya cambiado); `rechazarPendiente`;
    `olvidarSinOrigen` (rutina borrada, ejercicio borrado, ejercicio renombrado y borrado).
  - Secuencias de la spec como funciones encadenadas: orden "Curl" → "Prensa" de dos
    entrenos; RF-5 aceptación 4 ("Prensa" y después "Curl"); RF-11 aceptación 3.
  - Ninguna función modifica los datos de entrada.
- Chrome a 375 px (consola limpia): el bloque, la tabla de los añadidos, recargas, RF-7,
  RF-11, almacenamiento lleno y títulos `<b>&"'`.

## 6. Tabla RF → dónde → verificación

| RF | Dónde | Verificación |
|---|---|---|
| RF-1 | `guardarPendientes`, `alTerminar` | Test + Chrome |
| RF-2 | `guardarPendientes` (`leerPeso` no `null` = hecha) | Test + Chrome |
| RF-3 | `guardarPendientes` (solo filas en `series`) | Test + Chrome |
| RF-4 | `alTerminar` (valida antes de `guardarPendientes`) | Chrome |
| RF-5 | `textoPregunta`, cola `pendientes`, bloque en `htmlDia` | Test + Chrome |
| RF-6 | Bloque solo con la cola no vacía | Chrome |
| RF-7 | `alEmpezar` (RF-38 no toca `pantalla.preguntar`), "Continuar" | Chrome (recarga) |
| RF-8 | `olvidarCoincidentes` en `alEmpezar` | Test + Chrome |
| RF-9 | `aceptarPendiente`, `ejerciciosDelEntreno`, `htmlTablaEntreno` con `numeros` | Test + Chrome |
| RF-10 | `rechazarPendiente` | Test + Chrome |
| RF-11 | `pantalla.preguntar`, `pendientes[0]` | Test (secuencias) + Chrome (cambio de vista y recarga) |
| RF-12 | `sumarSerie`, `quitarSerie`, `erroresEntreno` (sin cambios) | Test + Chrome |
| RF-13 | `terminarEntreno` con `numeros` | Test + Chrome |
| RF-14 | `guardarPendientes` con `anadidos` | Test + Chrome |
| RF-15 | `olvidarSinOrigen`, `existeOrigen` en `guardarPendientes` | Test + Chrome |
| RF-16 | `pendientes` en `datos`, `migrar` en `cargar` | Test + Chrome (recarga) |
