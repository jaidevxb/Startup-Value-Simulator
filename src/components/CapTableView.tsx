import React from 'react';
import { useScenarioStore } from '../store/scenario-store';
import { PieChart, BarChart3, TrendingUp, Download } from 'lucide-react';

export const CapTableView: React.FC = () => {
  const { currentScenario, capTableStates } = useScenarioStore();
  
  if (!currentScenario || capTableStates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Create a scenario to view the cap table</p>
        </div>
      </div>
    );
  }
  
  const latestState = capTableStates[capTableStates.length - 1];
  
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };
  
  const exportToCSV = () => {
    if (!currentScenario || !latestState) return;
    
    const csvData = [
      ['Stakeholder', 'Type', 'Shares', 'Percentage', 'Investment'],
      ...latestState.founders.map(f => [
        f.name, 
        'Founder', 
        f.shares.toString(), 
        f.percentage.toFixed(2) + '%',
        'N/A'
      ]),
      ...(latestState.esop.shares > 0 ? [[
        'ESOP Pool',
        'Employee Options',
        latestState.esop.shares.toString(),
        latestState.esop.percentage.toFixed(2) + '%',
        'N/A'
      ]] : []),
      ...latestState.investors.map(inv => [
        inv.name,
        'Investor',
        inv.shares.toString(),
        inv.percentage.toFixed(2) + '%',
        '$' + inv.investmentAmount.toLocaleString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScenario.name.replace(/\s+/g, '_')}_cap_table.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6" />
          <h3 className="text-xl font-bold">Cap Table Overview</h3>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <p className="text-blue-100 mt-1">Current ownership distribution</p>
      </div>
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-600 mb-1">Total Shares</h4>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(latestState.totalShares)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-600 mb-1">Funding Rounds</h4>
            <p className="text-2xl font-bold text-green-900">{currentScenario.rounds.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-600 mb-1">Total Raised</h4>
            <p className="text-2xl font-bold text-purple-900">
              ${formatNumber(currentScenario.rounds.reduce((sum, r) => sum + r.capitalRaised, 0))}
            </p>
          </div>
        </div>
        
        {/* Cap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-medium text-gray-700">Stakeholder</th>
                <th className="py-3 px-4 font-medium text-gray-700">Shares</th>
                <th className="py-3 px-4 font-medium text-gray-700">Ownership %</th>
                <th className="py-3 px-4 font-medium text-gray-700">Type</th>
              </tr>
            </thead>
            <tbody>
              {/* Founders */}
              {latestState.founders.map((founder) => (
                <tr key={founder.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {founder.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{formatNumber(founder.shares)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(founder.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{founder.percentage.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      Founder
                    </span>
                  </td>
                </tr>
              ))}
              
              {/* ESOP */}
              {latestState.esop.shares > 0 && (
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      ESOP Pool
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{formatNumber(latestState.esop.shares)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(latestState.esop.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{latestState.esop.percentage.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                      ESOP
                    </span>
                  </td>
                </tr>
              )}
              
              {/* Investors */}
              {latestState.investors.map((investor) => (
                <tr key={investor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      {investor.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{formatNumber(investor.shares)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(investor.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{investor.percentage.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      Investor
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Round Timeline */}
        {currentScenario.rounds.length > 0 && (
          <div className="mt-8">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Funding Timeline
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentScenario.rounds.map((round, index) => (
                <div key={round.id} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                  <span className="font-medium">{index + 1}. {round.name}</span>
                  <span className="text-gray-600 ml-2">
                    ${(round.capitalRaised / 1_000_000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};