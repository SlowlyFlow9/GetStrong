# Spec 001 — Rutinas
Estado: Aprobada (2026-10-27)

## Contexto y objetivo
El usuario quiere planificar su entrenamiento semana a semana. Crea rutinas con nombre
(p. ej. "Pierna"), cada una con los ejercicios que quiera (foto y título) y sus series.
Cada semana reparte esas rutinas entre los días, y puede cambiarlas de día respecto a la
semana anterior. Mientras entrena, apunta el peso de cada serie y, al acabarla, las
repeticiones, viendo el peso que usó la última vez para saber si progresa.

## Usuarios
Una sola persona (el dueño de la app), desde el navegador del móvil o del ordenador.
Sin cuentas.

## Historias de usuario
- HU-1. Como usuario, quiero crear rutinas con nombre y con los ejercicios que quiera
  (foto y título) para reutilizarlas cada semana.
- HU-2. Como usuario, quiero asignar cada semana las rutinas a los días que elija para
  tener planificado qué entreno cada día.
- HU-3. Como usuario, quiero ver en cada ejercicio sus series con el peso de la vez
  anterior para saber qué hice la última vez.
- HU-4. Como usuario, mientras entreno, quiero meter el peso de cada serie y, al acabarla,
  las repeticiones para dejar registrado lo que he hecho.
- HU-5. Como usuario, quiero editar y borrar rutinas y ejercicios para mantener mi plan al
  día.

## Definiciones
- **Coincidencia**: dos nombres o títulos coinciden si son iguales sin distinguir
  mayúsculas y sin los espacios del principio y del final ("Sentadilla" = "sentadilla ",
  pero "Sentadilla búlgara" no coincide con "Sentadilla").
- **Rutina**: conjunto de ejercicios con un nombre obligatorio (p. ej. "Pierna"). Existe
  por sí sola, sin estar ligada a ningún día.
- **Ejercicio**: elemento de una rutina con una foto obligatoria, un título obligatorio y
  un número de series. Dos ejercicios cuyos títulos coinciden son el mismo ejercicio a
  efectos del Previo, aunque estén en rutinas distintas. No hay biblioteca de ejercicios:
  la coincidencia es solo por título, así que una errata cuenta como otro ejercicio.
- **Serie**: fila de un ejercicio con las columnas Serie (número), Previo, KG (peso
  actual) y REPS (repeticiones). KG y REPS solo aparecen durante el entrenamiento.
- **Semana**: plan de lunes a domingo con sus fechas, guardado por separado de las demás
  semanas. Cada día tiene como máximo una rutina asignada.
- **Semana actual**: la semana de lunes a domingo que contiene el día de hoy (hora local).
  **Semana siguiente**: la que empieza el lunes posterior.
- **Previo**: de la serie N de un ejercicio, el último peso (sin repeticiones) guardado
  para la serie N de ese ejercicio (título que coincide) al terminar un entrenamiento de
  cualquier rutina. Si no hay dato, se muestra "–".
- **Entrenamiento**: periodo entre pulsar "Empezar entrenamiento" y "Terminar
  entrenamiento" en un día. No se puede cancelar: solo termina al pulsar "Terminar
  entrenamiento". Solo puede haber un entrenamiento abierto a la vez, y sigue abierto
  aunque cambie la semana.
- **Formato de día en los textos**: nombre del día y fecha día/mes, p. ej. "martes 27/10".

## Requisitos funcionales

### Navegación
- RF-1: CUANDO el usuario abre la app, EL SISTEMA muestra la semana actual.
  - Aceptación: con hoy = martes 27/10/2026, al abrir la app se ve la pestaña "Esta
    semana" con los días del lunes 26/10 al domingo 1/11.
- RF-2: EL SISTEMA muestra dos pestañas, "Esta semana" y "Siguiente", que muestran la
  semana actual y la semana siguiente con las fechas de lunes a domingo, y no permite ver
  ni planificar otras semanas.
  - Aceptación: con hoy = domingo 1/11/2026, "Esta semana" va del 26/10 al 1/11 y
    "Siguiente" del 2/11 al 8/11; no hay forma de ir a otras semanas.
- RF-3: CUANDO el usuario pulsa el botón "Rutinas", EL SISTEMA muestra la lista de
  rutinas, desde la que se crean, editan y borran rutinas y ejercicios.
  - Aceptación: pulsar "Rutinas" muestra la lista de rutinas y la opción de crear una.

