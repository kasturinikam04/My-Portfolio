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
/* ---------- Scroll-driven, full-screen scene transitions ---------- */
const sceneNames = ['01 — INTRO', '02 — ABOUT', '03 — IMPACT', '04 — RECOGNITION', '05 — SELECTED WORK', '06 — TOOLKIT', '07 — LEARNING', '08 — JOURNEY', '09 — FOCUS', '10 — CONTACT'];
const scenes = $$('.hero, .room-section, .contact');
const contactScene = $('#contact');
const sceneStage = $('.world-stage');
const sceneLabel = $('.world-stage__chapter');
const sceneCounter = $('.world-stage__counter');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
scenes.forEach((section, index) => {
  section.classList.add('scene-chapter');
  section.dataset.sceneIndex = String(index);
});
if (sceneCounter) sceneCounter.innerHTML = `01 <span>/ ${String(scenes.length).padStart(2, '0')}</span>`;

const clampScene = value => Math.max(0, Math.min(1, value));
const sceneProgress = new Map(scenes.map(section => [section, 0]));
let sceneFrame = 0;
let activeSceneIndex = -1;
function updateScenes() {
  sceneFrame = 0;
  if (reducedMotion.matches) return;
  const viewportCenter = innerHeight / 2;
  const transitionDistance = innerHeight * 0.56;
  const targets = scenes.map((section, index) => {
    let documentTop = 0;
    let node = section;
    while (node && node !== document.body) {
      documentTop += node.offsetTop;
      node = node.offsetParent;
    }
    const top = documentTop - scrollY;
    const height = section.offsetHeight;
    const entering = clampScene((innerHeight - top) / transitionDistance);
    const leaving = clampScene((top + height) / transitionDistance);
    const center = top + Math.min(height, innerHeight) / 2;
    return { section, index, target: Math.min(entering, leaving), distance: Math.abs(center - viewportCenter) };
  });

  // Read every section before writing styles, then ease toward the scroll pose.
  let needsAnotherFrame = false;
  let nearest = targets[0];
  targets.forEach(({ section, index, target, distance }) => {
    const current = sceneProgress.get(section) ?? target;
    const next = current + (target - current) * 0.24;
    const settled = Math.abs(target - next) < 0.002;
    const progressValue = settled ? target : next;
    sceneProgress.set(section, progressValue);
    if (section !== contactScene) {
      section.style.setProperty('--scene-y', `${(1 - progressValue) * 34}px`);
      section.style.setProperty('--scene-z', `${(progressValue - 1) * 420}px`);
      section.style.setProperty('--scene-tilt', `${(1 - progressValue) * 2.8}deg`);
      section.style.setProperty('--scene-scale', `${0.88 + progressValue * 0.12}`);
      section.style.setProperty('--scene-opacity', String(progressValue));
      section.classList.toggle('scene-near', progressValue > 0.02);
    }
    if (!settled) needsAnotherFrame = true;
    if (distance < nearest.distance) nearest = { index, distance };
  });

  if (nearest && nearest.index !== activeSceneIndex) {
    activeSceneIndex = nearest.index;
    if (sceneStage) {
      sceneStage.dataset.sceneIndex = String(activeSceneIndex);
      sceneStage.style.setProperty('--stage-index', activeSceneIndex);
      sceneStage.style.setProperty('--stage-angle', `${activeSceneIndex * 3}deg`);
      sceneStage.style.setProperty('--portal-angle', `${activeSceneIndex * -1.5}deg`);
      sceneStage.style.setProperty('--frame-depth', `${activeSceneIndex * -7}px`);
      sceneStage.style.setProperty('--portal-shift', `${(activeSceneIndex % 2 ? 1 : -1) * Math.min(activeSceneIndex * 13, 104)}px`);
      sceneStage.style.setProperty('--portal-depth', `${activeSceneIndex * -42}px`);
      sceneStage.style.setProperty('--portal-scale', activeSceneIndex % 2 ? '1.08' : '0.94');
    }
    if (sceneLabel) sceneLabel.textContent = sceneNames[activeSceneIndex] || `${String(activeSceneIndex + 1).padStart(2, '0')} — PORTFOLIO`;
    if (sceneCounter) sceneCounter.innerHTML = `${String(activeSceneIndex + 1).padStart(2, '0')} <span>/ ${String(scenes.length).padStart(2, '0')}</span>`;
  }
  if (needsAnotherFrame) sceneFrame = requestAnimationFrame(updateScenes);
}
function requestSceneUpdate() {
  if (!sceneFrame && !reducedMotion.matches) sceneFrame = requestAnimationFrame(updateScenes);
}
addEventListener('scroll', requestSceneUpdate, { passive: true });
addEventListener('resize', requestSceneUpdate, { passive: true });
reducedMotion.addEventListener?.('change', () => {
  if (reducedMotion.matches) {
    if (sceneFrame) cancelAnimationFrame(sceneFrame);
    sceneFrame = 0;
    scenes.forEach(section => {
      section.style.removeProperty('--scene-y');
      section.style.removeProperty('--scene-z');
      section.style.removeProperty('--scene-tilt');
      section.style.removeProperty('--scene-scale');
      section.style.removeProperty('--scene-opacity');
      section.classList.remove('scene-near');
    });
  } else requestSceneUpdate();
});
requestSceneUpdate();

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
