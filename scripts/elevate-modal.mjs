import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/components/FeaturedProducts.astro');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Reemplazo del markup HTML del modal:
// Buscamos desde "<!-- Modal Interactivo" hasta "</section>"
const modalMarkupOldRegex = /<!-- Modal Interactivo: Ficha Técnica Rápida[\s\S]*?<\/section>/;

const newModalMarkup = `  </div>

  <!-- Catálogo ligero para scripts cliente -->
  <script id="catalog-products-json" type="application/json" set:html={JSON.stringify(modalCatalog)}></script>
</section>

<!-- ================================================================= -->
<!-- MODAL DE FICHA TÉCNICA ULTRA-INMERSIVA (PORTAL AL BODY VIEWPORT)  -->
<!-- ================================================================= -->
<div id="product-modal" class="pmodal" role="dialog" aria-modal="true" aria-hidden="true" style="display: none;">
  <div class="pmodal-backdrop" id="pmodal-backdrop"></div>
  <div class="pmodal-dialog" id="pmodal-dialog">
    <!-- Botón de Cerrar Flotante de Lujo -->
    <button type="button" class="pmodal-close" id="pmodal-close" aria-label="Cerrar ficha">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <div class="pmodal-grid">
      <!-- ─────── COLUMNA IZQUIERDA: STUDIO FOTOGRÁFICO INTERACTIVO ─────── -->
      <div class="pmodal-gallery">
        <div class="pmodal-stage-wrapper">
          <div class="pmodal-main-img-wrap" id="pmodal-main-img-wrap" title="Pasa el cursor para inspeccionar textura del tejido en Zoom HD">
            <!-- Badges flotantes en la imagen -->
            <div class="pmodal-stage-topbar">
              <span class="pmodal-stage-pill">
                <span class="stage-dot-live"></span>
                <span>Foto de Estudio Real</span>
              </span>
              <span class="pmodal-zoom-hint" id="pmodal-zoom-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <span>Zoom HD</span>
              </span>
            </div>

            <!-- Imagen Principal -->
            <img id="pmodal-main-img" src="" alt="" width="560" height="560" />

            <!-- Pill flotante del color actual sobre la foto -->
            <div class="pmodal-stage-color-tag" id="pmodal-stage-color-tag">
              <span class="pmodal-stage-color-dot" id="pmodal-stage-color-dot"></span>
              <span id="pmodal-stage-color-name">Color</span>
            </div>
          </div>
        </div>

        <!-- Miniaturas de Ángulos / Galería -->
        <div class="pmodal-thumbs-box">
          <span class="pmodal-section-mini-title">Vistas y ángulos disponibles:</span>
          <div class="pmodal-thumbs" id="pmodal-thumbs"></div>
        </div>

        <!-- Garantías Corporativas en la columna de imagen -->
        <div class="pmodal-trust-cards">
          <div class="pmodal-trust-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1082C0" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <strong>Calidad Corporativa</strong>
              <span>Confección de alta resistencia al uso intensivo</span>
            </div>
          </div>
          <div class="pmodal-trust-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1082C0" stroke-width="2.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <div>
              <strong>Personalización Disponible</strong>
              <span>Bordado computarizado o DTF con tu logo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─────── COLUMNA DERECHA: INFORMACIÓN, SELECTOR DE COLOR Y COTIZADOR ─────── -->
      <div class="pmodal-details">
        <!-- Badges Superiores -->
        <div class="pmodal-badges">
          <span class="pmodal-cat-badge" id="pmodal-cat">Ropa Corporativa</span>
          <button type="button" class="pmodal-sku-badge" id="pmodal-sku" title="Clic para copiar SKU">
            <span id="pmodal-sku-text">SKU: --</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <span class="pmodal-stock-badge">
            <span class="stock-pulse"></span>
            <span>Venta por Mayor</span>
          </span>
          <span class="pmodal-extra-badge" id="pmodal-extra"></span>
        </div>

        <!-- Título y Resumen -->
        <h2 class="pmodal-title" id="pmodal-title">Nombre del Producto</h2>
        <p class="pmodal-summary" id="pmodal-summary">Descripción técnica del producto.</p>

        <!-- ─────── HUB PROFESIONAL DE COLOR ─────── -->
        <div class="pmodal-color-hub" id="pmodal-colors-field">
          <div class="pmodal-color-hub-header">
            <div class="pmodal-color-title-group">
              <span class="pmodal-hub-label">Gama y Selección de Color:</span>
              <span class="pmodal-hub-sub">Toca un cuadro para ver la prenda en ese color y cotizarla</span>
            </div>
            <div class="pmodal-color-current-tag">
              <span class="pmodal-active-swatch-dot" id="pmodal-header-color-dot"></span>
              <span class="pmodal-active-color-text" id="pmodal-selected-color-name">Selecciona un color</span>
            </div>
          </div>

          <!-- Cuadros / Tarjetas de selección de color profesionales -->
          <div class="pmodal-color-grid" id="pmodal-colors"></div>
        </div>

        <!-- ─────── SELECTOR DE TALLA ─────── -->
        <div class="pmodal-field" id="pmodal-sizes-field">
          <div class="pmodal-sizes-header">
            <span class="pmodal-field-title">Talla para cotizar:</span>
            <span class="pmodal-size-selected-tag">Seleccionada: <strong id="pmodal-current-size-label">M</strong></span>
          </div>
          <div class="pmodal-sizes-list" id="pmodal-sizes"></div>
        </div>

        <!-- ─────── FICHA TÉCNICA ─────── -->
        <div class="pmodal-field" id="pmodal-specs-field">
          <span class="pmodal-field-title">Ficha Técnica y Materialidad:</span>
          <div class="pmodal-specs-grid" id="pmodal-specs"></div>
        </div>

        <!-- ─────── CHECKOUT Y COTIZACIÓN ─────── -->
        <div class="pmodal-checkout-card">
          <div class="pmodal-qty-wrapper">
            <span class="pmodal-qty-label">Cantidad a cotizar:</span>
            <div class="pmodal-qty-stepper">
              <button type="button" class="stepper-btn" id="pmodal-qty-minus" aria-label="Restar 5 unidades">−5</button>
              <input type="number" id="pmodal-qty-input" min="1" max="9999" value="10" />
              <button type="button" class="stepper-btn" id="pmodal-qty-plus" aria-label="Sumar 5 unidades">+5</button>
            </div>
            <div class="pmodal-qty-presets">
              <button type="button" class="qty-preset-btn" data-qty="10">10 u.</button>
              <button type="button" class="qty-preset-btn" data-qty="25">25 u.</button>
              <button type="button" class="qty-preset-btn" data-qty="50">50 u.</button>
              <button type="button" class="qty-preset-btn" data-qty="100">100 u.</button>
            </div>
          </div>

          <div class="pmodal-actions-row">
            <button type="button" class="pmodal-btn-add" id="pmodal-add-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span id="pmodal-add-btn-text">Agregar a Cotización</span>
            </button>

            <a id="pmodal-wa-btn" href="#" target="_blank" rel="noopener noreferrer" class="pmodal-btn-wa" title="Consultar por WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>

          <div id="pmodal-toast" class="pmodal-toast" style="display: none;">
            <div class="pmodal-toast-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span id="pmodal-toast-msg">¡Producto agregado al cotizador con el color seleccionado!</span>
            </div>
            <button type="button" id="pmodal-go-quote-btn" class="pmodal-toast-link">Ir al formulario de cotización →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

if (!modalMarkupOldRegex.test(code)) {
  console.error('No se pudo encontrar el bloque antiguo del modal HTML');
  process.exit(1);
}
code = code.replace(modalMarkupOldRegex, newModalMarkup);

// 2. Reemplazo del CSS del modal:
// Buscamos desde "/* ───────────────────────── Modal de Ficha Técnica" hasta "</style>"
const modalCssOldRegex = /\/\* ───────────────────────── Modal de Ficha Técnica ───────────────────────── \*\/[\s\S]*?<\/style>/;

const newModalCss = `/* ───────────────────────── Modal de Ficha Técnica Ultra-Inmersiva ───────────────────────── */
  .pmodal {
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    z-index: 9999999 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(14px, 3vw, 36px);
    box-sizing: border-box;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s;
  }

  .pmodal.is-open {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  .pmodal-backdrop {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(10, 18, 30, 0.78);
    backdrop-filter: blur(14px) saturate(190%);
    -webkit-backdrop-filter: blur(14px) saturate(190%);
    transition: opacity 0.28s ease;
  }

  .pmodal-dialog {
    position: relative;
    z-index: 2;
    margin: auto; /* Mathematically always centered in viewport */
    background: #FFFFFF;
    width: 100%;
    max-width: 1040px;
    max-height: min(92vh, 920px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 24px;
    box-shadow: 0 30px 90px -15px rgba(10, 20, 35, 0.5), 0 0 0 1px rgba(16, 130, 192, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.85);
    padding: clamp(20px, 3.5vw, 36px);
    box-sizing: border-box;
    transform: scale(0.95) translateY(18px);
    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease;
    opacity: 0;
  }

  .pmodal.is-open .pmodal-dialog {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  /* Custom luxury scrollbar for dialog */
  .pmodal-dialog::-webkit-scrollbar {
    width: 6px;
  }
  .pmodal-dialog::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 8px;
  }
  .pmodal-dialog::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 8px;
  }
  .pmodal-dialog::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }

  .pmodal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #475569;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .pmodal-close:hover {
    background: #1082C0;
    border-color: #1082C0;
    color: #FFFFFF;
    transform: rotate(90deg) scale(1.08);
    box-shadow: 0 4px 12px rgba(16, 130, 192, 0.35);
  }

  .pmodal-grid {
    display: grid;
    grid-template-columns: 430px 1fr;
    gap: 36px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .pmodal-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .pmodal-dialog {
      padding: 20px;
      max-height: 94vh;
      border-radius: 20px;
    }
  }

  /* Studio Stage (Left Column) */
  .pmodal-gallery {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .pmodal-stage-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 35%, #FFFFFF 0%, #F8FAFC 70%, #EDF2F7 100%);
    border: 1.5px solid #E2E8F0;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02), 0 8px 24px -6px rgba(16, 130, 192, 0.08);
  }

  .pmodal-main-img-wrap {
    position: relative;
    width: 100%;
    height: 390px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: crosshair;
  }

  .pmodal-main-img-wrap img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.18s ease-out, opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center center;
    user-select: none;
    -webkit-user-drag: none;
  }

  .pmodal-main-img-wrap img.switching {
    opacity: 0.25;
    transform: scale(0.96);
  }

  .pmodal-stage-topbar {
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
    z-index: 3;
  }

  .pmodal-stage-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(226, 232, 240, 0.85);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    color: #1E293B;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .stage-dot-live {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #1082C0;
    box-shadow: 0 0 0 3px rgba(16, 130, 192, 0.25);
    animation: livePulse 2s infinite;
  }

  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }

  .pmodal-zoom-hint {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(15, 23, 42, 0.78);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .pmodal-stage-color-tag {
    position: absolute;
    bottom: 14px;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(226, 232, 240, 0.9);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
    color: #0F172A;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    pointer-events: none;
    z-index: 3;
    transition: all 0.2s ease;
  }

  .pmodal-stage-color-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.18);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .pmodal-thumbs-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pmodal-section-mini-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #64748B;
  }

  .pmodal-thumbs {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
  }

  .pmodal-thumbs::-webkit-scrollbar {
    height: 4px;
  }
  .pmodal-thumbs::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }

  .pmodal-thumb {
    width: 62px;
    height: 62px;
    border: 2px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    padding: 4px;
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;
  }

  .pmodal-thumb img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .pmodal-thumb:hover {
    border-color: #97B4DE;
    transform: translateY(-2px);
  }

  .pmodal-thumb.active {
    border-color: #1082C0;
    box-shadow: 0 0 0 2.5px rgba(16, 130, 192, 0.25), 0 4px 10px rgba(16, 130, 192, 0.15);
    transform: translateY(-2px);
  }

  .pmodal-trust-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding-top: 6px;
  }

  .pmodal-trust-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 10px 12px;
    border-radius: 12px;
    box-sizing: border-box;
  }

  .pmodal-trust-item strong {
    display: block;
    font-size: 11.5px;
    font-weight: 800;
    color: #1E293B;
    line-height: 1.25;
  }

  .pmodal-trust-item span {
    display: block;
    font-size: 10.5px;
    color: #64748B;
    line-height: 1.3;
    margin-top: 2px;
  }

  /* Details Column (Right) */
  .pmodal-details {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .pmodal-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pmodal-cat-badge {
    background: linear-gradient(135deg, #F0F7FD 0%, #E0EFFE 100%);
    color: #0369A1;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 12px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    border: 1px solid #BAE6FD;
  }

  .pmodal-sku-badge {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    color: #475569;
    font-size: 11.5px;
    font-family: monospace;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pmodal-sku-badge:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
    color: #0F172A;
  }

  .pmodal-stock-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #065F46;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 20px;
    letter-spacing: 0.3px;
  }

  .stock-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 0 2.5px rgba(16, 185, 129, 0.3);
  }

  .pmodal-extra-badge {
    font-size: 12px;
    color: #64748B;
    font-weight: 700;
  }

  .pmodal-title {
    font-size: clamp(22px, 2.5vw, 28px);
    font-weight: 850;
    color: #0F172A;
    margin: 0;
    line-height: 1.25;
    letter-spacing: -0.025em;
    font-family: var(--display, system-ui);
  }

  .pmodal-summary {
    color: #475569;
    font-size: 14.5px;
    line-height: 1.65;
    margin: 0;
  }

  /* ─────── COLOR HUB PROFESIONAL ─────── */
  .pmodal-color-hub {
    background: #FAFCFE;
    border: 1.5px solid #E2E8F0;
    border-radius: 16px;
    padding: 16px;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
  }

  .pmodal-color-hub:hover {
    border-color: #CBD5E1;
  }

  .pmodal-color-hub-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .pmodal-color-title-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .pmodal-hub-label {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #0F172A;
  }

  .pmodal-hub-sub {
    font-size: 11.5px;
    color: #64748B;
  }

  .pmodal-color-current-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #FFFFFF;
    border: 1.5px solid #1082C0;
    padding: 4px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(16, 130, 192, 0.12);
  }

  .pmodal-active-swatch-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.18);
  }

  .pmodal-active-color-text {
    font-size: 12px;
    font-weight: 800;
    color: #1082C0;
  }

  /* Grid de Cuadros Profesionales de Color */
  .pmodal-color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
    max-height: 190px;
    overflow-y: auto;
    padding: 2px;
  }

  .pmodal-color-grid::-webkit-scrollbar {
    width: 5px;
  }
  .pmodal-color-grid::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }

  .pmodal-color-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    cursor: pointer;
    box-sizing: border-box;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    outline: none;
  }

  .pmodal-color-card:hover {
    border-color: #1082C0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 130, 192, 0.12);
  }

  .pmodal-color-card.active {
    background: linear-gradient(135deg, #F0F7FD 0%, #FFFFFF 100%);
    border-color: #1082C0;
    box-shadow: 0 0 0 1.5px #1082C0, 0 4px 14px rgba(16, 130, 192, 0.2);
    transform: translateY(-1px);
  }

  .pmodal-swatch-disc {
    position: relative;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid rgba(0, 0, 0, 0.12);
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.25), 0 2px 5px rgba(0,0,0,0.15);
  }

  .swatch-check-icon {
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pmodal-color-card.active .swatch-check-icon {
    opacity: 1;
    transform: scale(1);
  }

  .pmodal-color-card-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .pmodal-color-card-title {
    font-size: 12px;
    font-weight: 800;
    color: #1E293B;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pmodal-color-card-badge {
    font-size: 9.5px;
    color: #94A3B8;
    font-weight: 700;
    margin-top: 1px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .pmodal-color-card.active .pmodal-color-card-badge {
    color: #1082C0;
  }

  /* Tallas */
  .pmodal-field {
    border-top: 1px solid #F1F5F9;
    padding-top: 14px;
  }

  .pmodal-sizes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .pmodal-field-title {
    font-size: 12px;
    font-weight: 800;
    color: #0F172A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pmodal-size-selected-tag {
    font-size: 12px;
    color: #475569;
  }

  .pmodal-size-selected-tag strong {
    color: #1082C0;
    font-weight: 800;
  }

  .pmodal-sizes-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pmodal-size-pill {
    padding: 8px 16px;
    background: #F8FAFC;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 700;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pmodal-size-pill:hover {
    border-color: #1082C0;
    color: #1082C0;
    transform: translateY(-1px);
  }

  .pmodal-size-pill.selected {
    background: #1082C0;
    color: #FFFFFF;
    border-color: #1082C0;
    box-shadow: 0 4px 12px rgba(16, 130, 192, 0.3);
    transform: translateY(-1px);
  }

  /* Especificaciones Grid */
  .pmodal-specs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 12px;
    margin-top: 8px;
  }

  @media (max-width: 500px) {
    .pmodal-specs-grid {
      grid-template-columns: 1fr;
    }
  }

  .pmodal-spec-row {
    font-size: 12px;
    background: #F8FAFC;
    border: 1px solid #EDF2F7;
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .pmodal-spec-row .spec-k {
    color: #64748B;
    font-weight: 600;
  }

  .pmodal-spec-row .spec-v {
    color: #0F172A;
    font-weight: 800;
    text-align: right;
  }

  /* Checkout Card */
  .pmodal-checkout-card {
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 18px;
    padding: 18px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.06);
    margin-top: 4px;
  }

  .pmodal-qty-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pmodal-qty-label {
    font-size: 12.5px;
    font-weight: 800;
    color: #1E293B;
  }

  .pmodal-qty-stepper {
    display: inline-flex;
    align-items: center;
    background: #F8FAFC;
    border: 1.5px solid #CBD5E1;
    border-radius: 10px;
    overflow: hidden;
  }

  .stepper-btn {
    background: none;
    border: none;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 800;
    color: #334155;
    cursor: pointer;
    transition: background 0.15s;
  }

  .stepper-btn:hover {
    background: #E2E8F0;
    color: #0F172A;
  }

  .pmodal-qty-stepper input {
    width: 60px;
    border: none;
    background: transparent;
    font-size: 15px;
    font-weight: 800;
    text-align: center;
    color: #0F172A;
    outline: none;
    padding: 6px 0;
  }

  .pmodal-qty-presets {
    display: flex;
    gap: 6px;
  }

  .qty-preset-btn {
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
  }

  .qty-preset-btn:hover {
    background: #1082C0;
    border-color: #1082C0;
    color: #FFFFFF;
  }

  .pmodal-actions-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .pmodal-btn-add {
    flex: 1.5;
    min-width: 200px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 22px;
    background: linear-gradient(135deg, #1082C0 0%, #0369A1 100%);
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    font-size: 14.5px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 6px 20px -4px rgba(16, 130, 192, 0.4);
  }

  .pmodal-btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px -4px rgba(16, 130, 192, 0.5);
  }

  .pmodal-btn-add.success {
    background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
    box-shadow: 0 6px 20px -4px rgba(22, 163, 74, 0.45);
  }

  .pmodal-btn-wa {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #25D366 0%, #1EBE5D 100%);
    color: #FFFFFF;
    border-radius: 12px;
    font-size: 14.5px;
    font-weight: 800;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 6px 20px -4px rgba(37, 211, 102, 0.35);
  }

  .pmodal-btn-wa:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px -4px rgba(37, 211, 102, 0.45);
  }

  .pmodal-toast {
    background: #ECFDF5;
    border: 1.5px solid #6EE7B7;
    color: #065F46;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 16px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    animation: toastSlide 0.25s ease-out;
  }

  @keyframes toastSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pmodal-toast-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pmodal-toast-link {
    background: none;
    border: none;
    color: #059669;
    font-weight: 800;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: 13px;
  }

  .pmodal-toast-link:hover {
    color: #047857;
  }
