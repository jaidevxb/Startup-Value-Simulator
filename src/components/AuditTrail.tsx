import React, { useState } from 'react';
import { useScenarioStore } from '../store/scenario-store';
import { FileText, ChevronDown, ChevronRight, Calculator } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { currentScenario, capTableStates } = useScenarioStore();
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());
  
  const toggleRound = (roundId: string) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(roundId)) {
      newExpanded.delete(roundId);
    } else {
      newExpanded.add(roundId);
    }
    setExpandedRounds(newExpanded);
  };
  
  if (!currentScenario || currentScenario.rounds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Add funding rounds to view detailed calculations</p>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <h3 className="text-xl font-bold">Audit Trail</h3>
        </div>
        <p className="text-gray-100 mt-1">Detailed calculations for each round</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {currentScenario.rounds.map((round, index) => {
          const isExpanded = expandedRounds.has(round.id);
          const preState = capTableStates[index];
          const postState = capTableStates[index + 1];
          
          if (!preState || !postState) return null;
          
          return (
            <div key={round.id} className="p-6">
              <button
                onClick={() => toggleRound(round.id)}
                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{round.name}</h4>
                    <p className="text-sm text-gray-600">
                      {round.type} • {formatCurrency(round.capitalRaised)} raised
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-4 ml-11 space-y-4">
                  {/* Round Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Round Details
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">{round.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Capital Raised:</span>
                        <p className="font-medium">{formatCurrency(round.capitalRaised)}</p>
                      </div>
                      {round.type === 'PRICED' && round.pricedTerms?.preMoneyValuation && (
                        <>
                          <div>
                            <span className="text-gray-600">Pre-Money:</span>
                            <p className="font-medium">{formatCurrency(round.pricedTerms.preMoneyValuation)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Post-Money:</span>
                            <p className="font-medium">
                              {formatCurrency(round.pricedTerms.preMoneyValuation + round.capitalRaised)}
                            </p>
                          </div>
                        </>
                      )}
                      {round.type === 'SAFE' && (
                        <>
                          {round.safeTerms?.valuationCap && (
                            <div>
                              <span className="text-gray-600">Valuation Cap:</span>
                              <p className="font-medium">{formatCurrency(round.safeTerms.valuationCap)}</p>
                            </div>
                          )}
                          {round.safeTerms?.discount && (
                            <div>
                              <span className="text-gray-600">Discount:</span>
                              <p className="font-medium">{round.safeTerms.discount}%</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Ownership Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Before Round</h5>
                      <div className="bg-red-50 p-3 rounded space-y-1 text-sm">
                        {preState.founders.map(f => (
                          <div key={f.id} className="flex justify-between">
                            <span>{f.name}:</span>
                            <span className="font-medium">{f.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                        {preState.esop.percentage > 0 && (
                          <div className="flex justify-between">
                            <span>ESOP:</span>
                            <span className="font-medium">{preState.esop.percentage.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">After Round</h5>
                      <div className="bg-green-50 p-3 rounded space-y-1 text-sm">
                        {postState.founders.map(f => (
                          <div key={f.id} className="flex justify-between">
                            <span>{f.name}:</span>
                            <span className="font-medium">{f.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                        {postState.esop.percentage > 0 && (
                          <div className="flex justify-between">
                            <span>ESOP:</span>
                            <span className="font-medium">{postState.esop.percentage.toFixed(2)}%</span>
                          </div>
                        )}
                        {postState.investors
                          .filter(inv => inv.name.includes(round.name))
                          .map(inv => (
                          <div key={inv.id} className="flex justify-between">
                            <span>New Investor:</span>
                            <span className="font-medium">{inv.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};