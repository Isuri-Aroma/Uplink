// Upright bars: the biggest value is full height
export default function ColumnChart({ items, unit = '' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="column-chart">
      {items.map((item) => (
        <li key={item.title} className="column-chart__item" title={`${item.title}: ${item.value} ${unit}`}>
          <span className="column-chart__track">
            <span className="column-chart__bar" style={{ height: `${(item.value / max) * 100}%` }}>
              <span className="column-chart__value">{item.value}</span>
            </span>
          </span>
          <span className="column-chart__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
