/* ============================================================
   VELVET DEKORACIJE — Skripte
   ============================================================ */

// ---------- SCROLL NA VRH PRI REFRESHU ----------
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------- LOADING SCREEN ----------
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const MIN_SHOW = 800;
  const MAX_SHOW = 2000;
  const start = Date.now();
  let hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    const elapsed = Date.now() - start;
    const delay = Math.max(0, MIN_SHOW - elapsed);
    setTimeout(function () {
      document.body.style.overflow = '';
      loader.classList.add('hidden');
      loader.addEventListener('transitionend', function () {
        loader.remove();
      }, { once: true });
    }, delay);
  }

  // Tvrdi maksimum — loader se uvijek sakrije nakon 2s
  setTimeout(hideLoader, MAX_SHOW);

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();

// ---------- NAVIGACIJA: scroll klasa ----------
const navbar = document.getElementById('navbar');

// ---------- PARALLAX HERO & ABOUT ----------
const heroImg        = document.querySelector('.hero-img');
const aboutParallax  = document.getElementById('aboutParallaxImg');

function onScroll() {
  const scrollY = window.scrollY;

  // Navbar
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Parallax hero — slika se pomjera sporije od skrola (faktor 0.45)
  if (heroImg) {
    heroImg.style.transform = `translateY(${scrollY * 0.45}px)`;
  }

  // Parallax about — pomicanje relativno na centar viewporta
  if (aboutParallax) {
    const rect   = aboutParallax.closest('.about-img-main').getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.12;
    aboutParallax.style.transform = `translateY(${offset}px)`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- MOBILNI MENI ----------
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

function closeNav() {
  navLinks.classList.remove('open');
  navbar.classList.add('nav-closing');
  navbar.classList.remove('nav-open');
  requestAnimationFrame(() => navbar.classList.remove('nav-closing'));
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  if (isOpen) {
    navbar.classList.add('nav-open');
  } else {
    closeNav();
  }
});

// Zatvori meni klikom na link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// ---------- COUNTER ANIMACIJA (stat-number) ----------
function animateCounter(el, target, suffix, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.textContent.trim();
    const suffix = raw.replace(/[0-9]/g, ''); // "+" ili "%"
    const target = parseInt(raw, 10);
    animateCounter(el, target, suffix, 1600);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ---------- SCROLL ANIMACIJE (Intersection Observer) ----------
const revealEls = document.querySelectorAll(
  '.about-grid, .service-card, .contact-grid, .stat, .section-header'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children);
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 80, 400);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach(el => observer.observe(el));

// Slide-in za sve tekst elemente u sekcijama
const slideEls = document.querySelectorAll(
  'section:not(.hero) h2, section:not(.hero) h3, section:not(.hero) h4,' +
  'section:not(.hero) p, section:not(.hero) li,' +
  'section:not(.hero) .section-eyebrow,' +
  'section:not(.hero) .btn,' +
  '.footer-col h4, .footer-col p, .footer-col li'
);

let slideIdx = 0;
slideEls.forEach(el => {
  if (el.closest('.testimonial-card') && el.closest('[data-clone]')) return;
  el.classList.add('slide-in', slideIdx % 2 === 0 ? 'from-left' : 'from-right');
  slideIdx++;
});

const slideObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        let delay = 0;
        if (!el.classList.contains('gallery-item')) {
          const siblings = Array.from(el.parentElement.children)
            .filter(c => c.classList.contains('slide-in'));
          const index = siblings.indexOf(el);
          delay = Math.min(index * 60, 300);
        }
        setTimeout(() => el.classList.add('visible'), delay);
        slideObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

slideEls.forEach(el => slideObserver.observe(el));

// ---------- GALERIJA TOGGLE ----------
const galleryExpanded    = document.getElementById('galleryExpanded');
const galleryToggle      = document.getElementById('galleryToggle');
const toggleText         = galleryToggle.querySelector('.toggle-text');
const toggleIcon         = galleryToggle.querySelector('.toggle-icon');
const galleryLoadOverlay = document.getElementById('galleryLoadOverlay');
const galleryLoadText    = document.getElementById('galleryLoadText');

let galleryPreloaded = false;

galleryToggle.addEventListener('click', () => {
  const isOpen = galleryExpanded.classList.contains('open');

  if (isOpen) {
    // Zatvori galeriju — animiraj collapse i skroluj gore istovremeno
    const currentHeight = galleryExpanded.scrollHeight;
    galleryExpanded.style.transition = 'max-height 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease';
    galleryExpanded.style.maxHeight = currentHeight + 'px';
    void galleryExpanded.offsetWidth; // force reflow

    galleryExpanded.style.maxHeight = '0px';
    galleryExpanded.style.opacity = '0';

    galleryToggle.classList.remove('open');
    toggleText.textContent = 'Pogledajte sve radove';
    toggleIcon.style.display = '';

    // Skroluj do vrha galerije dok se animacija odvija
    document.getElementById('galerija').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Počisti inline stilove kad animacija završi
    setTimeout(() => {
      galleryExpanded.classList.remove('open');
      galleryExpanded.style.transition = '';
      galleryExpanded.style.maxHeight = '';
      galleryExpanded.style.opacity = '';
    }, 950);
    return;
  }

  // Ako su slike već učitane, odmah otvori
  if (galleryPreloaded) {
    galleryExpanded.classList.add('open');
    galleryToggle.classList.add('open');
    toggleText.textContent = 'Zatvori galeriju';
    return;
  }

  // Pokreni loading — prikaži overlay
  const imgs = Array.from(galleryExpanded.querySelectorAll('img'));
  const total = imgs.length;

  galleryLoadText.textContent = 'Učitavanje slika…';
  galleryLoadOverlay.classList.add('active');
  galleryToggle.disabled = true;

  function openAfterLoad() {
    galleryPreloaded = true;
    galleryToggle.disabled = false;

    // Odmah postavi max-height bez tranzicije, pa tek onda fade-in opacity
    galleryExpanded.style.transition = 'none';
    galleryExpanded.style.maxHeight = '9000px';
    void galleryExpanded.offsetWidth; // force reflow

    // Sakrij overlay i fade-in galeriju
    galleryLoadOverlay.classList.remove('active');
    galleryExpanded.style.transition = '';
    galleryExpanded.classList.add('open');
    galleryToggle.classList.add('open');
    toggleText.textContent = 'Zatvori galeriju';
  }

  if (total === 0) { openAfterLoad(); return; }

  // Ukloni lazy loading i čekaj da svaki DOM img element zaista učita
  requestAnimationFrame(() => requestAnimationFrame(() => {
    let done = 0;

    function onOne() {
      done++;
      galleryLoadText.textContent = `Učitavanje ${done} / ${total}`;
      if (done >= total) openAfterLoad();
    }

    imgs.forEach(img => {
      img.removeAttribute('loading');
      if (img.complete && img.naturalWidth > 0) {
        onOne();
      } else {
        img.addEventListener('load',  onOne, { once: true });
        img.addEventListener('error', onOne, { once: true });
      }
    });
  }));
});

// ---------- LIGHTBOX GALERIJA ----------
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');

let currentIndex = 0;
let images = [];

// Skupi sve slike iz galerije (preview + expanded)
function buildImageList() {
  images = Array.from(document.querySelectorAll('.gallery-item img')).map(img => ({
    src: img.src,
    alt: img.alt,
  }));
}
buildImageList();

function updateCounter() {
  lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
}

// Direktno prikazuje sliku bez canvas konverzije (čuva EXIF orijentaciju)
function toJpeg(src, callback) {
  callback(src);
}

function showImage(index) {
  // Kratka fade animacija pri promeni slike
  lightboxImg.style.opacity = '0';
  lightboxImg.style.transform = 'scale(0.96)';
  setTimeout(() => {
    toJpeg(images[index].src, (jpegSrc) => {
      lightboxImg.src = jpegSrc;
      lightboxImg.alt = images[index].alt;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
      updateCounter();
    });
  }, 150);
}

let _scrollY = 0;

function lockScroll() {
  _scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, _scrollY);
  document.documentElement.style.scrollBehavior = '';
}

