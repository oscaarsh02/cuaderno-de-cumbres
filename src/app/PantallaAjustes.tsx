import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { db, ID_PERFIL } from '../compartido/db'
import Encabezado from '../compartido/componentes/Encabezado'
import MensajeError from '../compartido/componentes/MensajeError'
import DialogoConfirmacion from '../compartido/componentes/DialogoConfirmacion'
import { contarFotosPropias, descargarRespaldo, type RespaldoV1 } from '../compartido/servicios/respaldo'
import { useConsulta } from '../compartido/useConsulta'
import { leerRespaldo, RespaldoInvalido, restaurarRespaldo } from '../compartido/servicios/restauracion'

export default function PantallaAjustes() {
  const enCurso = useRef(false)
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [importando, setImportando] = useState(false)
  const [pendiente, setPendiente] = useState<RespaldoV1 | null>(null)
  const [restauraciones, setRestauraciones] = useState(0)
  const fotosPropias = useConsulta(contarFotosPropias)

  async function seleccionar(archivo: File) {
    if (enCurso.current || pendiente) return
    enCurso.current = true
    setImportando(true)
    setError('')
    setMensaje('')
    try {
      setPendiente(await leerRespaldo(archivo))
    } catch (e) {
      setError(e instanceof RespaldoInvalido ? e.message : 'No se pudo abrir el archivo. Inténtalo de nuevo. Tus datos no han cambiado.')
    } finally {
      enCurso.current = false
      setImportando(false)
    }
  }

  async function restaurar() {
    if (enCurso.current || !pendiente) return
    enCurso.current = true
    setImportando(true)
    const respaldo = pendiente
    setPendiente(null)
    setError('')
    setMensaje('')
    try {
      await restaurarRespaldo(respaldo)
      setRestauraciones(n => n + 1)
      setMensaje('Respaldo restaurado. Ya puedes consultar tus cumbres, equipo y entrenamientos.')
    } catch {
      setError('No se pudo restaurar el respaldo. Se conservaron tus datos anteriores. Inténtalo de nuevo.')
    } finally {
      enCurso.current = false
      setImportando(false)
    }
  }

  async function exportar() {
    if (enCurso.current) return
    enCurso.current = true
    setExportando(true)
    setError('')
    setMensaje('')
    try {
      await descargarRespaldo()
      setMensaje('Se inició la descarga. Guarda el archivo en un lugar seguro.')
    } catch {
      setError('No se pudo crear el respaldo. Tus datos siguen guardados. Inténtalo de nuevo.')
    } finally {
      enCurso.current = false
      setExportando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Ajustes" volverA="/entrenamiento" />
      <Link to="/ajustes/instalacion" className="flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-sky-800 underline underline-offset-4">
        Instalar la aplicación
      </Link>
      <Link to="/ajustes/privacidad" className="flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-sky-800 underline underline-offset-4">
        Atribuciones y privacidad
      </Link>
      {/* La key la vuelve a montar tras restaurar, para que lea el peso del respaldo. */}
      <SeccionMiPeso key={restauraciones} />
      <section aria-labelledby="titulo-respaldo" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="titulo-respaldo" className="text-xl font-semibold">Respaldo de datos</h2>
        <p>Descarga un archivo con todas tus cumbres, equipo y entrenamientos, incluidos tus catálogos de montañas y ejercicios.</p>
        <p>También funciona sin conexión. Conserva una copia fuera de este dispositivo para proteger tus registros.</p>
        {fotosPropias !== undefined && fotosPropias > 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
            El respaldo no incluye las fotos que agregaste a tus ejercicios ({fotosPropias === 1 ? '1 foto' : `${fotosPropias} fotos`}).
          </p>
        )}
        <button
          type="button"
          onClick={exportar}
          disabled={exportando || importando || pendiente !== null}
          aria-busy={exportando}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          <Download size={24} aria-hidden="true" />
          {exportando ? 'Preparando respaldo…' : 'Descargar respaldo'}
        </button>
      </section>
      <section aria-labelledby="titulo-restaurar" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="titulo-restaurar" className="text-xl font-semibold">Restaurar datos</h2>
        <p>Selecciona un respaldo para recuperar tus registros. Reemplazará todos los datos actuales de los tres módulos, incluidos los catálogos. Te pediremos confirmación antes de continuar.</p>
        <p>Te recomendamos descargar primero un respaldo de tus datos actuales.</p>
        <label htmlFor="archivo-respaldo" className="text-base font-semibold">Archivo de respaldo</label>
        <input
          id="archivo-respaldo"
          type="file"
          accept=".json,application/json"
          disabled={exportando || importando || pendiente !== null}
          className="min-h-12 w-full min-w-0 rounded-xl border border-slate-300 p-2 text-base file:mr-2 file:min-h-11 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 disabled:opacity-60"
          onChange={e => {
            const archivo = e.currentTarget.files?.[0]
            e.currentTarget.value = ''
            if (archivo) void seleccionar(archivo)
          }}
        />
      </section>
      {error && <MensajeError texto={error} />}
      <p role="status">{importando ? 'Procesando respaldo…' : mensaje}</p>
      <DialogoConfirmacion
        abierto={pendiente !== null}
        titulo="¿Reemplazar todos tus datos?"
        mensaje={pendiente
          ? `El respaldo contiene ${pendiente.datos.intentos.length} intentos de cumbre, ${pendiente.datos.equipo.length} artículos de equipo, ${pendiente.datos.sesiones.length} sesiones, ${pendiente.datos.montanas.length} montañas y ${pendiente.datos.ejercicios.length} ejercicios. Se eliminarán los datos actuales y se reemplazarán por este respaldo, incluso si está vacío. Esta acción no se puede deshacer.`
          : ''}
        textoConfirmar="Reemplazar y restaurar"
        onConfirmar={() => void restaurar()}
        onCancelar={() => setPendiente(null)}
      />
    </div>
  )
}

