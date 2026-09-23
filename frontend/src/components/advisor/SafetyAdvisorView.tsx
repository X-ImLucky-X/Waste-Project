import React from 'react';
import type { SafetyAdvisorData } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, HardDrive, Battery, Cpu } from 'lucide-react';

interface SafetyAdvisorViewProps {
  data: SafetyAdvisorData;
}

export const SafetyAdvisorView: React.FC<SafetyAdvisorViewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Mandatory Safety Directive Banner (Tri-Color Red + White + Black) */}
      <div className="tri-card p-6 bg-red-50 border-2 border-black">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-600 border-2 border-black flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[2px_2px_0px_0px_#000000]">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono uppercase tracking-widest text-red-600 font-black">
                MANDATORY SAFETY PROTOCOL (OSHA / WEEE)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                {data.hazardous_components_detected} Hazardous Items Isolated
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black">
              Strict Prohibition on Manual Hazardous Subassembly Teardowns
            </h3>
            <p className="text-sm text-zinc-800 font-medium leading-relaxed max-w-4xl">
              Lithium-ion cells and high-voltage power assemblies pose severe exothermic thermal runaway, toxic fluoride gas emission, and capacitor discharge risks. 
              <strong> The system strictly forbids manual dismantling of battery cells or pouch packs.</strong> Always route hazardous units intact to certified hydrometallurgical recycling facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Component Advisory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.action_items.map((item) => {
          const isBattery = item.component_code === 'battery';
          const isStorage = item.data_wipe_required || item.component_code === 'ssd';

          return (
            <div
              key={item.component_code}
              className={`tri-card p-6 space-y-4 ${
                item.is_hazardous
                  ? 'border-2 border-red-600 bg-red-50/30'
                  : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                      item.is_hazardous
                        ? 'bg-red-600 text-white'
                        : isStorage
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    {isBattery ? (
                      <Battery className="h-6 w-6" />
                    ) : isStorage ? (
                      <HardDrive className="h-6 w-6" />
                    ) : (
                      <Cpu className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-black">{item.component_name}</h4>
                    <span className="text-xs font-mono text-zinc-600 font-bold">{item.recycling_channel}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full border-2 uppercase ${
                    item.is_hazardous
                      ? 'bg-red-600 text-white border-black shadow-[1px_1px_0px_0px_#000000]'
                      : item.category === 'REUSABLE'
                      ? 'bg-red-50 text-red-600 border-red-500'
                      : 'bg-white text-black border-black'
                  }`}
                >
                  {item.category}
                </span>
              </div>

              {/* Special Warning if present */}
              {item.special_warnings && (
                <div className="p-3.5 rounded-xl bg-red-100/80 border-2 border-red-600 flex items-start gap-2.5 text-sm text-red-950 font-bold">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{item.special_warnings}</span>
                </div>
              )}

              {/* Procedure */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border-2 border-black text-sm text-black font-medium">
                <span className="font-black text-black block mb-1">Recommended Action:</span>
                {item.recommended_action}
              </div>

              {/* DOs and DON'Ts */}
              <div className="space-y-3 pt-1 font-medium">
                {item.dos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs sm:text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-black" />
                      Mandatory Handling Steps (DO)
                    </span>
                    <ul className="space-y-1 text-black pl-1">
                      {item.dos.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-black font-black">✓</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.donts.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t-2 border-zinc-100">
                    <span className="text-xs sm:text-sm font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Prohibited Actions (DO NOT)
                    </span>
                    <ul className="space-y-1 text-red-800 pl-1 font-semibold">
                      {item.donts.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-red-600 font-black">✗</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
