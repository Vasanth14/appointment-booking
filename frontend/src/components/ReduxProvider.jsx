'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth, initializeToken } from '@/store/slices/authSlice';
import { AuthLoader } from './AuthLoader';
import { AuthRouter } from './AuthRouter';

function ReduxInitializer({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    
    // First, initialize token from localStorage
    dispatch(initializeToken());
    
    // Check if there's a token in localStorage first
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // If both token and user exist, check authentication
      dispatch(checkAuth());
    } else if (token) {
      // If only token exists, still try to check auth
      dispatch(checkAuth());
    } else {
      // No token found, mark as initialized but not authenticated
      console.log('ReduxInitializer: No token found, skipping auth check');
      // The initializeToken action will handle setting initialized to true
    }
  }, [dispatch]);

  return (
    <AuthLoader>
      <AuthRouter>
        {children}
      </AuthRouter>
    </AuthLoader>
  );
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  );
} 