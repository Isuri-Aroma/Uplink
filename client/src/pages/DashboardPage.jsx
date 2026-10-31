import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cable, Clock, LifeBuoy, Plus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '../api/dashboard';
import { readError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { place } from '../utils/format';
import { PRIORITY_TONE, TICKET_TONE } from '../utils/status';
import { age } from '../utils/time';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import BarList from '../components/charts/BarList';
import SubscriptionDrawer from '../features/subscriptions/SubscriptionDrawer';
import TicketDrawer from '../features/tickets/TicketDrawer';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function Panel({ title, link, children, className = '' }) {
  return (
    <section className={`card flex flex-col gap-4 p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-bold">{title}</h2>
        {link && (
          <Link to={link.to} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            {link.label} <ArrowRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [newSub, setNewSub] = useState(null);
  const [newTicket, setNewTicket] = useState(null);

  const load = useCallback(() => {
    getDashboard().then(setD).catch((err) => toast.error(readError(err).message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const s = d?.statuses || {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{greeting()}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-muted">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={() => setNewTicket({})}>
            <LifeBuoy size={16} /> Log a fault
          </button>
          <button className="btn-primary" onClick={() => setNewSub({})}>
            <Plus size={16} /> New subscription
          </button>
        </div>
      </div>

      {!d ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Cable} label="Live connections" value={s.Active || 0} sub={`of ${d.totalSubscriptions} subscriptions`} />
            <StatCard icon={Wallet} label="Monthly revenue" value={`LKR ${d.monthlyRevenue.toLocaleString('en-LK')}`} sub="from active plans" tone="accent" />
            <StatCard
              icon={LifeBuoy}
              label="Faults in queue"
              value={d.tickets.queue}
              sub={d.tickets.critical ? `${d.tickets.critical} critical · ${d.tickets.unassigned} unassigned` : `${d.tickets.unassigned} unassigned`}
              tone={d.tickets.critical ? 'bad' : 'primary'}
            />
            <StatCard
              icon={Clock}
              label="Avg. time to fix"
              value={d.avgResolveHours !== null ? `${d.avgResolveHours}h` : '—'}
              sub={`from ${d.resolvedCount} resolved tickets`}
              tone="warn"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="New connections per month" link={{ to: '/subscriptions', label: 'Subscriptions' }} className="lg:col-span-2">
              <BarList
                unit="new orders"
                items={d.months.map((m) => ({
                  label: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                  value: m.total,
                }))}
              />
            </Panel>
            <Panel title="Subscriptions by status">
              <BarList
                unit="subscriptions"
                items={[
                  { label: 'Active', value: s.Active || 0, color: 'rgb(var(--ok))' },
                  { label: 'Pending', value: s.Pending || 0, color: 'rgb(var(--warn))' },
                  { label: 'Suspended', value: s.Suspended || 0, color: 'rgb(var(--bad))' },
                  { label: 'Terminated', value: s.Terminated || 0, color: 'rgb(var(--off))' },
                ]}
              />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Most popular plans" link={{ to: '/plans', label: 'Catalogue' }}>
              <BarList unit="subscribers" items={d.topPlans.map((p) => ({ label: p.name, sub: p.technology, value: p.total }))} />
            </Panel>
            <Panel title="Most urgent faults" link={{ to: '/tickets', label: 'Fault queue' }} className="lg:col-span-2">
              {d.urgent.length ? (
                <ul className="flex flex-col gap-2">
                  {d.urgent.map((t) => (
                    <li key={t._id}>
                      <button
                        onClick={() => navigate(`/tickets/${t._id}`)}
                        className="grid w-full grid-cols-[4px_1fr_auto] items-center gap-3 overflow-hidden rounded-lg border border-line pr-3 text-left hover:border-primary"
                      >
                        <span className={`self-stretch stripe--${t.priority}`} />
                        <span className="min-w-0 py-2.5">
                          <span className="block truncate text-sm font-bold">{t.subject}</span>
                          <span className="block truncate font-mono text-xs text-muted">
                            {t.ticketNo} · {t.subscription?.customer?.nameWithInitials} · {t.subscription && place(t.subscription.installAddress)}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                          <span className="hidden sm:inline"><Badge tone={TICKET_TONE[t.status]} dot>{t.status}</Badge></span>
                          <span className="w-9 text-right font-mono text-sm font-bold">{age(t.createdAt)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-muted">The fault queue is clear.</p>
              )}
            </Panel>
          </div>
        </>
      )}

      <SubscriptionDrawer open={newSub} onClose={() => setNewSub(null)} onSaved={(x) => navigate(`/subscriptions/${x._id}`)} />
      <TicketDrawer open={newTicket} onClose={() => setNewTicket(null)} onSaved={(x) => navigate(`/tickets/${x._id}`)} />
    </div>
  );
}
