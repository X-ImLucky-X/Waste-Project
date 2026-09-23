import React from 'react';
import type { DigitalPassport, AnalysisResult } from '../../types';
import { Award, Leaf, AlertTriangle, Cpu, Layers, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MaterialPassportCardProps {
  passport: DigitalPassport;
  analysis: AnalysisResult;
}

export const MaterialPassportCard: React.FC<MaterialPassportCardProps> = ({ passport, analysis }) => {
  const categoryColors: Record<string, string> = {
    REUSABLE: '#dc2626',      // Bold Red
    REPAIRABLE: '#000000',    // Pure Black
    RECYCLABLE: '#4b5563',    // Dark Charcoal
    HAZARDOUS: '#991b1b',     // Deep Crimson
    RESIDUAL: '#9ca3af',      // Gray
  };

  const pieData = Object.entries(passport.category_counts).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#000000',
  }));

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'REUSABLE':
        return 'bg-red-50 text-red-600 border-2 border-red-500 shadow-[1px_1px_0px_0px_#dc2626]';
      case 'REPAIRABLE':
        return 'bg-black text-white border-2 border-black';
      case 'RECYCLABLE':
        return 'bg-zinc-100 text-black border-2 border-black';
      case 'HAZARDOUS':
        return 'bg-red-600 text-white border-2 border-black font-black shadow-[1px_1px_0px_0px_#000000]';
      default:
        return 'bg-white text-black border-2 border-black';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Passport Header Card (Tri-Color Red + White + Black) */}
      <div className="tri-card p-6 md:p-8 space-y-6 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-mono uppercase tracking-widest text-red-600 font-black flex items-center gap-2">
                <Award className="h-5 w-5" />
                DIGITAL MATERIAL PASSPORT (DPP)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                ESPR WEEE-2026
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              {passport.product_name}
            </h2>
            <p className="text-sm text-zinc-600 font-mono mt-1 font-bold">UID: {passport.passport_id}</p>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <div className="text-sm text-zinc-600 uppercase tracking-wider font-black">Circularity Index</div>
              <div className="text-3xl font-black text-red-600">{passport.weight_metrics.circularity_rate_pct}%</div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-100 border-2 border-black flex items-center justify-center text-red-600 shadow-[2px_2px_0px_0px_#000000]">
              <Leaf className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Specimen Visual Audit (If image uploaded) */}
        {analysis.image_url && (
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-50 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="relative h-28 w-36 rounded-xl overflow-hidden border-2 border-black shrink-0 bg-zinc-200 shadow-[1px_1px_0px_0px_#000000]">
              <img
                src={analysis.image_url}
                alt="Audited Hardware Specimen"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border-2 border-red-500 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Inspected Hardware Photograph
                </span>
                <span className="text-xs font-mono font-bold text-zinc-600">
                  Visual Wear: {analysis.visual_condition} ({Math.round(analysis.visual_condition_confidence * 100)}% Confidence)
                </span>
              </div>
              <h4 className="text-base font-black text-black">
                Surface Texture & Physical Wear Evaluated
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium">
                Spatial gradient roughness and RMS contrast variance extracted directly from physical hardware photograph.
              </p>
            </div>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">Condition Score</div>
            <div className="text-3xl font-black text-black flex items-center gap-2">
              <span>{passport.overall_condition_pct}%</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-500">
                {passport.overall_condition_label}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-zinc-600 font-bold mt-1.5">Age: {passport.age_years} yrs</div>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">Total Mass / Yield</div>
            <div className="text-3xl font-black text-black">
              {passport.weight_metrics.total_weight_kg} <span className="text-sm font-semibold text-zinc-500">kg</span>
            </div>
            <div className="text-xs sm:text-sm text-red-600 font-black mt-1.5">
              {passport.weight_metrics.recoverable_material_kg} kg recoverable
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">Residual Waste</div>
            <div className="text-3xl font-black text-black">
              {passport.weight_metrics.residual_waste_kg} <span className="text-sm font-semibold text-zinc-500">kg</span>
            </div>
            <div className="text-xs sm:text-sm text-zinc-600 font-bold mt-1.5">Landfill diversion target</div>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">Net Recovery Value</div>
            <div className="text-3xl font-black text-red-600">
              ₹{passport.economic_metrics.net_recovery_value_inr.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-zinc-600 font-bold mt-1.5">
              Gross: ₹{passport.economic_metrics.gross_recovery_value_inr.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Donut Breakdown + Environmental LCA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-5 tri-card p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-600" />
              <span>Classification Breakdown</span>
            </h3>
            <span className="text-sm font-mono text-black font-black">{passport.total_components_count} Parts</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: '2px', borderRadius: '8px', color: '#000000', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(passport.category_counts).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border-2 border-black">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black"
                    style={{ backgroundColor: categoryColors[cat] || '#000000' }}
                  />
                  <span className="text-black capitalize font-bold text-sm">{cat.toLowerCase()}</span>
                </div>
                <span className="font-black text-black text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Indicators */}
        <div className="lg:col-span-7 tri-card p-6 space-y-4 bg-white">
          <div className="border-b-2 border-black pb-3">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <Leaf className="h-5 w-5 text-red-600" />
              <span>Life Cycle Assessment (LCA) Savings</span>
            </h3>
            <p className="text-sm text-zinc-600 font-medium mt-0.5">Verified ecological offsets per e-waste unit diverted from open disposal.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-center shadow-[2px_2px_0px_0px_#dc2626]">
              <div className="text-3xl font-black text-red-600">
                {passport.environmental_offsets.co2_emissions_avoided_kg} kg
              </div>
              <div className="text-sm font-black text-red-900 mt-1">CO₂-eq Avoided</div>
            </div>
            <div className="p-4 rounded-xl bg-white border-2 border-black text-center shadow-[2px_2px_0px_0px_#000000]">
              <div className="text-3xl font-black text-black">
                {passport.environmental_offsets.landfill_diverted_kg} kg
              </div>
              <div className="text-sm font-black text-zinc-700 mt-1">Landfill Diverted</div>
            </div>
            <div className="p-4 rounded-xl bg-black text-white border-2 border-black text-center shadow-[2px_2px_0px_0px_#000000]">
              <div className="text-3xl font-black text-white">
                {passport.environmental_offsets.equivalent_trees_planted}
              </div>
              <div className="text-sm font-bold text-zinc-300 mt-1">Tree Offset Equiv.</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black text-sm text-zinc-800 space-y-1.5 font-medium">
            <div className="font-black text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-5 w-5 text-red-600" />
              <span>Regulatory & Governance Compliance</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-zinc-700 pl-1 font-semibold">
              {passport.compliance_standards.map((std, i) => (
                <li key={i}>{std}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Component Inventory Table */}
      <div className="tri-card p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-black pb-3">
          <div>
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <Cpu className="h-5 w-5 text-red-600" />
              <span>Component Inventory & Taxonomy Audit</span>
            </h3>
            <p className="text-sm text-zinc-600 font-medium">
              Distinguishes visually observed subassemblies from expected internal architecture.
            </p>
          </div>
          <span className="text-sm px-3.5 py-1.5 rounded-full bg-white text-black font-mono font-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
            {analysis.components.length} Subassemblies Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[960px]">
            <thead className="bg-zinc-100 text-black uppercase text-xs font-black border-b-2 border-black tracking-wider whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4 min-w-[240px]">Component Name</th>
                <th className="py-3.5 px-4 min-w-[160px]">Status</th>
                <th className="py-3.5 px-4 min-w-[150px]">Condition</th>
                <th className="py-3.5 px-4 min-w-[140px]">Classification</th>
                <th className="py-3.5 px-4 min-w-[110px]">Mass</th>
                <th className="py-3.5 px-4 min-w-[130px]">Estimated Value</th>
                <th className="py-3.5 px-4 min-w-[140px]">Hazard Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-100">
              {analysis.components.map((comp) => (
                <tr key={comp.code} className="hover:bg-red-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-black flex items-center gap-2 text-sm whitespace-nowrap">
                    {comp.is_hazardous && <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
                    <span>{comp.name}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${
                        comp.detection_status === 'Visible'
                          ? 'bg-red-50 text-red-600 border-red-500'
                          : 'bg-white text-black border-black'
                      }`}
                    >
                      <span>{comp.detection_status}</span>
                      <span className="opacity-80">({Math.round(comp.confidence * 100)}%)</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-3 bg-zinc-200 rounded-full overflow-hidden border border-black shrink-0">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${Math.round(comp.condition_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-black font-black text-sm">
                        {Math.round(comp.condition_score * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadgeClass(comp.category)}`}>
                      {comp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-black font-bold text-sm whitespace-nowrap">
                    {(comp.weight_kg * 1000).toFixed(0)} g
                  </td>
                  <td className="py-3.5 px-4 font-mono text-red-600 font-black text-sm whitespace-nowrap">
                    ₹{comp.market_value_inr.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {comp.is_hazardous ? (
                      <span className="text-red-600 font-black flex items-center gap-1.5 text-xs sm:text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {comp.hazard_level.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-bold text-xs sm:text-sm">Low/None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
