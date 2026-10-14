import { useEffect, useRef } from 'react';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Diálogo para confirmar acciones que no se pueden deshacer, como borrar.
export default function DialogoConfirmacion({ abierto, titulo, mensaje, textoConfirmar, onConfirmar, onCancelar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto && !el.open) el.showModal();
    if (!abierto && el.open) el.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      // La tecla Esc o el botón Atrás de Android cierran el diálogo: se trata como cancelar.
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-slate-900 backdrop:bg-black/50"
    >
      <h2 className="text-xl font-bold">{titulo}</h2>
      <p className="mt-3 text-base text-slate-700">{mensaje}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onConfirmar}
          className="min-h-12 rounded-xl bg-red-700 px-4 text-base font-semibold text-white active:bg-red-800"
        >
          {textoConfirmar}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="min-h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