function openLightbox(index, customImages) {
  if (customImages) {
    images = customImages;
  } else {
    buildImageList();
  }
  currentIndex = index;
  lightboxImg.alt = images[index].alt;
  lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  lightboxImg.style.opacity = '1';
  lightboxImg.style.transform = 'scale(1)';
  updateCounter();
  lightbox.classList.add('active');
  lockScroll();
  toJpeg(images[index].src, (jpegSrc) => {
    lightboxImg.src = jpegSrc;
  });
}

function closeLightbox() {
  lightbox.classList.remove('active');
  unlockScroll();
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
}

// Klik na gallery item
function initGalleryClick() {
  document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
}
initGalleryClick();

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

// Klik van slike zatvara lightbox
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Tastatura
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// Touch swipe (mobilni)
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
}, { passive: true });

// ---------- EMAILJS KONFIGURACIJA ----------
// Popuni sa svojih EmailJS naloga:
const EMAILJS_PUBLIC_KEY  = '4FrHcttWWMAg0A32b';   // Account > API Keys
const EMAILJS_SERVICE_ID  = 'service_jq8bmyh';   // Email Services
const EMAILJS_TEMPLATE_ID = 'template_301bchb';  // Email Templates

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ---------- KONTAKT FORMA ----------
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.textContent;

  btn.textContent = 'Slanje...';
  btn.disabled = true;

  const templateParams = {
    name:       contactForm.ime.value,
    email:      contactForm.email.value,
    phone:      contactForm.telefon.value,
    event_type: contactForm.usluga.value,
    message:    contactForm.poruka.value,
    time:       new Date().toLocaleString('sr-RS'),
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      btn.textContent = 'Upit poslan!';
      btn.style.background = '#5a8a5a';
      contactForm.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    })
    .catch((err) => {
      console.error('EmailJS greška:', err);
      btn.textContent = 'Greška — pokušajte ponovo';
      btn.style.background = '#c0392b';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
});

