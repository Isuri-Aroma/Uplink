import axios from 'axios';

// API base URL
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export const TOKEN_KEY = 'uplink-token';

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sign out when the session expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      window.dispatchEvent(new Event('uplink:signed-out'));
    }
    return Promise.reject(err);
  }
);

// Error -> { message, fields }
export function readError(err) {
  const data = err.response?.data;
  if (!err.response) return { message: 'Cannot reach the Uplink server. Is it running?', fields: {} };
  const fields = {};
  (data?.details || []).forEach((d) => {
    if (!fields[d.field]) fields[d.field] = d.message;
  });
  return { message: data?.message || 'Something went wrong', fields };
}

export default api;
