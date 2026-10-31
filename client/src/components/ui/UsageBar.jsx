// Data used this month against the plan cap
export default function UsageBar({ used = 0, cap = 0, large = false, installed = true }) {
  if (!installed) return <span className="usage__text">Not installed yet</span>;

  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const high = cap && pct >= 80;

  return (
    <div className={`usage ${large ? 'usage--large' : ''} ${high ? 'usage--high' : ''}`}>
      <div className="usage__track">
        {cap > 0 ? <div className="usage__fill" style={{ width: `${pct}%` }} /> : <div className="usage__fill usage__fill--unlimited" />}
      </div>
      <span className="usage__text">{cap ? `${used} of ${cap} GB · ${pct}%` : `${used} GB used · unlimited`}</span>
    </div>
  );
}
