// Project case-study diagrams: render the Mermaid source with the site palette, then animate it.
// Build-in follows the flow from the entry node, packets keep moving along each edge, and hovering
// or focusing a node traces its connections. The diagram source in projects.ts is never changed.
import { motionOK } from './site';

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  run: (opts: { nodes: Element[] }) => Promise<void>;
};
type Edge = { el: SVGPathElement; from: string; to: string; label?: SVGGElement; len: number; marker: string | null; pkt: SVGGElement; last: number; start: number; timer?: number };
type Node = { id: string; el: SVGGElement; label: string; ins: Edge[]; outs: Edge[]; hitTimer?: number };
type Model = { svg: SVGSVGElement; nodes: Map<string, Node>; edges: Edge[]; level: Map<string, number>; depth: number; flowFrom: number; settle?: number };

const NS = 'http://www.w3.org/2000/svg';
const STEP = 520;
const PERIOD = 2400;
const HINT = 'Hover, tap or tab to a node to trace its connections.';

const card = document.getElementById('dia');
const holder = document.getElementById('diagram');
const meta = document.getElementById('dia-meta');
const readout = document.getElementById('dia-readout');
const replayButton = document.getElementById('dia-replay');
const pauseButton = document.getElementById('dia-pause');

let model: Model | null = null;
let pinned: Node | null = null;
let paused = false;
let seen = false;

const mermaidReady = () => new Promise<MermaidApi>((resolve) => {
  const get = () => (window as unknown as { mermaid?: MermaidApi }).mermaid;
  if (get()) return resolve(get()!);
  addEventListener('load', () => { if (get()) resolve(get()!); }, { once: true });
});

async function render(intro: boolean) {
  if (!card || !holder) return;
  const mermaid = await mermaidReady();
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const pre = document.createElement('pre');
  pre.className = 'mermaid';
  pre.textContent = holder.dataset.source ?? '';
  holder.replaceChildren(pre);
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
      fontSize: '18px',
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      background: v('--panel'),
      primaryColor: v('--panel-2'),
      primaryTextColor: v('--fg'),
      primaryBorderColor: v('--signal'),
      secondaryColor: v('--panel-2'),
      tertiaryColor: v('--panel'),
      lineColor: v('--muted'),
      textColor: v('--fg'),
      edgeLabelBackground: v('--panel'),
      clusterBkg: v('--panel-2'),
      clusterBorder: v('--line'),
    },
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });
  await mermaid.run({ nodes: [pre] });
  const svg = holder.querySelector('svg');
  if (!svg) return;
  model = build(svg, holder.dataset.source ?? '');
  holder.scrollLeft = 0;
  updateFade();
  pinned = null;
  focus(null);
  if (meta) meta.innerHTML = `flowchart · <b>${model.nodes.size}</b> nodes · <b>${model.edges.length}</b> edges`;
  if (!motionOK) return;
  if (!seen) hide(model);
  else if (intro) assemble(model);
  else model.flowFrom = performance.now();
}

