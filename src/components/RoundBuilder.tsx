import React, { useState } from 'react';
import { Plus, Settings, TrendingUp, Calculator } from 'lucide-react';
import { useScenarioStore } from '../store/scenario-store';
import { FundingRound, RoundType } from '../types/financial';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const RoundBuilder: React.FC = () => {
  const { addRound, currentScenario } = useScenarioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [roundData, setRoundData] = useState<Partial<FundingRound>>({
    name: '',
    type: 'PRICED',
    capitalRaised: 0,
    timestamp: new Date()
  });
  
  const resetForm = () => {
    setRoundData({
      name: '',
      type: 'PRICED',
      capitalRaised: 0,
      timestamp: new Date()
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const round: FundingRound = {
      id: generateId(),
      name: roundData.name || 'Unnamed Round',
      type: roundData.type!,
      capitalRaised: roundData.capitalRaised!,
      timestamp: roundData.timestamp!,
      ...(roundData.type === 'SAFE' ? {
        safeTerms: {
          valuationCap: roundData.safeTerms?.valuationCap,
          discount: roundData.safeTerms?.discount,
          mostFavoredNation: false
        }
      } : {
        pricedTerms: {
          preMoneyValuation: roundData.pricedTerms?.preMoneyValuation,
          sharePrice: 0 // Will be calculated
        }
      })
    };
    
    addRound(round);
    resetForm();
    setIsOpen(false);
  };
  
  if (!currentScenario) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Funding Rounds</h3>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Round
        </button>
      </div>
      
      {/* Existing Rounds */}
      <div className="space-y-3 mb-6">
        {currentScenario.rounds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No funding rounds added yet</p>
            <p className="text-sm">Add your first round to start modeling</p>
          </div>
        ) : (
          currentScenario.rounds.map((round, index) => (
            <div key={round.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{round.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="bg-gray-200 px-2 py-1 rounded">{round.type}</span>
                  <span>${(round.capitalRaised / 1_000_000).toFixed(1)}M raised</span>
                  {round.type === 'PRICED' && round.pricedTerms?.preMoneyValuation && (
                    <span>${(round.pricedTerms.preMoneyValuation / 1_000_000).toFixed(1)}M pre-money</span>
                  )}
                  {round.type === 'SAFE' && round.safeTerms?.valuationCap && (
                    <span>${(round.safeTerms.valuationCap / 1_000_000).toFixed(1)}M cap</span>
                  )}
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Add Round Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Funding Round</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Round Name & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Name
                  </label>
                  <input
                    type="text"
                    value={roundData.name}
                    onChange={(e) => setRoundData({ ...roundData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pre-Seed, Seed, Series A"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Type
                  </label>
                  <select
                    value={roundData.type}
                    onChange={(e) => setRoundData({ ...roundData, type: e.target.value as RoundType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PRICED">Priced Round</option>
                    <option value="SAFE">SAFE Note</option>
                  </select>
                </div>
              </div>
              
              {/* Capital Raised */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital Raised
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={roundData.capitalRaised}
                    onChange={(e) => setRoundData({ ...roundData, capitalRaised: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500000"
                    min="0"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter amount in USD</p>
              </div>
              
              {/* Round-specific fields */}
              {roundData.type === 'PRICED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-Money Valuation
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={roundData.pricedTerms?.preMoneyValuation || ''}
                      onChange={(e) => setRoundData({
                        ...roundData,
                        pricedTerms: {
                          ...roundData.pricedTerms,
                          preMoneyValuation: Number(e.target.value),
                          sharePrice: 0
                        }
                      })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5000000"
                      min="0"
                      required
                    />
                  </div>
                </div>
              )}
              
              {roundData.type === 'SAFE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valuation Cap (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={roundData.safeTerms?.valuationCap || ''}
                        onChange={(e) => setRoundData({
                          ...roundData,
                          safeTerms: {
                            ...roundData.safeTerms,
                            valuationCap: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10000000"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={roundData.safeTerms?.discount || ''}
                        onChange={(e) => setRoundData({
                          ...roundData,
                          safeTerms: {
                            ...roundData.safeTerms,
                            discount: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                        min="0"
                        max="50"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); resetForm(); }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};