// ---------- KOPIRAJ BROJ TELEFONA ----------
const copyToast = document.getElementById('copyToast');
let toastTimer = null;

async function copyPhone(phone, feedbackEl) {
  try {
    await navigator.clipboard.writeText(phone);
  } catch { return; }

  // Toast (vidljiv i na desktopu i na mobilnom)
  clearTimeout(toastTimer);
  copyToast.classList.add('show');
  toastTimer = setTimeout(() => copyToast.classList.remove('show'), 2000);

  // Feedback na desktop dugmetu
  if (feedbackEl) {
    const label = feedbackEl.querySelector('.copy-label');
    feedbackEl.classList.add('copied');
    label.textContent = 'Kopirano!';
    setTimeout(() => {
      feedbackEl.classList.remove('copied');
      label.textContent = 'Kopiraj';
    }, 2000);
  }
}

// Desktop: dugme za kopiranje
document.querySelectorAll('.copy-phone-btn').forEach(btn => {
  btn.addEventListener('click', () => copyPhone(btn.dataset.phone, btn));
});

// Mobilni: klik na broj kopira umesto da poziva
document.querySelectorAll('.phone-number').forEach(link => {
  link.addEventListener('click', (e) => {
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) {
      e.preventDefault();
      copyPhone(link.textContent.trim(), null);
    }
  });
});

// Email: klik kopira adresu
document.querySelectorAll('.email-copy').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    await copyPhone(link.dataset.email, null);
    copyToast.textContent = 'Email kopiran!';
    clearTimeout(toastTimer);
    copyToast.classList.add('show');
    toastTimer = setTimeout(() => {
      copyToast.classList.remove('show');
      copyToast.textContent = 'Broj kopiran!';
    }, 2000);
  });
});

