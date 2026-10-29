import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCustomer, updateCustomer } from '../../api/customers';
import { readError } from '../../api/client';
import Drawer from '../../components/ui/Drawer';
import CustomerForm from './CustomerForm';

// Add / edit customer panel
export default function CustomerDrawer({ customer, onClose, onSaved }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!customer?._id;

  const save = async (data) => {
    setSaving(true);
    try {
      const saved = isEdit ? await updateCustomer(customer._id, data) : await createCustomer(data);
      toast.success(isEdit ? `${data.nameWithInitials} updated` : `${data.nameWithInitials} registered`);
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
      open={!!customer}
      title={isEdit ? `Edit ${customer.nameWithInitials}` : 'Register customer'}
      subtitle={isEdit ? customer.nic : 'New broadband subscriber'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" type="submit" form="customer-form" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Register customer'}
          </button>
        </>
      }
    >
      {customer && (
        <CustomerForm
          key={customer._id || 'new'}
          formId="customer-form"
          customer={isEdit ? customer : null}
          errors={errors}
          onChangeErrors={setErrors}
          onSubmit={save}
        />
      )}
    </Drawer>
  );
}
