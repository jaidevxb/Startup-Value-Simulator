import React from 'react';
import { useScenarioStore } from '../store/scenario-store';
import { BarChart3, PieChart } from 'lucide-react';

export const OwnershipChart: React.FC = () => {
  const { currentScenario, capTableStates } = useScenarioStore();
  
  if (!currentScenario || capTableStates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Add funding rounds to view ownership evolution</p>
        </div>
      </div>
    );
  }
  
  const latestState = capTableStates[capTableStates.length - 1];
  
  // Calculate pie chart data
  const pieData = [
    ...latestState.founders.map(f => ({
      label: f.name,
      value: f.percentage,
      color: `hsl(${220 + f.name.length * 30}, 70%, 50%)`
    })),
    ...(latestState.esop.percentage > 0 ? [{
      label: 'ESOP Pool',
      value: latestState.esop.percentage,
      color: '#8B5CF6'
    }] : []),
    ...latestState.investors.map((inv, i) => ({
      label: inv.name,
      value: inv.percentage,
      color: `hsl(${120 + i * 40}, 60%, 50%)`
    }))
  ];
  
  // Simple pie chart using CSS
  let cumulativePercentage = 0;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Ownership Distribution</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="20"
              />
              {pieData.map((segment, index) => {
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativePercentage * circumference / 100;
                
                cumulativePercentage += segment.value;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{capTableStates.length - 1}</p>
                <p className="text-sm text-gray-600">Rounds</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-3">
          {pieData.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{segment.label}</p>
                <p className="text-sm text-gray-600">{segment.value.toFixed(2)}% equity</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ownership Evolution Timeline */}
      {capTableStates.length > 1 && (
        <div className="mt-8">
          <h4 className="font-bold text-gray-900 mb-4">Ownership Evolution</h4>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline header */}
              <div className="flex items-center mb-4">
                <div className="w-32 text-sm font-medium text-gray-700">Stakeholder</div>
                {capTableStates.map((_, index) => (
                  <div key={index} className="w-20 text-center text-xs text-gray-600">
                    {index === 0 ? 'Initial' : `Round ${index}`}
                  </div>
                ))}
              </div>
              
              {/* Founder evolution */}
              {latestState.founders.map((founder) => (
                <div key={founder.id} className="flex items-center mb-3">
                  <div className="w-32 text-sm font-medium text-gray-900 truncate">
                    {founder.name}
                  </div>
                  {capTableStates.map((state, index) => {
                    const founderState = state.founders.find(f => f.id === founder.id);
                    return (
                      <div key={index} className="w-20 text-center">
                        <div className="bg-blue-100 rounded px-2 py-1">
                          <span className="text-xs font-medium text-blue-700">
                            {founderState ? founderState.percentage.toFixed(1) : '0.0'}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};