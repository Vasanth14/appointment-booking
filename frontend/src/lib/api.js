const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
import { getAccessToken, getRefreshToken } from './tokenUtils';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API request: Adding Authorization header with token');
      } else {
        // Only log for non-auth endpoints to reduce noise
        if (!endpoint.startsWith('/auth/')) {
          console.log('API request: No token available');
        }
      }
    }

    console.log('API request:', { url, method: config.method || 'GET', headers: config.headers, body: config.body });

    try {
      const response = await fetch(url, config);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        
        // Don't log auth-related errors as errors for auth endpoints
        if (endpoint.startsWith('/auth/') && response.status === 401) {
          console.log('Auth endpoint returned 401 - this is expected for unauthenticated requests');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const hasContent = contentType && contentType.includes('application/json');
      
      if (hasContent) {
        const data = await response.json();
        console.log('API success response:', data);
        return data;
      } else {
        // For responses with no content (like 204 No Content)
        console.log('API success response: No content');
        return null;
      }
    } catch (error) {
      // Don't log auth-related errors as errors for auth endpoints
      if (endpoint.startsWith('/auth/') && error.message.includes('401')) {
        console.log('Auth endpoint error - this is expected for unauthenticated requests');
      } else {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const refreshToken = getRefreshToken();
    
    // If no refresh token is found, just return success
    // This handles cases where the user's session has already expired
    if (!refreshToken) {
      console.log('No refresh token found, skipping logout API call');
      return { message: 'Logged out successfully' };
    }
    
    try {
      return await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      // If the API call fails (e.g., token not found on server), 
      // we still want to log out locally
      console.log('Logout API failed, but proceeding with local logout:', error.message);
      return { message: 'Logged out successfully' };
    }
  }

  // User endpoints
  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Slot endpoints
  async getSlots(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/slots${queryString ? `?${queryString}` : ''}`);
  }

  async getAvailableSlots() {
    return this.request('/slots/available');
  }

  async createSlot(slotData) {
    return this.request('/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  }

  async updateSlot(slotId, slotData) {
    return this.request(`/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(slotData),
    });
  }

  async deleteSlot(slotId) {
    return this.request(`/slots/${slotId}`, {
      method: 'DELETE',
    });
  }



  // Booking endpoints
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getAllBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings/all${queryString ? `?${queryString}` : ''}`);
  }

  async createBooking(bookingData) {
    console.log('API createBooking - bookingData:', bookingData);
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(bookingId, bookingData) {
    return this.request(`/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  }

  async completeBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/complete`, {
      method: 'PATCH',
    });
  }

  async deleteBooking(bookingId) {
    return this.request(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // User bookings
  async getMyUpcomingBookings() {
    return this.request('/bookings/my-upcoming');
  }

  async getMyPastBookings() {
    return this.request('/bookings/my-past');
  }

  // Admin booking endpoints
  async getUpcomingBookings() {
    return this.request('/bookings/upcoming');
  }

  async getPastBookings() {
    return this.request('/bookings/past');
  }






}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient; 