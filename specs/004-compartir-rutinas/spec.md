# Spec 004 — Compartir rutinas
Estado: aprobada

## Contexto y objetivo
El usuario quiere pasar sus rutinas a amigos que también usan GetStrong. En sus palabras:
"Quiero añadir la funcionalidad de compartir rutinas con otros amigos".

La app no tiene servidor ni cuentas, así que se comparte con un archivo: el usuario
genera un archivo con una rutina y lo envía con el menú de compartir del móvil (WhatsApp,
AirDrop, correo...). El amigo lo guarda y lo abre desde un botón "Importar" de su app.
Cada amigo tiene su propia copia de GetStrong, así que el archivo no depende de ninguna
dirección web concreta: vale para cualquier copia de la app.

Se construye sobre las specs 001, 002 y 003, que siguen vigentes sin cambios salvo lo que
aquí se añade. Las referencias "RF-x de la 001" apuntan a esa spec.

## Usuarios
- **Quien comparte**: el dueño de la app, desde el móvil.
- **Quien importa**: un amigo con su propia copia de GetStrong, desde el móvil. Sin cuentas.

## Historias de usuario
- HU-1. Como usuario, quiero enviar una de mis rutinas a un amigo para que la pueda usar
  sin tener que crearla a mano.
- HU-2. Como amigo, quiero importar una rutina que me han enviado para tenerla en mi lista
  de rutinas, sin perder nada de lo que ya tengo.

## Definiciones
- **Archivo de rutina**: archivo `.json` que genera "Compartir" con UNA rutina. Lleva la
  marca `"app": "GetStrong"`, el número de versión del formato (`"version": 1`), el nombre
  de la rutina y, por cada ejercicio y en su orden, el título, la foto (la miniatura
  guardada, embebida dentro del archivo como imagen `data:image/...` en base64) y el número
  de series. No lleva días asignados, Previo (pesos), pendientes, entrenamientos ni
  identificadores. En esta spec el número de versión solo se escribe: al importar no se
  comprueba.
- **Nombre del archivo**: `<nombre de la rutina>.json`, sustituyendo por `-` cada carácter
  que no vale en un nombre de archivo (`/ \ : * ? " < > |`).
- **Recortar**: quitar los espacios del principio y del final, como al guardar una rutina
  o un ejercicio a mano. Al importar se recortan el nombre de la rutina y los títulos, y
  así se comprueban y se guardan.
- **Coincidencia**: la misma de la spec 001 (iguales sin distinguir mayúsculas y sin los
  espacios del principio y del final).
- **Longitud (50 caracteres)**: se cuenta igual que el límite del campo de nombre y de
  título al crearlos a mano (RF-14 de la 001), y de la misma forma al validar el archivo,
  sobre el texto ya recortado. Así, todo nombre o título creado a mano cabe al importarlo.
- **Archivo válido**: archivo de rutina que cumple todo esto:
  - lleva la marca `"app": "GetStrong"`;
  - nombre recortado no vacío de 50 caracteres como máximo (RF-5 y RF-14 de la 001);
  - cero o más ejercicios (RF-14 de esta spec);
  - cada ejercicio con título recortado no vacío de 50 caracteres como máximo, que no
    coincide con el de otro ejercicio de esa rutina, y número de series entero de 1 a 20
    (RF-10, RF-12, RF-13 y RF-14 de la 001);
  - cada foto es una imagen embebida (`data:image/...` en base64) de 200 KB como máximo
    (200 × 1024 caracteres de ese texto). Un enlace (`http`, `https` u otro) no vale.

  Los campos de más que traiga el archivo se ignoran (no impiden importarlo ni se guardan).
- **Resolver el nombre**: la regla que, a partir del nombre de la rutina del archivo (o del
  escrito en la pregunta de RF-7) y de los nombres de las rutinas del usuario, decide qué
  pasa: importar con ese nombre recortado (RF-5), preguntar otro nombre (RF-7) o mostrar el
  aviso de nombre vacío o repetido (RF-8). Es lógica pura y tiene tests.
- **Copia independiente**: la rutina importada no queda unida a la original. Lo que
  cambie cualquiera de los dos después no afecta al otro.

## Requisitos funcionales

### Compartir
- RF-1: CUANDO el usuario pulsa "Compartir" en la pantalla "Editar rutina", EL SISTEMA
  genera el archivo de rutina y abre el menú de compartir del móvil con ese archivo,
  llamado según la definición "Nombre del archivo". "Compartir" es un botón secundario
  (spec 003): "Añadir ejercicio" sigue siendo el principal.
  - Aceptación (en el iPhone del usuario): en "Editar rutina" de "Pierna", pulsar
    "Compartir"; se abre el menú de compartir del iPhone con un archivo "Pierna.json" y se
    puede enviar por WhatsApp, AirDrop o correo.
