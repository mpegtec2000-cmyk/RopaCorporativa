/**
 * Configuración central del sitio.
 * Cambia "Nombre EPP" aquí y se actualiza en toda la landing.
 */
export const SITE = {
  /** Nombre de la marca — se usa en logo, títulos, footer, meta */
  name: 'Zortex',
  /** Tagline / lema del negocio */
  tagline: 'Ropa corporativa, industrial y EPP al por mayor',
  /** Descripción SEO */
  description:
    'Zortex - Ropa corporativa, ropa industrial y elementos de protección personal (EPP) al por mayor con precios por volumen y bordado personalizado. Cotiza online.',
  /** URL del sitio en producción (para OG/sitemap/canonical) */
  url: import.meta.env.PUBLIC_SITE_URL || 'https://www.zortex.cl',
  /** Ubicación física / Local */
  location: 'Manzano 254, Recoleta, Santiago',
  /** Dirección del local */
  address: 'Manzano 254, Recoleta',
  /** Comuna */
  commune: 'Recoleta',
  /** Ciudad */
  city: 'Santiago',
  /** Región */
  region: 'Región Metropolitana',
  /** Email de ventas */
  email: 'contacto@zortex.cl',
  /** Teléfono de contacto (display) */
  phone: '+56 9 5863 9727',
} as const;

/**
 * Número de WhatsApp (solo dígitos, con código de país).
 * En producción se lee de import.meta.env.PUBLIC_WHATSAPP_NUMBER
 */
export const WHATSAPP_NUMBER =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '56958639727';

/**
 * Productos disponibles para el cotizador.
 * Cada producto tiene: id, nombre, categoría e imagen.
 */
export interface Product {
  id: string;
  name: string;
  category: 'Ropa Corporativa' | 'Ropa Industrial' | 'Ropa de Seguridad' | 'EPP' | 'Ropa Personalizada';
  image: string;
  sku?: string;
  color?: string;
  colorHex?: string;
  displayName?: string;
  baseId?: string;
  summary?: string;
  descriptionHtml?: string;
  line?: string;
  gender?: string;
  features?: Array<{ name: string; value: string }>;
  colors?: Array<{ name: string; hex: string; image?: string }>;
  sizes?: string[];
  images?: string[];
}

import catalogModelsData from './data/catalog-models.json';

/**
 * Productos core de EPP y personalización para complementar el catálogo completo de vestuario
 */
