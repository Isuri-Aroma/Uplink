import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUser, deleteUser, listUsers, updateUser } from '../../api/users';
import { readError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import { dateTime, shortDate } from '../../utils/format';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Drawer from '../../components/ui/Drawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StaffForm from './StaffForm';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'last-login', label: 'Last signed in' },
  { value: 'newest', label: 'Newest first' },
];

const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function StaffPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('name');
  const debouncedSearch = useDebounce(search);

  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers({ search: debouncedSearch, role, status, sort });
      setUsers(data.users);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, status, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const isSelf = (u) => u?._id === me?._id;

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing._id) {
        await updateUser(editing._id, data);
        toast.success(data.password ? `${data.name} updated and password reset` : `${data.name} updated`);
      } else {
        await createUser(data);
        toast.success(`${data.name} can now sign in`);
      }
      setEditing(null);
      load();
    } catch (err) {
      const { message, fields } = readError(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteUser(toDelete._id);
      toast.success(`${toDelete.name} removed`);
      setToDelete(null);
      load();
    } catch (err) {
      setDeleteError(readError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const openForm = (u) => {
    setErrors({});
    setEditing(u || {});
  };

  const columns = [
    {
      key: 'name',
      header: 'Staff member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${u.isActive ? 'bg-primary-soft text-primary' : 'bg-off-soft text-off'}`}>
            {initials(u.name)}
          </span>
          <div className="min-w-0 text-left">
            <p className="font-bold">{u.name}{isSelf(u) && <span className="ml-2 text-xs font-semibold text-muted">(you)</span>}</p>
            <p className="truncate text-xs text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={u.role === 'admin' ? 'accent' : 'primary'}>{u.role === 'admin' ? 'Admin' : 'Agent'}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <Badge tone={u.isActive ? 'ok' : 'off'} dot>{u.isActive ? 'Active' : 'Disabled'}</Badge> },
    { key: 'login', header: 'Last signed in', render: (u) => <span className="text-sm">{u.lastLoginAt ? dateTime(u.lastLoginAt) : 'Never'}</span> },
    { key: 'joined', header: 'Added', render: (u) => <span className="text-sm">{shortDate(u.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="rounded-lg p-2 text-muted hover:bg-primary-soft hover:text-primary" onClick={() => openForm(u)} aria-label={`Edit ${u.name}`}>
            <Pencil size={16} />
          </button>
          {isSelf(u) ? (
            <span className="w-8" aria-hidden="true" />
          ) : (
            <button
              className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"
              onClick={() => { setDeleteError(''); setToDelete(u); }}
              aria-label={`Remove ${u.name}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const admins = users.filter((u) => u.role === 'admin').length;
  const disabled = users.filter((u) => !u.isActive).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Access Control"
        description={loading ? 'Loading staff…' : `${users.length} staff · ${admins} admin · ${disabled} disabled`}
        actions={
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add staff
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput id="staff-search" value={search} onChange={setSearch} placeholder="Search name or email" />
        <SelectFilter id="staff-role-filter" label="Role" value={role} onChange={setRole}
          options={[{ value: '', label: 'All roles' }, { value: 'admin', label: 'Admins' }, { value: 'agent', label: 'Agents' }]} />
        <SelectFilter id="staff-status-filter" label="Status" value={status} onChange={setStatus}
          options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]} />
        <SelectFilter id="staff-sort" label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        onRowClick={openForm}
        empty={{ title: 'No staff match', message: 'Try a different search or filter.' }}
      />

      <Drawer
        open={!!editing}
        title={editing?._id ? `Edit ${editing.name}` : 'Add staff member'}
        subtitle={editing?._id ? editing.email : 'They sign in with this email and password'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button className="btn-primary" type="submit" form="staff-form" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing?._id ? 'Save changes' : 'Add staff'}
            </button>
          </>
        }
      >
        {editing && (
          <StaffForm
            key={editing._id || 'new'}
            formId="staff-form"
            user={editing._id ? editing : null}
            isSelf={isSelf(editing)}
            errors={errors}
            onChangeErrors={setErrors}
            onSubmit={save}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Remove ${toDelete?.name}?`}
        message="They will no longer be able to sign in. Their open tickets become unassigned. To keep their account, disable it instead."
        confirmLabel="Remove"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
