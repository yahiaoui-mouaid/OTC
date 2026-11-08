import { forwardRef, useMemo } from 'react';
import { genesFor, TOOL_COLOR, type Genes, type Tool } from '../lib/bot';
import { HEAD, STEM } from '../lib/otto';

const PLATE = 'var(--bot-plate)';
const EYE = 'var(--bot-eye)';
const INK = 'var(--bot-ink)';

function Antenna({ g, c }: { g: Genes; c: string }) {
  switch (g.antenna) {
    case 'twin': return <g stroke={c} strokeWidth="7" strokeLinecap="round" fill="none"><path d="M78 44 62 14M122 44l16-30" /><circle cx="60" cy="10" r="8" fill={EYE} stroke="none" /><circle cx="140" cy="10" r="8" fill={EYE} stroke="none" /></g>;
    case 'ring': return <g><rect x="96" y="22" width="8" height="24" fill={c} /><circle cx="100" cy="16" r="12" fill="none" stroke={EYE} strokeWidth="7" /></g>;
    case 'bolt': return <path d="M106 2 86 28h13l-6 18 22-28h-13z" fill={EYE} />;
    default: return <g transform="translate(40 40) scale(.24)"><path d={STEM} fill={EYE} /><circle cx="250" cy="-74" r="38" fill={EYE} /></g>;
  }
}

function Head({ g, c }: { g: Genes; c: string }) {
  switch (g.head) {
    case 'dome': return <><path d="M42 132V100a58 58 0 0 1 116 0v32z" fill={c} /><rect x="60" y="82" width="80" height="40" rx="16" fill={PLATE} /></>;
    case 'box': return <><rect x="46" y="44" width="108" height="88" rx="16" fill={c} /><rect x="60" y="62" width="80" height="54" rx="12" fill={PLATE} /></>;
    case 'wide': return <><rect x="24" y="54" width="152" height="78" rx="36" fill={c} /><rect x="46" y="70" width="108" height="46" rx="22" fill={PLATE} /></>;
    default: return <><rect x="64" y="62" width="72" height="62" fill={PLATE} /><g transform="translate(40 40) scale(.24)"><path d={HEAD} fill={c} /></g><rect x="64" y="124" width="72" height="10" rx="5" fill={c} /></>;
  }
}

function Eyes({ g }: { g: Genes }) {
  const y = g.head === 'dome' ? 102 : g.head === 'wide' ? 93 : g.head === 'box' ? 89 : 96;
  switch (g.eyes) {
    case 'visor': return <rect x="72" y={y - 7} width="56" height="14" rx="7" fill={EYE} />;
    case 'cyclops': return <circle cx="100" cy={y} r="13" fill={EYE} />;
    case 'pixels': return <><rect x="74" y={y - 8} width="16" height="16" fill={EYE} /><rect x="110" y={y - 8} width="16" height="16" fill={EYE} /></>;
    case 'wink': return <><circle cx="82" cy={y} r="8" fill={EYE} /><path d={`M108 ${y}h18`} stroke={EYE} strokeWidth="6" strokeLinecap="round" /></>;
    default: return <><circle cx="82" cy={y} r="8" fill={EYE} /><circle cx="118" cy={y} r="8" fill={EYE} /></>;
  }
}

function Arms({ g, c }: { g: Genes; c: string }) {
  const d = g.arms === 'up' ? 'M58 158Q26 150 24 116M142 158q32-8 34-42' : g.arms === 'out' ? 'M58 160H16M142 160h42' : 'M58 156q-26 8-28 50M142 156q26 8 28 50';
  return <path className={g.arms === 'up' ? 'bot__wave' : undefined} d={d} stroke={c} strokeWidth="14" strokeLinecap="round" fill="none" />;
}

function Torso({ g, c }: { g: Genes; c: string }) {
  switch (g.torso) {
    case 'barrel': return <rect x="56" y="136" width="88" height="86" rx="30" fill={c} />;
    case 'core': return <circle cx="100" cy="178" r="46" fill={c} />;
    case 'taper': return <path d="M54 150a14 14 0 0 1 14-14h64a14 14 0 0 1 14 14l-12 60a14 14 0 0 1-14 12H80a14 14 0 0 1-14-12z" fill={c} />;
    default: return <path d="M76 132h48a12 12 0 0 1 0 24 12 12 0 0 0-12 12v24a12 12 0 0 0 12 12 12 12 0 0 1 12 12 12 12 0 0 0 12 12H52a12 12 0 0 0 12-12 12 12 0 0 1 12-12 12 12 0 0 0 12-12v-24a12 12 0 0 0-12-12 12 12 0 0 1 0-24z" fill={c} />;
  }
}

