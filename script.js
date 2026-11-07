const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ---------- Settings ---------- */
const EMAIL = 'kasturinikam1618@gmail.com';
// Optional: paste a Formspree (or similar) endpoint, e.g. 'https://formspree.io/f/xxxxxxx'.
// Leave empty to open the visitor's email app with the message pre-filled instead.
const FORM_ENDPOINT = '';

/* ---------- Rotating role ---------- */
const role = $('#role');
const roles = ['Student Developer', 'AI Enthusiast', 'Community Leader', 'Technology Explorer', 'Web Developer', 'EdTech Builder'];
let roleIndex = 0;
if (role) {
  role.style.transition = 'opacity .25s ease';
  setInterval(() => {
    role.style.opacity = 0;
    setTimeout(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      role.textContent = roles[roleIndex];
      role.style.opacity = 1;
    }, 260);
  }, 2400);
}

/* ---------- Observer helper (falls back to "visible" without IntersectionObserver) ---------- */
function watch(selector, className, options) {
  const els = $$(selector);
  if (!('IntersectionObserver' in window)) return els.forEach(el => el.classList.add(className));
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add(className);
    io.unobserve(entry.target);
  }), options);
  els.forEach(el => io.observe(el));
}
watch('.reveal', 'visible', { threshold: 0, rootMargin: '45% 0px 45% 0px' });
watch('.project, .achievement-grid', 'built', { threshold: 0.25 });

/* ---------- Mobile menu ---------- */
const header = $('.nav');
const menu = $('.menu-btn');
function setMenu(open) {
  header.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menu.addEventListener('click', () => setMenu(!header.classList.contains('open')));
$$('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => { if (!header.contains(e.target)) setMenu(false); });

/* ---------- Scroll progress, back-to-top, active nav link ---------- */
const topButton = $('.to-top');
const progress = $('.reading-line span');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Lightweight comet cursor trail (mouse / pen only) ---------- */
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
  const trailCanvas = document.createElement('canvas');
  trailCanvas.className = 'cursor-trail';
  trailCanvas.setAttribute('aria-hidden', 'true');
  document.body.append(trailCanvas);
  const trailContext = trailCanvas.getContext('2d', { alpha: true });
  const trail = [];
  let trailFrame = 0;
  let trailWidth = 0;
  let trailHeight = 0;
  const resizeTrail = () => {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    trailWidth = innerWidth;
    trailHeight = innerHeight;
    trailCanvas.width = Math.round(trailWidth * ratio);
    trailCanvas.height = Math.round(trailHeight * ratio);
    trailCanvas.style.width = `${trailWidth}px`;
    trailCanvas.style.height = `${trailHeight}px`;
    trailContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const paintTrail = () => {
    trailFrame = 0;
    trailContext.clearRect(0, 0, trailWidth, trailHeight);
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.024;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }
    if (trail.length > 1) {
      trailContext.save();
      trailContext.lineCap = 'round';
      trailContext.lineJoin = 'round';
      for (let i = 1; i < trail.length; i++) {
        const point = trail[i];
        const previous = trail[i - 1];
        trailContext.beginPath();
        trailContext.moveTo(previous.x, previous.y);
        trailContext.lineTo(point.x, point.y);
        trailContext.strokeStyle = `rgba(103, 224, 226, ${point.life * 0.5})`;
        trailContext.lineWidth = point.life * 4.5;
        trailContext.shadowColor = '#8b6dff';
        trailContext.shadowBlur = 12;
        trailContext.stroke();
      }
      const head = trail[trail.length - 1];
      trailContext.beginPath();
      trailContext.arc(head.x, head.y, 2.1, 0, Math.PI * 2);
      trailContext.fillStyle = `rgba(220, 255, 255, ${head.life})`;
      trailContext.shadowColor = '#71e5e5';
      trailContext.shadowBlur = 17;
      trailContext.fill();
      trailContext.restore();
    }
    if (trail.length) trailFrame = requestAnimationFrame(paintTrail);
  };
  resizeTrail();
  addEventListener('resize', resizeTrail, { passive: true });
  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    trail.push({ x: event.clientX, y: event.clientY, life: 1 });
    if (trail.length > 18) trail.shift();
    if (!trailFrame) trailFrame = requestAnimationFrame(paintTrail);
  }, { passive: true });
}

addEventListener('scroll', () => {
  topButton.classList.toggle('show', scrollY > 500);
  const height = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${height ? (scrollY / height) * 100 : 0}%`;
}, { passive: true });

const navLinks = $$('nav a:not(.nav-cta)');
const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
  }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}

/* ---------- Theme ---------- */
const themeButton = $('.theme-toggle');
function setTheme(light) {
  document.body.classList.toggle('light', light);
  themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
}
setTheme(false);
themeButton.addEventListener('click', () => {
  const light = !document.body.classList.contains('light');
  setTheme(light);
});

/* ---------- Pointer effects (mouse devices only) ---------- */
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  // Uses the separate `translate` property so :hover transforms keep working.
  $$('.primary, .circle-link, .nav-cta').forEach(el => {
    el.addEventListener('pointermove', event => {
      const box = el.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * 0.09;
      const y = (event.clientY - box.top - box.height / 2) * 0.09;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
  $$('.achievement').forEach(card => card.addEventListener('pointermove', event => {
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  }));
}

/* ---------- Footer year ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Contact form ---------- */
const form = $('.contact-form');
const formMessage = $('.form-message', form);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();
  const data = new FormData(form);
  const name = data.get('name'), email = data.get('email'), message = data.get('message');

  if (FORM_ENDPOINT) {
    try {
      const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      formMessage.textContent = 'Thanks — your message has been sent.';
    } catch {
      formMessage.textContent = `Something went wrong. Please email me directly at ${EMAIL}.`;
    }
    return;
  }

  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  formMessage.textContent = `Opening your email app… if nothing opens, write to ${EMAIL}.`;
});
