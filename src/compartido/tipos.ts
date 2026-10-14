// src/compartido/tipos.ts
export interface Montana {
  id: string; nombre: string;
  latitud: number; longitud: number; altitud: number;  // altitud en metros
  precargada: boolean;
}

export type Resultado = 'cumbre' | 'regreso' | 'cancelado';

export interface Condiciones {
  tempMax: number; tempMin: number;      // °C
  precipitacion: number;                 // mm
  vientoMax: number; rachasMax: number;  // km/h
  codigoClima: number;                   // código WMO
}

export interface Intento {
  id: string; montanaId: string;
  fecha: string;                         // 'YYYY-MM-DD'
  resultado: Resultado; notas: string;
  condiciones: Condiciones | null;
  climaPendiente: boolean;
}

export type Categoria = 'abrigo' | 'tecnico' | 'campamento' | 'comida' | 'botiquin' | 'otros';

export interface ArticuloEquipo {
  id: string; nombre: string; categoria: Categoria; empacado: boolean;
}

export interface Ejercicio { id: string; nombre: string; grupoMuscular: string; }
export interface Serie { ejercicioId: string; repeticiones: number; pesoKg: number; }
export interface Sesion { id: string; fecha: string; series: Serie[]; }
