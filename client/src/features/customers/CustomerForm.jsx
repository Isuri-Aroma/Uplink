import { useState } from 'react';
import { CUSTOMER_TYPES, DISTRICTS } from '../../api/customers';
import { readNic } from '../../utils/nic';
import { shortDate } from '../../utils/format';
import Field from '../../components/ui/Field';

const EMPTY = {
  nameWithInitials: '', fullName: '', nic: '', mobile: '', email: '',
  address: { line1: '', city: '', district: '' }, customerType: 'Residential',
};

const toForm = (c) => (c ? { ...EMPTY, ...c, email: c.email || '', address: { ...c.address } } : EMPTY);

const INITIALS = /^(?:[A-Z]\.\s?)+(?:de\s)?[A-Z][A-Za-z'-]+(?:\s[A-Z][A-Za-z'-]+)*$/;

// Same rules as the server
export function validateCustomer(f) {
  const e = {};
  const nic = readNic(f.nic);
  if (!f.nameWithInitials.trim()) e.nameWithInitials = 'Name with initials is required';
  else if (!INITIALS.test(f.nameWithInitials.trim())) e.nameWithInitials = 'Write it like "W. M. S. Bandara"';
  if (f.fullName.trim().length < 3) e.fullName = 'Full name is required';
  else if (!/^[A-Za-z .'-]+$/.test(f.fullName.trim())) e.fullName = 'Use letters, spaces, dots and hyphens only';
  if (!f.nic.trim()) e.nic = 'NIC number is required';
  else if (!nic) e.nic = 'Enter 9 digits + V/X (old) or 12 digits (new)';
  else if (nic.age < 18) e.nic = 'Customer must be at least 18 years old';
  if (!/^07\d{8}$/.test(f.mobile.replace(/[\s-]/g, ''))) e.mobile = 'Enter a mobile number like 0771234567';
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Email address is not valid';
  if (!f.address.line1.trim()) e['address.line1'] = 'Address is required';
  if (!f.address.city.trim()) e['address.city'] = 'City is required';
  if (!f.address.district) e['address.district'] = 'Choose a district';
  return e;
}

export default function CustomerForm({ customer, errors, onChangeErrors, onSubmit, formId }) {
  const [form, setForm] = useState(() => toForm(customer));
  const nicInfo = readNic(form.nic);

  const clear = (key) => errors[key] && onChangeErrors({ ...errors, [key]: undefined });
  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    clear(key);
  };
  const setAddress = (key) => (e) => {
    setForm({ ...form, address: { ...form.address, [key]: e.target.value } });
    clear(`address.${key}`);
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateCustomer(form);
    onChangeErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      nameWithInitials: form.nameWithInitials.trim(),
      fullName: form.fullName.trim(),
      nic: form.nic.trim().toUpperCase(),
      mobile: form.mobile.replace(/[\s-]/g, ''),
      email: form.email.trim(),
      address: { line1: form.address.line1.trim(), city: form.address.city.trim(), district: form.address.district },
      customerType: form.customerType,
    });
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');
  const nicHint = nicInfo && !errors.nic
    ? `${nicInfo.gender} · born ${shortDate(nicInfo.dob)} · age ${nicInfo.age}`
    : 'Old (901234567V) or new (199012304567) format';

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="label">Customer type</legend>
        <div className="grid grid-cols-2 gap-2">
          {CUSTOMER_TYPES.map((t) => (
            <label
              key={t}
              className={`choice ${form.customerType === t ? 'choice--on' : ''}`}
            >
              <input type="radio" name="customerType" value={t} checked={form.customerType === t} onChange={set('customerType')} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="cust-initials" label="Name with initials" error={errors.nameWithInitials}>
        <input id="cust-initials" className={err('nameWithInitials')} value={form.nameWithInitials} onChange={set('nameWithInitials')} placeholder="W. M. S. Bandara" />
      </Field>

      <Field id="cust-fullname" label="Full name" error={errors.fullName}>
        <input id="cust-fullname" className={err('fullName')} value={form.fullName} onChange={set('fullName')} placeholder="Wijesinghe Mudiyanselage Sanath Bandara" />
      </Field>

      <Field id="cust-nic" label="NIC number" hint={nicHint} error={errors.nic}>
        <input id="cust-nic" className={`${err('nic')} font-mono uppercase`} value={form.nic} onChange={set('nic')} placeholder="199012304567" maxLength={12} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="cust-mobile" label="Mobile" error={errors.mobile}>
          <input id="cust-mobile" type="tel" className={`${err('mobile')} font-mono`} value={form.mobile} onChange={set('mobile')} placeholder="0771234567" />
        </Field>
        <Field id="cust-email" label="Email (optional)" error={errors.email}>
          <input id="cust-email" type="email" className={err('email')} value={form.email} onChange={set('email')} placeholder="sanath@gmail.com" />
        </Field>
      </div>

      <Field id="cust-line1" label="Address" error={errors['address.line1']}>
        <input id="cust-line1" className={err('address.line1')} value={form.address.line1} onChange={setAddress('line1')} placeholder="No. 45, Temple Road" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="cust-city" label="City" error={errors['address.city']}>
          <input id="cust-city" className={err('address.city')} value={form.address.city} onChange={setAddress('city')} placeholder="Kurunegala" />
        </Field>
        <Field id="cust-district" label="District" error={errors['address.district']}>
          <select id="cust-district" className={err('address.district')} value={form.address.district} onChange={setAddress('district')}>
            <option value="">Choose district</option>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
      </div>
    </form>
  );
}
