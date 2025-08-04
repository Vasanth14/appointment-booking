import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';
import { setTokens, clearTokens, getAccessToken, decodeToken } from '@/lib/tokenUtils';
import { performLogout } from '@/lib/logoutUtils';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(credentials);
      
      const { user, tokens } = response;
      
      // Store tokens in localStorage
      setTokens(tokens.access.token, tokens.refresh.token);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: tokens.access.token };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(userData);
      const { user, tokens } = response;
      
      // Store tokens in localStorage
      setTokens(tokens.access.token, tokens.refresh.token);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: tokens.access.token };
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await performLogout();
      
      if (result.success) {
        return { message: result.message };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // First check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, user is not authenticated
        return null;
      }

      // Check if we have stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          return user;
        } catch (e) {
          // Failed to parse stored user data, continue to API call
        }
      }
      
      // If we have a token but no stored user, try API call
      const response = await apiClient.getProfile();
      return response;
    } catch (error) {
      // If API call fails, clear tokens and return null
      clearTokens();
      return rejectWithValue(error.message || 'Authentication check failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

const initialState = {
  user: null,
  token: null, // Don't call getAccessToken() during initialization
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false, // Track if auth has been initialized
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
         initializeToken: (state) => {
       if (typeof window !== 'undefined') {
         const token = localStorage.getItem('token');
         const user = localStorage.getItem('user');
         
         if (token && user) {
           try {
             state.token = token;
             state.user = JSON.parse(user);
             state.isAuthenticated = true;
           } catch (e) {
             // Failed to parse user data
           }
         } else if (token) {
           state.token = token;
         }
         
         state.initialized = true;
       }
     },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
             .addCase(loginUser.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.error = null;
       })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
             // Register
       .addCase(registerUser.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(registerUser.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.error = null;
       })
       .addCase(registerUser.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
       })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
             .addCase(checkAuth.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload;
         state.isAuthenticated = true;
         state.error = null;
         state.initialized = true;
       })
             .addCase(checkAuth.rejected, (state, action) => {
         state.loading = false;
         state.user = null;
         state.token = null;
         state.isAuthenticated = false;
         state.error = action.payload;
         state.initialized = true;
       })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading, initializeToken } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsUser = (state) => state.auth.user?.role === 'user';
export const selectAuthInitialized = (state) => state.auth.initialized;

export default authSlice.reducer; 