#!/usr/bin/env node
/**
 * Scraper de catálogo — tworldstore.cl (PrestaShop) → catálogo Zortex
 *
 * Extrae todos los productos, los re-categoriza al giro de Zortex
 * (Ropa Corporativa / Ropa Personalizada / Ropa Industrial / EPP / Ropa de Seguridad),
 * limpia marcas del proveedor y descarga las imágenes localmente.
 *
 * Salidas:
 *   - src/data/catalog.json                 → datos de productos
 *   - public/images/catalogo/<slug>/N.jpg   → imágenes
 *
 * Uso:
 *   node scripts/scrape-tworld.mjs                  # todo
 *   node scripts/scrape-tworld.mjs --limit 5        # prueba con 5 productos
 *   node scripts/scrape-tworld.mjs --no-images      # sólo datos
 *   node scripts/scrape-tworld.mjs --images 3       # máx. imágenes por producto (default 4)
 *   node scripts/scrape-tworld.mjs --concurrency 2  # peticiones simultáneas (default 3)
 *
 * Es re-ejecutable: las imágenes ya descargadas no se vuelven a bajar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ───────────────────────── Configuración ─────────────────────────
const BASE = 'https://tworldstore.cl';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'catalog.json');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'catalogo');
const IMG_PUBLIC = '/images/catalogo';

/** Categorías de origen a recorrer (se deduplica por id de producto). */
const SOURCE_CATEGORIES = [
  '9-lineas', '3-chaqueta', '4-pantalones', '5-poleras-camisas-y-mas',
  '7-accesorios', '8-ropa-tecnica', '10-hombre', '11-mujer',
  '12-nuevos-productos', '13-productos-destacados', '74-productos-certificados',
];

/** Tamaños de imagen PrestaShop por preferencia (el primero disponible gana). */
const IMAGE_SIZES = ['large_default', 'superlarge_default', 'medium_default', 'home_default'];

/** Términos de marca del proveedor que se eliminan de nombres y descripciones. */
const BRAND_TERMS = [/t[\s-]?world(\s?store)?/gi, /texora/gi, /work\s?wear\s?center/gi];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

// ───────────────────────── CLI ─────────────────────────
const args = process.argv.slice(2);
const argVal = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};
const LIMIT = argVal('--limit', Infinity);
const MAX_IMAGES = argVal('--images', 4);
const CONCURRENCY = argVal('--concurrency', 3);
const DOWNLOAD_IMAGES = !args.includes('--no-images');

// ───────────────────────── Utilidades ─────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const decodeEntities = (s = '') =>
  s
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ').replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ').replace(/&uuml;/g, 'ü').replace(/&deg;/g, '°').replace(/&amp;/g, '&');

const stripBrands = (s = '') => BRAND_TERMS.reduce((acc, re) => acc.replace(re, ''), s);

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const SMALL_WORDS = new Set(['de', 'del', 'la', 'el', 'en', 'y', 'con', 'para', 'sin', 'a', 'o', 'por']);
const KEEP_UPPER = new Set(['ii', 'iii', 'iv', 'uv', 'upf', 'ansi', 'epp', 'dtf', 'xl', 'xxl', '3xl']);
const titleCase = (s) =>
  s.toLowerCase().split(/\s+/).filter(Boolean).map((w, i) => {
    if (KEEP_UPPER.has(w)) return w.toUpperCase();
    if (i > 0 && SMALL_WORDS.has(w)) return w;
    return w.replace(/(^|[-/])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
  }).join(' ');

const cleanName = (s) => titleCase(stripBrands(decodeEntities(s)).replace(/\s+/g, ' ').trim())
  .replace(/\bM\.?\s?Larga\b/gi, 'Manga Larga').replace(/\bM\.?\s?Corta\b/gi, 'Manga Corta')
  .replace(/\bHi-?vis\b/gi, 'Hi-Vis');

/** Limpia HTML de descripción: conserva p/ul/ol/li/strong/em/br, elimina atributos y marcas. */
const cleanHtml = (html = '') => {
  let s = decodeEntities(html);
  s = s.replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<(\/?)(\w+)[^>]*>/g, (m, close, tag) => {
    const t = tag.toLowerCase();
    if (t === 'b') return `<${close}strong>`;
    if (t === 'i') return `<${close}em>`;
    return ['p', 'ul', 'ol', 'li', 'strong', 'em', 'br'].includes(t) ? `<${close}${t}>` : '';
  });
  s = stripBrands(s).replace(/<p>\s*<\/p>/g, '').replace(/\s+/g, ' ').trim();
  return s;
};
const toText = (html = '') => cleanHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function fetchRetry(url, opts = {}, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
      if (res.ok) return res;
      if (res.status === 404) throw new Error('404');
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === tries || e.message === '404') throw new Error(`${url} → ${e.message}`);
      await sleep(800 * i);
    }
  }
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await worker(items[idx], idx);
      await sleep(250); // cortesía con el servidor
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  return results;
}

