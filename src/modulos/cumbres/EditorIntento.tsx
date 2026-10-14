import { Trash } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import AvisoAltura from '../../compartido/componentes/AvisoAltura';
import DialogoConfirmacion from '../../compartido/componentes/DialogoConfirmacion';
import Encabezado from '../../compartido/componentes/Encabezado';
import MensajeError from '../../compartido/componentes/MensajeError';
import { db } from '../../compartido/db';
import type { Intento, Resultado } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { formatearFecha, hoyISO } from '../../compartido/utilidades/fechas';
import { nuevoId } from '../../compartido/utilidades/id';
import { DetalleClima } from './ClimaIntento';
import { ORDEN_RESULTADOS, RESULTADOS } from './resultados';

// Crea un intento (/cumbres/nuevo) o edita uno existente (/cumbres/:id).
export default function EditorIntento() {
  const { id } = useParams();
  const esNuevo = id === undefined;

  // undefined = cargando, null = no existe. Se lee una sola vez (no en vivo)
  // para que al borrar no aparezca un instante el aviso de "no encontrado".
  const [original, setOriginal] = useState<Intento | null | undefined>(esNuevo ? null : undefined);

  useEffect(() => {
    if (esNuevo) return;
    db.intentos.get(id).then((intento) => setOriginal(intento ?? null));
  }, [id, esNuevo]);

  if (!esNuevo && original === undefined) return null;

  if (!esNuevo && original === null) {
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo="Intento no encontrado" volverA="/cumbres" />
        <p className="text-base text-slate-700">Este intento ya no existe. Puede que se haya borrado.</p>
      </div>
    );
  }

  return <Formulario original={original ?? null} />;
}

function Formulario({ original }: { original: Intento | null }) {
  const navigate = useNavigate();
  const montanas = useConsulta(() =>
    db.montanas.toArray().then((lista) => lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
  );

  const [montanaId, setMontanaId] = useState(original?.montanaId ?? '');
  const [fecha, setFecha] = useState(original?.fecha ?? hoyISO());
  const [resultado, setResultado] = useState<Resultado | null>(original?.resultado ?? null);
  const [notas, setNotas] = useState(original?.notas ?? '');
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const faltaMontana = montanaId === '';
  const faltaFecha = fecha === '';
  const faltaResultado = resultado === null;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (faltaMontana || faltaFecha || faltaResultado) return;

    if (original) {
      // Se compara contra lo guardado ahora, no contra lo que se cargó al abrir:
      // el clima pudo llegar mientras el formulario estaba abierto.
      await db.transaction('rw', db.intentos, async () => {
        const actual = await db.intentos.get(original.id);
        if (!actual) return;
        // Si cambia la montaña o el día, el clima guardado ya no corresponde:
        // se descarta y queda pendiente de volver a consultarse.
        const cambioLugarOFecha = actual.montanaId !== montanaId || actual.fecha !== fecha;
        await db.intentos.update(original.id, {
          montanaId,
          fecha,
          resultado,
          notas: notas.trim(),
          ...(cambioLugarOFecha ? { condiciones: null, climaPendiente: true } : {}),
        });
      });
    } else {
      await db.intentos.add({
        id: nuevoId(),
        montanaId,
        fecha,
        resultado,
        notas: notas.trim(),
        condiciones: null,
        climaPendiente: true,
      });
    }
    navigate('/cumbres');
  }

  async function borrar() {
    if (!original) return;
    await db.intentos.delete(original.id);
    navigate('/cumbres');
  }

  const nombreOriginal = montanas?.find((m) => m.id === original?.montanaId)?.nombre;
  const montanaElegida = montanas?.find((m) => m.id === montanaId);

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={original ? 'Editar intento' : 'Nuevo intento'} volverA="/cumbres" />

      {original && <ClimaGuardado intentoId={original.id} />}

      <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="montana" className="text-base font-semibold">
            Montaña
          </label>
          <select
            id="montana"
            value={montanaId}
            onChange={(e) => setMontanaId(e.target.value)}
            aria-invalid={intentoEnviar && faltaMontana}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
          >
            <option value="" disabled>
              Elige una montaña
            </option>
            {montanas?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} ({m.altitud.toLocaleString('es-MX')} m)
              </option>
            ))}
          </select>
          {intentoEnviar && faltaMontana && <MensajeError texto="Elige la montaña." />}
          {montanaElegida && <AvisoAltura nombre={montanaElegida.nombre} altitud={montanaElegida.altitud} />}
        </div>

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

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-semibold">¿Cómo te fue?</legend>
          <div className="flex flex-col gap-3">
            {ORDEN_RESULTADOS.map((r) => {
              const { etiqueta, Icono, claseSeleccionado } = RESULTADOS[r];
              const seleccionado = resultado === r;
              return (
                <label
                  key={r}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-lg font-medium has-focus-visible:outline-2 has-focus-visible:outline-sky-700 ${
                    seleccionado ? claseSeleccionado : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="resultado"
                    value={r}
                    checked={seleccionado}
                    onChange={() => setResultado(r)}
                    className="sr-only"
                  />
                  <Icono size={26} aria-hidden="true" />
                  {etiqueta}
                </label>
              );
            })}
          </div>
          {intentoEnviar && faltaResultado && <MensajeError texto="Elige cómo te fue." />}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="notas" className="text-base font-semibold">
            Notas <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            placeholder="Ruta, compañeros, cómo te sentiste…"
            className="rounded-xl border border-slate-300 bg-white p-3 text-base"
          />
        </div>

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
            Borrar intento
          </button>

          <DialogoConfirmacion
            abierto={confirmandoBorrado}
            titulo="¿Borrar este intento?"
            mensaje={`Se borrará tu intento en ${nombreOriginal ?? 'esta montaña'} del ${formatearFecha(original.fecha)}. Esto no se puede deshacer.`}
            textoConfirmar="Sí, borrar"
            onConfirmar={borrar}
            onCancelar={() => setConfirmandoBorrado(false)}
          />
        </>
      )}
    </div>
  );
}

// Se lee en vivo para que aparezca en cuanto llegue, aunque la pantalla ya esté abierta.
function ClimaGuardado({ intentoId }: { intentoId: string }) {
  const intento = useConsulta(() => db.intentos.get(intentoId), [intentoId]);
  return intento ? <DetalleClima intento={intento} /> : null;
}
