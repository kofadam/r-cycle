'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import type { Listing } from '@/lib/types';

const categories = [
  { id: 'all', name: 'All Items', icon: '🔷' },
  { id: 'Server', name: 'Servers', icon: '🖥️' },
  { id: 'Networking', name: 'Networking', icon: '🌐' },
  { id: 'Storage', name: 'Storage', icon: '💾' },
];

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('status', 'available');

      const response = await fetch(`/api/listings?${params}`);
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    searchQuery === '' ||
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryStats = {
    available: listings.filter(l => l.status === 'available').length,
    servers: listings.filter(l => l.category === 'Server').length,
    networking: listings.filter(l => l.category === 'Networking').length,
  };

  const getDaysRemaining = (expirationDate: string) => {
    const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <h1 className="text-4xl font-bold mb-4">
              Internal Hardware Marketplace
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover decommissioned hardware available across departments. Reduce waste, save budget, find what you need.
            </p>
            <Link
              href="/post"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <span>➕</span>
              <span>Post Hardware</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by serial number, title, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-sm mb-2">Available Now</p>
              <p className="text-4xl font-bold text-gray-900">{categoryStats.available}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-blue-600 text-sm mb-2">Matching Search</p>
              <p className="text-4xl font-bold text-blue-600">{filteredListings.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-purple-600 text-sm mb-2">Servers</p>
              <p className="text-4xl font-bold text-purple-600">{categoryStats.servers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-green-600 text-sm mb-2">Networking</p>
              <p className="text-4xl font-bold text-green-600">{categoryStats.networking}</p>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading hardware...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hardware found</h3>
              <p className="text-gray-600 mb-6">
                Be the first to post hardware to the marketplace
              </p>
              <Link
                href="/post"
                className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
              >
                <span>➕</span>
                <span>Post Hardware</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredListings.map((listing) => {
                const daysRemaining = getDaysRemaining(listing.expirationDate);
                return (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500">{listing.serialNumber}</p>
                      </div>
                      <span className="badge badge-available">
                        {listing.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {listing.cpu && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">CPU:</span>
                          <span className="text-gray-900">{listing.cpu}</span>
                        </div>
                      )}
                      {listing.ram && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">RAM:</span>
                          <span className="text-gray-900">{listing.ram}</span>
                        </div>
                      )}
                      {listing.ports && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">Ports:</span>
                          <span className="text-gray-900">{listing.ports}</span>
                        </div>
                      )}
                      {listing.location && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">Location:</span>
                          <span className="text-gray-900">{listing.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Posted by</p>
                        <p className="text-sm font-medium text-gray-900">{listing.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Expires in</p>
                        <p className={`text-sm font-medium ${daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                          {daysRemaining} days
                        </p>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                      Request This Hardware
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
