import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ─── Impersonation Header ──────────────────────────────────────────────
  // When admin has switched to a client workspace, attach the target userId
  // so the backend JWT strategy resolves all req.user lookups as the client.
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
    // If Unauthorized, force global logout via localstorage purge if token implicitly expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      // Avoid hard page navigation (causes full refresh). Let app/router handle logout.
    }
    return Promise.reject(error);
  }
);
