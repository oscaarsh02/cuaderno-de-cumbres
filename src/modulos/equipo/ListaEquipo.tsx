import { Pencil, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import { db } from '../../compartido/db';
import type { ArticuloEquipo } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { normalizar } from '../../compartido/utilidades/texto';
import { CATEGORIAS, ORDEN_CATEGORIAS } from './categorias';
import ResumenPeso from './ResumenPeso';

export default function ListaEquipo() {
  const articulos = useConsulta(() =>
    db.equipo.toArray().then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
  );
  const [confirmandoNuevaSalida, setConfirmandoNuevaSalida] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  if (!articulos) return null;

  const empacados = articulos.filter((a) => a.empacado).length;
  const total = articulos.length;

  // Con texto en el buscador se deja de agrupar por categoría y se muestra una sola lista.
  const termino = normalizar(busqueda);
  const buscando = termino !== '';
  const resultados = buscando ? articulos.filter((a) => normalizar(a.nombre).includes(termino)) : [];

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
        {total > 0 && <ResumenPeso articulos={articulos} />}
      </section>

      {total > 0 && <Buscador valor={busqueda} onCambiar={setBusqueda} />}

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

      {buscando && resultados.length > 0 && (
        <ul
          aria-label="Resultados de la búsqueda"
          className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm"
        >
          {resultados.map((articulo) => (
            <FilaArticulo key={articulo.id} articulo={articulo} mostrarCategoria />
          ))}
        </ul>
      )}

      {buscando && resultados.length === 0 && (
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 text-center">
          <p className="text-base text-slate-600">Ningún artículo coincide con «{busqueda.trim()}»</p>
          <Link
            to={`/equipo/nuevo?${new URLSearchParams({ nombre: busqueda.trim() })}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-sky-800 px-4 text-base font-semibold text-sky-800 active:bg-sky-50"
          >
            <Plus size={22} aria-hidden="true" />
            Agregar «{busqueda.trim()}»
          </Link>
        </div>
      )}

      {!buscando && ORDEN_CATEGORIAS.map((categoria) => {
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

function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (valor: string) => void }) {
  const campo = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <label htmlFor="buscar-equipo" className="sr-only">
        Buscar artículo
      </label>
      <Search
        size={22}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
      />
      {/* La X propia del navegador se oculta: usamos la nuestra, que es más grande. */}
      <input
        ref={campo}
        id="buscar-equipo"
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder="Buscar artículo"
        autoComplete="off"
        enterKeyHint="search"
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pr-12 pl-11 text-base [&::-webkit-search-cancel-button]:appearance-none"
      />
      {valor !== '' && (
        <button
          type="button"
          onClick={() => {
            onCambiar('');
            campo.current?.focus();
          }}
          aria-label="Limpiar búsqueda"
          className="absolute top-0 right-0 flex size-12 items-center justify-center rounded-xl text-slate-500 active:bg-slate-100"
        >
          <X size={22} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function FilaArticulo({ articulo, mostrarCategoria = false }: { articulo: ArticuloEquipo; mostrarCategoria?: boolean }) {
  return (
    <li className="flex items-center">
      <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-3 px-4 active:bg-slate-50">
        <input
          type="checkbox"
          checked={articulo.empacado}
          onChange={() => db.equipo.update(articulo.id, { empacado: !articulo.empacado })}
          className="size-6 shrink-0 accent-emerald-700"
        />
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 py-2">
          <span className={`text-base ${articulo.empacado ? 'text-slate-500 line-through' : ''}`}>
            {articulo.nombre}
          </span>
          {mostrarCategoria && (
            <span className="rounded-full bg-slate-100 px-2 text-base text-slate-600">
              {CATEGORIAS[articulo.categoria].nombre}
            </span>
          )}
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
