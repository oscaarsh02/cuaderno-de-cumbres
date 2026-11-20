import type { ArticuloEquipo, Categoria, Ejercicio, Montana } from './tipos';

// Datos que se cargan solos la primera vez. Los id son fijos para que un respaldo
// importado siga apuntando a lo mismo en cualquier dispositivo.

export const MONTANAS_PRECARGADAS: Montana[] = [
  { id: 'pico-de-orizaba', nombre: 'Pico de Orizaba', latitud: 19.0303, longitud: -97.2685, altitud: 5636, precargada: true },
  { id: 'iztaccihuatl', nombre: 'Iztaccíhuatl', latitud: 19.1789, longitud: -98.6422, altitud: 5230, precargada: true },
  { id: 'nevado-de-toluca', nombre: 'Nevado de Toluca', latitud: 19.1083, longitud: -99.7583, altitud: 4680, precargada: true },
  { id: 'la-malinche', nombre: 'La Malinche', latitud: 19.2311, longitud: -98.0319, altitud: 4461, precargada: true },
  { id: 'cofre-de-perote', nombre: 'Cofre de Perote', latitud: 19.4925, longitud: -97.1503, altitud: 4282, precargada: true },
  { id: 'cerro-tlaloc', nombre: 'Cerro Tláloc', latitud: 19.4108, longitud: -98.7128, altitud: 4120, precargada: true },
  { id: 'ajusco', nombre: 'Ajusco', latitud: 19.2083, longitud: -99.2583, altitud: 3930, precargada: true },
];

// [nombre, peso aproximado en gramos]. El id sale de la posición dentro de la
// categoría: no reordenar ni insertar en medio, solo agregar al final.
const EQUIPO_BASICO_POR_CATEGORIA: Record<Categoria, [nombre: string, pesoGramos: number][]> = {
  abrigo: [
    ['Chamarra impermeable', 400],
    ['Chamarra de pluma o térmica', 600],
    ['Primera capa térmica', 250],
    ['Pantalón de montaña', 450],
    ['Guantes', 100],
    ['Gorro', 60],
    ['Calcetines de repuesto', 80],
  ],
  tecnico: [
    ['Botas de montaña', 1600],
    ['Bastones', 500],
    ['Lámpara frontal con pilas', 100],
    ['Lentes de sol', 30],
    ['Casco', 350],
    ['Crampones', 900],
    ['Piolet', 500],
  ],
  campamento: [
    ['Mochila', 1500],
    ['Casa de campaña', 2200],
    ['Bolsa de dormir', 1200],
    ['Aislante', 400],
    ['Estufa y gas', 600],
  ],
  comida: [
    ['Agua (al menos 2 litros)', 2000],
    ['Botanas energéticas', 300],
    ['Comida del día', 600],
  ],
  botiquin: [
    ['Botiquín de primeros auxilios', 300],
    ['Bloqueador solar', 100],
    ['Medicamentos personales', 50],
    ['Papel higiénico', 50],
  ],
  otros: [
    ['Identificación', 10],
    ['Teléfono con batería cargada', 200],
    ['Batería portátil', 250],
    ['Silbato', 10],
    ['Dinero en efectivo', 20],
  ],
};

export const EQUIPO_PRECARGADO: ArticuloEquipo[] = Object.entries(EQUIPO_BASICO_POR_CATEGORIA).flatMap(
  ([categoria, articulos]) =>
    articulos.map(([nombre, pesoGramos], i) => ({
      id: `basico-${categoria}-${i + 1}`,
      nombre,
      categoria: categoria as Categoria,
      empacado: false,
      pesoGramos,
    })),
);

