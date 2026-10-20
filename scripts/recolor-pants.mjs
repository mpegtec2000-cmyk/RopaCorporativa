import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const COLOR_TRANSFORMS = {
  'color-negro.jpg': (lum) => {
    const v = Math.round(lum * 55 + 14);
    return [v, v, Math.min(255, v + 2)];
  },
  'color-azul.jpg': (lum) => {
    const r = Math.round(lum * 25 + 6);
    const g = Math.round(lum * 45 + 14);
    const b = Math.round(lum * 95 + 38);
    return [r, g, b];
  },
  'color-beige.jpg': (lum) => {
    const r = Math.round(lum * 90 + 145);
    const g = Math.round(lum * 85 + 130);
    const b = Math.round(lum * 75 + 105);
    return [r, g, b];
  },
  'color-khaki.jpg': (lum) => {
    const r = Math.round(lum * 88 + 140);
    const g = Math.round(lum * 82 + 125);
    const b = Math.round(lum * 70 + 98);
    return [r, g, b];
  },
  'color-gris.jpg': (lum) => {
    const v = Math.round(lum * 115 + 45);
    return [v, v + 1, v + 2];
  },
  'color-gris-oscuro.jpg': (lum) => {
    const v = Math.round(lum * 75 + 25);
    return [v, v + 1, v + 2];
  },
  'color-brown.jpg': (lum) => {
    const r = Math.round(lum * 80 + 75);
    const g = Math.round(lum * 50 + 45);
    const b = Math.round(lum * 35 + 28);
    return [r, g, b];
  },
  'color-marron-claro.jpg': (lum) => {
    const r = Math.round(lum * 95 + 115);
    const g = Math.round(lum * 70 + 75);
    const b = Math.round(lum * 50 + 50);
    return [r, g, b];
  },
  'color-gris-azulado.jpg': (lum) => {
    const r = Math.round(lum * 65 + 40);
    const g = Math.round(lum * 75 + 50);
    const b = Math.round(lum * 95 + 75);
    return [r, g, b];
  }
};

export async function processPantsDir(dir) {
  const src = path.join(dir, '1.jpg');
  if (!fs.existsSync(src)) {
    console.log('No 1.jpg found in', dir);
    return;
  }

  // Find all color-*.jpg present in this folder
  const files = fs.readdirSync(dir);
  const colorFiles = files.filter(f => f.startsWith('color-'));
  if (colorFiles.length === 0) return;

  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (const colorFile of colorFiles) {
    const transform = COLOR_TRANSFORMS[colorFile] || COLOR_TRANSFORMS['color-negro.jpg'];
    const dest = path.join(dir, colorFile);

    const out = Buffer.from(data);
    for (let i = 0; i < out.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const minVal = Math.min(r, g, b);
      if (minVal >= 252) {
        out[i] = 255;
        out[i + 1] = 255;
        out[i + 2] = 255;
        continue;
      }

      let blendWithBg = 0;
      if (minVal > 238) {
        blendWithBg = (minVal - 238) / (252 - 238);
      }

      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const [newR, newG, newB] = transform(lum, r, g, b);

      out[i] = Math.round(newR * (1 - blendWithBg) + 255 * blendWithBg);
      out[i + 1] = Math.round(newG * (1 - blendWithBg) + 255 * blendWithBg);
      out[i + 2] = Math.round(newB * (1 - blendWithBg) + 255 * blendWithBg);
    }

    await sharp(out, { raw: { width, height, channels } })
      .jpeg({ quality: 96 })
      .toFile(dest);
  }
  console.log(`Processed ${dir} (${colorFiles.length} variants updated to FRONT view)`);
}

// Find all pants directories and process them!
const catDir = 'public/images/catalogo';
const allPantsDirs = fs.readdirSync(catDir)
  .filter(d => d.includes('pantalon') || d.includes('jeans') || d.includes('cargo'))
  .map(d => path.join(catDir, d))
  .filter(d => fs.statSync(d).isDirectory());

console.log(`Found ${allPantsDirs.length} pants directories. Starting batch processing...`);
let total = 0;
for (const dir of allPantsDirs) {
  await processPantsDir(dir);
  total++;
}
console.log(`Batch complete! Processed ${total} pants directories.`);
