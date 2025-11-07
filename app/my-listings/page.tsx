'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import type { Listing } from '@/lib/types';

type TabType = 'all' | 'available' | 'claimed';

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // In production, filter by current user's department
      const response = await fetch('/api/listings?department=IT Infrastructure');
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'badge-available';
      case 'claimed':
        return 'badge-claimed';
      case 'approved':
        return 'badge-approved';
      case 'expired':
        return 'badge-expired';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (expirationDate: string) => {
    const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredListings = listings.filter(listing => {
    if (activeTab === 'all') return true;
    return listing.status === activeTab;
  });

  const tabCounts = {
    all: listings.length,
    available: listings.filter(l => l.status === 'available').length,
    claimed: listings.filter(l => l.status === 'claimed').length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">Manage hardware you've posted to the marketplace</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  All ({tabCounts.all})
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'available'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Available ({tabCounts.available})
                </button>
                <button
                  onClick={() => setActiveTab('claimed')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'claimed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Claimed ({tabCounts.claimed})
                </button>
              </nav>
            </div>

            {/* Listings Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading your listings...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start by posting hardware to the marketplace
                  </p>
                  <Link
                    href="/post"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <span>➕</span>
                    <span>Post Hardware</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredListings.map((listing) => {
                    const daysRemaining = getDaysRemaining(listing.expirationDate);
                    return (
                      <div
                        key={listing.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {listing.title}
                              </h3>
                              <span className={`badge ${getStatusBadgeClass(listing.status)}`}>
                                {listing.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              Serial: {listing.serialNumber} • Category: {listing.category}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                              {listing.cpu && (
                                <div>
                                  <p className="text-xs text-gray-500">CPU</p>
                                  <p className="text-sm text-gray-900">{listing.cpu}</p>
                                </div>
                              )}
                              {listing.ram && (
                                <div>
                                  <p className="text-xs text-gray-500">RAM</p>
                                  <p className="text-sm text-gray-900">{listing.ram}</p>
                                </div>
                              )}
                              {listing.location && (
                                <div>
                                  <p className="text-xs text-gray-500">Location</p>
                                  <p className="text-sm text-gray-900">{listing.location}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>
                                Condition: <span className="font-medium text-gray-900">{listing.condition}</span>
                              </span>
                              <span>
                                Expires in: <span className={`font-medium ${daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                                  {daysRemaining} days
                                </span>
                              </span>
                              <span>
                                Posted: {new Date(listing.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            <button className="btn-secondary text-sm py-1.5 px-4">
                              Edit
                            </button>
                            {listing.status === 'claimed' && (
                              <button className="btn-primary text-sm py-1.5 px-4">
                                View Requests
                              </button>
                            )}
                          </div>
                        </div>

                        {listing.status === 'claimed' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded">
                                <span>⏳</span>
                                <span>Pending approval - QA Team has requested this hardware</span>
                              </div>
                              <div className="flex space-x-2">
                                <button className="btn-secondary text-sm py-1.5 px-4">
                                  Deny
                                </button>
                                <button className="bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-4 rounded-lg font-medium">
                                  Approve Transfer
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
