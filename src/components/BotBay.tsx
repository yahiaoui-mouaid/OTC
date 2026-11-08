import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CREW, type Member, type Team } from '../content/crew';
import { describe, downloadBot, genesFor, type Tool } from '../lib/bot';
import { Bot } from './Bot';
import { ext, useEyes } from './Chrome';

type Pick = { member: Member; team: Team };
const FIELDS: readonly [Tool, string][] = [['tech', 'Robotics'], ['cs', 'Computer science'], ['spark', 'Innovation']];
const KEY = 'otc-my-bot';

export function BotBay() {
  const root = useRef<HTMLDivElement>(null);
  useEyes(root);
  const reduce = useReducedMotion();
  const first: Pick = { member: CREW[0].members[0], team: CREW[0] };
  const [pick, setPick] = useState<Pick>(first);
  const g = genesFor(pick.member[0]);

  return (
    <div className="bay" ref={root}>
      <aside className="bay__detail" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pick.member[0]} className="spec" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.16 }}>
            <Bot name={pick.member[0]} tool={pick.team.key} className="spec__bot" />
            <div className="spec__text">
              <p className="spec__serial">{g.serial}</p>
              <h3>{pick.member[0]}</h3>
              <p className="spec__role">{pick.member[1]}{pick.team.key === 'board' ? '' : `, ${pick.team.title}`}</p>
              <p className="spec__genes">Built with {describe(g)}.</p>
              {pick.member[2] && <a className="spec__link" href={pick.member[2]} {...ext} aria-label={`${pick.member[0]} on LinkedIn`}>LinkedIn</a>}
            </div>
          </motion.div>
        </AnimatePresence>
      </aside>
      <div className="bay__shelves">
        {CREW.map((team) => (
          <section className={`shelf shelf--${team.key}`} key={team.key} aria-label={`${team.title} team`}>
            <ul className="shelf__bots">
              {team.members.map((m) => (
                <li key={m[0]}>
                  <button type="button" className="unit" aria-pressed={pick.member[0] === m[0]} onClick={() => setPick({ member: m, team })}>
                    <Bot name={m[0]} tool={team.key} className="unit__bot" />
                    <span className="unit__name">{m[0]}</span>
                    <span className="unit__role">{m[1]}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="shelf__rail" />
            <h3>{team.title}</h3>
            <p>{team.desc}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function BotBuilder() {
  const root = useRef<HTMLDivElement>(null);
  useEyes(root, 7);
  const svg = useRef<SVGSVGElement>(null);
  const [name, setName] = useState('');
  const [tool, setTool] = useState<Tool>('tech');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) ?? 'null'); if (s) { setName(s.name); setTool(s.tool); } } catch {}
  }, []);
  useEffect(() => { try { if (name.trim()) localStorage.setItem(KEY, JSON.stringify({ name, tool })); } catch {} }, [name, tool]);

  const shown = name.trim();
  const genes = useMemo(() => genesFor(shown || 'One Tech Crew'), [shown]);

  const save = async () => {
    if (!svg.current || !shown) return;
    try { await downloadBot(svg.current, shown, genes.serial); setSaved('Saved. Share it and tag @one_tech_crew.'); }
    catch { setSaved('Your bot could not be saved. Try again.'); }
  };

  return (
    <div className="builder wrap" ref={root}>
      <div className="builder__copy">
        <h2>Now build yours</h2>
        <p>Type your name. The same name always builds the same robot.</p>
        <label className="builder__label" htmlFor="bot-name">Your name</label>
        <input id="bot-name" className="builder__input" type="text" maxLength={40} autoComplete="off" placeholder="Your name" value={name} onChange={(e) => { setName(e.target.value); setSaved(''); }} />
        <fieldset className="builder__fields">
          <legend>What would you build?</legend>
          {FIELDS.map(([t, label]) => (
            <label key={t} className="chip"><input type="radio" name="bot-field" checked={tool === t} onChange={() => setTool(t)} /><span>{label}</span></label>
          ))}
        </fieldset>
        <button className="btn" type="button" disabled={!shown} onClick={save}>Download my bot</button>
        <p className="builder__note" role="status">{saved || (shown ? `${genes.serial}: ${describe(genes)}.` : 'Your name stays on this device.')}</p>
      </div>
      <div className="builder__stage">
        <Bot ref={svg} name={shown || 'One Tech Crew'} tool={tool} stage={shown ? 4 : 0} title={shown ? `Robot built from the name ${shown}` : 'An unbuilt robot waiting for a name'} className="builder__bot" />
      </div>
    </div>
  );
}
