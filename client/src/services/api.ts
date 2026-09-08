import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lovedraw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth state
      if (!error.config.url?.includes('/auth/me')) {
        localStorage.removeItem('lovedraw_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
