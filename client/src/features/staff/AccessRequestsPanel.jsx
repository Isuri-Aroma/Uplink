import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { approveAccessRequest, deleteAccessRequest, listAccessRequests, rejectAccessRequest } from '../../api/accessRequests';
import { readError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { shortDate } from '../../utils/format';
import { age } from '../../utils/time';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import StatusDialog from '../../components/ui/StatusDialog';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_TONE = { Pending: 'warn', Approved: 'ok', Rejected: 'off' };
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Approve: pick the role for the new account
function ApproveDialog({ request, busy, error, onConfirm, onCancel }) {
  const [role, setRole] = useState('agent');
  if (!request) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="approve-title">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="card relative flex w-full max-w-md flex-col gap-4 p-6 shadow-2xl">
        <div>
          <h2 id="approve-title" className="font-bold">Approve {request.name}?</h2>
          <p className="mt-1 text-sm text-muted">An account is created for {request.email}. They sign in with the password they chose.</p>
        </div>
        <fieldset>
          <legend className="label">Role</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['agent', 'Agent', 'Customers, subscriptions, tickets'], ['admin', 'Admin', 'Everything, plus plans and staff']].map(([v, l, h]) => (
              <label key={v} className={`flex cursor-pointer flex-col rounded-lg border p-3 ${role === v ? 'border-primary bg-primary-soft' : 'border-line'}`}>
                <input type="radio" name="approve-role" value={v} checked={role === v} onChange={() => setRole(v)} className="sr-only" />
                <span className={`text-sm font-bold ${role === v ? 'text-primary' : ''}`}>{l}</span>
                <span className="text-xs text-muted">{h}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">{error}</p>}
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm(role)} disabled={busy} autoFocus>
            {busy && <Loader2 size={16} className="animate-spin" />}
            Approve and create account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccessRequestsPanel({ onChanged }) {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Pending');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAccessRequests({ status, search: debouncedSearch });
      setRequests(data.requests);
      setCounts(data.counts);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // Runs an action, then refreshes this list and the staff list
  const run = async (fn, close) => {
    setBusy(true);
    setError('');
    try {
      const res = await fn();
      toast.success(res.message);
      close();
      load();
      onChanged();
    } catch (err) {
      setError(readError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const views = [['Pending', 'Pending'], ['Approved', 'Approved'], ['Rejected', 'Rejected'], ['', 'All']];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-line bg-surface p-1" role="tablist" aria-label="Request status">
          {views.map(([value, label]) => (
            <button
              key={label}
              role="tab"
              aria-selected={status === value}
              onClick={() => setStatus(value)}
              className={`flex h-8 items-center gap-2 rounded-md px-3 text-sm font-bold ${status === value ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink'}`}
            >
              {label} <span className="font-mono text-xs">{value ? counts[value] || 0 : total}</span>
            </button>
          ))}
        </div>
        <SearchInput id="ra-search" value={search} onChange={setSearch} placeholder="Search name, email or ID" />
      </div>

      {loading ? (
        <div className="card h-40 animate-pulse" aria-busy="true" />
      ) : requests.length ? (
        <ul className="flex flex-col gap-3">
          {requests.map((r) => (
            <li key={r._id} className="card grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex min-w-0 gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-extrabold text-primary">{initials(r.name)}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{r.name}</p>
                    <span className="font-mono text-xs text-muted">{r.employeeId}</span>
                    <Badge tone="primary">{r.team}</Badge>
                  </div>
                  <p className="truncate text-sm text-muted">{r.email} · requested {age(r.createdAt) === '0m' ? 'just now' : `${age(r.createdAt)} ago`}</p>
                  {r.reason && <p className="mt-1.5 text-sm">“{r.reason}”</p>}
                  {r.status !== 'Pending' && (
                    <p className="mt-1.5 text-xs text-muted">
                      {r.status} by {r.reviewedBy?.name || 'an admin'} on {shortDate(r.reviewedAt)}
                      {r.rejectReason && ` · ${r.rejectReason}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                {r.status === 'Pending' ? (
                  <>
                    <button className="btn border border-bad/40 text-bad hover:bg-bad-soft" onClick={() => { setError(''); setRejecting(r); }}>
                      <X size={16} /> Reject
                    </button>
                    <button className="btn-primary" onClick={() => { setError(''); setApproving(r); }}>
                      <Check size={16} /> Approve
                    </button>
                  </>
                ) : (
                  <>
                    <Badge tone={STATUS_TONE[r.status]} dot>{r.status}</Badge>
                    <button className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad" onClick={() => { setError(''); setRemoving(r); }} aria-label={`Delete request from ${r.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          {...(status === 'Pending' && !debouncedSearch
            ? { title: 'No requests waiting', message: 'New staff can ask for access from the sign-in page.' }
            : { title: 'No requests match', message: 'Try another tab or search.' })}
        />
      )}

      <ApproveDialog
        request={approving}
        busy={busy}
        error={error}
        onConfirm={(role) => run(() => approveAccessRequest(approving._id, role), () => setApproving(null))}
        onCancel={() => setApproving(null)}
      />
      <StatusDialog
        key={rejecting?._id}
        action={rejecting && { label: 'Reject request', tone: 'danger' }}
        title={`Reject ${rejecting?.name}?`}
        message="They will see this reason if they try to sign in."
        noteLabel="Reason"
        noteRequired
        busy={busy}
        error={error}
        onConfirm={(reason) => run(() => rejectAccessRequest(rejecting._id, reason), () => setRejecting(null))}
        onCancel={() => setRejecting(null)}
      />
      <ConfirmDialog
        open={!!removing}
        title={`Delete request from ${removing?.name}?`}
        message="Only the request record is removed. Any account already created stays."
        busy={busy}
        error={error}
        onConfirm={() => run(() => deleteAccessRequest(removing._id), () => setRemoving(null))}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
