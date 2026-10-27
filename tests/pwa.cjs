// Ejecutar contra npm run preview (build real, con service worker).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const os = require('node:os')
const origen = 'http://127.0.0.1:4173'

async function main() {
  const dist = path.resolve(__dirname, '../dist')
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'manifest.webmanifest'), 'utf8'))
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.id, '/')
  assert.equal(manifest.start_url, '/')
  assert.ok(manifest.icons.some(i => i.purpose === 'maskable'))
  for (const icono of [...manifest.icons, { src: '/apple-touch-icon.png', sizes: '180x180' }]) {
    const png = await fs.readFile(path.join(dist, icono.src.slice(1)))
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a')
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icono.sizes)
  }
  // Chrome no permite instalar en incógnito: usar un perfil temporal normal.
  const perfil = await fs.mkdtemp(path.join(os.tmpdir(), 'cdc34-pwa-'))
  const context = await chromium.launchPersistentContext(perfil, {
    channel: 'chrome', headless: true, viewport: { width: 320, height: 740 },
  })
  const browser = context.browser()
  try {
    const page = await context.newPage()
    await page.goto(origen)
    await page.getByRole('button', { name: 'Ahora no', exact: true }).click()
    await page.reload()
    assert.equal(await page.getByRole('complementary', { name: 'Instalación de la aplicación' }).count(), 0)
    await page.getByRole('link', { name: 'Ajustes', exact: true }).click()
    await page.getByRole('link', { name: 'Instalar la aplicación', exact: true }).click()
    await page.getByRole('heading', { name: 'iPhone o iPad', exact: true }).waitFor()
    await page.getByRole('status').filter({ hasText: 'Lista para usar sin conexión' }).waitFor()
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    const cdp = await context.newCDPSession(page)
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
    assert.deepEqual(installabilityErrors, [], 'Chrome no debe informar errores de instalación')
    console.log('PASS: manifiesto, dimensiones de iconos y criterios de instalación de Chrome')

    // Simulación del diálogo nativo: prueba manejo de eventos, no instalación física.
    async function simularSolicitud(resultado, falla = false) {
      await page.evaluate(({ resultado, falla }) => {
        window.vecesPrompt = 0
        const evento = new Event('beforeinstallprompt', { cancelable: true })
        evento.prompt = async () => { window.vecesPrompt++; if (falla) throw new Error('Fallo simulado') }
        evento.userChoice = Promise.resolve({ outcome: resultado })
        window.dispatchEvent(evento)
      }, { resultado, falla })
      await page.getByRole('button', { name: 'Instalar ahora', exact: true }).click()
      assert.equal(await page.evaluate(() => window.vecesPrompt), 1)
    }
    await simularSolicitud('dismissed')
    await page.getByRole('status').filter({ hasText: 'Instalación cancelada' }).waitFor()
    await simularSolicitud('dismissed', true)
    await page.getByRole('status').filter({ hasText: 'No se pudo abrir' }).waitFor()
    await simularSolicitud('accepted')
    await page.getByRole('status').filter({ hasText: 'Solicitud aceptada' }).waitFor()
    await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
    await page.getByRole('status').filter({ hasText: 'Ya estás usando' }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Instalar ahora', exact: true }).count(), 0)
    console.log('PASS: aviso pospuesto, acceso desde Ajustes, cancelación, error y evento appinstalled')

    await context.setOffline(true)
    for (const [ruta, titulo] of [['/cumbres', 'Cumbres'], ['/equipo', 'Equipo'], ['/entrenamiento', 'Entrenamiento'], ['/ajustes/instalacion', 'Instalar la aplicación']]) {
      await page.goto(origen + ruta)
      await page.getByRole('heading', { name: titulo, exact: true, level: 1 }).waitFor()
    }
    await page.goto(origen + '/equipo')
    const casilla = page.getByRole('checkbox').first()
    await casilla.click()
    await page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked)
    await page.reload()
    await page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked)
    await page.goto(origen + '/cumbres/nuevo')
    await page.getByLabel('Montaña', { exact: true }).selectOption('pico-de-orizaba')
    await page.getByLabel('Fecha', { exact: true }).fill('2026-10-27')
    await page.locator('label').filter({ has: page.locator('input[name="resultado"][value="cumbre"]') }).click()
    await page.getByLabel('Notas', { exact: false }).fill('Registro sin conexión CDC-34')
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await page.getByRole('heading', { name: 'Cumbres', exact: true, level: 1 }).waitFor()
    const registros = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const r = indexedDB.open('cuaderno-de-cumbres')
        r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error)
      })
      try {
        return await new Promise((resolve, reject) => {
          const r = db.transaction('intentos').objectStore('intentos').getAll()
          r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error)
        })
      } finally { db.close() }
    })
    assert.ok(registros.some(r => r.notas === 'Registro sin conexión CDC-34' && r.climaPendiente && r.condiciones === null))
    console.log('PASS: recarga de rutas sin red, persistencia de equipo y creación de intento con clima pendiente')

    const ios = await browser.newContext()
    await ios.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }))
    const paginaIos = await ios.newPage()
    await paginaIos.goto(origen + '/ajustes/instalacion')
    await paginaIos.getByRole('status').filter({ hasText: 'Ya estás usando' }).waitFor()
    assert.equal(await paginaIos.getByRole('complementary', { name: 'Instalación de la aplicación' }).count(), 0)
    console.log('PASS: detección de modo instalado de iOS (simulada)')
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
