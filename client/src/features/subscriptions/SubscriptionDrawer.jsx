import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createSubscription, updateSubscription } from '../../api/subscriptions';
import { readError } from '../../api/client';
import Drawer from '../../components/ui/Drawer';
import SubscriptionForm from './SubscriptionForm';

// open: { subscription } to edit, { customerId } or {} to create
export default function SubscriptionDrawer({ open, onClose, onSaved }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const subscription = open?.subscription;

  const save = async (data) => {
    setSaving(true);
    try {
      const saved = subscription ? await updateSubscription(subscription._id, data) : await createSubscription(data);
      toast.success(subscription ? `${saved.accountNo} updated` : `${saved.accountNo} created as Pending`);
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
      title={subscription ? `Edit ${subscription.accountNo}` : 'New subscription'}
      subtitle={subscription ? subscription.customer?.nameWithInitials : 'Order a new broadband connection'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" type="submit" form="subscription-form" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {subscription ? 'Save changes' : 'Create order'}
          </button>
        </>
      }
    >
      {open && (
        <SubscriptionForm
          key={subscription?._id || 'new'}
          formId="subscription-form"
          subscription={subscription}
          customerId={open.customerId}
          errors={errors}
          onChangeErrors={setErrors}
          onSubmit={save}
        />
      )}
    </Drawer>
  );
}
