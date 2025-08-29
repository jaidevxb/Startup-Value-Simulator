import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Scenario, Founder, FundingRound, ESOPPool, CapTableState, ExitSimulation } from '../types/financial';
import { FinancialEngine } from '../utils/financial-engine';
import { supabase } from '../lib/supabase';

interface ScenarioStore {
  currentScenario: Scenario | null;
  capTableStates: CapTableState[];
  exitSimulation: ExitSimulation | null;
  exitValuation: number;
  
  // Actions
  saveScenarioToSupabase: (userId: string) => Promise<void>;
  loadScenariosFromSupabase: (userId: string) => Promise<Scenario[]>;
  createScenario: (name: string, founders: Founder[], esopPools: ESOPPool[]) => void;
  updateScenario: (updates: Partial<Scenario>) => void;
  addFounder: (founder: Founder) => void;
  updateFounder: (founderId: string, updates: Partial<Founder>) => void;
  removeFounder: (founderId: string) => void;
  addRound: (round: FundingRound) => void;
  updateRound: (roundId: string, updates: Partial<FundingRound>) => void;
  removeRound: (roundId: string) => void;
  updateESOPPool: (updates: Partial<ESOPPool>) => void;
  recalculate: () => void;
  simulateExit: (exitValuation: number) => void;
  loadScenario: (scenario: Scenario) => void;
  clearScenario: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      currentScenario: null,
      capTableStates: [],
      exitSimulation: null,
      exitValuation: 100_000_000, // Default 100M exit
      
      createScenario: (name, founders, esopPools) => {
        const scenario: Scenario = {
          id: generateId(),
          name,
          founders: founders.map(f => ({ ...f, currentEquity: f.initialEquity, shares: 0 })),
          esopPools,
          rounds: [],
          totalShares: FinancialEngine['INITIAL_SHARES'],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set({ currentScenario: scenario });
        get().recalculate();
      },
      
      updateScenario: (updates) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            ...updates,
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      addFounder: (founder) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            founders: [...current.founders, { ...founder, currentEquity: founder.initialEquity, shares: 0 }],
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      updateFounder: (founderId, updates) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            founders: current.founders.map(f => 
              f.id === founderId ? { ...f, ...updates } : f
            ),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      removeFounder: (founderId) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            founders: current.founders.filter(f => f.id !== founderId),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      addRound: (round) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            rounds: [...current.rounds, round].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      updateRound: (roundId, updates) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            rounds: current.rounds.map(r => 
              r.id === roundId ? { ...r, ...updates } : r
            ),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      removeRound: (roundId) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            rounds: current.rounds.filter(r => r.id !== roundId),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      updateESOPPool: (updates) => {
        const current = get().currentScenario;
        if (!current) return;
        
        set({
          currentScenario: {
            ...current,
            esopPools: current.esopPools.map(pool => ({ ...pool, ...updates })),
            updatedAt: new Date()
          }
        });
        get().recalculate();
      },
      
      recalculate: () => {
        const scenario = get().currentScenario;
        if (!scenario) return;
        
        try {
          const states = FinancialEngine.calculateCapTable(scenario);
          set({ capTableStates: states });
          
          // Recalculate exit simulation if exit valuation is set
          const exitVal = get().exitValuation;
          if (exitVal && states.length > 0) {
            const finalState = states[states.length - 1];
            const simulation = FinancialEngine.simulateExit(finalState, exitVal);
            set({ exitSimulation: simulation });
          }
        } catch (error) {
          console.error('Calculation error:', error);
        }
      },
      
      simulateExit: (exitValuation) => {
        set({ exitValuation });
        
        const states = get().capTableStates;
        if (states.length === 0) return;
        
        const finalState = states[states.length - 1];
        const simulation = FinancialEngine.simulateExit(finalState, exitValuation);
        set({ exitSimulation: simulation });
      },
      
      loadScenario: (scenario) => {
        set({ currentScenario: scenario });
        get().recalculate();
      },
      
      clearScenario: () => {
        set({ 
          currentScenario: null, 
          capTableStates: [], 
          exitSimulation: null 
        });
      },
      
      saveScenarioToSupabase: async (userId: string) => {
        const scenario = get().currentScenario;
        if (!scenario) return;
        
        const { error } = await supabase
          .from('scenarios')
          .upsert({
            user_id: userId,
            name: scenario.name,
            data: scenario
          });
          
        if (error) {
          console.error('Error saving scenario:', error);
          throw error;
        }
      },
      
      loadScenariosFromSupabase: async (userId: string) => {
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading scenarios:', error);
          throw error;
        }
        
        return data?.map(row => row.data) || [];
      }
    }),
    {
      name: 'scenario-store',
      partialize: (state) => ({
        currentScenario: state.currentScenario,
        exitValuation: state.exitValuation
      })
    }
  )
);