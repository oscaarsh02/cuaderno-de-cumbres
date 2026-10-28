import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { PantallaAltura } from '../modulos/altura'
import { PantallaCumbres, vigilarClimasPendientes } from '../modulos/cumbres'
import { PantallaEntrenamiento } from '../modulos/entrenamiento'
import { PantallaEquipo } from '../modulos/equipo'
import Layout from './Layout'
import PantallaAjustes from './PantallaAjustes'
import PantallaPrivacidad from './PantallaPrivacidad'
import PantallaInstalacion from './PantallaInstalacion'

export default function App() {
  // Completa el clima de los intentos guardados sin conexión cuando vuelve la red.
  useEffect(() => vigilarClimasPendientes(), [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/cumbres/*" element={<PantallaCumbres />} />
        <Route path="/equipo/*" element={<PantallaEquipo />} />
        <Route path="/entrenamiento/*" element={<PantallaEntrenamiento />} />
        <Route path="/altura" element={<PantallaAltura />} />
        <Route path="/ajustes" element={<PantallaAjustes />} />
        <Route path="/ajustes/privacidad" element={<PantallaPrivacidad />} />
        <Route path="/ajustes/instalacion" element={<PantallaInstalacion />} />
        <Route path="*" element={<Navigate to="/cumbres" replace />} />
      </Route>
    </Routes>
  )
}
