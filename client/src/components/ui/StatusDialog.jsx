import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const BUTTON = { primary: 'btn btn-primary', danger: 'btn btn-danger', warn: 'btn btn-warn' };

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
    <div className="overlay dialog-wrap" role="dialog" aria-modal="true" aria-labelledby="status-title">
      <div className="overlay__backdrop" onClick={onCancel} />
      <form onSubmit={submit} className="dialog" noValidate>
        <div>
          <h2 id="status-title" className="dialog__title">{title}</h2>
          <p className="dialog__text">{message}</p>
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
        {error && <p role="alert" className="dialog__error">{error}</p>}
        <div className="dialog__actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className={BUTTON[action.tone] || 'btn btn-primary'} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {action.label}
          </button>
        </div>
      </form>
    </div>
  );
}
