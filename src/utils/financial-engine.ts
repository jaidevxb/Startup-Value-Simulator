import { 
  Founder, 
  FundingRound, 
  ESOPPool, 
  Investor, 
  CapTableState, 
  RoundCalculationResult, 
  ExitSimulation,
  Scenario 
} from '../types/financial';

export class FinancialEngine {
  private static readonly INITIAL_SHARES = 10_000_000; // 10M shares initially
  
  static calculateCapTable(scenario: Scenario): CapTableState[] {
    const states: CapTableState[] = [];
    
    // Initial state
    let currentState = this.createInitialState(scenario.founders, scenario.esopPools);
    states.push(currentState);
    
    // Process each round
    for (const round of scenario.rounds) {
      const result = this.processRound(currentState, round);
      currentState = result.postRoundState;
      states.push(currentState);
    }
    
    return states;
  }
  
  private static createInitialState(founders: Founder[], esopPools: ESOPPool[]): CapTableState {
    const totalEquityPercent = founders.reduce((sum, f) => sum + f.initialEquity, 0) +
                              esopPools.reduce((sum, e) => sum + e.percentage, 0);
    
    if (Math.abs(totalEquityPercent - 100) > 0.01) {
      throw new Error('Initial equity must sum to 100%');
    }
    
    const totalShares = this.INITIAL_SHARES;
    const esopShares = esopPools.reduce((sum, pool) => 
      sum + Math.round((pool.percentage / 100) * totalShares), 0);
    
    return {
      totalShares,
      founders: founders.map(founder => ({
        id: founder.id,
        name: founder.name,
        shares: Math.round((founder.initialEquity / 100) * totalShares),
        percentage: founder.initialEquity
      })),
      esop: {
        shares: esopShares,
        percentage: esopPools.reduce((sum, pool) => sum + pool.percentage, 0)
      },
      investors: []
    };
  }
  
  private static processRound(
    preRoundState: CapTableState, 
    round: FundingRound
  ): RoundCalculationResult {
    let postRoundState = { ...preRoundState };
    let sharePrice: number;
    let preMoney: number;
    let postMoney: number;
    let newShares: number;
    
    if (round.type === 'PRICED') {
      const terms = round.pricedTerms!;
      
      if (terms.preMoneyValuation) {
        preMoney = terms.preMoneyValuation;
        sharePrice = preMoney / postRoundState.totalShares;
        newShares = round.capitalRaised / sharePrice;
        postMoney = preMoney + round.capitalRaised;
      } else {
        postMoney = terms.postMoneyValuation!;
        preMoney = postMoney - round.capitalRaised;
        sharePrice = preMoney / postRoundState.totalShares;
        newShares = round.capitalRaised / sharePrice;
      }
    } else {
      // SAFE conversion logic
      const safeTerms = round.safeTerms!;
      
      // For SAFE, we need a subsequent priced round to convert
      // For now, assume immediate conversion at cap or discount
      if (safeTerms.valuationCap) {
        sharePrice = safeTerms.valuationCap / postRoundState.totalShares;
      } else {
        // If no cap, we need the next round's terms
        throw new Error('SAFE without cap requires conversion round details');
      }
      
      if (safeTerms.discount) {
        const discountPrice = sharePrice * (1 - safeTerms.discount / 100);
        sharePrice = Math.min(sharePrice, discountPrice);
      }
      
      newShares = round.capitalRaised / sharePrice;
      preMoney = sharePrice * postRoundState.totalShares;
      postMoney = preMoney + round.capitalRaised;
    }
    
    // Handle ESOP adjustments
    if (round.esopAdjustment) {
      const { newPoolPercentage, isPreMoney } = round.esopAdjustment;
      postRoundState = this.adjustESOPPool(postRoundState, newPoolPercentage, isPreMoney, newShares);
    }
    
    // Add new investor
    const newTotalShares = postRoundState.totalShares + newShares;
    const investorEquityPercent = (newShares / newTotalShares) * 100;
    
    const newInvestor: Investor = {
      id: `investor-${round.id}`,
      name: `${round.name} Investor`,
      equity: investorEquityPercent,
      shares: newShares,
      investmentAmount: round.capitalRaised,
      roundId: round.id
    };
    
    // Recalculate all percentages
    postRoundState.totalShares = newTotalShares;
    postRoundState.founders = postRoundState.founders.map(founder => ({
      ...founder,
      percentage: (founder.shares / newTotalShares) * 100
    }));
    
    postRoundState.esop.percentage = (postRoundState.esop.shares / newTotalShares) * 100;
    
    postRoundState.investors = [
      ...postRoundState.investors.map(investor => ({
        ...investor,
        percentage: (investor.shares / newTotalShares) * 100
      })),
      {
        id: newInvestor.id,
        name: newInvestor.name,
        shares: newInvestor.shares,
        percentage: investorEquityPercent,
        investmentAmount: newInvestor.investmentAmount
      }
    ];
    
    return {
      preRoundState,
      postRoundState,
      newShares,
      sharePrice,
      valuation: { preMoney, postMoney }
    };
  }
  
