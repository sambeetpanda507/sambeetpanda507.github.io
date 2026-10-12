// Home page motion: name load sequence, hero 3D, nav highlight, scroll-lit statement, timeline and card tilt.
import { motionOK, finePointer } from './site';
import { embeddingField } from './space';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

// Split the hero name into letters for the load sequence (the h1 keeps its aria-label).
let index = 0;
document.querySelectorAll<HTMLElement>('#name .line').forEach((line) => {
  const text = line.textContent ?? '';
  line.textContent = '';
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch;
    span.style.setProperty('--i', String(index++));
    line.appendChild(span);
  }
});

const hero = document.getElementById('hero')!;
embeddingField(document.getElementById('field') as HTMLCanvasElement, hero);

// Sliding pill under the nav links, following hover and the section in view.
const nav = document.getElementById('navlinks')!;
const pill = nav.querySelector<HTMLElement>('.nav-pill')!;
const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
const tracked = links
  .map((a) => ({ a, section: a.hash ? document.querySelector<HTMLElement>(a.hash) : null }))
  .filter((x): x is { a: HTMLAnchorElement; section: HTMLElement } => Boolean(x.section));
const movePill = (a: HTMLAnchorElement | null) => {
  if (!a) { pill.style.opacity = '0'; return; }
  pill.style.opacity = '1';
  pill.style.width = `${a.offsetWidth}px`;
  pill.style.transform = `translateX(${a.offsetLeft}px)`;
};
let hovering = false;
const spy = () => {
  const line = innerHeight * .35;
  const current = tracked.find(({ section }) => { const r = section.getBoundingClientRect(); return r.top <= line && r.bottom > line; })?.a ?? null;
  links.forEach((a) => a.classList.toggle('active', a === current));
  if (!hovering) movePill(current);
};
links.forEach((a) => a.addEventListener('mouseenter', () => { hovering = true; movePill(a); }));
nav.addEventListener('mouseleave', () => { hovering = false; spy(); });

// About heading lights up word by word as it scrolls through the viewport.
const statement = document.getElementById('statement')!;
const walker = document.createTreeWalker(statement, NodeFilter.SHOW_TEXT);
const textNodes: Text[] = [];
while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
textNodes.forEach((node) => {
  const frag = document.createDocumentFragment();
  node.data.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) { frag.append(part); return; }
    const w = document.createElement('span');
    w.className = 'w';
    w.textContent = part;
    frag.append(w);
  });
  node.replaceWith(frag);
});
const words = [...statement.querySelectorAll<HTMLElement>('.w')];
const timeline = document.getElementById('timeline')!;

const onScroll = () => {
  const r = statement.getBoundingClientRect();
  const lit = motionOK ? Math.round(clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35)) * words.length) : words.length;
  words.forEach((w, k) => w.classList.toggle('lit', k < lit));
  if (motionOK) {
    const t = timeline.getBoundingClientRect();
    timeline.style.setProperty('--p', String(clamp((innerHeight * .7 - t.top) / t.height)));
  }
  spy();
};
let ticking = false;
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }
}, { passive: true });
addEventListener('resize', onScroll);
onScroll();

if (finePointer && motionOK) {
  // Terminal slab tilts toward the pointer.
  const slab = document.getElementById('slab')!;
  hero.addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    slab.style.setProperty('--ty', `${-10 + x * 16}deg`);
    slab.style.setProperty('--tx', `${5 - y * 12}deg`);
  });
  hero.addEventListener('pointerleave', () => { slab.style.removeProperty('--tx'); slab.style.removeProperty('--ty'); });

  // Project cards: spotlight follows the pointer and the card tilts in 3D.
  document.querySelectorAll<HTMLElement>('#project-grid .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--rx', `${(.5 - y) * 7}deg`);
      card.style.setProperty('--ry', `${(x - .5) * 9}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });

  // Contact heading turns with the pointer.
  const contact = document.getElementById('contact')!;
  const big = contact.querySelector<HTMLElement>('.big')!;
  contact.addEventListener('pointermove', (e) => {
    const r = contact.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    big.style.setProperty('--cy', `${x * 22}deg`);
    big.style.setProperty('--cx', `${-y * 18 + 4}deg`);
  });
  contact.addEventListener('pointerleave', () => { big.style.removeProperty('--cx'); big.style.removeProperty('--cy'); });
}
