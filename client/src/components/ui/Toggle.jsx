export default function Toggle({ id, checked, onChange, label, description }) {
  return (
    <label htmlFor={id} className="toggle">
      <span>
        <span className="toggle__title">{label}</span>
        {description && <span className="toggle__text">{description}</span>}
      </span>
      <span className="toggle__switch">
        <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle__track" />
        <span className="toggle__knob" />
      </span>
    </label>
  );
}
