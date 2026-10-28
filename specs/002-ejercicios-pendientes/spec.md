# Spec 002 — Ejercicios pendientes
Estado: Implementada (2026-10-28)

## Contexto y objetivo
A veces el usuario termina un entrenamiento sin acabar algún ejercicio (no le da tiempo,
está cansado...). Hoy eso se pierde: el siguiente entrenamiento solo trae su rutina. El
usuario quiere que, en el próximo entrenamiento, la app le pregunte si quiere añadir los
ejercicios que se quedaron sin hacer, para recuperarlos.

En palabras del usuario: "cuando se seleccione terminar sin haber acabado alguno de los
ejercicios, al día siguiente en el próximo entreno te tiene que preguntar si quieres añadir
aquellos ejercicios que se quedaron sin hacer".

Se construye sobre la spec 001 (Rutinas), que sigue vigente sin cambios salvo lo que aquí
se añade. Las referencias "RF-x de la 001" apuntan a esa spec.

## Usuarios
Una sola persona (el dueño de la app), desde el navegador del móvil o del ordenador.
Sin cuentas.

## Historias de usuario
- HU-1. Como usuario, si termino un entrenamiento sin acabar algún ejercicio, quiero que
  en el próximo entrenamiento la app me pregunte si quiero añadirlo, para recuperar lo
  que me quedó sin hacer.

## Definiciones
- **Coincidencia**: la misma de la spec 001 (iguales sin distinguir mayúsculas y sin los
  espacios del principio y del final).
- **Serie sin hacer**: serie que sigue en la tabla del entrenamiento con el campo KG vacío
  cuando el entrenamiento se termina. Una serie con peso 0 está hecha. Una serie con peso
  y sin REPS está hecha. Las series quitadas durante el entrenamiento (RF-30 de la 001) no
  están en la tabla, así que no cuentan.
- **Ejercicio pendiente** (o **pendiente**): ejercicio que tenía al menos una serie sin
  hacer al terminar un entrenamiento. Guarda:
  - solo sus series sin hacer, cada una con su número original (el que tenía en la tabla);
  - una copia de su título y su foto tal como estaban en ese momento; si después se cambia
    el título, la foto o el número de series del ejercicio de origen, el pendiente no
    cambia;
  - su **origen**: el ejercicio de la rutina original del que salió. Un pendiente que se
    acepta y vuelve a quedar pendiente (RF-14) conserva ese mismo origen. El origen solo
    se usa para RF-15.
- **Entrenamiento nuevo**: el que empieza de verdad al pulsar "Empezar entrenamiento"
  (RF-29 de la 001). No lo es volver a un entrenamiento abierto con "Continuar" (RF-37 de
  la 001) ni la redirección de RF-38 de la 001.

## Requisitos funcionales

### Al terminar el entrenamiento
- RF-1: CUANDO el usuario termina un entrenamiento (RF-33 de la 001), EL SISTEMA guarda
  como pendiente cada ejercicio con al menos una serie sin hacer, con solo sus series sin
  hacer, el número original de cada una y una copia de su título y su foto.
  - Aceptación: en "Sentadilla" (3 series) escribir peso en las series 1 y 2 y terminar;
    queda pendiente "Sentadilla" con la serie 3.
  - Aceptación: no escribir nada en "Prensa" (4 series) y terminar; queda pendiente
    "Prensa" con las series 1, 2, 3 y 4.
  - Aceptación: en "Sentadilla" (3 series) añadir la serie 4 (RF-30 de la 001), escribir
    peso en las series 1, 2 y 3 y terminar; queda pendiente "Sentadilla" con la serie 4.
- RF-2: CUANDO el usuario termina un entrenamiento, EL SISTEMA no guarda como pendiente un
  ejercicio cuyas series en la tabla tienen todas peso (también 0), aunque les falten las
  REPS.
  - Aceptación: en "Curl" (3 series) escribir 0 en KG de las 3 series y terminar; "Curl"
    no queda pendiente.
  - Aceptación: en "Curl" (3 series) escribir 20 en KG de las 3 series, sin REPS, y
    terminar; "Curl" no queda pendiente.
- RF-3: CUANDO el usuario termina un entrenamiento, EL SISTEMA no cuenta como sin hacer
  las series quitadas durante ese entrenamiento.
  - Aceptación: en "Curl" (3 series) quitar la serie 3, escribir peso en las series 1 y 2
    y terminar; "Curl" no queda pendiente.