### Rutinas y ejercicios
- RF-4: CUANDO el usuario guarda una rutina con un nombre, EL SISTEMA la guarda y la añade
  a la lista de rutinas.
  - Aceptación: crear la rutina "Pierna"; aparece en la lista de rutinas.
- RF-5: SI el usuario intenta guardar una rutina con el nombre vacío o solo con espacios,
  ENTONCES EL SISTEMA no la guarda y muestra "La rutina necesita un nombre".
  - Aceptación: guardar con nombre "   " no crea la rutina y aparece "La rutina necesita
    un nombre".
- RF-6: SI el usuario intenta guardar (al crearla o al renombrarla) una rutina con un
  nombre que coincide con el de otra rutina, ENTONCES EL SISTEMA no la guarda y muestra
  "Ya hay una rutina con ese nombre".
  - Aceptación: con "Pierna" creada, guardar otra rutina como " pierna " no la crea y
    aparece "Ya hay una rutina con ese nombre"; renombrar "Torso" a "PIERNA" tampoco se
    guarda y aparece el mismo mensaje.
- RF-7: CUANDO el usuario añade a una rutina un ejercicio con título, foto y número de
  series, EL SISTEMA lo guarda en esa rutina y lo muestra con su miniatura y su título, en
  el orden en que se añadió. No hay límite de ejercicios por rutina.
  - Aceptación: añadir 15 ejercicios a una rutina; aparecen los 15, cada uno con su
    miniatura y su título, en el orden en que se añadieron.
- RF-8: CUANDO el usuario elige la foto de un ejercicio, EL SISTEMA le deja tomarla de la
  galería o hacerla con la cámara del móvil.
  - Aceptación (en el iPhone del usuario): al elegir foto se ofrecen la galería y la
    cámara, y las dos opciones guardan la foto.
- RF-9: CUANDO el usuario elige una foto, EL SISTEMA la reduce a una miniatura antes de
  guardarla, para que quepa en el almacenamiento del navegador (unos 5 MB).
  - Aceptación: crear 20 ejercicios, cada uno con una foto de móvil de 3 MB o más; todos se
    guardan sin error y se ven tras recargar la página.
- RF-10: SI el usuario intenta guardar un ejercicio con el título vacío o solo con
  espacios, ENTONCES EL SISTEMA no lo guarda y muestra "El ejercicio necesita un título".
  - Aceptación: guardar con título "   " no guarda el ejercicio y aparece "El ejercicio
    necesita un título".
- RF-11: SI el usuario intenta guardar un ejercicio sin foto, ENTONCES EL SISTEMA no lo
  guarda y muestra "El ejercicio necesita una imagen".
  - Aceptación: guardar un ejercicio con título y sin foto no lo crea y aparece "El
    ejercicio necesita una imagen".
- RF-12: SI el usuario intenta guardar (al crearlo o al cambiarle el título) un ejercicio
  cuyo título coincide con el de otro ejercicio de la misma rutina, ENTONCES EL SISTEMA no
  lo guarda y muestra "Ya hay un ejercicio con ese título".
  - Aceptación: con "Sentadilla" en "Pierna", añadir "sentadilla " a "Pierna" no lo guarda
    y aparece "Ya hay un ejercicio con ese título"; añadir "Sentadilla" a "Torso" sí se
    guarda.
- RF-13: SI el usuario escribe (al crear o al editar un ejercicio) como número de series
  algo que no sea un número entero de 1 a 20, ENTONCES EL SISTEMA no guarda el ejercicio y
  muestra "Indica cuántas series (de 1 a 20)".
  - Aceptación: con series "0", "21" o "abc" no se guarda y aparece "Indica cuántas series
    (de 1 a 20)"; con "3" se guarda con 3 series y con "20" con 20 series.
- RF-14: EL SISTEMA no deja escribir más de 50 caracteres en el nombre de una rutina ni en
  el título de un ejercicio, sin mostrar ningún mensaje.
  - Aceptación: al intentar escribir un carácter 51 en el nombre de una rutina o en el
    título de un ejercicio, no se añade y no aparece ningún mensaje; uno de 50 se guarda
    completo.
