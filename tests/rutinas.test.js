// Tests de rutinas, ejercicios y plan semanal (T3): RF-4, RF-7, RF-15, RF-16, RF-18,
// RF-20, RF-21, RF-22, RF-35, RF-39 y RF-40.
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Martes 27/10/2026 (hora local)
const hoy = new Date(2026, 9, 27);

// Datos de ejemplo: Pierna en un día pasado (19/10), esta semana (27/10) y la
// siguiente (6/11); Torso el jueves 29/10.
function ejemplo() {
  return {
    rutinas: [
      { id: 'p', nombre: 'Pierna', ejercicios: [{ titulo: 'Sentadilla', foto: 'f1', series: 3 }] },
      { id: 't', nombre: 'Torso', ejercicios: [] },
    ],
    plan: {
      '2026-10-19': { rutinaId: 'p', hecho: true },
      '2026-10-27': { rutinaId: 'p', hecho: true },
      '2026-10-29': { rutinaId: 't', hecho: false },
      '2026-11-06': { rutinaId: 'p', hecho: false },
    },
    pesos: {},
    entrenamiento: null,
  };
}

test('datosVacios', () => {
  assert.deepEqual(app.datosVacios(), { rutinas: [], plan: {}, pesos: {}, entrenamiento: null });
});

test('guardarRutina crea sin ejercicios y renombra (RF-4, RF-15)', () => {
  let datos = app.guardarRutina(app.datosVacios(), 'p', '  Pierna  ');
  assert.deepEqual(datos.rutinas, [{ id: 'p', nombre: 'Pierna', ejercicios: [] }]);
  datos = app.guardarRutina(datos, 'p', 'Pierna A');
  assert.equal(datos.rutinas.length, 1);
  assert.equal(datos.rutinas[0].nombre, 'Pierna A');
});

test('guardarEjercicio añade 15 en orden y edita título, foto y series (RF-7, RF-15, RF-16)', () => {
  let datos = app.guardarRutina(app.datosVacios(), 'p', 'Pierna');
  for (let n = 1; n <= 15; n++) {
    datos = app.guardarEjercicio(datos, 'p', null, { titulo: 'E' + n, foto: 'f' + n, series: 3 });
  }
  const titulos = datos.rutinas[0].ejercicios.map(e => e.titulo);
  assert.deepEqual(titulos, Array.from({ length: 15 }, (_, i) => 'E' + (i + 1)));

  datos = app.guardarEjercicio(datos, 'p', 1, { titulo: 'Sentadilla trasera', foto: 'nueva', series: 4 });
  assert.deepEqual(datos.rutinas[0].ejercicios[1], { titulo: 'Sentadilla trasera', foto: 'nueva', series: 4 });
  assert.equal(datos.rutinas[0].ejercicios.length, 15);
});

test('borrarEjercicio quita solo ese ejercicio (RF-15)', () => {
  let datos = app.guardarRutina(app.datosVacios(), 'p', 'Pierna');
  datos = app.guardarEjercicio(datos, 'p', null, { titulo: 'A', foto: 'f', series: 3 });
  datos = app.guardarEjercicio(datos, 'p', null, { titulo: 'B', foto: 'f', series: 3 });
  datos = app.borrarEjercicio(datos, 'p', 0);
  assert.deepEqual(datos.rutinas[0].ejercicios.map(e => e.titulo), ['B']);
});

test('diasAsignados: semana actual y siguiente, sin días pasados (RF-18)', () => {
  assert.deepEqual(app.diasAsignados(ejemplo(), 'p', hoy), ['2026-10-27', '2026-11-06']);
  assert.deepEqual(app.diasAsignados(ejemplo(), 't', hoy), ['2026-10-29']);
});

test('borrarRutina vacía sus días en todas las semanas y quita "✓ Hecho" (RF-18, RF-35)', () => {
  const datos = app.borrarRutina(ejemplo(), 'p');
  assert.deepEqual(datos.rutinas.map(r => r.id), ['t']);
  assert.deepEqual(datos.plan, { '2026-10-29': { rutinaId: 't', hecho: false } });
});

