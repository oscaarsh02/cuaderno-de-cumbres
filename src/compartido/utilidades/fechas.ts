// Las fechas se guardan como 'YYYY-MM-DD' en hora local. No usar toISOString():
// convierte a UTC y de noche en México devuelve el día siguiente.

export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Días que han pasado desde la fecha hasta hoy. Negativo si la fecha es futura.
export function diasDesde(fechaISO: string): number {
  const aUTC = (iso: string) => {
    const [anio, mes, dia] = iso.split('-').map(Number);
    return Date.UTC(anio, mes - 1, dia);
  };
  return Math.round((aUTC(hoyISO()) - aUTC(fechaISO)) / 86_400_000);
}

// '2026-10-12' → '12 de octubre de 2026'
export function formatearFecha(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
