// Ranked horizontal bars, one colour
export default function BarList({ items, unit = '' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item.label} className="group grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-3 text-sm" title={`${item.label}: ${item.value} ${unit}`}>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{item.label}</span>
            {item.sub && <span className="block truncate text-xs text-muted">{item.sub}</span>}
          </span>
          <span className="h-2.5 rounded-sm bg-bg">
            <span className="block h-full rounded-r-sm bg-primary transition-opacity group-hover:opacity-80" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono font-semibold tabular-nums">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
