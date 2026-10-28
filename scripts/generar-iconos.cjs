// Rasteriza el SVG propio sin añadir dependencias de ejecución a la aplicación.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const fs = require('node:fs/promises')
const path = require('node:path')

async function main() {
  const directorio = path.resolve(__dirname, '../public')
  const svg = (await fs.readFile(path.join(directorio, 'favicon.svg'), 'utf8')).trim()
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })
    for (const [nombre, tamano] of [
      ['pwa-192x192.png', 192], ['pwa-512x512.png', 512],
      ['pwa-maskable-512x512.png', 512], ['apple-touch-icon.png', 180],
    ]) {
      await page.setViewportSize({ width: tamano, height: tamano })
      await page.setContent(`<style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`)
      await page.screenshot({ path: path.join(directorio, nombre) })
    }
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
