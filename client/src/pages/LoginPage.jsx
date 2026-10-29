import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { readError } from '../api/client';
import Logo, { LogoMark } from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import fibreRack from '../assets/fibre-rack.jpg';

const EMAIL = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your work email';
    else if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setBusy(true);
    try {
      await signIn(form.email.trim(), form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      const { message, fields } = readError(err);
      setServerError(message);
      setErrors(fields);
    } finally {
      setBusy(false);
    }
  };

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

      {/* Sign-in form */}
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Staff sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Welcome back. Enter your work email and password to continue.</p>

          {serverError && (
            <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-lg border border-bad/30 bg-bad-soft px-3.5 py-3 text-sm text-bad">
              <AlertCircle size={18} className="mt-px shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="label">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="name@uplink.lk"
                value={form.email}
                onChange={update}
                className={`input ${errors.email ? 'input-error' : ''}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={update}
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary mt-1 w-full py-3" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted">
          For authorised Uplink staff only. Forgot your password? Ask your admin to reset it.
        </p>
      </section>
    </div>
  );
}
