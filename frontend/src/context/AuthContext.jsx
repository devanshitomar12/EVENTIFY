import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('eventify_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user from /api/auth/me on mount or token change
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('eventify_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to verify token:', error.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      localStorage.setItem('eventify_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      localStorage.setItem('eventify_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('eventify_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const response = await api.put('/auth/profile', formData);
    if (response.success && response.data) {
      setUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Profile update failed');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER' || isAdmin;
  const isAttendee = user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isOrganizer,
        isAttendee,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
