'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

interface ClaimWithListing {
  id: number;
  listingId: number;
  listingTitle: string;
  serialNumber: string;
  category: string;
  requestingDepartment: string;
  justification: string;
  status: string;
  requestedAt: string;
}

function MyRequestsContent() {
  const [claims, setClaims] = useState<ClaimWithListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/claims');
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return { 
          label: 'Pending Owner Approval',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case 'pending_security':
        return { 
          label: 'Pending Security Review',
          color: 'bg-primary-100 text-primary-800',
          icon: '🔒'
        };
      case 'approved':
        return { 
          label: 'Approved',
          color: 'bg-green-100 text-green-800',
          icon: '✓'
        };
      case 'denied':
        return { 
          label: 'Denied',
          color: 'bg-red-100 text-red-800',
          icon: '✕'
        };
      default:
        return { 
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: '•'
        };
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 bg-gray-50 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-600 mt-2">Track hardware you've requested from other departments</p>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading your requests...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600 mb-6">
                  Browse the marketplace and request hardware your team needs
                </p>
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  <span>🪙</span>
                  <span>Browse Marketplace</span>
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {claims.map((claim) => {
                  const statusInfo = getStatusInfo(claim.status);
                  return (
                    <div key={claim.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {claim.listingTitle}
                            </h3>
                            <span className={`badge ${statusInfo.color}`}>
                              {statusInfo.icon} {statusInfo.label}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-500 mb-3">
                            Serial: {claim.serialNumber} • Category: {claim.category}
                          </p>

                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Your Justification:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              {claim.justification}
                            </p>
                          </div>

                          <p className="text-xs text-gray-500">
                            Requested on {new Date(claim.requestedAt).toLocaleDateString()} at {new Date(claim.requestedAt).toLocaleTimeString()}
                          </p>
                        </div>

                        <div className="ml-6">
                          {claim.status === 'pending_owner' && (
                            <button className="btn-secondary text-sm py-1.5 px-4">
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-8">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              claim.status !== 'denied' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              ✓
                            </div>
                            <span className="text-sm text-gray-600">Requested</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              claim.status === 'pending_security' || claim.status === 'approved' 
                                ? 'bg-green-100 text-green-600' 
                                : claim.status === 'denied'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {claim.status === 'denied' ? '✕' : claim.status === 'pending_owner' ? '⏳' : '✓'}
                            </div>
                            <span className="text-sm text-gray-600">Owner Approval</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              claim.status === 'approved' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {claim.status === 'approved' ? '✓' : claim.status === 'pending_security' ? '⏳' : '○'}
                            </div>
                            <span className="text-sm text-gray-600">Security Review</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              claim.status === 'approved' ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-400'
                            }`}>
                              ○
                            </div>
                            <span className="text-sm text-gray-600">Shipped</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MyRequests() {
  return (
    <ProtectedRoute>
      <MyRequestsContent />
    </ProtectedRoute>
  );
}
