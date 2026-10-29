import { dateTime } from '../../utils/format';

// Vertical history list: [{ status, note, at, by, label, dot }]
export default function Timeline({ items }) {
  return (
    <ol className="relative flex flex-col gap-5 border-l border-line pl-5">
      {items.map((h, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-surface ${h.dot}`} />
          <p className="text-sm font-bold">{h.label}</p>
          {h.note && <p className="text-sm">{h.note}</p>}
          <p className="text-xs text-muted">{dateTime(h.at)}{h.by?.name && ` · ${h.by.name}`}</p>
        </li>
      ))}
    </ol>
  );
}
