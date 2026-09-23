import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DeviceIntakeForm } from './components/upload/DeviceIntakeForm';
import { MaterialPassportCard } from './components/passport/MaterialPassportCard';
import { SafetyAdvisorView } from './components/advisor/SafetyAdvisorView';
import { SimulationStudio } from './components/simulation/SimulationStudio';
import type {
  AnalysisResult,
  DigitalPassport,
  SafetyAdvisorData
} from './types';
import {
  analyzeDevice,
  fetchMaterialPassport,
  fetchSafetyRecommendations,
  type DeviceIntakePayload
} from './services/api';
import { AlertCircle, ArrowRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('intake');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [passportData, setPassportData] = useState<DigitalPassport | null>(null);
  const [safetyData, setSafetyData] = useState<SafetyAdvisorData | null>(null);

  const handleDeviceIntakeSubmit = async (payload: DeviceIntakePayload) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Analyze Device
      const analysis = await analyzeDevice(payload);
      setAnalysisResult(analysis);

      // 2. Fetch Digital Material Passport
      const passport = await fetchMaterialPassport(analysis.analysis_id);
      setPassportData(passport);

      // 3. Fetch Safety & Disposal Recommendations
      const safety = await fetchSafetyRecommendations(analysis.analysis_id);
      setSafetyData(safety);

      // Navigate to Passport
      setActiveTab('passport');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during e-waste device analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemoSpecimen = async () => {
    await handleDeviceIntakeSubmit({
      category: 'Laptop',
      brand: 'Acer / Reference Architecture',
      model: 'Nitro 15.6" Gaming Specimen',
      screen_size_inch: 15.6,
      age_years: 5.0,
      power_state: 'does_not_turn_on',
      battery_state: 'degraded',
      physical_condition: 'moderate',
      known_faults: ['Thermal throttling history', 'Degraded cells']
    });
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setPassportData(null);
    setSafetyData(null);
    setErrorMessage(null);
    setActiveTab('intake');
  };

  return (
    <div className="relative min-h-screen bg-zinc-100 text-black flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Smooth Diagonally Moving Dots in the Deep Background */}
      <div className="moving-dots-bg" aria-hidden="true" />

      {/* Top Header Bar */}
      <div className="relative z-20">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLoadPreset={handleLoadDemoSpecimen}
        />
      </div>

      {/* Main Layout Container (Fixed Sidebar + Scrollable Content) */}
      <div className="relative z-10 flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasActiveAnalysis={!!analysisResult}
          onReset={handleReset}
          onLoadPreset={handleLoadDemoSpecimen}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 border-2 border-red-600 text-red-950 flex items-start gap-3 text-sm shadow-[2px_2px_0px_0px_#dc2626]">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-black block mb-0.5">Analysis Failed</span>
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-700 hover:text-black font-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: DEVICE INTAKE & AI */}
          {activeTab === 'intake' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="border-b-2 border-black pb-3">
                <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                  Device Intake & AI Analysis
                </h1>
                <p className="text-sm text-zinc-600 font-medium mt-1">
                  Upload discarded specimen photograph and specify operating history to generate verified material passport.
                </p>
              </div>

              <DeviceIntakeForm
                onSubmit={handleDeviceIntakeSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* TAB 2: DIGITAL MATERIAL PASSPORT */}
          {activeTab === 'passport' && passportData && analysisResult && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-black pb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                    Digital Material Passport
                  </h1>
                  <p className="text-sm text-zinc-600 font-medium mt-1">
                    ESPR / WEEE compliant circular identity, mass allocation, and component taxonomy audit.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('advisor')}
                  className="tri-btn-red py-2.5 px-4 text-sm font-bold flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Safety Advisor</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <MaterialPassportCard
                passport={passportData}
                analysis={analysisResult}
              />
            </div>
          )}

          {/* TAB 3: SAFETY & DISPOSAL ADVISOR */}
          {activeTab === 'advisor' && safetyData && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-black pb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                    Smart Recovery & Safety Advisor
                  </h1>
                  <p className="text-sm text-zinc-600 font-medium mt-1">
                    OSHA / WEEE safety directives, lithium hazard isolation, and verified component procedures.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className="tri-btn-red py-2.5 px-4 text-sm font-bold flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Simulation Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <SafetyAdvisorView data={safetyData} />
            </div>
          )}

          {/* TAB 4: SIMULATION STUDIO */}
          {activeTab === 'simulation' && analysisResult && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="border-b-2 border-black pb-3">
                <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                  Simulation & Optimization Studio
                </h1>
                <p className="text-sm text-zinc-600 font-medium mt-1">
                  1,000-run Monte Carlo uncertainty modeling and multi-objective strategy decision support.
                </p>
              </div>

              <SimulationStudio analysisId={analysisResult.analysis_id} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
