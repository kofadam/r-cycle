'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Marketplace', href: '/', icon: '🏪' },
    { name: 'Post Hardware', href: '/post', icon: '➕' },
    { name: 'My Listings', href: '/my-listings', icon: '📦' },
    { name: 'My Requests', href: '/my-requests', icon: '❤️' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            ⚙️
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">R-Cycle</h1>
            <p className="text-sm text-gray-500">Internal Marketplace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
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
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 mt-4">
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

      {/* User Info (Mock) */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            B
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              bulb-dock-shakily
            </p>
            <p className="text-xs text-gray-500 truncate">
              bulb-dock-shakily@duck.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
