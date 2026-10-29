import { useEffect, useState } from 'react';
import { listCustomers, DISTRICTS } from '../../api/customers';
import { listPlans } from '../../api/plans';
import { lkr, speed } from '../../utils/format';
import Field from '../../components/ui/Field';
import Toggle from '../../components/ui/Toggle';

const ROUTER = /^[A-Z0-9-]{6,30}$/;

export function validateSubscription(f, isEdit, sameAddress) {
  const e = {};
  if (!isEdit && !f.customer) e.customer = 'Choose a customer';
  if (!f.plan) e.plan = 'Choose a plan';
  if (!sameAddress) {
    if (!f.installAddress.line1.trim()) e['installAddress.line1'] = 'Installation address is required';
    if (!f.installAddress.city.trim()) e['installAddress.city'] = 'City is required';
    if (!f.installAddress.district) e['installAddress.district'] = 'Choose a district';
  }
  if (f.routerSerial && !ROUTER.test(f.routerSerial.trim().toUpperCase())) e.routerSerial = 'Use 6–30 letters, numbers or dashes';
  if (isEdit && !(Number(f.usedGB) >= 0)) e.usedGB = 'Enter 0 or more';
  if (f.notes.length > 300) e.notes = 'Notes must be 300 characters or less';
  return e;
}

export default function SubscriptionForm({ subscription, customerId, errors, onChangeErrors, onSubmit, formId }) {
  const isEdit = !!subscription;
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [sameAddress, setSameAddress] = useState(true);
  const [form, setForm] = useState(() => ({
    customer: subscription?.customer?._id || customerId || '',
    plan: subscription?.plan?._id || '',
    installAddress: subscription?.installAddress || { line1: '', city: '', district: '' },
    routerSerial: subscription?.routerSerial || '',
    usedGB: subscription?.usedGB ?? 0,
    notes: subscription?.notes || '',
  }));

  useEffect(() => {
    listPlans({ status: 'active', sort: 'name' }).then((d) => setPlans(d.plans));
    if (!isEdit) listCustomers({ sort: 'name' }).then((d) => setCustomers(d.customers));
  }, [isEdit]);

  const clear = (key) => errors[key] && onChangeErrors({ ...errors, [key]: undefined });
  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    clear(key);
  };
  const setAddress = (key) => (e) => {
    setForm({ ...form, installAddress: { ...form.installAddress, [key]: e.target.value } });
    clear(`installAddress.${key}`);
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateSubscription(form, isEdit, sameAddress);
    onChangeErrors(found);
    if (Object.keys(found).length) return;

    const data = { plan: form.plan, routerSerial: form.routerSerial.trim().toUpperCase(), notes: form.notes.trim() };
    if (!isEdit) data.customer = form.customer;
    if (isEdit) data.usedGB = Number(form.usedGB);
    if (!sameAddress) data.installAddress = form.installAddress;
    onSubmit(data);
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');
  const chosenPlan = plans.find((p) => p._id === form.plan);
  // Keep the current plan in the list even if it is no longer on sale
  const planOptions = isEdit && subscription.plan && !plans.some((p) => p._id === subscription.plan._id)
    ? [subscription.plan, ...plans]
    : plans;

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
      {!isEdit && (
        <Field id="sub-customer" label="Customer" error={errors.customer}>
          <select id="sub-customer" className={err('customer')} value={form.customer} onChange={set('customer')} disabled={!!customerId}>
            <option value="">Choose customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.nameWithInitials} · {c.nic}</option>
            ))}
          </select>
        </Field>
      )}

      <Field
        id="sub-plan"
        label="Plan"
        hint={chosenPlan && `${chosenPlan.technology} · ${speed(chosenPlan.downMbps, chosenPlan.upMbps)} · ${lkr(chosenPlan.monthlyFeeLKR)} / month`}
        error={errors.plan}
      >
        <select id="sub-plan" className={err('plan')} value={form.plan} onChange={set('plan')}>
          <option value="">Choose plan</option>
          {planOptions.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.technology})</option>
          ))}
        </select>
      </Field>

      <div className="flex flex-col gap-4 rounded-lg border border-line p-4">
        <Toggle
          id="sub-same-address"
          label={isEdit ? 'Keep installation address' : "Install at the customer's address"}
          description={isEdit ? `${form.installAddress.line1}, ${form.installAddress.city}` : 'Turn off to enter a different site'}
          checked={sameAddress}
          onChange={setSameAddress}
        />
        {!sameAddress && (
          <>
            <Field id="sub-line1" label="Installation address" error={errors['installAddress.line1']}>
              <input id="sub-line1" className={err('installAddress.line1')} value={form.installAddress.line1} onChange={setAddress('line1')} placeholder="88, Main Street" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sub-city" label="City" error={errors['installAddress.city']}>
                <input id="sub-city" className={err('installAddress.city')} value={form.installAddress.city} onChange={setAddress('city')} placeholder="Negombo" />
              </Field>
              <Field id="sub-district" label="District" error={errors['installAddress.district']}>
                <select id="sub-district" className={err('installAddress.district')} value={form.installAddress.district} onChange={setAddress('district')}>
                  <option value="">Choose district</option>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </>
        )}
      </div>

      <div className={`grid gap-5 ${isEdit ? 'sm:grid-cols-2' : ''}`}>
        <Field id="sub-router" label="Router serial (optional)" hint={!isEdit && 'Add it now or after installation'} error={errors.routerSerial}>
          <input id="sub-router" className={`${err('routerSerial')} font-mono uppercase`} value={form.routerSerial} onChange={set('routerSerial')} placeholder="HW-HG8145V5-0012AB" />
        </Field>
        {isEdit && (
          <Field id="sub-used" label="Data used this month (GB)" error={errors.usedGB}>
            <input id="sub-used" type="number" min="0" step="0.1" className={err('usedGB')} value={form.usedGB} onChange={set('usedGB')} />
          </Field>
        )}
      </div>

      <Field id="sub-notes" label="Notes (optional)" error={errors.notes}>
        <textarea id="sub-notes" rows="3" className={err('notes')} value={form.notes} onChange={set('notes')} placeholder="e.g. Second floor, call before visiting" />
      </Field>
    </form>
  );
}
