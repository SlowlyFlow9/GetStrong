// Tests de fechas y textos (T1). Se ejecutan con: node --test
// Fijamos la zona horaria de España para que el test del cambio de hora
// (domingo 25/10/2026) pruebe de verdad ese cambio en cualquier ordenador.
process.env.TZ = 'Europe/Madrid';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Las claves que esperamos para cada semana
const semana26 = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'];
const semana2 = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];

test('claveFecha usa la hora local y pone ceros delante', () => {
  assert.equal(app.claveFecha(new Date(2026, 9, 27)), '2026-10-27');
  assert.equal(app.claveFecha(new Date(2026, 10, 1)), '2026-11-01');
  // A las 23:30 sigue siendo el mismo día (en UTC ya sería otro)
  assert.equal(app.claveFecha(new Date(2026, 9, 27, 23, 30)), '2026-10-27');
});

test('fechaDeClave devuelve el día en hora local', () => {
  const fecha = app.fechaDeClave('2026-10-27');
  assert.equal(fecha.getFullYear(), 2026);
  assert.equal(fecha.getMonth(), 9);
  assert.equal(fecha.getDate(), 27);
  assert.equal(fecha.getHours(), 0);
  // Ida y vuelta
  assert.equal(app.claveFecha(app.fechaDeClave('2026-01-05')), '2026-01-05');
});

test('diasDeSemana con hoy = martes 27/10/2026', () => {
  const hoy = new Date(2026, 9, 27);
  assert.deepEqual(app.diasDeSemana(hoy, 0), semana26);
  assert.deepEqual(app.diasDeSemana(hoy, 1), semana2);
});

test('diasDeSemana con hoy = domingo 1/11/2026 (el domingo cierra la semana)', () => {
  const hoy = new Date(2026, 10, 1);
  assert.deepEqual(app.diasDeSemana(hoy, 0), semana26);
  assert.deepEqual(app.diasDeSemana(hoy, 1), semana2);
});

test('diasDeSemana con hoy = lunes 2/11/2026 ya no incluye el 26/10', () => {
  const hoy = new Date(2026, 10, 2);
  assert.deepEqual(app.diasDeSemana(hoy, 0), semana2);
  assert.ok(!app.diasDeSemana(hoy, 0).includes('2026-10-26'));
  assert.ok(!app.diasDeSemana(hoy, 1).includes('2026-10-26'));
});

test('diasDeSemana con hoy = domingo 25/10/2026 (cambio de hora) no se salta días', () => {
  const hoy = new Date(2026, 9, 25, 12, 0);
  assert.deepEqual(app.diasDeSemana(hoy, 0),
    ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
  assert.deepEqual(app.diasDeSemana(hoy, 1), semana26);
});

test('textoDia', () => {
  assert.equal(app.textoDia('2026-10-27'), 'martes 27/10');
  assert.equal(app.textoDia('2026-11-01'), 'domingo 1/11');
  assert.equal(app.textoDia('2026-11-06'), 'viernes 6/11');
});

test('textoDiasAsignados con 1, 2 y 3 días', () => {
  assert.equal(app.textoDiasAsignados(['2026-10-27']), 'al martes 27/10');
  assert.equal(app.textoDiasAsignados(['2026-10-27', '2026-11-06']),
    'al martes 27/10 y al viernes 6/11');
  assert.equal(app.textoDiasAsignados(['2026-10-26', '2026-10-27', '2026-11-06']),
    'al lunes 26/10, al martes 27/10 y al viernes 6/11');
});

test('normalizar y coinciden', () => {
  assert.equal(app.normalizar('  Sentadilla '), 'sentadilla');
  assert.equal(app.coinciden('Sentadilla', 'sentadilla '), true);
  assert.equal(app.coinciden('Sentadilla', 'Sentadilla búlgara'), false);
});

test('escapar sustituye < > & " \'', () => {
  assert.equal(app.escapar(`<b>&"'`), '&lt;b&gt;&amp;&quot;&#39;');
  assert.equal(app.escapar('Pierna'), 'Pierna');
});
