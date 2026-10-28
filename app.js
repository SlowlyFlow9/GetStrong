// GetStrong: planificador de entrenamiento.
// Este archivo tiene dos bloques:
//   1) Lógica pura: cálculos sin pantalla (DOM) ni localStorage. Se prueban con node --test.
//   2) Interfaz: lo que se dibuja en la página y responde a los toques.
// Al final está el arranque y la exportación para los tests.

// ============================================================
// 1) LÓGICA PURA
// ============================================================

// ---------- Fechas y textos ----------

// Nombres de los días en el orden de getDay(): 0 = domingo, 1 = lunes...
const NOMBRES_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Convierte una fecha en su clave "AAAA-MM-DD" usando la hora local (nunca UTC).
function claveFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() empieza en 0
  const dia = String(fecha.getDate()).padStart(2, '0');
  return anio + '-' + mes + '-' + dia;
}

// Convierte una clave "AAAA-MM-DD" en una fecha a las 00:00 en hora local.
// No usamos new Date('AAAA-MM-DD') porque eso la lee en UTC y puede dar el día anterior.
function fechaDeClave(clave) {
  const partes = clave.split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

// Devuelve las 7 claves (de lunes a domingo) de la semana de "hoy".
// desplazamiento: 0 = semana actual, 1 = semana siguiente.
function diasDeSemana(hoy, desplazamiento) {
  // Cuántos días han pasado desde el lunes: lunes 0, martes 1... domingo 6
  const desdeLunes = (hoy.getDay() + 6) % 7;
  const dias = [];
  for (let n = 0; n < 7; n++) {
    // new Date(año, mes, día + n) cuenta días de calendario, así que el cambio
    // de hora (días de 23 o 25 horas) no hace que se salte ni repita un día.
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(),
      hoy.getDate() - desdeLunes + desplazamiento * 7 + n);
    dias.push(claveFecha(fecha));
  }
  return dias;
}

// "2026-10-27" → "martes 27/10"
function textoDia(clave) {
  const fecha = fechaDeClave(clave);
  return NOMBRES_DIAS[fecha.getDay()] + ' ' + fecha.getDate() + '/' + (fecha.getMonth() + 1);
}

// Lista de claves → "al martes 27/10", "al A y al B" o "al A, al B y al C"
function textoDiasAsignados(claves) {
  const textos = claves.map(clave => 'al ' + textoDia(clave));
  if (textos.length === 1) return textos[0];
  const ultimo = textos.pop();
  return textos.join(', ') + ' y ' + ultimo;
}

// Quita los espacios de los extremos y pasa a minúsculas, para comparar títulos.
function normalizar(texto) {
  return texto.trim().toLowerCase();
}

// true si dos textos son "el mismo" sin contar mayúsculas ni espacios de los extremos.
function coinciden(a, b) {
  return normalizar(a) === normalizar(b);
}

// Cambia los caracteres especiales por entidades HTML para pintar texto del
// usuario con innerHTML sin que se interprete como código.
function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;') // el & primero, para no estropear las demás entidades
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ---------- Validaciones ----------

// Comprueba el nombre de una rutina. "id" es la rutina que se renombra
// (null si es nueva), para no compararla consigo misma.
// Devuelve '' si vale o el texto del error.
function validarRutina(datos, id, nombre) {
  if (nombre.trim() === '') return 'La rutina necesita un nombre';
  const repetida = datos.rutinas.some(rutina => rutina.id !== id && coinciden(rutina.nombre, nombre));
  if (repetida) return 'Ya hay una rutina con ese nombre';
  return '';
}

// Lee el número de series: un entero de 1 a 20, o null si no vale.
function leerSeries(texto) {
  const limpio = texto.trim();
  if (!/^\d+$/.test(limpio)) return null; // solo cifras
  const numero = Number(limpio);
  if (numero < 1 || numero > 20) return null;
  return numero;
}

// Comprueba un ejercicio antes de guardarlo en "rutina". "indice" es su posición
// si se está editando (null si es nuevo), para no compararlo consigo mismo.
// Devuelve '' si vale o solo el PRIMER error, en este orden:
// título, imagen, título repetido, series.
function validarEjercicio(rutina, indice, titulo, foto, textoSeries) {
  if (titulo.trim() === '') return 'El ejercicio necesita un título';
  if (!foto) return 'El ejercicio necesita una imagen';
  const repetido = rutina.ejercicios.some((ejercicio, i) => i !== indice && coinciden(ejercicio.titulo, titulo));
  if (repetido) return 'Ya hay un ejercicio con ese título';
  if (leerSeries(textoSeries) === null) return 'Indica cuántas series (de 1 a 20)';
  return '';
}

// Lee un peso en kg. Admite coma o punto decimal y el 0.
// Devuelve null si está vacío, el número si vale y NaN si no vale (negativos, letras...).
function leerPeso(texto) {
  const limpio = texto.trim();
  if (limpio === '') return null;
  if (!/^\d+([.,]\d+)?$/.test(limpio)) return NaN;
  return Number(limpio.replace(',', '.')); // Number() solo entiende el punto
}

// Lee unas repeticiones: null si está vacío, el entero (0 o más) si vale y NaN si no.
function leerReps(texto) {
  const limpio = texto.trim();
  if (limpio === '') return null;
  if (!/^\d+$/.test(limpio)) return NaN;
  return Number(limpio);
}

// Revisa todo lo escrito en el entrenamiento y devuelve la lista de campos erróneos:
// { ejercicio, serie, campo: 'kg' | 'reps', mensaje }. Ejercicio y serie son
// posiciones desde 0. Si todo vale, la lista está vacía.
function erroresEntreno(entrenamiento) {
  const errores = [];
  entrenamiento.series.forEach((filas, ejercicio) => {
    filas.forEach((fila, serie) => {
      if (Number.isNaN(leerPeso(fila.kg))) {
        errores.push({ ejercicio, serie, campo: 'kg', mensaje: 'Peso no válido' });
      }
      if (Number.isNaN(leerReps(fila.reps))) {
        errores.push({ ejercicio, serie, campo: 'reps', mensaje: 'Repeticiones no válidas' });
      }
    });
  });
  return errores;
}

// ---------- Rutinas, ejercicios y plan semanal ----------
// Las funciones que cambian datos NO tocan los datos recibidos: hacen una copia
// con structuredClone, cambian la copia y la devuelven.

// Datos de una app recién estrenada: sin rutinas, plan, pesos ni entrenamiento.
function datosVacios() {
  return { rutinas: [], plan: {}, pesos: {}, entrenamiento: null };
}

// Si existe la rutina "id", la renombra; si no, la crea sin ejercicios.
// El nombre se guarda sin espacios en los extremos.
function guardarRutina(datos, id, nombre) {
  const nuevos = structuredClone(datos);
  const rutina = nuevos.rutinas.find(r => r.id === id);
  if (rutina) {
    rutina.nombre = nombre.trim();
  } else {
    nuevos.rutinas.push({ id: id, nombre: nombre.trim(), ejercicios: [] });
  }
  return nuevos;
}

