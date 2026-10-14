import { Pencil, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import { db } from '../../compartido/db';
import type { ArticuloEquipo } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { CATEGORIAS, ORDEN_CATEGORIAS } from './categorias';

export default function ListaEquipo() {
  const articulos = useConsulta(() =>
    db.equipo.toArray().then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
  );
  const [confirmandoNuevaSalida, setConfirmandoNuevaSalida] = useState(false);

  if (!articulos) return null;

  const empacados = articulos.filter((a) => a.empacado).length;
  const total = articulos.length;

  async function nuevaSalida() {
    await db.equipo.toCollection().modify({ empacado: false });
    setConfirmandoNuevaSalida(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Equipo</h1>

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-lg font-semibold">
          {empacados} de {total} empacados
        </p>
        <div
          role="progressbar"
          aria-label="Avance del empacado"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={empacados}
          className="h-3 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-[width]"
            style={{ width: total ? `${(empacados / total) * 100}%` : '0%' }}
          />
        </div>
        {total > 0 && empacados === total && (
          <p className="text-base font-medium text-emerald-800">¡Todo listo para salir!</p>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <Link
          to="/equipo/nuevo"
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
        >
          <Plus size={24} aria-hidden="true" />
          Agregar artículo
        </Link>
        <button
          type="button"
          onClick={() => setConfirmandoNuevaSalida(true)}
          disabled={empacados === 0}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-50"
        >
          <RotateCcw size={22} aria-hidden="true" />
          Nueva salida
        </button>
      </div>

      {total === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-base text-slate-600">
          Tu lista está vacía. Toca «Agregar artículo» para empezar.
        </p>
      )}

      {ORDEN_CATEGORIAS.map((categoria) => {
        const deCategoria = articulos.filter((a) => a.categoria === categoria);
        if (deCategoria.length === 0) return null;
        const { nombre, Icono } = CATEGORIAS[categoria];
        const listos = deCategoria.filter((a) => a.empacado).length;

        return (
          <section key={categoria} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Icono size={24} aria-hidden="true" />
              {nombre}
              <span className="ml-auto text-base font-medium text-slate-500">
                {listos} de {deCategoria.length}
              </span>
            </h2>
            <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
              {deCategoria.map((articulo) => (
                <FilaArticulo key={articulo.id} articulo={articulo} />
              ))}
            </ul>
          </section>
        );
      })}

      <DialogoConfirmacion
        abierto={confirmandoNuevaSalida}
        titulo="¿Empezar una nueva salida?"
        mensaje={`Se ${empacados === 1 ? 'desmarcará el artículo empacado' : `desmarcarán los ${empacados} artículos empacados`} para que vuelvas a revisar todo. Tu lista de equipo no se borra.`}
        textoConfirmar="Sí, desmarcar todo"
        onConfirmar={nuevaSalida}
        onCancelar={() => setConfirmandoNuevaSalida(false)}
      />
    </div>
  );
}

function FilaArticulo({ articulo }: { articulo: ArticuloEquipo }) {
  return (
    <li className="flex items-center">
      <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-3 px-4 active:bg-slate-50">
        <input
          type="checkbox"
          checked={articulo.empacado}
          onChange={() => db.equipo.update(articulo.id, { empacado: !articulo.empacado })}
          className="size-6 shrink-0 accent-emerald-700"
        />
        <span className={`text-base ${articulo.empacado ? 'text-slate-500 line-through' : ''}`}>
          {articulo.nombre}
        </span>
      </label>
      <Link
        to={`/equipo/${articulo.id}`}
        aria-label={`Editar ${articulo.nombre}`}
        className="flex size-14 shrink-0 items-center justify-center text-slate-400 active:bg-slate-50"
      >
        <Pencil size={20} aria-hidden="true" />
      </Link>
    </li>
  );
}
