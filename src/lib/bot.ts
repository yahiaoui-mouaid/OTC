// Name -> robot. The same name always builds the same robot.
export type Tool = 'board' | 'tech' | 'cs' | 'sm' | 'hr' | 'logistics' | 'spark';

const HEADS = ['otto', 'dome', 'box', 'wide'] as const;
const EYES = ['dots', 'visor', 'cyclops', 'pixels', 'wink'] as const;
const ANTENNAS = ['ball', 'twin', 'ring', 'bolt'] as const;
const TORSOS = ['spine', 'barrel', 'core', 'taper'] as const;
const BASES = ['legs', 'wheels', 'tracks', 'hover'] as const;
const ARMS = ['down', 'out', 'up'] as const;

export type Genes = {
  head: (typeof HEADS)[number];
  eyes: (typeof EYES)[number];
  antenna: (typeof ANTENNAS)[number];
  torso: (typeof TORSOS)[number];
  base: (typeof BASES)[number];
  arms: (typeof ARMS)[number];
  serial: string;
};

function hash(s: string) {
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genesFor(name: string): Genes {
  const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const seed = hash(clean);
  const r = prng(seed);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)];
  return {
    head: pick(HEADS), eyes: pick(EYES), antenna: pick(ANTENNAS),
    torso: pick(TORSOS), base: pick(BASES), arms: pick(ARMS),
    serial: 'OTC-' + seed.toString(16).toUpperCase().padStart(8, '0').slice(0, 4),
  };
}

const WORDS = {
  head: { otto: 'OTTO head', dome: 'dome head', box: 'box head', wide: 'wide head' },
  eyes: { dots: 'dot eyes', visor: 'visor', cyclops: 'single eye', pixels: 'pixel eyes', wink: 'a permanent wink' },
  base: { legs: 'legs', wheels: 'wheels', tracks: 'tracks', hover: 'hover pads' },
} as const;

export function describe(g: Genes) {
  return `${WORDS.head[g.head]}, ${WORDS.eyes[g.eyes]} and ${WORDS.base[g.base]}`;
}

export const TOOL_COLOR: Record<Tool, string> = {
  board: 'var(--bot-board)',
  tech: '#1BAFD1',
  cs: '#3F74EA',
  sm: '#E5537A',
  hr: '#17B596',
  logistics: '#F0A21C',
  spark: '#1BAFD1',
};

export const toFile = (name: string) =>
  'otc-bot-' + (name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'crew') + '.png';

// Draw the live SVG onto a shareable square card.
export async function downloadBot(svg: SVGSVGElement, name: string, serial: string) {
  const dark = '#04202B';
  const css = getComputedStyle(document.documentElement).getPropertyValue('--bot-board');
  const markup = new XMLSerializer().serializeToString(svg)
    .replaceAll('var(--bot-plate)', '#FFFFFF')
    .replaceAll('var(--bot-board)', css.trim().startsWith('#') ? dark : dark)
    .replaceAll('var(--bot-eye)', '#E5537A')
    .replaceAll('var(--bot-ink)', dark);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  const img = new Image();
  img.width = 700; img.height = 1015;
  await new Promise<void>((ok, no) => { img.onload = () => ok(); img.onerror = () => no(new Error('render')); img.src = url; });
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1350;
  const x = c.getContext('2d')!;
  x.fillStyle = '#E7F6FA'; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(60, 60, 960, 930, 64); x.fill();
  x.drawImage(img, 235, 110, 610, 884);
  x.fillStyle = dark; x.font = '800 76px "Hubot Sans", sans-serif';
  x.fillText(name.trim().slice(0, 22), 60, 1110);
  x.font = '500 38px "Mona Sans", sans-serif';
  x.fillText(`${serial}, built by One Tech Crew`, 60, 1180);
  URL.revokeObjectURL(url);
  const a = document.createElement('a');
  a.download = toFile(name); a.href = c.toDataURL('image/png'); a.click();
}
