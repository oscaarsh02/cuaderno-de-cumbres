import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './app/App.tsx'
import { db } from './compartido/db.ts'

// Abrir la base al arrancar dispara la precarga del catálogo en el primer uso.
db.open().catch((error) => console.error('No se pudo abrir la base de datos', error))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
