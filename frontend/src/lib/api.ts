import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ayush_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth or demo endpoints
      if (!error.config.url.includes('/auth/me') && !error.config.url.includes('/auth/demo-accounts')) {
        localStorage.removeItem('ayush_token');
        localStorage.removeItem('ayush_user');
      }
    }
    return Promise.reject(error);
  }
);
