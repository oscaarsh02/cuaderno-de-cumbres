import { CircleAlert, CircleCheck, Scale, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { db, ID_PERFIL } from '../../compartido/db';
import type { ArticuloEquipo } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { calcularPeso, formatearKg, rangoCarga, type RangoCarga } from './pesoMochila';

const RANGOS: Record<RangoCarga, { texto: string; Icono: LucideIcon; clases: string }> = {
  dia: { texto: 'Dentro del rango para una salida de día', Icono: CircleCheck, clases: 'bg-emerald-50 text-emerald-900' },
  travesia: {
    texto: 'Dentro del rango para una travesía con campamento',
    Icono: CircleAlert,
    clases: 'bg-amber-50 text-amber-900',
  },
  excesiva: { texto: 'Por encima de lo recomendable', Icono: TriangleAlert, clases: 'bg-red-50 text-red-800' },
};

// Peso de lo marcado como empacado y, si hay peso corporal registrado, qué tan pesada es la carga.
export default function ResumenPeso({ articulos }: { articulos: ArticuloEquipo[] }) {
  // null = sin perfil; undefined = cargando.
  const perfil = useConsulta(() => db.perfil.get(ID_PERFIL).then((p) => p ?? null));
  if (perfil === undefined) return null;

  const { gramos, sinPeso } = calcularPeso(articulos);
  const hayEmpacados = articulos.some((a) => a.empacado);
  const pesoCorporal = perfil?.pesoCorporalKg;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
      <p className="flex flex-wrap items-center gap-x-2 text-lg font-semibold">
        <Scale size={22} aria-hidden="true" />
        Mochila: {formatearKg(gramos)} kg
        {sinPeso > 0 && (
          <span className="text-base font-medium text-amber-900">
            · {sinPeso === 1 ? '1 artículo sin peso' : `${sinPeso} artículos sin peso`}
          </span>
        )}
      </p>

      {pesoCorporal === undefined ? (
        <Link
          to="/ajustes"
          className="flex min-h-11 w-fit items-center text-base text-sky-800 underline underline-offset-4"
        >
          Registra tu peso para ver si la carga es razonable
        </Link>
      ) : (
        hayEmpacados && <Porcentaje gramos={gramos} sinPeso={sinPeso} pesoCorporalKg={pesoCorporal} />
      )}
    </div>
  );
}

function Porcentaje({ gramos, sinPeso, pesoCorporalKg }: { gramos: number; sinPeso: number; pesoCorporalKg: number }) {
  const porcentaje = Math.round((gramos / 1000 / pesoCorporalKg) * 100);
  const rango = rangoCarga(porcentaje);
  const incompleto = sinPeso > 0;

  // Con pesos faltantes el porcentaje real solo puede ser mayor: el rojo es seguro,
  // pero verde o amarillo podrían estar equivocados, así que no se afirman.
  if (incompleto && rango !== 'excesiva') {
    return (
      <p className="rounded-lg bg-slate-100 px-3 py-2 text-base text-slate-700">
        Al menos {porcentaje} % de tu peso. Registra el peso de todo lo empacado para saber si la carga es razonable.
      </p>
    );
  }

  const { texto, Icono, clases } = RANGOS[rango];
  return (
    <p className={`flex items-start gap-2 rounded-lg px-3 py-2 text-base ${clases}`}>
      <Icono size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>
        <span className="font-semibold">
          {incompleto ? 'Al menos ' : ''}
          {porcentaje} % de tu peso
        </span>{' '}
        · {texto}
      </span>
    </p>
  );
}