// Los grupos deben coincidir con GRUPOS_MUSCULARES del módulo de entrenamiento.
// Sin cardio: una sesión se registra en repeticiones y kilos.
// Incluye los que más ayudan en montaña: piernas, espalda baja y tronco.
const EJERCICIOS_BASICOS_POR_GRUPO: Record<string, [id: string, nombre: string][]> = {
  Piernas: [
    ['sentadilla', 'Sentadilla'],
    ['prensa-de-piernas', 'Prensa de piernas'],
    ['zancadas', 'Zancadas'],
    ['subida-al-cajon', 'Subida al cajón'],
    ['peso-muerto-rumano', 'Peso muerto rumano'],
    ['elevacion-de-talones', 'Elevación de talones'],
  ],
  Glúteos: [['empuje-de-cadera', 'Empuje de cadera']],
  Pecho: [
    ['press-de-banca', 'Press de banca'],
    ['lagartijas', 'Lagartijas'],
  ],
  Espalda: [
    ['peso-muerto', 'Peso muerto'],
    ['remo-con-barra', 'Remo con barra'],
    ['jalon-al-pecho', 'Jalón al pecho'],
    ['dominadas', 'Dominadas'],
  ],
  Hombros: [
    ['press-militar', 'Press militar'],
    ['elevaciones-laterales', 'Elevaciones laterales'],
  ],
  Brazos: [
    ['curl-de-biceps', 'Curl de bíceps'],
    ['extension-de-triceps', 'Extensión de tríceps'],
  ],
  Abdomen: [
    ['abdominales', 'Abdominales'],
    ['elevacion-de-piernas', 'Elevación de piernas'],
  ],
  'Cuerpo completo': [['burpees', 'Burpees']],
};

// Fotos en public/ejercicios/, tomadas de free-exercise-db (dominio público) y
// convertidas a WebP. Los que no están aquí no tienen equivalente claro en ese catálogo.
const CON_FOTOS = new Set([
  'sentadilla', 'prensa-de-piernas', 'zancadas', 'subida-al-cajon', 'peso-muerto-rumano',
  'elevacion-de-talones', 'empuje-de-cadera', 'press-de-banca', 'lagartijas', 'peso-muerto',
  'remo-con-barra', 'jalon-al-pecho', 'dominadas', 'press-militar', 'elevaciones-laterales',
  'curl-de-biceps', 'extension-de-triceps', 'abdominales', 'elevacion-de-piernas',
]);

