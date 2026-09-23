export interface ComponentItem {
  name: string;
  code: string;
  category: 'REUSABLE' | 'REPAIRABLE' | 'RECYCLABLE' | 'HAZARDOUS' | 'RESIDUAL';
  detection_status: 'Expected' | 'Visible';
  confidence: number;
  condition_score: number;
  condition_pct?: number;
  weight_kg: number;
  market_value_inr: number;
  hazard_level: string;
  is_hazardous: boolean;
  allow_manual_disassembly: boolean;
  data_wipe_required: boolean;
  removal_time_min?: number;
  damage_probability?: number;
  materials_summary: Record<string, number>;
  handling_dos?: string[];
  handling_donts?: string[];
  recycling_channel?: string;
}

export interface MaterialItem {
  material_name: string;
  category: string;
  total_weight_kg: number;
  recoverable_weight_kg: number;
  recovery_rate: number;
  market_value_per_kg: number;
  total_value_inr: number;
  hazard_level: string;
}

export interface AnalysisResult {
  analysis_id: number;
  image_url?: string | null;
  detected_product: string;
  product_name?: string;
  screen_size_inch?: number;
  confidence: number;
  visual_condition: string;
  visual_condition_confidence: number;
  calculated_condition_score: number;
  disclaimer: string;
  components: ComponentItem[];
  materials: MaterialItem[];
  created_at: string;
}

export interface WeightMetrics {
  total_weight_kg: number;
  recoverable_material_kg: number;
  reusable_components_kg: number;
  residual_waste_kg: number;
  circularity_rate_pct: number;
}

export interface EconomicMetrics {
  component_reuse_value_inr: number;
  material_scrap_value_inr: number;
  gross_recovery_value_inr: number;
  estimated_processing_cost_inr: number;
  net_recovery_value_inr: number;
}

export interface MaterialDistributionItem {
  material: string;
  category: string;
  weight_kg: number;
  recoverable_kg: number;
  value_inr: number;
  hazard: string;
}

export interface DigitalPassport {
  passport_id: string;
  analysis_id: number;
  product_category: string;
  product_name: string;
  age_years: number;
  overall_condition_pct: number;
  overall_condition_label: string;
  total_components_count: number;
  category_counts: Record<string, number>;
  weight_metrics: WeightMetrics;
  economic_metrics: EconomicMetrics;
  key_materials_distribution: MaterialDistributionItem[];
  environmental_offsets: {
    co2_emissions_avoided_kg: number;
    landfill_diverted_kg: number;
    equivalent_trees_planted: number;
  };
  compliance_standards: string[];
  generated_at: string;
}

export interface SafetyActionItem {
  component_code: string;
  component_name: string;
  category: string;
  hazard_level: string;
  is_hazardous: boolean;
  allow_manual_disassembly: boolean;
  recommended_action: string;
  recycling_channel: string;
  data_wipe_required: boolean;
  dos: string[];
  donts: string[];
  special_warnings?: string | null;
}

export interface SafetyAdvisorData {
  analysis_id: number;
  general_safety_warning: string;
  hazardous_components_detected: number;
  action_items: SafetyActionItem[];
}

export interface StrategyMetrics {
  strategy_name: string;
  strategy_code: string;
  recovery_mass_kg: number;
  recovery_percentage: number;
  reusable_components_count: number;
  processing_time_minutes: number;
  residual_waste_kg: number;
  gross_recovery_value_inr: number;
  processing_cost_inr: number;
  net_recovery_value_inr: number;
  damage_risk_score: number;
  circularity_score: number;
  optimization_utility_score?: number;
  distribution: {
    p5_worst_case: number;
    p50_median: number;
    p95_best_case: number;
    std_deviation: number;
    min_value: number;
    max_value: number;
  };
}

export interface MonteCarloBin {
  range: string;
  midpoint: number;
  frequency: number;
  relative_freq: number;
}

export interface SimulationResult {
  run_id?: number;
  analysis_id: number;
  strategy: string;
  device_count: number;
  iterations: number;
  metrics: StrategyMetrics;
  monte_carlo_distribution: MonteCarloBin[];
  component_outcomes: Record<string, {
    name: string;
    recovery_probability: number;
    is_active_in_strategy: boolean;
    expected_units_recovered: number;
  }>;
}

export interface StrategyComparisonData {
  analysis_id: number;
  device_count: number;
  iterations: number;
  recommended_strategy: string;
  recommended_strategy_name?: string;
  optimization_explanation: string;
  comparison: StrategyMetrics[];
}

export interface DisassemblyTimelineStep {
  timestamp_min: number;
  component_code: string;
  component_name: string;
  operation: string;
  tool: string;
  duration_min: number;
  damaged: boolean;
  recovered: boolean;
}

export interface DisassemblyTimelineResult {
  strategy: string;
  total_disassembly_time_min: number;
  recovered_count: number;
  damaged_count: number;
  recovered_components: string[];
  damaged_components: string[];
  operation_timeline: DisassemblyTimelineStep[];
}
