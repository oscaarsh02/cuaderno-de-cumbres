import { Route, Routes } from 'react-router'
import EditorArticulo from './EditorArticulo'
import ListaEquipo from './ListaEquipo'

// Rutas internas del módulo, relativas a /equipo.
export default function PantallaEquipo() {
  return (
    <Routes>
      <Route index element={<ListaEquipo />} />
      <Route path="nuevo" element={<EditorArticulo />} />
      <Route path=":id" element={<EditorArticulo />} />
    </Routes>
  )
}
