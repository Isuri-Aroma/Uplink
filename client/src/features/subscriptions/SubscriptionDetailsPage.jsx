import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown, LifeBuoy, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ACTIONS, changeSubscriptionStatus, deleteSubscription, getSubscription } from '../../api/subscriptions';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { dataCap, lkr, shortDate, speed } from '../../utils/format';
import { SUBSCRIPTION_TONE } from '../../utils/status';
import Badge from '../../components/ui/Badge';
import TechTile from '../../components/ui/TechTile';
import UsageBar from '../../components/ui/UsageBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusDialog from '../../components/ui/StatusDialog';
import Timeline from '../../components/ui/Timeline';
import SubscriptionDrawer from './SubscriptionDrawer';
import TicketDrawer from '../tickets/TicketDrawer';

const ACTION_BUTTON = { primary: 'btn-primary', warn: 'btn-warn-outline', danger: 'btn-danger-outline' };

const DOT = { Pending: 'bg-warn', Active: 'bg-ok', Suspended: 'bg-bad', Terminated: 'bg-off' };

function Detail({ label, children, mono }) {
  return (
    <div className={`detail ${mono ? 'detail--mono' : ''}`}>
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
    </div>
  );
}

export default function SubscriptionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reporting, setReporting] = useState(null);

  const load = useCallback(async () => {
    try {
      setSub(await getSubscription(id));
    } catch (err) {
      setError(readError(err).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (a) => {
    setActionError('');
    setAction(a);
  };

  const applyStatus = async (note) => {
    setBusy(true);
    setActionError('');
    try {
      const updated = await changeSubscriptionStatus(id, { status: action.to, note });
      setSub(updated);
      setAction(null);
      toast.success(`${updated.accountNo} is now ${updated.status}`);
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
      await deleteSubscription(id);
      toast.success(`${sub.accountNo} deleted`);
      navigate('/subscriptions', { replace: true });
    } catch (err) {
      setActionError(readError(err).message);
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{error}</p>
        <Link to="/subscriptions" className="btn-primary mt-6">Back to subscriptions</Link>
      </div>
    );
  }
  if (!sub) return <p className="text-sm text-muted">Loading subscription…</p>;

  const { plan, customer } = sub;
  const terminated = sub.status === 'Terminated';
  // Same status as the step before = a detail change, not a status change
  const history = sub.statusHistory
    .map((h, i) => {
      const changed = i === 0 || h.status !== sub.statusHistory[i - 1].status;
      return { ...h, label: changed ? h.status : 'Updated', dot: changed ? DOT[h.status] : 'bg-line' };
    })
    .reverse();

  return (
    <div className="flex flex-col gap-6">
      <Link to="/subscriptions" className="back-link">
        <ArrowLeft size={16} /> Subscriptions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <TechTile technology={plan?.technology} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-bold tracking-tight">{sub.accountNo}</h1>
              <Badge tone={SUBSCRIPTION_TONE[sub.status]} dot>{sub.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              <Link to={`/customers/${customer?._id}`} className="font-semibold text-ink hover:text-primary">{customer?.nameWithInitials}</Link>
              {' · '}ordered {shortDate(sub.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS[sub.status].map((a) => (
            <button key={a.to} className={ACTION_BUTTON[a.tone]} onClick={() => openAction(a)}>{a.label}</button>
          ))}
          <button className="btn-outline" onClick={() => import('./serviceOrderPdf').then((m) => m.downloadServiceOrder(sub))}>
            <FileDown size={16} /> Service order PDF
          </button>
          {!terminated && (
            <button className="btn-outline" onClick={() => setReporting({ subscriptionId: sub._id })}>
              <LifeBuoy size={16} /> Report fault
            </button>
          )}
          {!terminated && (
            <button className="btn-outline" onClick={() => setEditing({ subscription: sub })}>
              <Pencil size={16} /> Edit
            </button>
          )}
          {isAdmin && (
            <button className="btn-danger-outline" onClick={() => { setActionError(''); setConfirmDelete(true); }}>
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card flex flex-col gap-4 p-5 lg:col-span-2">
          <h2 className="font-bold">Service</h2>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-lg font-extrabold">{plan?.name}</p>
              <p className="text-sm text-muted">{plan?.technology} · {speed(plan?.downMbps, plan?.upMbps)} · {dataCap(plan?.dataCapGB)}</p>
            </div>
            <p className="text-xl font-extrabold tabular-nums">{lkr(plan?.monthlyFeeLKR)} <span className="text-xs font-semibold text-muted">/ month</span></p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Data used this month</p>
            <UsageBar used={sub.usedGB} cap={plan?.dataCapGB} installed={!!sub.installDate} large />
          </div>
          <dl className="grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 sm:grid-cols-3">
            <Detail label="Installed on">{shortDate(sub.installDate)}</Detail>
            <Detail label="Router serial" mono>{sub.routerSerial}</Detail>
            <Detail label="Customer NIC" mono>{customer?.nic}</Detail>
            <div className="col-span-2"><Detail label="Installation address">{`${sub.installAddress.line1}, ${sub.installAddress.city}, ${sub.installAddress.district}`}</Detail></div>
            <Detail label="Mobile" mono>{customer?.mobile}</Detail>
            {sub.notes && <div className="col-span-full"><Detail label="Notes">{sub.notes}</Detail></div>}
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-bold">Status history</h2>
          <Timeline items={history} />
        </section>
      </div>

      <TicketDrawer open={reporting} onClose={() => setReporting(null)} onSaved={(tk) => navigate(`/tickets/${tk._id}`)} />

      <SubscriptionDrawer open={editing} onClose={() => setEditing(null)} onSaved={(s) => { setEditing(null); setSub(s); }} />

      <StatusDialog
        key={action?.to}
        action={action}
        title={`${action?.label} ${sub.accountNo}?`}
        message={action?.to === 'Terminated' ? 'This is final. A terminated subscription cannot be reactivated or edited.' : `The status will change from ${sub.status} to ${action?.to}.`}
        noteLabel={action?.to === 'Active' ? 'Note' : 'Reason'}
        noteRequired={action?.to !== 'Active'}
        busy={busy}
        error={actionError}
        onConfirm={applyStatus}
        onCancel={() => setAction(null)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${sub.accountNo}?`}
        message="Only pending orders and terminated subscriptions can be deleted. This can't be undone."
        busy={busy}
        error={actionError}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
