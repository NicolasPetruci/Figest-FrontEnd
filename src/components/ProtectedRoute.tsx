'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="#10B981" />
      </Center>
    );
  }

  return <>{children}</>;
}
