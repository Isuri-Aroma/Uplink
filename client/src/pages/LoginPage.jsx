import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { readError } from '../api/client';
import AuthShell from '../components/auth/AuthShell';

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
    <AuthShell footer="For authorised Uplink staff only. Forgot your password? Ask your admin to reset it.">
      <h1 className="auth-title">Staff sign in</h1>
      <p className="auth-text">Welcome back. Enter your work email and password to continue.</p>

      {serverError && (
        <div role="alert" className="form-alert mt-6">
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

        <button type="submit" className="btn-primary mt-1 h-11 w-full" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
