# Spec 003 — Rediseño visual
Estado: Implementada (2026-10-28), pendiente de la prueba del usuario en el iPhone

## Contexto y objetivo
Las specs 001 (rutinas y entrenamiento) y 002 (ejercicios pendientes) están implementadas y
el usuario usa la app a diario en su iPhone, publicada en la web. Funciona, pero el aspecto
es el de un prototipo: fondo gris claro, tarjetas blancas y todos los botones iguales, así
que no se distingue de un vistazo qué hay que pulsar.

En palabras del usuario: "quiero que cambies todo la interfaz visual, mejorandomela. Para
ello quiero que te fijes en esta otra app: Liftoff". De Liftoff se toma solo el estilo:
tema oscuro, tarjetas muy redondeadas, un único color de acción (azul cielo) para el botón
principal, ese botón "en relieve", la tabla de series dentro de la tarjeta del ejercicio y
las fotos en círculo.

Es un cambio solo visual: las pantallas, los textos, los botones, los datos guardados y el
comportamiento de las specs 001 y 002 siguen igual. Las referencias "RF-x de la 001" y
"RF-x de la 002" apuntan a esas specs.

## Usuarios
Una sola persona (el dueño de la app), sobre todo desde Safari en el iPhone (también como
app añadida a la pantalla de inicio) y a veces desde el ordenador. Sin cuentas.

## Historias de usuario
- HU-1. Como usuario, quiero una interfaz oscura y cuidada, parecida a Liftoff, para que
  la app me resulte agradable de usar en el gimnasio.
- HU-2. Como usuario, quiero ver de un vistazo cuál es el botón principal de cada
  pantalla, para no tener que leerlos todos.
- HU-3. Como usuario, quiero leer cómodamente la tabla de series mientras entreno, para
  ver el Previo y lo que escribo sin esfuerzo.

## Definiciones
- **Paleta**: los únicos colores de la interfaz (salvo las fotos y lo que pinten los
  controles nativos, RF-23):
  - Fondo: #100E1C (página y cabecera).
  - Tarjeta: #1E1C2C.
  - Tabla (zona hundida dentro de la tarjeta): #15131F.
  - Texto: #F2F1F7.
  - Texto secundario: #8D8AA0.
  - Texto desactivado: #9693AA (solo para el texto de los botones desactivados).
  - Azul de acción: #6DB6F2, con su relieve #3F86C9.
  - Texto del botón principal: #100E1C.
  - Botón secundario: fondo #2C2A3D y texto #F2F1F7.
  - Botón secundario pulsado: fondo #242235 y texto #F2F1F7 (solo mientras se pulsa,
    RF-26).
  - Botón desactivado: fondo #2C2A3D y texto #9693AA.
  - Campos: fondo #100E1C y borde #8D8AA0.
  - Foco: contorno #6DB6F2.
  - Línea inferior de la cabecera: #2C2A3D.
  - Error: texto y borde #FF6B6B sobre el fondo #2A1620 (solo para errores).
  - Hecho: #6EE7A0 (solo para "✓ Hecho").
- **Botón principal**: el botón de acción de una pantalla. Hay como mucho uno visible por
  pantalla (ni el aviso del entrenamiento abierto ni el bloque de preguntas tienen botón
  principal). Fondo #6DB6F2, texto #100E1C, en relieve (borde inferior de 4 px en
  #3F86C9) y bordes redondeados de 12 px o más.
- **Botón secundario**: cualquier otro botón de la página, salvo las pestañas de la
  cabecera (RF-11) y el botón nativo del selector de foto (RF-23). Fondo #2C2A3D, texto
  #F2F1F7, sin relieve y con bordes redondeados de 12 px o más.
- **Botón desactivado**: un botón principal o secundario que no se puede pulsar. Fondo
  #2C2A3D, texto #9693AA, sin relieve ni efecto de hundirse.
- **Botones principales por pantalla**:
  - Semana (actual y siguiente): ninguno ("Ver" es secundario).
  - Rutinas: "Crear".
  - Editar rutina: "Añadir ejercicio" ("Guardar" del nombre es secundario).
  - Ejercicio (nuevo y editar): "Guardar" ("Cancelar" es secundario).
  - Día de la semana actual sin ningún entrenamiento abierto: "Empezar entrenamiento"
    (desactivado si la rutina no tiene ejercicios, RF-8).
  - Día cuyo entrenamiento está abierto (el entrenamiento abierto es de este día):
    "Terminar entrenamiento".
  - Día de la semana actual con el entrenamiento de otro día abierto: "Empezar
    entrenamiento", activo y azul como hoy; al pulsarlo avisa y lleva al entrenamiento
    abierto (RF-38 de la 001).
  - Día de la semana siguiente: ninguno.
