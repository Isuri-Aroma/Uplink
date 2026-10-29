// Data used this month against the plan cap
export default function UsageBar({ used = 0, cap = 0, large = false, installed = true }) {
  if (!installed) return <span className="text-xs text-muted">Not installed yet</span>;

  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const high = cap && pct >= 80;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className={`overflow-hidden rounded-full bg-line ${large ? 'h-2.5' : 'h-1.5'}`}>
        {cap > 0 && <div className={`h-full rounded-full ${high ? 'bg-warn' : 'bg-accent'}`} style={{ width: `${pct}%` }} />}
      </div>
      <span className={`text-xs ${high ? 'font-semibold text-warn' : 'text-muted'}`}>
        {cap ? `${used} of ${cap} GB · ${pct}%` : `${used} GB used · unlimited`}
      </span>
    </div>
  );
}
