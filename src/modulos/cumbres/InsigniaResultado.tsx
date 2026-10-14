import type { Resultado } from '../../compartido/tipos';
import { RESULTADOS } from './resultados';

export default function InsigniaResultado({ resultado }: { resultado: Resultado }) {
  const { etiqueta, Icono, claseInsignia } = RESULTADOS[resultado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-medium ${claseInsignia}`}>
      <Icono size={18} aria-hidden="true" />
      {etiqueta}
    </span>
  );
}
