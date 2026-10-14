import { Route, Routes } from 'react-router'
import EditorEjercicio from './EditorEjercicio'
import EditorSesion from './EditorSesion'
import ListaEjercicios from './ListaEjercicios'
import ListaSesiones from './ListaSesiones'

// Rutas internas del módulo, relativas a /entrenamiento.
export default function PantallaEntrenamiento() {
  return (
    <Routes>
      <Route index element={<ListaSesiones />} />
      <Route path="nueva" element={<EditorSesion />} />
      <Route path="ejercicios" element={<ListaEjercicios />} />
      <Route path="ejercicios/nuevo" element={<EditorEjercicio />} />
      <Route path="ejercicios/:id" element={<EditorEjercicio />} />
      <Route path=":id" element={<EditorSesion />} />
    </Routes>
  )
}
