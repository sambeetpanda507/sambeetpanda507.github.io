// Small canvas-based 3D helpers (no library): perspective projection, theme colours and the embedding field.
import { motionOK, finePointer } from './site';

type Palette = Record<'fg' | 'muted' | 'faint' | 'line' | 'signal' | 'hot' | 'ok' | 'panel' | 'panel2', string>;

const readPalette = (): Palette => {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { fg: v('--fg'), muted: v('--muted'), faint: v('--faint'), line: v('--line'), signal: v('--signal'), hot: v('--hot'), ok: v('--ok'), panel: v('--panel'), panel2: v('--panel-2') };
};
export let palette = readPalette();
document.addEventListener('themechange', () => { palette = readPalette(); });

export const fitCanvas = (cv: HTMLCanvasElement) => {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: r.width, h: r.height };
};

export type Projected = { x: number; y: number; k: number; z: number };

export const projector = (yaw: number, pitch: number, dist: number, unit: number, cx: number, cy: number) => {
  const a = Math.cos(yaw), b = Math.sin(yaw), c = Math.cos(pitch), d = Math.sin(pitch);
  return (x: number, y: number, z: number): Projected => {
    const X = x * a - z * b, Z1 = x * b + z * a;
    const Y = y * c - Z1 * d, Z = y * d + Z1 * c;
    const k = dist / (dist + Z);
    return { x: cx + X * unit * k, y: cy - Y * unit * k, k, z: Z };
  };
};

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const gauss = (r: () => number) => {
  let u = 0, v = 0;
  while (!u) u = r();
  while (!v) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const whileVisible = (el: Element, onChange: (visible: boolean) => void) =>
  new IntersectionObserver(([entry]) => onChange(entry.isIntersecting)).observe(el);

/** A slowly rotating cloud of clustered points, drawn behind a hero. Purely decorative. */
export function embeddingField(cv: HTMLCanvasElement, host: HTMLElement, { centerX = .7 } = {}) {
  const rand = seeded(7);
  const small = innerWidth < 700;
  const count = small ? 420 : 950;
  const centers: number[][] = [];
  for (let c = 0; c < 7; c++) {
    const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
    centers.push([Math.sin(ph) * Math.cos(th) * 1.15, Math.cos(ph) * 1.15, Math.sin(ph) * Math.sin(th) * 1.15]);
  }
  const pts = Array.from({ length: count }, (_, i) => {
    const noise = rand() < .14, c = centers[i % 7], spread = noise ? 1.2 : .26;
    return {
      x: (noise ? 0 : c[0]) + gauss(rand) * spread,
      y: (noise ? 0 : c[1]) + gauss(rand) * spread * .8,
      z: (noise ? 0 : c[2]) + gauss(rand) * spread,
      tone: rand() < .16 ? 1 : rand() < .03 ? 2 : 0,
      cluster: i % 7,
    };
  });
  const links: [number, number][] = [];
  for (let i = 0; i < pts.length && links.length < 46; i++) {
    if (pts[i].tone !== 1) continue;
    let best = -1, bestD = 9;
    for (let j = 0; j < pts.length; j++) {
      if (j === i || pts[j].cluster !== pts[i].cluster) continue;
      const d = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2 + (pts[i].z - pts[j].z) ** 2;
      if (d < bestD) { bestD = d; best = j; }
    }
    if (best >= 0) links.push([i, best]);
  }

  let targetX = 0, targetY = 0, mx = 0, my = 0, running = true;
  if (finePointer) addEventListener('pointermove', (e) => { targetX = e.clientX / innerWidth * 2 - 1; targetY = e.clientY / innerHeight * 2 - 1; });

  const draw = (now: number) => {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    mx += (targetX - mx) * .04; my += (targetY - my) * .04;
    const P = projector((motionOK ? now * .00005 : .6) + mx * .45 + scrollY * .0009, .32 + my * .18, 4.2,
      Math.min(w, h) * (small ? .34 : .3), w * (w > 1020 ? centerX : .5), h * .5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = palette.signal;
    for (const [a, b] of links) {
      const A = P(pts[a].x, pts[a].y, pts[a].z), B = P(pts[b].x, pts[b].y, pts[b].z);
      ctx.globalAlpha = .28 * Math.min(A.k, B.k);
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    pts.map((p) => ({ p, q: P(p.x, p.y, p.z) }))
      .sort((a, b) => b.q.z - a.q.z)
      .forEach(({ p, q }) => {
        const depth = Math.max(0, Math.min(1, (q.k - .7) / .6));
        ctx.globalAlpha = .18 + depth * .62;
        ctx.fillStyle = p.tone === 1 ? palette.signal : p.tone === 2 ? palette.hot : palette.faint;
        ctx.beginPath(); ctx.arc(q.x, q.y, (p.tone ? 1.9 : 1.3) * q.k * (small ? 1 : 1.15), 0, Math.PI * 2); ctx.fill();
      });
    ctx.globalAlpha = 1;
    if (motionOK && running) requestAnimationFrame(draw);
  };

  whileVisible(host, (visible) => {
    const was = running;
    running = visible;
    if (visible && !was && motionOK) requestAnimationFrame(draw);
  });
  document.addEventListener('themechange', () => { if (!motionOK) requestAnimationFrame(draw); });
  addEventListener('resize', () => { if (!motionOK) requestAnimationFrame(draw); });
  requestAnimationFrame(draw);
}
