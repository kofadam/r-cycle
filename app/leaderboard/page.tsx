'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { calculateDepartmentImpact, getBadge, type DepartmentStats } from '@/lib/environmental-impact';

function LeaderboardContent() {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'quarter'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Fetch all listings grouped by department
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalImpact = stats.reduce((sum, dept) => sum + dept.totalCO2SavedKg, 0);
  const totalItems = stats.reduce((sum, dept) => sum + dept.itemsPosted, 0);
  const totalTrees = stats.reduce((sum, dept) => sum + dept.totalTreesEquivalent, 0);
  const totalPandas = stats.reduce((sum, dept) => sum + dept.totalPandasProtected, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 bg-gray-50 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 Environmental Impact Leaderboard
            </h1>
            <p className="text-gray-600">
              See how departments are reducing waste and protecting our planet through hardware reuse
            </p>
          </div>

          {/* Global Impact Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Total CO2 Saved</div>
              <div className="text-3xl font-bold text-green-600">
                {totalImpact.toLocaleString()}
                <span className="text-lg font-normal text-gray-500 ml-1">kg</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Trees Equivalent</div>
              <div className="text-3xl font-bold text-green-600">
                🌳 {totalTrees.toFixed(1)}
                <span className="text-lg font-normal text-gray-500 ml-1">years</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Pandas Protected</div>
              <div className="text-3xl font-bold text-green-600">
                🐼 {totalPandas.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500 mt-1">habitat equivalents</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Items Reused</div>
              <div className="text-3xl font-bold text-green-600">
                ♻️ {totalItems}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Department Rankings</h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
              ) : stats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h3>
                  <p className="text-gray-600">
                    Be the first department to post hardware and make an impact!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.map((dept, index) => {
                    const badge = getBadge(dept.itemsPosted);
                    const isTop3 = index < 3;
                    const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    
                    return (
                      <div
                        key={dept.department}
                        className={`
                          p-6 rounded-lg border-2 transition-all
                          ${isTop3 
                            ? 'bg-gradient-to-r from-green-50 to-white border-green-300 shadow-md' 
                            : 'bg-white border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Rank */}
                            <div className="text-3xl font-bold text-gray-400 w-12 text-center">
                              {rankEmoji || `#${index + 1}`}
                            </div>
                            
                            {/* Department Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {dept.department}
                                </h3>
                                {badge && (
                                  <span className={`text-2xl ${badge.color}`} title={badge.name}>
                                    {badge.icon}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">{dept.itemsPosted}</span> items posted
                                </div>
                                <div>
                                  <span className="font-medium">{dept.itemsClaimed}</span> items claimed
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Environmental Impact */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {dept.totalCO2SavedKg.toLocaleString()} kg
                            </div>
                            <div className="text-sm text-gray-500">CO2 saved</div>
                            <div className="flex items-center justify-end space-x-4 mt-2 text-xs text-gray-600">
                              <div>🌳 {dept.totalTreesEquivalent.toFixed(1)} trees</div>
                              <div>🐼 {dept.totalPandasProtected.toFixed(4)} pandas</div>
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

          {/* Fun Facts */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Did You Know?</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                🏭 Manufacturing a new server produces <strong>1,300 kg of CO2</strong> - that's like driving a car for 3,250 miles!
              </div>
              <div>
                ♻️ Reusing hardware extends its life by <strong>5-10 years</strong>, avoiding an entire generation of manufacturing emissions.
              </div>
              <div>
                🌍 Data centers throw away <strong>400,000 functioning servers</strong> per year on average - imagine the waste we can prevent!
              </div>
              <div>
                🐼 One panda needs <strong>20,000 hectares</strong> of bamboo forest. That forest sequesters 40,000 kg CO2/year!
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
