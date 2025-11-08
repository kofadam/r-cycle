// components/EnvironmentalImpactCard.tsx
// Show environmental impact when hardware is posted

import { EnvironmentalImpact } from '@/lib/environmental-impact';

interface EnvironmentalImpactCardProps {
  impact: EnvironmentalImpact;
  category: string;
}

export default function EnvironmentalImpactCard({ impact, category }: EnvironmentalImpactCardProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
            🌍
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🎉 Great Job! You're Helping the Planet!
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            By posting this {category.toLowerCase()} for reuse instead of disposal, you're preventing:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {impact.co2SavedKg.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
              </div>
              <div className="text-xs text-gray-600">CO2 emissions</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                🌳 {impact.treesEquivalent}
              </div>
              <div className="text-xs text-gray-600">tree-years equivalent</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                🚗 {impact.milesNotDriven.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">miles not driven</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                🐼 {impact.pandasProtected.toFixed(4)}
              </div>
              <div className="text-xs text-gray-600">panda habitats</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>💡 Did you know?</strong> Manufacturing a new {category.toLowerCase()} produces{' '}
              <strong>{impact.co2SavedKg} kg of CO2</strong> - equivalent to charging{' '}
              <strong>{impact.smartphonesCharged.toLocaleString()} smartphones</strong>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
