import { HeartPulse } from 'lucide-react';
import { Link } from 'react-router';

// A partir de esta altitud (en metros) se muestra el aviso.
export const ALTITUD_AVISO_M = 3000;

// Tarjeta discreta para pantallas donde se elige una montaña: avisa del riesgo
// de mal de montaña y enlaza a la guía (/altura). Por debajo del umbral no muestra nada.
export default function AvisoAltura({ nombre, altitud }: { nombre: string; altitud: number }) {
  if (altitud <= ALTITUD_AVISO_M) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-base text-slate-700">
      <HeartPulse size={22} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
      <p>
        {nombre} está a {altitud.toLocaleString('es-MX')} m, una altitud donde puede presentarse mal de montaña.{' '}
        <Link to="/altura" className="font-semibold text-sky-800 underline underline-offset-2">
          Ver la guía
        </Link>
      </p>
    </div>
  );
}
