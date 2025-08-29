import React from 'react';
import { Lightbulb, Play, TrendingUp } from 'lucide-react';
import { useScenarioStore } from '../store/scenario-store';
import { Scenario, Founder, FundingRound, ESOPPool } from '../types/financial';

const generateId = () => Math.random().toString(36).substr(2, 9);

const exampleScenarios: Scenario[] = [
  {
    id: 'example-saas',
    name: 'SaaS Startup Journey',
    founders: [
      { id: 'f1', name: 'CEO', initialEquity: 50, currentEquity: 50, shares: 0 },
      { id: 'f2', name: 'CTO', initialEquity: 40, currentEquity: 40, shares: 0 }
    ],
    esopPools: [
      { id: 'esop1', percentage: 10, shares: 0, isPreMoney: true }
    ],
    rounds: [
      {
        id: 'r1',
        name: 'Pre-Seed',
        type: 'SAFE',
        capitalRaised: 250_000,
        safeTerms: { valuationCap: 3_000_000, discount: 20 },
        timestamp: new Date('2024-01-15')
      },
      {
        id: 'r2',
        name: 'Seed',
        type: 'PRICED',
        capitalRaised: 2_000_000,
        pricedTerms: { preMoneyValuation: 8_000_000, sharePrice: 0 },
        esopAdjustment: { newPoolPercentage: 15, isPreMoney: true },
        timestamp: new Date('2024-08-20')
      },
      {
        id: 'r3',
        name: 'Series A',
        type: 'PRICED',
        capitalRaised: 8_000_000,
        pricedTerms: { preMoneyValuation: 32_000_000, sharePrice: 0 },
        timestamp: new Date('2025-03-10')
      }
    ],
    totalShares: 10_000_000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'example-fintech',
    name: 'FinTech Unicorn Path',
    founders: [
      { id: 'f1', name: 'Founder & CEO', initialEquity: 35, currentEquity: 35, shares: 0 },
      { id: 'f2', name: 'Co-founder & CTO', initialEquity: 30, currentEquity: 30, shares: 0 },
      { id: 'f3', name: 'Co-founder & CPO', initialEquity: 25, currentEquity: 25, shares: 0 }
    ],
    esopPools: [
      { id: 'esop1', percentage: 10, shares: 0, isPreMoney: true }
    ],
    rounds: [
      {
        id: 'r1',
        name: 'Angel Round',
        type: 'SAFE',
        capitalRaised: 500_000,
        safeTerms: { valuationCap: 5_000_000 },
        timestamp: new Date('2023-06-01')
      },
      {
        id: 'r2',
        name: 'Seed',
        type: 'PRICED',
        capitalRaised: 3_000_000,
        pricedTerms: { preMoneyValuation: 12_000_000, sharePrice: 0 },
        timestamp: new Date('2024-02-15')
      },
      {
        id: 'r3',
        name: 'Series A',
        type: 'PRICED',
        capitalRaised: 15_000_000,
        pricedTerms: { preMoneyValuation: 60_000_000, sharePrice: 0 },
        esopAdjustment: { newPoolPercentage: 12, isPreMoney: false },
        timestamp: new Date('2024-11-30')
      },
      {
        id: 'r4',
        name: 'Series B',
        type: 'PRICED',
        capitalRaised: 40_000_000,
        pricedTerms: { preMoneyValuation: 200_000_000, sharePrice: 0 },
        timestamp: new Date('2025-06-15')
      }
    ],
    totalShares: 10_000_000,
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date()
  },
  {
    id: 'example-simple',
    name: 'Simple Two-Founder Setup',
    founders: [
      { id: 'f1', name: 'Technical Founder', initialEquity: 60, currentEquity: 60, shares: 0 },
      { id: 'f2', name: 'Business Founder', initialEquity: 40, currentEquity: 40, shares: 0 }
    ],
    esopPools: [],
    rounds: [
      {
        id: 'r1',
        name: 'Friends & Family',
        type: 'SAFE',
        capitalRaised: 100_000,
        safeTerms: { valuationCap: 2_000_000, discount: 15 },
        timestamp: new Date('2024-03-01')
      },
      {
        id: 'r2',
        name: 'Pre-Seed',
        type: 'PRICED',
        capitalRaised: 750_000,
        pricedTerms: { preMoneyValuation: 4_500_000, sharePrice: 0 },
        esopAdjustment: { newPoolPercentage: 12, isPreMoney: true },
        timestamp: new Date('2024-09-15')
      }
    ],
    totalShares: 10_000_000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

export const ExampleScenarios: React.FC = () => {
  const { loadScenario } = useScenarioStore();

  const loadExample = (scenario: Scenario) => {
    // Create a copy with new IDs to avoid conflicts
    const newScenario: Scenario = {
      ...scenario,
      id: generateId(),
      name: `${scenario.name} (Example)`,
      founders: scenario.founders.map(f => ({ ...f, id: generateId() })),
      rounds: scenario.rounds.map(r => ({ ...r, id: generateId() })),
      esopPools: scenario.esopPools.map(e => ({ ...e, id: generateId() })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    loadScenario(newScenario);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Example Scenarios</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Explore these pre-built scenarios to understand how different funding paths affect founder equity and returns.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exampleScenarios.map((scenario) => (
          <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <h4 className="font-bold text-gray-900 mb-2">{scenario.name}</h4>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>{scenario.founders.length} founders</p>
              <p>{scenario.rounds.length} funding rounds</p>
              <p>
                ${(scenario.rounds.reduce((sum, r) => sum + r.capitalRaised, 0) / 1_000_000).toFixed(1)}M total raised
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {scenario.rounds.map((round) => (
                <span 
                  key={round.id}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    round.type === 'SAFE' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {round.name}
                </span>
              ))}
            </div>
            
            <button
              onClick={() => loadExample(scenario)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Load Example
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pro Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Try different exit valuations to see how returns change</li>
              <li>• Compare pre-money vs post-money ESOP pool effects</li>
              <li>• Notice how SAFE discounts and caps affect conversion</li>
              <li>• Observe founder dilution patterns across multiple rounds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};