// Guarda un ejercicio { titulo, foto, series } en la rutina "id".
// indice null = ejercicio nuevo (va al final); si no, sustituye al de esa posición.
function guardarEjercicio(datos, id, indice, ejercicio) {
  const nuevos = structuredClone(datos);
  const rutina = nuevos.rutinas.find(r => r.id === id);
  if (indice === null) {
    rutina.ejercicios.push(ejercicio);
  } else {
    rutina.ejercicios[indice] = ejercicio;
  }
  return nuevos;
}

// Quita el ejercicio de la posición "indice" (desde 0) de la rutina "id".
function borrarEjercicio(datos, id, indice) {
  const nuevos = structuredClone(datos);
  const rutina = nuevos.rutinas.find(r => r.id === id);
  rutina.ejercicios.splice(indice, 1);
  return nuevos;
}

// Días de la semana actual y la siguiente que tienen la rutina "id", en orden de fecha.
// Sirve para el texto de la confirmación al borrar (RF-18).
function diasAsignados(datos, id, hoy) {
  const dias = diasDeSemana(hoy, 0).concat(diasDeSemana(hoy, 1));
  return dias.filter(clave => datos.plan[clave] && datos.plan[clave].rutinaId === id);
}

// Borra la rutina "id" y la quita de TODOS los días del plan, también de semanas
// pasadas. Al borrar la entrada del día se va también su marca "✓ Hecho".
function borrarRutina(datos, id) {
  const nuevos = structuredClone(datos);
  nuevos.rutinas = nuevos.rutinas.filter(r => r.id !== id);
  for (const clave in nuevos.plan) {
    if (nuevos.plan[clave].rutinaId === id) delete nuevos.plan[clave];
  }
  return nuevos;
}

// Pone la rutina "id" en el día "clave", sustituyendo la que hubiera.
// Si ya tenía esa misma rutina no cambia nada (conserva "✓ Hecho"); si no,
// el día queda pendiente (hecho: false).
function asignarRutina(datos, clave, id) {
  const nuevos = structuredClone(datos);
  const dia = nuevos.plan[clave];
  if (!dia || dia.rutinaId !== id) {
    nuevos.plan[clave] = { rutinaId: id, hecho: false };
  }
  return nuevos;
}

// Deja el día "clave" vacío. Se borra su entrada y con ella la marca "✓ Hecho",
// así que si luego se asigna la misma rutina vuelve como pendiente.
function quitarRutina(datos, clave) {
  const nuevos = structuredClone(datos);
  delete nuevos.plan[clave];
  return nuevos;
}

// true si hay un entrenamiento abierto de la rutina "id": no se puede editar ni borrar (RF-39).
function rutinaBloqueada(datos, id) {
  return datos.entrenamiento !== null && datos.entrenamiento.rutinaId === id;
}

// true si hay un entrenamiento abierto del día "clave": no se puede cambiar su rutina (RF-40).
function diaBloqueado(datos, clave) {
  return datos.entrenamiento !== null && datos.entrenamiento.fecha === clave;
}

// ---------- Previo y entrenamiento ----------

// Texto de la columna Previo para la serie "numeroSerie" (desde 1) del ejercicio "titulo":
// el último peso guardado con la coma decimal ("22,5", "0") o "–" si no hay.
// Los pesos van por título normalizado, así que lo comparten las rutinas con el mismo título.
function previo(pesos, titulo, numeroSerie) {
  const delEjercicio = pesos[normalizar(titulo)];
  if (!delEjercicio || delEjercicio[numeroSerie] === undefined) return '–';
  return String(delEjercicio[numeroSerie]).replace('.', ',');
}

// true si se puede empezar el entrenamiento del día "clave": es de la semana
// actual y su rutina tiene ejercicios (RF-27, RF-28).
function puedeEmpezar(datos, clave, hoy) {
  if (!diasDeSemana(hoy, 0).includes(clave)) return false;
  const dia = datos.plan[clave];
  if (!dia) return false;
  const rutina = datos.rutinas.find(r => r.id === dia.rutinaId);
  return rutina.ejercicios.length > 0;
}

// Abre el entrenamiento del día "clave" con una fila vacía por cada serie de cada ejercicio.
function empezarEntreno(datos, clave) {
  const nuevos = structuredClone(datos);
  const rutinaId = nuevos.plan[clave].rutinaId;
  const rutina = nuevos.rutinas.find(r => r.id === rutinaId);
  nuevos.entrenamiento = {
    fecha: clave,
    rutinaId: rutinaId,
    series: rutina.ejercicios.map(ejercicio =>
      Array.from({ length: ejercicio.series }, () => ({ kg: '', reps: '' }))),
  };
  return nuevos;
}

// Guarda el texto escrito en una celda del entrenamiento.
// ejercicio y serie son posiciones desde 0; campo es 'kg' o 'reps'.
function escribirValor(datos, ejercicio, serie, campo, texto) {
  const nuevos = structuredClone(datos);
  nuevos.entrenamiento.series[ejercicio][serie][campo] = texto;
  return nuevos;
}

// Lista de los ejercicios del entrenamiento abierto, en el orden de la tabla (spec 002):
// primero los de la rutina y detrás los añadidos, en el orden en que se aceptaron.
// Cada uno es { titulo, foto, numeros, origen }: "numeros" son los números de serie
// que se ven en cada fila (en la rutina 1, 2, 3...; en un añadido, los originales).
// La posición i de la lista es la misma que entrenamiento.series[i].
function ejerciciosDelEntreno(datos) {
  const entreno = datos.entrenamiento;
  const rutina = datos.rutinas.find(r => r.id === entreno.rutinaId);
  const deLaRutina = rutina.ejercicios.map((ejercicio, i) => ({
    titulo: ejercicio.titulo,
    foto: ejercicio.foto,
    numeros: entreno.series[i].map((fila, j) => j + 1),
    origen: { rutinaId: rutina.id, ejercicioId: ejercicio.id },
  }));
  // Un entreno empezado antes de la spec 002 no tiene "anadidos": ninguno.
  return deLaRutina.concat(structuredClone(entreno.anadidos || []));
}

// Añade una serie vacía al final del ejercicio, con el número siguiente al de la
// última fila, hasta la serie 20. No cambia la rutina.
function sumarSerie(datos, ejercicio) {
  const nuevos = structuredClone(datos);
  const filas = nuevos.entrenamiento.series[ejercicio];
  const numeros = ejerciciosDelEntreno(nuevos)[ejercicio].numeros;
  if (numeros[numeros.length - 1] >= 20) return nuevos;
  filas.push({ kg: '', reps: '' });
  // En un ejercicio añadido el número de la fila nueva se guarda aparte
  const anadido = anadidoEn(nuevos, ejercicio);
  if (anadido) anadido.numeros.push(numeros[numeros.length - 1] + 1);
  return nuevos;
}

