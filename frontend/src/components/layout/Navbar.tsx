import React from 'react';
import { Cpu, ShieldCheck, FileText, Activity, Layers, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveAnalysis: boolean;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveAnalysis,
  onReset
}) => {
  const navItems = [
    { id: 'intake', label: 'Device Intake & AI', icon: Cpu },
    { id: 'passport', label: 'Material Passport', icon: FileText, disabled: !hasActiveAnalysis },
    { id: 'advisor', label: 'Safety & Disposal Advisor', icon: ShieldCheck, disabled: !hasActiveAnalysis },
    { id: 'simulation', label: 'Simulation & Monte Carlo', icon: Activity, disabled: !hasActiveAnalysis },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('intake')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-eco-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-eco-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">EcoRecover</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-eco-500/10 text-eco-400 border border-eco-500/20">
                AI + SIM
              </span>
            </div>
            <p className="text-xs text-slate-400">E-Waste Material Passport & Disassembly Simulator</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-dark-900/90 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-eco-600 text-white shadow-md shadow-eco-600/30'
                    : item.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          {hasActiveAnalysis && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-white/5 transition-colors"
              title="Reset analysis"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>New Analysis</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-eco-500 animate-pulse"></span>
            <span>SimPy Core Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
