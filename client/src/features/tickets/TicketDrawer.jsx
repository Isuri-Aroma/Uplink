import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTicket, updateTicket } from '../../api/tickets';
import { readError } from '../../api/client';
import Drawer from '../../components/ui/Drawer';
import TicketForm from './TicketForm';

// open: { ticket } to edit, { subscriptionId } or {} to create
export default function TicketDrawer({ open, onClose, onSaved }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const ticket = open?.ticket;

  const save = async (data) => {
    setSaving(true);
    try {
      const saved = ticket ? await updateTicket(ticket._id, data) : await createTicket(data);
      toast.success(ticket ? `${saved.ticketNo} updated` : `${saved.ticketNo} logged`);
      onSaved(saved);
    } catch (err) {
      const { message, fields } = readError(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={!!open}
      title={ticket ? `Edit ${ticket.ticketNo}` : 'Log a fault'}
      subtitle={ticket ? ticket.subject : 'New trouble ticket'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" type="submit" form="ticket-form" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {ticket ? 'Save changes' : 'Log ticket'}
          </button>
        </>
      }
    >
      {open && (
        <TicketForm
          key={ticket?._id || 'new'}
          formId="ticket-form"
          ticket={ticket}
          subscriptionId={open.subscriptionId}
          errors={errors}
          onChangeErrors={setErrors}
          onSubmit={save}
        />
      )}
    </Drawer>
  );
}
