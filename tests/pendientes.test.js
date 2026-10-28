// Tests de la spec 002 (ejercicios pendientes). T2: ejercicios añadidos en el entreno (RF-12, RF-13).
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

// Datos ya migrados: "Torso" (2 ejercicios) con el entreno del miércoles 28/10/2026 abierto
// y "Prensa" de "Pierna" añadida a mano con las series 2, 3 y 4.
function conAnadido() {
  return {
    rutinas: [
      { id: 'pierna', nombre: 'Pierna', ejercicios: [
        { id: 'pierna-0', titulo: 'Sentadilla', foto: 'f1', series: 3 },
        { id: 'pierna-1', titulo: 'Prensa', foto: 'f2', series: 4 },
      ] },
      { id: 'torso', nombre: 'Torso', ejercicios: [
        { id: 'torso-0', titulo: 'Press banca', foto: 'f3', series: 3 },
        { id: 'torso-1', titulo: 'Remo', foto: 'f4', series: 2 },
      ] },
    ],
    plan: { '2026-10-28': { rutinaId: 'torso', hecho: false } },
    pesos: { prensa: { 2: 80 } },
    pendientes: [],
    entrenamiento: {
      fecha: '2026-10-28', rutinaId: 'torso',
      series: [
        [{ kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
        [{ kg: '', reps: '' }, { kg: '', reps: '' }],
        [{ kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
      ],
      anadidos: [
        { titulo: 'Prensa', foto: 'f2-antigua', numeros: [2, 3, 4],
          origen: { rutinaId: 'pierna', ejercicioId: 'pierna-1' } },
      ],
    },
  };
}

test('ejerciciosDelEntreno: primero la rutina y después los añadidos (RF-12)', () => {
  const datos = conAnadido();
  const antes = structuredClone(datos);
  assert.deepEqual(app.ejerciciosDelEntreno(datos), [
    { titulo: 'Press banca', foto: 'f3', numeros: [1, 2, 3], origen: { rutinaId: 'torso', ejercicioId: 'torso-0' } },
    { titulo: 'Remo', foto: 'f4', numeros: [1, 2], origen: { rutinaId: 'torso', ejercicioId: 'torso-1' } },
    { titulo: 'Prensa', foto: 'f2-antigua', numeros: [2, 3, 4], origen: { rutinaId: 'pierna', ejercicioId: 'pierna-1' } },
  ]);
  assert.deepEqual(datos, antes); // no toca la entrada
});

test('ejerciciosDelEntreno: los números de la rutina siguen las filas del entreno', () => {
  let datos = app.sumarSerie(conAnadido(), 1);
  assert.deepEqual(app.ejerciciosDelEntreno(datos)[1].numeros, [1, 2, 3]);
});

test('sumarSerie en un añadido: 2, 3, 4 → 5 (RF-12)', () => {
  const datos = conAnadido();
  const antes = structuredClone(datos);
  const nuevos = app.sumarSerie(datos, 2);
  assert.deepEqual(nuevos.entrenamiento.anadidos[0].numeros, [2, 3, 4, 5]);
  assert.equal(nuevos.entrenamiento.series[2].length, 4);
  assert.deepEqual(datos, antes);
});

test('sumarSerie en un añadido: con la última 19 llega a 20 y no pasa (RF-12)', () => {
  let datos = conAnadido();
  datos.entrenamiento.anadidos[0].numeros = [17, 18, 19];
  datos = app.sumarSerie(datos, 2);
  assert.deepEqual(datos.entrenamiento.anadidos[0].numeros, [17, 18, 19, 20]);
  datos = app.sumarSerie(datos, 2);
  assert.deepEqual(datos.entrenamiento.anadidos[0].numeros, [17, 18, 19, 20]);
  assert.equal(datos.entrenamiento.series[2].length, 4);
});

test('quitarSerie en un añadido: quita la última y deja al menos 1 (RF-12)', () => {
  let datos = app.sumarSerie(conAnadido(), 2);
  datos = app.quitarSerie(datos, 2);
  assert.deepEqual(datos.entrenamiento.anadidos[0].numeros, [2, 3, 4]);
  assert.equal(datos.entrenamiento.series[2].length, 3);

  // Solo con la serie 3: no se quita
  datos = conAnadido();
  datos.entrenamiento.anadidos[0].numeros = [3];
  datos.entrenamiento.series[2] = [{ kg: '', reps: '' }];
  datos = app.quitarSerie(datos, 2);
  assert.deepEqual(datos.entrenamiento.anadidos[0].numeros, [3]);
  assert.equal(datos.entrenamiento.series[2].length, 1);
});

test('terminarEntreno guarda el Previo de un añadido por su número de serie (RF-13)', () => {
  let datos = app.escribirValor(conAnadido(), 2, 0, 'kg', '85'); // fila de la serie 2
  datos = app.escribirValor(datos, 0, 0, 'kg', '60');
  const nuevos = app.terminarEntreno(datos);
  assert.equal(app.previo(nuevos.pesos, 'Prensa', 2), '85');
  assert.equal(app.previo(nuevos.pesos, 'Prensa', 1), '–');
  assert.equal(app.previo(nuevos.pesos, 'Press banca', 1), '60');
  assert.equal(nuevos.plan['2026-10-28'].hecho, true);
  assert.equal(nuevos.entrenamiento, null);
});

test('erroresEntreno señala "-5" en la fila de un añadido (RF-12)', () => {
  const datos = app.escribirValor(conAnadido(), 2, 0, 'kg', '-5');
  assert.deepEqual(app.erroresEntreno(datos.entrenamiento), [
    { ejercicio: 2, serie: 0, campo: 'kg', mensaje: 'Peso no válido' },
  ]);
});

test('un entreno sin anadidos funciona igual', () => {
  let datos = conAnadido();
  delete datos.entrenamiento.anadidos;
  datos.entrenamiento.series.pop();
  assert.equal(app.ejerciciosDelEntreno(datos).length, 2);
  datos = app.sumarSerie(datos, 0);
  datos = app.quitarSerie(datos, 1);
  assert.equal(datos.entrenamiento.anadidos, undefined);
  datos = app.escribirValor(datos, 0, 3, 'kg', '70');
  const nuevos = app.terminarEntreno(datos);
  assert.equal(app.previo(nuevos.pesos, 'Press banca', 4), '70');
});

// ---------- T3: guardar pendientes al terminar (RF-1, RF-2, RF-3, RF-14, RF-15) ----------

// Datos ya migrados con "Pierna" (Sentadilla 3 series, Prensa 4) abierta el 28/10/2026.
function conPierna() {
  const datos = conAnadido();
  datos.plan = { '2026-10-28': { rutinaId: 'pierna', hecho: false } };
  datos.entrenamiento = {
    fecha: '2026-10-28', rutinaId: 'pierna',
    series: [
      [{ kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
      [{ kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }],
    ],
  };
  return datos;
}

// Escribe el mismo KG en varias filas de un ejercicio.
function conPeso(datos, ejercicio, filas, kg) {
  filas.forEach(j => { datos = app.escribirValor(datos, ejercicio, j, 'kg', kg); });
  return datos;
}

const ORIGEN_SENTADILLA = { rutinaId: 'pierna', ejercicioId: 'pierna-0' };
const ORIGEN_PRENSA = { rutinaId: 'pierna', ejercicioId: 'pierna-1' };

test('existeOrigen: rutina y ejercicio existentes, rutina borrada, ejercicio borrado', () => {
  const datos = conPierna();
  assert.equal(app.existeOrigen(datos, ORIGEN_PRENSA), true);
  assert.equal(app.existeOrigen(datos, { rutinaId: 'nada', ejercicioId: 'pierna-1' }), false);
  assert.equal(app.existeOrigen(datos, { rutinaId: 'pierna', ejercicioId: 'pierna-9' }), false);
});

test('guardarPendientes RF-1: peso en las series 1 y 2 de Sentadilla → pendiente con la 3', () => {
  let datos = conPeso(conPierna(), 0, [0, 1], '40');
  datos = conPeso(datos, 1, [0, 1, 2, 3], '80'); // Prensa hecha
  const antes = structuredClone(datos);
  const nuevos = app.guardarPendientes(datos);
  assert.deepEqual(nuevos.pendientes, [
    { titulo: 'Sentadilla', foto: 'f1', numeros: [3], origen: ORIGEN_SENTADILLA },
  ]);
  assert.deepEqual(datos, antes); // no toca la entrada
  assert.deepEqual(nuevos.entrenamiento, datos.entrenamiento); // no cierra el entreno
});

test('guardarPendientes RF-1: Prensa sin nada → pendiente con 1, 2, 3 y 4', () => {
  const datos = conPeso(conPierna(), 0, [0, 1, 2], '40');
  assert.deepEqual(app.guardarPendientes(datos).pendientes, [
    { titulo: 'Prensa', foto: 'f2', numeros: [1, 2, 3, 4], origen: ORIGEN_PRENSA },
  ]);
});

test('guardarPendientes RF-1: serie 4 añadida sin peso → pendiente con la 4', () => {
  let datos = app.sumarSerie(conPierna(), 0);
  datos = conPeso(datos, 0, [0, 1, 2], '40');
  datos = conPeso(datos, 1, [0, 1, 2, 3], '80');
  assert.deepEqual(app.guardarPendientes(datos).pendientes, [
    { titulo: 'Sentadilla', foto: 'f1', numeros: [4], origen: ORIGEN_SENTADILLA },
  ]);
});

test('guardarPendientes RF-2: peso 0 o peso sin REPS cuentan como hechas', () => {
  let datos = conPeso(conPierna(), 0, [0, 1, 2], '0');
  datos = conPeso(datos, 1, [0, 1, 2, 3], '20'); // sin REPS
  assert.deepEqual(app.guardarPendientes(datos).pendientes, []);
});

test('guardarPendientes RF-2: las REPS sin peso no cuentan como hecha', () => {
  let datos = conPeso(conPierna(), 1, [0, 1, 2, 3], '80');
  datos = conPeso(datos, 0, [0, 1], '40');
  datos = app.escribirValor(datos, 0, 2, 'reps', '10');
  assert.deepEqual(app.guardarPendientes(datos).pendientes[0].numeros, [3]);
});

test('guardarPendientes RF-3: una serie quitada no cuenta', () => {
  let datos = app.quitarSerie(conPierna(), 0);
  datos = conPeso(datos, 0, [0, 1], '40');
  datos = conPeso(datos, 1, [0, 1, 2, 3], '80');
  assert.deepEqual(app.guardarPendientes(datos).pendientes, []);
});

test('guardarPendientes: en el orden de la tabla y al final de la cola (RF-5)', () => {
  const datos = conPierna();
  const curl = { titulo: 'Curl', foto: 'f', numeros: [2], origen: { rutinaId: 'torso', ejercicioId: 'torso-1' } };
  datos.pendientes = [curl];
  const nuevos = app.guardarPendientes(datos);
  assert.deepEqual(nuevos.pendientes.map(p => p.titulo), ['Curl', 'Sentadilla', 'Prensa']);
  assert.deepEqual(nuevos.pendientes[0], curl);
});

test('guardarPendientes RF-14: un añadido sin acabar vuelve al final con su título, foto y origen', () => {
  const datos = conAnadido();
  datos.entrenamiento.anadidos[0].numeros = [1, 2, 3, 4];
  datos.entrenamiento.series[2].push({ kg: '', reps: '' });
  let hecho = conPeso(datos, 0, [0, 1, 2], '60');
  hecho = conPeso(hecho, 1, [0, 1], '50');
  hecho = conPeso(hecho, 2, [0], '80'); // solo la serie 1 de Prensa
  const curl = { titulo: 'Curl', foto: 'f', numeros: [2], origen: { rutinaId: 'torso', ejercicioId: 'torso-1' } };
  hecho.pendientes = [curl];
  assert.deepEqual(app.guardarPendientes(hecho).pendientes, [
    curl,
    { titulo: 'Prensa', foto: 'f2-antigua', numeros: [2, 3, 4], origen: ORIGEN_PRENSA },
  ]);
});

test('guardarPendientes RF-15: si el origen se borró con el entreno abierto, no vuelve', () => {
  let datos = conAnadido();
  datos = app.borrarRutina(datos, 'pierna');
  datos = conPeso(datos, 0, [0, 1, 2], '60');
  datos = conPeso(datos, 1, [0, 1], '50');
  datos = conPeso(datos, 2, [0], '85');
  assert.deepEqual(app.guardarPendientes(datos).pendientes, []);
});

// ---------- T4: la cola de preguntas (RF-5, RF-8, RF-9, RF-10, RF-11, RF-15) ----------

// Pendientes de prueba (como los deja guardarPendientes).
const SENTADILLA = { titulo: 'Sentadilla', foto: 'f1', numeros: [3], origen: ORIGEN_SENTADILLA };
const PRENSA = { titulo: 'Prensa', foto: 'f2', numeros: [1, 2, 3, 4], origen: ORIGEN_PRENSA };
const CURL = { titulo: 'Curl', foto: 'f5', numeros: [2, 3], origen: { rutinaId: 'brazo', ejercicioId: 'brazo-0' } };

// Datos con "Brazo" (Curl) además de "Pierna" y "Torso", y el entreno de "Torso" del
// 28/10/2026 recién empezado (sin anadidos, como lo deja empezarEntreno).
function conTorso(pendientes) {
  const datos = conAnadido();
  datos.rutinas.push({ id: 'brazo', nombre: 'Brazo', ejercicios: [
    { id: 'brazo-0', titulo: 'Curl', foto: 'f5', series: 3 },
  ] });
  datos.pendientes = structuredClone(pendientes);
  return app.empezarEntreno(datos, '2026-10-28');
}

// Escribe peso en todas las filas de todos los ejercicios del entreno abierto,
// salvo en las indicadas en "sinPeso" ({ ejercicio, serie }).
function todoConPeso(datos, sinPeso = []) {
  datos.entrenamiento.series.forEach((filas, i) => filas.forEach((fila, j) => {
    if (!sinPeso.some(s => s.ejercicio === i && s.serie === j)) {
      datos = app.escribirValor(datos, i, j, 'kg', '50');
    }
  }));
  return datos;
}

// Termina el entreno (guardando pendientes) y empieza otro de "Torso" el mismo día.
function terminarYEmpezar(datos) {
  datos = app.terminarEntreno(app.guardarPendientes(datos));
  return app.olvidarCoincidentes(app.empezarEntreno(datos, '2026-10-28'));
}

test('textoPregunta: "1 serie" en singular y "4 series" en plural (RF-5)', () => {
  assert.equal(app.textoPregunta(SENTADILLA),
    'Te quedó sin hacer Sentadilla (1 serie). ¿Añadirlo a este entrenamiento?');
  assert.equal(app.textoPregunta(PRENSA),
    'Te quedó sin hacer Prensa (4 series). ¿Añadirlo a este entrenamiento?');
});

test('olvidarCoincidentes: "sentadilla " en la rutina olvida "Sentadilla" y deja los demás en su orden (RF-8)', () => {
  let datos = conTorso([CURL, SENTADILLA, PRENSA]);
  datos.rutinas[1].ejercicios[1].titulo = 'sentadilla ';
  const antes = structuredClone(datos);
  const nuevos = app.olvidarCoincidentes(datos);
  assert.deepEqual(nuevos.pendientes, [CURL, PRENSA]);
  assert.deepEqual(datos, antes); // no toca la entrada
});

test('aceptarPendiente: pendientes[0] va al final, con una fila vacía por número (RF-9)', () => {
  const datos = conTorso([PRENSA, SENTADILLA]);
  const antes = structuredClone(datos);
  let nuevos = app.aceptarPendiente(datos);
  assert.deepEqual(nuevos.pendientes, [SENTADILLA]);
  assert.deepEqual(nuevos.entrenamiento.anadidos, [PRENSA]);
  assert.deepEqual(nuevos.entrenamiento.series[2], [
    { kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' },
  ]);
  // El segundo aceptado va detrás del primero (orden de aceptación)
  nuevos = app.aceptarPendiente(nuevos);
  assert.deepEqual(nuevos.pendientes, []);
  assert.deepEqual(app.ejerciciosDelEntreno(nuevos).map(e => e.titulo),
    ['Press banca', 'Remo', 'Prensa', 'Sentadilla']);
  assert.deepEqual(nuevos.entrenamiento.series[3], [{ kg: '', reps: '' }]);
  // La rutina no cambia y la entrada tampoco
  assert.deepEqual(nuevos.rutinas, datos.rutinas);
  assert.deepEqual(datos, antes);
});

test('aceptarPendiente: título y foto del pendiente aunque el origen haya cambiado (RF-9)', () => {
  let datos = conTorso([PRENSA]);
  datos = app.guardarEjercicio(datos, 'pierna', 1,
    { id: 'pierna-1', titulo: 'Prensa 45', foto: 'f2-nueva', series: 5 });
  const nuevos = app.aceptarPendiente(datos);
  assert.deepEqual(nuevos.entrenamiento.anadidos, [PRENSA]);
  assert.equal(nuevos.entrenamiento.series[2].length, 4);
});

test('rechazarPendiente: quita pendientes[0] y deja los demás (RF-10)', () => {
  const datos = conTorso([PRENSA, SENTADILLA]);
  const antes = structuredClone(datos);
  const nuevos = app.rechazarPendiente(datos);
  assert.deepEqual(nuevos.pendientes, [SENTADILLA]);
  assert.deepEqual(nuevos.entrenamiento, datos.entrenamiento);
  assert.deepEqual(datos, antes);
});

test('rechazarPendiente RF-10: el rechazado no vuelve a preguntarse', () => {
  let datos = app.rechazarPendiente(conTorso([PRENSA]));
  datos = terminarYEmpezar(todoConPeso(datos));
  assert.deepEqual(datos.pendientes, []);
});

test('olvidarSinOrigen: rutina borrada (RF-15)', () => {
  const datos = app.borrarRutina(conTorso([SENTADILLA, CURL, PRENSA]), 'pierna');
  const antes = structuredClone(datos);
  assert.deepEqual(app.olvidarSinOrigen(datos).pendientes, [CURL]);
  assert.deepEqual(datos, antes);
});

test('olvidarSinOrigen: ejercicio borrado (RF-15)', () => {
  const datos = app.borrarEjercicio(conTorso([SENTADILLA, CURL, PRENSA]), 'pierna', 0);
  assert.deepEqual(app.olvidarSinOrigen(datos).pendientes, [CURL, PRENSA]);
});

test('olvidarSinOrigen: ejercicio renombrado y después borrado (RF-15)', () => {
  let datos = conTorso([SENTADILLA, PRENSA]);
  datos = app.guardarEjercicio(datos, 'pierna', 0,
    { id: 'pierna-0', titulo: 'Sentadilla trasera', foto: 'f1', series: 3 });
  assert.deepEqual(app.olvidarSinOrigen(datos).pendientes, [SENTADILLA, PRENSA]); // renombrar no olvida
  datos = app.borrarEjercicio(datos, 'pierna', 0);
  assert.deepEqual(app.olvidarSinOrigen(datos).pendientes, [PRENSA]);
});

test('secuencia RF-5: "Curl" de un entreno y "Prensa" de otro → primero "Curl"', () => {
  // Entreno de "Brazo" que deja "Curl" sin hacer
  let datos = conTorso([]);
  datos.plan['2026-10-27'] = { rutinaId: 'brazo', hecho: false };
  datos.entrenamiento = null;
  datos = app.empezarEntreno(datos, '2026-10-27');
  datos = app.terminarEntreno(app.guardarPendientes(datos));
  // Entreno de "Pierna" que deja "Prensa" sin hacer
  datos.plan['2026-10-28'] = { rutinaId: 'pierna', hecho: false };
  datos = app.empezarEntreno(datos, '2026-10-28');
  datos = app.terminarEntreno(app.guardarPendientes(conPeso(datos, 0, [0, 1, 2], '40')));
  // Nuevo entreno de "Torso"
  datos.plan['2026-10-29'] = { rutinaId: 'torso', hecho: false };
  datos = app.olvidarCoincidentes(app.empezarEntreno(datos, '2026-10-29'));
  assert.deepEqual(datos.pendientes.map(p => p.titulo), ['Curl', 'Prensa']);
  assert.equal(app.textoPregunta(datos.pendientes[0]),
    'Te quedó sin hacer Curl (3 series). ¿Añadirlo a este entrenamiento?');
});

test('secuencia RF-5 aceptación 4: añadir "Curl" sin acabarlo, no responder a "Prensa" → "Prensa" y después "Curl"', () => {
  let datos = app.aceptarPendiente(conTorso([CURL, PRENSA]));
  datos = todoConPeso(datos, [{ ejercicio: 2, serie: 1 }]); // la serie 3 de Curl sin peso
  datos = terminarYEmpezar(datos);
  assert.deepEqual(datos.pendientes, [PRENSA, { ...CURL, numeros: [3] }]);
});

test('secuencia RF-11 aceptación 3: terminar sin responder → "Sentadilla" y después "Prensa"', () => {
  let datos = conTorso([SENTADILLA, PRENSA]);
  datos = terminarYEmpezar(todoConPeso(datos));
  assert.deepEqual(datos.pendientes, [SENTADILLA, PRENSA]);
});

test('secuencia RF-11 aceptación 2: añadir "Sentadilla", recargar sin responder → solo "Prensa"', () => {
  let datos = app.aceptarPendiente(conTorso([SENTADILLA, PRENSA]));
  datos = app.migrar(JSON.parse(JSON.stringify(datos))); // recargar
  datos = terminarYEmpezar(todoConPeso(datos));
  assert.deepEqual(datos.pendientes, [PRENSA]);
});

test('secuencia RF-8: "Sentadilla" pendiente y rutina con "sentadilla " → se olvida y no vuelve', () => {
  let datos = conTorso([SENTADILLA]);
  datos.entrenamiento = null;
  datos.rutinas[1].ejercicios[0].titulo = 'sentadilla ';
  datos = app.olvidarCoincidentes(app.empezarEntreno(datos, '2026-10-28'));
  assert.deepEqual(datos.pendientes, []);
  datos.rutinas[1].ejercicios[0].titulo = 'Press banca';
  datos = terminarYEmpezar(todoConPeso(datos));
  assert.deepEqual(datos.pendientes, []);
});
