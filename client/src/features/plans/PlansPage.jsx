import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPlan, deletePlan, listPlans, TECHNOLOGIES, updatePlan } from '../../api/plans';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import EmptyState from '../../components/ui/EmptyState';
import Drawer from '../../components/ui/Drawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PlanForm from './PlanForm';
import PlanCard from './PlanCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'fee-asc', label: 'Fee: low to high' },
  { value: 'fee-desc', label: 'Fee: high to low' },
  { value: 'speed-desc', label: 'Fastest first' },
];

export default function PlansPage() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [technology, setTechnology] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const debouncedSearch = useDebounce(search);

  const [editing, setEditing] = useState(null); // null = closed, {} = new, plan = edit
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPlans({ search: debouncedSearch, technology, status, sort });
      setPlans(data.plans);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, technology, status, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (plan) => {
    setFormErrors({});
    setEditing(plan || {});
  };

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing._id) {
        await updatePlan(editing._id, data);
        toast.success(`${data.name} updated`);
      } else {
        await createPlan(data);
        toast.success(`${data.name} added to the catalogue`);
      }
      setEditing(null);
      load();
    } catch (err) {
      const { message, fields } = readError(err);
      setFormErrors(fields);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deletePlan(toDelete._id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      load();
    } catch (err) {
      setDeleteError(readError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const askDelete = (p) => {
    setDeleteError('');
    setToDelete(p);
  };

  const onSale = plans.filter((p) => p.isActive).length;
  const filtered = debouncedSearch || technology || status;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Product Catalogue"
        description={loading ? 'Loading plans…' : `${plans.length} broadband plans · ${onSale} on sale`}
        actions={isAdmin && (
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add plan
          </button>
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput id="plan-search" value={search} onChange={setSearch} placeholder="Search plans by name" />
        <SelectFilter id="plan-tech" label="Technology" value={technology} onChange={setTechnology}
          options={[{ value: '', label: 'All technologies' }, ...TECHNOLOGIES.map((t) => ({ value: t, label: t }))]} />
        <SelectFilter id="plan-status" label="Status" value={status} onChange={setStatus}
          options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'On sale' }, { value: 'inactive', label: 'Inactive' }]} />
        <SelectFilter id="plan-sort" label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[1, 2, 3].map((i) => <div key={i} className="card h-60 animate-pulse" />)}
        </div>
      ) : plans.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p._id} plan={p} canEdit={isAdmin} onOpen={openForm} onEdit={openForm} onDelete={askDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          {...(filtered
            ? { title: 'No plans match', message: 'Try a different search or clear the filters.' }
            : { title: 'No plans yet', message: 'Add the first broadband plan to start selling subscriptions.' })}
        />
      )}

      <Drawer
        open={!!editing}
        title={!isAdmin ? editing?.name : editing?._id ? `Edit ${editing.name}` : 'Add plan'}
        subtitle={!isAdmin ? 'Only admins can change the catalogue' : editing?._id ? `${editing.subscriberCount} subscribers on this plan` : 'New broadband package'}
        onClose={() => setEditing(null)}
        footer={isAdmin ? (
          <>
            <button className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button className="btn-primary" type="submit" form="plan-form" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing?._id ? 'Save changes' : 'Add plan'}
            </button>
          </>
        ) : (
          <button className="btn-ghost" onClick={() => setEditing(null)}>Close</button>
        )}
      >
        {editing && (
          <PlanForm
            key={editing._id || 'new'}
            formId="plan-form"
            plan={editing._id ? editing : null}
            readOnly={!isAdmin}
            errors={formErrors}
            onChangeErrors={setFormErrors}
            onSubmit={save}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.name}?`}
        message="The plan will be removed from the catalogue. This can't be undone."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
