import React from 'react';
import { Layers, Menu, Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onLoadPreset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onLoadPreset }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-black px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Project Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-black hover:bg-zinc-100 border-2 border-black shadow-[1px_1px_0px_0px_#000000] transition-all"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-black uppercase">
                  ECO<span className="text-red-600">RECOVER</span>
                </span>
                <span className="text-xs uppercase font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border-2 border-red-500">
                  AI + SIM
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 font-semibold hidden sm:block">
                E-Waste Material Passport, Recovery Advisor & Disassembly Simulation System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Engine Status & Quick Load Action */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-black text-sm text-black font-bold shadow-[2px_2px_0px_0px_#000000]">
            <Activity className="h-4 w-4 text-red-600 animate-pulse" />
            <span>SimPy Core Active</span>
          </div>

          <button
            type="button"
            onClick={onLoadPreset}
            className="tri-btn-red py-2 px-4 text-sm font-bold flex items-center gap-2 cursor-pointer"
            title="Load 5-Year Laptop Specimen Preset"
          >
            <Sparkles className="h-4 w-4" />
            <span>Demo Specimen</span>
          </button>
        </div>
      </div>
    </header>
  );
};
