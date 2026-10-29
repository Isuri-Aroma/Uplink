export default function StatCard({ icon: Icon, label, value, sub, tone = 'primary' }) {
  const tones = { primary: 'bg-primary-soft text-primary', accent: 'bg-accent/10 text-accent', bad: 'bg-bad-soft text-bad', warn: 'bg-warn-soft text-warn' };
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 truncate font-mono text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}
