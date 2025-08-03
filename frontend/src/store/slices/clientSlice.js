import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.getClients(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await apiClient.getClient(clientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch client');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createClient(clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create client');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ clientId, clientData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateClient(clientId, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update client');
    }
  }
);

const initialState = {
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
  },
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClient: (state, action) => {
      state.currentClient = action.payload;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
        state.error = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Client
      .addCase(fetchClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
        state.error = null;
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.error = null;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient && state.currentClient.id === action.payload.id) {
          state.currentClient = action.payload;
        }
        state.error = null;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setCurrentClient, 
  clearCurrentClient, 
  setFilters, 
  clearFilters 
} = clientSlice.actions;

// Selectors
export const selectClients = (state) => state.clients.clients;
export const selectCurrentClient = (state) => state.clients.currentClient;
export const selectClientsLoading = (state) => state.clients.loading;
export const selectClientsError = (state) => state.clients.error;
export const selectClientFilters = (state) => state.clients.filters;

export default clientSlice.reducer; 