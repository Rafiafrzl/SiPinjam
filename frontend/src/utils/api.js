import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    // Prioritaskan user_token baru, fallback ke legacy token
    let token = localStorage.getItem('user_token');
    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token sent in request:', token.substring(0, 20) + '...');
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors, not connection/network errors
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized received for:', error.config?.url);

      // Prevent infinite redirect loop
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login due to 401 error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_user');

        // Use setTimeout to prevent blocking
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
