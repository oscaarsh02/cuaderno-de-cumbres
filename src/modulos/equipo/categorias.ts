import { BriefcaseMedical, Package, Pickaxe, Shirt, Tent, Utensils, type LucideIcon } from 'lucide-react';
import type { Categoria } from '../../compartido/tipos';

export const ORDEN_CATEGORIAS: Categoria[] = ['abrigo', 'tecnico', 'campamento', 'comida', 'botiquin', 'otros'];

export const CATEGORIAS: Record<Categoria, { nombre: string; Icono: LucideIcon }> = {
  abrigo: { nombre: 'Ropa de abrigo', Icono: Shirt },
  tecnico: { nombre: 'Equipo técnico', Icono: Pickaxe },
  campamento: { nombre: 'Campamento', Icono: Tent },
  comida: { nombre: 'Comida y agua', Icono: Utensils },
  botiquin: { nombre: 'Botiquín', Icono: BriefcaseMedical },
  otros: { nombre: 'Otros', Icono: Package },
};
