import { Maximize2, Pencil, X } from 'lucide-react';
import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import Encabezado from '../../compartido/componentes/Encabezado';
import { db } from '../../compartido/db';
import type { Ejercicio } from '../../compartido/tipos';
import { useConsulta } from '../../compartido/useConsulta';
import { useUrlObjeto } from './foto';

// Cómo se hace un ejercicio: fotos arriba y descripción abajo (/entrenamiento/ejercicios/:id).
export default function DetalleEjercicio() {
  const { id } = useParams();
  // null = no existe; undefined = cargando.
  const ejercicio = useConsulta(() => db.ejercicios.get(id!).then((e) => e ?? null), [id]);

  if (ejercicio === undefined) return null;

  if (ejercicio === null) {
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo="Ejercicio no encontrado" volverA="/entrenamiento/ejercicios" />
        <p className="text-base text-slate-700">Este ejercicio ya no existe.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Encabezado titulo={ejercicio.nombre} volverA="/entrenamiento/ejercicios" />
        <p className="w-fit rounded-full bg-slate-200 px-3 text-base text-slate-700">{ejercicio.grupoMuscular}</p>
      </div>

      <Fotos ejercicio={ejercicio} />

      {ejercicio.descripcion ? (
        <p className="text-base leading-relaxed text-slate-800">{ejercicio.descripcion}</p>
      ) : (
        <p className="rounded-xl bg-white p-4 text-base text-slate-600">
          Este ejercicio aún no tiene descripción. Puedes escribir una con «Editar ejercicio».
        </p>
      )}

      <Link
        to={`/entrenamiento/ejercicios/${ejercicio.id}/editar`}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
      >
        <Pencil size={20} aria-hidden="true" />
        Editar ejercicio
      </Link>
    </div>
  );
}

// Las precargadas van lado a lado para que el texto quede a la vista; tocar una la amplía.
function Fotos({ ejercicio }: { ejercicio: Ejercicio }) {
  const urlPropia = useUrlObjeto(ejercicio.foto);

  if (ejercicio.imagenes?.length) {
    const etiquetas = ['Inicio', 'Final'];
    return (
      <div className="grid grid-cols-2 gap-2">
        {ejercicio.imagenes.map((src, i) => (
          <FotoAmpliable
            key={src}
            src={src}
            alt={`${ejercicio.nombre}: posición ${i === 0 ? 'inicial' : 'final'}`}
            etiqueta={etiquetas[i]}
          />
        ))}
      </div>
    );
  }

  // Misma miniatura que las precargadas: una foto más grande empujaría el texto fuera de la vista.
  if (urlPropia) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <FotoAmpliable src={urlPropia} alt={`Foto de ${ejercicio.nombre}`} />
      </div>
    );
  }

  return null;
}

function FotoAmpliable({ src, alt, etiqueta }: { src: string; alt: string; etiqueta?: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);

  return (
    <figure className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        aria-label={`Ampliar foto: ${alt}`}
        className="relative overflow-hidden rounded-lg bg-slate-100"
      >
        <img src={src} alt="" className="aspect-[3/2] w-full object-cover" />
        <span className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full bg-black/50 text-white">
          <Maximize2 size={16} aria-hidden="true" />
        </span>
      </button>
      {etiqueta && <figcaption className="text-center text-base text-slate-600">{etiqueta}</figcaption>}

      <dialog
        ref={dialogo}
        // Tocar fuera de la foto también la cierra.
        onClick={(e) => e.target === e.currentTarget && dialogo.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white p-2 backdrop:bg-black/70"
      >
        {/* Las fotos propias pueden venir verticales: se limitan para que quepan con el botón. */}
        <img src={src} alt={alt} className="max-h-[75dvh] w-full rounded-xl object-contain" />
        <div className="flex items-center justify-between gap-2 pt-2 pl-2">
          <span className="text-base text-slate-700">{etiqueta ?? ''}</span>
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-semibold text-sky-800 active:bg-slate-100"
          >
            <X size={22} aria-hidden="true" />
            Cerrar
          </button>
        </div>
      </dialog>
    </figure>
  );
}