function build(svg: SVGSVGElement, source: string): Model {
  const dataStores = new Set([...source.matchAll(/(\w+)\[\(/g)].map((m) => m[1]));
  const nodes = new Map<string, Node>();
  svg.querySelectorAll<SVGGElement>('g.node').forEach((el) => {
    const id = el.id.match(/flowchart-(\w+?)-\d+$/)?.[1];
    if (!id) return;
    const label = el.textContent?.trim() ?? id;
    nodes.set(id, { id, el, label, ins: [], outs: [] });
    if (dataStores.has(id)) el.classList.add('db');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', label);
  });

  // Fit the viewBox to what was actually drawn; Mermaid's own box can come out oversized
  // depending on when fonts finish loading.
  const box = svg.getBBox();
  if (box.width && box.height) svg.setAttribute('viewBox', `${box.x - 8} ${box.y - 8} ${box.width + 16} ${box.height + 16}`);
  // Draw at a readable size (labels about 12px) and let wide diagrams scroll instead of shrinking.
  if (box.width) svg.style.width = `${Math.round((box.width + 16) * (innerWidth < 700 ? .56 : .66))}px`;

  // Packets sit under the nodes so they slide in and out of them.
  const nodeLayer = svg.querySelector('g.nodes');
  const packetLayer = document.createElementNS(NS, 'g');
  nodeLayer?.parentNode?.insertBefore(packetLayer, nodeLayer);

  const labels = [...svg.querySelectorAll<SVGGElement>('g.edgeLabels > g')];
  const edges: Edge[] = [];
  svg.querySelectorAll<SVGPathElement>('path.flowchart-link').forEach((el, i) => {
    const m = el.id.match(/^L[_-](\w+?)[_-](\w+?)[_-]\d+$/);
    if (!m || !nodes.has(m[1]) || !nodes.has(m[2])) return;
    const pkt = document.createElementNS(NS, 'g') as SVGGElement;
    pkt.setAttribute('class', 'pkt-g');
    pkt.style.opacity = '0';
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('r', '9');
    glow.setAttribute('class', 'pkt-glow');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '4');
    dot.setAttribute('class', 'pkt');
    pkt.append(glow, dot);
    packetLayer.append(pkt);
    const edge: Edge = { el, from: m[1], to: m[2], label: labels[i], len: el.getTotalLength(), marker: el.getAttribute('marker-end'), pkt, last: 0, start: 0 };
    edges.push(edge);
    nodes.get(edge.from)!.outs.push(edge);
    nodes.get(edge.to)!.ins.push(edge);
  });

  // Breadth-first levels from the entry nodes set the build-in and packet order.
  const level = new Map<string, number>();
  const roots = [...nodes.values()].filter((n) => !n.ins.length);
  const queue = (roots.length ? roots : [...nodes.values()].slice(0, 1)).map((n) => { level.set(n.id, 0); return n.id; });
  while (queue.length) {
    const id = queue.shift()!;
    nodes.get(id)!.outs.forEach((e) => { if (!level.has(e.to)) { level.set(e.to, level.get(id)! + 1); queue.push(e.to); } });
  }
  nodes.forEach((n) => { if (!level.has(n.id)) level.set(n.id, 0); });

  const result: Model = { svg, nodes, edges, level, depth: Math.max(0, ...level.values()) + 1, flowFrom: Infinity };
  nodes.forEach((n) => {
    const show = () => focus(n);
    const restore = () => { if (pinned !== n) focus(pinned); };
    n.el.addEventListener('pointerenter', show);
    n.el.addEventListener('focus', show);
    n.el.addEventListener('pointerleave', restore);
    n.el.addEventListener('blur', restore);
    n.el.addEventListener('click', (ev) => { ev.stopPropagation(); pinned = pinned === n ? null : n; focus(pinned ?? n); });
    n.el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); n.el.dispatchEvent(new MouseEvent('click')); }
      if (ev.key === 'Escape') { pinned = null; focus(null); }
    });
  });
  svg.addEventListener('click', () => { pinned = null; focus(null); });
  return result;
}

function focus(n: Node | null) {
  if (!model || !card || !readout) return;
  card.classList.toggle('focus', Boolean(n));
  model.nodes.forEach((x) => x.el.classList.remove('self', 'near'));
  model.edges.forEach((e) => { e.el.classList.remove('on'); e.label?.classList.remove('on'); e.pkt.classList.remove('on'); });
  if (!n) { readout.textContent = HINT; return; }
  n.el.classList.add('self');
  [...n.ins, ...n.outs].forEach((e) => {
    e.el.classList.add('on');
    e.label?.classList.add('on');
    e.pkt.classList.add('on');
    model!.nodes.get(e.from)!.el.classList.add('near');
    model!.nodes.get(e.to)!.el.classList.add('near');
  });
  const names = (ids: string[]) => [...new Set(ids.map((id) => model!.nodes.get(id)!.label))].join(', ') || 'none';
  readout.textContent = '';
  const name = document.createElement('b');
  name.textContent = n.label;
  readout.append(name, ` · in: ${names(n.ins.map((e) => e.from))} · out: ${names(n.outs.map((e) => e.to))}${pinned === n ? ' · pinned' : ''}`);
}

