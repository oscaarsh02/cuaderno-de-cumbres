import { useSyncExternalStore } from 'react'

interface SolicitudInstalacion extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const modoAplicacion = window.matchMedia('(display-mode: standalone)')
const instalada = () => modoAplicacion.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const CLAVE_AVISO = 'cumbres-instalacion-pospuesta'
function avisoPospuesto() {
  try { return sessionStorage.getItem(CLAVE_AVISO) === '1' } catch { return false }
}

let solicitud: SolicitudInstalacion | null = null
let estado = { instalada: instalada(), disponible: false, procesando: false, pospuesta: avisoPospuesto(), sinConexion: false, mensaje: '' }
const oyentes = new Set<() => void>()
function actualizar(cambios: Partial<typeof estado>) {
  estado = { ...estado, ...cambios }
  oyentes.forEach(avisar => avisar())
}

// Escuchas de vida de la aplicación: se registran antes de montar React para
// conservar el evento incluso si el usuario todavía no ha abierto Ajustes.
window.addEventListener('beforeinstallprompt', evento => {
  evento.preventDefault()
  solicitud = evento as SolicitudInstalacion
  actualizar({ disponible: true })
})
window.addEventListener('appinstalled', () => {
  solicitud = null
  actualizar({ instalada: true, disponible: false, mensaje: 'Aplicación instalada. Ábrela desde su icono.' })
})
modoAplicacion.addEventListener('change', () => actualizar({ instalada: instalada() }))
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.ready.then(() => actualizar({ sinConexion: true })).catch(() => {})
}

export function posponerInstalacion() {
  try { sessionStorage.setItem(CLAVE_AVISO, '1') } catch { /* La navegación sigue funcionando sin almacenamiento. */ }
  actualizar({ pospuesta: true })
}

export async function instalarAplicacion() {
  if (!solicitud || estado.procesando || estado.instalada) return
  const evento = solicitud
  solicitud = null // Cada evento solo puede usarse una vez.
  actualizar({ disponible: false, procesando: true, mensaje: '' })
  try {
    await evento.prompt()
    const { outcome } = await evento.userChoice
    actualizar({ mensaje: outcome === 'accepted'
      ? 'Solicitud aceptada. Sigue las indicaciones del navegador para terminar.'
      : 'Instalación cancelada. Puedes seguir usando la aplicación y consultar las instrucciones cuando quieras.' })
  } catch {
    actualizar({ mensaje: 'No se pudo abrir la instalación. Usa las instrucciones del navegador que aparecen abajo.' })
  } finally {
    actualizar({ procesando: false })
  }
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar)
  return () => { oyentes.delete(avisar) }
}

export function useInstalacion() {
  return useSyncExternalStore(suscribir, () => estado)
}
