import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicImagesDir = path.join(rootDir, 'public', 'images');

async function optimizeFolderJpgs(folderPath, maxWidth = 800, quality = 75) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  for (const f of files) {
    const full = path.join(folderPath, f);
    const origSize = fs.statSync(full).size;
    const buf = fs.readFileSync(full);

    // WebP version
    const webpPath = full.replace(/\.jpe?g$/, '.webp');
    await sharp(buf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(webpPath);

    // Optimized JPG fallback
    const tmpJpg = full + '.tmp.jpg';
    await sharp(buf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(tmpJpg);
    fs.renameSync(tmpJpg, full);

    const newSize = fs.statSync(full).size;
    const webpSize = fs.statSync(webpPath).size;
    console.log(`[JPG/WebP] ${f}: ${(origSize/1024).toFixed(0)}KB -> JPG: ${(newSize/1024).toFixed(0)}KB | WebP: ${(webpSize/1024).toFixed(0)}KB`);
  }
}

async function optimizeFolderPngs(folderPath, maxWidth = 600) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const full = path.join(folderPath, f);
    const origSize = fs.statSync(full).size;
    const buf = fs.readFileSync(full);

    // WebP version with transparency
    const webpPath = full.replace(/\.png$/, '.webp');
    await sharp(buf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);

    // Optimized PNG fallback
    const tmpPng = full + '.tmp.png';
    await sharp(buf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9, effort: 8 })
      .toFile(tmpPng);
    fs.renameSync(tmpPng, full);

    const newSize = fs.statSync(full).size;
    const webpSize = fs.statSync(webpPath).size;
    console.log(`[PNG/WebP] ${f}: ${(origSize/1024).toFixed(0)}KB -> PNG: ${(newSize/1024).toFixed(0)}KB | WebP: ${(webpSize/1024).toFixed(0)}KB`);
  }
}

async function run() {
  console.log('=== Optimizing Industrias ===');
  await optimizeFolderJpgs(path.join(publicImagesDir, 'industrias'), 800, 75);

  console.log('\n=== Optimizing Lineas ===');
  await optimizeFolderJpgs(path.join(publicImagesDir, 'lineas'), 800, 75);

  console.log('\n=== Optimizing Cutouts ===');
  await optimizeFolderPngs(path.join(publicImagesDir, 'cutouts'), 600);

  console.log('\n=== Optimizing Fondos Nuevos ===');
  await optimizeFolderJpgs(path.join(publicImagesDir, 'fondos nuevos'), 1600, 75);

  console.log('\n=== Optimizing Root Images ===');
  await optimizeFolderPngs(publicImagesDir, 1200);

  console.log('\nALL IMAGES OPTIMIZED SUCCESSFULLY!');
}

run().catch(console.error);
