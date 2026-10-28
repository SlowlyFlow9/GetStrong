// Tests de la migración al formato de la spec 002 (T1): RF-16 y principio 5.
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Datos guardados con el formato de la spec 001 (plan.md 2.1), con un entreno abierto.
function antiguo() {
  return {
    rutinas: [
      {
        id: 'lq3k9x-a1b2', nombre: 'Pierna', ejercicios: [
          { titulo: 'Sentadilla', foto: 'f1', series: 3 },
          { titulo: 'Prensa', foto: 'f2', series: 4 },
        ],
      },
      { id: 'lq4m2z-c3d4', nombre: 'Torso', ejercicios: [] },
    ],
    plan: { '2026-10-27': { rutinaId: 'lq3k9x-a1b2', hecho: false } },
    pesos: { prensa: { 1: 80 } },
    entrenamiento: {
      fecha: '2026-10-27', rutinaId: 'lq3k9x-a1b2',
      series: [
        [{ kg: '40', reps: '10' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
        [{ kg: '80', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
      ],
    },
  };
}

// Quita a unos datos migrados los campos que añade la migración (para compararlos).
function sinAnadidos(migrados) {
  const copia = structuredClone(migrados);
  delete copia.pendientes;
  copia.rutinas.forEach(r => r.ejercicios.forEach(e => delete e.id));
  return copia;
}

test('migrar: los ejercicios sin id reciben rutinaId-posición', () => {
  const migrados = app.migrar(antiguo());
  const ids = migrados.rutinas[0].ejercicios.map(e => e.id);
  assert.deepEqual(ids, ['lq3k9x-a1b2-0', 'lq3k9x-a1b2-1']);
});

test('migrar: un ejercicio que ya tiene id lo conserva', () => {
  const datos = antiguo();
  datos.rutinas[0].ejercicios[1].id = 'lr1a2b-e5f6';
  const migrados = app.migrar(datos);
  assert.equal(migrados.rutinas[0].ejercicios[0].id, 'lq3k9x-a1b2-0');
  assert.equal(migrados.rutinas[0].ejercicios[1].id, 'lr1a2b-e5f6');
});

test('migrar: pone pendientes vacío si falta y no toca uno existente', () => {
  assert.deepEqual(app.migrar(antiguo()).pendientes, []);
  const datos = antiguo();
  const pendiente = { titulo: 'Curl', foto: 'f', numeros: [2], origen: { rutinaId: 'x', ejercicioId: 'x-0' } };
  datos.pendientes = [pendiente];
  assert.deepEqual(app.migrar(datos).pendientes, [pendiente]);
});

test('migrar: no se pierde nada (quitando lo añadido queda igual que la entrada)', () => {
  assert.deepEqual(sinAnadidos(app.migrar(antiguo())), antiguo());
});

test('migrar: es idempotente', () => {
  const una = app.migrar(antiguo());
  assert.deepEqual(app.migrar(una), una);
});

test('migrar: no modifica los datos de entrada', () => {
  const datos = antiguo();
  app.migrar(datos);
  assert.deepEqual(datos, antiguo());
});

test('migrar: datos vacíos solo reciben pendientes', () => {
  assert.deepEqual(app.migrar(app.datosVacios()), { ...app.datosVacios(), pendientes: [] });
});

test('migrar: el entreno abierto antiguo sale idéntico y sigue funcionando', () => {
  let datos = app.migrar(antiguo());
  assert.deepEqual(datos.entrenamiento, antiguo().entrenamiento);
  datos = app.escribirValor(datos, 0, 1, 'kg', '45');
  datos = app.sumarSerie(datos, 1);
  assert.equal(datos.entrenamiento.series[1].length, 5);
  datos = app.quitarSerie(datos, 1);
  assert.equal(datos.entrenamiento.series[1].length, 4);
  datos = app.terminarEntreno(datos);
  assert.equal(datos.entrenamiento, null);
  assert.equal(datos.plan['2026-10-27'].hecho, true);
  assert.equal(app.previo(datos.pesos, 'Sentadilla', 2), '45');
  assert.equal(app.previo(datos.pesos, 'Prensa', 1), '80');
});

test('migrar: un entreno abierto antiguo (sin anadidos) deja sus pendientes al terminar', () => {
  const datos = app.migrar(antiguo());
  const nuevos = app.guardarPendientes(datos);
  assert.deepEqual(nuevos.pendientes, [
    { titulo: 'Sentadilla', foto: 'f1', numeros: [2, 3],
      origen: { rutinaId: 'lq3k9x-a1b2', ejercicioId: 'lq3k9x-a1b2-0' } },
    { titulo: 'Prensa', foto: 'f2', numeros: [2, 3, 4],
      origen: { rutinaId: 'lq3k9x-a1b2', ejercicioId: 'lq3k9x-a1b2-1' } },
  ]);
  assert.equal(nuevos.entrenamiento.anadidos, undefined);
});