- RF-4: SI al pulsar "Terminar entrenamiento" hay datos inválidos (RF-32 de la 001),
  ENTONCES EL SISTEMA no guarda ningún pendiente (el entrenamiento no termina).
  - Aceptación: con "-5" en KG de la serie 1 y la serie 2 vacía, pulsar "Terminar
    entrenamiento"; aparece "Peso no válido" y no hay pendientes nuevos.

### La pregunta al empezar
- RF-5: CUANDO el usuario empieza un entrenamiento nuevo y hay pendientes, EL SISTEMA
  pregunta por cada pendiente, uno a uno, si quiere añadirlo a ese entrenamiento, con un
  bloque dentro de la página del entrenamiento (no una ventana del navegador) con el texto
  "Te quedó sin hacer <título> (<n> series). ¿Añadirlo a este entrenamiento?" ("1 serie"
  en singular) y los botones "Añadir" y "No". El bloque va arriba del entrenamiento, antes
  de las tablas de los ejercicios, y mientras se ve el usuario puede escribir en las
  tablas: no hace falta responder antes de entrenar. Pregunta en orden de llegada: primero
  los pendientes del entrenamiento cuyo "Terminar entrenamiento" se pulsó antes y, entre
  los de un mismo entrenamiento, en el orden en que estaban sus ejercicios en la tabla. Un
  pendiente que vuelve a quedar sin acabar (RF-14) cuenta como nuevo y va detrás de los
  que ya había; los no respondidos (RF-11) conservan su sitio.
  - Aceptación: terminar un entrenamiento dejando pendientes "Sentadilla" (1 serie) y
    después, en la tabla, "Prensa" (4 series); al pulsar "Empezar entrenamiento" de una
    rutina sin "Sentadilla" ni "Prensa" aparece, arriba y antes de la primera tabla, "Te
    quedó sin hacer Sentadilla (1 serie). ¿Añadirlo a este entrenamiento?" con "Añadir" y
    "No" y, tras responder, "Te quedó sin hacer Prensa (4 series). ¿Añadirlo a este
    entrenamiento?".
  - Aceptación: con la pregunta por "Sentadilla" a la vista, escribir 40 en KG de la
    serie 1 del primer ejercicio; el valor se queda en esa fila y la pregunta sigue a la
    vista.
  - Aceptación: terminar un entrenamiento dejando "Curl" pendiente y después otro dejando
    "Prensa" pendiente; al empezar uno nuevo de una rutina sin ellos se pregunta primero
    por "Curl" y después por "Prensa".
  - Aceptación: con "Curl" y "Prensa" pendientes en ese orden, empezar un entrenamiento
    de una rutina sin ellos, añadir "Curl", dejar sin peso una de sus series, escribir peso
    en todas las demás series y pulsar "Terminar entrenamiento" sin responder a "Prensa";
    al empezar otro entrenamiento de una rutina sin ellos se pregunta primero por "Prensa"
    y después por "Curl".
- RF-6: MIENTRAS no hay pendientes, EL SISTEMA empieza el entrenamiento nuevo sin
  preguntar nada, como en la spec 001.
  - Aceptación: terminar un entrenamiento con todas las series con peso y empezar otro;
    no aparece ninguna pregunta.
- RF-7: SI el usuario pulsa "Empezar entrenamiento" con otro entrenamiento abierto (RF-38
  de la 001) o toca "Continuar" (RF-37 de la 001), ENTONCES EL SISTEMA no empieza a
  preguntar por los pendientes, porque no empieza un entrenamiento nuevo; siguen
  pendientes. Esto no esconde un bloque de preguntas que ya estaba sin responder en ese
  entrenamiento (RF-11).
  - Aceptación: con hoy = miércoles 28/10/2026, con pendientes y con el entrenamiento del
    martes 27/10 abierto tras recargar la página, pulsar "Empezar entrenamiento" el
    miércoles muestra "Tienes el entrenamiento del martes 27/10 sin terminar" y ninguna
    pregunta; tocar "Continuar" tampoco muestra ninguna.
