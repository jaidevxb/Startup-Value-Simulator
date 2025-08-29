import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { ExampleScenarios } from './components/ExampleScenarios';
import { SavedScenarios } from './components/SavedScenarios';
import { AuthModal } from './components/AuthModal';
import { ScenarioComparison } from './components/ScenarioComparison';
import { useState } from 'react';
import { RoundBuilder } from './components/RoundBuilder';
import { CapTableView } from './components/CapTableView';
import { ExitSimulator } from './components/ExitSimulator';
import { OwnershipChart } from './components/OwnershipChart';
import { AuditTrail } from './components/AuditTrail';
import { useScenarioStore } from './store/scenario-store';
import { useAuth } from './hooks/useAuth';
import { Scenario } from './types/financial';

function App() {
  const { currentScenario, loadScenario } = useScenarioStore();
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<Scenario[]>([]);

  // Remove Bolt branding badge
  useEffect(() => {
    const interval = setInterval(() => {
      // Find any "Made in Bolt" badge in Shadow DOM
      document.querySelectorAll("div[style*='position: fixed']").forEach(el => {
        const shadow = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
        if (shadow) {
          const badge = shadow.querySelector(".badge, span");
          if (badge && badge.textContent?.includes("Bolt")) {
            el.remove(); // remove the whole injected container
            clearInterval(interval);
          }
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);


  
  // Load scenario from URL if shared
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioParam = urlParams.get('scenario');
    
    if (scenarioParam && !currentScenario) {
      try {
        const sharedScenario: Scenario = JSON.parse(decodeURIComponent(scenarioParam));
        loadScenario(sharedScenario);
      } catch (error) {
        console.error('Failed to load shared scenario:', error);
      }
    }
  }, [currentScenario, loadScenario]);
  
  const handleCompareClick = () => {
    if (currentScenario) {
      setComparisonScenarios([currentScenario]);
      setShowComparison(true);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAuthClick={() => setShowAuthModal(true)}
        onCompareClick={handleCompareClick}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentScenario ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Model Your Startup's Cap Table
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Build funding scenarios, track equity dilution, and simulate exit returns 
                with professional-grade financial modeling.
              </p>
            </div>
            
            {/* Example Scenarios */}
            <div className="mb-8">
              <ExampleScenarios />
            </div>
            
            {/* Saved Scenarios (only if authenticated) */}
            {user && (
              <div className="mb-8">
                <SavedScenarios onCompare={setComparisonScenarios} />
              </div>
            )}
            
            <ScenarioBuilder />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {user && <SavedScenarios onCompare={(scenarios) => {
                  setComparisonScenarios(scenarios);
                  setShowComparison(true);
                }} />}
                <RoundBuilder />
                <CapTableView />
              </div>
              <div className="space-y-6">
                <ExitSimulator />
                <OwnershipChart />
              </div>
            </div>
            
            {/* Audit Trail */}
            <AuditTrail />
          </div>
        )}
      </main>
      
      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {showComparison && (
        <ScenarioComparison
          scenarios={comparisonScenarios}
          onClose={() => setShowComparison(false)}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="flex items-center justify-center gap-2">
              Built with 
              <span className="text-red-500">♥</span> 
              for founders modeling their future
            </p>
            <p className="text-sm mt-2 text-gray-500">
              Financial calculations for educational purposes. Consult professionals for legal advice.
            </p>
            <p className="text-sm mt-2 text-gray-500">
              Made by <a 
                href="https://www.linkedin.com/in/jaidevb/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Jaidev B
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;