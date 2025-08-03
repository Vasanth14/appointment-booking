'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAdmin, selectAuthInitialized } from '@/store/slices/authSlice';

export function AuthRouter({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const initialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    if (!initialized) return; // Wait for auth to be initialized

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (isAuthenticated) {
      // User is authenticated
      if (isPublicRoute) {
        // Redirect authenticated users away from public routes
        if (isAdmin) {
          router.replace('/dashboard');
        } else {
          router.replace('/dashboard/my-bookings');
        }
      }
    } else {
      // User is not authenticated
      if (!isPublicRoute) {
        // Redirect unauthenticated users to login
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isAdmin, initialized, pathname, router]);

  return children;
} 