// Peso corporal opcional; el módulo de Equipo lo usa para comparar con la carga de la mochila.
function SeccionMiPeso() {
  const [texto, setTexto] = useState('')
  const [cargado, setCargado] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    db.perfil.get(ID_PERFIL).then(perfil => {
      setTexto(perfil?.pesoCorporalKg?.toLocaleString('es-MX') ?? '')
      setCargado(true)
    })
  }, [])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')
    // Acepta "72", "72.5" o "72,5".
    const limpio = texto.trim().replace(',', '.')
    if (limpio === '') {
      await db.perfil.put({ id: ID_PERFIL })
      setMensaje('Se quitó tu peso.')
      return
    }
    const kg = Number(limpio)
    if (!/^\d+(\.\d+)?$/.test(limpio) || kg < 20 || kg > 300) {
      setError('Escribe tu peso en kilos, solo con números (por ejemplo: 70).')
      return
    }
    await db.perfil.put({ id: ID_PERFIL, pesoCorporalKg: kg })
    setMensaje('Peso guardado.')
  }

  return (
    <section aria-labelledby="titulo-mi-peso" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 id="titulo-mi-peso" className="text-xl font-semibold">Mi peso</h2>
      <p>Opcional. Sirve para saber si la mochila que armaste en Equipo es una carga razonable para ti. Solo se guarda en este dispositivo.</p>
      <form onSubmit={guardar} noValidate className="flex flex-col gap-3">
        <label htmlFor="peso-corporal" className="text-base font-semibold">Mi peso</label>
        <div className="flex items-center gap-2">
          <input
            id="peso-corporal"
            type="text"
            inputMode="decimal"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            disabled={!cargado}
            placeholder="Por ejemplo: 70"
            autoComplete="off"
            aria-invalid={error !== ''}
            className="min-h-12 w-32 rounded-xl border border-slate-300 bg-white px-3 text-base"
          />
          <span className="text-base text-slate-700">kilos</span>
        </div>
        {error && <MensajeError texto={error} />}
        <button
          type="submit"
          disabled={!cargado}
          className="min-h-12 rounded-xl bg-sky-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          Guardar
        </button>
        <p role="status" className="text-base text-slate-700">{mensaje}</p>
      </form>
    </section>
  )
}
