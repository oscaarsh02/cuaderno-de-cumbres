import { Ban, Flag, Undo2, type LucideIcon } from 'lucide-react';
import type { Resultado } from '../../compartido/tipos';

interface InfoResultado {
  etiqueta: string;
  Icono: LucideIcon;
  // Clases completas para que Tailwind las detecte.
  claseInsignia: string;
  claseSeleccionado: string;
}

export const ORDEN_RESULTADOS: Resultado[] = ['cumbre', 'regreso', 'cancelado'];

export const RESULTADOS: Record<Resultado, InfoResultado> = {
  cumbre: {
    etiqueta: 'Cumbre',
    Icono: Flag,
    claseInsignia: 'bg-emerald-100 text-emerald-800',
    claseSeleccionado: 'border-emerald-700 bg-emerald-50 text-emerald-900',
  },
  regreso: {
    etiqueta: 'Me regresé',
    Icono: Undo2,
    claseInsignia: 'bg-amber-100 text-amber-900',
    claseSeleccionado: 'border-amber-600 bg-amber-50 text-amber-900',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    Icono: Ban,
    claseInsignia: 'bg-slate-200 text-slate-700',
    claseSeleccionado: 'border-slate-600 bg-slate-100 text-slate-900',
  },
};
