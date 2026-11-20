// Para comparar textos sin importar mayúsculas ni acentos: "Plátanos" → "platanos".
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
}
