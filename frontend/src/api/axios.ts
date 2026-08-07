import axios from 'axios';

// Apply interceptors to global axios defaults as well to support direct imports of plain axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ─── Impersonation Header ──────────────────────────────────────────────
  const impersonatedUser = localStorage.getItem('admin_impersonated_user');
  if (impersonatedUser) {
    try {
      const parsed = JSON.parse(impersonatedUser);
      const impersonatedId = parsed?._id || parsed?.id;
      if (impersonatedId && config.headers) {
        config.headers['X-Impersonate-User-Id'] = impersonatedId;
      }
    } catch {
      // JSON parse failed, ignore
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

// Create custom instance for base URL configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Also apply request and response interceptors to the custom instance
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const impersonatedUser = localStorage.getItem('admin_impersonated_user');
  if (impersonatedUser) {
    try {
      const parsed = JSON.parse(impersonatedUser);
      const impersonatedId = parsed?._id || parsed?.id;
      if (impersonatedId && config.headers) {
        config.headers['X-Impersonate-User-Id'] = impersonatedId;
      }
    } catch {
      // JSON parse failed, ignore
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);
