'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function PostHardware() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  
  const [formData, setFormData] = useState({
    serialNumber: '',
    title: '',
    category: 'Server',
    description: '',
    location: '',
    condition: 'Good',
    cpu: '',
    ram: '',
    storage: '',
    ports: '',
    otherSpecs: '',
    expirationDate: '',
  });

  const handleSerialNumberLookup = async () => {
    if (!formData.serialNumber.trim()) {
      return;
    }

    try {
      setLookingUp(true);
      setError('');
      setStorageWarning('');

      const response = await fetch(`/api/hardware?serial=${encodeURIComponent(formData.serialNumber)}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Serial number not found in hardware tracking system');
        } else {
          setError(data.error || 'Failed to lookup hardware');
        }
        return;
      }

      // Check for storage media
      if (data.hasStorageMedia) {
        setStorageWarning(`⚠️ WARNING: This hardware contains storage media (${data.specs.storage.join(', ')}). Per security policy, storage media must be removed before listing.`);
      }

      // Auto-fill form with fetched data
      setFormData(prev => ({
        ...prev,
        title: `${data.manufacturer} ${data.model}`,
        category: data.category,
        cpu: data.specs.cpu || '',
        ram: data.specs.ram || '',
        storage: data.hasStorageMedia ? 'No drives - removed per security policy' : (data.specs.storage?.join(', ') || ''),
        ports: data.specs.ports || '',
        otherSpecs: data.specs.other || '',
      }));

    } catch (error) {
      console.error('Error looking up hardware:', error);
      setError('Failed to connect to hardware tracking system');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expirationDate) {
      setError('Please set an expiration date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.blocked) {
          // Storage media blocked
          setStorageWarning(data.message);
          setError('Cannot post hardware with storage media');
        } else {
          setError(data.error || 'Failed to create listing');
        }
        return;
      }

      // Success - redirect to my listings
      router.push('/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 bg-gray-50 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Post Hardware</h1>
            <p className="text-gray-600 mt-2">List decommissioned hardware for internal reuse</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hardware Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hardware Details</h2>

              {/* Serial Number with Lookup */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Enter serial number"
                    className="flex-1 input"
                  />
                  <button
                    type="button"
                    onClick={handleSerialNumberLookup}
                    disabled={lookingUp || !formData.serialNumber.trim()}
                    className="btn-secondary whitespace-nowrap disabled:opacity-50"
                  >
                    {lookingUp ? '🔍 Looking up...' : '🔍 Lookup'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the hardware serial number to auto-fetch specifications
                </p>
              </div>

              {/* Storage Warning */}
              {storageWarning && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 whitespace-pre-line">{storageWarning}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Dell PowerEdge R730"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="Server">Server</option>
                    <option value="Networking">Networking</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the hardware..."
                  rows={3}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Building/Floor"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="input"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Hardware Specifications Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hardware Specifications</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPU
                  </label>
                  <input
                    type="text"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    placeholder="e.g., Intel Xeon E5-2630"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RAM
                  </label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    placeholder="e.g., 64GB DDR4"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage
                  </label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    placeholder="e.g., 2x 1TB SSD"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ports
                  </label>
                  <input
                    type="text"
                    value={formData.ports}
                    onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
                    placeholder="e.g., 4x GbE"
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Specifications
                </label>
                <textarea
                  value={formData.otherSpecs}
                  onChange={(e) => setFormData({ ...formData, otherSpecs: e.target.value })}
                  placeholder="Any other relevant specifications..."
                  rows={3}
                  className="input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Posting...' : '✓ Post Hardware'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
