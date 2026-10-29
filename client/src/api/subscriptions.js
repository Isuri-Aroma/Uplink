import api from './client';

export const listSubscriptions = (params) => api.get('/subscriptions', { params }).then((r) => r.data);
export const getSubscription = (id) => api.get(`/subscriptions/${id}`).then((r) => r.data);
export const createSubscription = (data) => api.post('/subscriptions', data).then((r) => r.data);
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data).then((r) => r.data);
export const changeSubscriptionStatus = (id, data) => api.patch(`/subscriptions/${id}/status`, data).then((r) => r.data);
export const deleteSubscription = (id) => api.delete(`/subscriptions/${id}`).then((r) => r.data);

export const STATUSES = ['Pending', 'Active', 'Suspended', 'Terminated'];

// Buttons for each allowed status change
export const ACTIONS = {
  Pending: [
    { to: 'Active', label: 'Activate', tone: 'primary' },
    { to: 'Terminated', label: 'Cancel subscription', tone: 'danger' },
  ],
  Active: [
    { to: 'Suspended', label: 'Suspend', tone: 'warn' },
    { to: 'Terminated', label: 'Terminate', tone: 'danger' },
  ],
  Suspended: [
    { to: 'Active', label: 'Reactivate', tone: 'primary' },
    { to: 'Terminated', label: 'Terminate', tone: 'danger' },
  ],
  Terminated: [],
};
