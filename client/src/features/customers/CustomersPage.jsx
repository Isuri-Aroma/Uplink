import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CUSTOMER_TYPES, deleteCustomer, DISTRICTS, listCustomers } from '../../api/customers';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerDrawer from './CustomerDrawer';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
];

export default function CustomersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const debouncedSearch = useDebounce(search);

  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCustomers({ search: debouncedSearch, district, type, sort });
      setCustomers(data.customers);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, district, type, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteCustomer(toDelete._id);
      toast.success(`${toDelete.nameWithInitials} deleted`);
      setToDelete(null);
      load();
    } catch (err) {
      setDeleteError(readError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div>
          <p className="font-bold">{c.nameWithInitials}</p>
          <p className="hidden max-w-xs truncate text-xs text-muted md:block">{c.fullName}</p>
        </div>
      ),
    },
    { key: 'nic', header: 'NIC', render: (c) => <span className="font-mono text-xs">{c.nic}</span> },
    { key: 'mobile', header: 'Mobile', render: (c) => <span className="font-mono text-xs">{c.mobile}</span> },
    {
      key: 'location',
      header: 'Location',
      render: (c) => (
        <div>
          <p>{c.address.city}</p>
          <p className="hidden text-xs text-muted md:block">{c.address.district} District</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (c) => <Badge tone={c.customerType === 'Business' ? 'accent' : 'primary'}>{c.customerType}</Badge>,
    },
    { key: 'subs', header: 'Subscriptions', align: 'right', render: (c) => <span className="tabular-nums">{c.subscriptionCount}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="rounded-lg p-2 text-muted hover:bg-primary-soft hover:text-primary" onClick={() => setEditing(c)} aria-label={`Edit ${c.nameWithInitials}`}>
            <Pencil size={16} />
          </button>
          {isAdmin && (
            <button
              className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"
              onClick={() => { setDeleteError(''); setToDelete(c); }}
              aria-label={`Delete ${c.nameWithInitials}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filtered = debouncedSearch || district || type;
  const business = customers.filter((c) => c.customerType === 'Business').length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer Accounts"
        description={loading ? 'Loading customers…' : `${customers.length} customers · ${business} business accounts`}
        actions={
          <button className="btn-primary" onClick={() => setEditing({})}>
            <Plus size={16} /> Register customer
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput id="cust-search" value={search} onChange={setSearch} placeholder="Search name, NIC or mobile" />
        <SelectFilter id="cust-district-filter" label="District" value={district} onChange={setDistrict}
          options={[{ value: '', label: 'All districts' }, ...DISTRICTS.map((d) => ({ value: d, label: d }))]} />
        <SelectFilter id="cust-type-filter" label="Customer type" value={type} onChange={setType}
          options={[{ value: '', label: 'All types' }, ...CUSTOMER_TYPES.map((t) => ({ value: t, label: t }))]} />
        <SelectFilter id="cust-sort" label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        rows={customers}
        loading={loading}
        onRowClick={(c) => navigate(`/customers/${c._id}`)}
        empty={filtered
          ? { title: 'No customers match', message: 'Try a different search or clear the filters.' }
          : { title: 'No customers yet', message: 'Register the first broadband customer.' }}
      />

      <CustomerDrawer
        customer={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.nameWithInitials}?`}
        message="The customer record will be removed. This can't be undone."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
