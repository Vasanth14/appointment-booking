import { clearTokens } from './tokenUtils';
import apiClient from './api';

/**
 * Handles logout with proper error handling and fallbacks
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const performLogout = async () => {
  try {
    // Always try to call the API first
    const response = await apiClient.logout();
    
    // Clear local storage regardless of API response
    clearTokens();
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: response.message || 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout API failed:', error);
    
    // Even if API fails, clear local storage
    clearTokens();
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
};

/**
 * Force logout without API call (for emergency logout)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const forceLogout = () => {
  try {
    clearTokens();
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Force logout failed:', error);
    return {
      success: false,
      message: 'Logout failed'
    };
  }
}; 