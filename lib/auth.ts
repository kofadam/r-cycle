/**
 * Authentication Utility
 * 
 * PRODUCTION NOTE:
 * This is a simplified mock authentication for POC demonstration.
 * 
 * For production, integrate with Keycloak OIDC using next-auth:
 * 
 * 1. Install: npm install next-auth
 * 2. Create app/api/auth/[...nextauth]/route.ts
 * 3. Configure Keycloak provider:
 * 
 *    import KeycloakProvider from "next-auth/providers/keycloak"
 *    
 *    providers: [
 *      KeycloakProvider({
 *        clientId: process.env.KEYCLOAK_CLIENT_ID,
 *        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
 *        issuer: process.env.KEYCLOAK_ISSUER,
 *      })
 *    ]
 * 
 * 4. Replace getCurrentUser() with session-based auth
 * 5. Add middleware for protected routes
 */

export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
}

// Mock current user for POC
// In production, this will come from Keycloak session
let mockCurrentUser: User = {
  id: 1,
  email: 'john.doe@company.com',
  name: 'John Doe',
  department: 'IT Infrastructure',
};

/**
 * Get current authenticated user
 * 
 * PRODUCTION: Replace with next-auth session
 * import { getServerSession } from "next-auth/next"
 */
export function getCurrentUser(): User {
  return mockCurrentUser;
}

/**
 * Set mock user (POC only - for testing different departments)
 */
export function setMockUser(user: User): void {
  mockCurrentUser = user;
}

/**
 * Mock users for POC testing
 */
export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'john.doe@company.com',
    name: 'John Doe',
    department: 'IT Infrastructure',
  },
  {
    id: 2,
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    department: 'Data Center Operations',
  },
  {
    id: 3,
    email: 'bob.johnson@company.com',
    name: 'Bob Johnson',
    department: 'Development Team',
  },
  {
    id: 4,
    email: 'alice.williams@company.com',
    name: 'Alice Williams',
    department: 'Security Team',
  },
];

/**
 * Check if user belongs to security team
 * Used for approval workflows
 */
export function isSecurityTeam(user: User): boolean {
  return user.department.toLowerCase().includes('security');
}
