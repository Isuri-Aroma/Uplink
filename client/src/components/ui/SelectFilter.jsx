// Dropdown for list filters and sorting
export default function SelectFilter({ id, label, value, onChange, options }) {
  return (
    <label htmlFor={id} className="flex flex-1 items-center gap-2 text-sm sm:flex-none">
      <span className="sr-only">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input pr-8 font-semibold sm:w-auto">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
