import sharp from 'sharp';

async function run() {
  // Crop an area right above the tag (fabric texture)
  const texture = await sharp('public/images/catalogo/camisa-oxford-classic-manga-larga-hombre-55-algodon-45-polyester-790/1.jpg')
    .extract({ left: 335, top: 110, width: 35, height: 16 })
    .toBuffer();

  // Composite over the tag (located at left: 337, top: 125, width: 32, height: 14)
  await sharp('public/images/catalogo/camisa-oxford-classic-manga-larga-hombre-55-algodon-45-polyester-790/1.jpg')
    .composite([{ input: texture, left: 335, top: 124 }])
    .extract({ left: 300, top: 100, width: 100, height: 70 })
    .toFile('public/test-tag-patched.jpg');

  console.log('Saved patched tag test');
}
run();
