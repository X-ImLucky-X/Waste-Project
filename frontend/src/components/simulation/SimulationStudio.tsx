import React, { useState, useEffect } from 'react';
import type {
  SimulationResult,
  StrategyComparisonData,
  DisassemblyTimelineResult
} from '../../types';
import {
  runSimulation,
  compareStrategies,
  fetchDisassemblyTimeline
} from '../../services/api';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface SimulationStudioProps {
  analysisId: number;
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({ analysisId }) => {
  const [deviceCount, setDeviceCount] = useState<number>(100);
  const [iterations, setIterations] = useState<number>(1000);
  const [laborRate, setLaborRate] = useState<number>(250);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('selective_recovery');

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [comparisonData, setComparisonData] = useState<StrategyComparisonData | null>(null);
  const [timelineData, setTimelineData] = useState<DisassemblyTimelineResult | null>(null);

  const [isLoadingSim, setIsLoadingSim] = useState<boolean>(false);
  const [isLoadingComp, setIsLoadingComp] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'comparison' | 'monte_carlo' | 'process_timeline'>('comparison');

  const handleRunComparison = async () => {
    setIsLoadingComp(true);
    try {
      const compRes = await compareStrategies(analysisId, deviceCount, iterations, laborRate);
      setComparisonData(compRes);

      // Load timeline for optimal strategy
      const timelineRes = await fetchDisassemblyTimeline(analysisId, compRes.recommended_strategy, laborRate);
      setTimelineData(timelineRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingComp(false);
    }
  };

  useEffect(() => {
    handleRunComparison();
  }, [analysisId]);

  const handleRunSingleSimulation = async () => {
    setIsLoadingSim(true);
    try {
      const res = await runSimulation(analysisId, selectedStrategy, deviceCount, iterations, laborRate);
      setSimResult(res);
      setActiveSubTab('monte_carlo');
    } catch (err: any) {
      alert(err.message || 'Simulation run failed.');
    } finally {
      setIsLoadingSim(false);
    }
  };

  const loadTimelineForStrategy = async (strat: string) => {
    try {
      const res = await fetchDisassemblyTimeline(analysisId, strat, laborRate);
      setTimelineData(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Card */}
      <div className="tri-card p-6 md:p-8 space-y-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <Activity className="h-6 w-6 text-red-600" />
              <span>Disassembly & Stochastic Monte Carlo Simulation Studio</span>
            </h2>
            <p className="text-sm text-zinc-600 font-medium mt-0.5">
              Simulates batch de-manufacturing throughput, mechanical damage variance, and strategy utility ranking without lag.
            </p>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isLoadingComp}
            className="tri-btn-red py-2.5 px-4 text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isLoadingComp ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            <span>Compare All 3 Strategies</span>
          </button>
        </div>

        {/* 3 Parameter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Device Volume */}
          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-black font-black uppercase tracking-wider">Device Batch Volume</span>
              <span className="font-mono text-black font-black px-2.5 py-0.5 rounded-full bg-white border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                {deviceCount} Units
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={deviceCount}
              onChange={(e) => setDeviceCount(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-zinc-600 font-bold font-mono">
              <span>10</span>
              <span>250</span>
              <span>500</span>
            </div>
          </div>

          {/* Monte Carlo Iterations */}
          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-black font-black uppercase tracking-wider">Monte Carlo Iterations</span>
              <span className="font-mono text-red-600 font-black px-2.5 py-0.5 rounded-full bg-red-50 border-2 border-red-500 shadow-[1px_1px_0px_0px_#dc2626]">
                {iterations.toLocaleString()} Runs
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="100"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-zinc-600 font-bold font-mono">
              <span>100</span>
              <span>1,000</span>
              <span>2,500</span>
            </div>
          </div>

          {/* Dismantling Labor Rate */}
          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-black font-black uppercase tracking-wider">Labor Rate per Hour</span>
              <span className="font-mono text-black font-black px-2.5 py-0.5 rounded-full bg-white border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                ₹{laborRate}/hr
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="25"
              value={laborRate}
              onChange={(e) => setLaborRate(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-zinc-600 font-bold font-mono">
              <span>₹100</span>
              <span>₹350</span>
              <span>₹600</span>
            </div>
          </div>
        </div>

        {/* Strategy Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm text-black font-black uppercase tracking-wider">STRATEGY:</span>
            {[
              { id: 'selective_recovery', label: 'Selective Recovery (Optimized)' },
              { id: 'component_recovery', label: 'Component Harvesting' },
              { id: 'direct_recycling', label: 'Direct Shredding' },
            ].map((strat) => (
              <button
                key={strat.id}
                onClick={() => {
                  setSelectedStrategy(strat.id);
                  loadTimelineForStrategy(strat.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  selectedStrategy === strat.id
                    ? 'bg-red-50 border-red-500 text-red-600 shadow-[2px_2px_0px_0px_#dc2626]'
                    : 'bg-white border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px]'
                }`}
              >
                {strat.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunSingleSimulation}
            disabled={isLoadingSim}
            className="tri-btn-black py-2.5 px-4 text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoadingSim ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            <span>Run Dedicated Monte Carlo (Selected Strategy)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b-2 border-black gap-6 text-sm sm:text-base font-black">
        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`pb-3 transition-all cursor-pointer ${
            activeSubTab === 'comparison'
              ? 'text-red-600 border-b-4 border-red-600'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          Strategy Multi-Objective Comparison
        </button>
        <button
          onClick={() => setActiveSubTab('monte_carlo')}
          className={`pb-3 transition-all cursor-pointer ${
            activeSubTab === 'monte_carlo'
              ? 'text-red-600 border-b-4 border-red-600'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          Monte Carlo Probability Distribution
        </button>
        <button
          onClick={() => setActiveSubTab('process_timeline')}
          className={`pb-3 transition-all cursor-pointer ${
            activeSubTab === 'process_timeline'
              ? 'text-red-600 border-b-4 border-red-600'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          Workstation SimPy Operation Sequence
        </button>
      </div>

      {/* VIEW 1: STRATEGY COMPARISON */}
      {activeSubTab === 'comparison' && comparisonData && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="tri-card p-6 bg-red-50 border-2 border-red-600 flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-mono uppercase tracking-widest text-red-700 font-black">
                MATHEMATICALLY OPTIMAL STRATEGY
              </div>
              <h4 className="text-lg sm:text-xl font-black text-black mt-0.5">
                {comparisonData.recommended_strategy_name || comparisonData.recommended_strategy}
              </h4>
              <p className="text-sm text-zinc-800 font-medium mt-1 leading-relaxed">
                {comparisonData.optimization_explanation}
              </p>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="tri-card p-6 space-y-4 bg-white">
            <h3 className="text-base font-black text-black">
              Comparative Economic & Operational Metrics ({deviceCount} Devices)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="strategy_name" stroke="#000000" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis stroke="#000000" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: '2px', borderRadius: '8px', color: '#000000', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 'bold' }} />
                  <Bar dataKey="net_recovery_value_inr" name="Net Recovery Value (₹)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="processing_cost_inr" name="Labor Cost (₹)" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recovery_mass_kg" name="Recovered Mass (kg)" fill="#52525b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="residual_waste_kg" name="Residual Waste (kg)" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="tri-card p-6 space-y-4 bg-white">
            <h3 className="text-base font-black text-black">Strategy Performance Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-black uppercase text-xs font-black border-b-2 border-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Strategy</th>
                    <th className="py-3.5 px-4">Net Recovery (₹)</th>
                    <th className="py-3.5 px-4">Labor Cost (₹)</th>
                    <th className="py-3.5 px-4">Unit Time</th>
                    <th className="py-3.5 px-4">Yield Mass</th>
                    <th className="py-3.5 px-4">Residual</th>
                    <th className="py-3.5 px-4">Circularity %</th>
                    <th className="py-3.5 px-4">Utility Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-100 font-mono">
                  {comparisonData.comparison.map((s) => (
                    <tr key={s.strategy_code} className="hover:bg-red-50/40">
                      <td className="py-3.5 px-4 font-sans font-bold text-black text-sm">
                        {s.strategy_name}
                      </td>
                      <td className="py-3.5 px-4 font-black text-red-600 text-sm">
                        ₹{s.net_recovery_value_inr.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-black font-bold text-sm">
                        ₹{s.processing_cost_inr.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 font-bold text-sm">
                        {s.processing_time_minutes} min/unit
                      </td>
                      <td className="py-3.5 px-4 text-black font-bold text-sm">
                        {s.recovery_mass_kg} kg
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-bold text-sm">
                        {s.residual_waste_kg} kg
                      </td>
                      <td className="py-3.5 px-4 text-red-600 font-black text-sm">
                        {s.circularity_score}%
                      </td>
                      <td className="py-3.5 px-4 font-black text-black font-sans">
                        <span className="px-3 py-1 rounded-full bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000] text-xs font-black">
                          {s.optimization_utility_score || 'N/A'}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTE CARLO DISTRIBUTION */}
      {activeSubTab === 'monte_carlo' && (
        <div className="space-y-6">
          {simResult ? (
            <>
              {/* Statistical Percentiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="tri-card p-5 text-center bg-white">
                  <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">P5 Worst-Case (5%)</div>
                  <div className="text-2xl sm:text-3xl font-black text-black font-mono">
                    ₹{simResult.metrics.distribution.p5_worst_case.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1.5 font-bold">Severe damage scenario</div>
                </div>

                <div className="tri-card p-5 text-center bg-red-50 border-red-600">
                  <div className="text-sm text-red-900 font-black uppercase tracking-wider mb-1.5">P50 Expected Median</div>
                  <div className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                    ₹{simResult.metrics.distribution.p50_median.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-700 mt-1.5 font-bold">Baseline expectation</div>
                </div>

                <div className="tri-card p-5 text-center bg-white">
                  <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">P95 Best-Case (95%)</div>
                  <div className="text-2xl sm:text-3xl font-black text-black font-mono">
                    ₹{simResult.metrics.distribution.p95_best_case.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1.5 font-bold">High module salvage</div>
                </div>

                <div className="tri-card p-5 text-center bg-white">
                  <div className="text-sm text-zinc-600 font-black uppercase tracking-wider mb-1.5">Standard Dev (σ)</div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-800 font-mono">
                    ±₹{simResult.metrics.distribution.std_deviation.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1.5 font-bold">{iterations} Iterations</div>
                </div>
              </div>

              {/* Area Distribution Curve */}
              <div className="tri-card p-6 space-y-4 bg-white">
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <h3 className="text-base font-black text-black">
                    Monte Carlo Stochastic Density Distribution ({simResult.strategy.replace('_', ' ').toUpperCase()})
                  </h3>
                  <span className="text-sm text-black font-mono font-black">{iterations} Iterations</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simResult.monte_carlo_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="range" stroke="#000000" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis stroke="#000000" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: '2px', borderRadius: '8px', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: '13px' }}
                      />
                      <Area type="monotone" dataKey="frequency" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="tri-card p-12 text-center space-y-3 bg-white">
              <Activity className="h-12 w-12 text-zinc-400 mx-auto" />
              <h4 className="text-black font-black text-base">No Dedicated Monte Carlo Run Active</h4>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto font-medium">
                Click "Run Dedicated Monte Carlo (Selected Strategy)" above to generate 1,000 stochastic runs and probability density curves.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DISASSEMBLY TIMELINE */}
      {activeSubTab === 'process_timeline' && (
        <div className="space-y-6">
          {timelineData ? (
            <div className="tri-card p-6 space-y-5 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-black pb-4">
                <div>
                  <h3 className="text-base font-black text-black flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-red-600" />
                    <span>Workstation SimPy Operation Sequence</span>
                  </h3>
                  <p className="text-sm text-zinc-600 font-medium mt-0.5">
                    Precedence-constrained discrete-event sequence executed on single unit.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-mono">
                  <span className="text-zinc-600 font-bold">Total Duration:</span>
                  <span className="px-3.5 py-1 rounded-full bg-red-50 text-red-600 font-black border-2 border-red-500 shadow-[1px_1px_0px_0px_#dc2626]">
                    {timelineData.total_disassembly_time_min} Minutes
                  </span>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="space-y-3">
                {timelineData.operation_timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] transition-all"
                  >
                    <div className="h-8 w-8 rounded-lg bg-red-600 border-2 border-black flex items-center justify-center font-mono text-sm text-white font-black shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <span className="text-sm font-black text-black">{step.operation}</span>
                        <span className="text-xs sm:text-sm font-mono text-zinc-600 font-bold">
                          @ {step.timestamp_min} min ({step.duration_min} min op)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-600 font-medium">
                        <span className="font-mono text-black font-bold">Tool: {step.tool}</span>
                        <span>•</span>
                        <span className="text-black font-semibold">Subassembly: {step.component_name}</span>
                        {step.damaged ? (
                          <span className="text-red-600 font-black flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Damaged in extraction
                          </span>
                        ) : (
                          <span className="text-black font-black">✓ Harvested cleanly</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="tri-card p-8 text-center bg-white">
              <p className="text-sm text-zinc-500 font-medium">Loading process timeline...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