// Quita la última serie del ejercicio (siempre queda al menos 1). No cambia la rutina.
function quitarSerie(datos, ejercicio) {
  const nuevos = structuredClone(datos);
  const filas = nuevos.entrenamiento.series[ejercicio];
  if (filas.length <= 1) return nuevos;
  filas.pop();
  const anadido = anadidoEn(nuevos, ejercicio);
  if (anadido) anadido.numeros.pop();
  return nuevos;
}

// Devuelve el ejercicio añadido que ocupa la posición "ejercicio" del entreno,
// o undefined si esa posición es de un ejercicio de la rutina.
function anadidoEn(datos, ejercicio) {
  const rutina = datos.rutinas.find(r => r.id === datos.entrenamiento.rutinaId);
  return (datos.entrenamiento.anadidos || [])[ejercicio - rutina.ejercicios.length];
}

// Termina el entrenamiento abierto: guarda como Previo el peso de cada serie que
// tenga peso (también 0 y las series añadidas); las vacías conservan su Previo y
// las repeticiones no se guardan. Marca el día "✓ Hecho" y cierra el entrenamiento.
// Antes hay que comprobar erroresEntreno. Sirve aunque el día sea de una semana pasada (RF-41).
function terminarEntreno(datos) {
  const nuevos = structuredClone(datos);
  const entreno = nuevos.entrenamiento;
  // También los ejercicios añadidos: su Previo va por título y número de serie (RF-13)
  ejerciciosDelEntreno(nuevos).forEach((ejercicio, i) => {
    const titulo = normalizar(ejercicio.titulo);
    entreno.series[i].forEach((fila, j) => {
      const peso = leerPeso(fila.kg);
      if (peso === null) return; // sin peso: se queda el Previo anterior
      if (!nuevos.pesos[titulo]) nuevos.pesos[titulo] = {};
      nuevos.pesos[titulo][ejercicio.numeros[j]] = peso; // el número que se ve en pantalla
    });
  });
  nuevos.plan[entreno.fecha].hecho = true;
  nuevos.entrenamiento = null;
  return nuevos;
}

// ¿Sigue existiendo el ejercicio de la rutina del que salió un pendiente? (RF-15)
// origen = { rutinaId, ejercicioId }. Se busca por id: renombrarlo no cambia nada.
function existeOrigen(datos, origen) {
  const rutina = datos.rutinas.find(r => r.id === origen.rutinaId);
  return rutina !== undefined && rutina.ejercicios.some(e => e.id === origen.ejercicioId);
}

// Al terminar: cada ejercicio del entreno (de la rutina o añadido) con alguna serie
// sin peso se añade AL FINAL de los pendientes, solo con esas series y sus números
// (RF-1). Peso 0 o peso sin REPS = hecha (RF-2); las series quitadas ya no están en
// la tabla (RF-3). Un añadido conserva su título, foto y origen (RF-14), salvo que su
// origen se haya borrado: entonces no vuelve (RF-15). No cierra el entreno: después
// hay que llamar a terminarEntreno. Antes hay que comprobar erroresEntreno.
function guardarPendientes(datos) {
  const nuevos = structuredClone(datos);
  ejerciciosDelEntreno(nuevos).forEach((ejercicio, i) => {
    const sinHacer = ejercicio.numeros.filter((numero, j) =>
      leerPeso(nuevos.entrenamiento.series[i][j].kg) === null);
    if (sinHacer.length === 0 || !existeOrigen(nuevos, ejercicio.origen)) return;
    nuevos.pendientes.push({
      titulo: ejercicio.titulo, foto: ejercicio.foto, numeros: sinHacer, origen: ejercicio.origen,
    });
  });
  return nuevos;
}

// ---------- La cola de preguntas (spec 002) ----------
// Siempre se pregunta por el primero de la cola, datos.pendientes[0] (orden de llegada).
// Los que no se responden se quedan en su sitio (RF-11).

// Al empezar un entreno nuevo: olvida, sin preguntar, los pendientes cuyo título
// coincide con un ejercicio de la rutina de ese entreno (RF-8). Los demás siguen en orden.
function olvidarCoincidentes(datos) {
  const nuevos = structuredClone(datos);
  const rutina = nuevos.rutinas.find(r => r.id === nuevos.entrenamiento.rutinaId);
  nuevos.pendientes = nuevos.pendientes.filter(pendiente =>
    !rutina.ejercicios.some(ejercicio => coinciden(ejercicio.titulo, pendiente.titulo)));
  return nuevos;
}

// Texto de la pregunta por un pendiente (RF-5). Es texto plano: hay que escaparlo al pintar.
function textoPregunta(pendiente) {
  const n = pendiente.numeros.length;
  const series = n === 1 ? '1 serie' : n + ' series';
  return 'Te quedó sin hacer ' + pendiente.titulo + ' (' + series + '). ¿Añadirlo a este entrenamiento?';
}

// "Añadir" (RF-9): saca pendientes[0] de la cola y lo pone al final del entreno abierto,
// tal cual (título, foto, números y origen copiados), con una fila vacía por cada número.
// La rutina no cambia.
function aceptarPendiente(datos) {
  const nuevos = structuredClone(datos);
  const pendiente = nuevos.pendientes.shift();
  if (pendiente === undefined) return nuevos; // cola vacía: nada que añadir
  const entreno = nuevos.entrenamiento;
  if (!entreno.anadidos) entreno.anadidos = []; // entreno empezado sin añadidos
  entreno.anadidos.push(pendiente);
  entreno.series.push(pendiente.numeros.map(() => ({ kg: '', reps: '' })));
  return nuevos;
}

// "No" (RF-10): saca pendientes[0] de la cola y lo olvida.
function rechazarPendiente(datos) {
  const nuevos = structuredClone(datos);
  nuevos.pendientes.shift();
  return nuevos;
}

// Tras borrar una rutina o un ejercicio: olvida los pendientes cuyo origen ya no existe (RF-15).
function olvidarSinOrigen(datos) {
  const nuevos = structuredClone(datos);
  nuevos.pendientes = nuevos.pendientes.filter(pendiente => existeOrigen(nuevos, pendiente.origen));
  return nuevos;
}

// ---------- Migración (spec 002) ----------

// Pasa datos guardados con el formato de la spec 001 al formato de la 002 (RF-16).
// Los datos del usuario son sagrados: SOLO añade lo que falta, nunca quita ni cambia nada.
//   - Cada ejercicio sin id recibe "idDeLaRutina-posición" (p. ej. "lq3k9x-a1b2-0"):
//     sale igual cada vez que se carga y no choca con nuevoId(), que tiene un solo guion.
//   - Si no hay lista de pendientes, pone una vacía.
// Se puede aplicar varias veces sin cambiar el resultado. Devuelve una copia.
function migrar(datos) {
  const nuevos = structuredClone(datos);
  nuevos.rutinas.forEach(rutina => {
    rutina.ejercicios.forEach((ejercicio, i) => {
      if (ejercicio.id === undefined) ejercicio.id = rutina.id + '-' + i;
    });
  });
  if (nuevos.pendientes === undefined) nuevos.pendientes = [];
  return nuevos;
}

