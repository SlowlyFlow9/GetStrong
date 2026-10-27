# Notas — 002 Ejercicios pendientes

> Esto NO es una spec. Son las decisiones ya tomadas sobre los ejercicios pendientes
> mientras estaban en el borrador de la spec 001 (antiguos HU-6 y RF-34 a RF-39), y las
> dudas que quedaron abiertas tras la revisión de QA. Servirán de punto de partida para
> escribir la spec 002.

## Idea (antigua HU-6)
Si el usuario termina un entrenamiento sin acabar algún ejercicio, en el siguiente
entrenamiento la app le pregunta si quiere añadirlo, para recuperar lo que le quedó sin
hacer.

## Decisiones ya tomadas
- **Qué cuenta como sin acabar**: una serie sin hacer es una serie que sigue en la tabla
  sin peso al pulsar "Terminar entrenamiento". Un ejercicio pendiente es el que tenía al
  menos una serie sin hacer (tanto si no se empezó como si quedaron series a medias).
  Una serie con peso pero sin REPS no es una serie sin hacer.
- **Peso 0**: según la spec 001, un peso 0 cuenta como serie hecha.
- **Series quitadas**: las series quitadas durante el entrenamiento no cuentan como sin
  hacer (en "Curl" de 3 series, quitar la 3 y poner peso en la 1 y la 2: no queda
  pendiente).
- **Qué se guarda**: solo las series que faltan, cada una con su número original (si de 3
  series faltó la 3, queda pendiente la serie 3). El pendiente recuerda de qué ejercicio
  de qué rutina viene (su origen).
- **La pregunta**: al pulsar "Empezar entrenamiento", si hay pendientes, se pregunta
  ejercicio por ejercicio si se quiere añadir cada uno, mostrando su título y su número
  de series pendientes. Sin pendientes, el entrenamiento empieza sin preguntar.
- **Rechazados**: se olvidan y no se vuelve a preguntar por ellos (salvo que vuelvan a
  quedar pendientes).
- **Aceptados**: se añaden al final del entrenamiento, con su foto, su título y solo sus
  series pendientes, cada una con su número original y el Previo de ese número, sin
  cambiar la rutina. Dejan de ser pendientes. No se pueden reordenar.
- **Mismo título que un ejercicio de hoy**: si al empezar un pendiente coincide en título
  (sin mayúsculas ni espacios al principio y al final) con un ejercicio de la rutina de
  ese entrenamiento, no se pregunta por él y se olvida.
- **Vuelven a quedar sin acabar**: un pendiente añadido que vuelve a quedar sin acabar
  sigue pendiente con sus series sin peso que siguen en la tabla (aceptar "Prensa" con 4
  series, poner peso solo en la 1 y terminar: queda pendiente con las series 2, 3 y 4).
- **Borrar el origen**: si se borra la rutina o el ejercicio del que salió un pendiente,
  el pendiente se olvida.
- **Persistencia**: los pendientes se conservan al cerrar y volver a abrir la app.

## Dudas abiertas (de la revisión de QA)
1. "Olvidar automáticamente" (al coincidir en título con un ejercicio de hoy, o al borrar
   el origen) choca con el principio 5 de la constitución: los datos guardados no se
   borran sin una acción explícita del usuario.
2. Título del pendiente si se renombra el ejercicio de origen (en la spec 001 ahora se
   puede editar el título): ¿conserva el título viejo o toma el nuevo?
3. Origen de un pendiente que ya fue aceptado y vuelve a quedar pendiente: ¿sigue siendo
   el ejercicio de la rutina original o pasa a ser el entrenamiento donde se añadió?
4. Orden y forma de las preguntas: en qué orden se pregunta por los pendientes y cómo es
   la pregunta (textos exactos, botones).
5. Foto: ¿el pendiente copia la foto o usa la del ejercicio de origen (que ahora se puede
   cambiar)?
6. Si se pregunta por los pendientes cuando "Empezar entrenamiento" no empieza uno nuevo
   sino que redirige al entrenamiento abierto (aviso "Tienes el entrenamiento del <día>
   <d/m> sin terminar", RF-38 de la spec 001, antes RF-29).
