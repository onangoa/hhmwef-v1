'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';

export function useRequirePasswordChange() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user && user.mustChangePassword) {
      // Check if we're not already on the change password page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/change-password')) {
        router.push('/change-password?first=true');
      }
    }
  }, [user, router]);
}

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  useRequirePasswordChange();
  return <>{children}</>;
}