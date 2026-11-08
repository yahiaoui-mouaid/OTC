import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { INSTAGRAM, REGISTRATION_OPEN, SOCIALS } from '../content/config';
import { EYE_L, EYE_R, EYE_R_SIZE, BALL, HEAD, STANDING, STEM, VIEWBOX } from '../lib/otto';

export const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function Logo({ variant }: { variant: 'stacked' | 'horizontal' }) {
  const size = variant === 'stacked' ? { width: 1019, height: 700 } : { width: 1274, height: 543 };
  return <img className={`brand__logo brand__logo--${variant}`} src={`img/logo/otc-${variant}.svg`} alt="" {...size} />;
}

export function OttoFlat({ asleep = false, label }: { asleep?: boolean; label: string }) {
  return (
    <svg className="otto" viewBox={VIEWBOX} role="img" aria-label={label}>
      <path className="otto__body" d={STANDING} />
      <g className="otto__top">
        <g className="otto__antenna"><path d={STEM} /><circle cx={BALL[0]} cy={BALL[1]} r={BALL[2]} /></g>
        <path className="otto__head" d={HEAD} />
        <g className="otto__eyes" data-eyes>
          {asleep ? <><rect x="144" y="230" width="64" height="16" rx="8" /><rect x="292" y="230" width="64" height="16" rx="8" /></>
            : <><circle cx={EYE_L[0]} cy={EYE_L[1]} r={EYE_R_SIZE} /><circle cx={EYE_R[0]} cy={EYE_R[1]} r={EYE_R_SIZE} /></>}
        </g>
      </g>
    </svg>
  );
}

// Eyes of every robot inside `root` look at the pointer.
export function useEyes(root: React.RefObject<HTMLElement | null>, reach = 5) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let queued = false, px = 0, py = 0;
    const paint = () => {
      queued = false;
      root.current?.querySelectorAll<SVGGElement>('[data-eyes]').forEach((g) => {
        const b = g.getBoundingClientRect();
        if (b.bottom < 0 || b.top > innerHeight) return;
        const dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height / 2);
        const len = Math.hypot(dx, dy) || 1, pull = Math.min(len / 140, 1) * reach;
        g.style.transform = `translate(${(dx / len) * pull}px, ${(dy / len) * pull}px)`;
      });
    };
    const move = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!queued) { queued = true; requestAnimationFrame(paint); } };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, [root, reach]);
}

export function JoinButton({ open, closed, className = 'btn' }: { open: string; closed: string; className?: string }) {
  return REGISTRATION_OPEN ? <a className={className} href="register.html">{open}</a> : <a className={className} href={INSTAGRAM} {...ext}>{closed}</a>;
}

const LINKS = [['What we do', 'about'], ['Games', 'games'], ['Why join', 'benefits'], ['Crew', 'team'], ['Join', 'join']] as const;

export function Header({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [now, setNow] = useState('');
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? 'light');
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const f = () => setStuck(scrollY > 8);
    addEventListener('scroll', f, { passive: true }); f();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen((o) => { if (o) burger.current?.focus(); return false; }); } };
    document.addEventListener('keydown', k);
    return () => { removeEventListener('scroll', f); document.removeEventListener('keydown', k); };
  }, []);

  useEffect(() => {
    if (!home) return;
    const spy = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setNow(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
    LINKS.forEach(([, id]) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    return () => spy.disconnect();
  }, [home]);

  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => { flushSync(() => setTheme(next)); document.documentElement.dataset.theme = next; };
    try { localStorage.setItem('theme', next); } catch {}
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply); else apply();
  };

  return (
    <header className={`nav${stuck ? ' is-stuck' : ''}`}>
      <div className="wrap nav__in">
        <a className="brand" href="index.html" aria-label="One Tech Crew, home"><Logo variant="stacked" /></a>
        <button ref={burger} className="burger" type="button" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}><i /><i /><i /></button>
        <nav id="menu" className={`menu${open ? ' open' : ''}`} aria-label="Main">
          <ul className="menu__links">
            {LINKS.map(([t, id]) => <li key={id}><a href={home ? `#${id}` : `index.html#${id}`} aria-current={now === id ? 'true' : undefined} onClick={() => setOpen(false)}>{t}</a></li>)}
          </ul>
          <div className="menu__end">
            <button className="theme" type="button" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={theme === 'dark'} onClick={flip}>
              {theme === 'dark'
                ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>}
            </button>
            {home && <JoinButton open="Register" closed="Follow for updates" className="btn btn--sm" />}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="foot on-board">
      <div className="wrap foot__in">
        <a className="brand" href="index.html" aria-label="One Tech Crew, home"><Logo variant="horizontal" /></a>
        <nav aria-label="Social media"><ul className="foot__links">{SOCIALS.map(([t, u]) => <li key={t}><a href={u} {...ext}>{t}</a></li>)}</ul></nav>
        <p className="foot__copy">&copy; {new Date().getFullYear()} One Tech Crew. All rights reserved.</p>
      </div>
    </footer>
  );
}
