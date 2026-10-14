// Texto de la guía de mal de altura. Va aparte de la interfaz para poder
// revisarlo o corregirlo sin tocar el diseño. No resumir ni adornar.
// No incluir nombres de medicamentos ni dosis.
// El aviso corto que enlaza aquí vive en compartido/componentes/AvisoAltura.tsx.

export const SENALES_ALARMA = {
  titulo: 'Baja de inmediato si aparece alguno de estos signos',
  signos: [
    'Pérdida de coordinación o equilibrio, como caminar de forma inestable.',
    'Confusión, comportamiento extraño o somnolencia inusual.',
    'Dificultad para respirar estando en reposo.',
    'Tos persistente u opresión en el pecho.',
  ],
  advertencia:
    'Estos signos pueden indicar edema cerebral o pulmonar de altura, que ponen en riesgo la vida y avanzan en horas. La única medida efectiva es descender de inmediato y buscar atención médica. No esperes a ver si mejora. Nunca dejes sola a una persona con estos signos.',
};

export const MAL_AGUDO = {
  titulo: 'Síntomas comunes arriba de los 2,500 metros',
  sintomas: [
    'Dolor de cabeza.',
    'Náusea o vómito.',
    'Fatiga o debilidad fuera de lo normal.',
    'Mareo.',
    'Dificultad para dormir.',
  ],
  reglas:
    'Dos reglas simples: no sigas subiendo mientras tengas síntomas, y si empeoran, baja. La mayoría de los casos se resuelven al descender o al quedarse a la misma altura hasta aclimatarse.',
};

export const PREVENCION = {
  titulo: 'Cómo reducir el riesgo',
  consejos: [
    'Sube de forma gradual. Arriba de los 3,000 metros, evita dormir mucho más alto que la noche anterior.',
    'Considera una jornada de descanso cada dos o tres días de ascenso.',
    'Mantente bien hidratado.',
    'Evita el alcohol, sobre todo las primeras noches en altura.',
    'Si vienes de una ciudad baja y vas a subir rápido, el riesgo es mayor: date más tiempo.',
    'Si piensas usar algún medicamento preventivo, consúltalo con un médico antes del viaje.',
  ],
};

export const NOTA_AL_PIE =
  'Esta guía es informativa y no sustituye la valoración de un profesional de la salud. Ante cualquier duda sobre tu estado, desciende y busca atención médica.';
