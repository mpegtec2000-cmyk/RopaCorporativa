async function test() {
  const urls = [
    'https://tworldstore.cl/525-large_default/jockey-legionario-100-alg-certificado.jpg',
    'https://tworldstore.cl/526-large_default/jockey-legionario-100-alg-certificado.jpg',
    'https://tworldstore.cl/527-large_default/jockey-legionario-100-alg-certificado.jpg',
    'https://tworldstore.cl/529-large_default/jockey-legionario-100-alg-certificado.jpg',
  ];
  for (const u of urls) {
    const res = await fetch(u);
    console.log(u, '->', res.status, res.headers.get('content-length'));
  }
}
test();