- RF-2: CUANDO el usuario comparte una rutina, EL SISTEMA no cambia ningún dato guardado:
  la rutina, sus días asignados, el Previo y los pendientes siguen igual.
  - Aceptación: compartir "Pierna" (asignada al martes) y recargar la página; "Pierna"
    sigue igual y asignada al martes.
- RF-3: SI el usuario cierra el menú de compartir sin enviar nada, ENTONCES EL SISTEMA no
  muestra ningún aviso ni cambia nada.
  - Aceptación: pulsar "Compartir" y cerrar el menú; la pantalla sigue igual, sin avisos.
- RF-13: SI el navegador no tiene menú de compartir con archivos, o el menú falla por un
  motivo distinto a que el usuario lo cierre (RF-3), ENTONCES, CUANDO el usuario pulsa
  "Compartir", EL SISTEMA descarga el archivo de rutina (el mismo de RF-1, con el mismo
  nombre) para que el usuario lo envíe a mano. No cambia ningún dato guardado (RF-2).
  - Aceptación (Chrome del ordenador, app abierta con `file://`): en "Editar rutina" de
    "Pierna", pulsar "Compartir"; se descarga "Pierna.json" y "Pierna" sigue igual tras
    recargar.
  - Aceptación: con una rutina llamada "Pierna/Glúteo", pulsar "Compartir"; se descarga
    "Pierna-Glúteo.json".
  - Aceptación: importar "Pierna.json" en otra copia de GetStrong (RF-5); aparece "Pierna"
    con sus ejercicios, fotos y series.

### Importar
- RF-4: CUANDO el usuario pulsa "Importar" en la lista de Rutinas, EL SISTEMA le deja
  elegir cualquier archivo del móvil. "Importar" está junto a "Crear" y es un botón
  secundario (spec 003): "Crear" sigue siendo el principal.
  - Aceptación (en el iPhone): pulsar "Importar" permite elegir un archivo guardado en
    Archivos.
- RF-5: CUANDO el usuario elige un archivo válido cuyo nombre de rutina recortado no
  coincide con el de ninguna de sus rutinas, EL SISTEMA añade la rutina al final de la
  lista de rutinas con ese nombre recortado, con sus ejercicios en el mismo orden, cada uno
  con su título recortado, su foto y su número de series, sin días asignados.
  - Aceptación: importar "Pierna.json" (Sentadilla 3 series, Prensa 4 series, cada una con
    su foto) en una app sin "Pierna"; aparece "Pierna" al final de la lista con
    "Sentadilla" y "Prensa" en ese orden, con sus fotos y sus series, y ningún día la
    tiene asignada.
  - Aceptación: importar un archivo válido con nombre "  Pierna  " y un título
    " Prensa "; aparece "Pierna" con "Prensa", sin espacios en los extremos.
- RF-6: EL SISTEMA trata la rutina importada como una copia independiente: se edita,
  asigna, entrena y borra como cualquier otra (spec 001), sin cambiar la rutina de la que
  salió el archivo ni el propio archivo.
  - Aceptación: en la misma app de la que salió "Pierna.json", importarlo como "Pierna B"
    (RF-8) y borrar "Sentadilla" de "Pierna B"; "Pierna" sigue con "Sentadilla" y
    "Prensa".
  - Aceptación: después, borrar "Prensa" de "Pierna" e importar otra vez "Pierna.json" como
    "Pierna C"; "Pierna C" trae "Sentadilla" y "Prensa", como el archivo.
- RF-7: SI el archivo es válido y su nombre de rutina coincide con el de una rutina del
  usuario, ENTONCES EL SISTEMA no importa nada todavía y, en la propia pantalla de Rutinas
  y en el lugar del formulario "Crear" (campo, "Crear" e "Importar"), muestra "Ya tienes
  una rutina llamada <nombre>. Escribe otro nombre para importarla.", donde <nombre> es el
  nombre del archivo recortado, con un campo ya relleno con ese nombre y los botones
  "Importar" (principal, en lugar de "Crear") y "Cancelar" (secundario). No sobrescribe ni
  cambia la rutina existente.
  - Aceptación: con "Pierna" creada, importar un archivo cuyo nombre es " Pierna "; en la
    pantalla de Rutinas, donde estaba el formulario "Crear", aparece "Ya tienes una rutina
    llamada Pierna. Escribe otro nombre para importarla." con el campo relleno con
    "Pierna", y la lista sigue con una sola "Pierna", sin cambios.
