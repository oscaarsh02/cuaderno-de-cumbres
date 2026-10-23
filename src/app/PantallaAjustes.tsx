import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import Encabezado from '../compartido/componentes/Encabezado'
import MensajeError from '../compartido/componentes/MensajeError'
import { descargarRespaldo } from '../compartido/servicios/respaldo'

export default function PantallaAjustes() {
  const enCurso = useRef(false)
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

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
      <Encabezado titulo="Ajustes" volverA="/cumbres" />
      <section aria-labelledby="titulo-respaldo" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="titulo-respaldo" className="text-xl font-semibold">Respaldo de datos</h2>
        <p>Descarga un archivo con todas tus cumbres, equipo y entrenamientos, incluidos tus catálogos de montañas y ejercicios.</p>
        <p>También funciona sin conexión. Conserva una copia fuera de este dispositivo para proteger tus registros.</p>
        <button
          type="button"
          onClick={exportar}
          disabled={exportando}
          aria-busy={exportando}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          <Download size={24} aria-hidden="true" />
          {exportando ? 'Preparando respaldo…' : 'Descargar respaldo'}
        </button>
        {error && <MensajeError texto={error} />}
        <p role="status">{mensaje}</p>
      </section>
    </div>
  )
}
