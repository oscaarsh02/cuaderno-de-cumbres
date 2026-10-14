import { ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { db } from '../../compartido/db';
import { useConsulta } from '../../compartido/useConsulta';
import { formatearFecha } from '../../compartido/utilidades/fechas';
import { agruparPorEjercicio } from './formato';

export default function ListaSesiones() {
  const sesiones = useConsulta(() => db.sesiones.orderBy('fecha').reverse().toArray());
  const ejercicios = useConsulta(() => db.ejercicios.toArray());

  const nombreEjercicio = new Map(ejercicios?.map((e) => [e.id, e.nombre]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Entrenamiento</h1>

      <div className="flex flex-col gap-3">
        <Link
          to="/entrenamiento/nueva"
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
        >
          <Plus size={24} aria-hidden="true" />
          Nueva sesión
        </Link>
        <Link
          to="/entrenamiento/ejercicios"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
        >
          <Dumbbell size={22} aria-hidden="true" />
          Mis ejercicios
        </Link>
      </div>

      {sesiones && sesiones.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-base text-slate-600">
          Aún no has registrado sesiones. Toca «Nueva sesión» cuando vayas al gimnasio.
        </p>
      )}

      {sesiones && sesiones.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sesiones.map((sesion) => {
            const nombres = agruparPorEjercicio(sesion.series).map(
              (g) => nombreEjercicio.get(g.ejercicioId) ?? 'Ejercicio borrado',
            );
            return (
              <li key={sesion.id}>
                <Link
                  to={`/entrenamiento/${sesion.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm active:bg-slate-100"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-lg font-semibold">{formatearFecha(sesion.fecha)}</p>
                    <p className="text-base text-slate-700">{nombres.join(' · ')}</p>
                    <p className="text-base text-slate-500">
                      {sesion.series.length} {sesion.series.length === 1 ? 'serie' : 'series'}
                    </p>
                  </div>
                  <ChevronRight size={24} className="shrink-0 text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
