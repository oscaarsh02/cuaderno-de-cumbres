import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

// Título de una pantalla secundaria con el botón para regresar.
export default function Encabezado({ titulo, volverA }: { titulo: string; volverA: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        to={volverA}
        className="-ml-2 flex min-h-11 w-fit items-center gap-1 px-2 text-base font-medium text-sky-800"
      >
        <ChevronLeft size={24} aria-hidden="true" />
        Volver
      </Link>
      <h1 className="text-3xl font-bold">{titulo}</h1>
    </div>
  );
}