// ---------- SMOOTH SCROLL za starije browsere ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---------- TESTIMONIALS CAROUSEL (infinite seamless loop) ----------
(function () {
  const track   = document.getElementById('testimonialsTrack');
  const wrap    = document.getElementById('testimonialsCarousel');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');
  const dotsEl  = document.getElementById('carouselDots');
  if (!track || !wrap) return;

  // Only the original real cards (no clones)
  const realCards = Array.from(track.querySelectorAll('.testimonial-card'));
  const REAL      = realCards.length;
  const GAP       = 24;
  const DUR       = 580; // slightly longer than CSS 0.55s transition

  let visible   = 3;
  let current   = 0;   // leftmost real-card index shown (0 .. REAL-visible)
  let autoTimer = null;
  let busy      = false;

  function getVisible() {
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function getMax() { return REAL - visible; }

  // Real card i lives at extended-track position (i + visible)
  function extOf(i) { return i + visible; }

  function allCards() {
    return Array.from(track.querySelectorAll('.testimonial-card'));
  }

  // Build clone buffer: prepend last `visible` cards, append first `visible` cards
  function buildClones() {
    visible = getVisible();
    track.querySelectorAll('[data-clone]').forEach(c => c.remove());

    // Prepend clones of last `visible` real cards (in order) → positions 0..visible-1
    const starts = realCards.slice(-visible).map(c => {
      const cl = c.cloneNode(true); cl.dataset.clone = 's'; return cl;
    });
    track.prepend(...starts);

    // Append clones of first `visible` real cards → positions REAL+visible..end
    realCards.slice(0, visible).forEach(c => {
      const cl = c.cloneNode(true); cl.dataset.clone = 'e'; track.appendChild(cl);
    });
  }

  function setWidths() {
    const w = (wrap.offsetWidth - GAP * (visible - 1)) / visible;
    allCards().forEach(c => { c.style.width = w + 'px'; });
  }

  function moveTo(idx, animate) {
    const step = allCards()[0].offsetWidth + GAP;
    if (animate === false) { track.style.transition = 'none'; void track.offsetWidth; }
    track.style.transform = 'translateX(-' + (idx * step) + 'px)';
    if (animate === false) { void track.offsetWidth; track.style.transition = ''; }
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i <= getMax(); i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Slajd ' + (i + 1));
      d.addEventListener('click', () => {
        if (busy) return;
        current = i; moveTo(extOf(current), true); syncDots(); resetTimer();
      });
      dotsEl.appendChild(d);
    }
  }

  function syncDots() {
    if (!dotsEl) return;
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goNext() {
    if (busy) return;
    if (current < getMax()) {
      current++; moveTo(extOf(current), true); syncDots();
    } else {
      // Seamless wrap forward: animate into end-clone zone, snap back to real start
      busy = true; current = 0; syncDots();
      moveTo(extOf(REAL), true);
      setTimeout(() => { moveTo(extOf(0), false); busy = false; }, DUR);
    }
  }

  function goPrev() {
    if (busy) return;
    if (current > 0) {
      current--; moveTo(extOf(current), true); syncDots();
    } else {
      // Seamless wrap backward: animate into start-clone zone, snap to real end
      busy = true; current = getMax(); syncDots();
      moveTo(extOf(-visible), true);   // extOf(-visible) = 0 = start of start-clones
      setTimeout(() => { moveTo(extOf(current), false); busy = false; }, DUR);
    }
  }

  function startTimer() { autoTimer = setInterval(goNext, 5000); }
  function resetTimer() { clearInterval(autoTimer); startTimer(); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); resetTimer(); });

  wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrap.addEventListener('mouseleave', startTimer);

  let swipeX = 0;
  wrap.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = swipeX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? goNext() : goPrev(); resetTimer(); }
  }, { passive: true });

  let resizeId;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => {
      const prev = current;
      buildClones(); setWidths(); buildDots();
      current = Math.min(prev, getMax());
      moveTo(extOf(current), false);
    }, 150);
  });

  // Init
  buildClones();
  setWidths();
  buildDots();
  moveTo(extOf(0), false);
  startTimer();
})();

