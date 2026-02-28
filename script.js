/* ============================================================
   VELVET DEKORACIJE — Skripte
   ============================================================ */

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

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Zatvori meni klikom na link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ---------- SCROLL ANIMACIJE (Intersection Observer) ----------
const revealEls = document.querySelectorAll(
  '.about-grid, .service-card, .gallery-item, .testimonial-card, .contact-grid, .stat, .section-header'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Staggered delay za grid elemente
        const siblings = Array.from(entry.target.parentElement.children);
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 80, 400);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach(el => observer.observe(el));

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

// ---------- KONTAKT FORMA ----------
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.textContent;

  btn.textContent = 'Slanje...';
  btn.disabled = true;

  // Simulacija slanja (ovdje se može spojiti pravi backend ili EmailJS)
  setTimeout(() => {
    btn.textContent = 'Upit poslan!';
    btn.style.background = '#5a8a5a';
    contactForm.reset();

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);
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
