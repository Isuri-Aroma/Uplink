export default function StatCard({ icon: Icon, label, value, sub, tone = 'primary' }) {
  return (
    <div className="card stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}
