import api, { TOKEN_STORAGE_KEY } from './api.js';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  async deleteAccount(confirmation) {
    const response = await api.post('/auth/delete-account', { confirmation });
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Stateless backend logout; ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  },

  removeToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export default authService;