  private static adjustESOPPool(
    state: CapTableState, 
    targetPercent: number, 
    isPreMoney: boolean, 
    newSharesFromRound: number
  ): CapTableState {
    const currentESOPPercent = (state.esop.shares / state.totalShares) * 100;
    
    if (targetPercent <= currentESOPPercent) {
      return state; // No adjustment needed
    }
    
    const additionalESOPPercent = targetPercent - currentESOPPercent;
    let additionalESOPShares: number;
    
    if (isPreMoney) {
      // ESOP dilution happens before the round
      additionalESOPShares = (additionalESOPPercent / 100) * state.totalShares;
      
      // Dilute founders proportionally
      const dilutionFactor = state.totalShares / (state.totalShares + additionalESOPShares);
      state.founders = state.founders.map(founder => ({
        ...founder,
        shares: Math.round(founder.shares * dilutionFactor)
      }));
    } else {
      // ESOP comes from post-money pool
      const futureShares = state.totalShares + newSharesFromRound;
      additionalESOPShares = (targetPercent / 100) * futureShares - state.esop.shares;
    }
    
    return {
      ...state,
      esop: {
        shares: state.esop.shares + additionalESOPShares,
        percentage: targetPercent
      }
    };
  }
  
  static simulateExit(finalState: CapTableState, exitValuation: number): ExitSimulation {
    const founderReturns = finalState.founders.map(founder => ({
      founderId: founder.id,
      name: founder.name,
      finalEquity: founder.percentage,
      cashReturn: (founder.percentage / 100) * exitValuation
    }));
    
    const investorReturns = finalState.investors.map(investor => ({
      investorId: investor.id,
      name: investor.name,
      finalEquity: investor.percentage,
      cashReturn: (investor.percentage / 100) * exitValuation,
      multiple: ((investor.percentage / 100) * exitValuation) / investor.investmentAmount
    }));
    
    const esopValue = (finalState.esop.percentage / 100) * exitValuation;
    
    return {
      exitValuation,
      founderReturns,
      esopValue,
      investorReturns
    };
  }
  
  static validateScenario(scenario: Partial<Scenario>): string[] {
    const errors: string[] = [];
    
    if (!scenario.founders || scenario.founders.length === 0) {
      errors.push('At least one founder is required');
    }
    
    if (scenario.founders) {
      const totalEquity = scenario.founders.reduce((sum, f) => sum + f.initialEquity, 0) +
                         (scenario.esopPools || []).reduce((sum, e) => sum + e.percentage, 0);
      
      if (Math.abs(totalEquity - 100) > 0.01) {
        errors.push('Total equity must sum to 100%');
      }
    }
    
    return errors;
  }
}