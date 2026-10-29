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
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
        <g transform="rotate(-90 90 90)">
          <circle cx="90" cy="90" r={R} fill="none" className="stroke-line/60" strokeWidth="18" />
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
                className="cursor-pointer transition-[stroke-width]"
                onMouseEnter={() => setActive(a.i)}
                onMouseLeave={() => setActive(null)}
              />
            ) : null
          )}
        </g>
        <text x="90" y="86" textAnchor="middle" className="fill-ink font-mono text-[30px] font-bold">
          {focus ? focus.value : centerLabel.value}
        </text>
        <text x="90" y="108" textAnchor="middle" className="fill-muted text-[11px]">
          {focus ? focus.label.toLowerCase() : centerLabel.text}
        </text>
      </svg>

      <ul className="flex min-w-36 flex-col gap-2 text-sm">
        {segments.map((s, i) => (
          <li
            key={s.label}
            className={`flex cursor-default items-center gap-2.5 rounded-md px-1 ${active === i ? 'bg-primary-soft/60' : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1">{s.label}</span>
            <span className="font-mono font-semibold tabular-nums">{s.value}</span>
            <span className="w-10 text-right text-xs text-muted tabular-nums">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
