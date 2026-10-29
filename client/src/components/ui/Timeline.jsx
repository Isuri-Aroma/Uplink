import { dateTime } from '../../utils/format';

// Vertical history list: [{ note, at, by, label, dot }]
export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((h, i) => (
        <li key={i} className="timeline__item">
          <span className={`timeline__dot ${h.dot}`} />
          <p className="timeline__label">{h.label}</p>
          {h.note && <p className="timeline__note">{h.note}</p>}
          <p className="timeline__meta">{dateTime(h.at)}{h.by?.name && ` · ${h.by.name}`}</p>
        </li>
      ))}
    </ol>
  );
}
