'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAdmin, selectIsUser } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

// Define route access rules
const ROUTE_ACCESS = {
  // Admin-only routes
  '/dashboard/appointments': { admin: true, user: false },
  '/dashboard/slots': { admin: true, user: false },
  
  // User-only routes
  '/dashboard/my-bookings': { admin: false, user: true },
  '/dashboard/book-appointment': { admin: false, user: true },
  
  // Shared routes (both admin and user can access)
  '/dashboard': { admin: true, user: true },
};

export default function RoleBasedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isUser = useAppSelector(selectIsUser);
  const loading = useAppSelector(state => state.auth.loading);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const routeConfig = ROUTE_ACCESS[pathname];
      
      if (routeConfig) {
        // Check if user has access to this route
        const hasAccess = (isAdmin && routeConfig.admin) || (isUser && routeConfig.user);
        
        if (!hasAccess) {
          // Redirect based on user role
          if (isAdmin) {
            // Admin trying to access user page - redirect to admin dashboard
            router.push('/dashboard');
          } else {
            // User trying to access admin page - redirect to user dashboard
            router.push('/dashboard/my-bookings');
          }
        }
      }
    }
  }, [loading, isAuthenticated, isAdmin, isUser, pathname, router]);

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

  // If not authenticated, don't render children (ReduxProtectedRoute will handle login redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check route access
  const routeConfig = ROUTE_ACCESS[pathname];
  if (routeConfig) {
    const hasAccess = (isAdmin && routeConfig.admin) || (isUser && routeConfig.user);
    if (!hasAccess) {
      return null; // Don't render while redirecting
    }
  }

  return children;
} 