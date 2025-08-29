import React, { useState, useEffect } from 'react';
import { Save, Folder, Trash2, Download, Copy, Calendar, GitCompare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useScenarioStore } from '../store/scenario-store';
import { supabase } from '../lib/supabase';
import { Scenario } from '../types/financial';

interface SavedScenario {
  id: string;
  name: string;
  data: Scenario;
  created_at: string;
}

interface SavedScenariosProps {
  onCompare?: (scenarios: Scenario[]) => void;
}

export const SavedScenarios: React.FC<SavedScenariosProps> = ({ onCompare }) => {
  const { user } = useAuth();
  const { currentScenario, loadScenario } = useScenarioStore();
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());

  const loadSavedScenarios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedScenarios(data || []);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedScenarios();
  }, [user]);

  const saveCurrentScenario = async () => {
    if (!user || !currentScenario) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('scenarios')
        .upsert({
          user_id: user.id,
          name: currentScenario.name,
          data: currentScenario
        });

      if (error) throw error;
      await loadSavedScenarios();
    } catch (error) {
      console.error('Error saving scenario:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadSavedScenarios();
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  };

  const exportToCSV = (scenario: Scenario) => {
    const csvContent = [
      ['Stakeholder', 'Type', 'Shares', 'Percentage'],
      ...scenario.founders.map(f => [f.name, 'Founder', f.shares.toString(), f.currentEquity.toFixed(2) + '%']),
      ...scenario.esopPools.map(e => ['ESOP Pool', 'ESOP', e.shares.toString(), e.percentage.toFixed(2) + '%'])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.name.replace(/\s+/g, '_')}_cap_table.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareScenario = (scenario: Scenario) => {
    const url = `${window.location.origin}?scenario=${encodeURIComponent(JSON.stringify(scenario))}`;
    navigator.clipboard.writeText(url);
    alert('Scenario link copied to clipboard!');
  };

  const toggleComparisonSelection = (scenarioId: string) => {
    const newSelection = new Set(selectedForComparison);
    if (newSelection.has(scenarioId)) {
      newSelection.delete(scenarioId);
    } else if (newSelection.size < 3) { // Limit to 3 scenarios for comparison
      newSelection.add(scenarioId);
    }
    setSelectedForComparison(newSelection);
  };

  const handleCompare = () => {
    const scenarios = savedScenarios
      .filter(s => selectedForComparison.has(s.id))
      .map(s => s.data);
    
    if (currentScenario && !scenarios.find(s => s.id === currentScenario.id)) {
      scenarios.unshift(currentScenario);
    }
    
    if (onCompare && scenarios.length > 1) {
      onCompare(scenarios);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Saved Scenarios</h3>
        </div>
        {currentScenario && (
          <button
            onClick={saveCurrentScenario}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Current'}
          </button>
        )}
      </div>

      {/* Comparison Controls */}
      {savedScenarios.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Compare Scenarios ({selectedForComparison.size} selected)
              </p>
              <p className="text-xs text-blue-700">
                Select up to 3 scenarios to compare side by side
              </p>
            </div>
            {selectedForComparison.size > 1 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading scenarios...</p>
        </div>
      ) : savedScenarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No saved scenarios yet</p>
          <p className="text-sm">Save your current scenario to access it later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedScenarios.map((saved) => (
            <div key={saved.id} className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
              selectedForComparison.has(saved.id) 
                ? 'bg-blue-100 border-2 border-blue-300' 
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}>
              <input
                type="checkbox"
                checked={selectedForComparison.has(saved.id)}
                onChange={() => toggleComparisonSelection(saved.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{saved.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(saved.created_at).toLocaleDateString()}
                  </span>
                  <span>{saved.data.founders?.length || 0} founders</span>
                  <span>{saved.data.rounds?.length || 0} rounds</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadScenario(saved.data)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Load scenario"
                >
                  <Folder className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareScenario(saved.data)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Share scenario"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportToCSV(saved.data)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteScenario(saved.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete scenario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};