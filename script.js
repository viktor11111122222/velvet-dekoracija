/* ============================================================
   VELVET DEKORACIJE — Skripte
   ============================================================ */

// ---------- LOADING SCREEN ----------
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Minimum vreme prikaza (ms) da loading ne trepne
  const MIN_SHOW = 1200;
  const start = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - start;
    const delay = Math.max(0, MIN_SHOW - elapsed);
    setTimeout(function () {
      loader.classList.add('hidden');
      // Ukloni iz DOM-a posle animacije
      loader.addEventListener('transitionend', function () {
        loader.remove();
      }, { once: true });
    }, delay);
  }

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
  '.about-grid, .service-card, .gallery-item, .contact-grid, .stat, .section-header'
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
        const siblings = Array.from(entry.target.parentElement.children)
          .filter(c => c.classList.contains('slide-in'));
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 60, 300);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        slideObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

slideEls.forEach(el => slideObserver.observe(el));

// ---------- GALERIJA TOGGLE ----------
const galleryExpanded = document.getElementById('galleryExpanded');
const galleryToggle   = document.getElementById('galleryToggle');
const toggleText      = galleryToggle.querySelector('.toggle-text');

galleryToggle.addEventListener('click', () => {
  const isOpen = galleryExpanded.classList.toggle('open');
  galleryToggle.classList.toggle('open', isOpen);
  toggleText.textContent = isOpen ? 'Zatvori galeriju' : 'Pogledajte sve radove';

  if (!isOpen) {
    document.getElementById('galerija').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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

// SVG i ostale vektorne slike prikazuje direktno (bez konverzije)
function toJpeg(src, callback) {
  if (/\.svg(\?|$)/i.test(src) || src.startsWith('data:image/svg')) {
    callback(src);
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const dpr = window.devicePixelRatio || 1;
    const W = Math.round(window.innerWidth  * 0.9 * dpr);
    const H = Math.round(window.innerHeight * 0.85 * dpr);
    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const natW = img.naturalWidth  || W;
    const natH = img.naturalHeight || H;
    const scale = Math.min(W / natW, H / natH);
    const dw = natW * scale;
    const dh = natH * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    callback(canvas.toDataURL('image/png'));
  };
  img.onerror = () => callback(src);
  img.src = src;
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

function openLightbox(index) {
  buildImageList(); // osvježi listu (expanded može biti otvoren)
  currentIndex = index;
  lightboxImg.alt = images[index].alt;
  lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  lightboxImg.style.opacity = '1';
  lightboxImg.style.transform = 'scale(1)';
  updateCounter();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  toJpeg(images[index].src, (jpegSrc) => {
    lightboxImg.src = jpegSrc;
  });
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
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
document.querySelectorAll('.gallery-item').forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

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
