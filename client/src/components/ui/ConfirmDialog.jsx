import { AlertTriangle, Loader2 } from 'lucide-react';

// Asks before deleting; shows the server's reason if it fails
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, error, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="card relative w-full max-w-sm p-6 shadow-2xl">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bad-soft text-bad">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2 id="confirm-title" className="font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{message}</p>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy} autoFocus>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
