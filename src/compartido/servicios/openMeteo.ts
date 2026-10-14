import type { Condiciones, Montana } from '../tipos';
import { diasDesde } from '../utilidades/fechas';

const URL_ARCHIVO = 'https://archive-api.open-meteo.com/v1/archive';
const URL_PRONOSTICO = 'https://api.open-meteo.com/v1/forecast';

// El archivo histórico tarda unos días en tener datos; antes de eso se usa el pronóstico.
const DIAS_PARA_ARCHIVO = 5;
// El pronóstico no acepta fechas más lejanas que esto.
const DIAS_MAXIMOS_DE_PRONOSTICO = 16;

const VARIABLES = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'weather_code',
] as const;

type RespuestaDiaria = Record<(typeof VARIABLES)[number], (number | null)[]>;

// Todavía no hay datos para esa fecha (muy en el futuro o aún sin publicar).
// No es un fallo: el intento se queda con el clima pendiente y se reintenta después.
export class ClimaNoDisponible extends Error {}

export function climaConsultable(fecha: string): boolean {
  return -diasDesde(fecha) <= DIAS_MAXIMOS_DE_PRONOSTICO;
}

export async function consultarClima(montana: Montana, fecha: string): Promise<Condiciones> {
  if (!climaConsultable(fecha)) throw new ClimaNoDisponible();

  const base = diasDesde(fecha) > DIAS_PARA_ARCHIVO ? URL_ARCHIVO : URL_PRONOSTICO;
  const parametros = new URLSearchParams({
    latitude: String(montana.latitud),
    longitude: String(montana.longitud),
    // Sin elevation la temperatura se calcula para la altura de la celda del modelo, no la cumbre.
    elevation: String(montana.altitud),
    start_date: fecha,
    end_date: fecha,
    timezone: 'America/Mexico_City',
    daily: VARIABLES.join(','),
  });

  const respuesta = await fetch(`${base}?${parametros}`, { signal: AbortSignal.timeout(15_000) });
  if (!respuesta.ok) throw new Error(`Open-Meteo respondió ${respuesta.status}: ${await respuesta.text()}`);

  const { daily } = (await respuesta.json()) as { daily?: RespuestaDiaria };
  const dato = (variable: (typeof VARIABLES)[number]) => {
    const valor = daily?.[variable]?.[0];
    if (valor === null || valor === undefined) throw new ClimaNoDisponible();
    return valor;
  };

  return {
    tempMax: dato('temperature_2m_max'),
    tempMin: dato('temperature_2m_min'),
    precipitacion: dato('precipitation_sum'),
    vientoMax: dato('wind_speed_10m_max'),
    rachasMax: dato('wind_gusts_10m_max'),
    codigoClima: dato('weather_code'),
  };
}