- RF-15: CUANDO el usuario edita una rutina, EL SISTEMA le permite cambiar el nombre,
  añadir y quitar ejercicios y cambiar el número de series de cada ejercicio, y guarda los
  cambios.
  - Aceptación: renombrar "Pierna" a "Pierna A", añadir un ejercicio y pasar otro de 3 a 4
    series; tras guardar y recargar, los tres cambios siguen.
- RF-16: CUANDO el usuario edita un ejercicio ya creado, EL SISTEMA le permite cambiar su
  título y su foto y guarda los cambios. El Previo sigue la regla de siempre: muestra el
  del título nuevo, o "–" si no hay; los pesos guardados no pasan de un título a otro.
  - Aceptación: "Sentadilla" con Previo 60 en la serie 1; cambiar el título a "Sentadilla
    trasera" (sin pesos guardados): la serie 1 muestra "–"; volver a llamarlo "Sentadilla":
    la serie 1 muestra 60.
  - Aceptación: cambiar la foto de un ejercicio; tras recargar se ve la foto nueva.
- RF-17: CUANDO el usuario pide borrar una rutina sin días asignados en la semana actual
  ni en la siguiente, o un ejercicio, EL SISTEMA pide confirmación con "¿Borrar la rutina
  <nombre>?" o "¿Borrar el ejercicio <título>?" y solo lo borra si el usuario confirma.
  - Aceptación: pedir borrar la rutina "Torso" muestra "¿Borrar la rutina Torso?"; pedir
    borrar el ejercicio "Sentadilla" muestra "¿Borrar el ejercicio Sentadilla?"; cancelar
    no borra nada; confirmar lo borra.
- RF-18: CUANDO el usuario pide borrar una rutina asignada a días de la semana actual o de
  la siguiente, EL SISTEMA indica en la confirmación cada día con su fecha y, si el usuario
  confirma, la borra y esos días quedan vacíos. Los días de semanas pasadas que la tenían
  asignada también quedan vacíos (en la confirmación solo se nombran los de la semana
  actual y la siguiente).
  - Aceptación: con hoy = martes 27/10/2026 y "Pierna" asignada al martes 27/10 (semana
    actual) y al viernes 6/11 (semana siguiente), pedir borrarla muestra "Esta rutina está
    asignada al martes 27/10 y al viernes 6/11. ¿Borrarla?"; al confirmar, "Pierna" ya no
    está en la lista y esos dos días muestran "No hay rutina para este día.".
  - Aceptación: con "Pierna" asignada también al lunes 19/10 (semana pasada), al
    confirmar el borrado ese día queda vacío en el plan guardado.
- RF-19: MIENTRAS una rutina no tiene ejercicios, EL SISTEMA muestra "Esta rutina no tiene
  ejercicios. Añade el primero.".
  - Aceptación: una rutina recién creada muestra "Esta rutina no tiene ejercicios. Añade
    el primero." y no una tabla vacía.

### Planificación semanal
- RF-20: CUANDO el usuario asigna una rutina a un día de una semana, EL SISTEMA la guarda
  en ese día de esa semana, sustituyendo la que hubiera, de modo que cada día tenga como
  máximo una rutina.
  - Aceptación: asignar "Pierna" al martes y después "Torso" al martes; el martes muestra
    solo "Torso".
- RF-21: CUANDO el usuario asigna una rutina a un día o la quita de un día, EL SISTEMA
  actualiza solo esa semana. Para cambiar una rutina de día, el usuario la quita de un día
  y la asigna a otro; no hay una acción propia de mover.
  - Aceptación: en "Siguiente", quitar "Pierna" del martes y asignarla al viernes; en "Esta
    semana" el martes sigue con "Pierna".
- RF-22: CUANDO el usuario abre por primera vez una semana que no ha planificado, EL
  SISTEMA la muestra con todos los días vacíos, sin copiar la semana anterior.
  - Aceptación: con la semana actual planificada, "Siguiente" aparece con los 7 días
    vacíos.
- RF-23: MIENTRAS un día no tiene rutina asignada, EL SISTEMA muestra "No hay rutina para
  este día.", no un error.
  - Aceptación: un día sin rutina muestra "No hay rutina para este día.".
- RF-24: CUANDO una semana pasa a ser pasada, EL SISTEMA conserva guardado su plan (no lo
  borra solo) y no lo muestra.
  - Aceptación: con el plan del 26/10 al 1/11 guardado y hoy = lunes 2/11/2026, ninguna
    pestaña muestra esa semana y su plan sigue en el almacenamiento del navegador.

