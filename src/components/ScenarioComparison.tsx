import React, { useState } from 'react';
import { GitCompare, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useScenarioStore } from '../store/scenario-store';
import { Scenario } from '../types/financial';
import { FinancialEngine } from '../utils/financial-engine';

interface ComparisonProps {
  scenarios: Scenario[];
  onClose: () => void;
}

export const ScenarioComparison: React.FC<ComparisonProps> = ({ scenarios, onClose }) => {
  const [exitValuation, setExitValuation] = useState(100_000_000);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getScenarioResults = (scenario: Scenario) => {
    const states = FinancialEngine.calculateCapTable(scenario);
    const finalState = states[states.length - 1];
    const exitSim = FinancialEngine.simulateExit(finalState, exitValuation);
    
    return {
      finalState,
      exitSim,
      totalRaised: scenario.rounds.reduce((sum, r) => sum + r.capitalRaised, 0),
      roundCount: scenario.rounds.length
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6" />
              <h2 className="text-xl font-bold">Scenario Comparison</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Exit Valuation Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Exit Valuation for Comparison
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={exitValuation}
                  onChange={(e) => setExitValuation(Number(e.target.value))}
                  className="pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="0"
                  step="1000000"
                />
              </div>
              <div className="flex gap-2">
                {[50, 100, 250, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setExitValuation(val * 1_000_000)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ${val}M
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-bold text-gray-900">Metric</th>
                  {scenarios.map((scenario) => (
                    <th key={scenario.id} className="py-3 px-4 font-bold text-gray-900 min-w-48">
                      {scenario.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Founders</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="py-3 px-4">{scenario.founders.length}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Funding Rounds</td>
                  {scenarios.map((scenario) => {
                    const results = getScenarioResults(scenario);
                    return (
                      <td key={scenario.id} className="py-3 px-4">{results.roundCount}</td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Total Raised</td>
                  {scenarios.map((scenario) => {
                    const results = getScenarioResults(scenario);
                    return (
                      <td key={scenario.id} className="py-3 px-4 font-bold text-green-600">
                        {formatCurrency(results.totalRaised)}
                      </td>
                    );
                  })}
                </tr>

                {/* Founder Equity */}
                <tr className="bg-blue-50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-4 font-bold text-blue-900">
                    Final Founder Equity
                  </td>
                </tr>
                {scenarios[0]?.founders.map((_, founderIndex) => (
                  <tr key={founderIndex} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">
                      Founder {founderIndex + 1} Equity
                    </td>
                    {scenarios.map((scenario) => {
                      const results = getScenarioResults(scenario);
                      const founder = results.finalState.founders[founderIndex];
                      return (
                        <td key={scenario.id} className="py-3 px-4">
                          {founder ? `${founder.percentage.toFixed(2)}%` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Exit Returns */}
                <tr className="bg-green-50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-4 font-bold text-green-900">
                    Exit Returns @ {formatCurrency(exitValuation)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Total Founder Returns</td>
                  {scenarios.map((scenario) => {
                    const results = getScenarioResults(scenario);
                    const totalFounderReturns = results.exitSim.founderReturns.reduce(
                      (sum, f) => sum + f.cashReturn, 0
                    );
                    return (
                      <td key={scenario.id} className="py-3 px-4 font-bold text-green-600">
                        {formatCurrency(totalFounderReturns)}
                      </td>
                    );
                  })}
                </tr>
                {scenarios[0]?.founders.map((_, founderIndex) => (
                  <tr key={founderIndex} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">
                      Founder {founderIndex + 1} Return
                    </td>
                    {scenarios.map((scenario) => {
                      const results = getScenarioResults(scenario);
                      const founderReturn = results.exitSim.founderReturns[founderIndex];
                      return (
                        <td key={scenario.id} className="py-3 px-4">
                          {founderReturn ? formatCurrency(founderReturn.cashReturn) : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* ESOP Value */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">ESOP Pool Value</td>
                  {scenarios.map((scenario) => {
                    const results = getScenarioResults(scenario);
                    return (
                      <td key={scenario.id} className="py-3 px-4 font-bold text-purple-600">
                        {formatCurrency(results.exitSim.esopValue)}
                      </td>
                    );
                  })}
                </tr>

                {/* Dilution Analysis */}
                <tr className="bg-orange-50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-4 font-bold text-orange-900">
                    Dilution Analysis
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Total Founder Dilution</td>
                  {scenarios.map((scenario) => {
                    const initialEquity = scenario.founders.reduce((sum, f) => sum + f.initialEquity, 0);
                    const results = getScenarioResults(scenario);
                    const finalEquity = results.finalState.founders.reduce((sum, f) => sum + f.percentage, 0);
                    const dilution = initialEquity - finalEquity;
                    return (
                      <td key={scenario.id} className="py-3 px-4">
                        <span className={`font-medium ${dilution > 50 ? 'text-red-600' : dilution > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                          -{dilution.toFixed(1)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const results = getScenarioResults(scenario);
              const totalFounderReturns = results.exitSim.founderReturns.reduce(
                (sum, f) => sum + f.cashReturn, 0
              );
              const returnMultiple = totalFounderReturns / Math.max(results.totalRaised, 1);
              
              return (
                <div key={scenario.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">{scenario.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capital Efficiency:</span>
                      <span className="font-medium">
                        {(exitValuation / Math.max(results.totalRaised, 1)).toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Founder ROI:</span>
                      <span className="font-medium text-green-600">
                        {returnMultiple.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final Founder %:</span>
                      <span className="font-medium">
                        {results.finalState.founders.reduce((sum, f) => sum + f.percentage, 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};