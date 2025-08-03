import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';

// Async thunks
export const fetchSlots = createAsyncThunk(
  'slots/fetchSlots',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.getSlots(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch slots');
    }
  }
);

export const createSlot = createAsyncThunk(
  'slots/createSlot',
  async (slotData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createSlot(slotData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create slot');
    }
  }
);

export const updateSlot = createAsyncThunk(
  'slots/updateSlot',
  async ({ slotId, slotData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateSlot(slotId, slotData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update slot');
    }
  }
);

export const deleteSlot = createAsyncThunk(
  'slots/deleteSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      await apiClient.deleteSlot(slotId);
      return slotId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete slot');
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'slots/fetchAvailableSlots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getAvailableSlots();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available slots');
    }
  }
);

const initialState = {
  slots: [],
  availableSlots: [],
  loading: false,
  error: null,
  selectedSlot: null,
};

const slotSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    clearSelectedSlot: (state) => {
      state.selectedSlot = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Slots
      .addCase(fetchSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
        state.error = null;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Slot
      .addCase(createSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.slots.push(action.payload);
        state.error = null;
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Slot
      .addCase(updateSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlot.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.slots.findIndex(slot => slot._id === action.payload._id);
        if (index !== -1) {
          state.slots[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Slot
      .addCase(deleteSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = state.slots.filter(slot => slot._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Available Slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedSlot, clearSelectedSlot } = slotSlice.actions;

// Selectors
export const selectSlots = (state) => state.slots.slots;
export const selectSlotsLoading = (state) => state.slots.loading;
export const selectSlotsError = (state) => state.slots.error;
export const selectSelectedSlot = (state) => state.slots.selectedSlot;
export const selectAvailableSlots = (state) => {
  return state.slots.availableSlots;
};

export default slotSlice.reducer; 