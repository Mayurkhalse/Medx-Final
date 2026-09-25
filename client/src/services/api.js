import axios from 'axios';

// Storage key per Phase 1C Contract
export const TOKEN_STORAGE_KEY = 'medx_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize errors & handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized occurs, check if token was invalid/expired
    if (error.response && error.response.status === 401) {
      const errorCode = error.response.data?.error?.code;
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Dispatch custom event for AuthContext to detect logout if needed
        window.dispatchEvent(new Event('medx:auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
