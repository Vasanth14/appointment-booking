import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import slotReducer from './slices/slotSlice';
import bookingReducer from './slices/bookingSlice';
import clientReducer from './slices/clientSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    slots: slotReducer,
    bookings: bookingReducer,
    clients: clientReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 