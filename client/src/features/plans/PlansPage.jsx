import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPlan, deletePlan, listPlans, TECHNOLOGIES, updatePlan } from '../../api/plans';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import { dataCap, lkr, speed } from '../../utils/format';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Drawer from '../../components/ui/Drawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PlanForm from './PlanForm';

const TECH_TONE = { Fibre: 'primary', VDSL: 'off', '4G LTE': 'accent', '5G': 'accent' };

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

  const columns = [
    {
      key: 'name',
      header: 'Plan',
      render: (p) => (
        <div>
          <p className="font-bold">{p.name}</p>
          {p.description && <p className="hidden max-w-xs truncate text-xs text-muted md:block">{p.description}</p>}
        </div>
      ),
    },
    { key: 'technology', header: 'Technology', render: (p) => <Badge tone={TECH_TONE[p.technology]}>{p.technology}</Badge> },
    { key: 'speed', header: 'Speed', render: (p) => <span className="font-mono text-xs">{speed(p.downMbps, p.upMbps)}</span> },
    { key: 'data', header: 'Data', render: (p) => dataCap(p.dataCapGB) },
    { key: 'fee', header: 'Monthly fee', align: 'right', render: (p) => <span className="font-semibold tabular-nums">{lkr(p.monthlyFeeLKR)}</span> },
    { key: 'subs', header: 'Subscribers', align: 'right', render: (p) => <span className="tabular-nums">{p.subscriberCount}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={p.isActive ? 'ok' : 'off'} dot>{p.isActive ? 'On sale' : 'Inactive'}</Badge>,
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="rounded-lg p-2 text-muted hover:bg-primary-soft hover:text-primary" onClick={() => openForm(p)} aria-label={`Edit ${p.name}`}>
            <Pencil size={16} />
          </button>
          <button
            className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"
            onClick={() => { setDeleteError(''); setToDelete(p); }}
            aria-label={`Delete ${p.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    });
  }

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

      <DataTable
        columns={columns}
        rows={plans}
        loading={loading}
        onRowClick={openForm}
        empty={filtered
          ? { title: 'No plans match', message: 'Try a different search or clear the filters.' }
          : { title: 'No plans yet', message: 'Add the first broadband plan to start selling subscriptions.' }}
      />

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
