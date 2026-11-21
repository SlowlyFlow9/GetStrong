# Tareas 004 — Compartir rutinas

Spec: `spec.md` · Plan: `plan.md`. Una tarea por sesión, en este orden.

Criterios comunes de "hecho" en TODAS las tareas (además de los propios):
- `node --test` en verde: los tests de las specs anteriores sin tocar y los nuevos.
- Tareas de interfaz: Chrome headless a 375 px (`document.documentElement.scrollWidth === 375`),
  consola limpia, `input`/`select` con `fontSize` ≥ 16px, como mucho un botón `.principal`
  visible por pantalla.
- Textos de usuario pintados con `innerHTML` pasan por `escapar()`; ningún `alert()`.
- Código comentado en español; nada que no pida la spec.
- `MEMORY.md` actualizado (estado, decisiones y errores a evitar).

## Lógica pura (tests primero)

- [x] **T1. Generar el archivo y su nombre.** RF-1, RF-2, RF-13, RF-14
  - Archivos: `tests/compartir.test.js` (nuevo), `app.js` (`archivoRutina`, `nombreArchivo`
    en el bloque 1 y en `module.exports`).
  - Tests primero (plan 7): archivo de "Pierna" exacto y sin ids ni días; "Core" con
    `ejercicios: []`; no modifica la rutina; "Pierna/Glúteo" → "Pierna-Glúteo.json" y los
    9 caracteres prohibidos → `-`.
  - Hecho cuando: los tests fallan antes del código y pasan después.

- [x] **T2. Validar y limpiar el archivo.** RF-5, RF-10, RF-14
  - Archivos: `tests/compartir.test.js`, `app.js` (`leerArchivoRutina`, reutilizando
    `validarEjercicio`).
  - Tests primero (plan 7): ida y vuelta con T1; recorta nombre y títulos; ignora campos
    de más; todos los casos `null` (no JSON, sin `app`, nombre 0/51, foto ausente,
    `https://`, 204.801 caracteres, título vacío/51/repetido, series 0/21/3.5/"3",
    `ejercicios` no lista); límites que sí valen (50 caracteres, 204.800); nunca lanza.
  - Hecho cuando: todos en verde.

- [x] **T3. Añadir la rutina importada y regla del nombre.** RF-5, RF-6, RF-7, RF-8, RF-14, RF-15, RF-16
  - Archivos: `tests/compartir.test.js`, `app.js` (`importarRutina`).
  - Tests primero (plan 7): al final, nombre recortado, ids `id-0`, `id-1`; resto de
    `datos` igual (también con entreno abierto); no modifica la entrada; copia
    independiente tras `borrarEjercicio`; dos importaciones con ids distintos; rutina
    vacía; regla 3.2 con `validarRutina` (" Pierna ", "Pierna de Juan", " pierna ", vacío).
  - Hecho cuando: todos en verde.

## Interfaz

- [x] **T4. Botón "Compartir" y descarga.** RF-1, RF-2, RF-3, RF-13, RF-14
  - Archivos: `app.js` (botón en `htmlEditarRutina`, `alCompartir`, `descargar`, rama
    `data-compartir` en `click`), `styles.css` (`.boton-ancho + .boton-ancho`).
  - Tests: ninguno nuevo (interfaz); `node --test` sigue en verde.
  - Hecho cuando: "Compartir" sale gris a todo el ancho debajo de "Añadir ejercicio" (único
    azul); en Chrome headless con `file://` y `Browser.setDownloadBehavior`, "Compartir" en
    "Pierna" descarga "Pierna.json" (contenido = `archivoRutina`), "Pierna/Glúteo" descarga
    "Pierna-Glúteo.json" y "Core" descarga "Core.json"; tras recargar, "Pierna" sigue igual
    y asignada al martes; sin avisos ni errores en consola.

- [x] **T5. Botón "Importar" e importación directa.** RF-4, RF-5, RF-10, RF-11, RF-12, RF-14, RF-16
  - Archivos: `app.js` (botón y `<input type="file" id="archivo-importar" hidden>` sin
    `accept` en `htmlRutinas`, `alElegirArchivo`, `importar`, ramas `data-importar` en
    `click` y `archivo-importar` en `change`).
  - Tests: ninguno nuevo; `node --test` en verde.
  - Hecho cuando (archivos cargados con `DOM.setFileInputFiles`): "Importar" gris junto a
    "Crear" y todo cabe a 375 px; "Pierna.json" en una app sin "Pierna" la añade al final con
    sus ejercicios, fotos y series y sin días, y sigue tras recargar; "  Pierna  " / " Prensa "
    llegan recortados; "Core.json" llega vacía y sin aviso; un `.jpg`, 21 series, foto
    `https://`, foto > 200 KB y sin `app` muestran "Este archivo no es una rutina válida" sin
    cambios; campo `autor` de más se importa; con `localStorage` lleno sale "No queda espacio
    para guardar" y tras recargar no está; nombre `<b>&"'` se ve tal cual.

