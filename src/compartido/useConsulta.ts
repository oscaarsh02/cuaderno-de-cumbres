import { liveQuery } from 'dexie';
import { useEffect, useState, type DependencyList } from 'react';

// Ejecuta una consulta de Dexie y vuelve a ejecutarla sola cada vez que cambian
// las tablas que lee. Devuelve undefined mientras carga.
export function useConsulta<T>(consulta: () => Promise<T>, deps: DependencyList = []): T | undefined {
  const [valor, setValor] = useState<T>();

  useEffect(() => {
    const suscripcion = liveQuery(consulta).subscribe({
      next: (resultado) => setValor(() => resultado),
      error: (error) => console.error('Falló una consulta a la base de datos', error),
    });
    return () => suscripcion.unsubscribe();
    // Las dependencias las define quien llama, igual que en useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return valor;
}