test('asignarRutina sustituye y solo afecta a ese día (RF-20, RF-21)', () => {
  const datos = app.asignarRutina(ejemplo(), '2026-10-29', 'p');
  assert.deepEqual(datos.plan['2026-10-29'], { rutinaId: 'p', hecho: false });
  assert.deepEqual(datos.plan['2026-11-06'], { rutinaId: 'p', hecho: false });
  assert.deepEqual(datos.plan['2026-10-27'], { rutinaId: 'p', hecho: true });
});

test('quitarRutina vacía solo ese día; una semana sin planificar está vacía (RF-21, RF-22)', () => {
  const datos = app.quitarRutina(ejemplo(), '2026-11-06');
  assert.equal(datos.plan['2026-11-06'], undefined);
  assert.deepEqual(datos.plan['2026-10-27'], { rutinaId: 'p', hecho: true });
  // Ningún día de la semana del 9/11 tiene entrada
  const semana = app.diasDeSemana(new Date(2026, 10, 10), 0);
  assert.ok(semana.every(clave => datos.plan[clave] === undefined));
});

test('"✓ Hecho": se queda al asignar la misma, se va al cambiar o vaciar y no vuelve (RF-35)', () => {
  // Asignar la misma rutina no cambia nada
  assert.equal(app.asignarRutina(ejemplo(), '2026-10-27', 'p').plan['2026-10-27'].hecho, true);
  // Otra rutina: se quita la marca
  assert.equal(app.asignarRutina(ejemplo(), '2026-10-27', 't').plan['2026-10-27'].hecho, false);
  // Quitar y volver a asignar la misma: no vuelve
  let datos = app.quitarRutina(ejemplo(), '2026-10-27');
  datos = app.asignarRutina(datos, '2026-10-27', 'p');
  assert.equal(datos.plan['2026-10-27'].hecho, false);
  // Borrar la rutina, crearla de nuevo con el mismo id y asignarla: no vuelve
  datos = app.borrarRutina(ejemplo(), 'p');
  datos = app.guardarRutina(datos, 'p', 'Pierna');
  datos = app.asignarRutina(datos, '2026-10-27', 'p');
  assert.equal(datos.plan['2026-10-27'].hecho, false);
});

test('rutinaBloqueada y diaBloqueado con un entrenamiento abierto (RF-39, RF-40)', () => {
  const datos = ejemplo();
  assert.equal(app.rutinaBloqueada(datos, 'p'), false);
  assert.equal(app.diaBloqueado(datos, '2026-10-27'), false);
  datos.entrenamiento = { fecha: '2026-10-27', rutinaId: 'p', series: [[{ kg: '', reps: '' }]] };
  assert.equal(app.rutinaBloqueada(datos, 'p'), true);
  assert.equal(app.rutinaBloqueada(datos, 't'), false);
  assert.equal(app.diaBloqueado(datos, '2026-10-27'), true);
  assert.equal(app.diaBloqueado(datos, '2026-10-29'), false);
});

test('las funciones de cambio no modifican los datos de entrada', () => {
  const datos = ejemplo();
  const copia = structuredClone(datos);
  app.guardarRutina(datos, 'p', 'Otra');
  app.guardarRutina(datos, 'n', 'Nueva');
  app.guardarEjercicio(datos, 'p', null, { titulo: 'X', foto: 'f', series: 1 });
  app.guardarEjercicio(datos, 'p', 0, { titulo: 'X', foto: 'f', series: 1 });
  app.borrarEjercicio(datos, 'p', 0);
  app.borrarRutina(datos, 'p');
  app.asignarRutina(datos, '2026-10-27', 't');
  app.quitarRutina(datos, '2026-10-27');
  assert.deepEqual(datos, copia);
});
