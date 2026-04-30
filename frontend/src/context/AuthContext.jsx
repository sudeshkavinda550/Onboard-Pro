import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../api/authApi';
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '../utils/tokenStorage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await authApi.verifyToken(getToken());
      setUser(response.data.user);
    } catch (error) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await authApi.refreshToken(refreshToken);
          setToken(refreshResponse.data.token);
          setRefreshToken(refreshResponse.data.refreshToken);
          const userResponse = await authApi.verifyToken(refreshResponse.data.token);
          setUser(userResponse.data.user);
        } catch (refreshError) {
          removeToken();
          removeRefreshToken();
        }
      } else {
        removeToken();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, refreshToken, user } = response.data;
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(user);
    return user;
  };

  const logout = async () => {
    const token = getToken();
    if (token) {
      try {
        await authApi.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    removeToken();
    removeRefreshToken();
    setUser(null);
    window.location.href = '/login';
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    const { token, refreshToken, user } = response.data;
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(user);
    return user;
  };

  const forgotPassword = async (email) => {
    const response = await authApi.forgotPassword(email);
    return response.data;
  };
  
  const resetPassword = async (email, otp, password) => {
    const response = await authApi.resetPassword(email, otp, password);
    return response.data;
  };
  
  const verifyEmail = async (token) => {
    const response = await authApi.verifyEmail(token);
    return response.data;
  };

  const updateProfile = async (data) => {
    const token = getToken();
    const response = await authApi.updateProfile(data, token);
    setUser(response.data.user);
    return response.data.user;
  };

  const value = {
    user,
    login,
    logout,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};