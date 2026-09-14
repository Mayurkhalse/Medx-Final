import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('medx_token') || '');
  const [loading, setLoading] = useState(true);

  const API_HOST = 'http://localhost:5000';

  const fetchMe = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_HOST}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to load session user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe(token);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_HOST}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('medx_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server is currently unreachable' };
    }
  };

  const signup = async (signupData) => {
    try {
      const res = await fetch(`${API_HOST}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('medx_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server is currently unreachable' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_HOST}/api/auth/logout`, { method: 'POST' });
    } catch (err) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('medx_token');
    setToken('');
    setUser(null);
  };

  const refreshMe = () => fetchMe(token);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refreshMe,
    API_HOST
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