// ───────────────────────── Mapeo al giro Zortex ─────────────────────────
/**
 * Asigna una de las 5 categorías Zortex según nombre, categoría de origen y atributos.
 * El orden de las reglas importa: la primera coincidencia gana.
 */
function mapCategory({ name, sourceCategory, sourceCategoryName, features }) {
  const n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const c = `${sourceCategory} ${sourceCategoryName}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // 1. Ropa de Seguridad (Normada / Alta Visibilidad / Técnica)
  if (/hi-?vis|alta visibilidad|reflect|ignifug|antiestat|antiacid|arco electrico|retardante|clase [123]|vial/.test(n) || /hi-?vis/.test(c)) {
    return 'Ropa de Seguridad';
  }

  // 2. EPP (Elementos de Protección Personal física)
  if (/\b(rodiller|guante|casco|lente|antiparra|mascarilla|respirador|auditivo|fono|tapon|arnes|zapato|botin|bota|calzado|protector de rodilla)\b/.test(n)) {
    return 'EPP';
  }

  // 3. Ropa Personalizada (Poleras, polerones, jockeys, gorros, branding)
  if (/\b(polo|polera|poleron|jockey|gorro|bandana|estampad|bordad)\b/.test(n) || /poleras|polerones|gorro|jockey/.test(c)) {
    return 'Ropa Personalizada';
  }

  // 4. Ropa Corporativa (Línea ejecutiva, camisas, blusas, softshell, trajes)
  if (/\b(camisa|blusa|ejecutiv|executive|classic|softshell|veston|sweater|knit|casual slim|business)\b/.test(n) || /camisa|blusa|ejecutivo|executive|softshell|knit/.test(c)) {
    return 'Ropa Corporativa';
  }

  // 5. Ropa Industrial (Faena pesada, parkas térmicas, pantalones cargo, overoles)
  return 'Ropa Industrial';
}

/** Detecta la línea de producto (Practical, Iron, etc.) a partir del nombre. */
const LINES = ['Practical', 'Iron', 'Free Action', 'Advance', 'Hi-Vis', 'Technic', 'Classic', 'Executive', 'Outwork'];
const detectLine = (name) => LINES.find((l) => new RegExp(`\\b${l}\\b`, 'i').test(name)) || null;

// ───────────────────────── Extracción ─────────────────────────
async function collectProductUrls() {
  const byId = new Map();
  for (const cat of SOURCE_CATEGORIES) {
    try {
      const res = await fetchRetry(`${BASE}/${cat}?resultsPerPage=1000`, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      const j = await res.json();
      const html = j.rendered_products || '';
      const re = /data-id-product="(\d+)"[\s\S]*?href="(https:\/\/tworldstore\.cl\/[^"#]+\.html)/g;
      let m, n = 0;
      while ((m = re.exec(html))) {
        if (!byId.has(m[1])) byId.set(m[1], m[2].replace(/\/(\d+)-\d+-/, '/$1-')); // URL sin combinación
        n++;
      }
      console.log(`  · ${cat.padEnd(28)} ${String(n).padStart(4)} productos  (acumulado único: ${byId.size})`);
    } catch (e) {
      console.warn(`  ! ${cat}: ${e.message}`);
    }
    await sleep(300);
  }
  return [...byId.entries()].map(([id, url]) => ({ id, url }));
}

function parseVariants(html) {
  const colors = [];
  const seen = new Set();
  const reColor = /<input class="input-color"[^>]*title="([^"]+)"[^>]*>\s*<span class="color[^"]*"\s*style="background-color:\s*(#[0-9a-fA-F]{3,6})/g;
  let m;
  while ((m = reColor.exec(html))) {
    const name = titleCase(decodeEntities(m[1]).trim());
    if (!seen.has(name)) { seen.add(name); colors.push({ name, hex: m[2] }); }
  }
  const sizes = [];
  const reSize = /<tr class="altura-celda">\s*<td class="text-center">\s*([^<]+?)\s*<\/td>/g;
  while ((m = reSize.exec(html))) {
    const s = decodeEntities(m[1]).trim().toUpperCase();
    if (s && !sizes.includes(s)) sizes.push(s);
  }
  return { colors, sizes };
}

function pickImageUrl(img) {
  if (img?.bySize) for (const size of IMAGE_SIZES) if (img.bySize[size]?.url) return img.bySize[size].url;
  return img?.large?.url || img?.medium?.url || null;
}

async function scrapeProduct({ id, url }) {
  const res = await fetchRetry(url);
  const html = await res.text();
  const m = html.match(/data-product="([^"]+)"/);
  if (!m) throw new Error('sin data-product');
  const p = JSON.parse(decodeEntities(m[1]));

  // Características agrupadas: { Composición: ['100% Poliéster'], Atributos: ['Liviano', ...] }
  const featureMap = {};
  for (const f of p.features || []) {
    const k = decodeEntities(f.name).trim();
    const v = stripBrands(decodeEntities(f.value)).trim();
    if (!v) continue;
    (featureMap[k] ||= []).includes(v) || featureMap[k].push(v);
  }
  const features = Object.entries(featureMap).map(([name, values]) => ({ name, value: values.join(', ') }));

  const name = cleanName(p.name);
  const slug = `${slugify(name)}-${p.id_product}`;
  const sourceCategoryName = decodeEntities(p.category_name || '');
  const { colors, sizes } = parseVariants(html);

  return {
    id: slug,
    sourceId: Number(p.id_product),
    sku: p.reference || '',
    name,
    slug,
    category: mapCategory({ name, sourceCategory: p.category || '', sourceCategoryName, features: p.features || [] }),
    type: sourceCategoryName ? titleCase(sourceCategoryName) : '',
    line: detectLine(name),
    gender: featureMap['Género']?.[0] || null,
    summary: toText(p.description_short) || toText(p.description).slice(0, 220),
    descriptionHtml: cleanHtml(p.description),
    features,
    colors,
    sizes,
    remoteImages: (p.images || []).map(pickImageUrl).filter(Boolean).slice(0, MAX_IMAGES),
    images: [],
    image: '',
  };
}

async function downloadImages(product) {
  const dir = path.join(IMG_DIR, product.slug);
  fs.mkdirSync(dir, { recursive: true });
  const local = [];
  for (let i = 0; i < product.remoteImages.length; i++) {
    const file = path.join(dir, `${i + 1}.jpg`);
    const pub = `${IMG_PUBLIC}/${product.slug}/${i + 1}.jpg`;
    if (fs.existsSync(file) && fs.statSync(file).size > 1000) { local.push(pub); continue; }
    try {
      const res = await fetchRetry(product.remoteImages[i]);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      local.push(pub);
    } catch (e) {
      console.warn(`    ! imagen ${i + 1} de ${product.slug}: ${e.message}`);
    }
  }
  return local;
}

async function fetchColorImage(productId, colorName) {
  const colorQuery = colorName.toLowerCase().replace(/\//g, '').replace(/\s/g, '');
  const formData = new URLSearchParams();
  formData.append('color', colorQuery);
  formData.append('act', 'getUrlColorImage');
  formData.append('id_product', String(productId));

  try {
    const res = await fetch('https://tworldstore.cl/module/customproduct/geturlcolor?ajax=1', {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData.toString(),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j?.result?.color || null;
  } catch (e) {
    return null;
  }
}

async function downloadColorVariants(product) {
  if (!product.colors || product.colors.length === 0) return;
  const dir = path.join(IMG_DIR, product.slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const c of product.colors) {
    const colorSlug = slugify(c.name);
    const destFile = path.join(dir, `color-${colorSlug}.jpg`);
    const pub = `${IMG_PUBLIC}/${product.slug}/color-${colorSlug}.jpg`;

    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000) {
      c.image = pub;
      if (!product.images.includes(pub)) product.images.push(pub);
      continue;
    }

    const remoteFile = await fetchColorImage(product.sourceId, c.name);
    if (remoteFile) {
      const url = `https://tworldstore.cl/img/custom/static/${remoteFile}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': UA,
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer': 'https://tworldstore.cl/',
          },
        });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 1000) {
            fs.writeFileSync(destFile, buf);
            c.image = pub;
            if (!product.images.includes(pub)) product.images.push(pub);
          }
        }
      } catch (_) {}
    }
    await sleep(60);
  }
}

