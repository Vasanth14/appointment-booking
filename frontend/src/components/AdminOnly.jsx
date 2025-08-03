'use client';

import { useAppSelector } from '@/store/hooks';
import { selectIsAdmin } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminOnly({ children }) {
  const isAdmin = useAppSelector(selectIsAdmin);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return children;
} 