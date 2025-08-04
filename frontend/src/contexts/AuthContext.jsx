'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Only make API call if we have a token
        try {
          const userData = await apiClient.getProfile();
          setUser(userData.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // No token found, user is not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user state
      setUser(userData);
      
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/my-bookings');
      }
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);
      
      toast.success('Registration successful! Please log in.');
      
      // Redirect to login
      router.push('/login');
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('token');
      setUser(null);
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.updateProfile(userData);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 