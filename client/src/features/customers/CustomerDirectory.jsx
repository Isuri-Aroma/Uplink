import { Fragment } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export const surname = (c) => c.nameWithInitials.trim().split(' ').pop();

const initials = (c) => {
  const parts = c.nameWithInitials.replace(/\./g, '').split(' ').filter(Boolean);
  return (parts.at(-2)?.[0] || '') + parts.at(-1)[0];
};

const CHIP = {
  Active: 'border-ok/40 text-ok',
  Pending: 'border-warn/40 text-warn',
  Suspended: 'border-bad/40 text-bad',
  Terminated: 'border-line text-muted line-through',
};

// Customer list grouped by surname letter
export default function CustomerDirectory({ customers, grouped, canDelete, onOpen, onEdit, onDelete }) {
  let letter = '';

  return (
    <div className="card overflow-hidden">
      {customers.map((c) => {
        const first = surname(c)[0].toUpperCase();
        const showLetter = grouped && first !== letter;
        letter = first;
        const business = c.customerType === 'Business';

        return (
          <Fragment key={c._id}>
            {showLetter && (
              <div className="border-b border-line bg-bg px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-muted">{first}</div>
            )}
            <div
              onClick={() => onOpen(c)}
              className="grid cursor-pointer grid-cols-[40px_1fr_auto] items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3 last:border-0 hover:bg-primary-soft/40
                md:grid-cols-[40px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:gap-x-4"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold ${business ? 'bg-accent/10 text-accent' : 'bg-primary-soft text-primary'}`}
                title={c.customerType}
              >
                {initials(c)}
              </span>

              <div className="min-w-0">
                <p className="truncate font-bold">{c.nameWithInitials}</p>
                <p className="truncate text-xs text-muted">{c.fullName}</p>
              </div>

              <div className="col-start-2 row-start-2 flex flex-col text-xs md:col-start-auto md:row-start-auto">
                <span className="font-mono">{c.nic}</span>
                <span className="font-mono text-muted">{c.mobile}</span>
              </div>

              <div className="hidden min-w-0 text-sm md:block">
                <p className="truncate">{c.address.city}</p>
                <p className="truncate text-xs text-muted">{c.address.district} District</p>
              </div>

              <div className="col-span-2 col-start-2 flex flex-wrap gap-1 md:col-span-1 md:col-start-auto md:justify-end">
                {c.accounts.slice(0, 3).map((a) => (
                  <span key={a.accountNo} title={a.status} className={`rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-medium ${CHIP[a.status]}`}>
                    {a.accountNo}
                  </span>
                ))}
                {c.accounts.length > 3 && <span className="px-1 text-xs text-muted">+{c.accounts.length - 3}</span>}
                {!c.accounts.length && <span className="text-xs text-muted">No subscriptions</span>}
              </div>

              <div className="col-start-3 row-start-1 flex justify-end gap-1 md:col-start-auto md:row-start-auto" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" onClick={() => onEdit(c)} aria-label={`Edit ${c.nameWithInitials}`}>
                  <Pencil size={15} />
                </button>
                {canDelete && (
                  <button className="icon-btn icon-btn--danger" onClick={() => onDelete(c)} aria-label={`Delete ${c.nameWithInitials}`}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