// ============================================================
// 2) INTERFAZ
// ============================================================

// Nombre de la única clave de localStorage donde se guarda todo.
const CLAVE_GUARDADO = 'getstrong';

// Todos los datos de la app (se cargan al arrancar en iniciar()).
let datos = null;

// Qué se está viendo ahora mismo. No se guarda: al abrir la app siempre sale la semana actual.
//   vista: 'semana', 'dia', 'rutinas', 'editar' (editar una rutina) o 'ejercicio' (formulario de ejercicio)
//   semana: 0 = "Esta semana", 1 = "Siguiente"
//   clave: día abierto en la vista del día ("AAAA-MM-DD")
//   idRutina: rutina abierta en las vistas 'editar' y 'ejercicio'
//   indice: ejercicio abierto en la vista 'ejercicio' (desde 0), o null si es uno nuevo
//   foto: miniatura elegida en el formulario de ejercicio ('' si todavía no hay)
//   aviso: texto en rojo que se ve en el siguiente pintar() y luego se borra
//   preguntar: true desde "Empezar entrenamiento" hasta "Terminar entrenamiento": mientras
//     tanto se pregunta por los pendientes (RF-5). Al recargar vuelve a false (RF-7, RF-11).
const pantalla = { vista: 'semana', semana: 0, clave: null, idRutina: null, indice: null, foto: '', aviso: '', preguntar: false };

// ---------- Guardado ----------

// Lee los datos guardados, o devuelve datos vacíos si es la primera vez, y los pasa
// al formato actual con migrar(). No escribe nada: lo migrado se guarda con el primer
// cambio del usuario, así abrir la app nunca falla por falta de espacio.
function cargar() {
  const texto = localStorage.getItem(CLAVE_GUARDADO);
  return migrar(texto === null ? datosVacios() : JSON.parse(texto));
}

// Guarda todos los datos en una sola clave: se guarda todo o nada.
// Si no cabe, deja el aviso para la página y devuelve false (no se cambia nada).
function guardar(nuevos) {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(nuevos));
    return true;
  } catch (error) {
    pantalla.aviso = 'No queda espacio para guardar';
    return false;
  }
}

// Crea un id nuevo para una rutina o un ejercicio, p. ej. "lq3k9x-a1b2" (fecha en base 36 + 4 letras al azar).
// No usamos crypto.randomUUID() porque con file:// no siempre está disponible.
function nuevoId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

// Patrón de todos los cambios: guardar la copia nueva y, solo si se ha podido,
// usarla como datos actuales. Después se repinta.
function cambiar(nuevos) {
  if (guardar(nuevos)) datos = nuevos;
  pintar();
}

// ---------- Pintar ----------

// Devuelve el <p class="aviso"> con el aviso pendiente (o '' si no hay) y lo borra,
// así desaparece en el siguiente repintado.
function htmlAviso() {
  if (!pantalla.aviso) return '';
  const html = '<p class="aviso">' + escapar(pantalla.aviso) + '</p>';
  pantalla.aviso = '';
  return html;
}

// Dibuja la vista que toque en <main id="vista"> y marca la pestaña activa.
function pintar() {
  const hoy = new Date();
  document.getElementById('pestana-actual').classList.toggle('activa', pantalla.vista === 'semana' && pantalla.semana === 0);
  document.getElementById('pestana-siguiente').classList.toggle('activa', pantalla.vista === 'semana' && pantalla.semana === 1);
  // Editar una rutina o un ejercicio forma parte de la sección "Rutinas"
  document.getElementById('boton-rutinas').classList.toggle('activa', ['rutinas', 'editar', 'ejercicio'].includes(pantalla.vista));

  // RF-37: mientras hay un entrenamiento abierto, su aviso sale siempre arriba, en cualquier vista
  const abierto = datos.entrenamiento;
  document.getElementById('aviso-entreno').innerHTML = abierto
    ? '<p class="aviso-entreno">Entrenamiento del ' + escapar(textoDia(abierto.fecha)) + ' sin terminar. ' +
      '<button type="button" id="continuar">Continuar</button></p>'
    : '';

  let html = '';
  if (pantalla.vista === 'semana') html = htmlSemana(hoy);
  else if (pantalla.vista === 'rutinas') html = htmlRutinas();
  else if (pantalla.vista === 'editar') html = htmlEditarRutina();
  else if (pantalla.vista === 'ejercicio') html = htmlEjercicio();
  else if (pantalla.vista === 'dia') html = htmlDia(hoy);
  document.getElementById('vista').innerHTML = html;
}

// Vista Semana: una fila por día con su desplegable de rutina (RF-1, RF-2, RF-20 a RF-23, RF-35).
function htmlSemana(hoy) {
  let html = htmlAviso();
  html += '<ul class="dias">';
  for (const clave of diasDeSemana(hoy, pantalla.semana)) {
    const dia = datos.plan[clave]; // undefined si el día está vacío
    const hecho = dia && dia.hecho ? '<span class="hecho">✓ Hecho</span>' : '';

    // Desplegable: "Sin rutina" + todas las rutinas, con la del día seleccionada
    let opciones = '<option value="">Sin rutina</option>';
    for (const rutina of datos.rutinas) {
      const elegida = dia && dia.rutinaId === rutina.id ? ' selected' : '';
      opciones += '<option value="' + escapar(rutina.id) + '"' + elegida + '>' + escapar(rutina.nombre) + '</option>';
    }

    html += '<li class="dia">' +
      '<div class="dia-cabecera"><span class="dia-nombre">' + textoDia(clave) + '</span>' + hecho + '</div>' +
      '<div class="dia-controles">' +
      '<select data-dia="' + clave + '" aria-label="Rutina del ' + textoDia(clave) + '">' + opciones + '</select>' +
      (dia ? '<button type="button" data-ver="' + clave + '">Ver</button>' : '') +
      '</div>' +
      (dia ? '' : '<p class="vacio">No hay rutina para este día.</p>') +
      '</li>';
  }
  return html + '</ul>';
}

