import axios from 'axios';

const api = axios.create({
  baseURL:import.meta.env.VITE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('token');
    if (raw) {
        config.headers.Authorization = `Bearer ${raw}`;
    }
  } catch (e) {
    console.error(e);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    // Standardize error text extraction so callers can easily handle it
    const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error.message || 'An unexpected error occurred';
    error.friendlyMessage = errorMessage;
    return Promise.reject(error);
  }
);

export default api;
