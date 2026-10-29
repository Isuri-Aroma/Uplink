// Dropdown for list filters and sorting
export default function SelectFilter({ id, label, value, onChange, options }) {
  return (
    <label htmlFor={id} className="filter">
      <span className="sr-only">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
