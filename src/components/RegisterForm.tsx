import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../content/config';
import { submitApplication, type Registration } from '../lib/api';
import { downloadBot, genesFor, type Tool } from '../lib/bot';
import { Bot } from './Bot';

const MIN = 40;
const DRAFT = 'otc-application-draft';
const EMPTY: Registration = {
  fullName: '', birthDate: '', email: '', phone: '',
  university: '', faculty: '', department: '', specialty: '', level: '', studentId: '',
  interests: [], csChoice: '', techChoice: '', socialChoice: '', logisticsChoice: '', firstTeam: '', secondTeam: '', skillLevel: '', skills: '',
  days: [], hours: '', laptop: '', heardFrom: '',
  motivation: '', goal: '', experience: '', discord: '', linkedin: '', portfolio: '',
  agreeRules: false, agreeData: false, photoOk: false,
};
type Key = keyof Registration;
const STEPS: Key[][] = [
  ['fullName', 'birthDate', 'email', 'phone'],
  ['university', 'faculty', 'department', 'specialty', 'level', 'studentId'],
  ['interests', 'csChoice', 'techChoice', 'socialChoice', 'logisticsChoice', 'firstTeam', 'secondTeam', 'skillLevel', 'skills'],
  ['days', 'hours', 'laptop', 'heardFrom'],
  ['motivation', 'goal', 'experience', 'discord', 'linkedin', 'portfolio', 'agreeRules', 'agreeData', 'photoOk'],
];
const NAMES = ['About you', 'Your studies', 'Your team', 'Your time', 'Tell us more'];
const LEVELS = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Engineering cycle', 'Other'];
const UNIVERSITIES = [
  'Batna 1 – Hadj Lakhdar',
  'Batna 2 – Ben Boulaïd',
  'Renewable Energies School',
  'Paramedical Institute',
  'Barika University Centre',
];
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HEARD = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'A friend', 'A university event', 'Other'];
const MAX_DEPARTMENTS = 3;
type Department = { id: string; label: string; desc: string; tool: Tool; key: 'csChoice' | 'techChoice' | 'socialChoice' | 'logisticsChoice'; options: string[] };
const DEPARTMENTS: Department[] = [
  { id: 'cs', label: 'CS', desc: 'Coding and software projects', tool: 'cs', key: 'csChoice', options: [
    '🌐 Web Development-front-end', '💻 Web Development backend', '🤖 AI / Machine Learning', '📊 Data Science', '🐍 Python', '🔐 Cybersecurity',
  ] },
  { id: 'tech', label: 'Tech (robotics)', desc: 'Robots, electronics and embedded projects', tool: 'tech', key: 'techChoice', options: [
    '🤖 Robot design and building', '🔌 Electronics and circuits', '⚙️ Arduino and embedded systems', '📡 Sensors and IoT', '🧠 Robot programming', '🖨️ 3D modelling and printing',
  ] },
  { id: 'social', label: 'Social media', desc: 'Content and the club’s online image', tool: 'sm', key: 'socialChoice', options: [
    '🎨 Graphic design', '🎬 Video editing', '📸 Photography', '✍️ Content writing', '📱 Social media management', '🎤 Presenting and voice-over',
  ] },
  { id: 'logistics', label: 'Logistics', desc: 'Equipment, venues and event preparation', tool: 'logistics', key: 'logisticsChoice', options: [
    '📦 Equipment and inventory', '🏛️ Venue booking', '📅 Event planning', '🚚 Transport and supplies', '🎪 On-site setup and coordination',
  ] },
];

