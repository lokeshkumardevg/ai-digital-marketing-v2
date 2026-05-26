import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If Unauthorized, force global logout via localstorage purge if token implicitly expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      // Avoid hard page navigation (causes full refresh). Let app/router handle logout.
      // (No window.location.href)
    }
    return Promise.reject(error);
  }
);