// Hidden starting state, used while the diagram is still below the fold.
function hide(m: Model) {
  card!.classList.add('seq');
  card!.classList.remove('built');
  m.edges.forEach((e) => {
    e.el.style.transition = 'none';
    e.el.style.strokeDasharray = String(e.len);
    e.el.style.strokeDashoffset = String(e.len);
    e.el.removeAttribute('marker-end');
  });
}

function assemble(m: Model) {
  hide(m);
  m.nodes.forEach((n) => { n.el.style.transitionDelay = `${m.level.get(n.id)! * STEP}ms`; });
  m.edges.forEach((e) => {
    e.start = m.level.get(e.from)! * STEP + 260;
    if (e.label) e.label.style.transitionDelay = `${e.start + 260}ms`;
    clearTimeout(e.timer);
    e.timer = window.setTimeout(() => { if (e.marker) e.el.setAttribute('marker-end', e.marker); }, e.start + 560);
  });
  m.svg.getBoundingClientRect();
  requestAnimationFrame(() => {
    card!.classList.add('built');
    m.edges.forEach((e) => {
      e.el.style.transition = '';
      e.el.style.transitionDelay = `${e.start}ms`;
      e.el.style.strokeDashoffset = '0';
    });
  });
  m.flowFrom = performance.now() + m.depth * STEP + 400;
  // Once built, clear the per-element delays so hover states respond immediately.
  clearTimeout(m.settle);
  m.settle = window.setTimeout(() => {
    m.nodes.forEach((n) => { n.el.style.transitionDelay = ''; });
    m.edges.forEach((e) => {
      e.el.style.transitionDelay = '';
      e.el.style.strokeDasharray = '';
      e.el.style.strokeDashoffset = '';
      if (e.label) e.label.style.transitionDelay = '';
    });
  }, m.depth * STEP + 900);
}

// Fade whichever edge has more diagram to scroll to.
function updateFade() {
  if (!holder) return;
  const left = holder.scrollLeft > 4;
  const right = holder.scrollWidth - holder.clientWidth - holder.scrollLeft > 4;
  holder.classList.toggle('more-left', left);
  holder.classList.toggle('more-right', right);
}

let visible = false;
function tick(now: number) {
  const m = model;
  if (m && visible && !paused && now > m.flowFrom) {
    const t = (now - m.flowFrom) / PERIOD;
    m.edges.forEach((e) => {
      const phase = (((t - m.level.get(e.from)! * .22) % 1) + 1) % 1;
      const p = e.el.getPointAtLength(phase * e.len);
      for (const c of e.pkt.children) { c.setAttribute('cx', String(p.x)); c.setAttribute('cy', String(p.y)); }
      e.pkt.style.opacity = String(phase < .08 ? phase / .08 : phase > .9 ? (1 - phase) / .1 : 1);
      if (phase < e.last) {
        const target = m.nodes.get(e.to)!;
        target.el.classList.add('hit');
        clearTimeout(target.hitTimer);
        target.hitTimer = window.setTimeout(() => target.el.classList.remove('hit'), 380);
      }
      e.last = phase;
    });
  }
  requestAnimationFrame(tick);
}

if (card && holder) {
  if (!motionOK && pauseButton) pauseButton.hidden = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !seen && entry.intersectionRatio >= .3) {
      seen = true;
      if (model && motionOK) assemble(model);
    }
  }, { threshold: [0, .3] }).observe(card);
  replayButton?.addEventListener('click', () => { if (model && motionOK) assemble(model); });
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    const text = pauseButton.querySelector('span');
    if (text) text.textContent = paused ? 'Resume flow' : 'Pause flow';
  });
  document.addEventListener('themechange', () => { render(false); });
  holder.addEventListener('scroll', updateFade, { passive: true });
  addEventListener('resize', updateFade);
  render(true);
  if (motionOK) requestAnimationFrame(tick);
}
