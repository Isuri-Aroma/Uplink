import { useState } from 'react';
import useWidth from '../../hooks/useWidth';

const PAD = { top: 12, right: 12, bottom: 26, left: 28 };

// Single-series area chart with hover crosshair
export default function AreaChart({ data, height = 220, valueLabel = 'value' }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const max = Math.max(2, ...data.map((d) => d.value));
  const step = max > 8 ? Math.ceil(max / 4) : max > 4 ? 2 : 1;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  const w = Math.max(0, width - PAD.left - PAD.right);
  const h = height - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
  const y = (v) => PAD.top + h - (v / top) * h;

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = data.length - 1;
  const band = data.length > 1 ? w / (data.length - 1) : w;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${valueLabel} by month`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray={t ? '3 4' : undefined} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[10px]">{t}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.label} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted text-[10px]">{d.label}</text>
          ))}
          <path d={area} className="fill-primary/10" />
          <path d={line} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} className="stroke-muted" strokeDasharray="3 3" />
          )}
          {[hover ?? last].map((i) => (
            <circle key={i} cx={x(i)} cy={y(data[i].value)} r="4.5" className="fill-primary stroke-surface" strokeWidth="2" />
          ))}
          {data.map((d, i) => (
            <rect
              key={d.label}
              x={x(i) - band / 2}
              y={PAD.top}
              width={band}
              height={h}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
      )}
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: x(hover), top: y(data[hover].value) - 8 }}
        >
          <span className="font-semibold">{data[hover].full}</span>
          <span className="ml-2 font-mono font-bold">{data[hover].value}</span> <span className="text-muted">{valueLabel}</span>
        </div>
      )}
    </div>
  );
}
