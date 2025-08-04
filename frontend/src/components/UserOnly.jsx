'use client';

import { useAppSelector } from '@/store/hooks';
import { selectIsUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserOnly({ children }) {
  const isUser = useAppSelector(selectIsUser);
  const router = useRouter();

  useEffect(() => {
    if (!isUser) {
      router.push('/dashboard');
    }
  }, [isUser, router]);

  if (!isUser) {
    return null;
  }

  return children;
} 