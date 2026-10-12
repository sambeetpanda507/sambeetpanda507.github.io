// Shared behaviour for every page: theme switch, mobile menu, scroll progress, cursor and magnetic buttons.
export const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches;
export const finePointer = matchMedia('(pointer: fine)').matches;

const root = document.documentElement;

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

const themeButton = document.getElementById('theme');
themeButton?.addEventListener('click', (event) => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  };
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || !motionOK) return apply();
  const rect = themeButton.getBoundingClientRect();
  const { clientX, clientY } = event as MouseEvent;
  const x = clientX || rect.left + rect.width / 2;
  const y = clientY || rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  doc.startViewTransition(apply).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});

const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = menuButton ? document.getElementById(menuButton.getAttribute('aria-controls') ?? '') : null;
if (menuButton && menu) {
  const setOpen = (open: boolean) => {
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '✕' : '☰';
  };
  menuButton.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

const progress = document.querySelector<HTMLElement>('.progress');
let ticking = false;
const updateProgress = () => {
  const max = root.scrollHeight - innerHeight;
  progress?.style.setProperty('--sp', String(max > 0 ? scrollY / max : 0));
  ticking = false;
};
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

if (finePointer && motionOK) {
  document.querySelectorAll<HTMLElement>('.magnet').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const ring = document.createElement('div');
  const dot = document.createElement('div');
  ring.className = 'cursor';
  dot.className = 'cursor-dot';
  ring.setAttribute('aria-hidden', 'true');
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    ring.style.opacity = dot.style.opacity = '1';
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });
  document.addEventListener('pointerleave', () => { ring.style.opacity = dot.style.opacity = '0'; });
  document.addEventListener('pointerover', (e) => {
    ring.classList.toggle('grow', Boolean((e.target as Element).closest('a, button, .card')));
  });
  const follow = () => {
    cx += (mx - cx) * .18; cy += (my - cy) * .18;
    ring.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  };
  follow();
}
