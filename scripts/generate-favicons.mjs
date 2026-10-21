import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicons() {
  const rootDir = path.resolve(__dirname, '..');
  const svgPath = path.join(rootDir, 'public', 'favicon.svg');
  const publicDir = path.join(rootDir, 'public');

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Generate PNGs of various sizes (including Google Search required 48x48 multiples)
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    pngBuffers[size] = await sharp(svgBuffer, { density: 300 })
      .resize(size, size)
      .png()
      .toBuffer();
    console.log(`Generated ${size}x${size} PNG: ${pngBuffers[size].length} bytes`);
  }

  // Save specific files for Google Search, Apple, Android and Browsers
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), pngBuffers[16]);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngBuffers[32]);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), pngBuffers[48]); // Google Search standard
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), pngBuffers[96]); // Google Search high-res
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngBuffers[180]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), pngBuffers[192]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), pngBuffers[512]);

  // 2. Build multi-resolution ICO file (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const numImages = icoSizes.length;
  const headerSize = 6 + (numImages * 16);
  let currentOffset = headerSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type = 1
  header.writeUInt16LE(numImages, 4); // count

  const entries = [];
  const imageBuffers = [];

  for (const size of icoSizes) {
    const png = pngBuffers[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset

    entries.push(entry);
    imageBuffers.push(png);
    currentOffset += png.length;
  }

  const finalIco = Buffer.concat([header, ...entries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), finalIco);
  console.log(`Successfully generated favicon.ico: ${finalIco.length} bytes`);
}

generateFavicons().catch(console.error);
