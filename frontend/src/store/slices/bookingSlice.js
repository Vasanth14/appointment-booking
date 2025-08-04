import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.getBookings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.getAllBookings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch all bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createBooking(bookingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ bookingId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateBooking(bookingId, bookingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await apiClient.cancelBooking(bookingId);
      return { bookingId, ...response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel booking');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMyBookings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my bookings');
    }
  }
);

export const fetchUpcomingBookings = createAsyncThunk(
  'bookings/fetchUpcomingBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMyUpcomingBookings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming bookings');
    }
  }
);

export const fetchPastBookings = createAsyncThunk(
  'bookings/fetchPastBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMyPastBookings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch past bookings');
    }
  }
);

export const fetchAdminUpcomingBookings = createAsyncThunk(
  'bookings/fetchAdminUpcomingBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getUpcomingBookings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming bookings');
    }
  }
);

export const fetchAdminPastBookings = createAsyncThunk(
  'bookings/fetchAdminPastBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getPastBookings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch past bookings');
    }
  }
);

const initialState = {
  bookings: [],
  myBookings: [],
  upcomingBookings: [],
  pastBookings: [],
  loading: false,
  error: null,
  selectedBooking: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Bookings (Admin)
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch All Bookings (Admin)
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.myBookings.push(action.payload);
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updateBookingInArray = (bookings) => {
          const index = bookings.findIndex(booking => booking.id === action.payload.id);
          if (index !== -1) {
            bookings[index] = action.payload;
          }
        };
        
        updateBookingInArray(state.bookings);
        updateBookingInArray(state.myBookings);
        updateBookingInArray(state.upcomingBookings);
        updateBookingInArray(state.pastBookings);
        
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const removeBookingFromArray = (bookings) => {
          return bookings.filter(booking => booking.id !== action.payload.bookingId);
        };
        
        state.bookings = removeBookingFromArray(state.bookings);
        state.myBookings = removeBookingFromArray(state.myBookings);
        state.upcomingBookings = removeBookingFromArray(state.upcomingBookings);
        state.pastBookings = removeBookingFromArray(state.pastBookings);
        
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
        state.error = null;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Upcoming Bookings
      .addCase(fetchUpcomingBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingBookings = action.payload;
        state.error = null;
      })
      .addCase(fetchUpcomingBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
             // Fetch Past Bookings
       .addCase(fetchPastBookings.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(fetchPastBookings.fulfilled, (state, action) => {
         state.loading = false;
         state.pastBookings = action.payload;
         state.error = null;
       })
       .addCase(fetchPastBookings.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
       })
       
       // Fetch Admin Upcoming Bookings
       .addCase(fetchAdminUpcomingBookings.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(fetchAdminUpcomingBookings.fulfilled, (state, action) => {
         state.loading = false;
         state.upcomingBookings = action.payload;
         state.error = null;
       })
       .addCase(fetchAdminUpcomingBookings.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
       })
       
       // Fetch Admin Past Bookings
       .addCase(fetchAdminPastBookings.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(fetchAdminPastBookings.fulfilled, (state, action) => {
         state.loading = false;
         state.pastBookings = action.payload;
         state.error = null;
       })
       .addCase(fetchAdminPastBookings.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
       });
  },
});

export const { clearError, setSelectedBooking, clearSelectedBooking } = bookingSlice.actions;

// Selectors
export const selectBookings = (state) => state.bookings.bookings;
export const selectMyBookings = (state) => state.bookings.myBookings;
export const selectUpcomingBookings = (state) => state.bookings.upcomingBookings;
export const selectPastBookings = (state) => state.bookings.pastBookings;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectBookingsError = (state) => state.bookings.error;
export const selectSelectedBooking = (state) => state.bookings.selectedBooking;

export default bookingSlice.reducer; 