// Vista Día: el día y su rutina, "Empezar entrenamiento", "Editar rutina" y una tarjeta
// por ejercicio con su miniatura, su título y la tabla Serie / Previo (RF-19, RF-25 a RF-28).
// Si este día tiene el entrenamiento abierto, la tabla pasa a ser Serie / Previo / KG / REPS
// con campos para escribir, "+ Serie", "Quitar" y "Terminar entrenamiento" (RF-29 a RF-34).
function htmlDia(hoy) {
  const clave = pantalla.clave;
  const dia = datos.plan[clave];
  const rutina = datos.rutinas.find(r => r.id === dia.rutinaId);
  const hecho = dia.hecho ? '<span class="hecho">✓ Hecho</span>' : '';
  // El entrenamiento abierto, solo si es de este día (si no, null)
  const entreno = datos.entrenamiento && datos.entrenamiento.fecha === clave ? datos.entrenamiento : null;

  // El aviso va justo encima de los botones: así los errores de RF-32 salen junto a "Terminar entrenamiento"
  let html = '<div class="dia-cabecera"><h2>' + textoDia(clave) + '</h2>' + hecho + '</div>' +
    '<p class="rutina-nombre">' + escapar(rutina.nombre) + '</p>' +
    htmlAviso() +
    '<div class="fila botones-dia">';
  if (entreno) {
    // No hay botón de cancelar: el entrenamiento solo se cierra terminándolo (RF-36)
    html += '<button type="button" class="principal" data-terminar="si">Terminar entrenamiento</button>';
  } else if (diasDeSemana(hoy, 0).includes(clave)) {
    // RF-27: solo en la semana actual. RF-28: desactivado si la rutina no tiene ejercicios.
    const desactivado = puedeEmpezar(datos, clave, hoy) ? '' : ' disabled';
    html += '<button type="button" class="principal" data-empezar="' + clave + '"' + desactivado + '>Empezar entrenamiento</button>';
  }
  html += '<button type="button" data-editar="' + escapar(rutina.id) + '">Editar rutina</button></div>';

  // Bloque de preguntas (RF-5): debajo de los botones y encima de la primera tarjeta.
  // Siempre pregunta por el primero de la cola. Escribir en la tabla no lo esconde
  // porque el evento 'input' no repinta.
  if (entreno && pantalla.preguntar && datos.pendientes.length > 0) {
    html += '<div class="pregunta"><p>' + escapar(textoPregunta(datos.pendientes[0])) + '</p>' +
      '<div class="fila">' +
      '<button type="button" data-aceptar="si">Añadir</button>' +
      '<button type="button" data-rechazar="si">No</button>' +
      '</div></div>';
  }

  if (rutina.ejercicios.length === 0) {
    // RF-19: mensaje en vez de tarjetas vacías
    return html + '<p class="vacio">Esta rutina no tiene ejercicios. Añade el primero.</p>';
  }
  // Con el entrenamiento abierto, las tarjetas salen de ejerciciosDelEntreno: los de la
  // rutina y detrás los añadidos, con su foto y título copiados y sin etiqueta (RF-9).
  // La posición i es la misma que en entreno.series.
  const ejercicios = entreno ? ejerciciosDelEntreno(datos) : rutina.ejercicios;
  ejercicios.forEach((ejercicio, i) => {
    html += '<section class="tarjeta">' +
      '<div class="ejercicio">' +
      '<img class="miniatura" src="' + escapar(ejercicio.foto) + '" alt="">' +
      '<span class="ejercicio-texto ejercicio-titulo">' + escapar(ejercicio.titulo) + '</span>' +
      '</div>' +
      (entreno ? htmlTablaEntreno(ejercicio, i, entreno.series[i]) : htmlTablaPrevio(ejercicio)) +
      '</section>';
  });
  return html;
}

// Tabla Serie / Previo sin entrenamiento: una fila por serie de la rutina, numeradas
// desde 1, con el último peso guardado (RF-25, RF-26).
function htmlTablaPrevio(ejercicio) {
  let filas = '';
  for (let n = 1; n <= ejercicio.series; n++) {
    filas += '<tr><td>' + n + '</td><td>' + escapar(previo(datos.pesos, ejercicio.titulo, n)) + '</td></tr>';
  }
  return '<table class="tabla-series"><thead><tr><th>Serie</th><th>Previo</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table>';
}

// Tabla del entrenamiento abierto para el ejercicio de la posición "i" (uno de
// ejerciciosDelEntreno): una fila por cada serie de "filas" (pueden ser más o menos que en
// la rutina, RF-30) con lo escrito en KG y REPS. Cada campo lleva data-ejercicio,
// data-serie (desde 0) y data-campo para saber dónde guardar.
function htmlTablaEntreno(ejercicio, i, filas) {
  const numeros = ejercicio.numeros;
  let cuerpo = '';
  filas.forEach((fila, serie) => {
    // El número que se ve: 1, 2, 3... en la rutina; el original en un añadido (RF-9)
    const n = numeros[serie];
    const posicion = ' data-ejercicio="' + i + '" data-serie="' + serie + '"';
    // "Quitar" solo en la última fila y nunca si queda una sola serie (RF-30)
    const quitar = serie === filas.length - 1 && filas.length > 1
      ? '<button type="button" class="quitar" data-quitar="' + i + '">Quitar</button>' : '';
    // Campos de texto (no number) para admitir la coma y que "abc" llegue a la validación (RF-31, RF-32).
    // inputmode abre en el iPhone el teclado con decimales (KG) o solo cifras (REPS).
    cuerpo += '<tr><td>' + n + '</td>' +
      '<td>' + escapar(previo(datos.pesos, ejercicio.titulo, n)) + '</td>' +
      '<td><input class="celda" type="text" inputmode="decimal" autocomplete="off"' + posicion +
      ' data-campo="kg" aria-label="KG de la serie ' + n + '" value="' + escapar(fila.kg) + '"></td>' +
      '<td><input class="celda" type="text" inputmode="numeric" autocomplete="off"' + posicion +
      ' data-campo="reps" aria-label="REPS de la serie ' + n + '" value="' + escapar(fila.reps) + '"></td>' +
      '<td>' + quitar + '</td></tr>';
  });
  // Si la última fila es la serie 20 no se pueden añadir más (RF-30, RF-12)
  const lleno = numeros[numeros.length - 1] >= 20 ? ' disabled' : '';
  return '<table class="tabla-series tabla-entreno"><thead><tr>' +
    '<th>Serie</th><th>Previo</th><th>KG</th><th>REPS</th><th></th></tr></thead>' +
    '<tbody>' + cuerpo + '</tbody></table>' +
    '<button type="button" class="sumar" data-sumar="' + i + '"' + lleno + '>+ Serie</button>';
}

// Vista Rutinas: formulario "Nueva rutina" y lista con "Editar" y "Borrar" (RF-3 a RF-6, RF-14, RF-17, RF-18).
// El aviso va arriba, justo encima del formulario y de la lista.
function htmlRutinas() {
  let html = htmlAviso();
  // maxlength="50": el navegador no deja escribir el carácter 51, sin mensaje (RF-14)
  html += '<form class="formulario" data-form="nueva">' +
    '<label for="nombre-rutina">Nueva rutina</label>' +
    '<div class="fila">' +
    '<input id="nombre-rutina" type="text" maxlength="50" autocomplete="off">' +
    '<button type="submit" class="principal">Crear</button>' +
    '</div></form>';

  html += '<ul class="rutinas">';
  for (const rutina of datos.rutinas) {
    html += '<li class="rutina">' +
      '<span class="rutina-nombre">' + escapar(rutina.nombre) + '</span>' +
      '<div class="rutina-botones">' +
      '<button type="button" data-editar="' + escapar(rutina.id) + '">Editar</button>' +
      '<button type="button" data-borrar="' + escapar(rutina.id) + '">Borrar</button>' +
      '</div></li>';
  }
  return html + '</ul>';
}

