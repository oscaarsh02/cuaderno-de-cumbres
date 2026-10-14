import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Configuración mínima. Íconos y ajustes de instalación van en el paso 6.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Cuaderno de Cumbres',
        short_name: 'Cumbres',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
      },
    }),
  ],
})
