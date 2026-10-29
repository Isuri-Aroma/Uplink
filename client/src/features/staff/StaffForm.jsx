import { useState } from 'react';
import Field from '../../components/ui/Field';
import Toggle from '../../components/ui/Toggle';

const ROLES = [
  { value: 'agent', label: 'Agent', help: 'Customers, subscriptions and tickets' },
  { value: 'admin', label: 'Admin', help: 'Everything, plus plans, deletes and staff' },
];

// Same rules as the server
export function validateStaff(f, isEdit) {
  const e = {};
  if (f.name.trim().length < 3) e.name = 'Enter the full name (at least 3 characters)';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (!isEdit || f.password) {
    if (f.password.length < 8) e.password = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Use at least one letter and one number';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  }
  return e;
}

export default function StaffForm({ user, isSelf, errors, onChangeErrors, onSubmit, formId }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'agent',
    isActive: user?.isActive ?? true,
    password: '',
    confirm: '',
  });

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) onChangeErrors({ ...errors, [key]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateStaff(form, isEdit);
    onChangeErrors(found);
    if (Object.keys(found).length) return;
    const data = { name: form.name.trim(), email: form.email.trim(), role: form.role, isActive: form.isActive };
    if (form.password) data.password = form.password;
    onSubmit(data);
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field id="staff-name" label="Full name" error={errors.name}>
        <input id="staff-name" className={err('name')} value={form.name} onChange={set('name')} placeholder="Dulani Herath" />
      </Field>

      <Field id="staff-email" label="Work email" error={errors.email}>
        <input id="staff-email" type="email" className={err('email')} value={form.email} onChange={set('email')} placeholder="dulani@uplink.lk" />
      </Field>

      <fieldset disabled={isSelf}>
        <legend className="label">Role</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 ${
                form.role === r.value ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted'
              } ${isSelf ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} className="sr-only" />
              <span className={`text-sm font-bold ${form.role === r.value ? 'text-primary' : ''}`}>{r.label}</span>
              <span className="text-xs text-muted">{r.help}</span>
            </label>
          ))}
        </div>
        {isSelf && <p className="mt-1.5 text-xs text-muted">You can't change your own role or disable your own account.</p>}
      </fieldset>

      <div className="flex flex-col gap-4 rounded-lg border border-line p-4">
        <p className="text-sm font-semibold">{isEdit ? 'Reset password' : 'Password'}</p>
        {isEdit && <p className="-mt-3 text-xs text-muted">Leave empty to keep the current password.</p>}
        <Field id="staff-password" label="New password" hint="At least 8 characters, with a letter and a number" error={errors.password}>
          <input id="staff-password" type="password" autoComplete="new-password" className={err('password')} value={form.password} onChange={set('password')} />
        </Field>
        <Field id="staff-confirm" label="Confirm password" error={errors.confirm}>
          <input id="staff-confirm" type="password" autoComplete="new-password" className={err('confirm')} value={form.confirm} onChange={set('confirm')} />
        </Field>
      </div>

      {!isSelf && (
        <Toggle
          id="staff-active"
          label="Account active"
          description="Disabled staff can't sign in. Their history stays."
          checked={form.isActive}
          onChange={(v) => setForm({ ...form, isActive: v })}
        />
      )}
    </form>
  );
}
