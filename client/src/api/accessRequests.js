import api from './client';

export const sendAccessRequest = (data) => api.post('/access-requests', data).then((r) => r.data);
export const listAccessRequests = (params) => api.get('/access-requests', { params }).then((r) => r.data);
export const approveAccessRequest = (id, role) => api.patch(`/access-requests/${id}/approve`, { role }).then((r) => r.data);
export const rejectAccessRequest = (id, reason) => api.patch(`/access-requests/${id}/reject`, { reason }).then((r) => r.data);
export const deleteAccessRequest = (id) => api.delete(`/access-requests/${id}`).then((r) => r.data);

export const TEAMS = ['Customer Care', 'Field Operations', 'Network Operations', 'Billing', 'Sales'];
