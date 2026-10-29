// U-arrow logo mark
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <g fill="none" className="stroke-primary-ink" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 13v8a8 8 0 0 0 16 0V11" />
        <path d="M23.5 15.5 28 11l4.5 4.5" />
      </g>
    </svg>
  );
}

export default function Logo({ className = '' }) {
  return (
    <span className={`logo flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-primary">Up</span>link
      </span>
    </span>
  );
}
