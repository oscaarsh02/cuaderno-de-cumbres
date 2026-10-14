import { Route, Routes } from 'react-router'
import EditorIntento from './EditorIntento'
import ListaIntentos from './ListaIntentos'

// Rutas internas del módulo, relativas a /cumbres.
export default function PantallaCumbres() {
  return (
    <Routes>
      <Route index element={<ListaIntentos />} />
      <Route path="nuevo" element={<EditorIntento />} />
      <Route path=":id" element={<EditorIntento />} />
    </Routes>
  )
}
