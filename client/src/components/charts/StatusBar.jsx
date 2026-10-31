// One bar split by share of the total, with counts below
export default function StatusBar({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="status-bar">
      <div className="status-bar__track">
        {items.map((item) => (
          <span key={item.label} title={`${item.label}: ${item.value}`} style={{ width: `${total ? (item.value / total) * 100 : 0}%`, background: item.color }} />
        ))}
      </div>
      <ul className="status-bar__list">
        {items.map((item) => (
          <li key={item.label} className="status-bar__row">
            <span className="status-bar__dot" style={{ background: item.color }} />
            <span className="flex-1">{item.label}</span>
            <span className="status-bar__value">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
