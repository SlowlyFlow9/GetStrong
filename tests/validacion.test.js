// Tests de las validaciones (T2): RF-5, RF-6, RF-10 a RF-13, RF-31 y RF-32.
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Datos de ejemplo con dos rutinas
const datos = {
  rutinas: [
    { id: 'a', nombre: 'Pierna', ejercicios: [] },
    { id: 'b', nombre: 'Torso', ejercicios: [] },
  ],
};

test('validarRutina: nombre vacío o solo espacios (RF-5)', () => {
  assert.equal(app.validarRutina(datos, null, '   '), 'La rutina necesita un nombre');
  assert.equal(app.validarRutina(datos, null, ''), 'La rutina necesita un nombre');
});

test('validarRutina: nombre repetido al crear y al renombrar (RF-6)', () => {
  assert.equal(app.validarRutina(datos, null, ' pierna '), 'Ya hay una rutina con ese nombre');
  assert.equal(app.validarRutina(datos, 'b', 'PIERNA'), 'Ya hay una rutina con ese nombre');
});

test('validarRutina: nombres válidos', () => {
  assert.equal(app.validarRutina(datos, null, 'Espalda'), '');
  // Renombrar una rutina a su propio nombre (aunque cambie mayúsculas) sí vale
  assert.equal(app.validarRutina(datos, 'a', 'Pierna'), '');
  assert.equal(app.validarRutina(datos, 'a', 'PIERNA'), '');
});

test('leerSeries: enteros de 1 a 20 o null (RF-13)', () => {
  assert.equal(app.leerSeries('0'), null);
  assert.equal(app.leerSeries('21'), null);
  assert.equal(app.leerSeries('abc'), null);
  assert.equal(app.leerSeries(''), null);
  assert.equal(app.leerSeries('2.5'), null);
  assert.equal(app.leerSeries('3'), 3);
  assert.equal(app.leerSeries(' 20 '), 20);
  assert.equal(app.leerSeries('1'), 1);
});

// Rutina "Pierna" con un ejercicio para probar validarEjercicio
const pierna = {
  id: 'a', nombre: 'Pierna',
  ejercicios: [{ titulo: 'Sentadilla', foto: 'data:image/jpeg;base64,xxx', series: 3 }],
};
const FOTO = 'data:image/jpeg;base64,yyy';

test('validarEjercicio: título vacío (RF-10)', () => {
  assert.equal(app.validarEjercicio(pierna, null, '   ', FOTO, '3'), 'El ejercicio necesita un título');
});

test('validarEjercicio: sin foto (RF-11)', () => {
  assert.equal(app.validarEjercicio(pierna, null, 'Zancada', '', '3'), 'El ejercicio necesita una imagen');
  assert.equal(app.validarEjercicio(pierna, null, 'Zancada', null, '3'), 'El ejercicio necesita una imagen');
});

test('validarEjercicio: título repetido en la misma rutina (RF-12)', () => {
  assert.equal(app.validarEjercicio(pierna, null, 'sentadilla ', FOTO, '3'), 'Ya hay un ejercicio con ese título');
  // En otra rutina sin ese título sí vale
  const torso = { id: 'b', nombre: 'Torso', ejercicios: [] };
  assert.equal(app.validarEjercicio(torso, null, 'Sentadilla', FOTO, '3'), '');
});

test('validarEjercicio: al editar, su propio título no cuenta como repetido', () => {
  assert.equal(app.validarEjercicio(pierna, 0, 'Sentadilla', FOTO, '4'), '');
});

test('validarEjercicio: series fuera de 1-20 (RF-13)', () => {
  for (const texto of ['0', '21', 'abc']) {
    assert.equal(app.validarEjercicio(pierna, null, 'Zancada', FOTO, texto), 'Indica cuántas series (de 1 a 20)');
  }
  assert.equal(app.validarEjercicio(pierna, null, 'Zancada', FOTO, '3'), '');
  assert.equal(app.validarEjercicio(pierna, null, 'Zancada', FOTO, '20'), '');
});

test('validarEjercicio: con varios errores solo devuelve el primero', () => {
  // Orden: título, imagen, título repetido, series
  assert.equal(app.validarEjercicio(pierna, null, '', '', 'abc'), 'El ejercicio necesita un título');
  assert.equal(app.validarEjercicio(pierna, null, 'Sentadilla', '', 'abc'), 'El ejercicio necesita una imagen');
  assert.equal(app.validarEjercicio(pierna, null, 'Sentadilla', FOTO, 'abc'), 'Ya hay un ejercicio con ese título');
});

test('leerPeso: coma, punto, 0, vacío y no válidos (RF-31)', () => {
  assert.equal(app.leerPeso('22,5'), 22.5);
  assert.equal(app.leerPeso('22.5'), 22.5);
  assert.equal(app.leerPeso('0'), 0);
  assert.equal(app.leerPeso(' 40 '), 40);
  assert.equal(app.leerPeso(''), null);
  assert.equal(app.leerPeso('  '), null);
  assert.ok(Number.isNaN(app.leerPeso('-5')));
  assert.ok(Number.isNaN(app.leerPeso('abc')));
  assert.ok(Number.isNaN(app.leerPeso('22,')));
});

test('leerReps: enteros >= 0, vacío o no válidos', () => {
  assert.equal(app.leerReps('10'), 10);
  assert.equal(app.leerReps('0'), 0);
  assert.equal(app.leerReps(''), null);
  assert.ok(Number.isNaN(app.leerReps('abc')));
  assert.ok(Number.isNaN(app.leerReps('-3')));
  assert.ok(Number.isNaN(app.leerReps('8,5')));
});

test('erroresEntreno: sin errores devuelve lista vacía', () => {
  const entrenamiento = {
    fecha: '2026-10-27', rutinaId: 'a',
    series: [[{ kg: '22,5', reps: '10' }, { kg: '', reps: '' }, { kg: '0', reps: '0' }]],
  };
  assert.deepEqual(app.erroresEntreno(entrenamiento), []);
});

test('erroresEntreno: señala ejercicio, serie y campo con su mensaje (RF-32)', () => {
  const entrenamiento = {
    fecha: '2026-10-27', rutinaId: 'a',
    series: [
      [{ kg: '40', reps: 'abc' }, { kg: '-5', reps: '8' }],
      [{ kg: 'x', reps: '-1' }],
    ],
  };
  // Posiciones desde 0: ejercicio 0 / serie 0 es la serie 1 del primer ejercicio
  assert.deepEqual(app.erroresEntreno(entrenamiento), [
    { ejercicio: 0, serie: 0, campo: 'reps', mensaje: 'Repeticiones no válidas' },
    { ejercicio: 0, serie: 1, campo: 'kg', mensaje: 'Peso no válido' },
    { ejercicio: 1, serie: 0, campo: 'kg', mensaje: 'Peso no válido' },
    { ejercicio: 1, serie: 0, campo: 'reps', mensaje: 'Repeticiones no válidas' },
  ]);
});
