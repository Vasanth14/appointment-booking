'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAdmin, selectIsUser, checkAuth } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

export default function ReduxProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  requireUser = false 
}) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isUser = useAppSelector(selectIsUser);
  const loading = useAppSelector(state => state.auth.loading);
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated && requireAuth) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, requireAuth]);

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
        return;
      }

      // If admin access is required but user is not admin
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard/my-bookings');
        return;
      }

      // If user access is required but user is admin
      if (requireUser && !isUser) {
        router.push('/dashboard');
        return;
      }

      // If user is authenticated and tries to access login/register
      if (isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        if (isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/my-bookings');
        }
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, isUser, requireAuth, requireAdmin, requireUser, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If admin access is required but user is not admin, don't render children
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // If user access is required but user is admin, don't render children
  if (requireUser && !isUser) {
    return null;
  }

  return children;
} 