/* ============================================================
   LA TAVERNETTA – BRACERIA · main.js
   Integrazione Strapi CMS
   ============================================================ */

/* ── CONFIGURAZIONE STRAPI ───────────────────────────────── */
const STRAPI_URL = 'https://refined-novelty-d7817d202f.strapiapp.com';
// Incolla qui il tuo API Token (Settings → API Tokens in Strapi)
const STRAPI_TOKEN = '3e8004cf160f6bbb25ecbd0db747565fa9abf0d3d8abb0b520a56ffa0e5b5e5bc4d83f67bd6291539231016afa300263c0eea2bad9376de7d59da3cf19985099b2b06e79673709f63ea17dad591bb153b48d8d89583cef08089fd58051ada53e11838e90d739fcc746af56508003c69ddd1578d91af3067826ce6a0b3304e74f';

async function strapiGet(endpoint) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}?populate=*`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Strapi error: ${res.status} su ${endpoint}`);
  const json = await res.json();
  return json.data;
}

/* ── NAVBAR ─────────────────────────────────────────────── */
const nav = document.getElementById('navbar');
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── MENU TABS ───────────────────────────────────────────── */
function showTab(id, btn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function downloadMenuPdf() {
  const pdfUrl = 'Rosso Scuro Borgogna Fotografico Elegante Classico Professionale Vino Trifold Brochure (2).pdf';
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = pdfUrl.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ── GALLERIA LIGHTBOX ───────────────────────────────────── */
let galleryData = [];
let currentIdx = 0;

const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');

function openLightbox(idx) {
  currentIdx = (idx + galleryData.length) % galleryData.length;
  lbImg.src = galleryData[currentIdx].src;
  lbCaption.textContent = galleryData[currentIdx].caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function initLightboxListeners() {
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => openLightbox(currentIdx - 1));
  lbNext.addEventListener('click', () => openLightbox(currentIdx + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });
}

/* ── FADE IN ON SCROLL ───────────────────────────────────── */
function initFadeObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ── HELPERS ─────────────────────────────────────────────── */
function getImageUrl(media) {
  if (!media?.url) return null;
  // Se l'URL è relativo (self-hosted), aggiungi il base URL
  return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
}

function formatPrice(price) {
  if (!price) return '';
  return typeof price === 'number'
    ? `€ ${price.toFixed(2).replace('.', ',')}`
    : price; // supporta anche "€ 60/kg" come stringa
}

/* ════════════════════════════════════════════════════════════
   CARICAMENTO DATI DA STRAPI
   ════════════════════════════════════════════════════════════ */

/* ── 1. MENU ─────────────────────────────────────────────── */
async function loadMenu() {
  try {
    const items = await strapiGet('voci-menus');
    // Mappa: categoria → id del pannello HTML
    const tabMap = {
      'antipasti':  'antipasti',
      'specialita': 'carne',
      'contorni':   'contorni',
      'bevande':    'bevande'
    };

    // Svuota tutti i pannelli
    Object.values(tabMap).forEach(panelId => {
      const container = document.querySelector(`#${panelId} .menu-items`);
      if (container) container.innerHTML = '';
    });

    items.forEach(item => {
      const { nome, descrizione, prezzo, categoria, disponibile } = item;
      const panelId = tabMap[categoria?.toLowerCase()] || 'antipasti';
      const container = document.querySelector(`#${panelId} .menu-items`);
      if (!container) return;

      const el = document.createElement('div');
      el.className = 'menu-item';
      if (disponibile === false) el.style.opacity = '0.5';
      el.innerHTML = `
        <div class="menu-item-top">
          <span class="menu-item-name">${nome}</span>
          <span class="menu-item-price">${formatPrice(prezzo)}</span>
        </div>
        ${descrizione ? `<p class="menu-item-desc">${descrizione}${disponibile === false ? ' — <em>non disponibile</em>' : ''}</p>` : ''}
      `;
      container.appendChild(el);
    });

  } catch (err) {
    console.warn('Menu: impossibile caricare da Strapi, mantengo HTML statico.', err);
  }
}

/* ── 2. GALLERIA ─────────────────────────────────────────── */
async function loadGalleria() {
  try {
    const items = await strapiGet('galleria-fotos');
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    // Mantieni il lightbox dentro il genitore, rimuovi solo le cards
    const existingItems = grid.querySelectorAll('.gallery-item');
    existingItems.forEach(el => el.remove());

    galleryData = [];

    items.forEach((item, idx) => {
      const { titolo, immagine } = item;
      const imgUrl = getImageUrl(immagine);
      if (!imgUrl) return;

      galleryData.push({ src: imgUrl, caption: titolo || '' });

      const el = document.createElement('div');
      el.className = 'gallery-item' + (idx === 0 ? ' gallery-featured' : '');
      el.innerHTML = `
        <img src="${imgUrl}" alt="${titolo || ''}" loading="lazy">
        <div class="gallery-overlay"><span>${titolo || ''}</span></div>
      `;
      el.addEventListener('click', () => openLightbox(idx));
      grid.insertBefore(el, grid.querySelector('.lightbox'));
    });

  } catch (err) {
    // Fallback: usa le immagini già presenti nell'HTML
    console.warn('Galleria: uso immagini statiche.', err);
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryData = Array.from(galleryItems).map(item => ({
      src:     item.querySelector('img').src,
      caption: item.querySelector('.gallery-overlay span')?.textContent || ''
    }));
    galleryItems.forEach((item, idx) => {
      item.addEventListener('click', () => openLightbox(idx));
    });
  }
}

/* ── 3. RECENSIONI ───────────────────────────────────────── */
async function loadRecensioni() {
  try {
    const items = await strapiGet('recensionis');
    const grid = document.querySelector('.reviews-grid');
    if (!grid) return;

    grid.innerHTML = '';
    items.forEach(item => {
      const { autore, testo, stelle, piattaforma } = item;
      const starsHtml = '★'.repeat(stelle || 5) + '☆'.repeat(5 - (stelle || 5));
      const el = document.createElement('div');
      el.className = 'review-card';
      el.innerHTML = `
        <div class="review-stars">${starsHtml}</div>
        <p class="review-text">${testo}</p>
        <div class="review-author">${autore}</div>
        <div class="review-platform">${piattaforma || 'TripAdvisor'}</div>
      `;
      grid.appendChild(el);
    });

  } catch (err) {
    console.warn('Recensioni: mantengo quelle statiche.', err);
  }
}

/* ── 4. ORARI E CONTATTI ─────────────────────────────────── */
async function loadOrariContatti() {
  try {
    const data = await strapiGet('info-ristorante');
    // data è un singolo oggetto (Single Type in Strapi)
    const info = Array.isArray(data) ? data[0] : data;
    if (!info) return;

    const { telefono, indirizzo, orari, chiuso_il } = info;

    // Telefono
    if (telefono) {
      const telLink = document.querySelector('a[href^="tel:"]');
      if (telLink) telLink.href = `tel:${telefono.replace(/\s/g, '')}`;
    }

    // Indirizzo
    if (indirizzo) {
      const addrEl = document.querySelector('.info-block p');
      if (addrEl) addrEl.innerHTML = indirizzo.replace(/\n/g, '<br>');
    }

    // Orari (stringa libera o array)
    if (orari) {
      const orariGrid = document.querySelector('.orari-grid');
      if (orariGrid) {
        // Supporta stringa multiriga: "Martedì – Domenica: 19:30 – 23:00"
        const righe = orari.split('\n').filter(Boolean);
        orariGrid.innerHTML = righe.map(r => {
          const [giorno, ora] = r.split(':').map(s => s.trim());
          return `<span class="day">${giorno}</span><span class="time">${ora || ''}</span>`;
        }).join('');
      }
      if (chiuso_il) {
        const orariGrid = document.querySelector('.orari-grid');
        if (orariGrid) {
          orariGrid.innerHTML += `<span class="day">${chiuso_il}</span><span class="time">Chiuso</span>`;
        }
      }
    }

  } catch (err) {
    console.warn('Info ristorante: mantengo dati statici.', err);
  }
}

/* ── AVVIO ───────────────────────────────────────────────── */
async function init() {
  initLightboxListeners();

  // Carica tutto in parallelo
  await Promise.allSettled([
    loadMenu(),
    loadGalleria(),
    loadRecensioni(),
    loadOrariContatti()
  ]);

  // Avvia le animazioni dopo il caricamento
  initFadeObserver();
}

document.addEventListener('DOMContentLoaded', init);