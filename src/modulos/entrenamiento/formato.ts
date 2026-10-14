import type { Serie } from '../../compartido/tipos';

// Opciones fijas para que los ejercicios queden agrupados igual siempre.
export const GRUPOS_MUSCULARES = [
  'Piernas',
  'Glúteos',
  'Pecho',
  'Espalda',
  'Hombros',
  'Brazos',
  'Abdomen',
  'Cuerpo completo',
  'Cardio',
];

const kg = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 2 });

// { repeticiones: 10, pesoKg: 40 } → '10 rep con 40 kg'
export function formatearSerie({ repeticiones, pesoKg }: Serie): string {
  return pesoKg > 0 ? `${repeticiones} rep con ${kg(pesoKg)} kg` : `${repeticiones} rep sin peso`;
}

// Agrupa las series por ejercicio respetando el orden en que se hicieron.
export function agruparPorEjercicio(series: Serie[]): { ejercicioId: string; series: Serie[] }[] {
  const grupos = new Map<string, Serie[]>();
  for (const serie of series) {
    const lista = grupos.get(serie.ejercicioId) ?? [];
    lista.push(serie);
    grupos.set(serie.ejercicioId, lista);
  }
  return [...grupos].map(([ejercicioId, lista]) => ({ ejercicioId, series: lista }));
}