// ---------- SERVICE GALLERY POPUP ----------
const SERVICE_GALLERIES = {
  rodjendan: [
    'public/rodjendan/1000013964.webp',
    'public/rodjendan/1000042688_7b36413b-5972-4948-b939-81c48b7732dc.webp',
    'public/rodjendan/1000043030_9780d123-4d7f-4914-99c1-4161ca8eb969.webp',
    'public/rodjendan/20250511_135812.webp',
    'public/rodjendan/20250511_140040.webp',
    'public/rodjendan/20250815_144015.webp',
    'public/rodjendan/20251123_113042.webp',
    'public/rodjendan/DSCF2448_fadb048a-b7e3-404c-b303-beaed23d899b.webp',
    'public/rodjendan/DSCF5425_17d69a5f-22d4-4b43-9336-a1b8ef6128c4.webp',
    'public/rodjendan/DSC_0943.webp',
    'public/rodjendan/DSC_0962_700f58bc-6891-410d-ac00-257c1b33c171.webp',
    'public/rodjendan/DSF-288_1333e887-0627-487f-b3c1-0cc0892fd35b.webp',
    'public/rodjendan/Q58A0659.webp',
    'public/rodjendan/Q58A0704.webp',
  ],
  punoletstvo: [
    'public/punoletstvo/20250614_170553.webp',
    'public/punoletstvo/20250815_182401.webp',
    'public/punoletstvo/20250828_181126.webp',
    'public/punoletstvo/20250906_182535.webp',
    'public/punoletstvo/20250906_182626.webp',
    'public/punoletstvo/20251010_175426.webp',
    'public/punoletstvo/20251024_174632.webp',
    'public/punoletstvo/20251024_174853.webp',
    'public/punoletstvo/20251206_174244.webp',
    'public/punoletstvo/IMG-9076f5454ba856e7edcce9f153a1a122-V.webp',
    'public/punoletstvo/IMG-90b596c2c76b2110dd893d8108065b54-V.webp',
    'public/punoletstvo/IMG-ad0b4ceffc278815b159a9826e5f96bc-V.webp',
    'public/punoletstvo/JSC_0207.webp',
    'public/punoletstvo/image4.webp',
  ],
  devojacko: [
    'public/devojacko/20250119_165451.webp',
    'public/devojacko/20250214_182330.webp',
    'public/devojacko/20260221_192748.webp',
    'public/devojacko/BG_1508.webp',
    'public/devojacko/IMG-48ac3021e0aaf2cc0d52195c625f991e-V.webp',
    'public/devojacko/IMG-6b1ac34b47649e32f7ca93794aa8583b-V.webp',
    'public/devojacko/daVinci_005.webp',
    'public/devojacko/daVinci_014.webp',
  ],
  vencanje: [
    'public/Venčanje 2/0344 MM_cinema_e9e48d0a-a4bf-4786-9296-57936c9525ec.webp',
    'public/Venčanje 2/1261-JAKIfoto.webp',
    'public/Venčanje 2/20240614_164901.webp',
    'public/Venčanje 2/20241005_131528.webp',
    'public/Venčanje 2/20251025_140409.webp',
    'public/Venčanje 2/428-JAKIfoto.webp',
    'public/Venčanje 2/BG_1918.webp',
    'public/Venčanje 2/IMG-8f3e49bc5f16ce9936541987244232ab-V.webp',
    'public/Venčanje 2/IMG-c288bc8365e273e43d725832800d28e6-V.webp',
    'public/Venčanje 2/IMG-ca5ee3557241d3ca7d196153651edd67-V.webp',
    'public/Venčanje 2/IMG_1856.webp',
    'public/Venčanje 2/MAJ_3119_3dcf6789-d9bb-4af6-96a4-46915589c967.webp',
    'public/Venčanje 2/PFactory_0604.webp',
    'public/Venčanje 2/SM__3416_0f374b87-f323-4671-96a2-84987100101b.webp',
    'public/Venčanje 2/SM__3438_c811e084-c315-4fb7-bb2a-f5b89a81e320.webp',
    'public/Venčanje 2/image00022.webp',
    'public/Venčanje 2/преузимање-36.webp',
  ],
  korporativne: [
    'public/Korporativne/1000043029_66eca2a5-567f-4159-9932-2d046519db85.webp',
    'public/Korporativne/1263-JAKIfoto.webp',
    'public/Korporativne/1763555669258754_424a5dd3-f7ae-43b3-ad56-78949fef6c8b.webp',
    'public/Korporativne/20240803_181717.webp',
    'public/Korporativne/20250502_145022.webp',
    'public/Korporativne/20250511_135738.webp',
    'public/Korporativne/20250517_124351.webp',
    'public/Korporativne/20250517_124552.webp',
    'public/Korporativne/20250517_132601.webp',
    'public/Korporativne/20250517_132827.webp',
    'public/Korporativne/IMG_20250519_233312_166.webp',
    'public/Korporativne/MAJ_3119_3dcf6789-d9bb-4af6-96a4-46915589c967.webp',
    'public/Korporativne/MAJ_3122_b2546894-b827-41b0-85ae-c57b4d8d4f50.webp',
    'public/Korporativne/c909e1f904ca233cacc463baaba2e154_6bd8a516-4be3-4956-b5d6-f65e5423f41b.webp',
    'public/Korporativne/daVinci_002.webp',
    'public/Korporativne/daVinci_014.webp',
    'public/Korporativne/image00010.webp',
  ],
  bidermajer: [
    'public/Bidermajer/0168 MM_cinema_e19ee158-2778-4cd4-8a57-9fb5461b86a0.webp',
    'public/Bidermajer/1729541480735280_9b4ba75c-e236-4f6e-8600-a44e9e1ef948.webp',
    'public/Bidermajer/1763555680492090_7695082d-f33f-4674-a0b1-e1c112387140.webp',
    'public/Bidermajer/20250725_195609.webp',
    'public/Bidermajer/20250904_143558.webp',
    'public/Bidermajer/DEMO_0115.webp',
    'public/Bidermajer/DEMO_0860.webp',
    'public/Bidermajer/DSC_6443.webp',
    'public/Bidermajer/IMG-11bc97a0cfc3f04829dbbda9b62fcebd-V.webp',
    'public/Bidermajer/IMG-91a3f7b132493b9f426c2186a08e841d-V.webp',
    'public/Bidermajer/IMG-f8c750bf6a22a480c676b55fc18acc31-V.webp',
    'public/Bidermajer/JO__0149_526c1189-751a-4fb4-9dac-fad1dd9baf5a.webp',
    'public/Bidermajer/LegiPh_0172.webp',
    'public/Bidermajer/PFactory_0141.webp',
  ],
};

