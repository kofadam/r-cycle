'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import type { Listing } from '@/lib/types';

type TabType = 'all' | 'available' | 'claimed';

// 1. Define the type for the form state
// This uses the lookup type Listing['condition'] to get 'Excellent' | 'Good' | 'Fair'
// and also includes '' to allow for the initial empty string state.
type EditFormState = {
  title: string;
  description: string;
  condition: Listing['condition'] | ''; // <-- FIX 1: Correct type for condition
  location: string;
  expirationDate: string;
};

function MyListingsContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  
  // 2. Apply the new explicit type to the editForm state
  const [editForm, setEditForm] = useState<EditFormState>({
    title: '',
    description: '',
    condition: '',
    location: '',
    expirationDate: '',
  });

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

  const handleDelete = async (listingId: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setListings(listings.filter(l => l.id !== listingId));
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  const handleEdit = (listingId: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setEditingListing(listing);
      // When setting the form, the condition is a valid Listing['condition'] type
      setEditForm({
        title: listing.title,
        description: listing.description || '',
        condition: listing.condition,
        location: listing.location || '',
        expirationDate: listing.expirationDate.split('T')[0], // Format for input type="date"
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingListing) return;

    // Type check: ensure condition is a valid Listing['condition'] before saving and updating state
    if (editForm.condition === '') {
        alert("Please select a condition.");
        return; 
    }

    try {
      // NOTE: We only send the fields that were in editForm to the API.
      // The API should handle merging these fields with the existing listing.
      const response = await fetch(`/api/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedListing = await response.json();
        // Update local state: The type assertion here is required because
        // the spread operator {...l, ...editForm} doesn't guarantee the
        // resulting object is an exact Listing, even though we fixed the condition type.
        setListings(listings.map(l => 
          l.id === editingListing.id 
            ? ({ ...l, ...editForm } as Listing) // <-- FIX 2: Type assertion for safe merge
            : l
        ));
        setEditingListing(null);
      } else {
        alert('Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    }
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
    setEditForm({
      title: '',
      description: '',
      condition: '',
      location: '',
      expirationDate: '',
    });
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
      
      <main className="flex-1 bg-gray-50 ml-64">
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
                      ? 'border-primary-500 text-primary-600'
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
                      ? 'border-primary-500 text-primary-600'
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
                      ? 'border-primary-500 text-primary-600'
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
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                    className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
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
                        className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
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
                            <button 
                              onClick={() => handleEdit(listing.id)}
                              className="btn-secondary text-sm py-1.5 px-4"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(listing.id)}
                              className="btn-secondary text-sm py-1.5 px-4 text-red-600 hover:bg-red-50"
                            >
                              Delete
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

      {/* Edit Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Listing</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update details for {editingListing.serialNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    // The value is now correctly typed as Listing['condition'] | ''
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value as Listing['condition'] | '' })} // Added type assertion for event handler safety
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {/* CONSIDER ADDING: <option value="" disabled>Select Condition</option> */}
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Building/Floor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={editForm.expirationDate}
                  onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyListings() {
  return (
    <ProtectedRoute>
      <MyListingsContent />
    </ProtectedRoute>
  );
}