- RF-8: CUANDO el usuario escribe en ese campo un nombre válido y pulsa "Importar", EL
  SISTEMA importa la rutina con ese nombre recortado (como en RF-5) y la pregunta
  desaparece. El nombre sigue las reglas de RF-5, RF-6 y RF-14 de la 001: el campo no deja
  escribir más de 50 caracteres y mide al menos 16 px; si el nombre está vacío o coincide
  con el de otra rutina, no importa nada, la pregunta sigue abierta con lo escrito y
  muestra "La rutina necesita un nombre" o "Ya hay una rutina con ese nombre".
  - Aceptación: con "Pierna" creada, al importar "Pierna.json" escribir "Pierna de Juan" y
    pulsar "Importar"; la lista tiene "Pierna" (sin cambios) y "Pierna de Juan" con los
    ejercicios del archivo.
  - Aceptación: en el mismo caso, escribir " pierna " y pulsar "Importar"; aparece "Ya hay
    una rutina con ese nombre", la pregunta sigue abierta con " pierna " en el campo y no
    se importa nada.
  - Aceptación: en el mismo caso, intentar escribir un carácter 51 en el campo; no se
    añade y no aparece ningún mensaje. A 375 px el campo mide al menos 16 px de letra.
- RF-9: CUANDO el usuario pulsa "Cancelar" en la pregunta de RF-7, o recarga la página o
  cambia de pantalla con la pregunta abierta, EL SISTEMA no importa nada y la lista de
  Rutinas queda sin cambios, con el formulario "Crear" de nuevo.
  - Aceptación: con "Pierna" creada, importar "Pierna.json" y pulsar "Cancelar"; vuelve el
    formulario "Crear" y la lista sigue igual.
  - Aceptación: con la pregunta abierta, recargar la página (o ir a Semana y volver a
    Rutinas); no hay pregunta y la lista sigue igual.
- RF-10: SI el archivo elegido no es un archivo válido (no es un archivo de rutina, está
  roto o incumple alguna regla de la definición), ENTONCES EL SISTEMA no importa nada y
  muestra en la página "Este archivo no es una rutina válida". La validez se comprueba
  antes que el nombre: un archivo no válido nunca abre la pregunta de RF-7.
  - Aceptación: importar una foto `.jpg`; aparece "Este archivo no es una rutina válida"
    y la lista sigue igual.
  - Aceptación: importar un archivo de rutina con un ejercicio sin foto, con 21 series,
    con la foto como enlace `https://...` o con una foto de más de 200 KB; aparece el
    mismo aviso y no se importa ningún ejercicio.
  - Aceptación: importar un archivo de rutina correcto pero sin `"app": "GetStrong"`;
    aparece el mismo aviso.
  - Aceptación: con "Pierna" creada, importar un archivo "Pierna" no válido; aparece el
    aviso de no válido, no la pregunta de RF-7.
  - Aceptación: importar un archivo válido con un campo de más (p. ej. `"autor": "Juan"`);
    se importa como en RF-5.
- RF-11: SI no queda espacio para guardar la rutina importada, ENTONCES EL SISTEMA no
  importa nada y muestra "No queda espacio para guardar" (como en la 001).
  - Aceptación: con el almacenamiento lleno, importar un archivo válido; aparece "No queda
    espacio para guardar" y la lista sigue igual tras recargar.
- RF-12: EL SISTEMA conserva la rutina importada al cerrar y volver a abrir la app en el
  mismo navegador.
  - Aceptación: importar "Pierna" y recargar la página; "Pierna" sigue en la lista.
- RF-14: EL SISTEMA permite compartir una rutina sin ejercicios (RF-1 o RF-13); su archivo
  es válido y al importarlo llega como rutina vacía, con las mismas reglas que cualquier
  otro (RF-5, RF-7 a RF-9).
  - Aceptación: crear la rutina "Core" sin ejercicios y pulsar "Compartir"; se genera
    "Core.json" igual que con cualquier otra rutina.
  - Aceptación: importar "Core.json" en una app sin "Core"; aparece "Core" al final de la
    lista, sin ejercicios y sin días asignados, y no sale ningún aviso.
- RF-15: MIENTRAS haya un entrenamiento abierto, EL SISTEMA permite compartir cualquier
  rutina (también la del entrenamiento abierto) e importar, porque no modifican datos
  existentes; el entrenamiento abierto sigue igual.
  - Aceptación: con un entrenamiento abierto de "Pierna", compartir "Pierna" e importar
    "Core.json"; ambos funcionan como sin entrenamiento y el entrenamiento sigue abierto
    con sus series.
