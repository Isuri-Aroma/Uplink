import api from './client';

export const listPlans = (params) => api.get('/plans', { params }).then((r) => r.data);
export const createPlan = (data) => api.post('/plans', data).then((r) => r.data);
export const updatePlan = (id, data) => api.put(`/plans/${id}`, data).then((r) => r.data);
export const deletePlan = (id) => api.delete(`/plans/${id}`).then((r) => r.data);

export const TECHNOLOGIES = ['Fibre', 'VDSL', '4G LTE', '5G'];
