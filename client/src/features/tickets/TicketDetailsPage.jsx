import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { changeTicketStatus, deleteTicket, getTicket, TICKET_ACTIONS } from '../../api/tickets';
import { readError } from '../../api/client';
import { dateTime, place } from '../../utils/format';
import { PRIORITY_TONE, TICKET_TONE } from '../../utils/status';
import { age } from '../../utils/time';
import Badge from '../../components/ui/Badge';
import TechTile from '../../components/ui/TechTile';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusDialog from '../../components/ui/StatusDialog';
import Timeline from '../../components/ui/Timeline';
import TicketDrawer from './TicketDrawer';

const ACTION_BUTTON = {
  primary: 'btn-primary',
  warn: 'btn border border-warn/40 text-warn hover:bg-warn-soft',
};
const DOT = { Open: 'bg-bad', 'In Progress': 'bg-warn', Resolved: 'bg-ok', Closed: 'bg-off' };
const STRIPE = { Critical: 'bg-bad', High: 'bg-warn', Medium: 'bg-primary', Low: 'bg-off' };

function Detail({ label, children, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`text-sm ${mono ? 'font-mono' : ''}`}>{children || '—'}</dd>
    </div>
  );
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t, setT] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setT(await getTicket(id));
    } catch (err) {
      setError(readError(err).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const applyStatus = async (note) => {
    setBusy(true);
    setActionError('');
    try {
      const updated = await changeTicketStatus(id, { status: action.to, note });
      setT(updated);
      setAction(null);
      toast.success(`${updated.ticketNo} is now ${updated.status}`);
    } catch (err) {
      setActionError(readError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setActionError('');
    try {
      await deleteTicket(id);
      toast.success(`${t.ticketNo} deleted`);
      navigate('/tickets', { replace: true });
    } catch (err) {
      setActionError(readError(err).message);
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{error}</p>
        <Link to="/tickets" className="btn-primary mt-6">Back to tickets</Link>
      </div>
    );
  }
  if (!t) return <p className="text-sm text-muted">Loading ticket…</p>;

  const sub = t.subscription;
  const closed = t.status === 'Closed';
  const history = [...t.activity].reverse().map((h) => ({ ...h, label: h.status, dot: DOT[h.status] }));
  const actionText = {
    'In Progress': t.status === 'Resolved' ? 'The fix did not hold. The ticket goes back to In Progress and the old resolution is cleared.' : 'Mark that someone is working on this fault.',
    Resolved: 'Explain how the fault was fixed. This is saved as the resolution.',
    Closed: 'Close the ticket once the customer confirms the service is working.',
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/tickets" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> Trouble Tickets
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className={`w-1.5 shrink-0 rounded-full ${STRIPE[t.priority]}`} aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-muted">{t.ticketNo}</span>
              <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
              <Badge tone={TICKET_TONE[t.status]} dot>{t.status}</Badge>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{t.subject}</h1>
            <p className="mt-1 text-sm text-muted">
              {t.category} · opened {dateTime(t.createdAt)} · {t.resolvedAt ? `resolved in ${age(t.createdAt, t.resolvedAt)}` : `open for ${age(t.createdAt)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {TICKET_ACTIONS[t.status].map((a) => (
            <button key={a.label} className={ACTION_BUTTON[a.tone]} onClick={() => { setActionError(''); setAction(a); }}>{a.label}</button>
          ))}
          <button className="btn-ghost border border-line" onClick={() => import('./jobCardPdf').then((m) => m.downloadJobCard(t))}>
            <FileDown size={16} /> Job card PDF
          </button>
          {!closed && (
            <button className="btn-ghost border border-line" onClick={() => setEditing({ ticket: t })}>
              <Pencil size={16} /> Edit
            </button>
          )}
          <button className="btn-ghost border border-line text-bad hover:bg-bad-soft" onClick={() => { setActionError(''); setConfirmDelete(true); }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <section className="card flex flex-col gap-4 p-5">
            <h2 className="font-bold">Fault</h2>
            <p className="whitespace-pre-line text-sm">{t.description}</p>
            <dl className="grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 sm:grid-cols-3">
              <Detail label="Assigned to">{t.assignedTo?.name || 'Unassigned'}</Detail>
              <Detail label="Call-back number" mono>{t.contactMobile}</Detail>
              <Detail label="Category">{t.category}</Detail>
            </dl>
            {t.resolution && (
              <div className="rounded-lg bg-ok-soft px-4 py-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-ok">Resolution</p>
                <p className="mt-1">{t.resolution}</p>
              </div>
            )}
          </section>

          <section className="card flex flex-col gap-4 p-5">
            <h2 className="font-bold">Service</h2>
            <Link to={`/subscriptions/${sub?._id}`} className="flex items-center gap-3 rounded-lg border border-line p-3 hover:border-primary">
              <TechTile technology={sub?.plan?.technology} size="h-10 w-10" />
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-primary">{sub?.accountNo}</p>
                <p className="truncate text-sm">{sub?.plan?.name} · {sub && place(sub.installAddress)}</p>
              </div>
            </Link>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Detail label="Customer">{sub?.customer?.nameWithInitials}</Detail>
              <Detail label="NIC" mono>{sub?.customer?.nic}</Detail>
              <Detail label="Router serial" mono>{sub?.routerSerial}</Detail>
              <div className="col-span-full"><Detail label="Site address">{sub && `${sub.installAddress.line1}, ${place(sub.installAddress)}`}</Detail></div>
            </dl>
          </section>
        </div>

        <section className="card p-5">
          <h2 className="mb-4 font-bold">Activity</h2>
          <Timeline items={history} />
        </section>
      </div>

      <TicketDrawer open={editing} onClose={() => setEditing(null)} onSaved={(x) => { setEditing(null); setT(x); }} />

      <StatusDialog
        key={action?.label}
        action={action}
        title={`${action?.label}: ${t.ticketNo}`}
        message={action && actionText[action.to]}
        noteLabel={action?.to === 'Resolved' ? 'Resolution' : 'Note'}
        noteRequired={action?.to === 'Resolved'}
        busy={busy}
        error={actionError}
        onConfirm={applyStatus}
        onCancel={() => setAction(null)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${t.ticketNo}?`}
        message="Only closed tickets can be deleted. This can't be undone."
        busy={busy}
        error={actionError}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
