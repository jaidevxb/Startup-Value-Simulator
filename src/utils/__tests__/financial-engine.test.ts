import { describe, it, expect } from 'vitest';
import { FinancialEngine } from '../financial-engine';
import { Scenario, Founder, FundingRound, ESOPPool } from '../../types/financial';

const createTestScenario = (
  founders: Partial<Founder>[],
  rounds: Partial<FundingRound>[] = [],
  esopPools: Partial<ESOPPool>[] = []
): Scenario => ({
  id: 'test-scenario',
  name: 'Test Scenario',
  founders: founders.map((f, i) => ({
    id: f.id || `founder-${i}`,
    name: f.name || `Founder ${i + 1}`,
    initialEquity: f.initialEquity || 0,
    currentEquity: f.currentEquity || f.initialEquity || 0,
    shares: f.shares || 0,
    ...f
  })),
  rounds: rounds.map((r, i) => ({
    id: r.id || `round-${i}`,
    name: r.name || `Round ${i + 1}`,
    type: r.type || 'PRICED',
    capitalRaised: r.capitalRaised || 0,
    timestamp: r.timestamp || new Date(),
    ...r
  })),
  esopPools: esopPools.map((e, i) => ({
    id: e.id || `esop-${i}`,
    percentage: e.percentage || 0,
    shares: e.shares || 0,
    isPreMoney: e.isPreMoney !== undefined ? e.isPreMoney : true,
    ...e
  })),
  totalShares: 10_000_000,
  createdAt: new Date(),
  updatedAt: new Date()
});

describe('FinancialEngine', () => {
  describe('Initial State Creation', () => {
    it('should create correct initial state for two founders', () => {
      const scenario = createTestScenario([
        { initialEquity: 60 },
        { initialEquity: 40 }
      ]);
      
      const states = FinancialEngine.calculateCapTable(scenario);
      expect(states).toHaveLength(1);
      
      const initial = states[0];
      expect(initial.totalShares).toBe(10_000_000);
      expect(initial.founders[0].percentage).toBe(60);
      expect(initial.founders[1].percentage).toBe(40);
      expect(initial.founders[0].shares).toBe(6_000_000);
      expect(initial.founders[1].shares).toBe(4_000_000);
    });
    
    it('should handle ESOP pool at incorporation', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 70 }, { initialEquity: 20 }],
        [],
        [{ percentage: 10, isPreMoney: true }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      const initial = states[0];
      
      expect(initial.founders[0].percentage).toBe(70);
      expect(initial.founders[1].percentage).toBe(20);
      expect(initial.esop.percentage).toBe(10);
      expect(initial.esop.shares).toBe(1_000_000);
    });
  });
  
  describe('Priced Rounds', () => {
    it('should handle single priced round correctly', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 100 }],
        [{
          type: 'PRICED',
          capitalRaised: 1_000_000,
          pricedTerms: { preMoneyValuation: 4_000_000, sharePrice: 0 }
        }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      expect(states).toHaveLength(2);
      
      const postRound = states[1];
      
      // Share price should be $0.40 (4M pre-money / 10M shares)
      // New shares: 1M / $0.40 = 2.5M shares
      // Total shares: 10M + 2.5M = 12.5M
      // Founder: 10M / 12.5M = 80%
      // Investor: 2.5M / 12.5M = 20%
      
      expect(postRound.founders[0].percentage).toBeCloseTo(80, 1);
      expect(postRound.investors[0].percentage).toBeCloseTo(20, 1);
      expect(postRound.totalShares).toBe(12_500_000);
    });
    
    it('should handle priced round with pre-money ESOP top-up', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 90 }, { initialEquity: 10 }],
        [{
          type: 'PRICED',
          capitalRaised: 2_000_000,
          pricedTerms: { preMoneyValuation: 8_000_000, sharePrice: 0 },
          esopAdjustment: { newPoolPercentage: 15, isPreMoney: true }
        }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      const postRound = states[1];
      
      // Should have ESOP pool and diluted founders
      expect(postRound.esop.percentage).toBeCloseTo(15, 1);
      expect(postRound.founders[0].percentage).toBeLessThan(90);
      expect(postRound.founders[1].percentage).toBeLessThan(10);
    });
  });
  
  describe('SAFE Notes', () => {
    it('should handle SAFE with valuation cap', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 100 }],
        [{
          type: 'SAFE',
          capitalRaised: 500_000,
          safeTerms: { valuationCap: 5_000_000 }
        }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      const postRound = states[1];
      
      // Share price at cap: 5M / 10M = $0.50
      // New shares: 500K / $0.50 = 1M shares
      // Total: 11M shares
      // Founder: 10M / 11M = ~90.9%
      // Investor: 1M / 11M = ~9.1%
      
      expect(postRound.founders[0].percentage).toBeCloseTo(90.9, 1);
      expect(postRound.investors[0].percentage).toBeCloseTo(9.1, 1);
    });
    
    it('should handle SAFE with discount', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 100 }],
        [{
          type: 'SAFE',
          capitalRaised: 250_000,
          safeTerms: { discount: 20, valuationCap: 10_000_000 }
        }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      const postRound = states[1];
      
      // Cap price: 10M / 10M = $1.00
      // Discount price: $1.00 * (1 - 0.20) = $0.80
      // Uses discount price since it's better for investor
      // New shares: 250K / $0.80 = 312,500 shares
      
      expect(postRound.totalShares).toBe(10_312_500);
      expect(postRound.founders[0].percentage).toBeCloseTo(97.0, 1);
    });
  });
  
  describe('Exit Simulation', () => {
    it('should calculate correct exit returns', () => {
      const scenario = createTestScenario(
        [{ initialEquity: 60 }, { initialEquity: 40 }],
        [{
          type: 'PRICED',
          capitalRaised: 2_000_000,
          pricedTerms: { preMoneyValuation: 8_000_000, sharePrice: 0 }
        }]
      );
      
      const states = FinancialEngine.calculateCapTable(scenario);
      const finalState = states[states.length - 1];
      const simulation = FinancialEngine.simulateExit(finalState, 100_000_000);
      
      expect(simulation.exitValuation).toBe(100_000_000);
      expect(simulation.founderReturns).toHaveLength(2);
      
      // Check that founder returns match their equity percentages
      const founder1Return = simulation.founderReturns[0];
      const expectedReturn = (founder1Return.finalEquity / 100) * 100_000_000;
      expect(founder1Return.cashReturn).toBeCloseTo(expectedReturn, 0);
    });
  });
  
  describe('Validation', () => {
    it('should validate equity allocation', () => {
      const scenario = createTestScenario([
        { initialEquity: 60 },
        { initialEquity: 50 } // Totals to 110%
      ]);
      
      const errors = FinancialEngine.validateScenario(scenario);
      expect(errors).toContain('Total equity must sum to 100%');
    });
    
    it('should require at least one founder', () => {
      const scenario = createTestScenario([]);
      
      const errors = FinancialEngine.validateScenario(scenario);
      expect(errors).toContain('At least one founder is required');
    });
  });
});