// Vista Editar rutina: el nombre y la lista de ejercicios con miniatura, título y series,
// cada uno con "Editar" y "Borrar", y el botón "Añadir ejercicio" (RF-7, RF-14, RF-15, RF-17, RF-19).
function htmlEditarRutina() {
  const rutina = datos.rutinas.find(r => r.id === pantalla.idRutina);
  let html = htmlAviso() +
    '<form class="formulario" data-form="renombrar">' +
    '<label for="nombre-rutina">Nombre de la rutina</label>' +
    '<div class="fila">' +
    '<input id="nombre-rutina" type="text" maxlength="50" autocomplete="off" value="' + escapar(rutina.nombre) + '">' +
    '<button type="submit">Guardar</button>' +
    '</div></form>';

  html += '<h2>Ejercicios</h2>';
  if (rutina.ejercicios.length === 0) {
    // RF-19: mensaje en vez de una lista vacía
    html += '<p class="vacio">Esta rutina no tiene ejercicios. Añade el primero.</p>';
  } else {
    html += '<ul class="ejercicios">';
    // En el orden en que se añadieron (RF-7). "i" es la posición del ejercicio en la rutina.
    rutina.ejercicios.forEach((ejercicio, i) => {
      html += '<li class="ejercicio">' +
        '<img class="miniatura" src="' + escapar(ejercicio.foto) + '" alt="">' +
        '<div class="ejercicio-texto">' +
        '<span class="ejercicio-titulo">' + escapar(ejercicio.titulo) + '</span>' +
        '<span class="ejercicio-series">' + ejercicio.series + (ejercicio.series === 1 ? ' serie' : ' series') + '</span>' +
        '</div>' +
        '<div class="rutina-botones">' +
        '<button type="button" data-editar-ejercicio="' + i + '">Editar</button>' +
        '<button type="button" data-borrar-ejercicio="' + i + '">Borrar</button>' +
        '</div></li>';
    });
    html += '</ul>';
  }
  return html + '<button type="button" class="boton-ancho principal" data-anadir-ejercicio="si">Añadir ejercicio</button>';
}

// Vista Ejercicio: formulario para añadir uno nuevo o editar uno que ya existe
// (título, foto y series). El aviso con el primer error va junto a "Guardar" (RF-7 a RF-14, RF-16).
function htmlEjercicio() {
  const rutina = datos.rutinas.find(r => r.id === pantalla.idRutina);
  // Al editar, el formulario empieza con los valores del ejercicio; si es nuevo, vacío
  const ejercicio = pantalla.indice === null ? { titulo: '', series: '' } : rutina.ejercicios[pantalla.indice];
  const vistaPrevia = pantalla.foto ? '<img class="vista-previa" src="' + escapar(pantalla.foto) + '" alt="">' : '';

  return '<form class="formulario" data-form="ejercicio">' +
    '<h2>' + (pantalla.indice === null ? 'Nuevo ejercicio' : 'Editar ejercicio') + '</h2>' +
    // maxlength="50": no deja escribir el carácter 51, sin mensaje (RF-14)
    '<label for="titulo-ejercicio">Título</label>' +
    '<input id="titulo-ejercicio" class="campo" type="text" maxlength="50" autocomplete="off" value="' + escapar(ejercicio.titulo) + '">' +
    // accept="image/*" sin "capture": el iPhone ofrece galería y cámara (RF-8)
    '<label for="foto-ejercicio">Foto</label>' +
    '<input id="foto-ejercicio" class="campo" type="file" accept="image/*">' +
    vistaPrevia +
    // Texto con teclado numérico: así "abc" llega a la validación y se avisa (RF-13)
    '<label for="series-ejercicio">Series</label>' +
    '<input id="series-ejercicio" class="campo" type="text" inputmode="numeric" autocomplete="off" value="' + escapar(String(ejercicio.series)) + '">' +
    htmlAviso() +
    '<div class="fila">' +
    '<button type="submit" class="principal">Guardar</button>' +
    '<button type="button" data-volver="si">Cancelar</button>' +
    '</div></form>';
}

// ---------- Eventos ----------

// Cambiar la rutina de un día en el desplegable de la semana.
function alCambiarDia(clave, id) {
  // RF-40: con el entrenamiento de ese día abierto no se puede cambiar su rutina.
  if (diaBloqueado(datos, clave)) {
    pantalla.aviso = 'Termina el entrenamiento antes de cambiar este día';
    pintar(); // repintar devuelve el desplegable a la rutina que tenía
    return;
  }
  cambiar(id === '' ? quitarRutina(datos, clave) : asignarRutina(datos, clave, id));
}

// Guardar el nombre del formulario: crea una rutina (id null) o renombra la rutina "id".
function alGuardarNombre(id, nombre) {
  // RF-39: no se renombra la rutina del entrenamiento abierto
  if (id !== null && rutinaBloqueada(datos, id)) {
    pantalla.aviso = 'Termina el entrenamiento antes de editar esta rutina';
    pintar();
    return;
  }
  const error = validarRutina(datos, id, nombre); // RF-5, RF-6
  if (error) {
    pantalla.aviso = error;
    pintar();
    // Repintar vacía el campo: le devolvemos lo escrito para que se pueda corregir
    document.getElementById('nombre-rutina').value = nombre;
    return;
  }
  // Tras crear o renombrar se vuelve a la lista de rutinas
  pantalla.vista = 'rutinas';
  cambiar(guardarRutina(datos, id === null ? nuevoId() : id, nombre));
}

// Botón "Editar" de la lista: abre la rutina, salvo que tenga el entrenamiento abierto (RF-39).
function alEditarRutina(id) {
  if (rutinaBloqueada(datos, id)) {
    pantalla.aviso = 'Termina el entrenamiento antes de editar esta rutina';
  } else {
    pantalla.vista = 'editar';
    pantalla.idRutina = id;
  }
  pintar();
}

// Botón "Borrar" de la lista: pide confirmación y borra la rutina de la lista y del plan (RF-17, RF-18, RF-39).
function alBorrarRutina(id) {
  if (rutinaBloqueada(datos, id)) {
    pantalla.aviso = 'Termina el entrenamiento antes de editar esta rutina';
    pintar();
    return;
  }
  const rutina = datos.rutinas.find(r => r.id === id);
  // confirm() muestra texto normal (no HTML), así que el nombre no se escapa aquí
  const dias = diasAsignados(datos, id, new Date());
  const pregunta = dias.length > 0
    ? 'Esta rutina está asignada ' + textoDiasAsignados(dias) + '. ¿Borrarla?'
    : '¿Borrar la rutina ' + rutina.nombre + '?';
  // En el mismo cambio se olvidan los pendientes que salieron de ella (RF-15)
  if (confirm(pregunta)) cambiar(olvidarSinOrigen(borrarRutina(datos, id)));
}

