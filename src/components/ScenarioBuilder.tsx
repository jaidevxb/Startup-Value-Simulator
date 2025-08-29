import React, { useState } from 'react';
import { Plus, Trash2, Users, DollarSign } from 'lucide-react';
import { useScenarioStore } from '../store/scenario-store';
import { useAuth } from '../hooks/useAuth';
import { Founder, ESOPPool } from '../types/financial';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ScenarioBuilder: React.FC = () => {
  const createScenario = useScenarioStore(state => state.createScenario);
  const { user } = useAuth();
  
  const [scenarioName, setScenarioName] = useState('My Startup');
  const [founders, setFounders] = useState<Founder[]>([
    { id: generateId(), name: 'Founder 1', initialEquity: 70, currentEquity: 70, shares: 0 },
    { id: generateId(), name: 'Founder 2', initialEquity: 30, currentEquity: 30, shares: 0 }
  ]);
  const [esopPool, setEsopPool] = useState<number>(0);
  
  const totalEquity = founders.reduce((sum, f) => sum + f.initialEquity, 0) + esopPool;
  const isValid = Math.abs(totalEquity - 100) < 0.01 && founders.length > 0;
  
  const addFounder = () => {
    setFounders([
      ...founders,
      { 
        id: generateId(), 
        name: `Founder ${founders.length + 1}`, 
        initialEquity: 0, 
        currentEquity: 0, 
        shares: 0 
      }
    ]);
  };
  
  const removeFounder = (id: string) => {
    setFounders(founders.filter(f => f.id !== id));
  };
  
  const updateFounder = (id: string, field: string, value: string | number) => {
    setFounders(founders.map(f => 
      f.id === id ? { ...f, [field]: typeof value === 'string' ? value : Number(value) } : f
    ));
  };
  
  const handleCreateScenario = () => {
    const esopPools: ESOPPool[] = esopPool > 0 ? [{
      id: generateId(),
      percentage: esopPool,
      shares: 0,
      isPreMoney: true
    }] : [];
    
    createScenario(scenarioName, founders, esopPools);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Create New Scenario</h2>
      </div>
      
      {/* Scenario Name */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scenario Name
        </label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Enter scenario name"
        />
      </div>
      
      {/* Founders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Founders & Initial Equity
          </label>
          <button
            onClick={addFounder}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Founder
          </button>
        </div>
        
        <div className="space-y-3">
          {founders.map((founder, index) => (
            <div key={founder.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={founder.name}
                  onChange={(e) => updateFounder(founder.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Founder name"
                />
              </div>
              <div className="w-32">
                <div className="relative">
                  <input
                    type="number"
                    value={founder.initialEquity}
                    onChange={(e) => updateFounder(founder.id, 'initialEquity', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              {founders.length > 1 && (
                <button
                  onClick={() => removeFounder(founder.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* ESOP Pool */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initial ESOP Pool (Optional)
        </label>
        <div className="w-32">
          <div className="relative">
            <input
              type="number"
              value={esopPool}
              onChange={(e) => setEsopPool(Number(e.target.value))}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              max="50"
              step="0.1"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
          </div>
        </div>
      </div>
      
      {/* Validation */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Total Equity Allocated:</span>
          <span className={`font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {totalEquity.toFixed(1)}%
          </span>
        </div>
        {!isValid && (
          <p className="text-red-600 text-sm mt-2">
            Total equity must equal 100%. Current total: {totalEquity.toFixed(1)}%
          </p>
        )}
      </div>
      
      {!user && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Sign in to save your scenarios</strong> and access them later from any device.
          </p>
        </div>
      )}
      
      {/* Create Button */}
      <button
        onClick={handleCreateScenario}
        disabled={!isValid}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Create Scenario
      </button>
    </div>
  );
};