### Vista del día y entrenamiento
- RF-25: CUANDO el usuario abre un día con rutina, EL SISTEMA muestra el nombre de la
  rutina, los botones "Empezar entrenamiento" y "Editar rutina" y, por cada ejercicio, una
  tarjeta con su miniatura y su título y debajo una tabla con las columnas Serie y Previo,
  con una fila por serie numerada desde 1.
  - Aceptación: sin entrenamiento empezado, un ejercicio con 3 series muestra una tabla de
    3 filas numeradas 1, 2 y 3 con las columnas Serie y Previo, sin KG ni REPS.
- RF-26: EL SISTEMA muestra en la columna Previo de cada serie N el último peso guardado
  para la serie N de ese ejercicio (título que coincide, en cualquier rutina), o "–" si no
  hay. Un peso 0 se muestra como "0".
  - Aceptación: la primera vez, Previo muestra "–" en todas las series; tras terminar un
    entrenamiento con 40 kg en la serie 2, la próxima vez la serie 2 muestra 40 en Previo.
  - Aceptación: terminar en la rutina "Pierna" con 60 kg en la serie 1 de "Sentadilla";
    en la rutina "Full body", la serie 1 de "sentadilla " muestra 60 en Previo, y la de
    "Sentadilla búlgara" o "Sentadila" muestra "–".
  - Aceptación: terminar con 0 en KG de la serie 1; la próxima vez la serie 1 muestra "0"
    en Previo.
- RF-27: EL SISTEMA muestra el botón "Empezar entrenamiento" en cualquier día con rutina
  de la semana actual (también en días pasados o futuros de esa semana), y no en los días
  de la semana siguiente.
  - Aceptación: con hoy = miércoles 28/10/2026, se puede empezar el entrenamiento del lunes
    26/10 y del viernes 30/10; en "Siguiente" no aparece el botón.
- RF-28: MIENTRAS la rutina de un día no tiene ejercicios, EL SISTEMA muestra el botón
  "Empezar entrenamiento" desactivado y "Esta rutina no tiene ejercicios. Añade el
  primero." (RF-19).
  - Aceptación: asignar a un día de "Esta semana" una rutina sin ejercicios; el botón
    "Empezar entrenamiento" no responde y aparece "Esta rutina no tiene ejercicios. Añade
    el primero.".
- RF-29: CUANDO el usuario pulsa "Empezar entrenamiento", EL SISTEMA abre la rutina del
  día con su tabla con las columnas Serie, Previo, KG y REPS, y le permite escribir el
  peso (KG) de cada serie y, al acabarla, las repeticiones (REPS).
  - Aceptación: tras empezar, escribir 40 en KG y 10 en REPS de la serie 2; los valores se
    quedan en esa fila.
- RF-30: MIENTRAS el usuario está entrenando, EL SISTEMA le permite añadir series al final
  de cada ejercicio hasta un máximo de 20 y quitar solo la última, siempre que quede al
  menos 1 serie, solo para ese entrenamiento y sin cambiar la rutina. Con 20 series, el
  botón de añadir serie de ese ejercicio queda desactivado.
  - Aceptación: en un ejercicio de 3 series añadir una; aparece la fila 4 con Previo "–";
    solo la fila 4 se puede quitar; al quitarla vuelven a ser 3 filas y la fila 3 pasa a
    ser la que se puede quitar.
  - Aceptación: en un ejercicio de 1 serie no se puede quitar esa serie.
  - Aceptación: en un ejercicio de 19 series añadir una; con 20 series el botón de añadir
    serie no responde; al quitar la 20 vuelve a responder.
  - Aceptación: añadir una serie, terminar el entrenamiento y abrir la rutina: el ejercicio
    sigue teniendo 3 series.
- RF-31: EL SISTEMA admite pesos en kg con decimales escritos con coma o con punto.
  - Aceptación: escribir "22,5" o "22.5" en KG se acepta en los dos casos como 22,5 kg.
