'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
}
