import React from 'react';
import { Calculator, Share, LogOut, User, GitCompare } from 'lucide-react';
import { useScenarioStore } from '../store/scenario-store';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onAuthClick: () => void;
  onCompareClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, onCompareClick }) => {
  const { currentScenario, clearScenario } = useScenarioStore();
  const { user, signOut } = useAuth();
  
  const handleShare = () => {
    if (currentScenario) {
      const url = `${window.location.origin}?scenario=${encodeURIComponent(JSON.stringify(currentScenario))}`;
      navigator.clipboard.writeText(url);
      alert('Scenario link copied to clipboard!');
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    clearScenario();
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Startup Value Simulator</h1>
              <p className="text-sm text-gray-600">Model cap tables & exit scenarios</p>
            </div>
          </div>
          
          {currentScenario && (
            <div className="flex items-center gap-3">
              <button
                onClick={onCompareClick}
                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Compare scenarios"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </button>
              <div className="text-right">
                <p className="font-medium text-gray-900">{currentScenario.name}</p>
                <p className="text-xs text-gray-500">
                  {currentScenario.founders.length} founders • {currentScenario.rounds.length} rounds
                </p>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share scenario"
              >
                <Share className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={clearScenario}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                New Scenario
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};