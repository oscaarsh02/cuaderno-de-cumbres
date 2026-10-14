import { ChevronRight, Plus, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { db } from '../../compartido/db';
import { useConsulta } from '../../compartido/useConsulta';
import { useEnLinea } from '../../compartido/useEnLinea';
import { formatearFecha } from '../../compartido/utilidades/fechas';
import { ResumenClima } from './ClimaIntento';
import { completarClimasPendientes } from './clima';
import InsigniaResultado from './InsigniaResultado';

export default function ListaIntentos() {
  const intentos = useConsulta(() => db.intentos.orderBy('fecha').reverse().toArray());
  const montanas = useConsulta(() => db.montanas.toArray());
  const enLinea = useEnLinea();

  useEffect(() => {
    completarClimasPendientes();
  }, []);

  const nombreMontana = new Map(montanas?.map((m) => [m.id, m.nombre]));
  const hayPendientes = intentos?.some((i) => i.climaPendiente) ?? false;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Cumbres</h1>

      {!enLinea && (
        <p role="status" className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-base text-amber-900">
          <WifiOff size={24} className="shrink-0" aria-hidden="true" />
          <span>
            Sin conexión. Puedes seguir registrando intentos: se guardan en tu teléfono
            {hayPendientes ? ' y el clima se completará solo cuando vuelva la señal.' : '.'}
          </span>
        </p>
      )}

      <Link
        to="/cumbres/nuevo"
        className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
      >
        <Plus size={24} aria-hidden="true" />
        Nuevo intento
      </Link>

      {intentos && intentos.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-base text-slate-600">
          Aún no has registrado ningún intento. Toca «Nuevo intento» para anotar tu primera salida.
        </p>
      )}

      {intentos && intentos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {intentos.map((intento) => (
            <li key={intento.id}>
              <Link
                to={`/cumbres/${intento.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm active:bg-slate-100"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-lg font-semibold">
                    {nombreMontana.get(intento.montanaId) ?? 'Montaña desconocida'}
                  </p>
                  <p className="text-base text-slate-600">{formatearFecha(intento.fecha)}</p>
                  <div>
                    <InsigniaResultado resultado={intento.resultado} />
                  </div>
                  <ResumenClima intento={intento} />
                  {intento.notas && (
                    <p className="line-clamp-2 text-base text-slate-600">{intento.notas}</p>
                  )}
                </div>
                <ChevronRight size={24} className="shrink-0 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
