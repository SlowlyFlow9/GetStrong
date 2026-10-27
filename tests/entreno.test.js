// Tests del Previo y del entrenamiento (T4): RF-16, RF-26 a RF-30, RF-33 a RF-35 y RF-41.
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Datos de ejemplo: Pierna (Sentadilla 3 series, Prensa 2) el lunes 26/10 y el
// viernes 30/10; Vacía (sin ejercicios) el martes 27/10; Pierna también el 2/11.
function ejemplo() {
  return {
    rutinas: [
      {
        id: 'p', nombre: 'Pierna', ejercicios: [
          { titulo: 'Sentadilla', foto: 'f1', series: 3 },
          { titulo: 'Prensa', foto: 'f2', series: 2 },
        ],
      },
      { id: 'v', nombre: 'Vacía', ejercicios: [] },
    ],
    plan: {
      '2026-10-26': { rutinaId: 'p', hecho: false },
      '2026-10-27': { rutinaId: 'v', hecho: false },
      '2026-10-30': { rutinaId: 'p', hecho: false },
      '2026-11-01': { rutinaId: 'p', hecho: false },
      '2026-11-02': { rutinaId: 'p', hecho: false },
    },
    pesos: {},
    entrenamiento: null,
  };
}

test('previo: "–" sin datos, "0", "22,5" y compartido entre rutinas (RF-26)', () => {
  const pesos = { sentadilla: { 1: 60, 2: 0, 3: 22.5 } };
  assert.equal(app.previo({}, 'Sentadilla', 1), '–');
  assert.equal(app.previo(pesos, 'Sentadilla', 1), '60');
  assert.equal(app.previo(pesos, 'Sentadilla', 2), '0');
  assert.equal(app.previo(pesos, 'Sentadilla', 3), '22,5');
  assert.equal(app.previo(pesos, 'Sentadilla', 4), '–'); // serie nunca hecha
  // Mismo título en otra rutina (mayúsculas y espacios no cuentan)
  assert.equal(app.previo(pesos, '  SENTADILLA ', 1), '60');
  // Errata = otro ejercicio
  assert.equal(app.previo(pesos, 'Sentadila', 1), '–');
});

test('previo: cambiar el título da "–" y volver al antiguo da 60 (RF-16)', () => {
  let datos = ejemplo();
  datos.pesos = { sentadilla: { 1: 60 } };
  datos = app.guardarEjercicio(datos, 'p', 0, { titulo: 'Sentadilla frontal', foto: 'f1', series: 3 });
  assert.equal(app.previo(datos.pesos, datos.rutinas[0].ejercicios[0].titulo, 1), '–');
  datos = app.guardarEjercicio(datos, 'p', 0, { titulo: 'Sentadilla', foto: 'f1', series: 3 });
  assert.equal(app.previo(datos.pesos, datos.rutinas[0].ejercicios[0].titulo, 1), '60');
});

test('puedeEmpezar: solo semana actual y rutina con ejercicios (RF-27, RF-28)', () => {
  const hoy = new Date(2026, 9, 28); // miércoles 28/10/2026
  const datos = ejemplo();
  assert.equal(app.puedeEmpezar(datos, '2026-10-26', hoy), true); // lunes pasado
  assert.equal(app.puedeEmpezar(datos, '2026-10-30', hoy), true); // viernes
  assert.equal(app.puedeEmpezar(datos, '2026-11-02', hoy), false); // semana siguiente
  assert.equal(app.puedeEmpezar(datos, '2026-10-27', hoy), false); // sin ejercicios
  assert.equal(app.puedeEmpezar(datos, '2026-10-28', hoy), false); // día sin rutina
});

test('empezarEntreno crea una fila vacía por serie (RF-29)', () => {
  const datos = ejemplo();
  const nuevos = app.empezarEntreno(datos, '2026-10-26');
  const vacia = { kg: '', reps: '' };
  assert.deepEqual(nuevos.entrenamiento, {
    fecha: '2026-10-26',
    rutinaId: 'p',
    series: [[vacia, vacia, vacia], [vacia, vacia]],
  });
  assert.equal(datos.entrenamiento, null); // no toca los datos de entrada
});

