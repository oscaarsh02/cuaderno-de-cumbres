import Encabezado from '../compartido/componentes/Encabezado'
import { instalarAplicacion, useInstalacion } from '../compartido/useInstalacion'

export default function PantallaInstalacion() {
  const estado = useInstalacion()
  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Instalar la aplicación" volverA="/ajustes" />
      <p>Agrega Cuaderno de Cumbres a tu pantalla de inicio para abrirla desde su icono y usarla como una aplicación.</p>
      {estado.instalada ? <p role="status">Ya estás usando la aplicación instalada.</p> : (
        <>
          {(estado.disponible || estado.procesando) && (
            <button type="button" onClick={() => void instalarAplicacion()} disabled={estado.procesando} className="min-h-12 rounded-xl bg-sky-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-60">
              {estado.procesando ? 'Esperando al navegador…' : 'Instalar ahora'}
            </button>
          )}
          <section aria-labelledby="instalar-android" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 id="instalar-android" className="text-xl font-semibold">Android</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Abre esta aplicación en Chrome.</li>
              <li>Si aparece «Instalar ahora», púlsalo. También puedes abrir el menú de los tres puntos y buscar «Instalar aplicación» o «Agregar a la pantalla principal».</li>
              <li>Confirma la instalación y abre Cuaderno de Cumbres desde el icono de tu teléfono.</li>
            </ol>
          </section>
          <section aria-labelledby="instalar-iphone" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 id="instalar-iphone" className="text-xl font-semibold">iPhone o iPad</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Abre esta aplicación en Safari.</li>
              <li>Abre el menú Compartir (el cuadrado con una flecha hacia arriba) y selecciona «Agregar a inicio» o «Añadir a pantalla de inicio».</li>
              <li>Si aparece «Abrir como app web», déjalo activado. Pulsa «Agregar» y abre la aplicación desde su nuevo icono.</li>
            </ol>
          </section>
          <p>Si abriste el enlace dentro de otra aplicación, ábrelo en Chrome o Safari. Las opciones pueden cambiar según el navegador. En computadora, busca la opción de instalar en la barra de direcciones o en el menú de Chrome o Edge.</p>
          <p>Si ya tienes el icono, úsalo para abrir la aplicación. No todos los navegadores permiten detectar la instalación desde una pestaña.</p>
        </>
      )}
      <p role="status">{estado.mensaje}</p>
      <section aria-labelledby="uso-sin-conexion" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="uso-sin-conexion" className="text-xl font-semibold">Prepárala antes de salir</h2>
        <p role="status">{estado.sinConexion ? 'Lista para usar sin conexión en este navegador.' : 'Abre la aplicación con conexión y espera a que se prepare para usarla sin red.'}</p>
        <p>Después de la primera carga completa podrás consultar y guardar cumbres, equipo y entrenamientos sin conexión. El clima nuevo necesita internet y se consultará cuando vuelva la red.</p>
        <p>Instalarla no sustituye un respaldo. Descarga una copia desde Ajustes antes de borrar datos del navegador o cambiar de dispositivo. El navegador puede eliminar datos locales por falta de espacio.</p>
      </section>
    </div>
  )
}
