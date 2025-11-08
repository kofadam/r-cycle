// Mock authentication for POC
// Replace with real Keycloak OIDC integration for production

export function getCurrentUser() {
  // For POC, return a mock user
  // In production, this would get the actual authenticated user from session
  return {
    id: 'demo-user-id',
    email: 'demo@company.com',
    name: 'Demo User',
    department: 'IT Infrastructure'
  };
}
