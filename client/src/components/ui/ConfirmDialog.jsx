import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Asks before deleting; shows the server's reason if it fails
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, error, onConfirm, onCancel }) {
  // Esc closes the dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="overlay dialog-wrap" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="overlay__backdrop" onClick={onCancel} />
      <div className="dialog dialog--small">
        <div className="flex gap-3">
          <span className="dialog__icon"><AlertTriangle size={18} /></span>
          <div>
            <h2 id="confirm-title" className="dialog__title">{title}</h2>
            <p className="dialog__text">{message}</p>
          </div>
        </div>
        {error && <p role="alert" className="dialog__error">{error}</p>}
        <div className="dialog__actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