function expandProductsByColor(products) {
  const expanded = [];
  products.forEach(p => {
    if (p.colors && p.colors.length > 0) {
      p.colors.forEach((col, idx) => {
        const colImg = col.image || (p.images && p.images[idx % p.images.length]) || p.image;
        const colSlug = slugify(col.name);
        expanded.push({
          id: `${p.id}-${colSlug}`,
          baseId: p.id,
          sourceId: p.sourceId,
          name: p.name,
          displayName: `${p.name} - ${col.name}`,
          color: col.name,
          colorHex: col.hex,
          category: p.category,
          type: p.type,
          line: p.line,
          gender: p.gender,
          sku: p.sku ? `${p.sku}-${colSlug.slice(0, 3).toUpperCase()}` : '',
          image: colImg,
          images: col.image ? [col.image, ...p.images.filter(x => x !== col.image)] : p.images,
          colors: p.colors,
          sizes: p.sizes,
          features: p.features,
          summary: p.summary,
        });
      });
    } else {
      expanded.push({
        ...p,
        color: '',
        colorHex: '',
        displayName: p.name,
      });
    }
  });

  const ORDER = ['Ropa Corporativa', 'Ropa Personalizada', 'Ropa Industrial', 'Ropa de Seguridad', 'EPP'];
  expanded.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name, 'es') || (a.color || '').localeCompare(b.color || '', 'es'));
  return expanded;
}