// Cada descripción: cómo se hace, qué trabaja, un error común y, si aplica, para qué sirve en montaña.
// Deben coincidir con lo que muestran las fotos.
const DESCRIPCIONES: Record<string, string> = {
  sentadilla:
    'Con la barra apoyada en la parte alta de la espalda, párate con los pies al ancho de los hombros y baja como si fueras a sentarte en una silla, manteniendo la espalda recta y el pecho arriba. Baja hasta que los muslos queden paralelos al suelo y sube empujando con los talones. Trabaja principalmente los muslos y los glúteos. El error más común es dejar que las rodillas se metan hacia adentro al subir. Para montaña es el ejercicio base: es el mismo movimiento que haces al subir escalones con la mochila cargada.',
  'prensa-de-piernas':
    'Siéntate en la máquina con la espalda bien apoyada en el respaldo y los pies en la plataforma, separados al ancho de los hombros. Baja la plataforma doblando las rodillas hasta que formen un ángulo recto y empújala de regreso sin llegar a estirar las piernas por completo. Trabaja principalmente la parte delantera de los muslos y los glúteos. El error más común es bajar tanto que la cadera se despega del asiento y la espalda baja se dobla. Para montaña fortalece las piernas para las subidas largas sin cargar peso sobre la espalda.',
  zancadas:
    'Con una mancuerna en cada mano y los brazos colgando a los lados, da un paso largo hacia adelante. Baja la cadera hasta que la rodilla de atrás quede cerca del suelo y la de adelante forme un ángulo recto; luego empuja con el pie de adelante para regresar y cambia de pierna. Trabaja principalmente los muslos y los glúteos. El error más común es inclinar el torso hacia adelante en lugar de bajar recto. Para montaña mejora el equilibrio sobre una sola pierna, como al pasar entre rocas o bajar escalones altos.',
  'subida-al-cajon':
    'Párate frente a un banco o cajón firme con una mancuerna en cada mano. Apoya un pie completo arriba y empuja con esa pierna hasta quedar de pie sobre el cajón; luego baja despacio, un pie y después el otro, y repite empezando con la otra pierna. Trabaja principalmente los muslos y los glúteos. El error más común es impulsarse con la pierna que se queda abajo en lugar de hacer la fuerza con la de arriba. Para montaña es de los más parecidos a la realidad: imita cada paso de una subida empinada.',
  'peso-muerto-rumano':
    'De pie, con la barra frente a los muslos y las rodillas ligeramente dobladas, lleva la cadera hacia atrás mientras la barra baja pegada a las piernas. Baja hasta sentir que se estira la parte trasera del muslo, más o menos a la altura de las rodillas, y regresa empujando la cadera hacia adelante. Trabaja principalmente la parte trasera del muslo y los glúteos. El error más común es redondear la espalda para llegar más abajo. Para montaña ayuda a controlar las bajadas y a sostener el cuerpo inclinado hacia adelante con la mochila puesta.',
  'elevacion-de-talones':
    'De pie, con la punta de los pies sobre un escalón o la plataforma de la máquina y los talones al aire, sube lo más alto que puedas sobre las puntas. Sostén un momento arriba y baja despacio hasta que los talones queden un poco por debajo del escalón. Trabaja principalmente las pantorrillas. El error más común es rebotar abajo y hacer el movimiento rápido y corto. Para montaña fortalece las pantorrillas y los tobillos, que trabajan en cada paso en terreno empinado.',
  'empuje-de-cadera':
    'Siéntate en el suelo con la parte alta de la espalda apoyada en el borde de un banco, la barra sobre la cadera y los pies firmes en el suelo. Empuja con los talones y sube la cadera hasta que el cuerpo quede recto de los hombros a las rodillas; aprieta los glúteos arriba y baja con control. Trabaja principalmente los glúteos. El error más común es arquear la espalda baja al subir en lugar de terminar el movimiento con los glúteos. Para montaña los glúteos son el motor de cada subida, sobre todo con mochila.',
  'press-de-banca':
    'Acuéstate en el banco con los ojos debajo de la barra y los pies firmes en el suelo. Toma la barra con las manos un poco más abiertas que los hombros, bájala con control hasta tocar la parte media del pecho y empújala hacia arriba hasta estirar los brazos. Trabaja principalmente el pecho, además de los hombros y la parte trasera del brazo. El error más común es rebotar la barra en el pecho o despegar la cadera del banco al empujar.',
  lagartijas:
    'Apoya las manos en el suelo un poco más abiertas que los hombros y estira las piernas hacia atrás, de modo que el cuerpo forme una línea recta de la cabeza a los talones. Baja doblando los codos hasta que el pecho quede cerca del suelo y empuja para regresar. Si cuestan mucho, puedes hacerlas con las rodillas apoyadas. Trabaja principalmente el pecho, los hombros y la parte trasera del brazo. El error más común es dejar que la cadera se hunda o se levante.',
  'peso-muerto':
    'Párate con la barra sobre la mitad de los pies, dobla la cadera y las rodillas y tómala con las manos justo por fuera de las piernas. Con la espalda recta y el pecho arriba, levanta la barra empujando el suelo con las piernas, manteniéndola pegada al cuerpo hasta quedar de pie. Bájala por el mismo camino llevando la cadera hacia atrás. Trabaja principalmente la espalda baja, los glúteos y la parte trasera del muslo. El error más común es redondear la espalda al levantar la barra. Para montaña enseña a levantar peso del suelo con buena postura, como al subir la mochila a la espalda.',
  'remo-con-barra':
    'De pie, con la barra en las manos, dobla un poco las rodillas e inclina el torso hacia adelante desde la cadera, con la espalda recta. Jala la barra hacia la parte baja del pecho llevando los codos hacia atrás, aprieta la espalda y bájala con control. Trabaja principalmente la parte media de la espalda y la parte trasera de los hombros. El error más común es enderezar el torso y dar tirones para mover la barra. Para montaña fortalece la espalda que te mantiene derecho con la mochila durante horas.',
  'jalon-al-pecho':
    'Siéntate en la máquina con los muslos sujetos bajo los soportes y toma la barra con las manos bien abiertas. Inclínate apenas hacia atrás y jala la barra hasta la parte alta del pecho llevando los codos hacia abajo; regresa despacio hasta estirar los brazos. Trabaja principalmente los costados de la espalda. El error más común es echarse muy atrás y usar el impulso del cuerpo en lugar de la fuerza de la espalda. Es la mejor preparación si todavía no te salen las dominadas.',
  dominadas:
    'Cuélgate de una barra con las manos un poco más abiertas que los hombros y las palmas hacia el frente. Jala el cuerpo hacia arriba llevando los codos hacia abajo hasta que la barbilla pase la barra, y baja despacio hasta estirar los brazos. Trabaja principalmente los costados de la espalda y la parte delantera del brazo. El error más común es columpiar las piernas para subir con impulso. Para montaña da fuerza para trepar en tramos donde hay que jalarse con las manos.',
  'press-militar':
    'De pie, con los pies al ancho de la cadera, sostén la barra a la altura de los hombros con las manos un poco más abiertas que ellos. Empújala hacia arriba hasta estirar los brazos sobre la cabeza y bájala con control hasta la altura de la barbilla. Trabaja principalmente los hombros y la parte trasera del brazo. El error más común es arquear mucho la espalda baja para empujar; aprieta el abdomen y los glúteos para evitarlo.',
  'elevaciones-laterales':
    'De pie, con una mancuerna en cada mano y los brazos a los lados, sube los brazos hacia los costados con los codos un poco doblados hasta que queden a la altura de los hombros. Baja despacio a la posición inicial. Trabaja principalmente la parte lateral de los hombros. El error más común es usar demasiado peso y columpiar el cuerpo o subir los hombros hacia las orejas.',
  'curl-de-biceps':
    'De pie, con una mancuerna en cada mano, los brazos estirados y las palmas mirando hacia tu cuerpo, dobla los codos para subir las mancuernas hacia los hombros, girando las muñecas para que las palmas queden hacia ti al final. Baja despacio hasta estirar los brazos. Trabaja principalmente la parte delantera del brazo. El error más común es columpiar el cuerpo o mover los codos hacia adelante para subir el peso.',
  'extension-de-triceps':
    'De pie, sostén una mancuerna con una mano detrás de la cabeza, con el codo apuntando hacia arriba. Sin mover el codo, estira el brazo hasta que la mancuerna quede arriba de la cabeza y bájala despacio a la posición inicial; luego cambia de brazo. Trabaja principalmente la parte trasera del brazo. El error más común es dejar que el codo se abra hacia el lado o se vaya hacia adelante. Para montaña fortalece los brazos para empujar con los bastones en las subidas.',
  abdominales:
    'Acuéstate boca arriba con las rodillas dobladas, los pies en el suelo y las manos cruzadas sobre el pecho o detrás de la cabeza. Despega los hombros del suelo apretando el abdomen, como si quisieras acercar las costillas a la cadera, y baja despacio. Trabaja principalmente el abdomen. El error más común es jalar la cabeza con las manos, lo que fuerza el cuello. Para montaña un abdomen fuerte ayuda a mantener la postura con la mochila en terreno disparejo.',
  'elevacion-de-piernas':
    'Acuéstate boca arriba en un banco con las piernas estiradas y sujétate del borde del banco con las manos. Sube las piernas juntas hasta que apunten al techo y bájalas despacio hasta que queden casi horizontales, sin dejarlas caer. Trabaja principalmente la parte baja del abdomen. El error más común es arquear la espalda baja al bajar las piernas; mantenla pegada al banco. Para montaña ayuda a levantar bien los pies al pasar sobre rocas y raíces.',
  burpees:
    'De pie, agáchate y apoya las manos en el suelo frente a los pies. Lanza los pies hacia atrás hasta quedar en posición de lagartija, regresa los pies junto a las manos de un salto y levántate con un pequeño brinco con los brazos arriba. Trabaja todo el cuerpo, en especial las piernas, el pecho y los hombros. El error más común es dejar que la cadera se hunda al quedar en posición de lagartija. Para montaña mejora la resistencia en esfuerzos cortos e intensos, como un tramo muy empinado.',
};

export const EJERCICIOS_PRECARGADOS: Ejercicio[] = Object.entries(EJERCICIOS_BASICOS_POR_GRUPO).flatMap(
  ([grupoMuscular, ejercicios]) =>
    ejercicios.map(([id, nombre]) => ({
      id: `basico-ejercicio-${id}`,
      nombre,
      grupoMuscular,
      descripcion: DESCRIPCIONES[id],
      ...(CON_FOTOS.has(id) && { imagenes: [`/ejercicios/${id}-0.webp`, `/ejercicios/${id}-1.webp`] }),
    })),
);