const SVC_TITLES = {
  rodjendan: '1. Rođendan',
  punoletstvo: 'Punoletstvo',
  devojacko: 'Devojačko veče',
  vencanje: 'Venčanje',
  korporativne: 'Korporativne proslave',
  bidermajer: 'Bidermajer',
};

const svcGalleryEl    = document.getElementById('svcGallery');
const svcGalleryTitle = document.getElementById('svcGalleryTitle');
const svcGalleryGrid  = document.getElementById('svcGalleryGrid');
const svcGalleryClose = document.getElementById('svcGalleryClose');
const svcScrollHint   = document.getElementById('svcScrollHint');

let _svcScrollY = 0;

function openSvcGallery(key) {
  const imgs  = SERVICE_GALLERIES[key];
  const title = SVC_TITLES[key];
  svcGalleryTitle.textContent = title;
  svcGalleryGrid.innerHTML = '';

  const customImages = imgs.map(src => ({ src, alt: title }));

  imgs.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'svc-gallery-item';
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.loading = 'lazy';
    item.appendChild(img);
    item.addEventListener('click', () => {
      closeSvcGallery(false);
      openLightbox(i, customImages);
    });
    svcGalleryGrid.appendChild(item);
  });

  _svcScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_svcScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  svcGalleryEl.classList.add('active');
  // Reset scroll hint
  svcGalleryGrid.scrollTop = 0;
  // Check after layout renders
  requestAnimationFrame(() => updateScrollHint());
}

