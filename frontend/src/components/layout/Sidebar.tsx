import React from 'react';
import {
  Cpu,
  FileText,
  ShieldCheck,
  Activity,
  RotateCcw,
  Sparkles,
  X,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveAnalysis: boolean;
  onReset: () => void;
  onLoadPreset: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveAnalysis,
  onReset,
  onLoadPreset,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'intake', label: 'Device Intake & AI', icon: Cpu },
    { id: 'passport', label: 'Material Passport', icon: FileText, disabled: !hasActiveAnalysis },
    { id: 'advisor', label: 'Safety & Disposal Advisor', icon: ShieldCheck, disabled: !hasActiveAnalysis },
    { id: 'simulation', label: 'Disassembly Simulation', icon: Activity, disabled: !hasActiveAnalysis },
  ];

  const handleSelectTab = (id: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 bg-white border-r-2 border-black p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:static lg:z-10`}
      >
        <div className="space-y-5">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-black lg:hidden">
            <span className="font-black text-black text-base uppercase">Navigation</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-black hover:bg-zinc-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Buttons (Tri-Color Red + White + Black) */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id, item.disabled)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-red-50 border-2 border-red-500 text-red-600 shadow-[3px_3px_0px_0px_#dc2626]'
                      : item.disabled
                      ? 'bg-zinc-50 border-2 border-zinc-200 text-zinc-300 cursor-not-allowed'
                      : 'bg-white border-2 border-black text-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-red-600' : item.disabled ? 'text-zinc-300' : 'text-black'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Project Research Quickstart Card */}
          <div className="tri-card p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2 text-sm font-black text-black">
              <Sliders className="h-4 w-4 text-red-600" />
              <span>Simulation Engine</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Evaluates discrete-event dismantling timelines and 1,000 Monte Carlo runs with zero latency.
            </p>
            <div className="p-2.5 rounded-lg bg-zinc-50 border-2 border-black text-xs text-zinc-800 font-bold space-y-1">
              <div>• SimPy Precedence Modeling</div>
              <div>• 1,000 Stochastic Iterations</div>
              <div>• WEEE Directive & ESPR Compliance</div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLoadPreset();
                handleSelectTab('intake');
              }}
              className="w-full tri-btn-red py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Load 5-Year Laptop Specimen</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t-2 border-black space-y-2.5">
          {hasActiveAnalysis && (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Current Specimen</span>
            </button>
          )}

          <div className="text-xs text-zinc-600 font-bold text-center font-mono">
            EcoRecover AI • SEM-7 Capstone
          </div>
        </div>
      </aside>
    </>
  );
};