- RF-8: CUANDO el usuario empieza un entrenamiento nuevo, SI el título de un pendiente
  coincide con el de un ejercicio de la rutina de ese entrenamiento, ENTONCES EL SISTEMA
  no pregunta por él y lo olvida. Olvidarlo es consecuencia directa de una acción
  explícita del usuario (pulsar "Empezar entrenamiento"), por lo que cumple el principio 5
  de la constitución y RNF-3 de la 001.
  - Aceptación: con "Sentadilla" pendiente, empezar un entrenamiento de una rutina que
    tiene "sentadilla "; no se pregunta por "Sentadilla" y, al terminar ese entrenamiento
    con todas las series con peso y empezar otro de una rutina sin "Sentadilla", tampoco.
- RF-9: CUANDO el usuario pulsa "Añadir", EL SISTEMA añade el pendiente al final de ese
  entrenamiento, detrás de los ejercicios de la rutina y en el orden en que se aceptan,
  con la foto y el título copiados en el pendiente y solo sus series pendientes, cada una
  con su número original y el Previo de ese número (RF-26 de la 001). El pendiente deja de
  serlo y la rutina no cambia. Los ejercicios añadidos no se pueden reordenar.
  - Aceptación: con "Prensa" pendiente con las series 2, 3 y 4 y Previo de "Prensa" 80
    en la serie 2, aceptarla; al final del entrenamiento aparece "Prensa" con su foto y
    las filas 2, 3 y 4; la fila 2 muestra 80 en Previo y las otras "–".
  - Aceptación: tras aceptar "Prensa", abrir la rutina del día en "Editar rutina"; no
    tiene "Prensa".
  - Aceptación: con "Prensa" pendiente, cambiar en su rutina de origen el título a "Prensa
    45" y la foto; al aceptarla, aparece como "Prensa" con la foto antigua y las mismas
    series pendientes.
- RF-10: CUANDO el usuario pulsa "No", EL SISTEMA olvida el pendiente y no vuelve a
  preguntar por él, salvo que vuelva a quedar pendiente en otro entrenamiento (RF-1).
  - Aceptación: rechazar "Prensa", terminar ese entrenamiento y empezar otro; no se
    pregunta por "Prensa".
- RF-11: MIENTRAS quedan preguntas sin responder del entrenamiento abierto y la app no se
  ha cerrado ni recargado, EL SISTEMA muestra su bloque cada vez que se ve ese
  entrenamiento, aunque el usuario cambie de vista: al volver con "Continuar", al tocar su
  día o tras la redirección de RF-38 de la 001. SI la app se cierra o se recarga, o el
  usuario pulsa "Terminar entrenamiento", antes de responder a todas las preguntas,
  ENTONCES EL SISTEMA mantiene como pendientes los que no se han respondido y pregunta por
  ellos en el siguiente entrenamiento nuevo (no al tocar "Continuar", RF-7).
  - Aceptación: con "Sentadilla" y "Prensa" pendientes, empezar un entrenamiento de una
    rutina sin ellos, con la pregunta por "Sentadilla" a la vista pulsar "Rutinas" y
    después tocar "Continuar"; sigue la pregunta por "Sentadilla". Ir a "Esta semana" y
    tocar el día del entrenamiento; sigue la misma pregunta.
  - Aceptación: con "Sentadilla" y "Prensa" pendientes, empezar un entrenamiento de
    "Torso" (sin ellos), añadir "Sentadilla" y recargar la página sin responder a "Prensa";
    al tocar "Continuar" el entrenamiento tiene "Sentadilla" añadida y no se pregunta nada;
    escribir peso en todas las series de "Torso" y de "Sentadilla", terminar y pulsar
    "Empezar entrenamiento" de "Torso" otra vez; solo se pregunta por "Prensa".
  - Aceptación: con "Sentadilla" y "Prensa" pendientes, empezar un entrenamiento de una
    rutina sin ellos, escribir peso en todas sus series y pulsar "Terminar entrenamiento"
    sin responder a ninguna pregunta; al pulsar "Empezar entrenamiento" de una rutina sin
    ellos, se pregunta por "Sentadilla" y después por "Prensa".

