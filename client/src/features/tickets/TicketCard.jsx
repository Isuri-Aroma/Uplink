import Badge from '../../components/ui/Badge';
import { PRIORITY_TONE, TICKET_TONE } from '../../utils/status';
import { place } from '../../utils/format';
import { age } from '../../utils/time';

const initials = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function TicketCard({ ticket: t, onOpen }) {
  const sub = t.subscription;
  const done = t.status === 'Resolved' || t.status === 'Closed';

  return (
    <button
      onClick={() => onOpen(t)}
      className="card grid w-full grid-cols-[6px_1fr] overflow-hidden text-left transition-colors hover:border-primary sm:grid-cols-[6px_1fr_auto]"
    >
      <span className={`stripe--${t.priority}`} aria-hidden="true" />

      <div className="flex min-w-0 flex-col gap-1.5 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-muted">{t.ticketNo}</span>
          <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
          <Badge tone="off">{t.category}</Badge>
        </div>
        <p className="truncate font-bold">{t.subject}</p>
        <p className="truncate font-mono text-xs text-muted">
          {sub?.accountNo} · {sub?.customer?.nameWithInitials} · {sub && place(sub.installAddress)}
        </p>
      </div>

      <div className="col-start-2 flex items-center justify-between gap-3 border-t border-dashed border-line px-4 py-3 sm:col-start-auto sm:w-60 sm:flex-col sm:items-end sm:border-l sm:border-t-0">
        <p className="text-right">
          <span className="font-mono text-lg font-bold leading-none">{age(t.createdAt, done ? t.resolvedAt || t.closedAt : undefined)}</span>
          <span className="block text-[11px] text-muted">{done ? 'to resolve' : 'open'}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="avatar h-6 w-6 text-[10px]">
              {t.assignedTo ? initials(t.assignedTo.name) : '—'}
            </span>
            {t.assignedTo ? t.assignedTo.name.split(' ')[0] : 'Unassigned'}
          </span>
          <Badge tone={TICKET_TONE[t.status]} dot>{t.status}</Badge>
        </div>
      </div>
    </button>
  );
}
