import { db } from '../../compartido/db';
import { ClimaNoDisponible, climaConsultable, consultarClima } from '../../compartido/servicios/openMeteo';

// Evita consultar dos veces el mismo intento si se piden pendientes seguidos.
const enCurso = new Set<string>();

// Busca los intentos con clima pendiente y les consulta el clima una sola vez.
// Se llama al abrir la lista (a donde se vuelve después de guardar) y desde
// vigilarClimasPendientes. Si algo falla, el intento sigue pendiente.
export async function completarClimasPendientes(): Promise<void> {
  // Sin red ni lo intenta: el evento 'online' volverá a llamar cuando regrese.
  if (!navigator.onLine) return;
  const pendientes = await db.intentos.filter((i) => i.climaPendiente && climaConsultable(i.fecha)).toArray();
  await Promise.all(pendientes.map((i) => completarClima(i.id)));
}

// Reintenta los pendientes en toda la app, no solo en la pestaña Cumbres:
// al arrancar, cuando vuelve la red y cuando el usuario regresa a la app
// (en el celular 'online' a veces no se dispara si la app estaba en segundo plano).
// Devuelve la función para dejar de vigilar.
export function vigilarClimasPendientes(): () => void {
  const reintentar = () => {
    completarClimasPendientes();
  };
  const alVolverALaApp = () => {
    if (document.visibilityState === 'visible') reintentar();
  };

  window.addEventListener('online', reintentar);
  document.addEventListener('visibilitychange', alVolverALaApp);
  reintentar();

  return () => {
    window.removeEventListener('online', reintentar);
    document.removeEventListener('visibilitychange', alVolverALaApp);
  };
}

async function completarClima(intentoId: string): Promise<void> {
  if (enCurso.has(intentoId)) return;
  enCurso.add(intentoId);
  try {
    const intento = await db.intentos.get(intentoId);
    if (!intento?.climaPendiente) return;
    const montana = await db.montanas.get(intento.montanaId);
    if (!montana) return;

    const condiciones = await consultarClima(montana, intento.fecha);

    // Mientras llegaba la respuesta pudieron editar o borrar el intento:
    // solo se guarda si sigue siendo el mismo lugar y día y sigue pendiente.
    await db.transaction('rw', db.intentos, async () => {
      const actual = await db.intentos.get(intentoId);
      if (!actual?.climaPendiente || actual.montanaId !== intento.montanaId || actual.fecha !== intento.fecha) return;
      await db.intentos.update(intentoId, { condiciones, climaPendiente: false });
    });
  } catch (error) {
    if (!(error instanceof ClimaNoDisponible)) console.warn('No se pudo consultar el clima', error);
  } finally {
    enCurso.delete(intentoId);
  }
}
