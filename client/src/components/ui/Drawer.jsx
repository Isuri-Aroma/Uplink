import { useEffect } from 'react';
import { X } from 'lucide-react';

// Side panel for add / edit forms
export default function Drawer({ open, title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="overlay__backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer__head">
          <div>
            <h2 id="drawer-title" className="drawer__title">{title}</h2>
            {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </div>
    </div>
  );
}
