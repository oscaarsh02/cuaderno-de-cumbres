import { Clock, Plus, Trash, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import Encabezado from '../../compartido/componentes/Encabezado';
import MensajeError from '../../compartido/componentes/MensajeError';
import { db } from '../../compartido/db';
import type { Ejercicio, Serie, Sesion } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { formatearFecha, hoyISO } from '../../compartido/utilidades/fechas';
import { nuevoId } from '../../compartido/utilidades/id';
import { agruparPorEjercicio, formatearSerie } from './formato';

// En el formulario los números se manejan como texto para permitir campos
// vacíos mientras se escribe; se convierten al guardar.
interface FilaSerie {
  clave: string;
  repeticiones: string;
  peso: string;
}

interface Bloque {
  ejercicioId: string;
  filas: FilaSerie[];
}

const filaVacia = (): FilaSerie => ({ clave: nuevoId(), repeticiones: '', peso: '' });

function leerRepeticiones(texto: string): number | null {
  return /^\d+$/.test(texto.trim()) && Number(texto) > 0 ? Number(texto) : null;
}

// Vacío cuenta como "sin peso". Acepta coma o punto decimal.
function leerPeso(texto: string): number | null {
  if (texto.trim() === '') return 0;
  const n = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const filaValida = (f: FilaSerie) => leerRepeticiones(f.repeticiones) !== null && leerPeso(f.peso) !== null;

// Registra una sesión (/entrenamiento/nueva) o edita una existente (/entrenamiento/:id).
export default function EditorSesion() {
  const { id } = useParams();
  const esNuevo = id === undefined;
  const [original, setOriginal] = useState<Sesion | null | undefined>(esNuevo ? null : undefined);

  useEffect(() => {
    if (esNuevo) return;
    db.sesiones.get(id).then((sesion) => setOriginal(sesion ?? null));
  }, [id, esNuevo]);

  if (!esNuevo && original === undefined) return null;

  if (!esNuevo && original === null) {
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo="Sesión no encontrada" volverA="/entrenamiento" />
        <p className="text-base text-slate-700">Esta sesión ya no existe. Puede que se haya borrado.</p>
      </div>
    );
  }

  return <Formulario original={original ?? null} />;
}

function Formulario({ original }: { original: Sesion | null }) {
  const navigate = useNavigate();
  const ejercicios = useConsulta(() =>
    db.ejercicios.toArray().then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
  );

  const [fecha, setFecha] = useState(original?.fecha ?? hoyISO());
  const [bloques, setBloques] = useState<Bloque[]>(() =>
    original
      ? agruparPorEjercicio(original.series).map((g) => ({
          ejercicioId: g.ejercicioId,
          filas: g.series.map((s) => ({ clave: nuevoId(), repeticiones: String(s.repeticiones), peso: String(s.pesoKg) })),
        }))
      : [],
  );
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const faltaFecha = fecha === '';
  const sinEjercicios = bloques.length === 0;
  const hayFilasMal = bloques.some((b) => b.filas.some((f) => !filaValida(f)));
  const ejercicioPorId = new Map(ejercicios?.map((e) => [e.id, e]));
  const disponibles = ejercicios?.filter((e) => !bloques.some((b) => b.ejercicioId === e.id)) ?? [];

  function cambiarBloque(ejercicioId: string, filas: FilaSerie[]) {
    setBloques((actuales) =>
      filas.length === 0
        ? actuales.filter((b) => b.ejercicioId !== ejercicioId)
        : actuales.map((b) => (b.ejercicioId === ejercicioId ? { ...b, filas } : b)),
    );
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (faltaFecha || sinEjercicios || hayFilasMal) return;

    const series: Serie[] = bloques.flatMap((b) =>
      b.filas.map((f) => ({
        ejercicioId: b.ejercicioId,
        repeticiones: leerRepeticiones(f.repeticiones)!,
        pesoKg: leerPeso(f.peso)!,
      })),
    );

    await db.sesiones.put({ id: original?.id ?? nuevoId(), fecha, series });
    navigate('/entrenamiento');
  }

  async function borrar() {
    if (!original) return;
    await db.sesiones.delete(original.id);
    navigate('/entrenamiento');
  }

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={original ? 'Editar sesión' : 'Nueva sesión'} volverA="/entrenamiento" />

      <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="fecha" className="text-base font-semibold">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            aria-invalid={intentoEnviar && faltaFecha}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
          />
          {intentoEnviar && faltaFecha && <MensajeError texto="Elige la fecha." />}
        </div>

        {bloques.map((bloque) => (
          <BloqueEjercicio
            key={bloque.ejercicioId}
            bloque={bloque}
            ejercicio={ejercicioPorId.get(bloque.ejercicioId)}
            fecha={fecha}
            sesionId={original?.id}
            mostrarErrores={intentoEnviar}
            onCambiar={(filas) => cambiarBloque(bloque.ejercicioId, filas)}
          />
        ))}

        {ejercicios && ejercicios.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-base text-slate-700">
            Primero crea los ejercicios que haces en{' '}
            <Link to="/entrenamiento/ejercicios/nuevo" className="font-semibold text-sky-800 underline">
              Mis ejercicios
            </Link>
            .
          </p>
        ) : (
          disponibles.length > 0 && (
            <div className="flex flex-col gap-2">
              <label htmlFor="agregar" className="text-base font-semibold">
                {bloques.length === 0 ? '¿Qué ejercicio hiciste?' : 'Agregar otro ejercicio'}
              </label>
              <select
                id="agregar"
                value=""
                onChange={(e) =>
                  setBloques((actuales) => [...actuales, { ejercicioId: e.target.value, filas: [filaVacia()] }])
                }
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
              >
                <option value="" disabled>
                  Elige un ejercicio
                </option>
                {disponibles.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.grupoMuscular})
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        {intentoEnviar && sinEjercicios && <MensajeError texto="Agrega al menos un ejercicio." />}

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
            Borrar sesión
          </button>

          <DialogoConfirmacion
            abierto={confirmandoBorrado}
            titulo="¿Borrar esta sesión?"
            mensaje={`Se borrará tu sesión del ${formatearFecha(original.fecha)} con todas sus series. Esto no se puede deshacer.`}
            textoConfirmar="Sí, borrar"
            onConfirmar={borrar}
            onCancelar={() => setConfirmandoBorrado(false)}
          />
        </>
      )}
    </div>
  );
}

