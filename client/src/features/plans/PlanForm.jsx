import { useState } from 'react';
import { TECHNOLOGIES } from '../../api/plans';
import Field from '../../components/ui/Field';
import Toggle from '../../components/ui/Toggle';

const EMPTY = {
  name: '', technology: 'Fibre', downMbps: '', upMbps: '', dataCapGB: '', monthlyFeeLKR: '', description: '', isActive: true,
};

const toForm = (plan) =>
  plan
    ? { ...EMPTY, ...plan, dataCapGB: plan.dataCapGB || '', description: plan.description || '' }
    : EMPTY;

// Same rules as the server
export function validatePlan(f, unlimited) {
  const e = {};
  const num = (v) => (v === '' || v === null ? NaN : Number(v));
  if (!f.name.trim()) e.name = 'Plan name is required';
  else if (f.name.trim().length > 60) e.name = 'Plan name must be 60 characters or less';
  if (!(num(f.downMbps) >= 1 && num(f.downMbps) <= 10000)) e.downMbps = 'Enter a download speed from 1 to 10,000 Mbps';
  if (!(num(f.upMbps) >= 1)) e.upMbps = 'Enter an upload speed of at least 1 Mbps';
  else if (num(f.upMbps) > num(f.downMbps)) e.upMbps = 'Upload speed cannot be higher than download speed';
  if (!unlimited && !(num(f.dataCapGB) >= 1)) e.dataCapGB = 'Enter a data cap in GB, or turn on unlimited';
  if (!(num(f.monthlyFeeLKR) >= 0)) e.monthlyFeeLKR = 'Enter the monthly fee (0 or more)';
  if (f.description.length > 300) e.description = 'Description must be 300 characters or less';
  return e;
}

export default function PlanForm({ plan, readOnly, errors, onChangeErrors, onSubmit, formId }) {
  const [form, setForm] = useState(() => toForm(plan));
  const [unlimited, setUnlimited] = useState(() => !plan || !plan.dataCapGB);

  // Save a typed value and clear its error
  const update = (key, value) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) onChangeErrors({ ...errors, [key]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validatePlan(form, unlimited);
    onChangeErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      name: form.name.trim(),
      technology: form.technology,
      downMbps: Number(form.downMbps),
      upMbps: Number(form.upMbps),
      dataCapGB: unlimited ? 0 : Number(form.dataCapGB),
      monthlyFeeLKR: Number(form.monthlyFeeLKR),
      description: form.description.trim(),
      isActive: form.isActive,
    });
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');

  return (
    <form id={formId} onSubmit={submit} noValidate>
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <Field id="plan-name" label="Plan name" error={errors.name}>
          <input id="plan-name" className={err('name')} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Fibre 100" />
        </Field>

        <Field id="plan-technology" label="Technology" error={errors.technology}>
          <select id="plan-technology" className={err('technology')} value={form.technology} onChange={(e) => update('technology', e.target.value)}>
            {TECHNOLOGIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="plan-down" label="Download (Mbps)" error={errors.downMbps}>
            <input id="plan-down" type="number" min="1" className={err('downMbps')} value={form.downMbps} onChange={(e) => update('downMbps', e.target.value)} placeholder="100" />
          </Field>
          <Field id="plan-up" label="Upload (Mbps)" error={errors.upMbps}>
            <input id="plan-up" type="number" min="1" className={err('upMbps')} value={form.upMbps} onChange={(e) => update('upMbps', e.target.value)} placeholder="50" />
          </Field>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
          <Toggle
            id="plan-unlimited"
            label="Unlimited data"
            description="No monthly data cap"
            checked={unlimited}
            onChange={(v) => {
              setUnlimited(v);
              onChangeErrors({ ...errors, dataCapGB: undefined });
            }}
          />
          {!unlimited && (
            <Field id="plan-cap" label="Data cap (GB per month)" error={errors.dataCapGB}>
              <input id="plan-cap" type="number" min="1" className={err('dataCapGB')} value={form.dataCapGB} onChange={(e) => update('dataCapGB', e.target.value)} placeholder="150" />
            </Field>
          )}
        </div>

        <Field id="plan-fee" label="Monthly fee (LKR)" error={errors.monthlyFeeLKR}>
          <input id="plan-fee" type="number" min="0" className={err('monthlyFeeLKR')} value={form.monthlyFeeLKR} onChange={(e) => update('monthlyFeeLKR', e.target.value)} placeholder="6990" />
        </Field>

        <Field id="plan-desc" label="Description" hint="Optional. Shown to staff when choosing a plan." error={errors.description}>
          <textarea id="plan-desc" rows="3" className={err('description')} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="e.g. Most popular home fibre plan" />
        </Field>

        <Toggle
          id="plan-active"
          label="On sale"
          description="Inactive plans stay on existing subscriptions but can't be chosen for new ones"
          checked={form.isActive}
          onChange={(v) => setForm({ ...form, isActive: v })}
        />
      </fieldset>
    </form>
  );
}
