import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      department: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    department: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    department: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER, // e.g., https://keycloak.company.com/realms/r-cycle
      
      // Optional: Configure specific authorization parameters
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  // Configure session strategy
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // Callbacks to customize the authentication flow
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        token.id = profile.sub || token.sub || '';
        token.email = profile.email || '';
        token.name = profile.name || (profile as any).preferred_username || '';
        
        // Extract department from Keycloak user attributes
        // Adjust the path based on your Keycloak setup
        token.department = (profile as any).department 
          || (profile as any).attributes?.department?.[0]
          || (profile as any).organization
          || 'Unknown Department';
      }
      
      return token;
    },

    async session({ session, token }) {
      // Pass token data to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.department = token.department;
      }
      
      return session;
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Secret for signing tokens
  secret: process.env.NEXTAUTH_SECRET,
};
