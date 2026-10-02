/**
 * Configuración central del sitio.
 * Cambia "Nombre EPP" aquí y se actualiza en toda la landing.
 */
export const SITE = {
  /** Nombre de la marca — se usa en logo, títulos, footer, meta */
  name: 'Nombre EPP',
  /** Tagline / lema del negocio */
  tagline: 'Ropa corporativa, industrial y EPP al por mayor',
  /** Descripción SEO */
  description:
    'Ropa corporativa, ropa industrial y elementos de seguridad al por mayor, con precios por volumen y personalización con tu logo. Cotiza online.',
  /** URL del sitio en producción (para OG/sitemap) */
  url: 'https://nombre-epp.cl',
  /** Ubicación física */
  location: 'Valparaíso, Chile',
  /** Email de ventas */
  email: 'ventas@tudominio.cl',
  /** Teléfono de contacto (display) */
  phone: '+56 9 0000 0000',
} as const;

/**
 * Número de WhatsApp (solo dígitos, con código de país).
 * En producción se lee de import.meta.env.PUBLIC_WHATSAPP_NUMBER
 */
export const WHATSAPP_NUMBER =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '56900000000';

/**
 * Productos disponibles para el cotizador.
 * Cada producto tiene: id, nombre, categoría e imagen.
 */
export interface Product {
  id: string;
  name: string;
  category: 'Corporativa' | 'Industrial' | 'EPP';
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'poleron-corporativo',
    name: 'Polerón corporativo',
    category: 'Corporativa',
    image: '/images/productos/poleron-industrial.png',
  },
  {
    id: 'polera-pique',
    name: 'Polera piqué con logo',
    category: 'Corporativa',
    image: '/images/productos/polera-pique.png',
  },
  {
    id: 'gorro-trabajo',
    name: 'Gorro de trabajo',
    category: 'Corporativa',
    image: '/images/productos/gorro-trabajo.png',
  },
  {
    id: 'camisa-manga-larga',
    name: 'Camisa manga larga',
    category: 'Corporativa',
    image: '/images/productos/camisa-manga-larga.png',
  },
  {
    id: 'buzo-deportivo',
    name: 'Buzo deportivo industrial',
    category: 'Corporativa',
    image: '/images/productos/poleron-industrial.png',
  },
  {
    id: 'polar-con-cierre',
    name: 'Polar con cierre corporativo',
    category: 'Corporativa',
    image: '/images/productos/chaqueta-polar.png',
  },
  {
    id: 'pantalon-trabajo',
    name: 'Pantalón de trabajo',
    category: 'Industrial',
    image: '/images/productos/pantalon-trabajo.png',
  },
  {
    id: 'chaqueta-polar',
    name: 'Chaqueta polar térmica',
    category: 'Industrial',
    image: '/images/productos/chaqueta-polar.png',
  },
  {
    id: 'overol-completo',
    name: 'Overol completo industrial',
    category: 'Industrial',
    image: '/images/productos/pantalon-trabajo.png',
  },
  {
    id: 'parka-termica',
    name: 'Parka térmica impermeable',
    category: 'Industrial',
    image: '/images/productos/chaqueta-polar.png',
  },
  {
    id: 'pantalon-cargo-reforzado',
    name: 'Pantalón cargo reforzado',
    category: 'Industrial',
    image: '/images/productos/pantalon-trabajo.png',
  },
  {
    id: 'chaleco-seguridad',
    name: 'Chaleco alta visibilidad ANSI',
    category: 'EPP',
    image: '/images/productos/chaleco-seguridad.png',
  },
  {
    id: 'zapato-seguridad',
    name: 'Zapato de seguridad dieléctrico',
    category: 'EPP',
    image: '/images/productos/zapato-seguridad.png',
  },
  {
    id: 'casco-lentes',
    name: 'Casco de seguridad con barbiquejo',
    category: 'EPP',
    image: '/images/productos/casco-lentes.png',
  },
  {
    id: 'guantes-seguridad',
    name: 'Guantes de cabritilla y nitrilo',
    category: 'EPP',
    image: '/images/productos/chaleco-seguridad.png',
  },
  {
    id: 'lentes-proteccion',
    name: 'Lentes de protección anti-rayadura',
    category: 'EPP',
    image: '/images/productos/casco-lentes.png',
  },
];

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'corporativa',
    name: 'Ropa Corporativa',
    description: 'Polerones, polares, camisas, poleras y chaquetas con logo para tu equipo.',
    image: '/images/productos/polera-pique.png',
    subcategories: ['Poleras', 'Polerones', 'Camisas', 'Chaquetas', 'Polares', 'Gorros'],
  },
  {
    id: 'industrial',
    name: 'Ropa Industrial',
    description: 'Overoles, buzos, pantalones de trabajo, parkas y ropa de invierno resistente.',
    image: '/images/productos/pantalon-trabajo.png',
    subcategories: ['Pantalones', 'Overoles', 'Parkas', 'Buzos', 'Chaquetas térmicas'],
  },
  {
    id: 'epp',
    name: 'Seguridad y EPP',
    description: 'Calzado de seguridad, cascos, guantes, lentes, alta visibilidad y protección respiratoria.',
    image: '/images/productos/chaleco-seguridad.png',
    subcategories: ['Calzado', 'Cascos', 'Guantes', 'Lentes', 'Chalecos', 'Arneses'],
  },
];

export const NAV_LINKS = [
  { label: 'Inicio', href: '#' },
  { label: 'Categorías', href: '#catalogo', hasDropdown: true },
  { label: 'Productos', href: '#productos' },
  { label: 'Rubros', href: '#rubros' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Cotizar', href: '#cotizar' },
] as const;

export const BENEFITS = [
  { icon: '🚚', title: 'Despacho a todo Chile', description: 'Envíos a regiones con seguimiento.' },
  { icon: '🏭', title: 'Pedidos por volumen', description: 'Descuentos especiales desde 50 unidades.' },
  { icon: '✂️', title: 'Personalización', description: 'Bordado y estampado con tu logo corporativo.' },
  { icon: '📋', title: 'Cotización en 24h', description: 'Un ejecutivo te contacta con precios y plazos.' },
] as const;

export const STATS = [
  { value: 500, suffix: '+', label: 'Empresas atendidas' },
  { value: 15, suffix: '+', label: 'Años de experiencia' },
  { value: 50, suffix: '+', label: 'Marcas disponibles' },
  { value: 24, suffix: 'h', label: 'Respuesta garantizada' },
] as const;

/**
 * Rubros / industrias a los que atiende la empresa.
 */
export const INDUSTRIES = [
  'Minería',
  'Construcción',
  'Forestal',
  'Agrícola',
  'Pesquera',
  'Transporte y logística',
  'Salud',
  'Gastronomía',
  'Municipalidades',
] as const;

/**
 * Certificaciones y respaldo técnico (contexto Chile).
 */
export const CERTIFICATIONS = [
  {
    title: 'Calzado de seguridad',
    description: 'Normas ISO 20345 / ASTM F2413',
  },
  {
    title: 'Alta visibilidad',
    description: 'Estándar ANSI/ISEA 107',
  },
  {
    title: 'Ropa ignífuga',
    description: 'Según requerimiento de faena',
  },
  {
    title: 'Cumplimiento',
    description: 'Apoyo para Ley 16.744 y DS 594',
  },
] as const;

/**
 * Opciones de personalización para el cotizador.
 */
export const PERSONALIZATION_OPTIONS = [
  'Sin logo',
  'Bordado',
  'Estampado',
  'Aún no lo sé',
] as const;

/**
 * Tallas disponibles.
 */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;
