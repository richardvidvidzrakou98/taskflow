'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

export default function Home() {
  const { user, isLoading, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, isHydrated, router]);

  // Don't render anything until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  return <Loading text="Redirecting..." />;
}