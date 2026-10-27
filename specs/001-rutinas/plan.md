# Plan 001 — Rutinas

Spec: `specs/001-rutinas/spec.md` (Aprobada 2026-10-27).

## 1. Archivos y responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Cabecera fija (aviso de entrenamiento abierto, pestañas "Esta semana" / "Siguiente", botón "Rutinas") y un `<main id="vista">` vacío que rellena `app.js`. Carga `styles.css` y `<script src="app.js">` (sin `type="module"`). |
| `styles.css` | Diseño móvil (375 px), campos a 16 px, textos largos que no desbordan, estado `.erroneo` para campos con error y `.aviso` (mensaje en rojo). |
| `app.js` | Dos bloques separados por un comentario grande: **1) Lógica pura** (sin DOM ni `localStorage`) y **2) Interfaz** (cargar/guardar, pintar vistas, eventos). Al final, el arranque y la exportación para tests. |
| `tests/*.test.js` | Tests de la lógica pura con `node:test` y `node:assert/strict`. |

No hay más archivos. `node --test` busca por defecto archivos `*.test.js`, así que los tests
deben llamarse así (`tests/fechas.test.js`, etc.).

## 2. Cómo se comparte la lógica entre navegador y node

Final de `app.js`:

```js
// En el navegador: arrancar la app. En node (tests) no hay document y no se arranca.
if (typeof document !== 'undefined') iniciar();
// En node: exportar la lógica pura para los tests. En el navegador se ignora.
if (typeof module !== 'undefined') module.exports = { claveFecha, diasDeSemana, /* ... */ };
```

Los tests hacen `const app = require('../app.js')`.