- RF-32: SI al pulsar "Terminar entrenamiento" hay un peso negativo o no numérico, o unas
  repeticiones que no son un número entero mayor o igual que 0, ENTONCES EL SISTEMA no
  termina el entrenamiento, señala el campo erróneo y muestra "Peso no válido" o
  "Repeticiones no válidas".
  - Aceptación: con "-5" en KG de la serie 2, pulsar "Terminar entrenamiento" no lo
    termina, el KG de la serie 2 queda señalado y aparece "Peso no válido".
  - Aceptación: con "abc" en REPS de la serie 1, pulsar "Terminar entrenamiento" no lo
    termina, el REPS de la serie 1 queda señalado y aparece "Repeticiones no válidas".
- RF-33: CUANDO el usuario pulsa "Terminar entrenamiento" sin datos inválidos, EL SISTEMA
  guarda el peso de cada serie que tenga peso (también 0), que pasa a ser el Previo de esa
  serie la próxima vez; las series sin peso mantienen su Previo anterior y las
  repeticiones no se guardan.
  - Aceptación: terminar con 22,5 kg en la serie 1; al volver a abrir esa rutina, la
    serie 1 muestra 22,5 en Previo.
  - Aceptación: con Previo 40 en la serie 2, terminar dejando la serie 2 sin peso; la
    próxima vez la serie 2 sigue mostrando 40 en Previo.
  - Aceptación: terminar con 10 en REPS; al volver a empezar esa rutina, REPS está vacío.
- RF-34: CUANDO el usuario pulsa "Terminar entrenamiento", EL SISTEMA guarda también el
  peso de las series añadidas durante el entrenamiento como Previo de esa serie N de ese
  ejercicio (título que coincide).
  - Aceptación: en "Sentadilla" (3 series) añadir la serie 4, escribir 50 en KG y
    terminar; en el siguiente entrenamiento, al añadir la serie 4 a "Sentadilla" (o en otra
    rutina con "Sentadilla" de 4 series), su Previo muestra 50.
- RF-35: CUANDO el usuario termina el entrenamiento de un día, EL SISTEMA marca ese día con
  "✓ Hecho" y permite volver a empezar su entrenamiento. No hay más estados de día. SI el
  usuario asigna otra rutina a un día marcado con "✓ Hecho", ENTONCES EL SISTEMA le quita
  la marca. SI un día marcado con "✓ Hecho" se queda vacío (porque se le quita su rutina o
  porque se borra la rutina, RF-18), ENTONCES EL SISTEMA le quita la marca, y la marca no
  vuelve aunque después se le asigne de nuevo la misma rutina: el día queda pendiente.
  - Aceptación: terminar el entrenamiento del martes 27/10; el martes muestra "✓ Hecho" y
    el botón "Empezar entrenamiento"; empezarlo de nuevo, escribir 45 en KG de la serie 1 y
    terminar; la serie 1 muestra 45 en Previo y el martes sigue con "✓ Hecho".
  - Aceptación: con el martes 27/10 en "✓ Hecho" con "Pierna", asignarle "Torso"; el
    martes muestra "Torso" sin "✓ Hecho".
  - Aceptación: con el martes 27/10 en "✓ Hecho" con "Pierna", quitarle la rutina y volver
    a asignarle "Pierna"; el martes muestra "Pierna" sin "✓ Hecho".
- RF-36: MIENTRAS hay un entrenamiento empezado y no terminado, EL SISTEMA conserva lo
  escrito aunque se cierre o recargue la app; al volver, abre la semana actual (RF-1) con
  el aviso de RF-37, y al tocar "Continuar" muestra ese entrenamiento con los valores
  escritos. No hay opción de cancelar el entrenamiento.
  - Aceptación: empezar, escribir 40 en KG y 10 en REPS de la serie 1 y recargar la
    página; se ve "Esta semana" con el aviso de RF-37; al tocar "Continuar", el
    entrenamiento sigue abierto con 40 y 10 en la serie 1, y no hay botón de cancelar.
- RF-37: MIENTRAS hay un entrenamiento abierto, EL SISTEMA muestra siempre arriba el aviso
  "Entrenamiento del <día> <d/m> sin terminar. Continuar" y, al tocarlo, lleva a ese
  entrenamiento desde cualquier semana.
  - Aceptación: con hoy = lunes 2/11/2026 y el entrenamiento del domingo 1/11 abierto,
    arriba aparece "Entrenamiento del domingo 1/11 sin terminar. Continuar" tanto en "Esta
    semana" como en "Siguiente" y en "Rutinas"; al tocarlo se ve ese entrenamiento con sus
    valores.
