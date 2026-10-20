import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/components/FeaturedProducts.astro');
let code = fs.readFileSync(filePath, 'utf8');

const targetAnchor = '  let visibleLimit = BATCH_SIZE;';

const functionsToInsert = `  let visibleLimit = BATCH_SIZE;

  // Normalización de texto sin acentos
  function normalizeText(s: string) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Diccionario de sinónimos para el rubro corporativo, industrial y EPP en Chile
  const SYNONYMS: Record<string, string[]> = {
    calzado: ['zapato', 'botin', 'calzado', 'bota', 'dielectrico', 'puntera'],
    botin: ['botin', 'zapato', 'calzado', 'bota'],
    botines: ['botin', 'zapato', 'calzado', 'bota'],
    zapato: ['zapato', 'botin', 'calzado', 'bota'],
    zapatos: ['zapato', 'botin', 'calzado', 'bota'],
    casco: ['casco', 'barbiquejo'],
    cascos: ['casco', 'barbiquejo'],
    lente: ['lente', 'antiparra', 'uv'],
    lentes: ['lente', 'antiparra', 'uv'],
    antiparra: ['antiparra', 'lente'],
    antiparras: ['antiparra', 'lente'],
    guante: ['guante', 'cabritilla', 'nitrilo'],
    guantes: ['guante', 'cabritilla', 'nitrilo'],
    pantalon: ['pantalon', 'cargo', 'bermuda', 'jean'],
    pantalones: ['pantalon', 'cargo', 'bermuda'],
    polar: ['polar', 'fleece', 'micropolar'],
    fleece: ['polar', 'fleece'],
    termico: ['termico', 'softshell', 'parka', 'polar', 'abrigo'],
    termica: ['termica', 'termico', 'softshell', 'parka', 'polar'],
    geologo: ['geologo', 'chaleco'],
    chaleco: ['chaleco', 'geologo'],
    ignifugo: ['ignifugo', 'retardante', 'arco'],
    ignifuga: ['ignifuga', 'ignifugo', 'retardante', 'arco'],
    overol: ['overol', 'buzo'],
    buzo: ['buzo', 'overol'],
    polera: ['polera', 'polo', 'pique'],
    poleras: ['polera', 'polo', 'pique'],
    polo: ['polo', 'polera'],
    camisa: ['camisa', 'oxford', 'poplin'],
    camisas: ['camisa', 'oxford', 'poplin'],
    blusa: ['blusa', 'oxford'],
    blusas: ['blusa', 'oxford'],
    epp: ['epp', 'casco', 'lente', 'guante', 'zapato', 'botin', 'auditivo', 'fono', 'rodillera'],
    // Búsquedas directas por color
    marino: ['azul marino', 'marino', 'navy'],
    azul: ['azul', 'marino', 'celeste', 'azulino'],
    negro: ['negro', 'black'],
    blanco: ['blanco', 'white'],
    rojo: ['rojo', 'red'],
    amarillo: ['amarillo', 'fluor'],
    fluor: ['amarillo fluor', 'naranjo fluor', 'fluor'],
    gris: ['gris', 'grey'],
    verde: ['verde', 'green', 'verde pino'],
    burdeo: ['burdeo', 'bordeaux'],
    naranjo: ['naranjo', 'orange', 'naranjo fluor'],
  };

  function matchesQuery(query: string, text: string) {
    if (!query) return true;
    if (text.includes(query)) return true;
    const syns = SYNONYMS[query];
    if (syns) {
      for (const syn of syns) {
        if (text.includes(syn)) return true;
      }
    }
    return false;
  }

  function updateVisibility() {
    let matchedCards: HTMLElement[] = [];

    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardName = card.getAttribute('data-name') || '';
      const cardColor = card.getAttribute('data-color') || '';
      const cardSku = card.getAttribute('data-sku') || '';
      const cardSummary = card.getAttribute('data-summary') || '';
      const cardColors = card.getAttribute('data-colors') || '';

      const targetText = normalizeText(\`\${cardName} \${cardColor} \${cardSku} \${cardCategory} \${cardSummary} \${cardColors}\`);

      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = matchesQuery(searchTerm, targetText);

      if (matchesCategory && matchesSearch) {
        matchedCards.push(card);
      } else {
        card.style.display = 'none';
      }
    });

    const limit = searchTerm ? matchedCards.length : visibleLimit;

    matchedCards.forEach((card, index) => {
      if (index < limit) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    if (noProductsMsg) {
      noProductsMsg.style.display = matchedCards.length === 0 ? 'block' : 'none';
    }

    // Control botón "Cargar más"
    if (loadMoreWrap && loadMoreStatus && loadMoreBtn) {
      if (searchTerm || matchedCards.length <= limit) {
        loadMoreWrap.style.display = 'none';
      } else {
        loadMoreWrap.style.display = 'flex';
        const currentShown = Math.min(limit, matchedCards.length);
        loadMoreStatus.textContent = \`Mostrando \${currentShown} de \${matchedCards.length} productos\`;
      }
    }
  }

  // Filtrado por pestaña
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-filter') || 'all';
      visibleLimit = BATCH_SIZE;
      updateVisibility();
    });
  });

  // Filtrado por búsqueda en vivo
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchTerm = normalizeText(this.value || '');
      if (searchClearBtn) {
        searchClearBtn.style.display = searchTerm ? 'inline-flex' : 'none';
      }
      visibleLimit = BATCH_SIZE;
      updateVisibility();
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      searchClearBtn.style.display = 'none';
      visibleLimit = BATCH_SIZE;
      updateVisibility();
      searchInput.focus();
    });
  }

  if (resetFilterBtn && searchInput) {
    resetFilterBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      tabs.forEach(t => t.classList.remove('active'));
      tabs[0]?.classList.add('active');
      activeCategory = 'all';
      visibleLimit = BATCH_SIZE;
      updateVisibility();
    });
  }

  // Botón cargar más
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += BATCH_SIZE;
      updateVisibility();
    });
  }

  // Swatches interactivos en tarjetas de productos
  document.querySelectorAll('.card-swatch-dot').forEach((dot) => {
    function activateSwatch(e: Event) {
      e.stopPropagation();
      const parentCard = dot.closest('.product-card');
      if (!parentCard) return;
      const img = parentCard.querySelector('.product-img') as HTMLImageElement;
      const targetSrc = dot.getAttribute('data-color-img');
      const colorName = dot.getAttribute('data-color-name');
      if (img && targetSrc) {
        img.src = targetSrc;
      }
      parentCard.querySelectorAll('.card-swatch-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (colorName) {
        parentCard.setAttribute('data-selected-color', colorName);
        const tag = parentCard.querySelector('.product-color-pill-tag');
        if (tag) {
          const dotInd = tag.querySelector('.color-dot-indicator') as HTMLElement;
          if (dotInd) dotInd.style.backgroundColor = (dot as HTMLElement).style.backgroundColor;
          tag.innerHTML = '';
          if (dotInd) tag.appendChild(dotInd);
          tag.appendChild(document.createTextNode(' ' + colorName));
        }
      }
    }

    dot.addEventListener('mouseenter', activateSwatch);
    dot.addEventListener('click', activateSwatch);
  });`;

if (!code.includes(targetAnchor)) {
  console.error('Target anchor not found!');
  process.exit(1);
}

code = code.replace(targetAnchor, functionsToInsert);
fs.writeFileSync(filePath, code, 'utf8');
console.log('¡updateVisibility y filtros restaurados con éxito!');
