import type { ArticuloEquipo } from '../../compartido/tipos';

export interface PesoMochila {
  gramos: number;
  // Empacados sin peso registrado: si es mayor que 0, el total se queda corto.
  sinPeso: number;
}

export function calcularPeso(articulos: ArticuloEquipo[]): PesoMochila {
  const empacados = articulos.filter((a) => a.empacado);
  return {
    gramos: empacados.reduce((suma, a) => suma + (a.pesoGramos ?? 0), 0),
    sinPeso: empacados.filter((a) => a.pesoGramos === undefined).length,
  };
}

// 8400 → '8.4'
export function formatearKg(gramos: number): string {
  return (gramos / 1000).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export type RangoCarga = 'dia' | 'travesia' | 'excesiva';

// Orientación general de montañismo. Se clasifica con el porcentaje ya redondeado
// para que el número que se ve y el rango siempre coincidan.
export function rangoCarga(porcentaje: number): RangoCarga {
  if (porcentaje <= 20) return 'dia';
  if (porcentaje <= 25) return 'travesia';
  return 'excesiva';
}