### Durante y después del entrenamiento con ejercicios añadidos
- RF-12: MIENTRAS el usuario entrena, EL SISTEMA le permite escribir KG y REPS en las
  series de los ejercicios añadidos igual que en los de la rutina (RF-29 y RF-31 de la
  001), y añadir y quitar series con las mismas reglas que RF-30 de la 001: se añaden al
  final con el número siguiente al de la última fila, hasta la serie 20, y solo se quita
  la última, siempre que quede al menos 1. Al pulsar "Terminar entrenamiento", sus datos
  se validan igual que los de la rutina (RF-32 de la 001).
  - Aceptación: en "Prensa" añadida, escribir 85 en KG y 10 en REPS de la fila 2; los
    valores se quedan en esa fila, también tras recargar y tocar "Continuar".
  - Aceptación: en "Prensa" añadida con las filas 2, 3 y 4, añadir una serie; aparece la
    fila 5 y solo esa se puede quitar.
  - Aceptación: en "Sentadilla" añadida solo con la fila 3, no se puede quitar esa fila.
  - Aceptación: en un ejercicio añadido cuya última fila es la 19, añadir una; con la
    fila 20 el botón de añadir serie no responde.
  - Aceptación: en "Prensa" añadida, escribir "-5" en KG de la fila 2 y pulsar "Terminar
    entrenamiento"; no termina, el KG de la fila 2 de "Prensa" queda señalado y aparece
    "Peso no válido".
- RF-13: CUANDO el usuario termina un entrenamiento con ejercicios añadidos, EL SISTEMA
  guarda el peso de sus series con peso como Previo de ese número de serie de ese
  ejercicio (título que coincide), como en RF-33 de la 001.
  - Aceptación: en "Prensa" añadida, escribir 85 en KG de la fila 2 y terminar; en el
    siguiente entrenamiento con "Prensa", la serie 2 muestra 85 en Previo.
- RF-14: CUANDO el usuario termina un entrenamiento, SI un ejercicio añadido tiene series
  sin hacer, ENTONCES EL SISTEMA lo vuelve a guardar como pendiente con esas series y su
  número original, con el mismo título y foto con que se añadió y con el mismo origen
  (el ejercicio de la rutina original). Excepción: si su origen se ha borrado mientras el
  entrenamiento estaba abierto, prevalece RF-15 y no vuelve a quedar pendiente.
  - Aceptación: aceptar "Prensa" con las series 1, 2, 3 y 4, escribir peso solo en la 1 y
    terminar; queda pendiente "Prensa" con las series 2, 3 y 4.

### Origen y persistencia
- RF-15: CUANDO el usuario confirma el borrado de la rutina o del ejercicio de origen de
  un pendiente (RF-17 y RF-18 de la 001), EL SISTEMA olvida ese pendiente. Olvidarlo es consecuencia directa de esa
  acción explícita del usuario, por lo que cumple el principio 5 de la constitución y
  RNF-3 de la 001.
  - Aceptación: con "Sentadilla" de "Pierna" pendiente, borrar la rutina "Pierna" y
    empezar un entrenamiento de otra rutina; no se pregunta por "Sentadilla".
  - Aceptación: con "Sentadilla" de "Pierna" pendiente, borrar el ejercicio "Sentadilla"
    de "Pierna" y empezar un entrenamiento de otra rutina; no se pregunta por
    "Sentadilla".
  - Aceptación: con "Sentadilla" de "Pierna" pendiente, renombrar el ejercicio a
    "Sentadilla trasera" y después borrarlo; no se pregunta por "Sentadilla".
  - Si el pendiente ya está añadido a un entrenamiento abierto cuando se borra su origen,
    el ejercicio añadido sigue en ese entrenamiento y se termina con normalidad (su Previo
    se guarda como en RF-13), pero sus series sin hacer no vuelven a quedar pendientes:
    prevalece sobre RF-14.
  - Aceptación: con "Prensa" de "Pierna" aceptada en un entrenamiento abierto de otra
    rutina, borrar la rutina "Pierna"; al tocar "Continuar", "Prensa" sigue en el
    entrenamiento; escribir 85 en KG de su primera fila, dejar otra fila sin peso y
    terminar; en el siguiente entrenamiento con "Prensa" esa serie muestra 85 en Previo y,
    al pulsar "Empezar entrenamiento" de otra rutina, no se pregunta por "Prensa".
- RF-16: EL SISTEMA conserva los pendientes al cerrar y volver a abrir la app en el mismo
  navegador.
  - Aceptación: terminar un entrenamiento con "Prensa" sin hacer, recargar la página y
    empezar otro entrenamiento; se pregunta por "Prensa".

## Requisitos no funcionales
- RNF-1 a RNF-5 de la spec 001 siguen vigentes (375 px, campos sin zoom en iPhone, datos
  sin borrar sin acción del usuario, sin conexión ni cuenta, fechas en hora local).