export const CORE_PRODUCTS: Product[] = [
  {
    id: 'zapato-seguridad',
    name: 'Zapato Dieléctrico Puntera Composite',
    category: 'EPP',
    image: '/images/productos/zapato-seguridad.png',
    images: ['/images/productos/zapato-seguridad.png'],
    sku: 'EPP-001',
    line: 'Calzado Técnico',
    gender: 'Unisex',
    summary: 'Zapato dieléctrico de seguridad con puntera composite ultraliviana y suela bidensidad antideslizante para faenas de alto riesgo eléctrico e industrial.',
    descriptionHtml: '<p>Calzado de seguridad dieléctrico diseñado para máxima protección y confort en extensas jornadas industriales. Incorpora puntera de composite no metálica resistente a impactos de 200 Joules, planta de poliuretano bidensidad resistente a hidrocarburos y plantilla interior antiperforación textil certificada bajo norma NCh / ISO 20345.</p>',
    colors: [{ name: 'Negro', hex: '#111827', image: '/images/productos/zapato-seguridad.png' }],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    features: [
      { name: 'Material Capellada', value: 'Cuero Hidrofugado y Malla Ripstop Alta Tenacidad' },
      { name: 'Puntera de Protección', value: 'Composite Ultraliviano 200J (Libre de Metal)' },
      { name: 'Aislación Eléctrica', value: 'Dieléctrico Certificado hasta 14.000V (ASTM F2413)' },
      { name: 'Planta / Suela', value: 'PU Bidensidad Antideslizante Resistente a Hidrocarburos' },
      { name: 'Plantilla Seguridad', value: 'Kevlar Antiperforación Flexible 1.100N' },
      { name: 'Certificación', value: 'NCh 772/1 · EN ISO 20345 S3 SRC · Registro ISP' },
    ],
  },
  {
    id: 'botin-seguridad',
    name: 'Botín de Seguridad Cuero Faena Pesada',
    category: 'EPP',
    image: '/images/productos/botin-seguridad.jpg',
    images: ['/images/productos/botin-seguridad.jpg'],
    sku: 'EPP-002',
    line: 'Calzado Minero',
    gender: 'Unisex',
    summary: 'Botín de cuero flor impermeable con caña acolchada, puntera reforzada y plantilla antipunzonamiento para minería, construcción y obras civiles.',
    descriptionHtml: '<p>Botín industrial de alto desempeño confeccionado en cuero flor engrasado hidrofugado con costuras triples de alta resistencia. Su estructura protege el tobillo frente a torsiones en terrenos irregulares y ofrece aislamiento térmico y resistencia superior a la abrasión.</p>',
    colors: [{ name: 'Café Moro', hex: '#4E3524', image: '/images/productos/botin-seguridad.jpg' }],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    features: [
      { name: 'Material Capellada', value: 'Cuero Flor Engrasado Hidrofugado 2.2 mm' },
      { name: 'Puntera de Protección', value: 'Acero Templado / Composite 200 Joules' },
      { name: 'Planta / Suela', value: 'Caucho Acrilo-Nitrilo Resistente a 300 °C y Ácidos' },
      { name: 'Plantilla Seguridad', value: 'Antiperforación de Acero / Textil Multicapa' },
      { name: 'Forro Interior', value: 'Membrana Respirable Antibacteriana Thinsulate™' },
      { name: 'Certificación', value: 'NCh 772/1 · ASTM F2413 · Registro ISP Chile' },
    ],
  },
  {
    id: 'casco-lentes',
    name: 'Casco de Seguridad Industrial Clase A con Barbiquejo',
    category: 'EPP',
    image: '/images/productos/casco-seguridad-blanco.jpg',
    images: [
      '/images/productos/casco-seguridad-blanco.jpg',
      '/images/productos/casco-seguridad-amarillo.jpg',
      '/images/productos/casco-seguridad-azul.jpg',
    ],
    sku: 'EPP-003',
    line: 'Protección Craneal',
    gender: 'Unisex',
    summary: 'Casco de protección industrial certificado Clase A dieléctrico con arnés interior de 6 puntas con ajuste roller y barbiquejo de 4 apoyos.',
    descriptionHtml: '<p>Casco de seguridad industrial fabricado en polietileno de alta densidad (HDPE) virgen con aditivo filtro UV. Diseñado para absorber impactos verticales y laterales, cuenta con ranuras universales para acoplar protectores auditivos y faciales, suspensión de cinta tejida con ajuste tipo ratchet y barbiquejo anclado en 4 puntos para trabajos en altura.</p>',
    colors: [
      { name: 'Blanco', hex: '#FFFFFF', image: '/images/productos/casco-seguridad-blanco.jpg' },
      { name: 'Amarillo', hex: '#F59E0B', image: '/images/productos/casco-seguridad-amarillo.jpg' },
      { name: 'Azul', hex: '#1D4ED8', image: '/images/productos/casco-seguridad-azul.jpg' },
    ],
    sizes: ['Ajustable (53–63 cm)'],
    features: [
      { name: 'Material Carcasa', value: 'Polietileno de Alta Densidad (HDPE) con Filtro UV' },
      { name: 'Clasificación Eléctrica', value: 'Clase A / Clase E Dieléctrico hasta 20.000V' },
      { name: 'Sistema de Suspensión', value: 'Arnés Textil de 6 Puntas con Ajuste Roller Ratchet' },
      { name: 'Barbiquejo Incluido', value: 'Nylon de 4 Puntos con Mentonera Ergonómica' },
      { name: 'Compatibilidad', value: 'Slots Universales 30 mm para Fonos y Careta Facial' },
      { name: 'Certificación', value: 'NCh 461 · ANSI/ISEA Z89.1 Tipo I · Registro ISP' },
    ],
  },
  {
    id: 'lentes-proteccion',
    name: 'Lentes de Seguridad Policarbonato Anti-Empaño UV400',
    category: 'EPP',
    image: '/images/productos/lentes-proteccion.jpg',
    images: ['/images/productos/lentes-proteccion.jpg'],
    sku: 'EPP-004',
    line: 'Protección Visual',
    gender: 'Unisex',
    summary: 'Lentes de seguridad envolventes en policarbonato óptico clase 1 con filtro UV400, recubrimiento anti-rayaduras y tratamiento anti-empaño permanente.',
    descriptionHtml: '<p>Gafas de protección ocular de diseño envolvente panorámico sin distorsión óptica. Su lente de policarbonato de alto impacto protege contra proyección de partículas a alta velocidad y filtra el 99,9% de la radiación ultravioleta, con puente nasal de silicona hipoalergénica y patillas bi-material antideslizantes.</p>',
    colors: [{ name: 'Claro / Marco Azul-Negro', hex: '#1E3A8A', image: '/images/productos/lentes-proteccion.jpg' }],
    sizes: ['Estándar Universal'],
    features: [
      { name: 'Material Lente', value: 'Policarbonato Óptico Clase 1 de Alto Impacto' },
      { name: 'Tratamiento Superficial', value: 'Anti-Empaño (Anti-Fog N) y Anti-Rayadura (K)' },
      { name: 'Filtro Ultravioleta', value: 'UV400 (99,9% Absorción Radiación UVA/UVB)' },
      { name: 'Marco y Patillas', value: 'Nylon Flexible con Inserciones de Goma Antideslizante' },
      { name: 'Puente Nasal', value: 'Silicona Suave Anatómica Libre de Metal' },
      { name: 'Certificación', value: 'ANSI Z87.1+ High Impact · EN 166 1F KN' },
    ],
  },
  {
    id: 'guantes-seguridad',
    name: 'Guantes de Seguridad Cuero Cabritilla y Nitrilo Heavy Duty',
    category: 'EPP',
    image: '/images/productos/guantes-seguridad.jpg',
    images: ['/images/productos/guantes-seguridad.jpg'],
    sku: 'EPP-005',
    line: 'Protección Manual',
    gender: 'Unisex',
    summary: 'Guantes industriales de cuero cabritilla seleccionado con refuerzo palmar anticorte e impacto para montaje pesado, minería y mantenimiento.',
    descriptionHtml: '<p>Guante técnico de alto rendimiento confeccionado en cuero natural seleccionado con palma doblemente reforzada y costuras en hilo Kevlar® de alta resistencia mecánica. Ofrece excelente destreza táctil combinada con protección superior contra abrasión, rasgado y punción.</p>',
    colors: [{ name: 'Cuero / Negro', hex: '#92400E', image: '/images/productos/guantes-seguridad.jpg' }],
    sizes: ['M (8)', 'L (9)', 'XL (10)', 'XXL (11)'],
    features: [
      { name: 'Material Principal', value: 'Cuero Flor Cabritilla Hidrofugado y Palma Reforzada' },
      { name: 'Costuras', value: 'Hilo Aramida / Kevlar® de Alta Tenacidad' },
      { name: 'Nivel Resistencia EN 388', value: '4X43C (Alta Resistencia a Abrasión, Rasgado y Corte)' },
      { name: 'Puño de Seguridad', value: 'Elastizado con Banda de Ajuste y Ribete Reforzado' },
      { name: 'Ergonomía', value: 'Diseño Pre-Curvado de Alta Destreza Manual' },
      { name: 'Certificación', value: 'EN 388:2016+A1:2018 · EN 420 · Registro ISP' },
    ],
  },
  {
    id: 'protector-auditivo',
    name: 'Fonos de Protección Auditiva Industrial NRR 31dB',
    category: 'EPP',
    image: '/images/productos/protector-auditivo.jpg',
    images: ['/images/productos/protector-auditivo.jpg'],
    sku: 'EPP-006',
    line: 'Protección Auditiva',
    gender: 'Unisex',
    summary: 'Protector auditivo tipo copa de alta atenuación sonora NRR 31dB / SNR 34dB con cintillo acolchado regulable y almohadillas viscoelásticas.',
    descriptionHtml: '<p>Protector auditivo pasivo de alto desempeño diseñado para ambientes industriales con niveles críticos de ruido continuo o intermitente (plantas de chancado, generadores, maestranzas y aeródromos). Construcción dieléctrica con regulación telescópica multipunto.</p>',
    colors: [{ name: 'Negro / Amarillo Hi-Vis', hex: '#EAB308', image: '/images/productos/protector-auditivo.jpg' }],
    sizes: ['Regulable Multipunto'],
    features: [
      { name: 'Nivel de Atenuación', value: 'NRR 31 dB (ANSI) / SNR 34 dB (ISO 4869)' },
      { name: 'Material Copas', value: 'ABS de Alto Impacto con Espuma Acústica Multicapa' },
      { name: 'Almohadillas', value: 'Espuma Viscoelástica Suave de Sello Hermético' },
      { name: 'Cintillo / Arnes', value: 'Banda Acolchada Regulable con Distribución Equilibrada' },
      { name: 'Propiedad Eléctrica', value: 'Diseño Dieléctrico Seguro para Entornos Eléctricos' },
      { name: 'Certificación', value: 'ANSI S3.19 · EN 352-1 · Registro ISP Chile' },
    ],
  },
  {
    id: 'respirador-doble-via',
    name: 'Respirador Medio Rostro Silicona Doble Vía + Filtros P100',
    category: 'EPP',
    image: '/images/productos/respirador-doble-via.jpg',
    images: ['/images/productos/respirador-doble-via.jpg'],
    sku: 'EPP-007',
    line: 'Protección Respiratoria',
    gender: 'Unisex',
    summary: 'Respirador reutilizable de medio rostro en silicona hipoalergénica con válvula de exhalación de flujo frío y par de filtros P100 de 99,97% de eficiencia.',
    descriptionHtml: '<p>Equipo de protección respiratoria de doble vía fabricado en elastómero de silicona termoplástica suave para un ajuste hermético y confortable durante toda la faena. Incluye conexión tipo bayoneta compatible con cartuchos químicos y filtros para partículas sólidas y líquidas P100.</p>',
    colors: [{ name: 'Gris Acero / Magenta P100', hex: '#475569', image: '/images/productos/respirador-doble-via.jpg' }],
    sizes: ['S', 'M', 'L'],
    features: [
      { name: 'Material Pieza Facial', value: 'Silicona Termoplástica Hipoalergénica de Sello Suave' },
      { name: 'Eficiencia Filtración', value: '99,97% contra Partículas, Polvo de Sílice y Humos Metálicos' },
      { name: 'Sistema de Conexión', value: 'Doble Vía Bayoneta con Válvula de Exhalación Flujo Frío' },
      { name: 'Arnés de Sujeción', value: 'Cuna Craneal Ajustable de 4 Puntos de Baja Presión' },
      { name: 'Compatibilidad', value: 'Perfil Bajo Compatible con Lentes y Casco de Seguridad' },
      { name: 'Certificación', value: 'NIOSH 42 CFR 84 P100 · EN 140 · Registro ISP' },
    ],
  },
  {
    id: 'arnes-seguridad',
    name: 'Arnés de Seguridad Cuerpo Completo 4 Argollas Clase ADP',
    category: 'EPP',
    image: '/images/productos/arnes-seguridad.jpg',
    images: ['/images/productos/arnes-seguridad.jpg'],
    sku: 'EPP-008',
    line: 'Trabajo en Altura',
    gender: 'Unisex',
    summary: 'Arnés anticaídas tipo paracaidista de 4 argollas en D (dorsal, pectoral y laterales de posicionamiento) con faja lumbar ergonómica acolchada.',
    descriptionHtml: '<p>Arnés de cuerpo completo diseñado para detención de caídas, ascenso/descenso controlado y posicionamiento en estructuras, torres y faenas mineras. Confeccionado en cinta de poliéster de alta tenacidad bicolor para rápida inspección visual, con testigo de impacto y herrajes de acero forjado.</p>',
    colors: [{ name: 'Amarillo Hi-Vis / Negro', hex: '#EAB308', image: '/images/productos/arnes-seguridad.jpg' }],
    sizes: ['S–M', 'L–XL', 'XXL'],
    features: [
      { name: 'Configuración Argollas', value: '4 Argollas en D de Acero Forjado (1 Dorsal, 1 Frontal, 2 Laterales)' },
      { name: 'Material Cintas', value: 'Poliéster de Alta Tenacidad 45 mm (Resistencia > 22 kN)' },
      { name: 'Soporte Ergonómico', value: 'Faja Lumbar y Pierneras Acolchadas Respirables' },
      { name: 'Seguridad Integrada', value: 'Indicador de Impacto Dorsal y Hebillas de Conexión Rápida' },
      { name: 'Capacidad de Carga', value: '140 kg (Incluyendo Usuario, Ropa y Herramientas)' },
      { name: 'Certificación', value: 'NCh 1258/1 Clase ADP · ANSI/ASSP Z359.11 · Registro ISP' },
    ],
  },
  {
    id: 'bordado-corporativo',
    name: 'Servicio de Bordado Computarizado Corporativo Alta Densidad',
    category: 'Ropa Personalizada',
    image: '/images/productos/bordado-corporativo-polo.jpg',
    images: ['/images/productos/bordado-corporativo-polo.jpg', '/images/embroidery-workshop.png'],
    sku: 'PERS-001',
    line: 'Personalización Textil',
    gender: 'Unisex',
    summary: 'Bordado industrial computarizado con hilos de poliéster de alta tenacidad resistentes al cloro y lavado industrial para logos en pecho, manga y espalda.',
    descriptionHtml: '<p>Servicio integral de matrizaje digital y bordado computarizado multicabezal sobre camisas ejecutivas, poleras piqué, chaquetas softshell, parkas térmicas, micropolar y gorros. Garantizamos definición milimétrica de tipografías y colores Pantone corporativos sin deformar la prenda.</p>',
    colors: [
      { name: 'Multicolor Pantone', hex: '#1E3A8A', image: '/images/productos/bordado-corporativo-polo.jpg' },
    ],
    sizes: ['Pecho (hasta 11 cm)', 'Manga (hasta 8 cm)', 'Espalda (hasta 26 cm)'],
    features: [
      { name: 'Tecnología', value: 'Bordadoras Industriales Multicabezal de Alta Precisión' },
      { name: 'Hilos Utilizados', value: '100% Poliéster Trilobal de Alta Tenacidad (Solidez al Cloro y UV)' },
      { name: 'Capacidad Color', value: 'Hasta 15 Colores Simultáneos por Logotipo Corporativo' },
      { name: 'Fijación Técnica', value: 'Entretela de Soporte Termofijada según Gramaje de Prenda' },
      { name: 'Muestras Previas', value: 'Ficha Digital y Muestra Física de Aprobación sin Costo en Pedidos B2B' },
      { name: 'Durabilidad', value: 'Superior a 100 Ciclos de Lavado Industrial sin Deshilachado' },
    ],
  },
  {
    id: 'estampado-textil',
    name: 'Estampado Textil Industrial DTF, Serigrafía y Reflectivo',
    category: 'Ropa Personalizada',
    image: '/images/productos/estampado-dtf.jpg',
    images: ['/images/productos/estampado-dtf.jpg'],
    sku: 'PERS-002',
    line: 'Personalización Textil',
    gender: 'Unisex',
    summary: 'Estampado digital DTF full color, serigrafía plastisol y transfer reflectivo certificado para vestuario técnico, cortavientos y ropa de seguridad.',
    descriptionHtml: '<p>Solución de estampado industrial de alta adherencia y elasticidad, ideal para prendas impermeables, respirables o con membranas técnicas donde no se debe perforar la tela con aguja. Disponible en tecnología DTF Full Color, Vinilo Textil PU y Transfer Reflectivo normado para faenas nocturnas.</p>',
    colors: [
      { name: 'Full Color / Reflectivo', hex: '#334155', image: '/images/productos/estampado-dtf.jpg' },
    ],
    sizes: ['Pecho (10×10 cm)', 'Manga / Casco', 'Espalda Completa (28×35 cm)'],
    features: [
      { name: 'Tecnologías Disponibles', value: 'DTF Industrial Full Color, Serigrafía y Transfer Reflectivo' },
      { name: 'Compatibilidad', value: 'Algodón, Poliéster Dryfit, Softshell, Oxford Impermeable y Ripstop' },
      { name: 'Propiedad Mecánica', value: 'Acabado Flexible con Memoria Elástica sin Cuarteo' },
      { name: 'Opción Alta Visibilidad', value: 'Logos y Textos en Transfer Reflectivo > 400 cd/(lx·m²)' },
      { name: 'Sellado Térmico', value: 'Prensas Neumáticas de Presión y Temperatura Controlada' },
      { name: 'Resistencia Lavado', value: 'Certificado para más de 60 Lavados Industriales' },
    ],
  },
  {
    id: 'parche-corporativo',
    name: 'Parches Corporativos Bordados con Velcro y Termosellado',
    category: 'Ropa Personalizada',
    image: '/images/productos/parche-corporativo.jpg',
    images: ['/images/productos/parche-corporativo.jpg', '/images/productos/parche-corporativo-chaqueta.jpg'],
    sku: 'PERS-003',
    line: 'Personalización Textil',
    gender: 'Unisex',
    summary: 'Escudos e identificadores corporativos bordados en alta definición con borde overlock reforzado y fijación Velcro® o adhesivo termofusible.',
    descriptionHtml: '<p>Parches e insignias institucionales diseñados para dotaciones rotativas, ropa ignífuga (con hilos certificables), overoles de faena y parkas térmicas. Permiten intercambiar cargos, nombres de operadores, grupos sanguíneos y logos de empresas contratistas con máxima durabilidad.</p>',
    colors: [
      { name: 'Azul Marino / Personalizado', hex: '#0F172A', image: '/images/productos/parche-corporativo.jpg' },
    ],
    sizes: ['Estándar Pecho (9×5 cm)', 'Escudo Manga (8×8 cm)', 'Piocha Nombre (12×3 cm)'],
    features: [
      { name: 'Base Textil', value: 'Gabardina / Sarga de Alta Densidad con Borde Merrow (Overlock)' },
      { name: 'Sistema de Anclaje', value: 'Velcro® Macho/Hembra Cosido, Termosellado o Costura Directa' },
      { name: 'Aplicaciones Clave', value: 'Logos Contratistas, Piochas de Nombre, Cargo y Grupo Sanguíneo' },
      { name: 'Opción Ignífuga', value: 'Disponible en Hilo Nomex® para Vestuario Ignífugo NFPA 2112' },
      { name: 'Acabado', value: 'Corte Láser Perimetral sin Bordes Deshilachados' },
      { name: 'Pedido Mínimo', value: 'Desde 30 Unidades por Diseño Corporativo' },
    ],
  },
];

