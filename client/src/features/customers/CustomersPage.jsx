import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CUSTOMER_TYPES, deleteCustomer, DISTRICTS, listCustomers } from '../../api/customers';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerDrawer from './CustomerDrawer';
import CustomerDirectory, { surname } from './CustomerDirectory';

const SORT_OPTIONS = [
  { value: 'name', label: 'Surname A–Z' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

// Directory order: surname, then initials
const bySurname = (a, b) => surname(a).localeCompare(surname(b)) || a.nameWithInitials.localeCompare(b.nameWithInitials);

export default function CustomersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search lives in the URL so Back keeps it
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const setSearch = (value) => setParams(value ? { q: value } : {}, { replace: true });
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('name');
  const debouncedSearch = useDebounce(search);

  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCustomers({ search: debouncedSearch, district, type, sort });
      setCustomers(sort === 'name' ? [...data.customers].sort(bySurname) : data.customers);
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

      {loading ? (
        <div className="card h-72 animate-pulse" aria-busy="true" />
      ) : customers.length ? (
        <CustomerDirectory
          customers={customers}
          grouped={sort === 'name'}
          canDelete={isAdmin}
          onOpen={(c) => navigate(`/customers/${c._id}`)}
          onEdit={setEditing}
          onDelete={(c) => { setDeleteError(''); setToDelete(c); }}
        />
      ) : (
        <EmptyState
          {...(filtered
            ? { title: 'No customers match', message: 'Try a different search or clear the filters.' }
            : { title: 'No customers yet', message: 'Register the first broadband customer.' })}
        />
      )}

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