function updateScrollHint() {
  const { scrollTop, scrollHeight, clientHeight } = svcGalleryGrid;
  if (scrollTop + clientHeight >= scrollHeight - 16) {
    svcScrollHint.classList.add('hidden');
  } else {
    svcScrollHint.classList.remove('hidden');
  }
}

svcGalleryGrid.addEventListener('scroll', updateScrollHint, { passive: true });

function closeSvcGallery(restoreScroll = true) {
  svcGalleryEl.classList.remove('active');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  if (restoreScroll) {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, _svcScrollY);
    document.documentElement.style.scrollBehavior = '';
  }
}

svcGalleryClose.addEventListener('click', () => closeSvcGallery(true));
svcGalleryEl.addEventListener('click', (e) => {
  if (e.target === svcGalleryEl) closeSvcGallery(true);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && svcGalleryEl.classList.contains('active')) {
    closeSvcGallery(true);
  }
});

document.querySelectorAll('.service-card[data-gallery]').forEach(card => {
  card.addEventListener('click', () => openSvcGallery(card.dataset.gallery));
});

// ---------- GENERISANJE GALERIJE IZ POPUP SLIKA ----------
(function () {
  const previewEl  = document.querySelector('.gallery-preview');
  const expandedEl = document.getElementById('galleryExpanded');

  // Redosled i odabir preview slika (po 1 iz svake kategorije za prvih 4)
  const PREVIEW_PICKS = [
    { key: 'vencanje',     src: 'public/Venčanje 2/PFactory_0604.webp' },
    { key: 'rodjendan',    src: 'public/rodjendan/DSCF5425_17d69a5f-22d4-4b43-9336-a1b8ef6128c4.webp' },
    { key: 'punoletstvo',  src: 'public/punoletstvo/JSC_0207.webp' },
    { key: 'bidermajer',   src: 'public/Bidermajer/LegiPh_0172.webp' },
  ];

  // Sve slike iz svih kategorija u željenom redosledu
  const ORDER = ['vencanje', 'rodjendan', 'punoletstvo', 'devojacko', 'korporativne', 'bidermajer'];
  const all = [];
  ORDER.forEach(key => {
    SERVICE_GALLERIES[key].forEach(src => {
      all.push({ src, label: SVC_TITLES[key] });
    });
  });

  // Preview srcovi da ih preskočimo u expanded
  const previewSrcs = new Set(PREVIEW_PICKS.map(p => p.src));

  function makeItem(src, label, lazy) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = src;
    img.alt = label;
    if (lazy) img.loading = 'lazy';
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    const span = document.createElement('span');
    span.textContent = label;
    overlay.appendChild(span);
    div.appendChild(img);
    div.appendChild(overlay);
    return div;
  }

  previewEl.innerHTML = '';
  expandedEl.innerHTML = '';

  PREVIEW_PICKS.forEach(({ key, src }) => {
    previewEl.appendChild(makeItem(src, SVC_TITLES[key], false));
  });

  all.forEach(({ src, label }) => {
    if (!previewSrcs.has(src)) {
      expandedEl.appendChild(makeItem(src, label, true));
    }
  });

  // Ponovo postavi click listenere i image listu
  buildImageList();
  initGalleryClick();

  // Slide-in animacije za gallery items sa strana — po redu, ne po itemu
  // (da susedne slike ne bi išle jedna prema drugoj i preklapale se)
  const wrapEl = document.querySelector('.gallery-wrap');
  const cols = getComputedStyle(wrapEl).gridTemplateColumns.trim().split(/\s+/).length || 4;
  let gIdx = 0;
  document.querySelectorAll('.gallery-preview .gallery-item, #galleryExpanded .gallery-item').forEach(item => {
    const row = Math.floor(gIdx / cols);
    item.classList.add('slide-in', row % 2 === 0 ? 'from-left' : 'from-right');
    gIdx++;
    slideObserver.observe(item);
  });
})();