const isUrl = (v: string) => { try { const u = new URL(v.trim()); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };
const ageOf = (iso: string) => (Date.now() - new Date(iso).getTime()) / 31557600000;

function validate(v: Registration) {
  const e: Partial<Record<Key, string>> = {};
  if (v.fullName.trim().length < 3) e.fullName = 'Enter your full name (at least 3 characters).';
  if (!v.birthDate || !(ageOf(v.birthDate) >= 15 && ageOf(v.birthDate) <= 80)) e.birthDate = 'Enter your date of birth.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email, for example name@example.com.';
  if (!/^(?:\+213|00213|0)[5-7]\d{8}$/.test(v.phone.replace(/[\s.-]/g, ''))) e.phone = 'Enter an Algerian mobile number, for example 0550 12 34 56.';
  if (!v.university) e.university = 'Choose your university.';
  if (!v.faculty.trim()) e.faculty = 'Enter your faculty.';
  if (!v.department.trim()) e.department = 'Enter your department.';
  if (!v.specialty.trim()) e.specialty = 'Enter your specialty.';
  if (!v.level) e.level = 'Choose your study level.';
  if (!v.studentId.trim()) e.studentId = 'Enter your student ID (matricule).';
  if (!v.interests.length) e.interests = 'Choose at least one department.';
  DEPARTMENTS.forEach((d) => { if (v.interests.includes(d.id) && !v[d.key]) e[d.key] = `Choose what you want to do in ${d.label}.`; });
  if (v.interests.length && !v.firstTeam) e.firstTeam = 'Choose the department you want most.';
  if (!v.skillLevel) e.skillLevel = 'Choose your current level.';
  if (!v.days.length) e.days = 'Choose at least one day.';
  if (!v.hours) e.hours = 'Choose how many hours you can give.';
  if (!v.laptop) e.laptop = 'Tell us if you have a laptop.';
  if (!v.heardFrom) e.heardFrom = 'Tell us how you heard about OTC.';
  if (v.motivation.trim().length < MIN) e.motivation = `Write at least ${MIN} characters about why you want to join.`;
  if (!v.goal.trim()) e.goal = 'Tell us what you hope to learn or build.';
  if (!/^@?[a-zA-Z0-9._]{2,32}$/.test(v.discord.trim())) e.discord = 'Enter your Discord username, for example sara_otc.';
  if (v.linkedin.trim() && !(isUrl(v.linkedin) && /linkedin\.com/i.test(v.linkedin))) e.linkedin = 'Enter a LinkedIn link, for example https://www.linkedin.com/in/your-name';
  if (v.portfolio.trim() && !isUrl(v.portfolio)) e.portfolio = 'Enter a full link starting with https://';
  if (!v.agreeRules) e.agreeRules = 'Accept the club rules to continue.';
  if (!v.agreeData) e.agreeData = 'Allow OTC to store your answers so we can process your registration.';
  return e;
}

export function Band() {
  return (
    <div className="page-hero__band on-otto"><div className="wrap page-hero__band-in">
      <p>While you wait, play a game the crew built.</p>
      <div className="actions"><a className="btn" href="games/robo-run/index.html">Play OTTO Run</a><a className="btn btn--ghost" href="games/robos-mission/index.html">Play OTTO’s Mission</a></div>
    </div></div>
  );
}

export function RegisterForm() {
  const [v, setV] = useState<Registration>(EMPTY);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [done, setDone] = useState<{ demo: boolean } | null>(null);
  const trap = useRef<HTMLInputElement>(null);
  const titles = useRef<(HTMLHeadingElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLElement>(null);
  const botRef = useRef<SVGSVGElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(DRAFT) ?? 'null');
      if (s?.values) {
        // Drop answers from older versions of the form that no longer fit its options.
        const kept: Registration = { ...EMPTY };
        (Object.keys(EMPTY) as Key[]).forEach((k) => { if (k in s.values) (kept as Record<Key, unknown>)[k] = s.values[k]; });
        kept.interests = kept.interests.filter((id) => DEPARTMENTS.some((d) => d.id === id)).slice(0, MAX_DEPARTMENTS);
        const labels = DEPARTMENTS.filter((d) => kept.interests.includes(d.id)).map((d) => d.label);
        if (!UNIVERSITIES.includes(kept.university)) kept.university = '';
        if (!LEVELS.includes(kept.level)) kept.level = '';
        if (!labels.includes(kept.firstTeam)) kept.firstTeam = '';
        if (!labels.includes(kept.secondTeam)) kept.secondTeam = '';
        setV(kept);
        setStep(Math.min(Math.max(s.step | 0, 0), STEPS.length - 1));
      }
    } catch {}
  }, []);
  useEffect(() => { if (done) return; try { if (v !== EMPTY) sessionStorage.setItem(DRAFT, JSON.stringify({ step, values: v })); } catch {} }, [v, step, done]);
  useEffect(() => { if (moved.current) { titles.current[step]?.focus({ preventScroll: true }); root.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); } }, [step]);
  useEffect(() => { if (done) { doneRef.current?.focus({ preventScroll: true }); root.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); } }, [done]);

  const errors = validate(v);
  const shown = (k: Key) => (checked.has(STEPS.findIndex((s) => s.includes(k))) ? errors[k] : undefined);
  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((o) => ({ ...o, [k]: e.target.value }));
  const go = (i: number) => { moved.current = true; setStatus(''); setStep(i); };
  const focusField = (k: string) => (document.getElementById(k) ?? document.querySelector<HTMLInputElement>(`input[name=${k}]`))?.focus();
  const toggleDay = (day: string, on: boolean) => setV((o) => ({ ...o, days: on ? [...o.days, day] : o.days.filter((x) => x !== day) }));
  const toggleDept = (d: Department, on: boolean) => setV((o) => {
    if (on && o.interests.length >= MAX_DEPARTMENTS) return o;
    const interests = on ? [...o.interests, d.id] : o.interests.filter((x) => x !== d.id);
    const labels = DEPARTMENTS.filter((x) => interests.includes(x.id)).map((x) => x.label);
    const firstTeam = labels.includes(o.firstTeam) ? o.firstTeam : labels.length === 1 ? labels[0] : '';
    const secondTeam = labels.includes(o.secondTeam) && o.secondTeam !== firstTeam ? o.secondTeam : '';
    return { ...o, interests, firstTeam, secondTeam, [d.key]: on ? o[d.key] : '' };
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setStatus('');
    setChecked((c) => new Set(c).add(step));
    const here = STEPS[step].find((k) => errors[k]);
    if (here) { setTimeout(() => focusField(here)); return; }
    if (step < STEPS.length - 1) { go(step + 1); return; }
    setSending(true);
    try {
      const interests = v.interests.map((i) => DEPARTMENTS.find((d) => d.id === i)?.label ?? i);
      const result = trap.current?.value ? { demo: false } : await submitApplication({ ...v, interests });
      try { sessionStorage.removeItem(DRAFT); } catch {}
      setDone(result);
    } catch (err) {
      setStatus(err instanceof Error && err.message === 'duplicate'
        ? 'This email is already registered. Message us on Instagram if you need to change your answers.'
        : 'Your registration was not sent. Check your connection, then select Send registration again. Your answers are still here.');
    } finally { setSending(false); }
  };

  const tool = DEPARTMENTS.find((d) => v.interests.includes(d.id))?.tool ?? 'spark';
  const chosenLabels = DEPARTMENTS.filter((d) => v.interests.includes(d.id)).map((d) => d.label);
  const botName = v.fullName.trim() || 'One Tech Crew';

  if (done) {
    const first = v.fullName.trim().split(' ')[0];
    return (
      <div className="regform" ref={root}>
        <section className="page-hero" ref={doneRef} tabIndex={-1} aria-labelledby="done-t">
          <div className="wrap page-hero__stage">
            <div className="page-hero__copy">
              <h1 id="done-t" className="page-hero__title">{done.demo ? 'Demo complete' : 'Registration received'}</h1>
              <p>{done.demo ? `Thanks, ${first}. This was a demo: your registration was NOT saved or sent to the club.` : `Thanks, ${first}. We received your registration and will contact you at ${v.email.trim()}.`}</p>
              <dl className="summary">
                <div><dt>Email</dt><dd>{v.email.trim()}</dd></div>
                <div><dt>Studies</dt><dd>{v.level}, {v.department.trim()}</dd></div>
                <div><dt>Top department</dt><dd>{v.firstTeam}</dd></div>
              </dl>
              <div className="actions">
                <button className="btn" type="button" onClick={() => botRef.current && downloadBot(botRef.current, v.fullName, genesFor(v.fullName).serial)}>Download my bot</button>
                <a className="btn btn--ghost" href="index.html">Back to home</a>
              </div>
            </div>
            <div className="page-hero__bot"><Bot ref={botRef} name={botName} tool={tool} title={`Robot built from the name ${first}`} /></div>
          </div>
          <Band />
        </section>
      </div>
    );
  }

  const F = ({ id, label, opt, hint, children }: { id: Key; label: string; opt?: boolean; hint?: string; children: React.ReactNode }) => (
    <div className={`field${shown(id) ? ' err' : ''}`}>
      <label htmlFor={id}>{label} {opt && <span className="hint">Optional</span>}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
      {shown(id) && <p className="ferr" id={`${id}-e`}>{shown(id)}</p>}
    </div>
  );
  const a = (id: Key) => ({ id, name: id, value: v[id] as string, onChange: set(id), 'aria-invalid': !!shown(id), 'aria-describedby': shown(id) ? `${id}-e` : undefined });
  const Check = ({ id, children }: { id: 'agreeRules' | 'agreeData' | 'photoOk'; children: React.ReactNode }) => (
    <div className={`field${shown(id) ? ' err' : ''}`}>
      <label className="check"><input type="checkbox" id={id} name={id} checked={v[id]} onChange={(e) => setV((o) => ({ ...o, [id]: e.target.checked }))} /><span>{children}</span></label>
      {shown(id) && <p className="ferr">{shown(id)}</p>}
    </div>
  );

  return (
    <div className="regform" ref={root}>
      <div className="apply__layout">
        <aside className="build on-board" aria-label="Registration progress">
          <div className="build__inner">
            <Bot name={botName} tool={tool} stage={v.fullName.trim() ? step + 1 : step} className="build__bot" />
            <div className="build__now"><span>Step {step + 1} of {STEPS.length}: {NAMES[step]}</span><div className="build__bar" aria-hidden="true">{NAMES.map((n, i) => <i key={n} className={i <= step ? 'is-built' : ''} />)}</div></div>
            <ol className="build__steps">
              {NAMES.map((n, i) => <li key={n} className={i < step ? 'is-built' : i === step ? 'is-current' : ''}><button type="button" disabled={i > step} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>{n}</button></li>)}
            </ol>
          </div>
        </aside>
        <div className={`apply__main${step ? ' is-later' : ''}`}>
          <div className="apply__intro">
            <a className="back" href="index.html">Back to home</a>
            <h1 className="apply__title">Register for OTC</h1>
            <p className="apply__lead">It takes a few minutes, and your robot builds itself from your answers. Every field is required unless it says “Optional”.</p>
          </div>
          <form className="form" noValidate onSubmit={submit}>
            {!API_URL && <p className="notice"><strong>Demo mode.</strong> This form is not connected to a server. Nothing you enter is saved or sent.</p>}
            <fieldset className="step" aria-labelledby={`t${step}`}>
              <h2 className="step__title" id={`t${step}`} tabIndex={-1} ref={(el: HTMLHeadingElement | null) => { titles.current[step] = el; }}>{NAMES[step]}</h2>

              {step === 0 && <>
                <div className="row">
                  {F({ id: 'fullName', label: 'Full name', children: <input type="text" autoComplete="name" {...a('fullName')} /> })}
                  {F({ id: 'birthDate', label: 'Date of birth', children: <input type="date" autoComplete="bday" {...a('birthDate')} /> })}
                </div>
                <div className="row">
                  {F({ id: 'email', label: 'Email', children: <input type="email" autoComplete="email" placeholder="name@example.com" {...a('email')} /> })}
                  {F({ id: 'phone', label: 'Phone number', children: <input type="tel" autoComplete="tel" placeholder="0550 12 34 56" {...a('phone')} /> })}
                </div>
              </>}

              {step === 1 && <>
                <div className="row">
                  {F({ id: 'university', label: 'University', children: <select {...a('university')}><option value="">Choose your university</option>{UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}</select> })}
                  {F({ id: 'faculty', label: 'Faculty', children: <input type="text" autoComplete="off" {...a('faculty')} /> })}
                </div>
                <div className="row">
                  {F({ id: 'department', label: 'Department', children: <input type="text" autoComplete="off" {...a('department')} /> })}
                  {F({ id: 'specialty', label: 'Specialty', children: <input type="text" autoComplete="off" {...a('specialty')} /> })}
                </div>
                <div className="row">
                  {F({ id: 'level', label: 'Study level', children: <select {...a('level')}><option value="">Choose your level</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select> })}
                  {F({ id: 'studentId', label: 'Student ID (matricule)', children: <input type="text" autoComplete="off" {...a('studentId')} /> })}
                </div>
              </>}

              {step === 2 && <>
                <div className={`field${shown('interests') ? ' err' : ''}`} role="group" aria-labelledby="int-l">
                  <p className="group-title" id="int-l">Fields of interest <span className="hint">Choose 1 to {MAX_DEPARTMENTS} departments ({v.interests.length} of {MAX_DEPARTMENTS} chosen)</span></p>
                  <div className="choices">
                    {DEPARTMENTS.map((d) => {
                      const on = v.interests.includes(d.id);
                      return (
                        <div className="dept" key={d.id}>
                          <label className="choice"><input type="checkbox" name="interests" value={d.id} checked={on} disabled={!on && v.interests.length >= MAX_DEPARTMENTS} onChange={(e) => toggleDept(d, e.target.checked)} /><span className="choice__body"><strong>{d.label}</strong><small>{d.desc}</small></span></label>
                          {on && F({ id: d.key, label: `What do you want to do in ${d.label}?`, children: <select {...a(d.key)}><option value="">Choose one</option>{d.options.map((o) => <option key={o}>{o}</option>)}</select> })}
                        </div>
                      );
                    })}
                  </div>
                  {shown('interests') && <p className="ferr">{shown('interests')}</p>}
                </div>
                {chosenLabels.length > 0 && <div className="row">
                  {F({ id: 'firstTeam', label: 'Department you want most', children: <select {...a('firstTeam')} onChange={(e) => setV((o) => ({ ...o, firstTeam: e.target.value, secondTeam: o.secondTeam === e.target.value ? '' : o.secondTeam }))}><option value="">Choose a department</option>{chosenLabels.map((l) => <option key={l}>{l}</option>)}</select> })}
                  {chosenLabels.length > 1 && F({ id: 'secondTeam', label: 'Your second choice', opt: true, children: <select {...a('secondTeam')}><option value="">No second choice</option>{chosenLabels.filter((l) => l !== v.firstTeam).map((l) => <option key={l}>{l}</option>)}</select> })}
                </div>}
                {F({ id: 'skillLevel', label: 'Your current level', children: <select {...a('skillLevel')}><option value="">Choose your level</option><option>Complete beginner</option><option>Some experience</option><option>Confident</option></select> })}
                {F({ id: 'skills', label: 'Skills and tools you already know', opt: true, children: <input type="text" autoComplete="off" placeholder="Python, Arduino, Canva, public speaking..." {...a('skills')} /> })}
              </>}

              {step === 3 && <>
                <div className={`field${shown('days') ? ' err' : ''}`} role="group" aria-labelledby="days-l">
                  <p className="group-title" id="days-l">Days you are usually free <span className="hint">Choose at least one</span></p>
                  <div className="day-chips">
                    {DAYS.map((d) => <label className="chip" key={d}><input type="checkbox" name="days" checked={v.days.includes(d)} onChange={(e) => toggleDay(d, e.target.checked)} /><span>{d}</span></label>)}
                  </div>
                  {shown('days') && <p className="ferr">{shown('days')}</p>}
                </div>
                <div className="row">
                  {F({ id: 'hours', label: 'Hours you can give each week', children: <select {...a('hours')}><option value="">Choose hours</option><option>1 to 2 hours</option><option>3 to 5 hours</option><option>6 hours or more</option></select> })}
                  {F({ id: 'laptop', label: 'Do you have a laptop for workshops?', children: <select {...a('laptop')}><option value="">Choose an answer</option><option>Yes</option><option>No</option></select> })}
                </div>
                {F({ id: 'heardFrom', label: 'How did you hear about OTC?', children: <select {...a('heardFrom')}><option value="">Choose an answer</option>{HEARD.map((h) => <option key={h}>{h}</option>)}</select> })}
              </>}

              {step === 4 && <>
                <div className={`field${shown('motivation') ? ' err' : ''}`}>
                  <label htmlFor="motivation">Why do you want to join OTC?</label>
                  <textarea rows={4} {...a('motivation')} />
                  <p className="hint">{v.motivation.trim().length} / {MIN} characters minimum</p>
                  {shown('motivation') && <p className="ferr" id="motivation-e">{shown('motivation')}</p>}
                </div>
                {F({ id: 'goal', label: 'What do you hope to learn or build this year?', children: <textarea rows={3} {...a('goal')} /> })}
                {F({ id: 'experience', label: 'Previous clubs, projects or competitions', opt: true, children: <textarea rows={3} placeholder="Clubs, courses, personal projects, links..." {...a('experience')} /> })}
                <div className="row">
                  {F({ id: 'discord', label: 'Discord username', children: <input type="text" autoComplete="off" placeholder="username" {...a('discord')} /> })}
                  {F({ id: 'linkedin', label: 'LinkedIn profile', opt: true, children: <input type="text" inputMode="url" autoComplete="off" placeholder="https://www.linkedin.com/in/your-name" {...a('linkedin')} /> })}
                </div>
                {F({ id: 'portfolio', label: 'Portfolio or GitHub', opt: true, children: <input type="text" inputMode="url" autoComplete="off" placeholder="https://..." {...a('portfolio')} /> })}
                <div className="consents">
                  {Check({ id: 'agreeRules', children: 'I will follow the club rules and take part in my team’s activities.' })}
                  {Check({ id: 'agreeData', children: 'OTC may store my answers to process my registration and contact me.' })}
                  {Check({ id: 'photoOk', children: <>I am fine with appearing in club photos and videos. <span className="hint">Optional</span></> })}
                </div>
              </>}
            </fieldset>
            <div className="hp" aria-hidden="true"><label>Company<input ref={trap} type="text" name="company" tabIndex={-1} autoComplete="off" /></label></div>
            <div className="form-nav">
              {step > 0 && <button className="btn btn--ghost" type="button" disabled={sending} onClick={() => go(step - 1)}>Back</button>}
              <button className={`btn${sending ? ' loading' : ''}`} id="send" type="submit" disabled={sending}><span className="spin" aria-hidden="true" />{sending ? 'Sending...' : step === STEPS.length - 1 ? 'Send registration' : 'Continue'}</button>
            </div>
            <p className="status" role="alert">{status}</p>
            <p className="sr" aria-live="polite">Step {step + 1} of {STEPS.length}: {NAMES[step]}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
