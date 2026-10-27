import { Dumbbell, HeartPulse, Mountain, Backpack, Settings, type LucideIcon } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import AvisoInstalacion from '../compartido/componentes/AvisoInstalacion'

const PESTANAS: { ruta: string; etiqueta: string; Icono: LucideIcon }[] = [
  { ruta: '/cumbres', etiqueta: 'Cumbres', Icono: Mountain },
  { ruta: '/equipo', etiqueta: 'Equipo', Icono: Backpack },
  { ruta: '/entrenamiento', etiqueta: 'Entrenamiento', Icono: Dumbbell },
]

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      {/* La guía de mal de altura queda a un toque desde cualquier pantalla. */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)] pr-1 pl-4">
        <span className="text-base font-semibold text-slate-700">Cuaderno de Cumbres</span>
        <div className="flex shrink-0">
          <Link
            to="/ajustes"
            aria-label="Ajustes"
            className="flex size-12 items-center justify-center rounded-xl text-slate-700 active:bg-slate-100"
          >
            <Settings size={26} aria-hidden="true" />
          </Link>
          <Link
            to="/altura"
            aria-label="Guía de mal de altura"
            className="flex size-12 items-center justify-center rounded-xl text-red-800 active:bg-red-50"
          >
            <HeartPulse size={28} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Espacio inferior para que la barra de pestañas no tape el contenido. */}
      <main className="flex-1 px-4 pt-4 pb-28">
        <AvisoInstalacion />
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
        aria-label="Secciones"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-3">
          {PESTANAS.map(({ ruta, etiqueta, Icono }) => (
            <li key={ruta}>
              <NavLink
                to={ruta}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-base font-medium ${
                    isActive ? 'text-sky-800' : 'text-slate-500'
                  }`
                }
              >
                <Icono size={28} aria-hidden="true" />
                {etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
