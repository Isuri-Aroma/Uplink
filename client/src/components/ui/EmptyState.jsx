import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="card empty-state">
      <Inbox size={28} className="empty-state__icon" />
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__text">{message}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
