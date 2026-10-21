/**
 * Tipos del CMS / SaaS administrativo ZORTEX.
 * Compartidos entre la capa de datos (servidor) y las páginas del panel.
 */
import type { Product } from '../../config';

export const PRODUCT_CATEGORIES = [
  'Ropa Corporativa',
  'Ropa Industrial',
  'Ropa de Seguridad',
  'EPP',
  'Ropa Personalizada',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Producto administrable: el Product del sitio + metadatos de gestión. */
export interface CmsProduct extends Product {
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Contenido editable del sitio público. */
export interface SiteSettings {
  heroBadge: string;
  heroTitle: string;
  heroLead: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress?: string;
  topbarWhatsappText: string;
}

export const QUOTE_STATUSES = ['nuevo', 'en_gestion', 'cotizado', 'ganado', 'perdido'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  nuevo: 'Nueva',
  en_gestion: 'En gestión',
  cotizado: 'Cotizada',
  ganado: 'Ganada',
  perdido: 'Perdida',
};

export interface QuoteItem {
  producto: string;
  categoria?: string | null;
  cantidad: number;
  talla?: string | null;
}

export interface Quote {
  id: string;
  created_at: string;
  empresa: string;
  rut?: string | null;
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
  personalizacion?: string | null;
  plazo?: string | null;
  mensaje?: string | null;
  estado: QuoteStatus;
  notas?: string | null;
  items: QuoteItem[];
}

export type Backend = 'supabase' | 'local';
