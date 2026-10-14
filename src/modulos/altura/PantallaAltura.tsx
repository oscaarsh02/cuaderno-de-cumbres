import { Activity, ChevronDown, ChevronLeft, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { MAL_AGUDO, NOTA_AL_PIE, PREVENCION, SENALES_ALARMA } from './ContenidoAltura';

// Orden por urgencia, no por lógica: primero lo que obliga a bajar,
// para que quien abra esto sintiéndose mal lo vea sin hacer scroll.
export default function PantallaAltura() {
  const navigate = useNavigate();
  const location = useLocation();
  // Si se abrió directo (sin historial dentro de la app), "Volver" lleva al inicio.
  const volver = () => (location.key === 'default' ? navigate('/cumbres') : navigate(-1));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={volver}
          className="-ml-2 flex min-h-11 w-fit items-center gap-1 px-2 text-base font-medium text-sky-800"
        >
          <ChevronLeft size={24} aria-hidden="true" />
          Volver
        </button>
        <h1 className="text-2xl font-bold">Mal de altura</h1>
      </div>

      {/* Bloque 1: siempre abierto, máximo contraste y sin animaciones. */}
      <section aria-labelledby="alarma-titulo" className="overflow-hidden rounded-xl border-2 border-red-800 bg-white">
        <h2 id="alarma-titulo" className="flex items-start gap-2 bg-red-800 px-4 py-3 text-xl font-bold text-white">
          <TriangleAlert size={28} className="mt-0.5 shrink-0" aria-hidden="true" />
          {SENALES_ALARMA.titulo}
        </h2>
        <div className="flex flex-col gap-4 p-4">
          <ul className="flex list-disc flex-col gap-2 pl-6 text-lg text-slate-950 marker:text-red-800">
            {SENALES_ALARMA.signos.map((signo) => (
              <li key={signo}>{signo}</li>
            ))}
          </ul>
          <p className="rounded-lg bg-red-50 p-3 text-lg font-bold text-red-900">{SENALES_ALARMA.advertencia}</p>
        </div>
      </section>

      <SeccionPlegable titulo={MAL_AGUDO.titulo} Icono={Activity}>
        <Lista elementos={MAL_AGUDO.sintomas} />
        <p className="text-base font-semibold text-slate-900">{MAL_AGUDO.reglas}</p>
      </SeccionPlegable>

      <SeccionPlegable titulo={PREVENCION.titulo} Icono={ShieldCheck}>
        <Lista elementos={PREVENCION.consejos} />
      </SeccionPlegable>

      <p className="border-t border-slate-300 pt-4 text-base text-slate-700">{NOTA_AL_PIE}</p>
    </div>
  );
}

// <details> nativo: se pliega sin JavaScript extra y funciona con lector de pantalla.
function SeccionPlegable({ titulo, Icono, children }: { titulo: string; Icono: LucideIcon; children: ReactNode }) {
  return (
    <details className="group rounded-xl bg-white shadow-sm">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 py-3 text-lg font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
        <Icono size={24} className="shrink-0 text-slate-600" aria-hidden="true" />
        <span className="flex-1">{titulo}</span>
        <ChevronDown size={24} className="shrink-0 text-slate-500 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>
    </details>
  );
}

function Lista({ elementos }: { elementos: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-6 text-base text-slate-900">
      {elementos.map((texto) => (
        <li key={texto}>{texto}</li>
      ))}
    </ul>
  );
}