test('escribirValor guarda lo escrito en esa celda (RF-29)', () => {
  let datos = app.empezarEntreno(ejemplo(), '2026-10-26');
  datos = app.escribirValor(datos, 0, 1, 'kg', '40');
  datos = app.escribirValor(datos, 0, 1, 'reps', '10');
  assert.deepEqual(datos.entrenamiento.series[0][1], { kg: '40', reps: '10' });
  assert.deepEqual(datos.entrenamiento.series[0][0], { kg: '', reps: '' });
});

test('sumarSerie y quitarSerie: límites 1 y 20 sin cambiar la rutina (RF-30)', () => {
  let datos = app.empezarEntreno(ejemplo(), '2026-10-26');
  for (let n = 3; n < 19; n++) datos = app.sumarSerie(datos, 0);
  assert.equal(datos.entrenamiento.series[0].length, 19);
  datos = app.sumarSerie(datos, 0);
  assert.equal(datos.entrenamiento.series[0].length, 20); // 19 → 20
  datos = app.sumarSerie(datos, 0);
  assert.equal(datos.entrenamiento.series[0].length, 20); // no pasa de 20

  // Quitar quita la última fila
  datos = app.escribirValor(datos, 1, 0, 'kg', '80');
  datos = app.quitarSerie(datos, 1);
  assert.deepEqual(datos.entrenamiento.series[1], [{ kg: '80', reps: '' }]);
  datos = app.quitarSerie(datos, 1);
  assert.equal(datos.entrenamiento.series[1].length, 1); // no baja de 1

  assert.equal(datos.rutinas[0].ejercicios[0].series, 3); // rutina intacta
  assert.equal(datos.rutinas[0].ejercicios[1].series, 2);
});

test('terminarEntreno guarda pesos, mantiene vacíos, marca "✓ Hecho" y cierra (RF-33, RF-34, RF-35)', () => {
  let datos = ejemplo();
  datos.pesos = { sentadilla: { 1: 30, 2: 40 } };
  datos = app.empezarEntreno(datos, '2026-10-26');
  datos = app.escribirValor(datos, 0, 0, 'kg', '22,5');
  datos = app.escribirValor(datos, 0, 0, 'reps', '10');
  // serie 2 sin peso: mantiene 40
  datos = app.escribirValor(datos, 0, 2, 'kg', '0');
  datos = app.sumarSerie(datos, 0);
  datos = app.escribirValor(datos, 0, 3, 'kg', '50'); // serie 4 añadida
  const antes = structuredClone(datos);

  const nuevos = app.terminarEntreno(datos);
  assert.deepEqual(nuevos.pesos, { sentadilla: { 1: 22.5, 2: 40, 3: 0, 4: 50 } }); // sin reps; Prensa sin pesos
  assert.equal(app.previo(nuevos.pesos, 'Sentadilla', 1), '22,5');
  assert.equal(app.previo(nuevos.pesos, 'Sentadilla', 3), '0');
  assert.equal(app.previo(nuevos.pesos, 'Sentadilla', 4), '50');
  assert.equal(app.previo(nuevos.pesos, 'Prensa', 1), '–');
  assert.equal(nuevos.plan['2026-10-26'].hecho, true);
  assert.equal(nuevos.entrenamiento, null);
  assert.equal(nuevos.rutinas[0].ejercicios[0].series, 3);
  assert.deepEqual(datos, antes); // no toca los datos de entrada
});

test('entreno del domingo 1/11 sigue abierto y se termina el lunes 2/11 (RF-41)', () => {
  const domingo = new Date(2026, 10, 1);
  let datos = ejemplo();
  assert.equal(app.puedeEmpezar(datos, '2026-11-01', domingo), true);
  datos = app.empezarEntreno(datos, '2026-11-01');
  datos = app.escribirValor(datos, 0, 0, 'kg', '40');
  // Ya es lunes 2/11: el 1/11 no está en la semana actual, pero el entreno sigue abierto
  const lunes = new Date(2026, 10, 2);
  assert.equal(app.diasDeSemana(lunes, 0).includes('2026-11-01'), false);
  assert.equal(datos.entrenamiento.series[0][0].kg, '40');
  const nuevos = app.terminarEntreno(datos);
  assert.equal(app.previo(nuevos.pesos, 'Sentadilla', 1), '40');
  assert.equal(nuevos.plan['2026-11-01'].hecho, true);
  assert.equal(nuevos.entrenamiento, null);
});
