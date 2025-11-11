'use client';

import { useSession } from 'next-auth/react';

export type User = {
  id: string;
  email: string;
  name: string;
  department: string;
};

/**
 * Client-side hook to get current user
 * Use this in client components
 */
export function useCurrentUser(): { user: User | null; isLoading: boolean } {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return { user: null, isLoading: true };
  }

  if (!session || !session.user) {
    return { user: null, isLoading: false };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      department: session.user.department,
    },
    isLoading: false,
  };
}
