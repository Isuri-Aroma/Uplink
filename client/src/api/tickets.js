import api from './client';

export const listTickets = (params) => api.get('/tickets', { params }).then((r) => r.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then((r) => r.data);
export const createTicket = (data) => api.post('/tickets', data).then((r) => r.data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data).then((r) => r.data);
export const changeTicketStatus = (id, data) => api.patch(`/tickets/${id}/status`, data).then((r) => r.data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`).then((r) => r.data);
export const listStaff = () => api.get('/auth/staff').then((r) => r.data);

export const CATEGORIES = ['No Connection', 'Slow Speed', 'Intermittent Drops', 'Router Issue', 'Billing Query', 'Relocation Request'];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

// Buttons for each allowed status change
export const TICKET_ACTIONS = {
  Open: [
    { to: 'In Progress', label: 'Start work', tone: 'primary' },
    { to: 'Resolved', label: 'Resolve', tone: 'primary' },
  ],
  'In Progress': [{ to: 'Resolved', label: 'Resolve', tone: 'primary' }],
  Resolved: [
    { to: 'Closed', label: 'Close ticket', tone: 'primary' },
    { to: 'In Progress', label: 'Reopen', tone: 'warn' },
  ],
  Closed: [],
};
