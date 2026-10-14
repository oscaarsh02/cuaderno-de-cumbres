import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import type { Condiciones } from '../../compartido/tipos';

interface Descripcion {
  frase: string;
  Icono: LucideIcon;
}

// Traduce el código WMO de Open-Meteo a algo que cualquiera entienda.
// https://open-meteo.com/en/docs (sección "WMO Weather interpretation codes")
export function describirCielo(codigo: number): Descripcion {
  if (codigo === 0) return { frase: 'Despejado', Icono: Sun };
  if (codigo === 1 || codigo === 2) return { frase: 'Parcialmente nublado', Icono: CloudSun };
  if (codigo === 3) return { frase: 'Nublado', Icono: Cloud };
  if (codigo === 45 || codigo === 48) return { frase: 'Niebla', Icono: CloudFog };
  if (codigo === 56 || codigo === 57) return { frase: 'Llovizna helada', Icono: CloudDrizzle };
  if (codigo >= 51 && codigo <= 55) return { frase: 'Llovizna', Icono: CloudDrizzle };
  if (codigo === 66 || codigo === 67) return { frase: 'Lluvia helada', Icono: CloudRain };
  if (codigo === 65 || codigo === 82) return { frase: 'Lluvia fuerte', Icono: CloudRain };
  if ((codigo >= 61 && codigo <= 63) || codigo === 80 || codigo === 81) return { frase: 'Lluvia', Icono: CloudRain };
  if (codigo === 75 || codigo === 86) return { frase: 'Nevada fuerte', Icono: CloudSnow };
  if ((codigo >= 71 && codigo <= 77) || codigo === 85) return { frase: 'Nevada', Icono: CloudSnow };
  if (codigo === 96 || codigo === 99) return { frase: 'Tormenta con granizo', Icono: CloudHail };
  if (codigo === 95) return { frase: 'Tormenta eléctrica', Icono: CloudLightning };
  return { frase: 'Clima variable', Icono: Cloud };
}

// Umbrales aproximados de la escala Beaufort: 40 km/h ya dificulta caminar
// en una arista; con rachas de 60 km/h cuesta mantener el equilibrio.
export function describirViento({ vientoMax, rachasMax }: Condiciones): string | null {
  if (vientoMax >= 60 || rachasMax >= 90) return 'Viento muy fuerte';
  if (vientoMax >= 40 || rachasMax >= 60) return 'Viento fuerte';
  return null;
}

export const redondear = (n: number) => Math.round(n).toLocaleString('es-MX');
export const unDecimal = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 1 });
