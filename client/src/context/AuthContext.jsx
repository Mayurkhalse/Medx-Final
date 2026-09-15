import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on mount
  const checkAuth = useCallback(async () => {
    const savedToken = authService.getToken();
    if (!savedToken) {
      setUser(null);
      setProfile(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);
      setToken(savedToken);
      setError(null);
    } catch (err) {
      console.warn('[AUTH] Failed to restore session from token:', err.response?.data || err.message);
      authService.removeToken();
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for global auth expired events
    const handleExpired = () => {
      setUser(null);
      setProfile(null);
      setToken(null);
    };

    window.addEventListener('medx:auth:expired', handleExpired);
    return () => window.removeEventListener('medx:auth:expired', handleExpired);
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);
      setUser(data.user);
      setProfile(data.profile);
      setToken(data.token);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      setUser(data.user);
      setProfile(data.profile);
      setToken(data.token);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please check your inputs.';
      setError(msg);
      throw err;
    }
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await authService.updateProfile(profileData);
      if (data.user) setUser(data.user);
      if (data.profile) setProfile(data.profile);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update profile.';
      setError(msg);
      throw err;
    }
  };

  // Safe account deactivation/deletion handler
  const deleteAccount = async (confirmation) => {
    try {
      setError(null);
      const res = await authService.deleteAccount(confirmation);
      setUser(null);
      setProfile(null);
      setToken(null);
      return res;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete account.';
      setError(msg);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      setError(null);
    }
  };

  const value = {
    user,
    profile,
    token,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
