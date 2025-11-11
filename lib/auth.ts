import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";

export type User = {
  id: string;
  email: string;
  name: string;
  department: string;
};

// Check if we're in development mode without Keycloak
const isDevelopmentMode = 
  process.env.NODE_ENV === 'development' && 
  !process.env.KEYCLOAK_CLIENT_ID;

/**
 * Mock user for development mode when Keycloak is not configured
 */
const mockUser: User = {
  id: 'dev-user-id',
  email: 'dev@company.com',
  name: 'Dev User',
  department: 'IT Infrastructure'
};

/**
 * Get the current authenticated user from the session
 * Returns null if no user is authenticated
 * 
 * In development mode without Keycloak, returns a mock user
 */
export async function getCurrentUser(): Promise<User | null> {
  // Development mode without Keycloak - return mock user
  if (isDevelopmentMode) {
    console.log('🔧 Development mode: Using mock user (Keycloak not configured)');
    return mockUser;
  }

  // Production mode - use real Keycloak authentication
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  // Extract user info from Keycloak token
  return {
    id: session.user.id || session.user.email,
    email: session.user.email || '',
    name: session.user.name || 'Unknown User',
    department: session.user.department || 'Unknown Department',
  };
}

/**
 * Get current user or throw error if not authenticated
 * Use this in API routes that require authentication
 * 
 * In development mode without Keycloak, returns mock user
 */
export async function requireAuth(): Promise<User> {
  // Development mode without Keycloak - return mock user
  if (isDevelopmentMode) {
    return mockUser;
  }

  // Production mode - require real authentication
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }
  
  return user;
}
