// ===== EMBERS (brasas flotantes) =====
(function createEmbers() {
  const container = document.getElementById('embers');
  if (!container) return;
  const count = 40;
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'ember';
    const size = Math.random() * 3 + 1.5;
    e.style.left = Math.random() * 100 + 'vw';
    e.style.width = size + 'px';
    e.style.height = size + 'px';
    e.style.animationDuration = (Math.random() * 6 + 6) + 's';
    e.style.animationDelay = (Math.random() * 8) + 's';
    e.style.opacity = Math.random() * 0.5 + 0.3;
    container.appendChild(e);
  }
})();

// ===== NAV scroll state =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ===== Mobile menu =====
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.textContent = '☰';
  }));
}

// ===== Scroll reveal =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  observer.observe(el);
});

// ===== Power bar interaction =====
const track = document.querySelector('.power-track');
const fill = document.getElementById('powerFill');
const marker = document.getElementById('powerMarker');
if (track && fill) {
  const stages = ['SUSURRO', 'CENIZA', 'FRACTURA', '¡RIESGO!'];
  track.addEventListener('mousemove', (e) => {
    const rect = track.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.max(8, Math.min(100, pct));
    fill.style.width = pct + '%';
    const idx = Math.min(3, Math.floor(pct / 26));
    if (marker) marker.textContent = stages[idx];
  });
  track.addEventListener('mouseleave', () => {
    fill.style.width = '20%';
    if (marker) marker.textContent = 'RIESGO';
  });
  // touch support
  track.addEventListener('touchmove', (e) => {
    const rect = track.getBoundingClientRect();
    let pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    pct = Math.max(8, Math.min(100, pct));
    fill.style.width = pct + '%';
    const idx = Math.min(3, Math.floor(pct / 26));
    if (marker) marker.textContent = stages[idx];
  }, { passive: true });
}