**Por qué**: un solo archivo de script normal funciona con doble clic (file://) y node lo
carga con `require` sin build ni paquetes.
**Descartado**: `type="module"` + `import` (Chrome bloquea módulos en file://) y un
`logica.js` aparte (la constitución fija tres archivos).

Regla para que `require` no falle: en el nivel superior de `app.js` solo hay declaraciones
de funciones y constantes; nada toca `document`, `window` ni `localStorage` fuera de
funciones de interfaz.

## 3. Modelo de datos (localStorage)

Una sola clave, `getstrong`, con todo el estado en JSON:

```json
{
  "rutinas": [
    {
      "id": "lq3k9x-a1b2",
      "nombre": "Pierna",
      "ejercicios": [
        { "titulo": "Sentadilla", "foto": "data:image/jpeg;base64,/9j/4AAQ...", "series": 3 }
      ]
    }
  ],
  "plan": {
    "2026-10-19": { "rutinaId": "lq3k9x-a1b2", "hecho": true },
    "2026-10-27": { "rutinaId": "lq3k9x-a1b2", "hecho": false }
  },
  "pesos": {
    "sentadilla": { "1": 60, "2": 62.5, "4": 50 }
  },
  "entrenamiento": {
    "fecha": "2026-10-27",
    "rutinaId": "lq3k9x-a1b2",
    "series": [
      [ { "kg": "40", "reps": "10" }, { "kg": "22,5", "reps": "" }, { "kg": "", "reps": "" } ]
    ]
  }
}
```

- `plan`: un día por clave `"AAAA-MM-DD"` (hora local). Un día sin entrada = vacío. Las
  semanas pasadas siguen ahí y simplemente no se piden (RF-22, RF-24). Cada día tiene una
  sola entrada, así que como máximo una rutina (RF-20).
- `pesos`: por título normalizado (`normalizar(titulo)` = sin espacios de los extremos y
  en minúsculas) y número de serie. Así dos ejercicios con título que coincide comparten
  Previo en cualquier rutina (RF-26) y un título nuevo no hereda pesos (RF-16).
- `entrenamiento`: `null` si no hay ninguno abierto. `series[i]` son las filas del
  ejercicio `i` de la rutina, con lo escrito tal cual (texto). Su longitud puede ser
  distinta de `ejercicio.series` (series añadidas o quitadas, RF-30) sin tocar la rutina.
- Rutinas con `id` (porque se pueden renombrar y el plan debe seguir apuntando a ellas).
  Ejercicios sin `id`: se identifican por su posición en la rutina.
  **Descartado**: `id` por ejercicio. No hace falta porque mientras hay entrenamiento
  abierto su rutina no se puede editar (RF-39), así que las posiciones no cambian.
- `id` nuevo: `Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)`,
  generado en la interfaz y pasado a la lógica (así los tests son deterministas).
  **Descartado**: `crypto.randomUUID()` (solo en contextos seguros; file:// no es fiable).

### Fotos (RF-8, RF-9)
- `<input type="file" accept="image/*">` sin `capture`: en iPhone ofrece galería y cámara.
- Miniatura: se carga con `URL.createObjectURL` en un `<img>`, se dibuja en un `<canvas>`
  con el lado mayor a **400 px** y se guarda con `canvas.toDataURL('image/jpeg', 0.7)`.
- Tamaño objetivo: **≤ 50 KB por foto** (suele quedar en 25-45 KB). 20 fotos ≈ 1 MB, muy
  por debajo de los ~5 MB de `localStorage`.
- Si el `<img>` da error (no es imagen o no se puede leer): aviso en la página "No se ha
  podido cargar la imagen" y la foto del formulario queda vacía.

### Escritura segura
- `guardar(nuevosDatos)`: `try { localStorage.setItem('getstrong', JSON.stringify(nuevosDatos)); return true } catch { pantalla.aviso = 'No queda espacio para guardar'; return false }`. El aviso se ve en la página al repintar (nunca `alert()`).
- Las funciones de cambio de la lógica **no modifican** los datos recibidos: hacen
  `structuredClone(datos)`, cambian la copia y la devuelven.
- Patrón único en la interfaz: `const nuevos = funcion(datos, ...); if (guardar(nuevos)) datos = nuevos; pintar();`.
  Como todo va en una sola clave, `setItem` guarda todo o nada: si falla, ni el
  almacenamiento ni la memoria cambian (nada a medias).
- **Descartado**: varias claves (una por rutina, plan, pesos): un fallo a mitad dejaría
  datos incoherentes.
- `cargar()`: lee la clave; si no existe devuelve `datosVacios()`.

## 4. Funciones puras (bloque 1 de app.js)

Todas reciben los datos o textos que necesitan; las de fecha reciben `hoy` (un `Date`).

### Fechas y textos — RF-1, RF-2, RF-24, RF-27, RF-37, RF-41, RNF-5
| Función | Qué hace |
|---|---|
| `claveFecha(fecha)` | `Date` → `"AAAA-MM-DD"` con `getFullYear/getMonth/getDate` (hora local). |
| `fechaDeClave(clave)` | `"AAAA-MM-DD"` → `new Date(a, m - 1, d)`. Nunca `new Date('AAAA-MM-DD')`. |
| `diasDeSemana(hoy, desplazamiento)` | 0 = semana actual, 1 = siguiente. Devuelve las 7 claves de lunes a domingo. Lunes = `hoy` menos `(getDay() + 6) % 7` días, usando `new Date(a, m, d + n)`. |
| `textoDia(clave)` | `"martes 27/10"` (nombres de días en un array en español). |
| `textoDiasAsignados(claves)` | `"al martes 27/10 y al viernes 6/11"`; con 3 o más, `"al A, al B y al C"`. |
| `normalizar(texto)` / `coinciden(a, b)` | `trim().toLowerCase()` y comparación. |
| `escapar(texto)` | Sustituye `& < > " '` por entidades. |

### Validación — RF-5, RF-6, RF-10 a RF-13, RF-31, RF-32
| Función | Qué hace |
|---|---|
| `validarRutina(datos, id, nombre)` | Devuelve `''` si vale, o "La rutina necesita un nombre" / "Ya hay una rutina con ese nombre" (ignora la propia rutina `id` al renombrar). |
| `leerSeries(texto)` | Entero de 1 a 20 (`/^\d+$/` tras `trim`) o `null`. |
| `validarEjercicio(rutina, indice, titulo, foto, textoSeries)` | `''` o el primer error en este orden: título vacío, sin foto, título repetido en la rutina (ignora el propio `indice`), series fuera de 1-20. |
| `leerPeso(texto)` | `null` si vacío; número si cumple `/^\d+([.,]\d+)?$/` (coma → punto); `NaN` si no (incluye negativos y letras). |
| `leerReps(texto)` | `null` si vacío; entero ≥ 0 si `/^\d+$/`; `NaN` si no. |
| `erroresEntreno(entrenamiento)` | Lista de `{ ejercicio, serie, campo: 'kg' \| 'reps', mensaje }` con "Peso no válido" o "Repeticiones no válidas". Vacía si todo vale. |

### Rutinas y plan — RF-4, RF-7, RF-15 a RF-18, RF-20 a RF-22, RF-35, RF-39, RF-40
| Función | Qué hace |
|---|---|
| `datosVacios()` | `{ rutinas: [], plan: {}, pesos: {}, entrenamiento: null }`. |
| `guardarRutina(datos, id, nombre)` | Si existe `id`, la renombra; si no, la crea con ese `id` y sin ejercicios. Guarda el nombre sin espacios de los extremos. |
| `guardarEjercicio(datos, id, indice, ejercicio)` | `indice === null` → añade al final (RF-7); si no, lo sustituye (RF-15, RF-16). |
| `borrarEjercicio(datos, id, indice)` | Quita el ejercicio. |
| `diasAsignados(datos, id, hoy)` | Claves de la semana actual y la siguiente con esa rutina, en orden de fecha. |
| `borrarRutina(datos, id)` | Quita la rutina y **todas** las entradas de `plan` con ese `rutinaId` (también pasadas). Al borrar la entrada se va también la marca "✓ Hecho". |
| `asignarRutina(datos, clave, id)` | Si el día ya tiene esa misma rutina, no cambia nada; si no, pone `{ rutinaId: id, hecho: false }`. |
| `quitarRutina(datos, clave)` | Borra la entrada del día (y con ella la marca). Si luego se asigna la misma rutina, entra con `hecho: false`. |
| `rutinaBloqueada(datos, id)` | `true` si el entrenamiento abierto es de esa rutina (RF-39). |
| `diaBloqueado(datos, clave)` | `true` si el entrenamiento abierto es de ese día (RF-40). |

### Entrenamiento — RF-26 a RF-30, RF-33 a RF-35, RF-38, RF-41
| Función | Qué hace |
|---|---|
| `previo(pesos, titulo, numeroSerie)` | `"60"`, `"22,5"`, `"0"` o `"–"` (punto decimal mostrado como coma). |
| `puedeEmpezar(datos, clave, hoy)` | `true` si `clave` está en `diasDeSemana(hoy, 0)` y su rutina tiene ejercicios. |
| `empezarEntreno(datos, clave)` | Crea `entrenamiento` con una fila `{ kg: '', reps: '' }` por serie de cada ejercicio. |
| `escribirValor(datos, ejercicio, serie, campo, texto)` | Guarda lo escrito en esa celda. |
| `sumarSerie(datos, ejercicio)` / `quitarSerie(datos, ejercicio)` | Añade una fila vacía al final (máx. 20) / quita la última (mín. 1). No toca la rutina. |
| `terminarEntreno(datos)` | Para cada fila con peso (`leerPeso` no `null`, también 0) guarda `pesos[normalizar(titulo)][n]`; las vacías no tocan su Previo; reps no se guardan. Marca `plan[fecha].hecho = true` y pone `entrenamiento = null`. Funciona igual si la fecha es de una semana ya pasada (RF-41). |

### Pseudocódigo de "Terminar entrenamiento" (interfaz)
```
errores = erroresEntreno(datos.entrenamiento)
si hay errores:
    marcar con .erroneo TODOS los campos de la lista
    pantalla.aviso = errores[0].mensaje   // solo el mensaje del primero; no termina (RF-32)
    pintar()
si no:
    nuevos = terminarEntreno(datos)
    si guardar(nuevos): datos = nuevos
    pintar()
```

## 5. Interfaz (bloque 2 de app.js)

Estado de pantalla en memoria: `pantalla = { vista, semana, clave, idRutina, indice, aviso }`.
`pintar()` decide qué vista dibujar en `#vista` y repinta siempre el aviso de arriba.
`hoy = new Date()` se calcula en cada `pintar()`.

### Decisiones de pantalla (confirmadas por el usuario)
1. **Errores y avisos dentro de la página, nunca `alert()`.** Se guardan en
   `pantalla.aviso`; `pintar()` lo dibuja como `<p class="aviso">` (texto en rojo, pasado
   por `escapar()`) junto al formulario o la vista correspondiente y luego lo vacía, así
   desaparece en el siguiente repintado. Incluye "No queda espacio para guardar" y los
   bloqueos de RF-38, RF-39 y RF-40. Las **confirmaciones de borrado sí usan `confirm()`**.
   **Por qué**: se ve mejor en el móvil y no bloquea las pruebas automáticas en Chrome.
   **Descartado**: `alert()` (bloquea la página y las pruebas).
2. Texto de RF-18: con un día, "Esta rutina está asignada al martes 27/10. ¿Borrarla?";
   con dos, "al A y al B"; con tres o más, "al A, al B y al C".
3. Semana: un `<select>` por día ("Sin rutina" + las rutinas) y un botón "Ver".
4. Formulario de ejercicio: solo se muestra el primer error, en este orden: título,
   imagen, título repetido, series.
5. RF-32: se marcan con `.erroneo` todos los campos erróneos, pero solo se muestra el
   mensaje del primero.
6. El Previo muestra los decimales con coma ("22,5").

| Vista | Contenido | RF |
|---|---|---|
| Cabecera | Aviso "Entrenamiento del <día> sin terminar. Continuar" si hay entrenamiento (va a él desde cualquier vista); pestañas; botón "Rutinas". | RF-2, RF-3, RF-37 |
| Semana | 7 filas: `textoDia`, "✓ Hecho" si toca, un `<select>` con "Sin rutina" + rutinas (cambiar = `asignarRutina` / `quitarRutina`; si `diaBloqueado`, aviso en la página "Termina el entrenamiento antes de cambiar este día" y se repinta), "No hay rutina para este día." si está vacío, y botón "Ver" si tiene rutina. Al abrir la app: semana actual. | RF-1, RF-2, RF-20 a RF-24, RF-35, RF-40 |
| Día | Nombre de la rutina, "Empezar entrenamiento" (solo semana actual; `disabled` sin ejercicios), "Editar rutina", tarjetas con miniatura, título y tabla Serie / Previo. Si el entrenamiento abierto es de otro día: aviso en la página "Tienes el entrenamiento del <día> sin terminar" y se muestra ese. | RF-19, RF-25 a RF-28, RF-38 |
| Entrenamiento | La misma vista del día con tabla Serie / Previo / KG / REPS (`inputmode="decimal"` y `"numeric"`, tipo texto), "+ Serie" (`disabled` con 20) y "Quitar" solo en la última fila (no con 1). Cada `input` llama a `escribirValor` y guarda sin repintar (no se pierde el foco); solo si `guardar` falla se repinta para mostrar el aviso. Botón "Terminar entrenamiento" con el aviso de RF-32 junto a él. | RF-29 a RF-36, RF-41 |
| Rutinas | Lista de rutinas con "Editar" y "Borrar", y formulario "Nueva rutina" con los errores de RF-5/RF-6 como aviso junto a él. Borrar: si `rutinaBloqueada` → aviso en la página de RF-39; si `diasAsignados` no está vacío → `confirm("Esta rutina está asignada " + textoDiasAsignados(...) + ". ¿Borrarla?")`; si no → `confirm("¿Borrar la rutina <nombre>?")`. | RF-3 a RF-6, RF-14, RF-17, RF-18, RF-39 |
| Editar rutina | Nombre (`maxlength="50"`), lista de ejercicios (miniatura, título, series, "Editar", "Borrar" con confirm) o "Esta rutina no tiene ejercicios. Añade el primero.", y "Añadir ejercicio". Si `rutinaBloqueada`, no se abre: aviso en la página "Termina el entrenamiento antes de editar esta rutina". | RF-15, RF-17, RF-19, RF-39 |
| Ejercicio | Título (`maxlength="50"`), foto (input de archivo + vista previa), series (texto, `inputmode="numeric"`), "Guardar" y, junto a él, el aviso con el primer error de `validarEjercicio`. | RF-7 a RF-14, RF-16 |

- Errores y avisos: `<p class="aviso">` dentro de la página (decisión 1); confirmaciones
  de borrado: `confirm()`. Ningún `alert()` en la app.
- Todo texto del usuario (nombres, títulos, valores escritos) que vaya en `innerHTML` pasa
  por `escapar()`. Las fotos van en `src` también escapadas.
- CSS: `input, select, textarea, button { font-size: 16px }`; nombres largos con
  `overflow-wrap: anywhere`; `.aviso` en rojo; miniaturas de 64 px con `object-fit: cover`; tabla al 100 %
  de ancho; sin anchos fijos mayores de 375 px.

## 6. Estrategia de tests (`node --test`)

- `tests/fechas.test.js`: `claveFecha`, `fechaDeClave`, `diasDeSemana` con hoy = martes
  27/10/2026, domingo 1/11/2026 y lunes 2/11/2026 (`new Date(2026, 9, 27)`), `textoDia`,
  `textoDiasAsignados` (1, 2 y 3 días), `coinciden`, `escapar`. Un test con cambio de
  hora (domingo 25/10/2026, fin del horario de verano) para comprobar que no se salta días.
- `tests/validacion.test.js`: `validarRutina`, `leerSeries`, `validarEjercicio`,
  `leerPeso` ("22,5", "22.5", "0", "-5", "abc", ""), `leerReps`, `erroresEntreno`.
- `tests/rutinas.test.js`: crear/renombrar rutina, añadir 15 ejercicios en orden,
  editar/borrar ejercicio, `diasAsignados`, `borrarRutina` (vacía actual, siguiente y
  pasada), `asignarRutina`/`quitarRutina` (sustituir, solo esa semana, "✓ Hecho" se va al
  cambiar o vaciar y no vuelve al reasignar), bloqueos, y que las funciones no modifican
  los datos de entrada.
- `tests/entreno.test.js`: `previo` ("–", "0", coincidencia entre rutinas, título con
  errata, título cambiado), `puedeEmpezar` (semana actual sí, siguiente no, sin ejercicios
  no), `empezarEntreno`, `sumarSerie`/`quitarSerie` (límites 1 y 20, rutina intacta),
  `terminarEntreno` (guarda 22,5 y 0, vacías mantienen Previo, serie añadida 4, reps no se
  guardan, marca "✓ Hecho", entrenamiento de semana pasada con hoy = lunes 2/11).
- Lo que no es lógica pura (DOM, fotos, `localStorage`, avisos en la página, confirm) se comprueba en
  Chrome a 375 px con consola limpia; la cámara/galería, en el iPhone.

## 7. Tabla RF → dónde → cómo se verifica

| RF | Dónde | Verificación |
|---|---|---|
| RF-1 | `diasDeSemana`, arranque de `pintar` | Test + Chrome |
| RF-2 | `diasDeSemana`, cabecera | Test + Chrome |
| RF-3 | Cabecera, vista Rutinas | Chrome |
| RF-4 | `guardarRutina`, vista Rutinas | Test + Chrome |
| RF-5 | `validarRutina` | Test + Chrome |
| RF-6 | `validarRutina` | Test + Chrome |
| RF-7 | `guardarEjercicio`, vista Editar rutina | Test + Chrome |
| RF-8 | Vista Ejercicio (`accept="image/*"`) | iPhone |
| RF-9 | Miniatura en canvas (interfaz) | Chrome (20 fotos de 3 MB y recarga) |
| RF-10 | `validarEjercicio` | Test + Chrome |
| RF-11 | `validarEjercicio` | Test + Chrome |
| RF-12 | `validarEjercicio` | Test + Chrome |
| RF-13 | `leerSeries`, `validarEjercicio` | Test + Chrome |
| RF-14 | `maxlength="50"` | Chrome |
| RF-15 | `guardarRutina`, `guardarEjercicio`, `borrarEjercicio` | Test + Chrome (recarga) |
| RF-16 | `guardarEjercicio`, `previo` | Test + Chrome |
| RF-17 | Vistas Rutinas / Editar rutina (`confirm`) | Chrome |
| RF-18 | `diasAsignados`, `textoDiasAsignados`, `borrarRutina` | Test + Chrome |
| RF-19 | Vistas Editar rutina y Día | Chrome |
| RF-20 | `asignarRutina` | Test + Chrome |
| RF-21 | `asignarRutina`, `quitarRutina` | Test + Chrome |
| RF-22 | `plan` por día (sin entrada = vacío) | Test + Chrome |
| RF-23 | Vista Semana | Chrome |
| RF-24 | `diasDeSemana` (no la pide) y ninguna función borra `plan` por fecha | Test + Chrome (DevTools > Application) |
| RF-25 | Vista Día | Chrome |
| RF-26 | `previo`, `normalizar` | Test + Chrome |
| RF-27 | `puedeEmpezar` | Test + Chrome |
| RF-28 | `puedeEmpezar`, vista Día | Test + Chrome |
| RF-29 | `empezarEntreno`, `escribirValor`, vista Entrenamiento | Test + Chrome |
| RF-30 | `sumarSerie`, `quitarSerie` | Test + Chrome |
| RF-31 | `leerPeso` | Test + Chrome |
| RF-32 | `erroresEntreno`, clase `.erroneo` | Test + Chrome |
| RF-33 | `terminarEntreno` | Test + Chrome |
| RF-34 | `terminarEntreno` | Test + Chrome |
| RF-35 | `terminarEntreno`, `asignarRutina`, `quitarRutina`, `borrarRutina` | Test + Chrome |
| RF-36 | `escribirValor` + `guardar` en cada `input`; arranque en semana actual | Chrome (recarga) |
| RF-37 | Cabecera, `textoDia` | Test + Chrome |
| RF-38 | Vista Día (comprueba `datos.entrenamiento`) | Chrome |
| RF-39 | `rutinaBloqueada` | Test + Chrome |
| RF-40 | `diaBloqueado` | Test + Chrome |
| RF-41 | `terminarEntreno` con fecha pasada, `diasDeSemana` | Test + Chrome |
| RF-42 | `cargar`/`guardar` en una clave | Chrome (recarga) |
| RF-43 | Todos los textos en `index.html` y `app.js` | Chrome (revisión visual) |
