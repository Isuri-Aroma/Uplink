import { useEffect, useState } from 'react';
import { listSubscriptions } from '../../api/subscriptions';
import { CATEGORIES, listStaff, PRIORITIES } from '../../api/tickets';
import Field from '../../components/ui/Field';

const PRIORITY_ON = {
  Critical: 'border-bad bg-bad-soft text-bad',
  High: 'border-warn bg-warn-soft text-warn',
  Medium: 'border-primary bg-primary-soft text-primary',
  Low: 'border-off bg-off-soft text-off',
};

export function validateTicket(f, isEdit) {
  const e = {};
  if (!isEdit && !f.subscription) e.subscription = 'Choose the affected subscription';
  if (!f.category) e.category = 'Choose a category';
  if (f.subject.trim().length < 5) e.subject = 'Write a short subject (at least 5 characters)';
  else if (f.subject.trim().length > 100) e.subject = 'Subject must be 100 characters or less';
  if (f.description.trim().length < 10) e.description = 'Describe the fault (at least 10 characters)';
  else if (f.description.trim().length > 1000) e.description = 'Description must be 1000 characters or less';
  if (f.contactMobile && !/^07\d{8}$/.test(f.contactMobile.replace(/[\s-]/g, ''))) e.contactMobile = 'Enter a mobile number like 0771234567';
  return e;
}

export default function TicketForm({ ticket, subscriptionId, errors, onChangeErrors, onSubmit, formId }) {
  const isEdit = !!ticket;
  const [subs, setSubs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(() => ({
    subscription: ticket?.subscription?._id || subscriptionId || '',
    category: ticket?.category || '',
    priority: ticket?.priority || 'Medium',
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    contactMobile: ticket?.contactMobile || '',
    assignedTo: ticket?.assignedTo?._id || '',
  }));

  useEffect(() => {
    listStaff().then(setStaff).catch(() => {});
    if (!isEdit) {
      listSubscriptions({ sort: 'account' })
        .then((d) => setSubs(d.subscriptions.filter((s) => s.status !== 'Terminated')))
        .catch(() => {});
    }
  }, [isEdit]);

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) onChangeErrors({ ...errors, [key]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateTicket(form, isEdit);
    onChangeErrors(found);
    if (Object.keys(found).length) return;
    const data = {
      category: form.category,
      priority: form.priority,
      subject: form.subject.trim(),
      description: form.description.trim(),
      contactMobile: form.contactMobile.replace(/[\s-]/g, ''),
      assignedTo: form.assignedTo,
    };
    if (!isEdit) data.subscription = form.subscription;
    onSubmit(data);
  };

  const err = (key) => (errors[key] ? 'input input-error' : 'input');

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
      {!isEdit && (
        <Field id="tt-sub" label="Affected subscription" error={errors.subscription}>
          <select id="tt-sub" className={err('subscription')} value={form.subscription} onChange={set('subscription')} disabled={!!subscriptionId}>
            <option value="">Choose subscription</option>
            {subs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.accountNo} · {s.customer?.nameWithInitials} · {s.plan?.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field id="tt-category" label="Category" error={errors.category}>
        <select id="tt-category" className={err('category')} value={form.category} onChange={set('category')}>
          <option value="">Choose category</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>

      <fieldset>
        <legend className="label">Priority</legend>
        <div className="grid grid-cols-4 gap-2">
          {PRIORITIES.map((p) => (
            <label
              key={p}
              className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold ${
                form.priority === p ? PRIORITY_ON[p] : 'border-line text-muted hover:text-ink'
              }`}
            >
              <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={set('priority')} className="sr-only" />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="tt-subject" label="Subject" error={errors.subject}>
        <input id="tt-subject" className={err('subject')} value={form.subject} onChange={set('subject')} placeholder="e.g. Red LOS light on ONT" />
      </Field>

      <Field id="tt-desc" label="What is the customer reporting?" error={errors.description}>
        <textarea id="tt-desc" rows="4" className={err('description')} value={form.description} onChange={set('description')}
          placeholder="e.g. No internet since this morning, LOS light is red on the router." />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="tt-contact" label="Call-back number" hint={!isEdit && "Leave empty to use the customer's mobile"} error={errors.contactMobile}>
          <input id="tt-contact" type="tel" className={`${err('contactMobile')} font-mono`} value={form.contactMobile} onChange={set('contactMobile')} placeholder="0771234567" />
        </Field>
        <Field id="tt-assign" label="Assign to">
          <select id="tt-assign" className="input" value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">Unassigned</option>
            {staff.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </Field>
      </div>
    </form>
  );
}
