import { Trash } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import Encabezado from '../../compartido/componentes/Encabezado';
import MensajeError from '../../compartido/componentes/MensajeError';
import { db } from '../../compartido/db';
import type { ArticuloEquipo, Categoria } from '../../compartido/tipos';
import { nuevoId } from '../../compartido/utilidades/id';
import { CATEGORIAS, ORDEN_CATEGORIAS } from './categorias';

// Agrega un artículo (/equipo/nuevo) o edita uno existente (/equipo/:id).
export default function EditorArticulo() {
  const { id } = useParams();
  const esNuevo = id === undefined;

  // undefined = cargando, null = no existe. Se lee una sola vez para que al
  // borrar no aparezca un instante el aviso de "no encontrado".
  const [original, setOriginal] = useState<ArticuloEquipo | null | undefined>(esNuevo ? null : undefined);

  useEffect(() => {
    if (esNuevo) return;
    db.equipo.get(id).then((articulo) => setOriginal(articulo ?? null));
  }, [id, esNuevo]);

  if (!esNuevo && original === undefined) return null;

  if (!esNuevo && original === null) {
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo="Artículo no encontrado" volverA="/equipo" />
        <p className="text-base text-slate-700">Este artículo ya no existe. Puede que se haya borrado.</p>
      </div>
    );
  }

  return <Formulario original={original ?? null} />;
}

function Formulario({ original }: { original: ArticuloEquipo | null }) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(original?.nombre ?? '');
  const [categoria, setCategoria] = useState<Categoria | null>(original?.categoria ?? null);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const faltaNombre = nombre.trim() === '';
  const faltaCategoria = categoria === null;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (faltaNombre || faltaCategoria) return;

    if (original) {
      // Solo nombre y categoría: no se toca si ya estaba empacado.
      await db.equipo.update(original.id, { nombre: nombre.trim(), categoria });
    } else {
      await db.equipo.add({ id: nuevoId(), nombre: nombre.trim(), categoria, empacado: false });
    }
    navigate('/equipo');
  }

  async function borrar() {
    if (!original) return;
    await db.equipo.delete(original.id);
    navigate('/equipo');
  }

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={original ? 'Editar artículo' : 'Agregar artículo'} volverA="/equipo" />

      <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className="text-base font-semibold">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Por ejemplo: Termo"
            autoComplete="off"
            aria-invalid={intentoEnviar && faltaNombre}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
          />
          {intentoEnviar && faltaNombre && <MensajeError texto="Escribe el nombre del artículo." />}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-semibold">Categoría</legend>
          <div className="flex flex-col gap-2">
            {ORDEN_CATEGORIAS.map((c) => {
              const { nombre: nombreCategoria, Icono } = CATEGORIAS[c];
              const seleccionada = categoria === c;
              return (
                <label
                  key={c}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-medium has-focus-visible:outline-2 has-focus-visible:outline-sky-700 ${
                    seleccionada ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    value={c}
                    checked={seleccionada}
                    onChange={() => setCategoria(c)}
                    className="sr-only"
                  />
                  <Icono size={22} aria-hidden="true" />
                  {nombreCategoria}
                </label>
              );
            })}
          </div>
          {intentoEnviar && faltaCategoria && <MensajeError texto="Elige una categoría." />}
        </fieldset>

        <button
          type="submit"
          className="min-h-14 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
        >
          Guardar
        </button>
      </form>

      {original && (
        <>
          <button
            type="button"
            onClick={() => setConfirmandoBorrado(true)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 text-base font-semibold text-red-700 active:bg-red-50"
          >
            <Trash size={22} aria-hidden="true" />
            Borrar artículo
          </button>

          <DialogoConfirmacion
            abierto={confirmandoBorrado}
            titulo="¿Borrar este artículo?"
            mensaje={`Se quitará «${original.nombre}» de tu lista de equipo. Esto no se puede deshacer.`}
            textoConfirmar="Sí, borrar"
            onConfirmar={borrar}
            onCancelar={() => setConfirmandoBorrado(false)}
          />
        </>
      )}
    </div>
  );
}
