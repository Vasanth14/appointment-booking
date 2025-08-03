import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';
import { setTokens, clearTokens, getAccessToken, decodeToken } from '@/lib/tokenUtils';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('LoginUser thunk: Starting login with credentials:', credentials);
      const response = await apiClient.login(credentials);
      console.log('LoginUser thunk: API response:', response);
      
      const { user, tokens } = response;
      
      // Store tokens in localStorage
      setTokens(tokens.access.token, tokens.refresh.token);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('LoginUser thunk: Tokens and user data stored, returning user data');
      return { user, token: tokens.access.token };
    } catch (error) {
      console.error('LoginUser thunk: Error:', error);
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
      await apiClient.logout();
      clearTokens();
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      // Even if logout API fails, clear local storage
      clearTokens();
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      console.log('checkAuth: Starting authentication check');
      const token = getAccessToken();
      console.log('checkAuth: Token retrieved:', token ? 'exists' : 'null');
      
      if (!token) {
        console.log('checkAuth: No token found, throwing error');
        throw new Error('No token found');
      }
      
      // Decode and validate token
      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        console.log('checkAuth: Invalid token format');
        throw new Error('Invalid token format');
      }
      
      console.log('checkAuth: Token decoded successfully, user ID:', decodedToken.sub);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.log('checkAuth: Token is expired');
        throw new Error('Token expired');
      }
      
      // For now, let's try to get user data from localStorage if available
      // This is a fallback approach until we fix the backend endpoint
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('checkAuth: Using stored user data:', user);
          return user;
        } catch (e) {
          console.log('checkAuth: Failed to parse stored user data');
        }
      }
      
      // If no stored user, try API call
      console.log('checkAuth: Making API call to get profile');
      const response = await apiClient.getProfile();
      console.log('checkAuth: Profile response:', response);
      return response;
    } catch (error) {
      console.log('checkAuth: Error occurred:', error.message);
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
             console.log('initializeToken: Token and user set from localStorage');
           } catch (e) {
             console.log('initializeToken: Failed to parse user data');
           }
         } else if (token) {
           state.token = token;
           console.log('initializeToken: Token set from localStorage');
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
         console.log('LoginUser fulfilled: Updating state with payload:', action.payload);
         state.loading = false;
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.error = null;
         console.log('LoginUser fulfilled: New state:', { user: state.user, isAuthenticated: state.isAuthenticated });
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