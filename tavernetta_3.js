/* ============================================================
   LA TAVERNETTA – BRACERIA · tavernetta_3.js
   ============================================================ */

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

// Close menu when a link is clicked
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

/* ── GALLERIA LIGHTBOX ───────────────────────────────────── */
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lbImg');
const lbCaption   = document.getElementById('lbCaption');
const lbClose     = document.getElementById('lbClose');
const lbPrev      = document.getElementById('lbPrev');
const lbNext      = document.getElementById('lbNext');

let currentIdx = 0;

// Collect all images + captions from gallery
const galleryData = Array.from(galleryItems).map(item => ({
  src:     item.querySelector('img').src,
  caption: item.querySelector('.gallery-overlay span')?.textContent || ''
}));

function openLightbox(idx) {
  currentIdx = (idx + galleryData.length) % galleryData.length;
  lbImg.src           = galleryData[currentIdx].src;
  lbCaption.textContent = galleryData[currentIdx].caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

galleryItems.forEach((item, idx) => {
  item.addEventListener('click', () => openLightbox(idx));
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  () => openLightbox(currentIdx - 1));
lbNext.addEventListener('click',  () => openLightbox(currentIdx + 1));

// Close on backdrop click
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   openLightbox(currentIdx - 1);
  if (e.key === 'ArrowRight')  openLightbox(currentIdx + 1);
});

/* ── FADE IN ON SCROLL ───────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target); // fire once
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
