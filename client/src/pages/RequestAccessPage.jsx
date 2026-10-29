import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { readError } from '../api/client';
import { sendAccessRequest, TEAMS } from '../api/accessRequests';
import AuthShell from '../components/auth/AuthShell';
import Field from '../components/ui/Field';

const EMPTY = { name: '', email: '', employeeId: '', team: '', password: '', confirm: '', reason: '' };

// Same rules as the server
function validate(f) {
  const e = {};
  if (f.name.trim().length < 3) e.name = 'Enter your full name';
  if (!/^[^\s@]+@uplink\.lk$/i.test(f.email.trim())) e.email = 'Use your @uplink.lk work email';
  if (!/^UPL-\d{4}$/i.test(f.employeeId.trim())) e.employeeId = 'Employee ID looks like UPL-1043';
  if (!f.team) e.team = 'Choose your team';
  if (f.password.length < 8) e.password = 'Use at least 8 characters';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Use at least one letter and one number';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  if (f.reason.length > 300) e.reason = 'Keep it under 300 characters';
  return e;
}

export default function RequestAccessPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { confirm, ...data } = form;
      await sendAccessRequest({ ...data, name: data.name.trim(), email: data.email.trim(), employeeId: data.employeeId.trim().toUpperCase() });
      setSent(true);
    } catch (err) {
      const { message, fields } = readError(err);
      setServerError(message);
      setErrors(fields);
    } finally {
      setBusy(false);
    }
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ok-soft text-ok"><CheckCircle2 size={24} /></span>
          <h1 className="auth-title">Request sent</h1>
          <p className="text-sm text-muted">
            An Uplink admin will review your request. Once it is approved, sign in with <b className="text-ink">{form.email}</b> and the password you chose.
          </p>
          <Link to="/login" className="btn-primary mt-2 w-full">Back to sign in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell footer="Requests are reviewed by an Uplink admin, usually within one working day.">
      <Link to="/login" className="back-link mb-6">
        <ArrowLeft size={16} /> Back to sign in
      </Link>
      <h1 className="auth-title">Request access</h1>
      <p className="auth-text">New to the team? Ask for an Uplink account. An admin approves it before you can sign in.</p>

      {serverError && (
        <div role="alert" className="form-alert mt-6">
          <AlertCircle size={18} className="mt-px shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <Field id="ra-name" label="Full name" error={errors.name}>
          <input id="ra-name" className={err('name')} value={form.name} onChange={set('name')} placeholder="Chamodi Wijesekara" autoComplete="name" />
        </Field>
        <Field id="ra-email" label="Work email" error={errors.email}>
          <input id="ra-email" type="email" className={err('email')} value={form.email} onChange={set('email')} placeholder="name@uplink.lk" autoComplete="email" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="ra-emp" label="Employee ID" error={errors.employeeId}>
            <input id="ra-emp" className={`${err('employeeId')} font-mono uppercase`} value={form.employeeId} onChange={set('employeeId')} placeholder="UPL-1043" />
          </Field>
          <Field id="ra-team" label="Team" error={errors.team}>
            <select id="ra-team" className={err('team')} value={form.team} onChange={set('team')}>
              <option value="">Choose team</option>
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field id="ra-password" label="Password" error={errors.password}>
            <input id="ra-password" type="password" className={err('password')} value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Field id="ra-confirm" label="Confirm" error={errors.confirm}>
            <input id="ra-confirm" type="password" className={err('confirm')} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </Field>
        </div>
        <Field id="ra-reason" label="Why do you need access? (optional)" error={errors.reason}>
          <textarea id="ra-reason" rows="2" className={err('reason')} value={form.reason} onChange={set('reason')} placeholder="e.g. Joined the Kandy branch customer care team" />
        </Field>
        <button type="submit" className="btn-primary mt-1 h-11 w-full" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Sending…' : 'Send request'}
        </button>
      </form>
    </AuthShell>
  );
}