- [x] **T6. Pregunta por otro nombre.** RF-7, RF-8, RF-9, RF-10, RNF-7
  - Archivos: `app.js` (`pantalla.importando`, línea en `pintar()`, formulario
    `data-form="importar"` con `.pregunta` en `htmlRutinas`, `alImportarConNombre`, rama
    `data-cancelar-importar` en `click` y `importar` en `submit`).
  - Tests: ninguno nuevo; `node --test` en verde.
  - Hecho cuando: con "Pierna" creada, importar " Pierna " sustituye el formulario "Crear"
    por "Ya tienes una rutina llamada Pierna. Escribe otro nombre para importarla.", campo
    con "Pierna", "Importar" azul (único) y "Cancelar" gris, lista sin cambios; "Pierna de
    Juan" + "Importar" la añade y vuelve "Crear"; " pierna " → "Ya hay una rutina con ese
    nombre" con " pierna " en el campo; vacío → "La rutina necesita un nombre"; el carácter
    51 no entra, campo ≥ 16 px; "Cancelar", ir a Semana y volver, y recargar dejan "Crear" y
    la lista igual; un archivo "Pierna" no válido da el aviso, no la pregunta; RF-6 completo
    (importar como "Pierna B", borrar "Sentadilla" de "Pierna B": "Pierna" intacta; borrar
    "Prensa" de "Pierna" e importar como "Pierna C": trae las dos).

- [x] **T7. Compartir e importar con un entrenamiento abierto.** RF-15
  - Archivos: `app.js`, solo `alEditarRutina` (plan 6): se quita el
    `if (rutinaBloqueada(datos, id))` y siempre abre "Editar rutina"; comentario al día.
    Las acciones de edición no se tocan: ya llevan su propio aviso.
  - Tests: ninguno nuevo (interfaz); `node --test` en verde, incluido el test de
    `rutinaBloqueada` de la 001 sin tocar.
  - Hecho cuando (Chrome headless con `file://`, entreno de "Pierna" abierto con 40 kg
    escrito en la serie 1 de "Sentadilla", "Torso" sin entreno):
    1. "Editar" de "Pierna" (en la lista y desde el día) abre "Editar rutina" sin aviso.
    2. Cada acción muestra "Termina el entrenamiento antes de editar esta rutina" y no
       cambia nada (comparar `localStorage` antes y después, también tras recargar):
       "Guardar" con el nombre cambiado a "Pierna 2" (el campo vuelve a "Pierna");
       "Añadir ejercicio" (no abre el formulario); "Editar" de "Sentadilla" (no abre el
       formulario); "Borrar" de "Sentadilla" (no sale el `confirm`); "Borrar" de "Pierna"
       en la lista (no sale el `confirm`).
    3. "Compartir" en "Pierna" descarga "Pierna.json" (contenido = `archivoRutina`) sin
       aviso; "Compartir" en "Torso" también; importar "Core.json" la añade.
    4. Tras todo, "Continuar" muestra el entreno de "Pierna" con 40 kg en la serie 1.
    5. No se rompe la 001: en "Torso" se renombra, se añade, edita y borra un ejercicio
       con normalidad; al terminar el entreno de "Pierna", las cinco acciones del punto 2
       funcionan (RF-39 de la 001: "tras terminar el entrenamiento, se puede editar con
       normalidad"); RF-40 sigue igual (cambiar la rutina del día del entreno da su aviso).

## Cierre

- [x] **T8. Repaso final.** RF-1 a RF-16, RNF-1 a RNF-7
  - Archivos: ninguno salvo arreglos que salgan del repaso.
  - Hecho cuando: un script headless recorre todas las aceptaciones verificables en Chrome
    y los casos límite de la spec, con capturas a 375 px y consola limpia; `index.html`
    sin cambios en el diff; `node --test` en verde; `MEMORY.md` actualizado. Después,
    `/sdd-validate` por el reviewer: APROBADO.

- [ ] **T9. Publicación y prueba en el iPhone.** RF-1, RF-3, RF-4, RNF-6 (solo tras la validación APROBADA)
  - Archivos: ninguno nuevo. `git add index.html styles.css app.js MEMORY.md tests/compartir.test.js specs/004-compartir-rutinas/`,
    commit en español y `git push` a `main`.
  - Hecho cuando: la web publicada tiene el commit nuevo y el usuario, en el iPhone:
    1. En "Editar rutina" de "Pierna" pulsa "Compartir": se abre el menú con "Pierna.json"
       y lo envía por WhatsApp, AirDrop o correo (RF-1).
    2. Pulsa "Compartir" y cierra el menú: sin avisos ni cambios (RF-3).
    3. En otra copia publicada (o la misma, como "Pierna B"), "Importar" deja elegir el
       archivo en Archivos y aparece la rutina con sus fotos y series (RF-4, RNF-6).

## Cobertura RF → tarea

| RF | Tareas | RF | Tareas |
|---|---|---|---|
| RF-1 | T1, T4, T9 (iPhone) | RF-9 | T6 |
| RF-2 | T1, T4 | RF-10 | T2, T5, T6 |
| RF-3 | T4, T9 (iPhone) | RF-11 | T5 |
| RF-4 | T5, T9 (iPhone) | RF-12 | T5 |
| RF-5 | T2, T3, T5 | RF-13 | T1, T4 |
| RF-6 | T3, T6 | RF-14 | T1, T2, T3, T4, T5 |
| RF-7 | T3, T6 | RF-15 | T3, T7 |
| RF-8 | T3, T6 | RF-16 | T3, T5 |
| RNF-1 a RNF-7 | T4 a T8; RNF-6 también en T9 | | |
