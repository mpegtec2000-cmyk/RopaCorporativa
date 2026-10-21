import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicons() {
  const rootDir = path.resolve(__dirname, '..');
  const masterPath = path.join(rootDir, 'public', 'images', 'zortex-icon-master.png');
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(masterPath)) {
    throw new Error('Master icon not found: ' + masterPath);
  }

  const buf = fs.readFileSync(masterPath);

  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  for (const s of sizes) {
    const out = await sharp(buf)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    if (s === 16) fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), out);
    if (s === 32) fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), out);
    if (s === 48) fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), out);
    if (s === 96) fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), out);
    if (s === 180) fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), out);
    if (s === 192) fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), out);
    if (s === 512) fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), out);
  }

  const icoBuf = await pngToIco([
    path.join(publicDir, 'favicon-16x16.png'),
    path.join(publicDir, 'favicon-32x32.png'),
    path.join(publicDir, 'favicon-48x48.png')
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Generate SVG with master PNG embedded
  const b64 = buf.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><image href="data:image/png;base64,${b64}" width="96" height="96"/></svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

  console.log('Successfully generated complete favicon suite, favicon.ico and favicon.svg!');
}

generateFavicons().catch(console.error);
