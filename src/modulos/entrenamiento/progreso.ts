import type { Sesion } from '../../compartido/tipos';

export interface PuntoProgreso {
  fecha: string; // 'YYYY-MM-DD'
  tiempo: number; // milisegundos, para que la gráfica respete la distancia entre fechas
  pesoMaxKg: number;
}

// RF-19: el peso más alto que se levantó en cada día que se hizo el ejercicio.
// Si hubo dos sesiones el mismo día, cuenta la mayor. Las series sin peso no cuentan.
export function progresoDeEjercicio(sesiones: Sesion[], ejercicioId: string): PuntoProgreso[] {
  const maximoPorFecha = new Map<string, number>();
  for (const sesion of sesiones) {
    for (const serie of sesion.series) {
      if (serie.ejercicioId !== ejercicioId || serie.pesoKg <= 0) continue;
      maximoPorFecha.set(sesion.fecha, Math.max(maximoPorFecha.get(sesion.fecha) ?? 0, serie.pesoKg));
    }
  }

  return [...maximoPorFecha]
    .map(([fecha, pesoMaxKg]) => {
      const [anio, mes, dia] = fecha.split('-').map(Number);
      return { fecha, tiempo: Date.UTC(anio, mes - 1, dia), pesoMaxKg };
    })
    .sort((a, b) => a.tiempo - b.tiempo);
}

// Marcas redondas para el eje de kilos (40, 50, 60…) con un poco de aire arriba y abajo.
// Busca el paso más chico que deje como mucho 5 marcas.
export function marcasDeKilos(puntos: PuntoProgreso[]): number[] {
  const pesos = puntos.map((p) => p.pesoMaxKg);
  const menor = Math.min(...pesos) * 0.9;
  const mayor = Math.max(...pesos) * 1.1;
  const paso = [1, 2, 5, 10, 20, 25, 50, 100, 200].find((p) => (Math.ceil(mayor / p) - Math.floor(menor / p)) <= 4) ?? 500;
  const marcas = [];
  for (let kg = Math.floor(menor / paso) * paso; kg <= Math.ceil(mayor / paso) * paso; kg += paso) marcas.push(kg);
  return marcas;
}