interface PropsBloque {
  bloque: Bloque;
  ejercicio: Ejercicio | undefined;
  fecha: string;
  sesionId: string | undefined;
  mostrarErrores: boolean;
  onCambiar: (filas: FilaSerie[]) => void;
}

function BloqueEjercicio({ bloque, ejercicio, fecha, sesionId, mostrarErrores, onCambiar }: PropsBloque) {
  const { filas } = bloque;
  const nombre = ejercicio?.nombre ?? 'Ejercicio';
  const hayMal = mostrarErrores && filas.some((f) => !filaValida(f));

  const cambiarFila = (clave: string, cambio: Partial<FilaSerie>) =>
    onCambiar(filas.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));

  // La nueva serie copia la anterior: casi siempre se repiten peso y repeticiones.
  const agregarSerie = () => {
    const ultima = filas.at(-1);
    onCambiar([...filas, { ...filaVacia(), repeticiones: ultima?.repeticiones ?? '', peso: ultima?.peso ?? '' }]);
  };

  const claseCampo = (mal: boolean) =>
    `min-h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-base ${mal ? 'border-red-600' : 'border-slate-300'}`;

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold">{nombre}</h2>
        <button
          type="button"
          onClick={() => onCambiar([])}
          className="-mt-1 -mr-2 min-h-11 shrink-0 px-2 text-base font-medium text-red-700"
        >
          Quitar
        </button>
      </div>

      <ReferenciaAnterior ejercicioId={bloque.ejercicioId} fecha={fecha} sesionId={sesionId} />

      <div className="grid grid-cols-[1.5rem_1fr_1fr_2.75rem] items-center gap-2">
        <span aria-hidden="true" />
        <span className="text-base font-medium text-slate-600">Repeticiones</span>
        <span className="text-base font-medium text-slate-600">Peso (kg)</span>
        <span aria-hidden="true" />

        {filas.map((fila, i) => {
          const n = i + 1;
          return (
            <div key={fila.clave} className="contents">
              <span className="text-base font-semibold text-slate-500">{n}</span>
              <input
                type="text"
                inputMode="numeric"
                value={fila.repeticiones}
                onChange={(e) => cambiarFila(fila.clave, { repeticiones: e.target.value })}
                aria-label={`Repeticiones de la serie ${n} de ${nombre}`}
                aria-invalid={mostrarErrores && leerRepeticiones(fila.repeticiones) === null}
                className={claseCampo(mostrarErrores && leerRepeticiones(fila.repeticiones) === null)}
              />
              <input
                type="text"
                inputMode="decimal"
                value={fila.peso}
                onChange={(e) => cambiarFila(fila.clave, { peso: e.target.value })}
                placeholder="0"
                aria-label={`Peso en kilos de la serie ${n} de ${nombre}`}
                aria-invalid={mostrarErrores && leerPeso(fila.peso) === null}
                className={claseCampo(mostrarErrores && leerPeso(fila.peso) === null)}
              />
              <button
                type="button"
                onClick={() => onCambiar(filas.filter((f) => f.clave !== fila.clave))}
                aria-label={`Quitar la serie ${n} de ${nombre}`}
                className="flex size-11 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {hayMal && (
        <MensajeError texto="Revisa las series marcadas: las repeticiones deben ser un número entero y el peso un número (déjalo vacío si no usaste peso)." />
      )}

      <button
        type="button"
        onClick={agregarSerie}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
      >
        <Plus size={22} aria-hidden="true" />
        Agregar serie
      </button>
    </section>
  );
}

// RF-18: la última vez que se hizo este ejercicio antes de esta sesión.
function ReferenciaAnterior({ ejercicioId, fecha, sesionId }: { ejercicioId: string; fecha: string; sesionId?: string }) {
  const anterior = useConsulta(async () => {
    if (!fecha) return null;
    const previas = await db.sesiones.where('fecha').belowOrEqual(fecha).reverse().toArray();
    return previas.find((s) => s.id !== sesionId && s.series.some((serie) => serie.ejercicioId === ejercicioId)) ?? null;
  }, [ejercicioId, fecha, sesionId]);

  if (anterior === undefined) return null;

  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-3 text-base text-slate-700">
      <Clock size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      {anterior === null ? (
        <p>Es la primera vez que registras este ejercicio.</p>
      ) : (
        <div>
          <p className="font-semibold">La vez anterior · {formatearFecha(anterior.fecha)}</p>
          <ul>
            {anterior.series
              .filter((s) => s.ejercicioId === ejercicioId)
              .map((s, i) => (
                <li key={i}>
                  Serie {i + 1}: {formatearSerie(s)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