- RF-38: SI hay un entrenamiento abierto y el usuario pulsa "Empezar entrenamiento" en otro
  día, ENTONCES EL SISTEMA no empieza otro, avisa con "Tienes el entrenamiento del <día>
  <d/m> sin terminar" y lleva al entrenamiento abierto.
  - Aceptación: con hoy = miércoles 28/10/2026 y el entrenamiento del martes 27/10
    abierto, pulsar "Empezar entrenamiento" el miércoles muestra "Tienes el entrenamiento
    del martes 27/10 sin terminar" y se ve el entrenamiento del martes con sus valores; el
    miércoles no tiene entrenamiento abierto.
- RF-39: MIENTRAS hay un entrenamiento abierto, SI el usuario intenta editar o borrar la
  rutina de ese entrenamiento o alguno de sus ejercicios (incluidos su título y su foto),
  ENTONCES EL SISTEMA no lo permite y muestra "Termina el entrenamiento antes de editar
  esta rutina".
  - Aceptación: con el entrenamiento de "Pierna" abierto, intentar renombrar "Pierna",
    cambiar el título o la foto de uno de sus ejercicios, borrar uno de sus ejercicios o
    borrar "Pierna" muestra el mensaje y no cambia nada; tras terminar el entrenamiento, se
    puede editar con normalidad.
- RF-40: MIENTRAS hay un entrenamiento abierto, SI el usuario intenta asignar otra rutina
  al día de ese entrenamiento o quitarle su rutina en el plan semanal, ENTONCES EL SISTEMA
  no lo permite y muestra "Termina el entrenamiento antes de cambiar este día".
  - Aceptación: con el entrenamiento del martes ("Pierna") abierto, asignar "Torso" al
    martes o quitar "Pierna" del martes muestra el mensaje y el martes sigue con "Pierna";
    tras terminar el entrenamiento, se puede cambiar con normalidad.
- RF-41: MIENTRAS un entrenamiento sigue abierto al pasar de domingo a lunes, EL SISTEMA lo
  mantiene abierto con sus valores y permite terminarlo con normalidad (RF-33).
  - Aceptación: empezar el entrenamiento del domingo 1/11, escribir 40 en KG de la serie 1
    y, con hoy = lunes 2/11/2026, abrir la app y tocar el aviso de RF-37; el entrenamiento
    sigue abierto con 40 y, al terminarlo, la serie 1 de ese ejercicio muestra 40 en
    Previo.

### General
- RF-42: EL SISTEMA conserva rutinas, ejercicios, fotos, planes semanales (también los de
  semanas pasadas), pesos guardados y el entrenamiento abierto al cerrar y volver a abrir
  la app en el mismo navegador.
  - Aceptación: crear una rutina con un ejercicio, asignarla a un día, terminar un
    entrenamiento y recargar la página; todo sigue igual.
- RF-43: EL SISTEMA muestra todos los textos de la interfaz en español.
  - Aceptación: revisión visual de todas las pantallas sin textos en otro idioma.

## Requisitos no funcionales
- RNF-1: Usable en un móvil de 375 px de ancho sin desplazamiento horizontal.
- RNF-2: Los campos de texto y número no provocan zoom automático en iPhone al tocarlos.
- RNF-3: Ningún dato guardado se borra ni se sobrescribe sin una acción explícita del
  usuario.
- RNF-4: Funciona sin conexión a internet y sin cuenta.
- RNF-5: Las fechas y semanas se calculan en hora local, nunca en UTC.

## Casos límite
- Día sin rutina: "No hay rutina para este día." (RF-23).
- Rutina sin ejercicios: "Esta rutina no tiene ejercicios. Añade el primero." (RF-19) y no
  se puede empezar (RF-28).
- Nombre de rutina o título con caracteres especiales (`<`, `>`, `&`, comillas): se
  muestra tal cual, sin romper la página.
- Nombre o título de 50 caracteres (el máximo, RF-14): se ve completo o recortado sin
  desbordar la pantalla de 375 px.
- Nombre de rutina repetido (RF-6) o título repetido en la misma rutina (RF-12): no se
  guarda.
- Peso con decimales, con coma o con punto (22,5 o 22.5): se admite (RF-31).
- Peso 0: se guarda y su Previo es "0" (RF-26, RF-33).
- Primera vez que se hace un ejercicio, o serie añadida que nunca se hizo: Previo "–"
  (RF-26).
