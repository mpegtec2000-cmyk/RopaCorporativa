import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

async function optimizeImages() {
  console.log('--- 1. Optimizing Hero Desktop Images ---');
  const desktopDir = path.join(publicDir, 'images', 'hero', 'desktop');
  const desktopFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];

  for (const f of desktopFiles) {
    const fullPath = path.join(desktopDir, f);
    if (!fs.existsSync(fullPath)) continue;
    const origSize = fs.statSync(fullPath).size;
    const buf = fs.readFileSync(fullPath);

    // Generate WebP
    const webpPath = fullPath.replace(/\.jpg$/, '.webp');
    await sharp(buf)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;

    // Overwrite optimized JPG fallback
    const tempJpg = fullPath + '.tmp.jpg';
    await sharp(buf)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 75, progressive: true, mozjpeg: true })
      .toFile(tempJpg);
    fs.renameSync(tempJpg, fullPath);
    const newJpgSize = fs.statSync(fullPath).size;

    console.log(`Desktop ${f}: ${(origSize/1024/1024).toFixed(2)} MB -> WebP: ${(webpSize/1024).toFixed(1)} KB | JPG: ${(newJpgSize/1024).toFixed(1)} KB`);
  }

  console.log('--- 2. Optimizing Hero Mobile Images ---');
  const mobileDir = path.join(publicDir, 'images', 'hero', 'mobile');
  const mobileFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];

  for (const f of mobileFiles) {
    const fullPath = path.join(mobileDir, f);
    if (!fs.existsSync(fullPath)) continue;
    const origSize = fs.statSync(fullPath).size;
    const buf = fs.readFileSync(fullPath);

    // Generate WebP
    const webpPath = fullPath.replace(/\.jpg$/, '.webp');
    await sharp(buf)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;

    // Overwrite optimized JPG fallback
    const tempJpg = fullPath + '.tmp.jpg';
    await sharp(buf)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 75, progressive: true, mozjpeg: true })
      .toFile(tempJpg);
    fs.renameSync(tempJpg, fullPath);
    const newJpgSize = fs.statSync(fullPath).size;

    console.log(`Mobile ${f}: ${(origSize/1024/1024).toFixed(2)} MB -> WebP: ${(webpSize/1024).toFixed(1)} KB | JPG: ${(newJpgSize/1024).toFixed(1)} KB`);
  }

  console.log('--- 3. Optimizing Header Logo ---');
  const logoPath = path.join(publicDir, 'images', 'zortex_logo_transparente.png');
  if (fs.existsSync(logoPath)) {
    const origSize = fs.statSync(logoPath).size;
    const buf = fs.readFileSync(logoPath);
    const tempPng = logoPath + '.tmp.png';
    await sharp(buf)
      .resize({ width: 480, withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(tempPng);
    fs.renameSync(tempPng, logoPath);
    const newSize = fs.statSync(logoPath).size;
    console.log(`Logo: ${(origSize/1024).toFixed(1)} KB -> ${(newSize/1024).toFixed(1)} KB`);
  }
}

optimizeImages().catch(console.error);
