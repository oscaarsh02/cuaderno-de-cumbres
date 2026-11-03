import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import EditorEjercicio from './EditorEjercicio'
import EditorSesion from './EditorSesion'
import ListaEjercicios from './ListaEjercicios'
import ListaSesiones from './ListaSesiones'

// Recharts pesa bastante: se carga solo al abrir la gráfica, no al arrancar la app.
// El service worker también guarda este archivo, así que funciona sin conexión.
const PantallaProgreso = lazy(() => import('./PantallaProgreso'))

// Rutas internas del módulo, relativas a /entrenamiento.
export default function PantallaEntrenamiento() {
  return (
    <Routes>
      <Route index element={<ListaSesiones />} />
      <Route path="nueva" element={<EditorSesion />} />
      <Route
        path="progreso"
        element={
          <Suspense fallback={null}>
            <PantallaProgreso />
          </Suspense>
        }
      />
      <Route path="ejercicios" element={<ListaEjercicios />} />
      <Route path="ejercicios/nuevo" element={<EditorEjercicio />} />
      <Route path="ejercicios/:id" element={<EditorEjercicio />} />
      <Route path=":id" element={<EditorSesion />} />
    </Routes>
  )
}
