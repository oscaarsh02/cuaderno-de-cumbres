import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import Encabezado from '../../compartido/componentes/Encabezado';
import MensajeError from '../../compartido/componentes/MensajeError';
import { db } from '../../compartido/db';
import type { Ejercicio } from '../../compartido/tipos';
import { nuevoId } from '../../compartido/utilidades/id';
import { GRUPOS_MUSCULARES } from './formato';

// Crea un ejercicio (/entrenamiento/ejercicios/nuevo) o corrige uno (/entrenamiento/ejercicios/:id).
// No se pueden borrar: las sesiones guardadas apuntan a ellos y perderían el nombre.
export default function EditorEjercicio() {
  const { id } = useParams();
  const esNuevo = id === undefined;
  const [original, setOriginal] = useState<Ejercicio | null | undefined>(esNuevo ? null : undefined);

  useEffect(() => {
    if (esNuevo) return;
    db.ejercicios.get(id).then((ejercicio) => setOriginal(ejercicio ?? null));
  }, [id, esNuevo]);

  if (!esNuevo && original === undefined) return null;

  if (!esNuevo && original === null) {
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo="Ejercicio no encontrado" volverA="/entrenamiento/ejercicios" />
        <p className="text-base text-slate-700">Este ejercicio ya no existe.</p>
      </div>
    );
  }

  return <Formulario original={original ?? null} />;
}

function Formulario({ original }: { original: Ejercicio | null }) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(original?.nombre ?? '');
  const [grupo, setGrupo] = useState(original?.grupoMuscular ?? '');
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const faltaNombre = nombre.trim() === '';
  const faltaGrupo = grupo === '';

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (faltaNombre || faltaGrupo) return;

    if (original) {
      await db.ejercicios.update(original.id, { nombre: nombre.trim(), grupoMuscular: grupo });
    } else {
      await db.ejercicios.add({ id: nuevoId(), nombre: nombre.trim(), grupoMuscular: grupo });
    }
    navigate('/entrenamiento/ejercicios');
  }

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={original ? 'Editar ejercicio' : 'Nuevo ejercicio'} volverA="/entrenamiento/ejercicios" />

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
            placeholder="Por ejemplo: Sentadilla"
            autoComplete="off"
            aria-invalid={intentoEnviar && faltaNombre}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
          />
          {intentoEnviar && faltaNombre && <MensajeError texto="Escribe el nombre del ejercicio." />}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-semibold">¿Qué trabaja?</legend>
          <div className="grid grid-cols-2 gap-2">
            {GRUPOS_MUSCULARES.map((g) => {
              const seleccionado = grupo === g;
              return (
                <label
                  key={g}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-3 text-center text-base font-medium has-focus-visible:outline-2 has-focus-visible:outline-sky-700 ${
                    seleccionado ? 'border-sky-700 bg-sky-50 text-sky-900' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="grupo"
                    value={g}
                    checked={seleccionado}
                    onChange={() => setGrupo(g)}
                    className="sr-only"
                  />
                  {g}
                </label>
              );
            })}
          </div>
          {intentoEnviar && faltaGrupo && <MensajeError texto="Elige qué parte del cuerpo trabaja." />}
        </fieldset>

        <button
          type="submit"
          className="min-h-14 rounded-xl bg-sky-800 px-4 text-lg font-semibold text-white active:bg-sky-900"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
