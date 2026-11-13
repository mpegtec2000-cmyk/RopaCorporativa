#!/usr/bin/env node
/**
 * Scraper y migrador de productos EPP desde treck.cl (VTEX) a Zortex
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CMS_PRODUCTS_FILE = path.join(ROOT, 'data', 'cms', 'products.json');
const EPP_CATALOG_FILE = path.join(ROOT, 'src', 'data', 'catalog-epp.json');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'epp');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

const CATEGORIES_CONFIG = [
  {
    name: 'Calzado de seguridad',
    line: 'Calzado de seguridad',
    slug: 'calzado-de-seguridad',
    count: 25,
    defaultColor: 'Negro',
    defaultHex: '#1f2937'
  },
  {
    name: 'Protección Manos',
    line: 'Protección Manos',
    slug: 'proteccion-manos',
    count: 25,
    defaultColor: 'Gris / Negro',
    defaultHex: '#374151'
  },
  {
    name: 'Protección Auditiva',
    line: 'Protección Auditiva',
    slug: 'proteccion-auditiva',
    count: 25,
    defaultColor: 'Amarillo / Negro',
    defaultHex: '#eab308'
  },
  {
    name: 'Cascos de seguridad',
    line: 'Cascos de seguridad',
    slug: 'cascos-de-seguridad',
    count: 25,
    defaultColor: 'Blanco',
    defaultHex: '#f8fafc'
  },
  {
    name: 'Protección respiratoria',
    line: 'Protección Respiratoria',
    slug: 'proteccion-respiratoria',
    count: 25,
    defaultColor: 'Gris / Silicona',
    defaultHex: '#64748b'
  },
  {
    name: 'Protección Vista',
    line: 'Protección Vista',
    slug: 'proteccion-vista',
    count: 25,
    defaultColor: 'Transparente / Azul',
    defaultHex: '#0284c7'
  },
  {
    name: 'Protección Caída',
    line: 'Protección Caída',
    slug: 'proteccion-caida',
    count: 25,
    defaultColor: 'Amarillo Hi-Vis',
    defaultHex: '#facc15'
  },
  {
    name: 'Protección Dérmica',
    line: 'Protección Dérmica',
    slug: 'proteccion-dermica',
    count: 20,
    defaultColor: 'Blanco',
    defaultHex: '#ffffff'
  },
  {
    name: 'Emergencia y Vialidad',
    line: 'Emergencia y Vialidad',
    slug: 'emergencia-y-vialidad',
    count: 25,
    defaultColor: 'Naranjo / Fluor',
    defaultHex: '#ea580c'
  },
  {
    name: 'Sistemas de bloqueo',
    line: 'Sistemas de bloqueo',
    slug: 'sistemas-de-bloqueo',
    count: 25,
    defaultColor: 'Rojo Seguridad',
    defaultHex: '#dc2626'
  },
  {
    name: 'Duchas y lavaojos',
    line: 'Duchas y lavaojos',
    slug: 'duchas-y-lavaojos',
    count: 25,
    defaultColor: 'Verde Seguridad',
    defaultHex: '#16a34a'
  },
  {
    name: 'Equipos e Instrumentos',
    line: 'Equipos e Instrumentos',
    slug: 'equipos-e-instrumentos',
    count: 25,
    defaultColor: 'Industrial',
    defaultHex: '#475569'
  },
  {
    name: 'Herramientas',
    line: 'Herramientas de Seguridad',
    slug: 'herramientas',
    count: 25,
    defaultColor: 'Rojo / Acero',
    defaultHex: '#b91c1c'
  }
];

function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function cleanText(text = '') {
  return text
    .replace(/Treck S\.?A\.?/gi, 'Zortex')
    .replace(/Treck Chile/gi, 'Zortex')
    .replace(/\bTreck\b/gi, 'Zortex')
    .replace(/www\.treck\.cl/gi, 'www.zortex.cl')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHtml(html = '') {
  if (!html) return '';
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/Treck S\.?A\.?/gi, 'Zortex')
    .replace(/Treck Chile/gi, 'Zortex')
    .replace(/\bTreck\b/gi, 'Zortex')
    .replace(/www\.treck\.cl/gi, 'www.zortex.cl');
  return s.trim();
}

const COLOR_MAP = [
  { match: /negro|black/i, name: 'Negro', hex: '#111827' },
  { match: /cafe|marron|brown|crazy/i, name: 'Café', hex: '#5c3a21' },
  { match: /blanco|white/i, name: 'Blanco', hex: '#ffffff' },
  { match: /azul|blue|marino/i, name: 'Azul Marino', hex: '#1e3a8a' },
  { match: /gris|grey/i, name: 'Gris', hex: '#4b5563' },
  { match: /amarillo|yellow/i, name: 'Amarillo', hex: '#eab308' },
  { match: /naranjo|orange/i, name: 'Naranjo', hex: '#f97316' },
  { match: /rojo|red/i, name: 'Rojo', hex: '#dc2626' },
  { match: /verde|green/i, name: 'Verde', hex: '#16a34a' },
  { match: /fluor|fluo/i, name: 'Alta Visibilidad Flúor', hex: '#84cc16' },
  { match: /transparente|claro|clear/i, name: 'Transparente', hex: '#e0f2fe' }
];

function detectColor(name, defaultColor, defaultHex) {
  for (const c of COLOR_MAP) {
    if (c.match.test(name)) {
      return { name: c.name, hex: c.hex };
    }
  }
  return { name: defaultColor || 'Estándar', hex: defaultHex || '#334155' };
}

async function downloadImage(url, destPath) {
  try {
    if (fs.existsSync(destPath)) {
      const stat = fs.statSync(destPath);
      if (stat.size > 1000) return true;
    }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando extracción de productos EPP desde treck.cl...');
  
  const allExtractedProducts = [];
  const processedSkus = new Set();
  const processedSlugs = new Set();

  for (const cat of CATEGORIES_CONFIG) {
    console.log(`\n📦 Obteniendo sección: ${cat.name} (${cat.slug})...`);
    const url = `https://www.treck.cl/api/catalog_system/pub/products/search/${cat.slug}?_from=0&_to=${cat.count - 1}`;
    
    let rawProducts = [];
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      rawProducts = await res.json();
    } catch (e) {
      console.error(`❌ Error consultando ${cat.slug}: ${e.message}`);
      continue;
    }

    if (!Array.isArray(rawProducts)) {
      console.log(`⚠️ Respuesta no fue un arreglo para ${cat.slug}`);
      continue;
    }

    console.log(`  Encontrados ${rawProducts.length} productos en ${cat.name}`);
    let catAdded = 0;

    for (const p of rawProducts) {
      const sku = (p.productReference || p.productReferenceCode || `EPP-${cat.slug.slice(0, 3).toUpperCase()}-${p.productId}`).trim();
      if (processedSkus.has(sku)) continue;

      let baseSlug = slugify(p.productName);
      let id = `epp-${baseSlug}`;
      if (processedSlugs.has(id)) {
        id = `${id}-${sku.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      }
      processedSlugs.add(id);
      processedSkus.add(sku);

      // Extraer imágenes
      const remoteImages = [];
      const sizesSet = new Set();
      const colorsSet = new Set();

      (p.items || []).forEach(item => {
        (item.Talla || []).forEach(t => sizesSet.add(String(t).trim()));
        (item.Color || []).forEach(c => colorsSet.add(String(c).trim()));
        (item.images || []).forEach(img => {
          if (img.imageUrl && !remoteImages.includes(img.imageUrl)) {
            remoteImages.push(img.imageUrl);
          }
        });
      });

      const primaryRemoteImage = remoteImages[0] || (p.items?.[0]?.images?.[0]?.imageUrl) || '';
      const localImageName = `${id}.jpg`;
      const localImagePath = path.join(IMG_DIR, localImageName);
      const publicImageUrl = `/images/epp/${localImageName}`;

      let imageToUse = publicImageUrl;
      if (primaryRemoteImage) {
        const ok = await downloadImage(primaryRemoteImage, localImagePath);
        if (!ok) {
          imageToUse = primaryRemoteImage;
        }
      }

      // Preparar lista de imágenes
      const imagesList = [imageToUse];
      remoteImages.slice(1, 5).forEach(img => {
        if (!imagesList.includes(img)) imagesList.push(img);
      });

      // Tamaños
      let sizes = [...sizesSet].filter(Boolean);
      if (sizes.length === 0) {
        sizes = ['Estándar Universal'];
      } else {
        // Orden numérico si todos son números
        if (sizes.every(s => /^\d+$/.test(s))) {
          sizes.sort((a, b) => Number(a) - Number(b));
        }
      }

      // Colores
      const detectedColor = detectColor(p.productName, cat.defaultColor, cat.defaultHex);
      let colors = [];
      if (colorsSet.size > 0) {
        colors = [...colorsSet].map(c => {
          const dc = detectColor(c, cat.defaultColor, cat.defaultHex);
          return { name: c, hex: dc.hex, image: imageToUse };
        });
      } else {
        colors = [{ name: detectedColor.name, hex: detectedColor.hex, image: imageToUse }];
      }

      // Features / Especificaciones técnicas
      const features = [];
      if (p.brand) {
        features.push({ name: 'Marca / Fabricante', value: p.brand });
      }
      features.push({ name: 'Código / SKU', value: sku });
      features.push({ name: 'Línea Técnica EPP', value: cat.line });

      // Certificaciones / ISP
      if (p['Registro ISP'] && p['Registro ISP'][0]) {
        features.push({ name: 'Registro ISP', value: String(p['Registro ISP'][0]) });
      }
      if (p['Certificaciones'] && p['Certificaciones'][0]) {
        features.push({ name: 'Certificaciones', value: String(p['Certificaciones'][0]) });
      }
      if (p['Modelo'] && p['Modelo'][0]) {
        features.push({ name: 'Modelo Técnico', value: String(p['Modelo'][0]) });
      }
      if (p['Tipo Puntera'] && p['Tipo Puntera'][0]) {
        features.push({ name: 'Tipo de Puntera', value: String(p['Tipo Puntera'][0]) });
      }
      if (p['Tecnología'] && p['Tecnología'][0]) {
        features.push({ name: 'Tecnología', value: String(p['Tecnología'][0]) });
      }

      // Extraer bullets del HTML de descripción
      const desc = p.description || '';
      const bulletMatches = [...desc.matchAll(/<li>(?:<strong>)?([^:<]+?)(?:<\/strong>)?:?\s*(?:<strong>)?([^<]+?)(?:<\/strong>)?<\/li>/g)];
      for (const m of bulletMatches) {
        const key = m[1].replace(/[:\-]$/, '').trim();
        const val = m[2].trim();
        if (key.length > 2 && key.length < 35 && val.length > 2 && val.length < 120) {
          if (!features.some(f => f.name.toLowerCase() === key.toLowerCase())) {
            features.push({ name: key, value: val });
          }
        }
        if (features.length >= 8) break;
      }

      if (features.length < 4) {
        features.push({ name: 'Uso Recomendado', value: 'Industrial, faena pesada y seguridad laboral' });
        features.push({ name: 'Distribución', value: 'Mayorista B2B Zortex con despacho nacional' });
      }

      const summary = cleanText(p.metaTagDescription || `${p.productName} para faenas y seguridad laboral técnica.`);
      const descriptionHtml = cleanHtml(p.description || `<p>${summary}</p>`);

      const product = {
        id,
        baseId: id,
        name: cleanText(p.productName),
        displayName: cleanText(p.productName),
        category: 'EPP',
        line: cat.line,
        image: imageToUse,
        images: imagesList,
        sku,
        color: colors[0].name,
        colorHex: colors[0].hex,
        colors,
        sizes,
        gender: 'Unisex',
        summary,
        descriptionHtml,
        features,
        isActive: true,
        isFeatured: false,
        sortOrder: 1000 + allExtractedProducts.length
      };

      allExtractedProducts.push(product);
      catAdded++;
    }

    console.log(`  ✅ Procesados y guardados ${catAdded} productos para ${cat.name}`);
  }

  console.log(`\n🎉 Extracción completa: ${allExtractedProducts.length} productos EPP obtenidos.`);

  // Guardar catálogo separado para referencia y backup
  fs.writeFileSync(EPP_CATALOG_FILE, JSON.stringify(allExtractedProducts, null, 2), 'utf8');
  console.log(`💾 Guardado catálogo EPP en ${EPP_CATALOG_FILE}`);

  // Actualizar data/cms/products.json
  if (fs.existsSync(CMS_PRODUCTS_FILE)) {
    const existingCms = JSON.parse(fs.readFileSync(CMS_PRODUCTS_FILE, 'utf8'));
    console.log(`📊 Productos actuales en CMS: ${existingCms.length}`);
    
    // Mantener productos que no sean colisión de ID y agregar los nuevos EPP
    const existingMap = new Map();
    existingCms.forEach(p => existingMap.set(p.id, p));

    allExtractedProducts.forEach(newP => {
      existingMap.set(newP.id, newP);
    });

    const updatedCms = Array.from(existingMap.values());
    fs.writeFileSync(CMS_PRODUCTS_FILE, JSON.stringify(updatedCms, null, 2), 'utf8');
    console.log(`💾 Actualizado ${CMS_PRODUCTS_FILE} con total: ${updatedCms.length} productos.`);
  }

  // Contar productos EPP finales por línea
  const lineCounts = {};
  allExtractedProducts.forEach(p => {
    lineCounts[p.line] = (lineCounts[p.line] || 0) + 1;
  });
  console.log('\n📊 Resumen de stock EPP incorporado por sección:');
  console.table(lineCounts);
}

main().catch(console.error);
