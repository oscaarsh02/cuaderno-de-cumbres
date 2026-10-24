import { db } from '../db'
import type { RespaldoV1 } from './respaldo'

export class RespaldoInvalido extends Error {}

function exigir(condicion: unknown): asserts condicion {
  if (!condicion) throw new RespaldoInvalido('El respaldo está incompleto o contiene datos inválidos. Selecciona un archivo generado desde Ajustes.')
}

function objeto(valor: unknown): Record<string, unknown> {
  exigir(typeof valor === 'object' && valor !== null && !Array.isArray(valor))
  return valor as Record<string, unknown>
}

const texto = (v: unknown): v is string => typeof v === 'string'
const id = (v: unknown): v is string => texto(v) && v.trim().length > 0
const numero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const booleano = (v: unknown) => typeof v === 'boolean'
const fecha = (v: unknown) => texto(v) && /^\d{4}-\d{2}-\d{2}$/.test(v)
  && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v

function tabla(valor: unknown, validar: (registro: Record<string, unknown>) => void): Set<string> {
  exigir(Array.isArray(valor))
  const ids = new Set<string>()
  for (const entrada of valor) {
    const registro = objeto(entrada)
    exigir(id(registro.id) && !ids.has(registro.id))
    ids.add(registro.id)
    validar(registro)
  }
  return ids
}

/** Valida datos externos antes de tratarlos como el contrato RF-21. */
export function validarRespaldo(valor: unknown): RespaldoV1 {
  const respaldo = objeto(valor)
  exigir(respaldo.formato === 'cuaderno-de-cumbres')
  if (respaldo.version !== 1) {
    throw new RespaldoInvalido('Esta versión de respaldo no es compatible con la aplicación.')
  }
  exigir(texto(respaldo.creadoEn) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(respaldo.creadoEn)
    && Number.isFinite(Date.parse(respaldo.creadoEn)) && new Date(respaldo.creadoEn).toISOString() === respaldo.creadoEn)
  const datos = objeto(respaldo.datos)
  const montanas = tabla(datos.montanas, r => {
    exigir(texto(r.nombre) && numero(r.latitud) && numero(r.longitud) && numero(r.altitud) && booleano(r.precargada))
  })
  tabla(datos.intentos, r => {
    exigir(id(r.montanaId) && montanas.has(r.montanaId) && fecha(r.fecha)
      && texto(r.resultado) && ['cumbre', 'regreso', 'cancelado'].includes(r.resultado)
      && texto(r.notas) && booleano(r.climaPendiente))
    if (r.condiciones !== null) {
      const clima = objeto(r.condiciones)
      exigir(['tempMax', 'tempMin', 'precipitacion', 'vientoMax', 'rachasMax', 'codigoClima'].every(campo => numero(clima[campo])))
    }
  })
  tabla(datos.equipo, r => {
    exigir(texto(r.nombre) && texto(r.categoria)
      && ['abrigo', 'tecnico', 'campamento', 'comida', 'botiquin', 'otros'].includes(r.categoria)
      && booleano(r.empacado))
  })
  const ejercicios = tabla(datos.ejercicios, r => exigir(texto(r.nombre) && texto(r.grupoMuscular)))
  tabla(datos.sesiones, r => {
    exigir(fecha(r.fecha) && Array.isArray(r.series))
    for (const entrada of r.series) {
      const serie = objeto(entrada)
      exigir(id(serie.ejercicioId) && ejercicios.has(serie.ejercicioId)
        && numero(serie.repeticiones) && numero(serie.pesoKg))
    }
  })
  return valor as RespaldoV1
}

export async function leerRespaldo(archivo: File): Promise<RespaldoV1> {
  const contenido = await archivo.text()
  let valor: unknown
  try {
    valor = JSON.parse(contenido.replace(/^\uFEFF/, ''))
  } catch {
    throw new RespaldoInvalido('No se pudo leer el respaldo. Selecciona un archivo JSON válido generado desde Ajustes.')
  }
  return validarRespaldo(valor)
}

/** Reemplaza todo o no cambia nada. Llamar únicamente tras la confirmación. */
export async function restaurarRespaldo(valor: unknown): Promise<void> {
  const { datos } = validarRespaldo(structuredClone(valor))
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(t => t.clear()))
    await db.montanas.bulkAdd(datos.montanas)
    await db.intentos.bulkAdd(datos.intentos)
    await db.equipo.bulkAdd(datos.equipo)
    await db.ejercicios.bulkAdd(datos.ejercicios)
    await db.sesiones.bulkAdd(datos.sesiones)
  })
}
