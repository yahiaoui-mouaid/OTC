import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { REGISTRATION_OPEN } from '../content/config';
import { webglOk } from '../lib/otto';
import { BotBuilder, CrewDirectory } from '../components/BotBay';
import { Footer, Header, JoinButton, OttoFlat, useEyes } from '../components/Chrome';

const Otto3D = lazy(() => import('../components/Otto3D'));

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: '120px' });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Signal({ place }: { place: string }) {
  return (
    <p className={`signal signal--${place}`}>
      <strong>{REGISTRATION_OPEN ? 'Registration is open' : 'Registration is closed'}</strong>
      <span>{REGISTRATION_OPEN ? 'Registering takes a few minutes.' : 'Follow us to hear when it opens.'}</span>
    </p>
  );
}

function Hero() {
  const stage = useRef<HTMLElement>(null);
  useEyes(stage, 16);
  const [ref, inView] = useInView<HTMLDivElement>();
  const [use3d] = useState(webglOk);
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSettled(true), 1500); return () => clearTimeout(t); }, []);
  const swap = use3d && ready && settled;

  return (
    <section className="hero" aria-labelledby="hero-title" ref={stage}>
      <div className="wrap hero__stage">
        <h1 className="hero__name" id="hero-title"><span>One</span> <span>Tech</span> <span>Crew</span></h1>
        <div className="hero__otto" ref={ref}>
          <div className={swap ? 'is-gone' : ''}><OttoFlat label="OTTO, the One Tech Crew robot" /></div>
          {use3d && settled && <div className={`hero__gl${swap ? ' is-on' : ''}`}><Suspense fallback={null}><Otto3D mode="hero" active={inView} onReady={() => setReady(true)} /></Suspense></div>}
          <Signal place="antenna" />
        </div>
      </div>
      <div className="hero__band on-otto">
        <div className="wrap hero__pitch">
          <div>
            <p className="hero__slogan">Build. Innovate. Create.</p>
            <p className="hero__lead">One Tech Crew is a student club in Algeria where curious people build robots, write code and turn ideas into working projects, together.</p>
          </div>
          <div className="hero__side">
            <Signal place="band" />
            <div className="actions">
              <JoinButton open="Register now" closed="Follow us on Instagram" />
              <a className="btn btn--ghost" href="#fields">See what we build</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FIELDS = [
  ['Robotics', 'Design, wire and program machines that move, sense and react.', 'Arduino, sensors, motors'],
  ['Computer science', 'Learn to write clean code, solve problems and build useful software.', 'Web, algorithms, AI'],
  ['Innovation', 'Turn an idea into a prototype and present it to real people.', 'Prototyping, teamwork, pitching'],
];

function Fields() {
  const [step, setStep] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>();
  const [use3d] = useState(webglOk);
  const panels = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setStep(panels.current.indexOf(e.target as HTMLLIElement)); }), { rootMargin: '-45% 0px -45% 0px' });
    panels.current.forEach((p) => p && o.observe(p));
    return () => o.disconnect();
  }, []);
  return (
    <div className="scene wrap" id="fields">
      <div className="scene__sticky" ref={ref}>
        {use3d ? <Suspense fallback={null}><Otto3D mode="explode" step={step} active={inView} /></Suspense> : <div className="scene__flat"><OttoFlat label="OTTO the robot" /></div>}
      </div>
      <div className="scene__copy">
        <h2 className="scene__title">Three ways to build</h2>
        <p className="scene__sub">Pick one, or mix them. Most members do.</p>
        <ol className="scene__panels">
          {FIELDS.map(([name, text, tools], i) => (
            <li key={name} ref={(el) => { panels.current[i] = el; }} className={step === i ? 'is-now' : ''}>
              <h3>{name}</h3><p>{text}</p><p className="scene__tools">{tools}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Game({ img, alt, w, h, href, title, text, spec }: { img: string; alt: string; w: number; h: number; href: string; title: string; text: string; spec: string }) {
  return (
    <article className="game">
      <div className="game__shot"><img src={img} alt={alt} width={w} height={h} loading="lazy" /><div className="game__notch"><a className="btn btn--sm game__play" href={href} aria-label={`Play ${title}`}>Play</a></div></div>
      <h3>{title}</h3><p>{text}</p><p className="game__spec">{spec}</p>
    </article>
  );
}

const Q = ({ q, children }: { q: string; children: ReactNode }) => <details><summary>{q}</summary><p>{children}</p></details>;

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header home />
      <main id="main">
        <Hero />
        <section id="about" className="section">
          <div className="wrap split">
            <h2>A crew, not just a club</h2>
            <div className="prose">
              <p className="prose__lead">OTC brings together students who want to learn by making things. We run hands-on workshops, build team projects and prepare for robotics and programming competitions.</p>
              <p>You do not need to be an expert. You need curiosity, and the will to ship something with other people.</p>
            </div>
          </div>
          <Fields />
        </section>
        <section id="games" className="section on-board">
          <div className="wrap">
            <div className="section-head"><h2>Games by the crew</h2><p>Built by OTC members. Play them right in your browser.</p></div>
            <div className="games">
              <Game img="img/games/otto-run.webp" alt="OTTO Run: a cube robot running down a neon circuit road" w={1280} h={597} href="games/robo-run/index.html" title="OTTO Run: Circuit Rush" text="Guide the robot down the neon circuit road. Grab batteries and chips, dodge lasers and bugs." spec="3D runner for desktop and keyboard" />
              <Game img="img/games/otto-mission.webp" alt="OTTO’s Mission: The Club Adventure title screen" w={1280} h={717} href="games/robos-mission/index.html" title="OTTO’s Mission" text="Collect energy, squash bugs and save the club with our real robot as the hero." spec="Adventure with levels" />
            </div>
          </div>
        </section>
        <section id="benefits" className="section">
          <div className="wrap benefits">
            <div className="benefits__head"><h2>Why join OTC</h2><p>What you get from being part of the crew.</p></div>
            <ul className="benefits__list">
              {[['Learn by doing', 'Workshops where you build something.'], ['Real team projects', 'Projects you can show in a portfolio.'], ['Mentoring', 'Advice from senior members.'], ['Competitions', 'Robotics and programming contests.'], ['Equipment access', 'Tools and components hard to get alone.'], ['A network', 'Meet students and professionals in Algeria’s tech scene.']].map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
            </ul>
          </div>
        </section>
        <section id="team" className="section section--soft">
          <div className="wrap crew__head"><h2>Meet the crew</h2><p>The people who run OTC and lead each department. Every portrait is a robot generated from the member’s name.</p></div>
          <div className="wrap"><CrewDirectory /></div>
        </section>
        <section className="section on-board builder-wrap" aria-label="Build your own robot"><BotBuilder /></section>
        <section id="join" className="section">
          <div className="wrap join">
            <div>
              <h2>How to join</h2>
              <p className="join__status"><span className={`dot${REGISTRATION_OPEN ? '' : ' dot--off'}`} aria-hidden="true" />{REGISTRATION_OPEN ? 'Registration is open now.' : 'Registration is closed right now.'}</p>
              <ol className="steps">
                <li><h3>Register online</h3><p>Fill in the registration form. It takes a few minutes.</p></li>
                <li><h3>Meet the crew</h3><p>We contact you to get to know you and answer your questions.</p></li>
                <li><h3>Pick a team</h3><p>Join a team that fits your interests and start building with us.</p></li>
              </ol>
            </div>
            <div className="faq">
              <h2 className="faq__title">Questions</h2>
              <Q q="Do I need experience?">No. You need curiosity and the will to build something with other people.</Q>
              <Q q="How do I register?">Fill in the form on the <a href="register.html">registration page</a> while registration is open. The status shows at the top of this page and in this section.</Q>
              <Q q="Can I join more than one department?">Yes. Pick up to three departments in the form.</Q>
            </div>
          </div>
        </section>
        <section className="closer on-otto" aria-labelledby="closer-title">
          <div className="wrap closer__in">
            <h2 className="closer__title" id="closer-title">Every dream needs a team.</h2>
            <div className="closer__side">
              <p>{REGISTRATION_OPEN ? 'Tell us who you are and what you want to build.' : 'Registration is closed for now. Follow us and you will hear as soon as it opens.'}</p>
              <div className="actions"><JoinButton open="Start your registration" closed="Follow us on Instagram" /></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
