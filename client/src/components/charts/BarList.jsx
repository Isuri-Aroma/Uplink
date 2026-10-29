// Ranked horizontal bars, one colour
export default function BarList({ items, unit = '' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.label} className="bar-list__row" title={`${item.label}: ${item.value} ${unit}`}>
          <span className="min-w-0">
            <span className="bar-list__name">{item.label}</span>
            {item.sub && <span className="bar-list__sub">{item.sub}</span>}
          </span>
          <span className="bar-list__track">
            <span className="bar-list__fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="bar-list__value">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