/**
 * Catálogo completo de la empresa: 220 productos (Core EPP + 212 productos extraídos y adaptados)
 */
export const PRODUCTS: Product[] = [
  ...CORE_PRODUCTS,
  ...(catalogModelsData.products as Product[]),
];

export interface Category {
  id: string;
  name: string;
  badgeBold: string;
  badgeLight: string;
  bannerColor: string;
  description: string;
  image: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'corporativa',
    name: 'Ropa Corporativa',
    badgeBold: 'ROPA',
    badgeLight: 'CORPORATIVA',
    bannerColor: 'rgba(18, 74, 128, 0.86)',
    description: 'Polerones, camisas ejecutivas, poleras piqué y prendas con estándar corporativo.',
    image: '/images/lineas/corporativa.jpg',
    subcategories: ['Poleras Piqué', 'Polerones', 'Camisas', 'Chaquetas Softshell', 'Polares', 'Gorros'],
  },
  {
    id: 'industrial',
    name: 'Ropa Industrial',
    badgeBold: 'ROPA',
    badgeLight: 'INDUSTRIAL',
    bannerColor: 'rgba(28, 41, 66, 0.88)',
    description: 'Pantalones cargo reforzados, overoles, parkas térmicas y ropa de faena pesada.',
    image: '/images/lineas/industrial.jpg',
    subcategories: ['Pantalones Cargo', 'Overoles', 'Parkas Térmicas', 'Buzos de Trabajo', 'Chaquetas Térmicas'],
  },
  {
    id: 'seguridad',
    name: 'Ropa de Seguridad',
    badgeBold: 'ROPA DE',
    badgeLight: 'SEGURIDAD',
    bannerColor: 'rgba(202, 148, 12, 0.88)',
    description: 'Prendas reflectantes norma ANSI, ignífugas, chalecos geólogo y alta visibilidad.',
    image: '/images/lineas/seguridad.jpg',
    subcategories: ['Chalecos Geólogo', 'Parkas Alta Visibilidad', 'Ropa Ignífuga', 'Cintas Reflectantes'],
  },
  {
    id: 'epp',
    name: 'EPP',
    badgeBold: 'LÍNEA',
    badgeLight: 'EPP',
    bannerColor: 'rgba(45, 55, 72, 0.88)',
    description: 'Equipos de Protección Personal certificados: calzado dieléctrico, cascos, lentes y guantes.',
    image: '/images/lineas/epp.jpg',
    subcategories: ['Calzado Dieléctrico', 'Cascos de Seguridad', 'Guantes Técnicos', 'Lentes Anti-impacto', 'Protección Auditiva'],
  },
  {
    id: 'personalizada',
    name: 'Ropa Personalizada',
    badgeBold: 'ROPA',
    badgeLight: 'PERSONALIZADA',
    bannerColor: 'rgba(198, 40, 40, 0.86)',
    description: 'Bordado computarizado, estampado y aplicaciones con la identidad visual de tu marca.',
    image: '/images/lineas/personalizada.jpg',
    subcategories: ['Bordado Computarizado', 'Estampado Serigrafía/DTF', 'Parches Corporativos', 'Confección a Medida'],
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
    title: 'Calzado de Seguridad Dieléctrico',
    normCode: 'NCh 772 • REGISTRO ISP',
    description: 'Puntera composite no metálica 200J, aislación dieléctrica 14 kV y suela antideslizante bajo normas EN ISO 20345 y ASTM F2413.',
  },
  {
    title: 'Alta Visibilidad y Reflectivos',
    normCode: 'ANSI / ISEA 107 CLASE 3',
    description: 'Cintas retrorreflectivas 3M Scotchlite™ y tejidos fluorescentes certificados para operaciones viales, logísticas y faena nocturna.',
  },
  {
    title: 'Ropa Ignífuga y Arco Eléctrico',
    normCode: 'NFPA 2112 • EN ISO 11612',
    description: 'Protección térmica inherente ante fuego repentino y arco eléctrico (Arc Flash) según requerimientos de faenas mineras y eléctricas.',
  },
  {
    title: 'Cumplimiento Legal y Auditorías',
    normCode: 'DS 594 • LEY 16.744',
    description: 'Fichas técnicas y certificados de fábrica respaldados para comités paritarios, mutuales y fiscalizaciones laborales.',
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
