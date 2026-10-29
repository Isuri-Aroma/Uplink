import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const BUTTON = { primary: 'btn-primary', danger: 'btn-danger', warn: 'btn bg-warn text-white hover:bg-warn/90 dark:text-bg' };

// Confirms a status change and asks for a note
export default function StatusDialog({ action, title, message, noteLabel = 'Note', noteRequired, busy, error, onConfirm, onCancel }) {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  if (!action) return null;

  const submit = (e) => {
    e.preventDefault();
    if (noteRequired && !note.trim()) return setNoteError(`${noteLabel} is required`);
    onConfirm(note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="status-title">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form onSubmit={submit} className="card relative flex w-full max-w-md flex-col gap-4 p-6 shadow-2xl" noValidate>
        <div>
          <h2 id="status-title" className="font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{message}</p>
        </div>
        <div>
          <label htmlFor="status-note" className="label">
            {noteLabel} {!noteRequired && <span className="font-normal text-muted">(optional)</span>}
          </label>
          <textarea
            id="status-note"
            rows="3"
            className={`input ${noteError ? 'input-error' : ''}`}
            value={note}
            onChange={(e) => { setNote(e.target.value); setNoteError(''); }}
            autoFocus
          />
          {noteError && <p className="field-error">{noteError}</p>}
        </div>
        {error && <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className={BUTTON[action.tone] || 'btn-primary'} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {action.label}
          </button>
        </div>
      </form>
    </div>
  );
}