## Casos límite
- Peso 0: la serie está hecha (RF-2).
- Peso sin REPS: la serie está hecha (RF-2).
- Serie quitada durante el entrenamiento: no cuenta (RF-3).
- Serie añadida durante el entrenamiento y sin peso: cuenta como sin hacer (RF-1).
- Ejercicio sin ninguna serie con peso: queda pendiente con todas sus series (RF-1).
- Datos inválidos al terminar: no termina y no hay pendientes nuevos (RF-4).
- Terminar con pendientes: el día se marca "✓ Hecho" igual (RF-35 de la 001).
- Pendiente con 1 serie: la pregunta dice "(1 serie)" (RF-5).
- Pendientes de varios entrenamientos: se pregunta en el orden en que se pulsó
  "Terminar entrenamiento"; un pendiente que vuelve a quedar sin acabar va al final y los
  no respondidos conservan su sitio (RF-5).
- Bloque de preguntas a la vista: va arriba, antes de las tablas, y se puede escribir en
  ellas sin responder (RF-5).
- Pulsar "Empezar entrenamiento" con otro abierto, o "Continuar": no se empieza a
  preguntar, pero un bloque ya sin responder sigue a la vista (RF-7, RF-11).
- Cambiar de vista con preguntas sin responder: siguen al volver al entrenamiento
  mientras la app no se cierre ni se recargue (RF-11).
- Volver a empezar el mismo día con la misma rutina (RF-35 de la 001): los pendientes
  cuyo título coincide con un ejercicio de la rutina se olvidan sin preguntar (RF-8); los
  que no coinciden, como un ejercicio añadido que volvió a quedar sin acabar (RF-14), sí
  se preguntan (RF-5).
- Pendiente con el mismo título que un ejercicio de la rutina de hoy: no se pregunta y se
  olvida (RF-8).
- Pendiente rechazado: no se vuelve a preguntar (RF-10).
- Cerrar o recargar la app, o terminar el entrenamiento, a mitad de las preguntas: los no
  respondidos siguen pendientes y se preguntan en el siguiente entrenamiento nuevo (RF-11).
- Ejercicio añadido: sus series se añaden al final con el número siguiente, hasta la 20,
  y solo se quita la última, dejando al menos 1 (RF-12).
- Dato inválido en un ejercicio añadido al terminar: no termina, se señala el campo y
  aparece el mensaje de RF-32 de la 001 (RF-12).
- Almacenamiento lleno al terminar: se aplica "No queda espacio para guardar" de la 001;
  el entrenamiento no termina y no se guarda nada a medias (ni Previo ni pendientes).
- Pendiente aceptado que vuelve a quedar sin acabar: sigue pendiente con las series que
  faltan y el mismo origen (RF-14).
- Renombrar, cambiar la foto o el número de series del ejercicio de origen: el pendiente
  no cambia (Definiciones, RF-9).
- Borrar la rutina o el ejercicio de origen: el pendiente se olvida (RF-15), también si
  estaba sin responder en el bloque de preguntas: ya no se pregunta por él.
- Borrar el origen con el pendiente ya añadido a un entrenamiento abierto: el ejercicio
  sigue y se termina con normalidad, pero no vuelve a quedar pendiente (RF-15 prevalece
  sobre RF-14).
- Título con caracteres especiales (`<`, `>`, `&`, comillas) en la pregunta o en el
  ejercicio añadido: se muestra tal cual, sin romper la página.

## Fuera de alcance
- Cancelar un entrenamiento (sigue sin existir, como en la spec 001).
- Ver, editar o borrar la lista de pendientes fuera de la pregunta al empezar.
- Avisar de los pendientes en la semana o en la vista del día antes de empezar.
- Reordenar los ejercicios añadidos (ni los de la rutina).
- Añadir a un entrenamiento ejercicios que no sean pendientes.
- Guardar los ejercicios aceptados en la rutina.
- Guardar las repeticiones.
- Historial de entrenamientos, notificaciones y todo lo que no esté en los RF de esta
  spec.

## Criterios de finalización
- Todos los RF cumplen su aceptación, verificada en Chrome (consola limpia, 375 px).
- La lógica pura (qué queda pendiente, qué se pregunta y en qué orden, qué se olvida)
  tiene tests y `node --test` pasa en verde, también los de la spec 001.
- Las dudas abiertas están resueltas y reflejadas en los RF.

## Dudas abiertas
Ninguna.
