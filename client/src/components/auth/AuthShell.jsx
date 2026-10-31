import fibreRack from '../../assets/fibre-rack.jpg';
import Logo, { LogoMark } from '../Logo';
import ThemeToggle from '../ThemeToggle';

// Photo panel + content column for the sign-in page
export default function AuthShell({ children, footer }) {
  return (
    <div className="auth-shell">
      <section className="auth-photo">
        <img src={fibreRack} alt="Fibre optic cables patched into telecom equipment in an exchange rack" />
        <div className="auth-photo__fade" />
        <div className="auth-photo__brand">
          <span className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <span className="auth-photo__name"><span>Up</span>link</span>
          </span>
        </div>
        <div className="auth-photo__fade-bottom" />
        <div className="auth-photo__hero">
          <h2>Every connection,<br />in one place.</h2>
          <p>Subscribers, plans and faults for ISP teams.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__top">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="auth-panel__body">{children}</div>
        {footer && <p className="auth-panel__foot">{footer}</p>}
      </section>
    </div>
  );
}
