import fibreRack from '../../assets/fibre-rack.jpg';
import Logo, { LogoMark } from '../Logo';
import ThemeToggle from '../ThemeToggle';

// Photo panel + content column used by sign-in and request access
export default function AuthShell({ children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Photo panel (desktop only) */}
      <section className="relative hidden overflow-hidden bg-[#07161D] lg:block">
        <img
          src={fibreRack}
          alt="Fibre optic cables patched into telecom equipment in an exchange rack"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-75"
        />
        {/* Fade behind logo */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#07161D]/95 via-[#07161D]/70 to-transparent" />
        <div className="relative p-12 text-[#E2F0F4]">
          <span className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-[#4DA3FF]">Up</span>link
            </span>
          </span>
          <p className="mt-3 text-sm font-medium text-[#C9DCE4]">
            Broadband subscriber and service management for ISP operations teams
          </p>
        </div>
      </section>

      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-10">{children}</div>
        {footer && <p className="text-center text-xs text-muted">{footer}</p>}
      </section>
    </div>
  );
}
