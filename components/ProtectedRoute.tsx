'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

// Check if we're in development mode without Keycloak configured
const isDevelopmentMode = 
  process.env.NODE_ENV === 'development' && 
  !process.env.NEXT_PUBLIC_KEYCLOAK_ENABLED;

/**
 * Wrapper component that protects routes requiring authentication
 * 
 * Development Mode: If NEXT_PUBLIC_KEYCLOAK_ENABLED is not set, 
 * this component will allow access without authentication for local testing.
 * 
 * Production Mode: Requires Keycloak authentication
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/api/auth/signin' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Skip auth check in development mode without Keycloak
    if (isDevelopmentMode) {
      return;
    }

    // In production or with Keycloak enabled, require authentication
    if (status === 'unauthenticated') {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  // Development mode without Keycloak - allow access
  if (isDevelopmentMode) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