// RF-39: si la rutina abierta tiene el entrenamiento abierto, avisa en la página,
// repinta y devuelve true (y entonces no se cambia nada).
function avisarSiBloqueada() {
  if (!rutinaBloqueada(datos, pantalla.idRutina)) return false;
  pantalla.aviso = 'Termina el entrenamiento antes de editar esta rutina';
  pintar();
  return true;
}

// Repinta el formulario de ejercicio sin perder lo escrito en el título y las series
// (pintar() rehace el formulario entero y dejaría los campos como al abrirlo).
function repintarEjercicio() {
  const titulo = document.getElementById('titulo-ejercicio').value;
  const series = document.getElementById('series-ejercicio').value;
  pintar();
  document.getElementById('titulo-ejercicio').value = titulo;
  document.getElementById('series-ejercicio').value = series;
}

// "Añadir ejercicio" (indice null) o "Editar" de un ejercicio: abre su formulario.
function alAbrirEjercicio(indice) {
  if (avisarSiBloqueada()) return;
  const rutina = datos.rutinas.find(r => r.id === pantalla.idRutina);
  pantalla.vista = 'ejercicio';
  pantalla.indice = indice;
  pantalla.foto = indice === null ? '' : rutina.ejercicios[indice].foto;
  pintar();
}

// Se ha elegido un archivo en "Foto": lo reduce a una miniatura de 400 px como mucho
// en su lado mayor y la guarda como JPEG de calidad 0,7 (RF-9). Así 20 fotos de móvil
// ocupan alrededor de 1 MB y caben en el almacenamiento del navegador (unos 5 MB).
function alElegirFoto(archivo) {
  if (!archivo) return; // se ha cerrado el selector sin elegir nada
  const direccion = URL.createObjectURL(archivo);
  const imagen = new Image();
  imagen.onload = () => {
    const escala = Math.min(1, 400 / Math.max(imagen.width, imagen.height)); // nunca se agranda
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    const pincel = lienzo.getContext('2d');
    pincel.fillStyle = '#fff'; // fondo blanco: el JPEG no tiene transparencia
    pincel.fillRect(0, 0, lienzo.width, lienzo.height);
    pincel.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    URL.revokeObjectURL(direccion); // liberar la memoria del archivo original
    // Si el usuario ya ha salido del formulario, no hay nada que repintar
    if (pantalla.vista !== 'ejercicio') return;
    pantalla.foto = lienzo.toDataURL('image/jpeg', 0.7);
    repintarEjercicio();
  };
  // El archivo no es una imagen o no se puede leer: se conserva la foto que hubiera
  // (al editar no se pierde la anterior) y solo se avisa
  imagen.onerror = () => {
    URL.revokeObjectURL(direccion);
    if (pantalla.vista !== 'ejercicio') return; // ya ha salido del formulario
    pantalla.aviso = 'No se ha podido cargar la imagen';
    repintarEjercicio();
  };
  imagen.src = direccion;
}

// "Guardar" del formulario de ejercicio: valida, guarda y vuelve a la rutina (RF-7, RF-10 a RF-13, RF-15, RF-16).
function alGuardarEjercicio() {
  if (avisarSiBloqueada()) return;
  const titulo = document.getElementById('titulo-ejercicio').value;
  const textoSeries = document.getElementById('series-ejercicio').value;
  const rutina = datos.rutinas.find(r => r.id === pantalla.idRutina);
  // Solo el primer error: título, imagen, título repetido, series
  const error = validarEjercicio(rutina, pantalla.indice, titulo, pantalla.foto, textoSeries);
  if (error) {
    pantalla.aviso = error;
    repintarEjercicio();
    return;
  }
  // El título se guarda sin espacios de los extremos. Al cambiarlo, el Previo pasa a ser
  // el del título nuevo: los pesos van por título y no se mueven (RF-16).
  // Un ejercicio nuevo recibe un id nuevo; uno editado conserva el suyo (los pendientes lo usan).
  const id = pantalla.indice === null ? nuevoId() : rutina.ejercicios[pantalla.indice].id;
  const ejercicio = { id, titulo: titulo.trim(), foto: pantalla.foto, series: leerSeries(textoSeries) };
  pantalla.vista = 'editar';
  cambiar(guardarEjercicio(datos, pantalla.idRutina, pantalla.indice, ejercicio));
}

// "Borrar" de un ejercicio: pide confirmación y lo quita de la rutina (RF-15, RF-17; 002: RF-15).
function alBorrarEjercicio(indice) {
  if (avisarSiBloqueada()) return;
  const ejercicio = datos.rutinas.find(r => r.id === pantalla.idRutina).ejercicios[indice];
  // confirm() muestra texto normal (no HTML), así que el título no se escapa aquí
  if (confirm('¿Borrar el ejercicio ' + ejercicio.titulo + '?')) {
    // En el mismo cambio se olvidan sus pendientes (RF-15)
    cambiar(olvidarSinOrigen(borrarEjercicio(datos, pantalla.idRutina, indice)));
  }
}

// "Empezar entrenamiento" del día "clave" (RF-27, RF-28, RF-38).
function alEmpezar(clave) {
  const abierto = datos.entrenamiento;
  // RF-38: con el entrenamiento de otro día abierto no se empieza otro: se avisa y se va a él
  if (abierto && abierto.fecha !== clave) {
    pantalla.aviso = 'Tienes el entrenamiento del ' + textoDia(abierto.fecha) + ' sin terminar';
    pantalla.clave = abierto.fecha;
    pintar();
    return;
  }
  // El botón ya sale desactivado o no sale, pero lo comprobamos por si acaso
  if (abierto || !puedeEmpezar(datos, clave, new Date())) return;
  // Entreno nuevo: se empieza a preguntar por los pendientes (RF-5), olvidando antes, sin
  // preguntar, los que coinciden con un ejercicio de su rutina (RF-8). Si no queda
  // ninguno, no sale el bloque (RF-6). "Continuar" y RF-38 no pasan por aquí (RF-7).
  // La marca se pone antes de cambiar() porque cambiar() ya repinta y el bloque debe salir.
  pantalla.preguntar = true;
  const nuevos = olvidarCoincidentes(empezarEntreno(datos, clave));
  cambiar(nuevos);
  // cambiar() solo sustituye "datos" si ha podido guardar. Si no (sin espacio), no hay
  // entreno abierto y la marca se quita para que no quede activada.
  if (datos !== nuevos) pantalla.preguntar = false;
}

