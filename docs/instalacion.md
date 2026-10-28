# CDC-34 — PWA instalable (RF-24)

El manifiesto define identidad, alcance, inicio, descripción en español, colores,
modo standalone e iconos PNG de 192 y 512 px. El icono maskable conserva el motivo
dentro del círculo seguro central (radio del 40 %); el fondo cubre todo el lienzo.
Safari dispone de un apple-touch-icon de 180 px. El SVG es propio del proyecto y
los PNG se reproducen con `node scripts/generar-iconos.cjs` y Playwright/Chrome.
Puede definirse `PLAYWRIGHT_PATH` para usar una instalación externa de Playwright.

## Instalación y funcionamiento

- Aviso no modal, descartable durante la sesión. La guía permanece en Ajustes.
- `beforeinstallprompt` se conserva desde el arranque; el botón solo aparece si
  existe una solicitud disponible. Cada evento se consume una vez y se manejan
  rechazo, error y `appinstalled` sin impedir usar la aplicación.
- Se oculta el aviso en `display-mode: standalone` y en Safari con `navigator.standalone`.
- La guía explica Android/Chrome, iPhone/iPad/Safari y la alternativa de escritorio.
- El service worker precarga HTML, JavaScript, CSS e iconos. Las rutas internas
  usan el HTML de la aplicación al navegar sin red. IndexedDB conserva los registros.
- No se agregan cachés de solicitudes del clima; el mecanismo existente guarda
  intentos sin red y completa el clima pendiente al volver la conexión.
- La primera carga requiere internet. Instalar no garantiza conservar los datos
  si el navegador los elimina; la guía recomienda respaldarlos.

## Despliegue y prueba

1. Ejecutar `npm ci`, `npm run build` y `npm run lint`.
2. Servir `dist` por HTTPS en producción. El servidor debe devolver `index.html`
   para rutas internas de React Router; los archivos estáticos deben servirse
   con sus tipos correctos y sin redirigirlos al HTML.
3. Localmente usar `npm run preview -- --host 127.0.0.1`. `localhost`/loopback es
   válido para pruebas; una IP de red local por HTTP no equivale a HTTPS.
4. Con Chrome y Playwright disponibles, ejecutar `node tests/pwa.cjs` (puede usarse
   `PLAYWRIGHT_PATH`). La prueba usa perfiles aislados y el build real en puerto 4173.

La prueba verifica manifiesto, tamaños PNG, errores de instalabilidad de Chrome,
aviso descartable, flujo de instalación con eventos simulados, modo iOS simulado,
recarga sin red de los tres módulos y la guía, persistencia de equipo y creación
de intentos con clima pendiente. No automatiza la instalación en un teléfono real.

## Aceptación en dispositivos reales

En Android/Chrome y iPhone/Safari: instalar desde el sitio HTTPS, abrir desde el
icono, comprobar nombre e icono y ausencia de barra del navegador, esperar a que
esté lista sin conexión, activar modo avión, cerrar y abrir, guardar registros,
volver a abrir y comprobar persistencia. Reconectar y verificar el clima pendiente.
Comprobar que el aviso no aparece al abrir desde el icono instalado.

La verificación cubre el alcance visible de RF-24. Por indicación del solicitante,
no se realiza una comparación con CA-01 y CA-03, cuyos textos no están disponibles.
La instalación en teléfonos reales queda como comprobación manual.

Fuentes:
- https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios
