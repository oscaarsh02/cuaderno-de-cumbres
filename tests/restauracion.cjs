// Ejecutar con Vite activo. PLAYWRIGHT_PATH permite usar una instalación temporal.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 740 } })
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:5173/ajustes')
    await page.getByRole('heading', { name: 'Ajustes', exact: true }).waitFor()
    // Cargar servicios antes de desconectar la red.
    await page.evaluate(async () => {
      window.servicio = await import('/src/compartido/servicios/restauracion.ts')
      window.respaldos = await import('/src/compartido/servicios/respaldo.ts')
      window.db = (await import('/src/compartido/db.ts')).db
      await window.db.open()
    })
    await context.setOffline(true)
    const respaldo = {
      formato: 'cuaderno-de-cumbres', version: 1, creadoEn: '2026-10-24T18:00:00.000Z',
      datos: {
        montanas: [{ id: 'm', nombre: 'Montaña 🏔️', latitud: 19, longitud: -98, altitud: 4500, precargada: false }],
        intentos: [
          { id: 'i', montanaId: 'm', fecha: '2026-10-23', resultado: 'cumbre', notas: 'Frío', condiciones: null, climaPendiente: true },
          { id: 'i2', montanaId: 'm', fecha: '2026-10-22', resultado: 'regreso', notas: '', condiciones: { tempMax: 4, tempMin: -2, precipitacion: 0, vientoMax: 15, rachasMax: 20, codigoClima: 3 }, climaPendiente: false },
        ],
        equipo: [{ id: 'a', nombre: 'Chamarra', categoria: 'abrigo', empacado: true }],
        ejercicios: [{ id: 'e', nombre: 'Sentadilla', grupoMuscular: 'Pierna' }],
        sesiones: [{ id: 's', fecha: '2026-10-24', series: [{ ejercicioId: 'e', repeticiones: 10, pesoKg: 22.5 }] }],
      },
    }
    const datos = () => page.evaluate(async () => (await window.respaldos.crearRespaldo()).datos)
    const cargar = contenido => page.getByLabel('Archivo de respaldo', { exact: true }).setInputFiles({
      name: 'respaldo.json', mimeType: 'application/json', buffer: Buffer.from(contenido),
    })
    const antes = await datos()
    await cargar(JSON.stringify(respaldo))
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    assert.deepEqual(await datos(), antes, 'Cancelar conserva todos los datos')

    const invalidos = [ '{', JSON.stringify({ ...respaldo, version: 2 }) ]
    for (const mutar of [
      r => { delete r.datos.equipo },
      r => { r.datos.montanas.push(r.datos.montanas[0]) },
      r => { r.datos.intentos[0].montanaId = 'inexistente' },
      r => { r.datos.sesiones[0].series[0].ejercicioId = 'inexistente' },
      r => { r.datos.sesiones[0].series[0].pesoKg = '22.5' },
      r => { r.datos.intentos[0].fecha = '2026-02-30' },
      r => { delete r.datos.intentos[1].condiciones.tempMax },
      r => { r.datos.equipo[0].empacado = 'sí' },
      r => { r.datos.equipo[0].categoria = 'inexistente' },
    ]) {
      const copia = structuredClone(respaldo)
      mutar(copia)
      invalidos.push(JSON.stringify(copia))
    }
    for (const contenido of invalidos) {
      await cargar(contenido)
      await page.getByRole('alert').waitFor()
      assert.deepEqual(await datos(), antes, 'Un archivo inválido no modifica los datos')
      assert.equal(await page.locator('dialog').evaluate(el => el.open), false)
    }

    // Provocar un fallo después de borrar y escribir varias tablas: debe revertirse todo.
    await page.evaluate(() => {
      window.fallo = () => { throw new Error('Fallo de escritura simulado') }
      window.db.sesiones.hook('creating', window.fallo)
    })
    await cargar(JSON.stringify(respaldo))
    await page.getByRole('button', { name: 'Reemplazar y restaurar' }).click()
    await page.getByRole('alert').waitFor()
    assert.deepEqual(await datos(), antes, 'La transacción revierte todas las tablas')
    await page.evaluate(() => window.db.sesiones.hook('creating').unsubscribe(window.fallo))

    await cargar(JSON.stringify(respaldo))
    await page.getByRole('button', { name: 'Reemplazar y restaurar' }).click()
    await page.getByRole('status').filter({ hasText: 'Respaldo restaurado' }).waitFor()
    assert.deepEqual(await datos(), respaldo.datos)
    const descarga = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Descargar respaldo', exact: true }).click()
    const archivo = await descarga
    const exportado = JSON.parse(await fs.readFile(await archivo.path(), 'utf8'))
    assert.deepEqual(exportado.datos, respaldo.datos, 'Exportar tras restaurar conserva todos los campos')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

    const vacio = structuredClone(respaldo)
    Object.keys(vacio.datos).forEach(k => { vacio.datos[k] = [] })
    await cargar(JSON.stringify(vacio))
    await page.getByRole('button', { name: 'Reemplazar y restaurar' }).click()
    await page.getByRole('status').filter({ hasText: 'Respaldo restaurado' }).waitFor()
    assert.deepEqual(await datos(), vacio.datos)
    console.log('PASS: cancelación, 11 archivos inválidos, rollback, restauración sin conexión, reexportación, tablas vacías y ancho 320 px')
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
