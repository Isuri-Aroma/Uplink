import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, listTickets, PRIORITIES } from '../../api/tickets';
import { readError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import SelectFilter from '../../components/ui/SelectFilter';
import EmptyState from '../../components/ui/EmptyState';
import TicketCard from './TicketCard';
import TicketDrawer from './TicketDrawer';

const SORT_OPTIONS = [
  { value: 'priority', label: 'Most urgent first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('queue');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sort, setSort] = useState('priority');
  const [drawer, setDrawer] = useState(null);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTickets({ search: debouncedSearch, status: view, priority, category, assignedTo, sort });
      setTickets(data.tickets);
      setCounts(data.counts);
    } catch (err) {
      toast.error(readError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, view, priority, category, assignedTo, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const c = (s) => counts[s] || 0;
  const views = [
    ['queue', 'Queue', c('Open') + c('In Progress')],
    ['Open', 'Open', c('Open')],
    ['In Progress', 'In progress', c('In Progress')],
    ['Resolved', 'Resolved', c('Resolved')],
    ['Closed', 'Closed', c('Closed')],
    ['', 'All', Object.values(counts).reduce((a, b) => a + b, 0)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trouble Tickets"
        description={`${c('Open') + c('In Progress')} faults in the queue · ${c('Open')} not started`}
        actions={
          <button className="btn-primary" onClick={() => setDrawer({})}>
            <Plus size={16} /> Log a fault
          </button>
        }
      />

      <div className="segmented" role="tablist" aria-label="Ticket view">
        {views.map(([value, label, count]) => (
          <button
            key={label}
            role="tab"
            aria-selected={view === value}
            onClick={() => setView(value)}
            className="segmented__tab"
          >
            {label}
            <span className="segmented__count">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput id="tt-search" value={search} onChange={setSearch} placeholder="Search tickets or customers" />
        <SelectFilter id="tt-priority-filter" label="Priority" value={priority} onChange={setPriority}
          options={[{ value: '', label: 'All priorities' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]} />
        <SelectFilter id="tt-category-filter" label="Category" value={category} onChange={setCategory}
          options={[{ value: '', label: 'All categories' }, ...CATEGORIES.map((x) => ({ value: x, label: x }))]} />
        <SelectFilter id="tt-assigned-filter" label="Assigned to" value={assignedTo} onChange={setAssignedTo}
          options={[{ value: '', label: 'Anyone' }, { value: 'me', label: 'Assigned to me' }, { value: 'none', label: 'Unassigned' }]} />
        <SelectFilter id="tt-sort" label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : tickets.length ? (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => <TicketCard key={t._id} ticket={t} onOpen={(x) => navigate(`/tickets/${x._id}`)} />)}
        </div>
      ) : (
        <EmptyState
          {...(view === 'queue' && !debouncedSearch && !priority && !category && !assignedTo
            ? { title: 'Queue is clear', message: 'No open faults right now.' }
            : { title: 'No tickets match', message: 'Try another view, search or filter.' })}
        />
      )}

      <TicketDrawer open={drawer} onClose={() => setDrawer(null)} onSaved={(t) => navigate(`/tickets/${t._id}`)} />
    </div>
  );
}
