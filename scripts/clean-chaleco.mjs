import sharp from 'sharp';
import path from 'path';

async function cleanTag(srcPath, outPath) {
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Tag inner bounds: minX: 344, maxX: 378, minY: 87, maxY: 111
  const tagLeft = 343;
  const tagRight = 379;
  const tagTop = 86;
  const tagBot = 112;

  const patchW = tagRight - tagLeft + 1;
  const patchH = tagBot - tagTop + 1;
  const srcY0 = 125;
  const pad = 4;

  // Compute color vertical gradient delta between y=86 and y=125
  let topR = 0, topG = 0, topB = 0, topCount = 0;
  for (let x = tagLeft - 6; x < tagLeft; x++) {
    for (let y = tagTop; y <= tagBot; y++) {
      const idx = (y * w + x) * channels;
      topR += buf[idx]; topG += buf[idx + 1]; topB += buf[idx + 2]; topCount++;
    }
  }
  let botR = 0, botG = 0, botB = 0, botCount = 0;
  for (let x = tagLeft - 6; x < tagLeft; x++) {
    for (let y = srcY0; y < srcY0 + patchH; y++) {
      const idx = (y * w + x) * channels;
      botR += buf[idx]; botG += buf[idx + 1]; botB += buf[idx + 2]; botCount++;
    }
  }

  const dR = (topR / topCount) - (botR / botCount);
  const dG = (topG / topCount) - (botG / botCount);
  const dB = (topB / topCount) - (botB / botCount);

  for (let dy = -pad; dy < patchH + pad; dy++) {
    for (let dx = -pad; dx < patchW + pad; dx++) {
      const dstX = tagLeft + dx;
      const dstY = tagTop + dy;
      const srcX = tagLeft + dx;
      const srcY = srcY0 + (dy % 24);

      let dist = 0;
      if (dx < 0) dist = Math.max(dist, -dx);
      if (dx >= patchW) dist = Math.max(dist, dx - patchW + 1);
      if (dy < 0) dist = Math.max(dist, -dy);
      if (dy >= patchH) dist = Math.max(dist, dy - patchH + 1);

      let alpha = 1;
      if (dist > 0) {
        alpha = Math.max(0, 1 - dist / pad);
        alpha = alpha * alpha * (3 - 2 * alpha);
      }

      const dstIdx = (dstY * w + dstX) * channels;
      const srcIdx = (srcY * w + srcX) * channels;

      const pR = Math.min(255, Math.max(0, buf[srcIdx] + dR));
      const pG = Math.min(255, Math.max(0, buf[srcIdx + 1] + dG));
      const pB = Math.min(255, Math.max(0, buf[srcIdx + 2] + dB));

      for (let c = 0; c < 3; c++) {
        const target = c === 0 ? pR : (c === 1 ? pG : pB);
        buf[dstIdx + c] = Math.round(buf[dstIdx + c] * (1 - alpha) + target * alpha);
      }
    }
  }

  await sharp(buf, { raw: { width: w, height: h, channels } })
    .jpeg({ quality: 96 })
    .toFile(outPath);
  console.log('Saved clean:', outPath);
}

async function run() {
  const yellowSrc = 'public/images/catalogo/chaleco-geologo-vial-tricot-100-poliester-904/1.jpg';
  const orangeSrc = 'public/images/catalogo/chaleco-geologo-vial-tricot-100-poliester-904/color-naranjo.jpg';

  // Output for 902
  const dir902 = 'public/images/catalogo/chaleco-geologo-vial-tricot-100-poliester-902';
  await cleanTag(yellowSrc, path.join(dir902, '1.jpg'));
  await cleanTag(orangeSrc, path.join(dir902, 'color-naranjo.jpg'));

  // Output for 904
  const dir904 = 'public/images/catalogo/chaleco-geologo-vial-tricot-100-poliester-904';
  await cleanTag(yellowSrc, path.join(dir904, '1.jpg'));
  await cleanTag(orangeSrc, path.join(dir904, 'color-naranjo.jpg'));

  console.log('Finished chaleco tag cleaning!');
}

run().catch(console.error);
