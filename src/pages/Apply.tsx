import { INSTAGRAM, REGISTRATION_OPEN, SOCIALS } from '../content/config';
import { ext, Footer, Header, OttoFlat } from '../components/Chrome';
import { Band, RegisterForm } from '../components/RegisterForm';

function Closed() {
  return (
    <section className="page-hero" aria-labelledby="soon-t">
      <div className="wrap page-hero__stage">
        <div className="page-hero__copy">
          <h1 id="soon-t" className="page-hero__title">Registration is closed for now</h1>
          <p>We are not accepting new members yet. Follow our pages to be the first to know when registration opens.</p>
          <div className="actions"><a className="btn" href={INSTAGRAM} {...ext}>Follow us on Instagram</a><a className="btn btn--ghost" href="index.html">Back to home</a></div>
          <ul className="link-row">{SOCIALS.slice(1).map(([t, u]) => <li key={t}><a href={u} {...ext}>{t}</a></li>)}</ul>
        </div>
        <div className="page-hero__otto"><OttoFlat asleep label="OTTO the robot, asleep until registration opens" /></div>
      </div>
      <Band />
    </section>
  );
}

export default function Apply() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="apply">{REGISTRATION_OPEN ? <RegisterForm /> : <Closed />}</main>
      <Footer />
    </>
  );
}
