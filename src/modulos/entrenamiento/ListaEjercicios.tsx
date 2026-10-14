import { ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router';
import Encabezado from '../../compartido/componentes/Encabezado';
import { db } from '../../compartido/db';
import { useConsulta } from '../../compartido/useConsulta';

export default function ListaEjercicios() {
  const ejercicios = useConsulta(() =>
    db.ejercicios.toArray().then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
  );

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Mis ejercicios" volverA="/entrenamiento" />

      <Link
        to="/entrenamiento/ejercicios/nuevo"
        className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
      >
        <Plus size={24} aria-hidden="true" />
        Nuevo ejercicio
      </Link>

      {ejercicios && ejercicios.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-base text-slate-600">
          Aún no tienes ejercicios. Crea los que haces en el gimnasio, por ejemplo «Sentadilla».
        </p>
      )}

      {ejercicios && ejercicios.length > 0 && (
        <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
          {ejercicios.map((ejercicio) => (
            <li key={ejercicio.id}>
              <Link
                to={`/entrenamiento/ejercicios/${ejercicio.id}`}
                className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-slate-50"
              >
                <div className="flex flex-1 flex-col">
                  <span className="text-base font-medium">{ejercicio.nombre}</span>
                  <span className="text-base text-slate-500">{ejercicio.grupoMuscular}</span>
                </div>
                <ChevronRight size={22} className="shrink-0 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
