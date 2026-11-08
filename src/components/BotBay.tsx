import { useEffect, useMemo, useRef, useState } from 'react';
import { CREW, type Member } from '../content/crew';
import { describe, downloadBot, genesFor, type Tool } from '../lib/bot';
import { Bot, BotAvatar } from './Bot';
import { ext, useEyes } from './Chrome';

const FIELDS: readonly [Tool, string][] = [['tech', 'Robotics'], ['cs', 'Computer science'], ['spark', 'Innovation']];
const KEY = 'otc-my-bot';

function MemberCard({ member: [name, role, link] }: { member: Member }) {
  return (
    <li className="member">
      <BotAvatar name={name} />
      <div>
        <p className="member__name">{name}</p>
        <p className="member__role">{role}</p>
        {link && <a className="member__link" href={link} {...ext} aria-label={`${name} on LinkedIn`}>LinkedIn</a>}
      </div>
    </li>
  );
}

export function CrewDirectory() {
  const root = useRef<HTMLDivElement>(null);
  useEyes(root, 3);
  return (
    <div className="crew" ref={root}>
      {CREW.map((team) => (
        <section className={`crew__row${team.key === 'board' ? ' crew__row--board' : ''}`} key={team.key} aria-labelledby={`team-${team.key}`}>
          <div className="crew__team">
            <h3 id={`team-${team.key}`}>{team.title}</h3>
            <p>{team.desc}</p>
          </div>
          <ul className="crew__members">
            {team.members.map((m) => <MemberCard key={m[0]} member={m} />)}
          </ul>
        </section>
      ))}
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
