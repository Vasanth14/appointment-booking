'use client';

import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectAuthLoading } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

export function AuthLoader({ children }) {
  const initialized = useAppSelector(selectAuthInitialized);
  const loading = useAppSelector(selectAuthLoading);

  // Show loading screen only during initial auth check, not during logout
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Loading BookingFast
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Please wait while we set up...
          </p>
        </div>
      </div>
    );
  }

  return children;
} 