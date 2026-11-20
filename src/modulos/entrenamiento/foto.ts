import { useEffect, useState } from 'react';

const ANCHO_MAXIMO = 640;

// Reduce la foto en el navegador y la convierte a WebP. El archivo original no se guarda.
export async function prepararFoto(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, ANCHO_MAXIMO / imagen.width);
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext('2d')!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();

  const webp = await aBlob(lienzo, 'image/webp', 0.72);
  if (webp?.type === 'image/webp') return webp;
  // Safari no sabe generar WebP y entrega PNG, que pesa mucho más: ahí se usa JPEG.
  const jpeg = await aBlob(lienzo, 'image/jpeg', 0.8);
  if (!jpeg) throw new Error('No se pudo convertir la foto');
  return jpeg;
}

function aBlob(lienzo: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((resolver) => lienzo.toBlob(resolver, tipo, calidad));
}

// URL temporal para mostrar un Blob en <img>. Se libera al cambiar la foto o al desmontar.
export function useUrlObjeto(blob: Blob | undefined): string | undefined {
  const [actual, setActual] = useState<{ blob: Blob; url: string }>();

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    // Aquí sí corresponde un efecto: la URL es un recurso externo que hay que liberar.
    // oxlint-disable-next-line react/set-state-in-effect
    setActual({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // Si el Blob cambió y el efecto aún no corre, no se devuelve la URL vieja (ya liberada).
  return blob && actual?.blob === blob ? actual.url : undefined;
}
