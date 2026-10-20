import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const productosDir = path.join(rootDir, 'public', 'images', 'productos');
const catalogoDir = path.join(rootDir, 'public', 'images', 'catalogo');

async function optimizeProductos() {
  console.log('=== 1. Optimizing productos images ===');
  const files = fs.readdirSync(productosDir);
  for (const f of files) {
    if (f.endsWith('.svg') || f.endsWith('.webp')) continue;
    const full = path.join(productosDir, f);
    const origSize = fs.statSync(full).size;
    const buf = fs.readFileSync(full);

    const isPng = f.endsWith('.png');

    // Generate WebP
    const webpPath = full.replace(/\.(png|jpe?g)$/, '.webp');
    await sharp(buf)
      .resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;

    // Overwrite original format
    if (isPng) {
      const tmpPng = full + '.tmp.png';
      await sharp(buf)
        .resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tmpPng);
      fs.renameSync(tmpPng, full);
    } else {
      const tmpJpg = full + '.tmp.jpg';
      await sharp(buf)
        .resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true, mozjpeg: true })
        .toFile(tmpJpg);
      fs.renameSync(tmpJpg, full);
    }

    const newSize = fs.statSync(full).size;
    console.log(`[PROD] ${f}: ${(origSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB | WebP: ${(webpSize/1024).toFixed(0)}KB`);
  }
}

async function optimizeCatalogo() {
  console.log('\n=== 2. Optimizing catalogo images > 200KB ===');
  function scan(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scan(full);
      } else if (stat.size > 200000 && (item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.png'))) {
        optimizeCatalogoFile(full);
      }
    }
  }

  const tasks = [];
  function scanCollect(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanCollect(full);
      } else if (stat.size > 200000 && (item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.png'))) {
        tasks.push(full);
      }
    }
  }
  scanCollect(catalogoDir);
  console.log(`Found ${tasks.length} large catalogo images to optimize.`);

  for (const full of tasks) {
    const origSize = fs.statSync(full).size;
    const buf = fs.readFileSync(full);
    const isPng = full.endsWith('.png');

    // Generate WebP
    const webpPath = full.replace(/\.(png|jpe?g)$/, '.webp');
    await sharp(buf)
      .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(webpPath);

    if (isPng) {
      const tmp = full + '.tmp.png';
      await sharp(buf)
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tmp);
      fs.renameSync(tmp, full);
    } else {
      const tmp = full + '.tmp.jpg';
      await sharp(buf)
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true, mozjpeg: true })
        .toFile(tmp);
      fs.renameSync(tmp, full);
    }
    const newSize = fs.statSync(full).size;
    console.log(`[CAT] ${path.basename(full)}: ${(origSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB`);
  }
}

async function main() {
  await optimizeProductos();
  await optimizeCatalogo();
  console.log('\nALL PRODUCT & CATALOGO IMAGES OPTIMIZED!');
}

main().catch(console.error);
