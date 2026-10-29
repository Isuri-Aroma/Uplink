import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCustomer, getCustomer } from '../../api/customers';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { readNic } from '../../utils/nic';
import { lkr, shortDate } from '../../utils/format';
import { SUBSCRIPTION_TONE } from '../../utils/status';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerDrawer from './CustomerDrawer';
import SubscriptionDrawer from '../subscriptions/SubscriptionDrawer';

function Detail({ label, children, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`text-sm ${mono ? 'font-mono' : ''}`}>{children || '—'}</dd>
    </div>
  );
}

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [ordering, setOrdering] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    try {
      setCustomer(await getCustomer(id));
    } catch (err) {
      setError(readError(err).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteCustomer(id);
      toast.success(`${customer.nameWithInitials} deleted`);
      navigate('/customers', { replace: true });
    } catch (err) {
      setDeleteError(readError(err).message);
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{error}</p>
        <Link to="/customers" className="btn-primary mt-6">Back to customers</Link>
      </div>
    );
  }
  if (!customer) return <p className="text-sm text-muted">Loading customer…</p>;

  const nic = readNic(customer.nic);
  const subColumns = [
    { key: 'acct', header: 'Account', render: (s) => <span className="font-mono text-xs font-medium text-primary">{s.accountNo}</span> },
    { key: 'plan', header: 'Plan', render: (s) => s.plan?.name },
    { key: 'fee', header: 'Monthly fee', align: 'right', render: (s) => <span className="tabular-nums">{lkr(s.plan?.monthlyFeeLKR)}</span> },
    { key: 'where', header: 'Installed at', render: (s) => s.installAddress.city },
    { key: 'date', header: 'Installed on', render: (s) => shortDate(s.installDate) },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={SUBSCRIPTION_TONE[s.status]} dot>{s.status}</Badge> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/customers" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> Customer Accounts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-extrabold text-primary">
            {customer.nameWithInitials.split(' ').pop()[0]}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{customer.nameWithInitials}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone={customer.customerType === 'Business' ? 'accent' : 'primary'}>{customer.customerType}</Badge>
              <span>Customer since {shortDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-line" onClick={() => setEditing(customer)}>
            <Pencil size={16} /> Edit
          </button>
          {isAdmin && (
            <button className="btn-ghost border border-line text-bad hover:bg-bad-soft" onClick={() => { setDeleteError(''); setConfirming(true); }}>
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Profile</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Detail label="Full name">{customer.fullName}</Detail></div>
            <Detail label="NIC" mono>{customer.nic}</Detail>
            <Detail label="Gender">{nic?.gender}</Detail>
            <Detail label="Date of birth">{nic && `${shortDate(nic.dob)} (age ${nic.age})`}</Detail>
            <Detail label="Mobile" mono>{customer.mobile}</Detail>
            <div className="col-span-2"><Detail label="Email">{customer.email}</Detail></div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Address</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Detail label="Street">{customer.address.line1}</Detail></div>
            <Detail label="City">{customer.address.city}</Detail>
            <Detail label="District">{customer.address.district}</Detail>
          </dl>
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-bold">Subscriptions ({customer.subscriptions.length})</h2>
          <button className="btn-ghost border border-line" onClick={() => setOrdering({ customerId: customer._id })}>
            <Plus size={16} /> New subscription
          </button>
        </div>
        <DataTable
          columns={subColumns}
          rows={customer.subscriptions}
          onRowClick={(s) => navigate(`/subscriptions/${s._id}`)}
          empty={{ title: 'No subscriptions yet', message: 'This customer has no broadband connections.' }}
        />
      </section>

      <CustomerDrawer
        customer={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />

      <SubscriptionDrawer
        open={ordering}
        onClose={() => setOrdering(null)}
        onSaved={(saved) => navigate(`/subscriptions/${saved._id}`)}
      />

      <ConfirmDialog
        open={confirming}
        title={`Delete ${customer.nameWithInitials}?`}
        message="The customer record will be removed. This can't be undone."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
