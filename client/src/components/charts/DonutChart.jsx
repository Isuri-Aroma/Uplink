import { useState } from 'react';

const R = 70;
const C = 2 * Math.PI * R;
const GAP = 2;

// Donut with a legend; hover a segment or legend row to focus it
export default function DonutChart({ segments, centerLabel }) {
  const [active, setActive] = useState(null);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const focus = active !== null ? segments[active] : null;

  let offset = 0;
  const arcs = segments.map((s, i) => {
    const len = (s.value / total) * C;
    const arc = { ...s, i, dash: Math.max(0, len - GAP), offset };
    offset += len;
    return arc;
  });

  return (
    <div className="donut">
      <svg viewBox="0 0 180 180" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
        <g transform="rotate(-90 90 90)">
          <circle cx="90" cy="90" r={R} fill="none" className="donut__track" strokeWidth="18" />
          {arcs.map((a) =>
            a.value ? (
              <circle
                key={a.label}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={active === a.i ? 24 : 18}
                strokeDasharray={`${a.dash} ${C - a.dash}`}
                strokeDashoffset={-a.offset}
                className="donut__segment"
                onMouseEnter={() => setActive(a.i)}
                onMouseLeave={() => setActive(null)}
              />
            ) : null
          )}
        </g>
        <text x="90" y="86" textAnchor="middle" className="donut__value">{focus ? focus.value : centerLabel.value}</text>
        <text x="90" y="108" textAnchor="middle" className="donut__caption">{focus ? focus.label.toLowerCase() : centerLabel.text}</text>
      </svg>

      <ul className="legend">
        {segments.map((s, i) => (
          <li
            key={s.label}
            className={`legend__row ${active === i ? 'legend__row--active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="legend__swatch" style={{ background: s.color }} />
            <span className="legend__label">{s.label}</span>
            <span className="legend__value">{s.value}</span>
            <span className="legend__pct">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
