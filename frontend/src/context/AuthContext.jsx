import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('budgetbite_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('budgetbite_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage and verify
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('budgetbite_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('budgetbite_token', userToken);
    localStorage.setItem('budgetbite_user', JSON.stringify(userData));
  };

  const register = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('budgetbite_token', userToken);
    localStorage.setItem('budgetbite_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('budgetbite_token');
    localStorage.removeItem('budgetbite_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('budgetbite_user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