- Cambiar el título de un ejercicio: muestra el Previo del título nuevo o "–"; los pesos
  no pasan de un título a otro (RF-16).
- Archivo elegido que no es una imagen o no se puede leer: no se guarda el ejercicio y se
  avisa con "No se ha podido cargar la imagen".
- Almacenamiento lleno al guardar: no se guarda nada a medias, no se pierde lo que ya
  había y se avisa con "No queda espacio para guardar".
- Cambio de semana (de domingo a lunes): la semana siguiente pasa a ser la actual con lo
  que se hubiera planificado en ella; el plan de la semana que pasa se conserva sin verse
  (RF-24).
- Borrar una rutina asignada a varios días o al mismo día de las dos semanas: la
  confirmación nombra cada día con su fecha y, al confirmar, esos días quedan vacíos
  (RF-18).
- Borrar una rutina asignada a días de semanas pasadas: esos días también quedan vacíos,
  sin nombrarlos en la confirmación (RF-18).
- Asignar otra rutina a un día "✓ Hecho": se quita la marca (RF-35).
- Día "✓ Hecho" que se queda vacío (se quita su rutina o se borra la rutina): se quita la
  marca y no vuelve aunque se le asigne otra vez la misma rutina (RF-35, RF-18).
- Cerrar o recargar la app a mitad del entrenamiento: se conserva lo escrito, el
  entrenamiento sigue abierto y la app abre en la semana actual con el aviso de RF-37
  (RF-36).
- Llegar a 20 series durante el entrenamiento: el botón de añadir serie queda desactivado
  (RF-30).
- Dato inválido al terminar: no termina y se señala el campo (RF-32).
- Serie sin peso al pulsar "Terminar entrenamiento": mantiene su Previo anterior (RF-33).
- Mismo título en dos rutinas: comparten el Previo (RF-26).
- Errata en el título: cuenta como otro ejercicio, con Previo "–" (RF-26).
- Recuperar hoy la rutina de ayer: se puede empezar el entrenamiento de cualquier día de
  la semana actual (RF-27).
- Volver a entrenar un día ya hecho: se puede, y sigue "✓ Hecho" (RF-35).
- Quitar series durante el entrenamiento: solo la última y siempre queda al menos 1
  (RF-30).
- Peso de una serie añadida durante el entrenamiento: se guarda como Previo de esa serie
  (RF-34).
- Pulsar "Empezar entrenamiento" con otro entrenamiento abierto: aviso y se va al abierto
  (RF-38).
- Entrenamiento abierto de una semana que ya no se ve: el aviso de arriba lleva a él
  (RF-37, RF-41).
- Editar o borrar la rutina (o sus ejercicios) con su entrenamiento abierto: no se permite
  (RF-39).
- Asignar otra rutina o quitar la rutina del día con el entrenamiento abierto: no se
  permite (RF-40).

## Fuera de alcance
- Ejercicios pendientes → spec 002.
- Notificaciones (p. ej. aviso del domingo para planificar): irá en su propia spec, que
  exigirá cambiar la constitución (servidor y publicación). Esta spec sigue sin servidor.
- Historial de entrenamientos y resumen mensual de mejoras y empeoramientos (spec futura).
- Ver o planificar semanas pasadas, o más allá de la siguiente.
- Reordenar ejercicios.
- Compartir rutina.
- Mapa de músculos.
- Copia de seguridad (exportar/importar).
- Cuentas, sincronización entre dispositivos y servidor.
- Estadísticas, gráficas, temporizador de descanso, biblioteca de ejercicios
  predefinidos, peso o repeticiones objetivo.
- Todo lo que no esté en los RF de esta spec.

## Criterios de finalización
- Todos los RF cumplen su aceptación, verificada en Chrome (consola limpia, 375 px), salvo
  las excepciones siguientes.
- La foto desde el móvil (cámara o galería, RF-8) se comprueba en el iPhone del usuario.
- Los cambios de semana y de día (RF-1, RF-2, RF-24, RF-27, RF-37, RF-41) se prueban con
  tests que pasan "hoy" como parámetro.
- La lógica pura tiene tests y `node --test` pasa en verde.
- Las dudas abiertas están resueltas y reflejadas en los RF.

## Dudas abiertas
Ninguna.
