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

/** Contenido editable del sitio público + Configuración de Meta Pixel / CAPI. */
export interface SiteSettings {
  heroBadge: string;
  heroTitle: string;
  heroLead: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress?: string;
  topbarWhatsappText: string;
  /** Meta Pixel ID (ej: 123456789012345) */
  metaPixelId?: string;
  /** Activar/desactivar carga del Pixel en el sitio público */
  metaPixelEnabled?: boolean;
  /** Código para <meta name="facebook-domain-verification" content="..." /> */
  metaDomainVerification?: string;
  /** Token de Meta Conversions API (solo servidor — nunca exponer en HTML público) */
  metaCapiToken?: string;
  /** Código de evento de prueba de Meta Events Manager (ej: TEST12345) */
  metaTestEventCode?: string;
  /** Indicador de solo lectura para la UI (indica si hay token CAPI configurado) */
  hasMetaCapiToken?: boolean;
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
  /** CRM & Atribución de campañas */
  valor_estimado?: number | null;
  proximo_seguimiento?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
  items: QuoteItem[];
}

export type AnalyticsEventType =
  | 'page_view'
  | 'view_product'
  | 'search'
  | 'add_to_cart'
  | 'initiate_checkout'
  | 'whatsapp_click'
  | 'quote_submit';

export interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_type: AnalyticsEventType;
  event_id?: string | null;
  visitor_id: string;
  session_id: string;
  path: string;
  referrer?: string | null;
  source: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  device: 'mobile' | 'tablet' | 'desktop';
  browser?: string | null;
  metadata?: Record<string, any> | null;
}

export type Backend = 'supabase' | 'local';
