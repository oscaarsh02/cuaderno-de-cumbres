import { Link, useLocation } from 'react-router'
import { posponerInstalacion, useInstalacion } from '../useInstalacion'

export default function AvisoInstalacion() {
  const estado = useInstalacion()
  const { pathname } = useLocation()
  if (estado.instalada || estado.pospuesta || pathname === '/ajustes/instalacion') return null
  return (
    <aside aria-label="Instalación de la aplicación" className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <p className="font-semibold">Lleva tus cumbres contigo</p>
      <p className="mt-2">Instala la aplicación para abrirla desde tu pantalla de inicio. Prepárala con conexión antes de salir.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to="/ajustes/instalacion" className="flex min-h-11 items-center rounded-lg px-2 font-semibold text-sky-800 underline">Cómo instalar</Link>
        <button type="button" onClick={posponerInstalacion} className="min-h-11 rounded-lg px-2 text-slate-700">Ahora no</button>
      </div>
    </aside>
  )
}