- RF-16: EL SISTEMA da siempre identificadores nuevos a la rutina importada y a cada uno de
  sus ejercicios, también al importarla en la misma app de la que salió.
  - Aceptación: cubierta por la primera aceptación de RF-6 (borrar un ejercicio de la
    copia no toca la original en la misma app).

Nota: RF-13 a RF-16 se añadieron al cerrar las dudas; se numeran al final para no cambiar
los números de los demás RF.

## Requisitos no funcionales
- RNF-1 a RNF-5 de la spec 001 siguen vigentes (375 px, campos sin zoom en iPhone, datos
  sin borrar ni sobrescribir sin acción del usuario, sin conexión ni cuenta, fechas en
  hora local).
- RNF-6: El archivo de rutina se puede importar en cualquier copia de GetStrong, esté
  donde esté publicada o abierta. En el iPhone la copia del amigo debe ser una web
  publicada: `index.html` abierto desde Archivos no ejecuta JavaScript.
- RNF-7: Los botones y la pregunta nuevos siguen el estilo de la spec 003, con como mucho
  un botón principal visible por pantalla.

## Casos límite
- Nombre del archivo igual a una rutina propia (también " pierna " frente a "Pierna"): se
  pide otro nombre; la existente no cambia (RF-7, RF-8).
- Nombre nuevo vacío o repetido en la pregunta: no se importa, la pregunta sigue abierta
  con lo escrito y aparece el aviso de la 001 (RF-8).
- Cancelar, recargar o cambiar de pantalla con la pregunta abierta: no se importa nada
  (RF-9).
- Archivo no válido con nombre repetido: sale el aviso de no válido, no la pregunta
  (RF-10).
- Archivo roto, de otro tipo, sin la marca de GetStrong o con datos que una rutina hecha a
  mano no admitiría (sin foto, foto como enlace o de más de 200 KB, título vacío o de más
  de 50 caracteres, series fuera de 1 a 20, títulos repetidos en la rutina, nombre de más
  de 50): no se importa nada, ni siquiera parte (RF-10).
- Campos de más en el archivo: se ignoran (definición "Archivo válido").
- Almacenamiento lleno: no se importa nada (RF-11).
- Importar dos veces el mismo archivo: la segunda vez se pide otro nombre (RF-7), y la
  copia tiene identificadores propios (RF-16).
- Ejercicio importado con el mismo título que uno que el amigo ya ha entrenado en otra
  rutina: su Previo es el del amigo para ese título, como siempre (RF-26 de la 001); el
  archivo no trae pesos.
- Pendientes del amigo con el mismo título que un ejercicio importado: se aplican las
  reglas de la 002 sin cambios.
- Compartir una rutina asignada a días: el archivo no lleva días y la rutina original
  sigue asignada (RF-2).
- Compartir o importar con un entrenamiento abierto: permitido, nada cambia en él (RF-15).
- Cerrar el menú de compartir sin enviar: nada cambia y no hay aviso (RF-3).
- Navegador sin menú de compartir con archivos (p. ej. Chrome en el ordenador) o menú que
  falla: el archivo se descarga para enviarlo a mano (RF-13).
- Nombre de rutina con caracteres que no valen en un nombre de archivo: se sustituyen por
  `-` solo en el nombre del archivo; dentro va el nombre original (RF-13).
- Rutina sin ejercicios: RF-14.
- Nombre o títulos con caracteres especiales (`<`, `>`, `&`, comillas) en el archivo: se
  muestran tal cual, sin romper la página.

## Fuera de alcance
- Compartir varias rutinas a la vez, o todas.
- Compartir días asignados, Previo, pendientes o entrenamientos.
- Compartir por enlace, código QR o cualquier vía que no sea el archivo.
- Fotos por enlace en el archivo.
- Mantener la rutina importada sincronizada con la original.
- Sobrescribir o fusionar una rutina existente al importar.
- Ver el contenido del archivo antes de importarlo.
- Leer formatos de otras versiones del archivo.
- Todo lo que no esté en los RF de esta spec.

## Criterios de finalización
- Todos los RF cumplen su aceptación, verificada en Chrome (consola limpia, 375 px), salvo
  RF-1 y RF-4.
- RF-1 y RF-4 (menú de compartir y elegir archivo en el iPhone) se dan por buenos con la
  prueba en el iPhone del usuario (enviar un archivo y abrirlo en otra copia publicada de
  la app), fuera de la verificación en Chrome.
- RF-13 (descarga) se prueba en Chrome del ordenador abriendo la app con `file://`.
- La lógica pura (generar el archivo y su nombre, comprobar si es válido, resolver el
  nombre) tiene tests y `node --test` pasa en verde, también los de las specs anteriores.
