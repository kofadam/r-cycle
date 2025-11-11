'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { APP_VERSION } from '@/lib/version';
import { useCurrentUser } from '@/lib/useCurrentUser';

// Check if we're in development mode without Keycloak
const isDevelopmentMode = 
  process.env.NODE_ENV === 'development' && 
  !process.env.NEXT_PUBLIC_KEYCLOAK_ENABLED;

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Marketplace', href: '/', icon: '🪙' },
    { name: 'Post Hardware', href: '/post', icon: '➕' },
    { name: 'My Listings', href: '/my-listings', icon: '📦' },
    { name: 'My Requests', href: '/my-requests', icon: '💚' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🌍', badge: 'New' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 bottom-0 overflow-y-auto flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/logo-green.svg" alt="R-Cycle" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">R-Cycle</h1>
            <p className="text-sm text-gray-500">Internal Marketplace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            NAVIGATION
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Environmental Impact Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🌍</span>
            <div className="text-xs font-semibold text-gray-700">Your Impact</div>
          </div>
          <div className="text-sm text-gray-600">
            Every hardware you post helps save CO2 and protect our planet!
          </div>
          <Link 
            href="/leaderboard"
            className="mt-3 block text-center text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            View Leaderboard →
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          QUICK STATS
        </p>
        <div className="space-y-2">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Items</span>
              <span className="text-lg font-bold text-green-600">0</span>
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Listings</span>
              <span className="text-lg font-bold text-gray-900">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Version</p>
          <p className="text-sm font-mono text-gray-700">{APP_VERSION}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <UserInfo />
      </div>
    </div>
  );
}

// User Info Component with Auth
function UserInfo() {
  // In development mode without Keycloak, show mock user
  if (isDevelopmentMode) {
    return (
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            DU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Dev User
            </p>
            <p className="text-xs text-gray-500 truncate">
              IT Infrastructure
            </p>
          </div>
        </div>
        <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
          🔧 Dev Mode (No Keycloak)
        </div>
      </div>
    );
  }

  // Production mode - use real authentication
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Not signed in</p>
        <button
          onClick={() => window.location.href = '/api/auth/signin'}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.department}
          </p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