- **Tarjeta**: bloque con fondo #1E1C2C y esquinas redondeadas de 16 px o más.
- **Contraste suficiente**: relación de contraste de 4,5:1 o más entre el texto y su fondo
  (3:1 para el contorno del foco y los bordes de los campos), según WCAG 2.1.

### Contrastes calculados (WCAG 2.1)
| Primer plano | Fondo | Uso | Relación | Mínimo | Cumple |
|---|---|---|---|---|---|
| #F2F1F7 | #100E1C | texto, aviso del entreno, campos | 16,98:1 | 4,5 | sí |
| #F2F1F7 | #1E1C2C | texto en tarjeta | 14,87:1 | 4,5 | sí |
| #F2F1F7 | #15131F | número de serie en la tabla | 16,33:1 | 4,5 | sí |
| #F2F1F7 | #2C2A3D | texto del botón secundario | 12,42:1 | 4,5 | sí |
| #F2F1F7 | #242235 | texto del botón secundario pulsado | 13,80:1 | 4,5 | sí |
| #8D8AA0 | #100E1C | texto secundario, pestañas inactivas, borde de campo | 5,70:1 | 4,5 | sí |
| #8D8AA0 | #1E1C2C | texto secundario y borde de campo en tarjeta | 4,99:1 | 4,5 | sí |
| #8D8AA0 | #15131F | Previo, títulos de columna, borde de KG/REPS | 5,48:1 | 4,5 | sí |
| #9693AA | #2C2A3D | texto del botón desactivado | 4,68:1 | 4,5 | sí |
| #100E1C | #6DB6F2 | texto del botón principal | 8,74:1 | 4,5 | sí |
| #6DB6F2 | #100E1C | pestaña activa, foco, borde de la pregunta | 8,74:1 | 3 | sí |
| #6DB6F2 | #1E1C2C | foco en tarjeta | 7,65:1 | 3 | sí |
| #6DB6F2 | #15131F | foco en la tabla | 8,41:1 | 3 | sí |
| #FF6B6B | #2A1620 | texto del aviso de error y de la celda con error | 6,13:1 | 4,5 | sí |
| #FF6B6B | #100E1C | borde del aviso de error | 6,87:1 | 3 | sí |
| #FF6B6B | #15131F | borde de la celda con error | 6,61:1 | 3 | sí |
| #6EE7A0 | #1E1C2C | "✓ Hecho" en la tarjeta de la Semana | 10,81:1 | 4,5 | sí |
| #6EE7A0 | #100E1C | "✓ Hecho" en la vista Día | 12,35:1 | 4,5 | sí |

