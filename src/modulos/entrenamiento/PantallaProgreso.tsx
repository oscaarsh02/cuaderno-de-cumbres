import { useState } from 'react';
import { Link } from 'react-router';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Encabezado from '../../compartido/componentes/Encabezado';
import { db } from '../../compartido/db';
import { useConsulta } from '../../compartido/useConsulta';
import { formatearFecha } from '../../compartido/utilidades/fechas';
import { marcasDeKilos, progresoDeEjercicio, type PuntoProgreso } from './progreso';

// Colores de la app (sky-800, slate-600, slate-200) en hex porque Recharts dibuja SVG.
const COLOR_LINEA = '#075985';
const COLOR_TEXTO_EJES = '#475569';
const COLOR_REJILLA = '#e2e8f0';

const kg = (n: number) => `${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })} kg`;

// 1767225600000 → '1 ene'
const fechaCorta = (tiempo: number) =>
  new Date(tiempo).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');

export default function PantallaProgreso() {
  const sesiones = useConsulta(() => db.sesiones.orderBy('fecha').toArray());
  const ejercicios = useConsulta(() => db.ejercicios.toArray());
  const [elegido, setElegido] = useState<string | null>(null);

  if (!sesiones || !ejercicios) return null;

  // Solo los ejercicios con al menos una serie con peso; el más reciente primero.
  const ultimaFecha = new Map<string, string>();
  for (const sesion of sesiones) {
    for (const serie of sesion.series) {
      if (serie.pesoKg > 0) ultimaFecha.set(serie.ejercicioId, sesion.fecha);
    }
  }
  const conPeso = ejercicios
    .filter((e) => ultimaFecha.has(e.id))
    .sort((a, b) => ultimaFecha.get(b.id)!.localeCompare(ultimaFecha.get(a.id)!) || a.nombre.localeCompare(b.nombre, 'es'));

  const ejercicio = conPeso.find((e) => e.id === elegido) ?? conPeso[0];

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Mi progreso" volverA="/entrenamiento" />

      {!ejercicio ? (
        <p className="rounded-xl bg-white p-6 text-center text-base text-slate-600">
          Aquí verás cómo sube el peso que levantas. Registra una{' '}
          <Link to="/entrenamiento/nueva" className="font-semibold text-sky-800 underline">
            sesión
          </Link>{' '}
          con peso para empezar.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="ejercicio" className="text-base font-semibold">
              Ejercicio
            </label>
            <select
              id="ejercicio"
              value={ejercicio.id}
              onChange={(e) => setElegido(e.target.value)}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
            >
              {conPeso.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <Progreso nombre={ejercicio.nombre} puntos={progresoDeEjercicio(sesiones, ejercicio.id)} />
        </>
      )}
    </div>
  );
}

function Progreso({ nombre, puntos }: { nombre: string; puntos: PuntoProgreso[] }) {
  const primero = puntos[0];
  const ultimo = puntos.at(-1)!;
  const mejor = puntos.reduce((a, b) => (b.pesoMaxKg > a.pesoMaxKg ? b : a));
  const marcas = marcasDeKilos(puntos);

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Peso máximo en {nombre}</h2>
        <p className="text-base text-slate-700">
          {puntos.length === 1 ? (
            <>
              Tu marca: {kg(primero.pesoMaxKg)} el {formatearFecha(primero.fecha)}. Registra más sesiones con este
              ejercicio para ver cómo evolucionas.
            </>
          ) : (
            <>
              Empezaste con {kg(primero.pesoMaxKg)} y la última vez levantaste {kg(ultimo.pesoMaxKg)}. Tu mejor marca:{' '}
              {kg(mejor.pesoMaxKg)} el {formatearFecha(mejor.fecha)}.
            </>
          )}
        </p>
      </div>

      {/* La gráfica es un resumen visual; el texto de arriba y la tabla de abajo dicen lo mismo. */}
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={puntos} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={COLOR_REJILLA} />
            <XAxis
              dataKey="tiempo"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={fechaCorta}
              tick={{ fontSize: 16, fill: COLOR_TEXTO_EJES }}
              tickLine={false}
              axisLine={{ stroke: COLOR_REJILLA }}
              minTickGap={24}
              padding={{ left: 16, right: 16 }}
            />
            <YAxis
              dataKey="pesoMaxKg"
              domain={[marcas[0], marcas.at(-1)!]}
              ticks={marcas}
              tick={{ fontSize: 16, fill: COLOR_TEXTO_EJES }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: COLOR_TEXTO_EJES, strokeWidth: 1 }}
              content={({ active, payload }) => {
                const punto = payload?.[0]?.payload as PuntoProgreso | undefined;
                if (!active || !punto) return null;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-md">
                    <p className="text-slate-600">{formatearFecha(punto.fecha)}</p>
                    <p className="font-semibold text-slate-900">{kg(punto.pesoMaxKg)}</p>
                  </div>
                );
              }}
            />
            <Line
              type="linear"
              dataKey="pesoMaxKg"
              stroke={COLOR_LINEA}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{ r: 4, fill: COLOR_LINEA, stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: COLOR_LINEA, stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="-mt-2 text-base text-slate-500">Kilos por fecha. Toca un punto para ver el dato.</p>

      <details className="rounded-lg border border-slate-200">
        <summary className="flex min-h-12 cursor-pointer items-center px-3 text-base font-medium text-sky-800">
          Ver todos los datos
        </summary>
        <table className="w-full text-left text-base">
          <thead>
            <tr className="border-t border-slate-200 text-slate-600">
              <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Peso máximo</th>
            </tr>
          </thead>
          <tbody>
            {[...puntos].reverse().map((p) => (
              <tr key={p.fecha} className="border-t border-slate-100">
                <td className="px-3 py-2">{formatearFecha(p.fecha)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{kg(p.pesoMaxKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
