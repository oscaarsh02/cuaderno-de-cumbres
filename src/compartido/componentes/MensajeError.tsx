// Aviso bajo un campo del formulario que falta o está mal.
export default function MensajeError({ texto }: { texto: string }) {
  return (
    <p role="alert" className="text-base font-medium text-red-700">
      {texto}
    </p>
  );
}
