// Tests de compartir rutinas (spec 004).
// T1: generar el archivo y su nombre (RF-1, RF-2, RF-13, RF-14).
// T2: validar y limpiar el archivo (RF-5, RF-10, RF-14).
// T3: añadir la rutina importada y regla del nombre (RF-5 a RF-8, RF-14 a RF-16).
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Foto de prueba corta (una de verdad ocupa ~38 KB).
const FOTO = 'data:image/jpeg;base64,AAAA';

// Rutina guardada de ejemplo, con ids como las de la app.
function pierna() {
  return {
    id: 'p1', nombre: 'Pierna', ejercicios: [
      { id: 'p1-0', titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { id: 'p1-1', titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  };
}

test('archivoRutina: el archivo de "Pierna" tiene solo los campos pedidos, en orden', () => {
  const objeto = JSON.parse(app.archivoRutina(pierna()));
  assert.deepEqual(objeto, {
    app: 'GetStrong',
    version: 1,
    nombre: 'Pierna',
    ejercicios: [
      { titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  });
});

test('archivoRutina: una rutina sin ejercicios da ejercicios: []', () => {
  const objeto = JSON.parse(app.archivoRutina({ id: 'c', nombre: 'Core', ejercicios: [] }));
  assert.deepEqual(objeto, { app: 'GetStrong', version: 1, nombre: 'Core', ejercicios: [] });
});

test('archivoRutina: no modifica la rutina recibida', () => {
  const rutina = pierna();
  app.archivoRutina(rutina);
  assert.deepEqual(rutina, pierna());
});

test('nombreArchivo: añade .json y cambia los caracteres prohibidos por "-"', () => {
  assert.equal(app.nombreArchivo('Pierna'), 'Pierna.json');
  assert.equal(app.nombreArchivo('Pierna/Glúteo'), 'Pierna-Glúteo.json');
  assert.equal(app.nombreArchivo('a/b\\c:d*e?f"g<h>i|j'), 'a-b-c-d-e-f-g-h-i-j.json');
});

// ---------- T2: validar y limpiar el archivo (RF-5, RF-10, RF-14) ----------

// Texto de un archivo a partir de un objeto (para preparar casos raros).
function texto(objeto) {
  return JSON.stringify(objeto);
}

// Archivo válido de "Pierna" con algún cambio: "cambios" sustituye campos del archivo.
function archivo(cambios) {
  return Object.assign({
    app: 'GetStrong', version: 1, nombre: 'Pierna', ejercicios: [
      { titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  }, cambios);
}

// Archivo de un solo ejercicio con algún campo cambiado.
function conEjercicio(cambios) {
  return texto(archivo({ ejercicios: [Object.assign({ titulo: 'Sentadilla', foto: FOTO, series: 3 }, cambios)] }));
}

test('leerArchivoRutina: ida y vuelta con archivoRutina (la rutina sin ids)', () => {
  assert.deepEqual(app.leerArchivoRutina(app.archivoRutina(pierna())), {
    nombre: 'Pierna', ejercicios: [
      { titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  });
  const core = app.archivoRutina({ id: 'c', nombre: 'Core', ejercicios: [] });
  assert.deepEqual(app.leerArchivoRutina(core), { nombre: 'Core', ejercicios: [] });
});

test('leerArchivoRutina: recorta el nombre y los títulos', () => {
  const leida = app.leerArchivoRutina(texto(archivo({
    nombre: '  Pierna  ',
    ejercicios: [{ titulo: ' Prensa ', foto: FOTO, series: 4 }],
  })));
  assert.deepEqual(leida, { nombre: 'Pierna', ejercicios: [{ titulo: 'Prensa', foto: FOTO, series: 4 }] });
});

test('leerArchivoRutina: ignora los campos de más', () => {
  const leida = app.leerArchivoRutina(texto(archivo({
    autor: 'Ana',
    ejercicios: [{ titulo: 'Prensa', foto: FOTO, series: 4, autor: 'Ana', id: 'x' }],
  })));
  assert.deepEqual(leida, { nombre: 'Pierna', ejercicios: [{ titulo: 'Prensa', foto: FOTO, series: 4 }] });
});

test('leerArchivoRutina: límites que sí valen (50 caracteres y foto de 204.800)', () => {
  const cincuenta = 'a'.repeat(50);
  assert.equal(app.leerArchivoRutina(texto(archivo({ nombre: cincuenta }))).nombre, cincuenta);
  assert.equal(app.leerArchivoRutina(texto(archivo({ nombre: '  ' + cincuenta + '  ' }))).nombre, cincuenta);
  assert.notEqual(app.leerArchivoRutina(conEjercicio({ titulo: cincuenta })), null);
  const fotoGrande = FOTO + 'A'.repeat(204800 - FOTO.length);
  assert.notEqual(app.leerArchivoRutina(conEjercicio({ foto: fotoGrande })), null);
});

test('leerArchivoRutina: devuelve null (sin lanzar) si el archivo no es válido', () => {
  const fotoDemasiado = FOTO + 'A'.repeat(204801 - FOTO.length);
  const sinApp = archivo();
  delete sinApp.app;
  const sinEjercicios = archivo();
  delete sinEjercicios.ejercicios;
  const malos = [
    '\xFF\xD8\xFF\xE0JFIF', // contenido de un jpg
    'null', '[]', '"hola"', '3', '',
    texto(sinApp),
    texto(archivo({ app: 'Otra' })),
    texto(archivo({ nombre: '' })),
    texto(archivo({ nombre: '   ' })),
    texto(archivo({ nombre: 7 })),
    texto(archivo({ nombre: 'a'.repeat(51) })),
    texto(sinEjercicios),
    texto(archivo({ ejercicios: 'Sentadilla' })),
    texto(archivo({ ejercicios: [null] })),
    conEjercicio({ foto: undefined }), // sin foto
    conEjercicio({ foto: '' }),
    conEjercicio({ foto: 'https://ejemplo.com/foto.jpg' }),
    conEjercicio({ foto: fotoDemasiado }),
    conEjercicio({ titulo: '' }),
    conEjercicio({ titulo: '   ' }),
    conEjercicio({ titulo: 'a'.repeat(51) }),
    texto(archivo({ ejercicios: [
      { titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { titulo: ' sentadilla ', foto: FOTO, series: 3 },
    ] })),
    conEjercicio({ series: 0 }),
    conEjercicio({ series: 21 }),
    conEjercicio({ series: 3.5 }),
    conEjercicio({ series: '3' }),
    conEjercicio({ series: [3] }),
    conEjercicio({ series: 1e21 }),
  ];
  malos.forEach(caso => {
    assert.doesNotThrow(() => app.leerArchivoRutina(caso));
    assert.equal(app.leerArchivoRutina(caso), null, 'debería ser null: ' + caso.slice(0, 80));
  });
});

// ---------- T3: importarRutina y regla del nombre ----------

// Datos guardados de ejemplo: "Pierna" asignada a un día, con pesos, un pendiente
// y un entrenamiento abierto de "Pierna" (RF-15: importar no debe tocarlo).
function datosConEntreno() {
  return {
    rutinas: [pierna()],
    plan: { '2026-11-23': { rutinaId: 'p1', hecho: false } },
    pesos: { sentadilla: { 1: 60 } },
    pendientes: [{ titulo: 'Remo', foto: FOTO, series: 3, rutinaId: 'p1' }],
    entrenamiento: {
      fecha: '2026-11-23', rutinaId: 'p1', anadidos: [],
      series: [[{ kg: '60', reps: '10' }], [{ kg: '', reps: '' }]],
    },
  };
}

// Rutina tal como la devuelve leerArchivoRutina (sin ids).
function leida() {
  return {
    nombre: 'Pierna', ejercicios: [
      { titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  };
}

test('importarRutina: añade la rutina al final con el nombre recortado e ids id-posición', () => {
  const nuevos = app.importarRutina(datosConEntreno(), 'n1', leida(), '  Pierna de Juan  ');
  assert.equal(nuevos.rutinas.length, 2);
  assert.deepEqual(nuevos.rutinas[0], pierna());
  assert.deepEqual(nuevos.rutinas[1], {
    id: 'n1', nombre: 'Pierna de Juan', ejercicios: [
      { id: 'n1-0', titulo: 'Sentadilla', foto: FOTO, series: 3 },
      { id: 'n1-1', titulo: 'Prensa', foto: FOTO, series: 4 },
    ],
  });
});

test('importarRutina: no toca plan, pesos, pendientes ni el entrenamiento abierto (RF-15)', () => {
  const antes = datosConEntreno();
  const nuevos = app.importarRutina(antes, 'n1', leida(), 'Pierna B');
  assert.deepEqual(nuevos.plan, antes.plan); // sin días asignados
  assert.deepEqual(nuevos.pesos, antes.pesos);
  assert.deepEqual(nuevos.pendientes, antes.pendientes);
  assert.deepEqual(nuevos.entrenamiento, antes.entrenamiento);
  // También con datos vacíos (sin entreno abierto).
  const vacios = app.importarRutina(app.datosVacios(), 'n1', leida(), 'Pierna');
  assert.deepEqual({ ...vacios, rutinas: [] }, app.datosVacios());
});

test('importarRutina: no modifica los datos ni la rutina recibidos', () => {
  const antes = datosConEntreno();
  const rutina = leida();
  app.importarRutina(antes, 'n1', rutina, 'Pierna B');
  assert.deepEqual(antes, datosConEntreno());
  assert.deepEqual(rutina, leida());
});

test('importarRutina: la copia es independiente de la original (RF-6)', () => {
  const nuevos = app.importarRutina(datosConEntreno(), 'n1', leida(), 'Pierna B');
  const sinSentadilla = app.borrarEjercicio(nuevos, 'n1', 0);
  assert.deepEqual(sinSentadilla.rutinas[0], pierna()); // "Pierna" sigue igual
  assert.deepEqual(sinSentadilla.rutinas[1].ejercicios.map(e => e.titulo), ['Prensa']);
});

test('importarRutina: importar dos veces da ids distintos (RF-16)', () => {
  let datos = app.importarRutina(app.datosVacios(), 'n1', leida(), 'Pierna');
  datos = app.importarRutina(datos, 'n2', leida(), 'Pierna B');
  const ids = datos.rutinas.flatMap(r => [r.id, ...r.ejercicios.map(e => e.id)]);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, ['n1', 'n1-0', 'n1-1', 'n2', 'n2-0', 'n2-1']);
});

test('importarRutina: una rutina sin ejercicios se importa vacía (RF-14)', () => {
  const nuevos = app.importarRutina(app.datosVacios(), 'n1', { nombre: 'Core', ejercicios: [] }, 'Core');
  assert.deepEqual(nuevos.rutinas, [{ id: 'n1', nombre: 'Core', ejercicios: [] }]);
});

test('regla del nombre (plan 3.2) con validarRutina(datos, null, nombre)', () => {
  const datos = datosConEntreno(); // ya tiene "Pierna"
  assert.equal(app.validarRutina(datos, null, ' Pierna '), 'Ya hay una rutina con ese nombre');
  assert.equal(app.validarRutina(datos, null, ' pierna '), 'Ya hay una rutina con ese nombre');
  assert.equal(app.validarRutina(datos, null, 'Pierna de Juan'), '');
  assert.equal(app.validarRutina(datos, null, ''), 'La rutina necesita un nombre');
  assert.equal(app.validarRutina(datos, null, '   '), 'La rutina necesita un nombre');
});
