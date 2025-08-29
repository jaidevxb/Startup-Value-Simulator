export interface Founder {
  id: string;
  name: string;
  initialEquity: number; // as percentage
  currentEquity: number;
  shares: number;
}

export interface ESOPPool {
  id: string;
  percentage: number;
  shares: number;
  isPreMoney: boolean;
  roundId?: string;
}

export interface Investor {
  id: string;
  name: string;
  equity: number;
  shares: number;
  investmentAmount: number;
  roundId: string;
}

export type RoundType = 'SAFE' | 'PRICED';

export interface SAFETerms {
  valuationCap?: number;
  discount?: number; // as percentage (e.g., 20 for 20%)
  mostFavoredNation?: boolean;
}

export interface PricedRoundTerms {
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  sharePrice: number;
}

export interface FundingRound {
  id: string;
  name: string;
  type: RoundType;
  capitalRaised: number;
  safeTerms?: SAFETerms;
  pricedTerms?: PricedRoundTerms;
  esopAdjustment?: {
    newPoolPercentage: number;
    isPreMoney: boolean;
  };
  founderSecondary?: {
    founderId: string;
    sharesOrPercentage: number;
    isPercentage: boolean;
  };
  timestamp: Date;
}

export interface Scenario {
  id: string;
  name: string;
  founders: Founder[];
  esopPools: ESOPPool[];
  rounds: FundingRound[];
  totalShares: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExitSimulation {
  exitValuation: number;
  founderReturns: Array<{
    founderId: string;
    name: string;
    finalEquity: number;
    cashReturn: number;
  }>;
  esopValue: number;
  investorReturns: Array<{
    investorId: string;
    name: string;
    finalEquity: number;
    cashReturn: number;
    multiple: number;
  }>;
}

export interface CapTableState {
  totalShares: number;
  founders: Array<{
    id: string;
    name: string;
    shares: number;
    percentage: number;
  }>;
  esop: {
    shares: number;
    percentage: number;
  };
  investors: Array<{
    id: string;
    name: string;
    shares: number;
    percentage: number;
    investmentAmount: number;
  }>;
}

export interface RoundCalculationResult {
  preRoundState: CapTableState;
  postRoundState: CapTableState;
  newShares: number;
  sharePrice: number;
  valuation: {
    preMoney: number;
    postMoney: number;
  };
}