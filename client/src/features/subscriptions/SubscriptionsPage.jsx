import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { listSubscriptions, STATUSES } from '../../api/subscriptions';
import { DISTRICTS } from '../../api/customers';
import { listPlans } from '../../api/plans';
import { readError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { SUBSCRIPTION_TONE } from '../../utils/status';
import { place } from '../../utils/format';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import TechTile from '../../components/ui/TechTile';
import UsageBar from '../../components/ui/UsageBar';
import SubscriptionDrawer from './SubscriptionDrawer';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'account', label: 'Subscription number' },
  { value: 'installed', label: 'Recently installed' },
];

const TAB_TONE = { '': 'badge--primary', Pending: 'badge--warn', Active: 'badge--ok', Suspended: 'badge--bad', Terminated: 'badge--off' };

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  // Search lives in the URL so Back keeps it
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const setSearch = (value) => setParams(value ? { q: value } : {}, { replace: true });
  const [plan, setPlan] = useState('');
  const [district, setDistrict] = useState('');
  const [sort, setSort] = useState('newest');
  const [drawer, setDrawer] = useState(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    listPlans({ sort: 'name' }).then((d) => setPlans(d.plans)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSubscriptions({ search: debouncedSearch, status, plan, district, sort });
      setRows(data.subscriptions);
      setCounts(data.counts);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, plan, district, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [['', 'All', total], ...STATUSES.map((s) => [s, s, counts[s] || 0])];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subscriptions"
        description={`${counts.Active || 0} live connections · ${counts.Pending || 0} waiting for installation`}
        actions={
          <button className="btn-primary" onClick={() => setDrawer({})}>
            <Plus size={16} /> New subscription
          </button>
        }
      />

      <div className="status-tabs" role="tablist" aria-label="Filter by status">
        {tabs.map(([value, label, count]) => (
          <button
            key={label}
            role="tab"
            aria-selected={status === value}
            onClick={() => setStatus(value)}
            className="status-tab"
          >
            {label}
            <span className={`status-tab__count ${TAB_TONE[value]}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput id="sub-search" value={search} onChange={setSearch} placeholder="Subscription, router, name, NIC or mobile" />
        <SelectFilter id="sub-plan-filter" label="Plan" value={plan} onChange={setPlan}
          options={[{ value: '', label: 'All plans' }, ...plans.map((p) => ({ value: p._id, label: p.name }))]} />
        <SelectFilter id="sub-district-filter" label="District" value={district} onChange={setDistrict}
          options={[{ value: '', label: 'All districts' }, ...DISTRICTS.map((d) => ({ value: d, label: d }))]} />
        <SelectFilter id="sub-sort" label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {loading ? (
        <div className="skeleton h-72" aria-busy="true" />
      ) : rows.length ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {rows.map((s) => (
            <li key={s._id}>
              <button
                onClick={() => navigate(`/subscriptions/${s._id}`)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-3.5 text-left hover:bg-primary-soft/40
                  md:grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1fr)_100px_16px]"
              >
                <span className="font-mono text-sm font-semibold text-primary">{s.accountNo}</span>
                <span className="justify-self-end md:hidden"><Badge tone={SUBSCRIPTION_TONE[s.status]} dot>{s.status}</Badge></span>
                <div className="col-span-2 min-w-0 md:col-span-1">
                  <p className="truncate font-bold">{s.customer?.nameWithInitials}</p>
                  <p className="truncate text-xs text-muted">{place(s.installAddress)}</p>
                </div>
                <div className="flex min-w-0 items-center gap-2.5">
                  <TechTile technology={s.plan?.technology} />
                  <span className="truncate text-sm">{s.plan?.name}</span>
                </div>
                <UsageBar used={s.usedGB} cap={s.plan?.dataCapGB} installed={!!s.installDate} />
                <span className="hidden justify-self-end md:block"><Badge tone={SUBSCRIPTION_TONE[s.status]} dot>{s.status}</Badge></span>
                <ChevronRight size={16} className="hidden text-muted md:block" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          {...(debouncedSearch || status || plan || district
            ? { title: 'No subscriptions match', message: 'Try another tab, search or filter.' }
            : { title: 'No subscriptions yet', message: 'Create the first broadband order.' })}
        />
      )}

      <SubscriptionDrawer
        open={drawer}
        onClose={() => setDrawer(null)}
        onSaved={(saved) => { setDrawer(null); navigate(`/subscriptions/${saved._id}`); }}
      />
    </div>
  );
}