// Se escribe en un campo KG o REPS: se guarda al momento, así lo escrito sobrevive a
// cerrar o recargar la app (RF-29, RF-36). No se repinta para no perder el foco del campo;
// solo si no se ha podido guardar se repinta para enseñar el aviso.
function alEscribir(campo) {
  const nuevos = escribirValor(datos, Number(campo.dataset.ejercicio), Number(campo.dataset.serie),
    campo.dataset.campo, campo.value);
  if (guardar(nuevos)) datos = nuevos;
  else pintar();
}

// "Terminar entrenamiento" (RF-32 a RF-35, RF-41).
function alTerminar() {
  const errores = erroresEntreno(datos.entrenamiento);
  if (errores.length > 0) {
    // RF-32: no termina. Se marcan en rojo TODOS los campos erróneos, pero solo
    // se enseña el mensaje del primero.
    pantalla.aviso = errores[0].mensaje;
    pintar();
    for (const error of errores) {
      document.querySelector('[data-ejercicio="' + error.ejercicio + '"][data-serie="' + error.serie +
        '"][data-campo="' + error.campo + '"]').classList.add('erroneo');
    }
    return;
  }
  // Al terminar ya no hay preguntas que enseñar (RF-6).
  pantalla.preguntar = false;
  // Guarda las series sin hacer como pendientes (RF-1 a RF-3), los pesos como Previo,
  // marca "✓ Hecho" y cierra el entrenamiento. Todo va en un solo cambiar() (un solo
  // setItem): si no queda espacio no se guarda nada a medias y el entreno sigue abierto.
  // Se queda en la vista del día, que ya enseña el Previo nuevo.
  cambiar(terminarEntreno(guardarPendientes(datos)));
}

// Arranca la app en el navegador.
function iniciar() {
  datos = cargar();
  // Safari en el iPhone solo aplica :active (botón hundido u oscurecido) si la página
  // escucha algún toque; este listener vacío basta (RF-4, RF-26).
  document.addEventListener('touchstart', () => {}, { passive: true });

  // Cabecera: pestañas y botón "Rutinas"
  document.getElementById('pestana-actual').addEventListener('click', () => {
    pantalla.vista = 'semana';
    pantalla.semana = 0;
    pintar();
  });
  document.getElementById('pestana-siguiente').addEventListener('click', () => {
    pantalla.vista = 'semana';
    pantalla.semana = 1;
    pintar();
  });
  document.getElementById('boton-rutinas').addEventListener('click', () => {
    pantalla.vista = 'rutinas';
    pintar();
  });
  // "Continuar" del aviso de arriba: lleva al entrenamiento abierto desde cualquier vista
  // o semana, aunque su día ya no se vea en "Esta semana" (RF-37, RF-41).
  // El aviso se repinta entero, así que escuchamos en su contenedor.
  document.getElementById('aviso-entreno').addEventListener('click', evento => {
    if (evento.target.id !== 'continuar') return;
    pantalla.vista = 'dia';
    pantalla.clave = datos.entrenamiento.fecha;
    pintar();
  });

  // La vista se repinta entera, así que escuchamos en <main> y miramos qué se ha tocado.
  const vista = document.getElementById('vista');
  vista.addEventListener('change', evento => {
    const clave = evento.target.dataset.dia;
    if (clave) alCambiarDia(clave, evento.target.value);
    if (evento.target.id === 'foto-ejercicio') alElegirFoto(evento.target.files[0]);
  });
  // Cada letra escrita en KG o REPS del entrenamiento (data-campo) se guarda al momento
  vista.addEventListener('input', evento => {
    if (evento.target.dataset.campo) alEscribir(evento.target);
  });
  vista.addEventListener('click', evento => {
    const boton = evento.target.dataset;
    if (boton.ver) {
      pantalla.vista = 'dia';
      pantalla.clave = boton.ver;
      pintar();
    }
    if (boton.empezar) alEmpezar(boton.empezar);
    // Entrenamiento abierto: data-sumar y data-quitar llevan la posición del ejercicio (desde 0).
    // Solo cambian el entrenamiento, nunca la rutina (RF-30).
    if (boton.sumar) cambiar(sumarSerie(datos, Number(boton.sumar)));
    if (boton.quitar) cambiar(quitarSerie(datos, Number(boton.quitar)));
    if (boton.terminar) alTerminar();
    // Bloque de preguntas: "Añadir" lleva el pendiente al final del entreno (RF-9) y "No"
    // lo olvida (RF-10). Las dos lo quitan de la cola y se ve la siguiente pregunta.
    if (boton.aceptar) cambiar(aceptarPendiente(datos));
    if (boton.rechazar) cambiar(rechazarPendiente(datos));
    if (boton.editar) alEditarRutina(boton.editar);
    if (boton.borrar) alBorrarRutina(boton.borrar);
    // Ejercicios de la rutina abierta (data-*-ejercicio lleva su posición, desde 0)
    if (boton.anadirEjercicio) alAbrirEjercicio(null);
    if (boton.editarEjercicio) alAbrirEjercicio(Number(boton.editarEjercicio));
    if (boton.borrarEjercicio) alBorrarEjercicio(Number(boton.borrarEjercicio));
    if (boton.volver) { // "Cancelar" del formulario de ejercicio: vuelve a la rutina sin guardar
      pantalla.vista = 'editar';
      pintar();
    }
  });
  // Formularios (con el botón o con Intro)
  vista.addEventListener('submit', evento => {
    evento.preventDefault(); // que el navegador no recargue la página
    const formulario = evento.target.dataset.form;
    if (formulario === 'ejercicio') return alGuardarEjercicio();
    const nombre = document.getElementById('nombre-rutina').value;
    if (formulario === 'nueva') alGuardarNombre(null, nombre);
    if (formulario === 'renombrar') alGuardarNombre(pantalla.idRutina, nombre);
  });

  pintar(); // RF-1: siempre empieza en "Esta semana"
}

// ============================================================
// ARRANQUE Y EXPORTACIÓN
// ============================================================

// En el navegador: arrancar la app. En node (tests) no hay document y no se arranca.
if (typeof document !== 'undefined') iniciar();

// En node: exportar la lógica pura para los tests. En el navegador se ignora.
if (typeof module !== 'undefined') {
  module.exports = {
    claveFecha, fechaDeClave, diasDeSemana, textoDia, textoDiasAsignados,
    normalizar, coinciden, escapar,
    validarRutina, leerSeries, validarEjercicio, leerPeso, leerReps, erroresEntreno,
    datosVacios, guardarRutina, guardarEjercicio, borrarEjercicio, diasAsignados,
    borrarRutina, asignarRutina, quitarRutina, rutinaBloqueada, diaBloqueado,
    previo, puedeEmpezar, empezarEntreno, escribirValor, sumarSerie, quitarSerie, terminarEntreno,
    migrar, ejerciciosDelEntreno, existeOrigen, guardarPendientes,
    olvidarCoincidentes, textoPregunta, aceptarPendiente, rechazarPendiente, olvidarSinOrigen,
  };
}
