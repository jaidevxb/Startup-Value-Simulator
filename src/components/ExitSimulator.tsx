import React, { useState, useEffect } from 'react';
import { useScenarioStore } from '../store/scenario-store';
import { DollarSign, TrendingUp, Users, Briefcase, Download } from 'lucide-react';

export const ExitSimulator: React.FC = () => {
  const { exitSimulation, exitValuation, simulateExit, capTableStates, currentScenario } = useScenarioStore();
  const [localExitVal, setLocalExitVal] = useState(exitValuation);
  
  useEffect(() => {
    setLocalExitVal(exitValuation);
  }, [exitValuation]);
  
  const handleExitValueChange = (value: number) => {
    setLocalExitVal(value);
    simulateExit(value);
  };
  
  if (capTableStates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Add funding rounds to simulate exit scenarios</p>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };
  
  const formatMultiple = (multiple: number) => `${multiple.toFixed(2)}x`;
  
  const exportExitAnalysis = () => {
    if (!exitSimulation || !currentScenario) return;
    
    const csvData = [
      ['Exit Analysis Report'],
      ['Exit Valuation', formatCurrency(exitSimulation.exitValuation)],
      [''],
      ['Stakeholder', 'Type', 'Final Equity %', 'Cash Return', 'Multiple'],
      ...exitSimulation.founderReturns.map(f => [
        f.name,
        'Founder',
        f.finalEquity.toFixed(2) + '%',
        formatCurrency(f.cashReturn),
        'N/A'
      ]),
      ...(exitSimulation.esopValue > 0 ? [[
        'ESOP Pool',
        'Employee Options',
        'N/A',
        formatCurrency(exitSimulation.esopValue),
        'N/A'
      ]] : []),
      ...exitSimulation.investorReturns.map(inv => [
        inv.name,
        'Investor',
        inv.finalEquity.toFixed(2) + '%',
        formatCurrency(inv.cashReturn),
        formatMultiple(inv.multiple)
      ])
    ];
    
    const csvContent = csvData.map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScenario.name.replace(/\s+/g, '_')}_exit_analysis.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" />
          <h3 className="text-xl font-bold">Exit Simulation</h3>
          </div>
          {exitSimulation && (
            <button
              onClick={exportExitAnalysis}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-400 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
        <p className="text-green-100 mt-1">Model your potential returns at exit</p>
      </div>
      
      <div className="p-6">
        {/* Exit Valuation Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Exit Valuation
          </label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={localExitVal}
                onChange={(e) => handleExitValueChange(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="100000000"
                min="0"
                step="1000000"
              />
            </div>
            <div className="flex gap-2">
              {[50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => handleExitValueChange(val * 1_000_000)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ${val}M
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter exit valuation to see returns for all stakeholders
          </p>
        </div>
        
        {exitSimulation && (
          <div className="space-y-6">
            {/* Founder Returns */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Founder Returns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exitSimulation.founderReturns.map((founder) => (
                  <div key={founder.founderId} className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">{founder.name}</h5>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(founder.cashReturn)}
                      </p>
                      <p className="text-sm text-blue-700">
                        {founder.finalEquity.toFixed(2)}% equity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* ESOP Value */}
            {exitSimulation.esopValue > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  ESOP Pool Value
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg inline-block">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(exitSimulation.esopValue)}
                  </p>
                  <p className="text-sm text-purple-700">Employee option pool</p>
                </div>
              </div>
            )}
            
            {/* Investor Returns */}
            {exitSimulation.investorReturns.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Investor Returns
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 font-medium text-gray-700">Investor</th>
                        <th className="py-2 px-4 font-medium text-gray-700">Cash Return</th>
                        <th className="py-2 px-4 font-medium text-gray-700">Multiple</th>
                        <th className="py-2 px-4 font-medium text-gray-700">Equity %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exitSimulation.investorReturns.map((investor) => (
                        <tr key={investor.investorId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">{investor.name}</td>
                          <td className="py-3 px-4 font-bold text-green-600">
                            {formatCurrency(investor.cashReturn)}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              investor.multiple >= 3 ? 'bg-green-100 text-green-700' :
                              investor.multiple >= 1 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {formatMultiple(investor.multiple)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{investor.finalEquity.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">Exit Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Exit Valuation</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(exitSimulation.exitValuation)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Founder Total</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(exitSimulation.founderReturns.reduce((sum, f) => sum + f.cashReturn, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Investor Total</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(exitSimulation.investorReturns.reduce((sum, i) => sum + i.cashReturn, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ESOP Value</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(exitSimulation.esopValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};