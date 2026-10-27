import type { ReactNode } from 'react'
import Encabezado from '../compartido/componentes/Encabezado'

function EnlaceExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center py-2 text-base font-medium text-sky-800 underline underline-offset-4">
      {children} (sitio externo)
    </a>
  )
}

export default function PantallaPrivacidad() {
  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Atribuciones y privacidad" volverA="/ajustes" />
      <section aria-labelledby="titulo-privacidad" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="titulo-privacidad" className="text-xl font-semibold">Aviso de privacidad</h2>
        <p>Cuaderno de Cumbres es un proyecto escolar de Oscar Sánchez Hernández y Enrique Anzures Morales. Tus registros de cumbres, notas, equipo, ejercicios y sesiones se guardan en este navegador o aplicación instalada, en tu dispositivo.</p>
        <h3 className="text-lg font-semibold">Tus registros permanecen contigo</h3>
        <p>No tenemos cuentas de usuario ni un servidor que reciba tus registros. No se sincronizan automáticamente entre dispositivos. Esta versión no incorpora publicidad ni herramientas de analítica de uso.</p>
        <h3 className="text-lg font-semibold">Qué se envía al consultar el clima</h3>
        <p>Para obtener el clima, la aplicación envía a Open-Meteo las coordenadas y la altitud de la montaña seleccionada, la fecha del intento y la zona horaria. No envía tus notas, resultado, equipo ni entrenamientos. No solicita tu ubicación GPS.</p>
        <p>Como en cualquier conexión a un sitio web, el proveedor recibe tu dirección IP y datos técnicos de la solicitud. El servicio que aloja la aplicación también recibe solicitudes al cargarla. Esto es distinto de enviar tus registros personales.</p>
        <p>Si guardas un intento sin conexión, la consulta del clima queda pendiente y se reintenta al recuperar la conexión. El clima obtenido se guarda junto al intento.</p>
        <EnlaceExterno href="https://open-meteo.com/en/terms">Condiciones y privacidad de Open-Meteo</EnlaceExterno>
        <h3 className="text-lg font-semibold">Respaldos y control de tus datos</h3>
        <p>Al descargar un respaldo, creas un archivo con todos tus registros. El archivo no está cifrado: guárdalo en un lugar seguro. Si lo compartes o eliges una carpeta sincronizada con la nube, la copia puede salir de tu dispositivo por tu decisión.</p>
        <p>Restaurar un respaldo lee el archivo en tu dispositivo y reemplaza los registros solo después de tu confirmación; no lo sube a un servidor.</p>
        <p>Puedes consultar y eliminar registros desde sus módulos. Para eliminar todos los datos locales, usa la opción de borrar datos de este sitio en tu navegador. Esto no elimina los archivos de respaldo que hayas descargado: debes borrarlos por separado.</p>
        <p>Borrar los datos del navegador o perder el dispositivo puede hacerte perder tus registros. Conserva un respaldo si quieres recuperarlos después.</p>
      </section>
      <section aria-labelledby="titulo-atribuciones" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 id="titulo-atribuciones" className="text-xl font-semibold">Atribuciones</h2>
        <h3 className="text-lg font-semibold">Datos meteorológicos de Open-Meteo</h3>
        <p>Los datos del clima proceden de Open-Meteo y se ofrecen bajo la licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0).</p>
        <p>La aplicación selecciona los valores diarios, redondea su presentación y representa los códigos del clima mediante iconos y descripciones en español. Estas adaptaciones de presentación son de Cuaderno de Cumbres.</p>
        <EnlaceExterno href="https://open-meteo.com/">Open-Meteo</EnlaceExterno>
        <EnlaceExterno href="https://creativecommons.org/licenses/by/4.0/deed.es">Licencia CC BY 4.0</EnlaceExterno>
        <h3 className="text-lg font-semibold">OpenStreetMap</h3>
        <p>© colaboradores de OpenStreetMap. Los datos de OpenStreetMap están disponibles bajo la licencia Open Data Commons Open Database License (ODbL) 1.0.</p>
        <p>Esta versión no muestra mapas ni consulta servicios de OpenStreetMap automáticamente.</p>
        <EnlaceExterno href="https://www.openstreetmap.org/copyright">Derechos de autor y atribución de OpenStreetMap</EnlaceExterno>
        <EnlaceExterno href="https://opendatacommons.org/licenses/odbl/1-0/">Licencia ODbL 1.0</EnlaceExterno>
        <p>Estas atribuciones no implican que los proveedores patrocinen o avalen la aplicación. Los enlaces externos requieren conexión y sus sitios tienen sus propias condiciones de privacidad.</p>
      </section>
      <p className="text-base text-slate-600">Última actualización: 26 de octubre de 2026.</p>
    </div>
  )
}
