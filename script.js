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
watch('.reveal', 'visible', { threshold: 0, rootMargin: '0px 0px -6% 0px' });
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
const roomSections = $$('.room-section');
const roomStage = $('main');
roomStage?.classList.add('room-stage');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const roomObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('room-active');
    roomObserver.unobserve(entry.target);
  }), { rootMargin: '-14% 0px -14% 0px', threshold: 0.08 });
  roomSections.forEach(section => roomObserver.observe(section));
} else {
  roomSections.forEach(section => section.classList.add('room-active'));
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
