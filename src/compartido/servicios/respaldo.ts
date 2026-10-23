import { db } from '../db'
import type { ArticuloEquipo, Ejercicio, Intento, Montana, Sesion } from '../tipos'

/** Contrato de intercambio; independiente de la versión interna de IndexedDB. */
export interface RespaldoV1 {
  formato: 'cuaderno-de-cumbres'
  version: 1
  creadoEn: string
  datos: {
    montanas: Montana[]
    intentos: Intento[]
    equipo: ArticuloEquipo[]
    ejercicios: Ejercicio[]
    sesiones: Sesion[]
  }
}

export async function crearRespaldo(): Promise<RespaldoV1> {
  // Una sola transacción garantiza una fotografía coherente de los tres módulos.
  return db.transaction('r', db.tables, async () => {
    const [montanas, intentos, equipo, ejercicios, sesiones] = await Promise.all([
      db.montanas.toArray(),
      db.intentos.toArray(),
      db.equipo.toArray(),
      db.ejercicios.toArray(),
      db.sesiones.toArray(),
    ])
    return {
      formato: 'cuaderno-de-cumbres',
      version: 1,
      creadoEn: new Date().toISOString(),
      datos: { montanas, intentos, equipo, ejercicios, sesiones },
    }
  })
}

export async function descargarRespaldo(): Promise<void> {
  const respaldo = await crearRespaldo()
  const archivo = new Blob([JSON.stringify(respaldo, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `cuaderno-de-cumbres-${respaldo.creadoEn.replace(/[:.]/g, '-')}.json`
  try {
    document.body.appendChild(enlace)
    enlace.click()
  } finally {
    enlace.remove()
    // Permite que el navegador inicie la descarga antes de liberar el archivo.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
