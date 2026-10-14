import type { ArticuloEquipo, Categoria, Montana } from './tipos';

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

const EQUIPO_BASICO_POR_CATEGORIA: Record<Categoria, string[]> = {
  abrigo: [
    'Chamarra impermeable',
    'Chamarra de pluma o térmica',
    'Primera capa térmica',
    'Pantalón de montaña',
    'Guantes',
    'Gorro',
    'Calcetines de repuesto',
  ],
  tecnico: ['Botas de montaña', 'Bastones', 'Lámpara frontal con pilas', 'Lentes de sol', 'Casco', 'Crampones', 'Piolet'],
  campamento: ['Mochila', 'Casa de campaña', 'Bolsa de dormir', 'Aislante', 'Estufa y gas'],
  comida: ['Agua (al menos 2 litros)', 'Botanas energéticas', 'Comida del día'],
  botiquin: ['Botiquín de primeros auxilios', 'Bloqueador solar', 'Medicamentos personales', 'Papel higiénico'],
  otros: ['Identificación', 'Teléfono con batería cargada', 'Batería portátil', 'Silbato', 'Dinero en efectivo'],
};

export const EQUIPO_PRECARGADO: ArticuloEquipo[] = Object.entries(EQUIPO_BASICO_POR_CATEGORIA).flatMap(
  ([categoria, nombres]) =>
    nombres.map((nombre, i) => ({
      id: `basico-${categoria}-${i + 1}`,
      nombre,
      categoria: categoria as Categoria,
      empacado: false,
    })),
);