</style>`;

if (!modalCssOldRegex.test(code)) {
  console.error('No se pudo encontrar el bloque antiguo del CSS modal');
  process.exit(1);
}
code = code.replace(modalCssOldRegex, newModalCss);

// 3. Reemplazo del script JS del modal:
// Buscamos desde "// Modal elements" hasta antes de "// Botón "+ Cotizar" en tarjeta con el color activo"
const modalJsOldRegex = /\/\/ Modal elements[\s\S]*?\/\/ Botón "\+ Cotizar" en tarjeta con el color activo/;

const newModalJs = `// Modal elements & Portal Setup
  const modalEl = document.getElementById('product-modal');
  const modalBackdrop = document.getElementById('pmodal-backdrop');
  const modalDialog = document.getElementById('pmodal-dialog');
  const modalClose = document.getElementById('pmodal-close');
  const mainImgWrap = document.getElementById('pmodal-main-img-wrap');
  const mainImg = document.getElementById('pmodal-main-img') as HTMLImageElement;
  const stageColorDot = document.getElementById('pmodal-stage-color-dot');
  const stageColorName = document.getElementById('pmodal-stage-color-name');
  const thumbsContainer = document.getElementById('pmodal-thumbs');
  const catBadge = document.getElementById('pmodal-cat');
  const skuBadge = document.getElementById('pmodal-sku');
  const skuText = document.getElementById('pmodal-sku-text');
  const extraBadge = document.getElementById('pmodal-extra');
  const titleEl = document.getElementById('pmodal-title');
  const summaryEl = document.getElementById('pmodal-summary');
  const colorsField = document.getElementById('pmodal-colors-field');
  const colorsContainer = document.getElementById('pmodal-colors');
  const selectedColorNameEl = document.getElementById('pmodal-selected-color-name');
  const headerColorDot = document.getElementById('pmodal-header-color-dot');
  const sizesField = document.getElementById('pmodal-sizes-field');
  const sizesContainer = document.getElementById('pmodal-sizes');
  const currentSizeLabel = document.getElementById('pmodal-current-size-label');
  const specsField = document.getElementById('pmodal-specs-field');
  const specsContainer = document.getElementById('pmodal-specs');
  const qtyInput = document.getElementById('pmodal-qty-input') as HTMLInputElement;
  const qtyMinusBtn = document.getElementById('pmodal-qty-minus');
  const qtyPlusBtn = document.getElementById('pmodal-qty-plus');
  const qtyPresetBtns = document.querySelectorAll('.qty-preset-btn');
  const addBtn = document.getElementById('pmodal-add-btn') as HTMLButtonElement;
  const addBtnText = document.getElementById('pmodal-add-btn-text');
  const waBtn = document.getElementById('pmodal-wa-btn') as HTMLAnchorElement;
  const toastEl = document.getElementById('pmodal-toast');
  const goQuoteBtn = document.getElementById('pmodal-go-quote-btn');

  // TELEPORT: Asegurar que el modal esté directamente en <body>
  // para que nunca se bugee o herede transforms de secciones superiores
  if (modalEl && modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  // Parse lightweight catalog JSON
  const catalogEl = document.getElementById('catalog-products-json');
  const catalogData: any[] = catalogEl ? JSON.parse(catalogEl.textContent || '[]') : [];
  const catalogMap = new Map<string, any>(catalogData.map(p => [p.id, p]));

  let activeCategory = 'all';
  let searchTerm = '';
  const BATCH_SIZE = 36; // 6 filas de 6 productos
  let visibleLimit = BATCH_SIZE;

  // Zoom interactivo en imagen de estudio
  if (mainImgWrap && mainImg) {
    mainImgWrap.addEventListener('mousemove', (e) => {
      const rect = mainImgWrap.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = \`\${x}% \${y}%\`;
      mainImg.style.transform = 'scale(1.55)';
    });

    mainImgWrap.addEventListener('mouseleave', () => {
      mainImg.style.transformOrigin = 'center center';
      mainImg.style.transform = 'scale(1)';
    });
  }

  // Copiar SKU al portapapeles
  if (skuBadge && skuText) {
    skuBadge.addEventListener('click', () => {
      const txt = skuText.textContent?.replace('SKU: ', '').trim() || '';
      if (txt && txt !== '--') {
        navigator.clipboard.writeText(txt).then(() => {
          const original = skuText.textContent;
          skuText.textContent = '✓ Copiado';
          setTimeout(() => { skuText.textContent = original; }, 1500);
        }).catch(() => {});
      }
    });
  }

  // Controles de cantidad (Stepper y presets)
  if (qtyMinusBtn && qtyInput) {
    qtyMinusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 10;
      val = Math.max(1, val - 5);
      qtyInput.value = String(val);
      updateWaUrl();
    });
  }
  if (qtyPlusBtn && qtyInput) {
    qtyPlusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 10;
      val = Math.min(9999, val + 5);
      qtyInput.value = String(val);
      updateWaUrl();
    });
  }
  qtyPresetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-qty');
      if (q && qtyInput) {
        qtyInput.value = q;
        updateWaUrl();
      }
    });
  });
  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      updateWaUrl();
    });
  }

  // ───────────────────────── Modal de Ficha Técnica ─────────────────────────
  let currentModalProduct: any = null;
  let selectedModalSize = 'M';
  let selectedModalColor = '';

  function isLightColorHex(hex: string) {
    if (!hex) return false;
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return false;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 185;
  }

  function updateWaUrl() {
    if (!waBtn || !currentModalProduct) return;
    const qty = qtyInput ? (parseInt(qtyInput.value) || 10) : 10;
    const colorTxt = selectedModalColor ? \` (Color: \${selectedModalColor})\` : '';
    const sizeTxt = selectedModalSize ? \` (Talla: \${selectedModalSize})\` : '';
    const waText = encodeURIComponent(\`Hola Zortex, quisiera cotizar \${qty} unidades de "\${currentModalProduct.name}"\${colorTxt}\${sizeTxt} (SKU: \${currentModalProduct.sku || 'N/A'}).\`);
    waBtn.href = \`https://wa.me/\${whatsappNumber}?text=\${waText}\`;
  }

  function switchMainImage(newSrc: string) {
    if (!mainImg || !newSrc) return;
    if (mainImg.src === newSrc) return;
    mainImg.classList.add('switching');
    setTimeout(() => {
      mainImg.src = newSrc;
      mainImg.onload = () => {
        mainImg.classList.remove('switching');
      };
      setTimeout(() => mainImg.classList.remove('switching'), 200);
    }, 120);
  }

  function openModal(id: string, initialColor?: string) {
    const prod = catalogMap.get(id);
    if (!prod || !modalEl) return;
    currentModalProduct = prod;

    // Miniaturas iniciales
    const imgs = prod.images && prod.images.length > 0 ? [...prod.images] : [prod.image];

    // Colores
    selectedModalColor = initialColor || prod.color || (prod.colors && prod.colors[0] ? prod.colors[0].name : '');

    // Buscar si el color inicial tiene imagen propia
    let initialImg = prod.image;
    let initialHex = prod.colorHex || '#CBD5E0';
    if (selectedModalColor && prod.colors) {
      const matchCol = prod.colors.find((c: any) => c.name === selectedModalColor);
      if (matchCol) {
        if (matchCol.image) initialImg = matchCol.image;
        if (matchCol.hex) initialHex = matchCol.hex;
      }
    }

    if (mainImg) {
      mainImg.src = initialImg;
      mainImg.alt = prod.name;
    }

    // Actualizar tags flotantes de color
    if (stageColorName) stageColorName.textContent = selectedModalColor || 'Color Único';
    if (stageColorDot) stageColorDot.style.backgroundColor = initialHex;
    if (headerColorDot) headerColorDot.style.backgroundColor = initialHex;
    if (selectedColorNameEl) selectedColorNameEl.textContent = selectedModalColor || 'Color Estándar';

    // Galería de miniaturas
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      imgs.slice(0, 6).forEach((imgUrl: string, idx: number) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = \`pmodal-thumb\${imgUrl === initialImg ? ' active' : ''}\`;
        thumb.innerHTML = \`<img src="\${imgUrl}" alt="\${prod.name} vista \${idx + 1}" width="54" height="54" />\`;
        thumb.addEventListener('click', () => {
          thumbsContainer.querySelectorAll('.pmodal-thumb').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          switchMainImage(imgUrl);
        });
        thumbsContainer.appendChild(thumb);
      });
    }

    if (catBadge) catBadge.textContent = prod.category;
    if (skuText) skuText.textContent = prod.sku ? \`SKU: \${prod.sku}\` : 'SKU: N/A';
    if (extraBadge) extraBadge.textContent = [prod.line, prod.gender].filter(Boolean).join(' • ');

    if (titleEl) titleEl.textContent = prod.name;
    if (summaryEl) summaryEl.textContent = prod.summary || 'Vestuario y equipamiento técnico confeccionado bajo estrictos estándares corporativos e industriales, ideal para alta durabilidad y presentación institucional.';

    // Renderizado de variedad en cuadros profesionales de color
    if (colorsField && colorsContainer) {
      colorsContainer.innerHTML = '';
      if (prod.colors && prod.colors.length > 0) {
        colorsField.style.display = 'block';

        prod.colors.forEach((c: { name: string; hex: string; image?: string }) => {
          const card = document.createElement('button');
          card.type = 'button';
          const isSelected = c.name === selectedModalColor;
          card.className = \`pmodal-color-card\${isSelected ? ' active' : ''}\`;
          card.setAttribute('data-color-name', c.name);
          card.setAttribute('aria-label', \`Seleccionar color \${c.name}\`);

          const isLight = isLightColorHex(c.hex);
          const checkStroke = isLight ? '#0F172A' : '#FFFFFF';

          card.innerHTML = \`
            <span class="pmodal-swatch-disc" style="background-color: \${c.hex};">
              <svg class="swatch-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="\${checkStroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span class="pmodal-color-card-meta">
              <span class="pmodal-color-card-title">\${c.name}</span>
              <span class="pmodal-color-card-badge">\${isSelected ? 'Seleccionado' : 'Disponible'}</span>
            </span>
          \`;

          card.addEventListener('click', () => {
            colorsContainer.querySelectorAll('.pmodal-color-card').forEach(b => {
              b.classList.remove('active');
              const badge = b.querySelector('.pmodal-color-card-badge');
              if (badge) badge.textContent = 'Disponible';
            });
            card.classList.add('active');
            const activeBadge = card.querySelector('.pmodal-color-card-badge');
            if (activeBadge) activeBadge.textContent = 'Seleccionado';

            selectedModalColor = c.name;
            if (selectedColorNameEl) selectedColorNameEl.textContent = c.name;
            if (stageColorName) stageColorName.textContent = c.name;
            if (stageColorDot) stageColorDot.style.backgroundColor = c.hex;
            if (headerColorDot) headerColorDot.style.backgroundColor = c.hex;

            // Cambiar imagen principal con fade suave
            if (c.image) {
              switchMainImage(c.image);
              if (thumbsContainer) {
                thumbsContainer.querySelectorAll('.pmodal-thumb').forEach(t => {
                  const tImg = t.querySelector('img');
                  if (tImg && tImg.getAttribute('src') === c.image) {
                    t.classList.add('active');
                  } else {
                    t.classList.remove('active');
                  }
                });
              }
            }

            updateWaUrl();
          });

          colorsContainer.appendChild(card);
        });
      } else {
        colorsField.style.display = 'none';
      }
    }

    // Tallas
    if (sizesField && sizesContainer) {
      sizesContainer.innerHTML = '';
      const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
      selectedModalSize = sizes[0] || 'M';
      if (currentSizeLabel) currentSizeLabel.textContent = selectedModalSize;

      sizes.forEach((s: string, idx: number) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = \`pmodal-size-pill\${idx === 0 ? ' selected' : ''}\`;
        btn.textContent = s;
        btn.addEventListener('click', () => {
          sizesContainer.querySelectorAll('.pmodal-size-pill').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedModalSize = s;
          if (currentSizeLabel) currentSizeLabel.textContent = s;
          updateWaUrl();
        });
        sizesContainer.appendChild(btn);
      });
    }

    // Ficha técnica y materialidad
    if (specsField && specsContainer) {
      specsContainer.innerHTML = '';
      if (prod.features && prod.features.length > 0) {
        specsField.style.display = 'block';
        prod.features.slice(0, 8).forEach((f: { name: string; value: string }) => {
          const row = document.createElement('div');
          row.className = 'pmodal-spec-row';
          row.innerHTML = \`<span class="spec-k">\${f.name}:</span><span class="spec-v">\${f.value}</span>\`;
          specsContainer.appendChild(row);
        });
      } else {
        specsField.style.display = 'none';
      }
    }

    if (qtyInput) qtyInput.value = '10';
    if (toastEl) toastEl.style.display = 'none';
    if (addBtnText) addBtnText.textContent = 'Agregar a Cotización';
    if (addBtn) addBtn.classList.remove('success');

    updateWaUrl();

    // Mostrar modal con animación fluida y centrado incondicional
    modalEl.style.display = 'flex';
    void modalEl.offsetHeight; // Forzar reflujo
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Reiniciar posición de scroll interno del modal
    modalEl.scrollTop = 0;
    if (modalDialog) modalDialog.scrollTop = 0;
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modalEl.classList.contains('is-open')) {
        modalEl.style.display = 'none';
      }
    }, 280);
    currentModalProduct = null;
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Agregar desde el modal con color y talla seleccionados
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!currentModalProduct) return;
      const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

      window.dispatchEvent(new CustomEvent('add-product-to-quote', {
        detail: {
          id: currentModalProduct.id,
          qty: qty,
          size: selectedModalSize,
          color: selectedModalColor,
        }
      }));

      if (toastEl) toastEl.style.display = 'flex';
      addBtn.classList.add('success');
      if (addBtnText) addBtnText.textContent = '✓ Agregado al Cotizador';
      setTimeout(() => {
        if (addBtnText) addBtnText.textContent = 'Agregar a Cotización';
        addBtn.classList.remove('success');
      }, 2500);
    });
  }

  if (goQuoteBtn) {
    goQuoteBtn.addEventListener('click', () => {
      closeModal();
      const cotizarSec = document.getElementById('cotizar');
      if (cotizarSec) cotizarSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Click en tarjeta abre modal; click en "+ Cotizar" cotiza directo
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.product-btn') || (e.target as HTMLElement).closest('.card-swatch-dot')) return;
      const id = card.getAttribute('data-id');
      const chosenColor = card.getAttribute('data-color') || card.getAttribute('data-selected-color') || undefined;
      if (id) openModal(id, chosenColor);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if ((e.target as HTMLElement).closest('.product-btn') || (e.target as HTMLElement).closest('.card-swatch-dot')) return;
        e.preventDefault();
        const id = card.getAttribute('data-id');
        const chosenColor = card.getAttribute('data-color') || card.getAttribute('data-selected-color') || undefined;
        if (id) openModal(id, chosenColor);
      }
    });
  });

  // Botón "+ Cotizar" en tarjeta con el color activo`;

if (!modalJsOldRegex.test(code)) {
  console.error('No se pudo encontrar el bloque antiguo del modal JS');
  process.exit(1);
}
code = code.replace(modalJsOldRegex, newModalJs);

fs.writeFileSync(filePath, code, 'utf8');
console.log('¡FeaturedProducts.astro actualizado con éxito!');
