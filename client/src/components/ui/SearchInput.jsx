import { Search, X } from 'lucide-react';

export default function SearchInput({ id, value, onChange, placeholder }) {
  return (
    <div className="search">
      <Search size={16} className="search__icon" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        aria-label={placeholder}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="search__clear" aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
