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
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="chart-grid" strokeDasharray={t ? '3 4' : undefined} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="chart-axis chart-axis--mono">{t}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.label} x={x(i)} y={height - 8} textAnchor="middle" className="chart-axis">{d.label}</text>
          ))}
          <path d={area} className="chart-area" />
          <path d={line} className="chart-line" />
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} className="chart-crosshair" />}
          {[hover ?? last].map((i) => (
            <circle key={i} cx={x(i)} cy={y(data[i].value)} r="4.5" className="chart-point" />
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
        <div className="chart-tip" style={{ left: x(hover), top: y(data[hover].value) - 8 }}>
          <b>{data[hover].full}</b>
          <strong>{data[hover].value}</strong> <span>{valueLabel}</span>
        </div>
      )}
    </div>
  );
}
