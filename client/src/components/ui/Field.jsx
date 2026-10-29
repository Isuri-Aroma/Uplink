// Label + input + error message
export default function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
