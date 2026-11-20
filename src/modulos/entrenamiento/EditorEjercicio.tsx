import { Camera, Trash } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import Encabezado from '../../compartido/componentes/Encabezado';
import MensajeError from '../../compartido/componentes/MensajeError';
import { db } from '../../compartido/db';
import type { Ejercicio } from '../../compartido/tipos';
import { nuevoId } from '../../compartido/utilidades/id';
import { prepararFoto, useUrlObjeto } from './foto';
import { GRUPOS_MUSCULARES } from './formato';

// Crea un ejercicio (/entrenamiento/ejercicios/nuevo) o corrige uno (/entrenamiento/ejercicios/:id/editar).
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
  const [descripcion, setDescripcion] = useState(original?.descripcion ?? '');
  const [foto, setFoto] = useState<Blob | undefined>(original?.foto);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const faltaNombre = nombre.trim() === '';
  const faltaGrupo = grupo === '';
  // Los precargados ya traen sus fotos; la foto propia es para los que no tienen.
  const admiteFoto = !original?.imagenes?.length;
  const volverA = original ? `/entrenamiento/ejercicios/${original.id}` : '/entrenamiento/ejercicios';

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (faltaNombre || faltaGrupo) return;

    const datos = { nombre: nombre.trim(), grupoMuscular: grupo, descripcion: descripcion.trim() };
    if (original) {
      // Una foto undefined borra la que hubiera.
      await db.ejercicios.update(original.id, { ...datos, foto });
    } else {
      await db.ejercicios.add({ id: nuevoId(), ...datos, ...(foto && { foto }) });
    }
    navigate(volverA);
  }

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={original ? 'Editar ejercicio' : 'Nuevo ejercicio'} volverA={volverA} />

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

        <div className="flex flex-col gap-2">
          <label htmlFor="descripcion" className="text-base font-semibold">
            ¿Cómo se hace? <span className="font-normal text-slate-600">(opcional)</span>
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={5}
            maxLength={1500}
            placeholder="Por ejemplo: con los pies al ancho de los hombros, baja como si te sentaras en una silla…"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
          />
        </div>

        {admiteFoto && <CampoFoto foto={foto} onCambiar={setFoto} />}

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

function CampoFoto({ foto, onCambiar }: { foto: Blob | undefined; onCambiar: (foto: Blob | undefined) => void }) {
  const url = useUrlObjeto(foto);
  const [preparando, setPreparando] = useState(false);
  const [error, setError] = useState('');
  const [confirmandoQuitar, setConfirmandoQuitar] = useState(false);

  async function elegir(archivo: File) {
    setPreparando(true);
    setError('');
    try {
      onCambiar(await prepararFoto(archivo));
    } catch {
      setError('No se pudo usar esa foto. Prueba con otra.');
    } finally {
      setPreparando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-semibold">
        Foto <span className="font-normal text-slate-600">(opcional)</span>
      </span>

      {url && (
        <img src={url} alt="Foto del ejercicio" className="max-h-[40dvh] w-full rounded-xl bg-slate-100 object-contain" />
      )}

      {/* Sin «capture»: así el teléfono ofrece tanto la cámara como la galería. */}
      <label
        className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 active:bg-slate-100 has-focus-visible:outline-2 has-focus-visible:outline-sky-700 ${
          preparando ? 'opacity-60' : ''
        }`}
      >
        <Camera size={22} aria-hidden="true" />
        {preparando ? 'Preparando foto…' : foto ? 'Cambiar foto' : 'Tomar o elegir foto'}
        <input
          type="file"
          accept="image/*"
          disabled={preparando}
          className="sr-only"
          onChange={(e) => {
            const archivo = e.currentTarget.files?.[0];
            e.currentTarget.value = '';
            if (archivo) void elegir(archivo);
          }}
        />
      </label>

      {foto && (
        <button
          type="button"
          onClick={() => setConfirmandoQuitar(true)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold text-red-700 active:bg-red-50"
        >
          <Trash size={20} aria-hidden="true" />
          Quitar foto
        </button>
      )}

      {error && <MensajeError texto={error} />}

      <DialogoConfirmacion
        abierto={confirmandoQuitar}
        titulo="¿Quitar la foto?"
        mensaje="La foto se quitará de este ejercicio al guardar."
        textoConfirmar="Sí, quitar"
        onConfirmar={() => {
          onCambiar(undefined);
          setConfirmandoQuitar(false);
        }}
        onCancelar={() => setConfirmandoQuitar(false)}
      />
    </div>
  );
}