// ───────────────────────── Main ─────────────────────────
async function main() {
  const t0 = Date.now();
  const MODELS_FILE = path.join(ROOT, 'src', 'data', 'catalog-models.json');

  if (args.includes('--only-colors')) {
    console.log('▶ Actualizando fotos de variedad en colores para productos existentes…');
    const existing = JSON.parse(fs.readFileSync(fs.existsSync(MODELS_FILE) ? MODELS_FILE : DATA_FILE, 'utf8'));
    const prods = existing.products || existing;
    let count = 0;
    await pool(prods, CONCURRENCY, async (prod, i) => {
      await downloadColorVariants(prod);
      count++;
      if (count % 10 === 0 || count === prods.length) {
        process.stdout.write(`  [${String(count).padStart(3)}/${prods.length}] Colores procesados\n`);
      }
    });

    fs.writeFileSync(MODELS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), count: prods.length, products: prods }, null, 2));
    const expanded = expandProductsByColor(prods);
    fs.writeFileSync(DATA_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), source: BASE, modelsCount: prods.length, productsCount: expanded.length, products: expanded }, null, 2));
    console.log(`  ✓ Variedad en colores actualizada: ${prods.length} modelos → ${expanded.length} productos en todos los colores (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    return;
  }

  console.log('▶ 1/3 Recolectando URLs de productos…');
  let list = await collectProductUrls();
  if (Number.isFinite(LIMIT)) list = list.slice(0, LIMIT);
  console.log(`  ✓ ${list.length} productos a procesar\n`);

  console.log('▶ 2/3 Extrayendo fichas de producto y variedad en colores…');
  const failed = [];
  const products = (await pool(list, CONCURRENCY, async (item, i) => {
    try {
      const prod = await scrapeProduct(item);
      if (DOWNLOAD_IMAGES) {
        prod.images = await downloadImages(prod);
        await downloadColorVariants(prod);
      }
      prod.image = prod.images[0] || prod.remoteImages[0] || '';
      if (!DOWNLOAD_IMAGES) prod.images = prod.remoteImages;
      process.stdout.write(`  [${String(i + 1).padStart(3)}/${list.length}] ${prod.category.padEnd(18)} ${prod.name} (${prod.colors?.length || 0} colores)\n`);
      return prod;
    } catch (e) {
      failed.push({ ...item, error: e.message });
      console.warn(`  ! ${item.url}: ${e.message}`);
      return null;
    }
  })).filter(Boolean);

  // Orden estable: por categoría Zortex y luego por nombre
  const ORDER = ['Ropa Corporativa', 'Ropa Personalizada', 'Ropa Industrial', 'Ropa de Seguridad', 'EPP'];
  products.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name, 'es'));
  products.forEach((p) => delete p.remoteImages);

  console.log('\n▶ 3/3 Guardando catálogo expandido con todos los colores…');
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(MODELS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), source: BASE, count: products.length, products }, null, 2));

  const expanded = expandProductsByColor(products);
  fs.writeFileSync(DATA_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), source: BASE, modelsCount: products.length, productsCount: expanded.length, products: expanded }, null, 2));

  const byCat = expanded.reduce((acc, p) => ((acc[p.category] = (acc[p.category] || 0) + 1), acc), {});
  console.log(`  ✓ ${products.length} modelos base → ${expanded.length} productos en todos los colores`);
  console.log(`  ✓ Archivo principal: ${path.relative(ROOT, DATA_FILE)}`);
  console.table(byCat);
  if (failed.length) {
    console.warn(`  ⚠ ${failed.length} fallidos (ver scripts/scrape-failed.json)`);
    fs.writeFileSync(path.join(ROOT, 'scripts', 'scrape-failed.json'), JSON.stringify(failed, null, 2));
  }
  console.log(`  ⏱ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => { console.error(e); process.exit(1); });