La línea de la cabecera (#2C2A3D sobre #100E1C, 1,37:1) es decorativa y no tiene mínimo.
El texto desactivado (#9693AA, 4,68:1) queda muy por debajo del texto del botón secundario
(#F2F1F7, 12,42:1) sobre el mismo fondo, así que el botón desactivado se sigue viendo
apagado.

## Requisitos funcionales

### Toda la app
- RF-1: EL SISTEMA muestra todas las pantallas con el fondo #100E1C (en la página entera,
  también por encima y por debajo del contenido), el texto #F2F1F7 y los textos
  secundarios (series, Previo, mensajes de lista vacía, títulos de columna, etiquetas de
  los campos) en #8D8AA0.
  - Aceptación: en cada pantalla (Semana actual y siguiente, Rutinas, Editar rutina,
    Ejercicio nuevo y editar, Día sin y con entrenamiento abierto) el fondo de `html` y de
    `body` mide #100E1C y el texto principal #F2F1F7.
- RF-2: EL SISTEMA usa la fuente del sistema (en el iPhone, SF Pro) sin descargar ninguna
  fuente. Los títulos de pantalla miden 24 px o más y van en negrita (peso 700 o más); son
  solo dos: el del Día (por ejemplo, "martes 27/10") y el del formulario de ejercicio
  ("Nuevo ejercicio" / "Editar ejercicio"). Semana y Rutinas siguen sin título (no se
  añade texto). "Ejercicios", en Editar rutina, es un título de sección de 18 px en
  negrita. Los títulos de tarjeta (día, rutina, ejercicio) miden 18 px o más y van en
  negrita.
  - Aceptación: con la red de Chrome abierta, recargar la app; no se pide ningún archivo de
    fuente. El título del Día y el de "Nuevo ejercicio" miden 24 px o más con peso 700 o
    más; "Ejercicios" mide 18 px.
- RF-3: EL SISTEMA muestra el botón principal de cada pantalla con fondo #6DB6F2, texto
  #100E1C, borde inferior de 4 px en #3F86C9 y esquinas de 12 px o más, y ningún otro
  botón de esa pantalla lleva el azul de acción (no cuentan la pestaña activa de la
  cabecera, RF-11, ni el contorno de foco, RF-9).
  - Aceptación: en la vista Día de la semana actual, "Empezar entrenamiento" es azul con
    el borde inferior más oscuro y "Editar rutina" es gris oscuro.
  - Aceptación: en Rutinas, "Crear" es azul; "Editar" y "Borrar" de cada rutina son gris
    oscuro.
- RF-4: CUANDO el usuario pulsa el botón principal, EL SISTEMA lo muestra hundido mientras
  lo mantiene pulsado: el botón baja al menos 2 px y su borde inferior se reduce en la
  misma medida, de forma que lo que hay debajo no se mueve; al soltar vuelve a su sitio.
  El paso a hundido dura 0,1 s. Al tocar un botón en el iPhone no aparece el recuadro
  gris de toque del navegador.
  - Aceptación: en Chrome, mantener pulsado "Crear"; baja y el formulario y la lista no se
    mueven.
  - Aceptación: en Safari del iPhone, mantener el dedo sobre "Crear"; se ve hundido
    mientras se mantiene, sin recuadro gris, y vuelve a su sitio al soltar.
- RF-5: MIENTRAS el sistema operativo tiene activada la reducción de movimiento, EL
  SISTEMA muestra el estado hundido del botón principal sin transición (el cambio es
  instantáneo).
  - Aceptación: en Chrome, con `prefers-reduced-motion: reduce` emulado, mantener pulsado
    "Crear" sin soltar; se hunde sin transición.
- RF-6: EL SISTEMA muestra los botones secundarios con fondo #2C2A3D, texto #F2F1F7, sin
  el azul de acción (salvo el contorno de foco, RF-9) y con esquinas de 12 px o más. "Borrar" (de rutina y de ejercicio) es
  un secundario más, con el texto del mismo color que los demás (no rojo).
  - Aceptación: "Ver", "Editar", "Borrar", "Editar rutina", "Guardar" (del nombre de la
    rutina), "Cancelar", "Quitar", "+ Serie", "Continuar", "Añadir" y "No" tienen fondo
    #2C2A3D y texto #F2F1F7, y "Borrar" no es rojo.
- RF-7: EL SISTEMA define el color del texto y el color de fondo de todos los botones,
  también desactivados (texto #9693AA sobre #2C2A3D), de modo que ningún navegador ponga
  los suyos.
  - Aceptación: en Safari del iPhone, todos los botones de todas las pantallas (salvo el
    botón nativo del selector de foto, RF-23) muestran su texto con contraste suficiente sobre su fondo (ninguno sale blanco sobre claro ni
    oscuro sobre oscuro).
- RF-8: MIENTRAS un botón está desactivado ("Empezar entrenamiento" con una rutina sin
  ejercicios, RF-28 de la 001; "+ Serie" con la serie 20, RF-30 de la 001 y RF-12 de la
  002), EL SISTEMA lo muestra con fondo #2C2A3D, texto #9693AA, sin relieve y sin
  hundirse ni oscurecerse al pulsarlo, también en Safari. Con el entrenamiento de otro día abierto,
  "Empezar entrenamiento" no está desactivado (RF-17).
  - Aceptación: en un ejercicio del entrenamiento cuya última fila es la 20, "+ Serie"
    mide fondo #2C2A3D y texto #9693AA, y al pulsarlo no se hunde ni añade filas.
  - Aceptación: en la vista Día de una rutina sin ejercicios, "Empezar entrenamiento" mide
    fondo #2C2A3D y texto #9693AA, sin borde inferior azul; en Safari del iPhone se ve
    igual.
- RF-9: CUANDO el usuario llega a un botón, pestaña, campo o desplegable con el teclado,
  EL SISTEMA muestra un contorno de foco #6DB6F2.
  - Aceptación: en Chrome, recorrer con Tab la vista Rutinas; cada elemento enfocado lleva
    un contorno #6DB6F2.
- RF-10: EL SISTEMA muestra los avisos de error de la página (los de las specs 001 y 002,
  como "Peso no válido" o "Termina el entrenamiento antes de cambiar este día") con el
  texto #FF6B6B sobre el fondo #2A1620 y un borde de 1 px en #FF6B6B, en el mismo sitio
  en que salen hoy.
  - Aceptación: guardar un ejercicio sin título; el aviso aparece con texto y borde de 1 px
    #FF6B6B sobre fondo #2A1620, junto a "Guardar".

### Cabecera y pestañas
- RF-11: EL SISTEMA muestra la cabecera fija arriba con fondo #100E1C y una línea fina
  inferior #2C2A3D, y las pestañas "Esta semana", "Siguiente" y "Rutinas" como texto sin
  fondo de botón: la activa en #6DB6F2, en negrita y subrayada con una línea #6DB6F2 en
  todo el ancho del botón de la pestaña; las demás en #8D8AA0. Las pestañas no cambian al
  pulsarlas.
  - Aceptación: en la vista Semana actual, "Esta semana" es azul y subrayada de lado a
    lado; al pulsar "Rutinas", pasa a serlo "Rutinas" y "Esta semana" queda en gris.
  - Aceptación: en Editar rutina y en Ejercicio la pestaña activa sigue siendo "Rutinas".
- RF-12: MIENTRAS hay un entrenamiento abierto, EL SISTEMA muestra su aviso ("Entrenamiento
  del <día> sin terminar." y "Continuar", RF-37 de la 001) dentro de la cabecera, con el
  texto en #F2F1F7 sobre #100E1C y "Continuar" como botón secundario.
  - Aceptación: con un entrenamiento abierto, en Rutinas se ve el aviso arriba en #F2F1F7
    y "Continuar" lleva al entrenamiento.

### Semana
- RF-13: EL SISTEMA muestra cada día de la semana como una tarjeta con el nombre del día
  como título de tarjeta, "✓ Hecho" a la derecha en #6EE7A0 cuando toque, el desplegable
  de la rutina y "Ver" como botón secundario; "No hay rutina para este día." va en texto
  secundario. La vista Semana no tiene botón principal.
  - Aceptación: en Esta semana se ven 7 tarjetas de lunes a domingo; un día sin rutina
    muestra el mensaje en gris y un día hecho muestra "✓ Hecho" en verde #6EE7A0.

### Rutinas
- RF-14: EL SISTEMA muestra el formulario "Nueva rutina" con su etiqueta en texto
  secundario, el campo y "Crear" como botón principal, y debajo una tarjeta por rutina con
  su nombre como título de tarjeta y "Editar" y "Borrar" como botones secundarios.
  - Aceptación: con 3 rutinas, se ven 3 tarjetas con su nombre en negrita; un nombre de 50
    letras sin espacios se parte en varias líneas sin desbordar a 375 px.

### Editar rutina
- RF-15: EL SISTEMA muestra el formulario del nombre con "Guardar" como botón secundario,
  el título de sección "Ejercicios" (RF-2) y una tarjeta por ejercicio con su foto en un
  círculo de 56 px, su título en negrita y "<n> series" ("1 serie" en singular) en texto
  secundario debajo, con "Editar" y "Borrar" como botones secundarios; al final, "Añadir
  ejercicio" como botón principal a todo el ancho.
  - Aceptación: una rutina con "Sentadilla" (3 series) muestra la foto recortada en un
    círculo de 56 px sin deformarse, "Sentadilla" en negrita y "3 series" en gris;
    "Añadir ejercicio" es azul, en relieve y a todo el ancho.
  - Aceptación: una rutina sin ejercicios muestra "Esta rutina no tiene ejercicios. Añade
    el primero." en gris y "Añadir ejercicio" debajo.

### Ejercicio (nuevo y editar)
- RF-16: EL SISTEMA muestra el formulario con el título "Nuevo ejercicio" o "Editar
  ejercicio" como título de pantalla (RF-2), las etiquetas "Título", "Foto" y "Series" en
  texto secundario, los campos a todo el ancho con el estilo de RF-23, la vista previa de
  la foto con esquinas de 16 px, "Guardar" como botón principal y "Cancelar" como botón
  secundario.
  - Aceptación: en "Nuevo ejercicio", elegir una foto; la vista previa aparece con
    esquinas de 16 px y sin desbordar a 375 px. "Guardar" es azul en relieve y
    "Cancelar" gris.

### Día
- RF-17: EL SISTEMA muestra arriba el día como título de pantalla, "✓ Hecho" en #6EE7A0
  cuando toque y el nombre de la rutina en texto secundario; debajo, "Empezar
  entrenamiento" (o, si el entrenamiento abierto es de este día, "Terminar
  entrenamiento") a todo el ancho, y debajo de él "Editar rutina" como botón secundario a
  todo el ancho. En la semana siguiente "Editar rutina" va solo, a todo el ancho.
  - Aceptación: con "hoy" simulado en el miércoles 28/10/2026 y "Pierna" asignada a ese
    día, se ve "miércoles 28/10" grande y en negrita, "Pierna" en gris debajo,
    "Empezar entrenamiento" azul, en relieve y a todo el ancho, y "Editar rutina" gris y
    a todo el ancho debajo.
  - Aceptación: con el entrenamiento de este día abierto, "Terminar entrenamiento" es
    azul, en relieve y a todo el ancho, y es el único botón azul de la pantalla.
  - Aceptación: con "hoy" simulado en el miércoles 28/10/2026 y el entrenamiento del lunes
    26/10 abierto, en la vista Día del miércoles "Empezar entrenamiento" es azul, en
    relieve y se puede pulsar; al pulsarlo avisa y lleva al entrenamiento del lunes
    (RF-38 de la 001).
  - Aceptación: con "hoy" simulado en el miércoles 28/10/2026, en la vista Día del lunes
    2/11/2026 solo se ve "Editar rutina", gris y a todo el ancho.
- RF-18: EL SISTEMA muestra cada ejercicio como una tarjeta con una cabecera (foto en un
  círculo de 56 px, igual que en Editar rutina, y título en negrita) y debajo su tabla de
  series sobre la zona hundida #15131F, que ocupa la tarjeta de borde a borde, con los
  títulos de columna (Serie, Previo y, en el entrenamiento, KG y REPS) y los valores de
  Previo en #8D8AA0, y los números (número de serie, Previo y lo escrito en KG y REPS) a
  20 px o más; lo escrito en KG y REPS va en #F2F1F7.
  - Aceptación: en la vista Día sin entrenamiento, la tarjeta de "Sentadilla" tiene la foto
    recortada en un círculo de 56 px sin deformarse y el título arriba, y debajo, en una
    zona #15131F que llega a los dos bordes de la tarjeta, "Serie" y "Previo" en gris, los
    números 1, 2 y 3 grandes y los valores de Previo en gris; "–" en Previo si no hay peso.
- RF-19: MIENTRAS el entrenamiento del día está abierto, EL SISTEMA muestra los campos KG y
  REPS dentro de la tabla con el estilo de RF-23, "Quitar" en la última fila como botón
  secundario compacto (letra de 16 px, relleno de 6 px arriba y abajo y de 10 px a los
  lados) y "+ Serie" como botón secundario debajo de la tabla, y la tabla cabe en 375 px
  sin desplazamiento horizontal.
  - Aceptación: con el entrenamiento abierto, a 375 px de ancho, la tabla de un ejercicio
    con 3 series muestra Serie / Previo / KG / REPS y "Quitar" en la fila 3 sin barra de
    desplazamiento horizontal; escribir 102,5 en KG se ve entero.
- RF-20: SI al pulsar "Terminar entrenamiento" un campo tiene un valor no válido (RF-32 de
  la 001, RF-12 de la 002), ENTONCES EL SISTEMA lo señala con un borde de 2 px en
  #FF6B6B, el fondo #2A1620 y el texto #FF6B6B.
  - Aceptación: escribir "-5" en KG de la serie 1 y pulsar "Terminar entrenamiento"; ese
    campo queda con borde de 2 px y texto #FF6B6B sobre #2A1620, y el resto no.
- RF-21: MIENTRAS se ve el bloque de preguntas de pendientes (RF-5 de la 002), EL SISTEMA
  lo muestra en el mismo sitio (debajo de los botones del día y antes de la primera
  tarjeta) como una tarjeta con un borde de 2 px en azul de acción #6DB6F2 que la
  distingue de las de los ejercicios, con la pregunta en #F2F1F7 y "Añadir" y "No" como botones
  secundarios.
  - Aceptación: con "Sentadilla" pendiente, empezar un entrenamiento; la pregunta se ve
    antes de la primera tarjeta, con borde azul, "Añadir" y "No" grises, y se puede
    escribir en las tablas sin responder. El único botón azul de la pantalla sigue siendo
    "Terminar entrenamiento".
- RF-22: SI la rutina del día no tiene ejercicios, ENTONCES EL SISTEMA muestra "Esta rutina
  no tiene ejercicios. Añade el primero." en texto secundario (RF-19 de la 001).
  - Aceptación: en la vista Día de una rutina vacía se ve el mensaje en gris.

### Campos y controles nativos
- RF-23: EL SISTEMA muestra los campos de texto (KG y REPS del entrenamiento y los de los
  formularios) con fondo #100E1C, texto #F2F1F7 y borde #8D8AA0. El desplegable del día y
  el selector de foto conservan su aspecto nativo en oscuro (RF-24), sin quitarles la
  flecha ni redibujar sus flechas, botones o iconos; si iOS los pinta a su manera, se
  acepta.
  - Aceptación: en Rutinas, el campo "Nueva rutina" tiene fondo #100E1C, texto #F2F1F7 y
    borde #8D8AA0; con el entrenamiento abierto, los campos KG y REPS se ven igual sobre
    la zona hundida.
  - Aceptación: en Safari del iPhone, el desplegable del día y el selector de foto se leen
    sobre el fondo oscuro y el desplegable conserva su flecha.
- RF-24: EL SISTEMA declara la página como oscura (`<meta name="color-scheme"
  content="dark">`) y su color de barra (`<meta name="theme-color" content="#100E1C">`),
  de modo que el navegador muestre en oscuro los controles nativos y, si lo admite, pinte
  su barra del color #100E1C. La app añadida a la pantalla de inicio se abre como hoy: no
  a pantalla completa, sin barra de estado translúcida y sin manifiesto.
  - Aceptación: en `index.html` están las dos metas con esos valores; en Safari del iPhone,
    al abrir el desplegable del día la lista se ve en oscuro.
  - Aceptación: si alguna versión de Safari no tiñe la barra con #100E1C, no es un fallo.

### Pulsar y pasar el puntero
- RF-25: EL SISTEMA no cambia el aspecto de ningún botón, pestaña ni campo al pasar el
  puntero por encima.
  - Aceptación: en Chrome, pasar el ratón sobre "Crear", "Editar" y "Rutinas"; no cambian.
- RF-26: MIENTRAS el usuario mantiene pulsado un botón secundario activo, EL SISTEMA
  muestra su fondo en #242235 (texto #F2F1F7), sin moverlo y sin transición; al soltar
  vuelve a #2C2A3D. El hundimiento sigue siendo solo del botón principal (RF-4).
  - Aceptación: en Chrome, mantener pulsado "Editar" de una rutina; su fondo mide #242235,
    no se mueve nada y al soltar vuelve a #2C2A3D.
  - Aceptación: en Safari del iPhone, mantener el dedo sobre "Editar"; se ve más oscuro
    mientras se mantiene (gracias al `touchstart` de RF-4), sin recuadro gris.

## Requisitos no funcionales
- RNF-1: Todo texto tiene contraste suficiente sobre su fondo, también el texto del botón
  principal sobre el azul, el texto secundario sobre la tarjeta y sobre la zona hundida,
  y el texto de los botones desactivados (#9693AA sobre #2C2A3D, 4,68:1; ver la tabla de
  contrastes).
- RNF-2: A 375 px de ancho ninguna pantalla tiene desplazamiento horizontal (RNF-1 de la
  001), también con nombres y títulos de 50 letras sin espacios.
- RNF-3: Los campos (texto, desplegable, archivo) y "Quitar" miden 16 px o más de letra,
  así el iPhone no amplía la pantalla al tocarlos (RNF-2 de la 001).
- RNF-4: En Safari del iPhone y como app de la pantalla de inicio no aparecen franjas
  blancas al hacer rebote arriba o abajo (RF-1, RF-24).
  - Prueba: en Safari del iPhone, en la Semana, arrastrar más allá del principio y del
    final de la página; la zona que asoma es #100E1C, no blanca.
- RNF-5: Sin fuentes, imágenes ni archivos descargados de internet; la app sigue
  funcionando sin conexión (RNF-4 de la 001).
- RNF-6: No cambian los datos guardados (misma estructura, nada se borra ni se migra), ni
  la lógica de cálculo, ni el comportamiento de ningún RF de las specs 001 y 002. Los 84
  tests existentes siguen pasando sin modificarlos. En `app.js` solo se permite: añadir
  clases al marcado de las funciones `html*` sin cambiar su lógica, y una línea con un
  listener `touchstart` vacío para que iOS aplique el estado pulsado (RF-4, RF-26). En
  `index.html` solo se añaden las dos metas de RF-24.
- RNF-7: Todos los textos siguen en español y son los mismos que hoy (no se añade, quita
  ni cambia ningún texto ni icono).
- RNF-8: Las pantallas en el ordenador siguen limitadas a un ancho de lectura cómodo y
  centradas, como hoy.

## Casos límite
- Nombre de rutina o título de ejercicio de 50 letras sin espacios: se parte en varias
  líneas dentro de su tarjeta, sin desbordar (RNF-2).
- Foto vertical, horizontal o muy alargada: el círculo de 56 px la recorta sin
  deformarla (RF-15, RF-18).
- 20 series en un ejercicio del entrenamiento: "+ Serie" desactivado (RF-8) y la tabla
  cabe en 375 px (RF-19).
- Una sola serie: no hay "Quitar" (RF-30 de la 001) y la tabla mantiene sus columnas.
- Peso largo en KG ("102,5") o REPS de 3 cifras: se ve entero en el campo (RF-19).
- Varios campos con error a la vez: todos señalados (RF-20) y un solo aviso arriba.
- Rutina sin ejercicios: "Empezar entrenamiento" desactivado (RF-8) y mensaje en gris
  (RF-22).
- Semana siguiente: la vista Día no tiene "Empezar entrenamiento" (RF-27 de la 001); solo
  "Editar rutina", secundario y a todo el ancho (RF-17).
- Entrenamiento de otro día abierto y vista Día de un día de la semana actual: "Empezar
  entrenamiento" sigue activo y azul; al pulsarlo avisa y lleva al entrenamiento abierto
  (RF-38 de la 001, RF-17).
- Entrenamiento abierto y bloque de preguntas a la vez: el aviso del entrenamiento en la
  cabecera, la pregunta y "Terminar entrenamiento" se distinguen entre sí (RF-12, RF-21).
- Texto con caracteres especiales (`<`, `>`, `&`, comillas): se muestra tal cual.
- Reducción de movimiento activada: los botones se hunden sin transición (RF-5).
- Tocar un campo en el iPhone: no se amplía la pantalla (RNF-3).
- Desplegable del día y selector de foto: controles nativos en oscuro; si iOS los pinta a
  su manera, se acepta (RF-23, RF-24).
- Safari que no tiñe la barra con theme-color: se acepta (RF-24).

## Fuera de alcance
- Niveles, rachas, monedas, rangos, nutrición, amigos, perfil y compartir rutinas.
- Menús de tres puntos, carpetas, botón "+" en la cabecera, flecha de volver y la barra
  inferior de secciones de Liftoff.
- Mostrar en Rutinas la lista de ejercicios de cada rutina, el total de series o "Y n
  más…", y el botón "INICIAR" en cada rutina.
- Títulos o textos nuevos como "Contenido del entreno" y el icono ▶ en "Empezar
  entrenamiento".
- Cualquier funcionalidad nueva, cambio de comportamiento, de datos o de textos.
- Tema claro o selector de tema; modo horizontal específico; animaciones distintas del
  hundido del botón principal; estados al pasar el puntero (RF-25).
- Fuentes descargadas (Google Fonts u otras) e iconos de librerías.
- App a pantalla completa, barra de estado translúcida y manifiesto web (RF-24).
- Redibujar el desplegable o el selector de foto (`appearance: none`, flechas o iconos
  propios) (RF-23).

## Criterios de finalización
- Todos los RF cumplen su aceptación, verificada en Chrome (consola limpia, 375 px, y
  `prefers-reduced-motion` emulado para RF-5).
- `node --test` pasa en verde con los 84 tests existentes sin modificarlos.
- Tras la validación del reviewer, se publica en GitHub Pages (push a main) y el usuario
  lo prueba en su iPhone (RF-4, RF-23, RF-24 y RNF-4, y las aceptaciones de Safari de
  RF-7, RF-8 y RF-26), en la web y como app de la pantalla de inicio, antes de dar la spec
  por cerrada.

## Dudas resueltas
Resueltas el 2026-10-28, confirmado por el usuario (se aceptan las recomendaciones):
- DA-1. Botón principal: Día con entrenamiento abierto, "Terminar entrenamiento"; Ejercicio,
  "Guardar" ("Cancelar" gris); bloque de preguntas, "Añadir" y "No" grises con borde azul;
  Semana, ninguno. → Definiciones, RF-13, RF-16, RF-17, RF-21.
- DA-2. "Continuar" del aviso, secundario gris. → RF-6, RF-12.
- DA-3. Campos con fondo oscuro, texto claro y borde de 3:1. → RF-23 (y RF-16, RF-19).
- DA-4. La página se declara oscura. → RF-24, RNF-4.
- DA-5. No se añade nada nuevo de Liftoff. → RNF-7, Fuera de alcance.
- DA-6. "✓ Hecho" en verde #6EE7A0 (unos 10,8:1 sobre #1E1C2C). → Paleta, RF-13, RF-17.
- DA-7. Foto de la tarjeta del Día en círculo. → RF-18.
- DA-8. "Borrar" secundario gris; el rojo solo para errores. → Paleta, RF-6.
- Valores fijados confirmados: títulos de pantalla de 24 px o más con peso 700 y de
  tarjeta de 18 px o más; números de la tabla de 20 px o más; esquinas de 16 px o más en
  tarjetas y de 12 px o más en botones; relieve de 4 px que baja al menos 2 px; contraste
  de 4,5:1 para el texto y de 3:1 para el foco y los bordes.

Tras la primera revisión QA, resueltas el 2026-10-28, confirmado por el usuario:
- DA-9. Colores nuevos: secundario #2C2A3D / #F2F1F7; campos #100E1C con borde #8D8AA0;
  foco #6DB6F2; error #FF6B6B sobre #2A1620 (aviso con borde de 1 px, celda con borde de
  2 px); texto del principal #100E1C. → Paleta, RF-3, RF-6, RF-9, RF-10, RF-20, RF-23.
- DA-10. Cabecera #100E1C con línea inferior #2C2A3D; pestaña activa subrayada en todo su
  ancho; texto del aviso en #F2F1F7. Las pestañas y el botón nativo del selector de foto
  no son botones secundarios. → Definiciones, RF-11, RF-12.
- DA-11. La app de la pantalla de inicio se abre como hoy (sin pantalla completa, sin
  barra translúcida, sin manifiesto); en `index.html`, metas color-scheme dark y
  theme-color #100E1C; fondo #100E1C también en `html`; si Safari no tiñe la barra, se
  acepta. → RF-1, RF-24, RNF-4, RNF-6.
- DA-12. Una línea en `app.js` con un listener `touchstart` vacío y sin recuadro de toque;
  RF-4 se verifica también en el iPhone. → RF-4, RNF-6.
- DA-13. Desplegable y selector de foto nativos en oscuro, sin `appearance: none` ni
  flechas o iconos propios. → RF-23, Fuera de alcance.
- DA-14. Desactivados: fondo #2C2A3D, texto #8D8AA0 (sustituido por #9693AA en DP-1), sin relieve ni hundido, con el color
  definido también para el estado desactivado. → Paleta, RF-7, RF-8.
- DA-15. Títulos de pantalla solo en el Día y en el formulario de ejercicio; Semana y
  Rutinas sin título; "Ejercicios" es título de sección de 18 px. → RF-2.
- DA-16. "Editar rutina" debajo de Empezar/Terminar, a todo el ancho y gris (también solo
  en la semana siguiente); "Terminar entrenamiento" es principal solo si el entrenamiento
  abierto es de este día. → Definiciones, RF-17.
- DA-17. Tabla: Previo en #8D8AA0, KG y REPS en #F2F1F7; zona hundida de borde a borde;
  "Quitar" secundario compacto; sin scroll horizontal a 375 px. → RF-18, RF-19, RNF-3.
- DA-18. Se pueden añadir clases al marcado de las funciones `html*` sin tocar la lógica;
  transición de 0,1 s y sin transición con reducción de movimiento; fotos en círculo de
  56 px; vista previa con esquinas de 16 px; sin estados al pasar el puntero; "✓ Hecho"
  cumple también sobre #100E1C; RF-17 se valida con "hoy" simulado; "sin destellos" se
  sustituye por una prueba de rebote concreta. → RF-4, RF-5, RF-15 a RF-18, RF-25,
  RNF-4, RNF-6.

Tras la segunda ronda de dudas, resueltas el 2026-10-28, confirmado por el usuario:
- DP-1. El texto del botón desactivado pasa de #8D8AA0 (4,17:1) a #9693AA, el mismo tono
  algo más claro: 4,68:1 sobre #2C2A3D, muy por debajo de #F2F1F7 (12,42:1), así que se
  sigue viendo apagado. El texto secundario general sigue en #8D8AA0. → Paleta,
  Definiciones, tabla de contrastes, RF-7, RF-8, RNF-1.
- DP-2. Con el entrenamiento de otro día abierto, "Empezar entrenamiento" se queda como
  hoy: activo, botón principal azul y, al pulsarlo, avisa y lleva al entrenamiento abierto
  (RF-38 de la 001). No cambia ningún comportamiento. → Definiciones, RF-8, RF-17, Casos
  límite.

Tras la segunda revisión QA, resueltas el 2026-10-28, confirmado por el usuario:
- DA-19. Los números de la tabla se fijan en 20 px o más (caben a 375 px: unos 326 de
  343 px). Si en la práctica no cupieran, se pregunta al usuario. → RF-18, RF-19, DA-17.
- DA-20. Los botones secundarios se oscurecen a #242235 mientras se pulsan (13,80:1 con
  #F2F1F7), sin moverse ni transición; el hundimiento sigue siendo solo del principal; las
  pestañas no cambian al pulsarlas. → Paleta, tabla de contrastes, RF-8, RF-11, RF-26,
  RNF-6.
- DA-21. Tras la validación del reviewer se publica en GitHub Pages (push a main) y el
  usuario lo prueba en su iPhone antes de dar la spec por cerrada. → Criterios de
  finalización.