function Base({ g, c }: { g: Genes; c: string }) {
  switch (g.base) {
    case 'wheels': return <><rect x="50" y="222" width="100" height="16" rx="8" fill={c} /><circle cx="66" cy="262" r="28" fill={c} /><circle cx="134" cy="262" r="28" fill={c} /><circle cx="66" cy="262" r="11" fill={PLATE} /><circle cx="134" cy="262" r="11" fill={PLATE} /></>;
    case 'tracks': return <><rect x="70" y="218" width="60" height="30" fill={c} /><rect x="34" y="238" width="132" height="52" rx="26" fill={c} />{[62, 100, 138].map((x) => <circle key={x} cx={x} cy="264" r="11" fill={PLATE} />)}</>;
    case 'hover': return <><rect x="78" y="218" width="44" height="26" fill={c} /><rect x="44" y="238" width="112" height="24" rx="12" fill={c} /><g className="bot__jets" fill={EYE}><rect x="60" y="270" width="22" height="8" rx="4" /><rect x="89" y="270" width="22" height="8" rx="4" /><rect x="118" y="270" width="22" height="8" rx="4" /></g></>;
    default: return <><rect x="62" y="216" width="26" height="74" rx="13" fill={c} /><rect x="112" y="216" width="26" height="74" rx="13" fill={c} /></>;
  }
}

function Badge({ tool, g }: { tool: Tool; g: Genes }) {
  const y = g.torso === 'spine' ? 176 : 178;
  const stroke = { stroke: INK, strokeWidth: 3.6, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <g transform={`translate(100 ${y})`}>
      <circle r="21" fill={PLATE} />
      {tool === 'tech' && <path {...stroke} d="M7-10a7 7 0 0 0-9 9L-11 8l3 3 9-9a7 7 0 0 0 9-9l-5 4-3-3z" />}
      {tool === 'cs' && <path {...stroke} d="M-6-8-13 0l7 8M6-8l7 8-7 8" />}
      {tool === 'sm' && <g {...stroke}><rect x="-12" y="-8" width="24" height="17" rx="4" /><circle cy="0.5" r="4.5" /></g>}
      {tool === 'hr' && <path fill={EYE} d="M0 11-9 2a5.6 5.6 0 0 1 8-8l1 1 1-1a5.6 5.6 0 0 1 8 8z" />}
      {tool === 'logistics' && <g {...stroke}><rect x="-10" y="-10" width="20" height="20" rx="3" /><path d="M-10-2h20M-3-2v5h6v-5" /></g>}
      {tool === 'board' && <path fill={EYE} d="m0-12 3.6 7.4 8.1 1.1-5.9 5.7 1.4 8.1L0 6.5-7.2 10.3l1.4-8.1-5.9-5.7 8.1-1.1z" />}
      {tool === 'spark' && <path fill={EYE} d="M0-13 3 -3l10 3-10 3-3 10-3-10-10-3 10-3z" />}
    </g>
  );
}

// Directory portrait: same framing and colour for everyone. Only the face changes with the name.
export function BotAvatar({ name }: { name: string }) {
  const g = useMemo(() => genesFor(name), [name]);
  const c = '#04202B';
  return (
    <span className="avatar" aria-hidden="true">
      <svg viewBox="0 -4 200 200">
        <path d="M28 196v-20a36 36 0 0 1 36-36h72a36 36 0 0 1 36 36v20z" fill={c} />
        <rect x="86" y="126" width="28" height="20" fill={c} />
        <Head g={g} c={c} />
        <Antenna g={g} c={c} />
        <g data-eyes><Eyes g={g} /></g>
      </svg>
    </span>
  );
}

type Props = { name: string; tool: Tool; stage?: number; title?: string; className?: string };

// stage 0-4 reveals parts in build order: base, torso, head, antenna and eyes.
export const Bot = forwardRef<SVGSVGElement, Props>(function Bot({ name, tool, stage = 4, title, className }, ref) {
  const g = useMemo(() => genesFor(name), [name]);
  const c = TOOL_COLOR[tool];
  const op = (n: number) => (stage >= n ? 1 : 0.14);
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" className={`bot ${className ?? ''}`} viewBox="0 0 200 290" width="700" height="1015" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g className="bot__part" opacity={op(1)}><Base g={g} c={c} /></g>
      <g className="bot__part" opacity={op(2)}><Arms g={g} c={c} /><Torso g={g} c={c} /><Badge tool={tool} g={g} /></g>
      <g className="bot__part" opacity={op(3)}><Head g={g} c={c} /></g>
      <g className="bot__part" opacity={op(4)}><Antenna g={g} c={c} /><g data-eyes><Eyes g={g} /></g></g>
    </svg>
  );
});
