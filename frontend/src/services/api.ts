import type {
  AnalysisResult,
  DigitalPassport,
  SafetyAdvisorData,
  SimulationResult,
  StrategyComparisonData,
  DisassemblyTimelineResult
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface DeviceIntakePayload {
  file?: File | null;
  category: string;
  brand?: string;
  model?: string;
  screen_size_inch?: number;
  age_years: number;
  power_state: string;
  battery_state: string;
  physical_condition: string;
  known_faults: string[];
}

export const analyzeDevice = async (payload: DeviceIntakePayload): Promise<AnalysisResult> => {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }
  formData.append('category', payload.category);
  if (payload.brand) formData.append('brand', payload.brand);
  if (payload.model) formData.append('model', payload.model);
  if (payload.screen_size_inch) formData.append('screen_size_inch', payload.screen_size_inch.toString());
  formData.append('age_years', payload.age_years.toString());
  formData.append('power_state', payload.power_state);
  formData.append('battery_state', payload.battery_state);
  formData.append('physical_condition', payload.physical_condition);
  formData.append('known_faults', JSON.stringify(payload.known_faults));

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Unknown error occurred' }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return res.json();
};

export const fetchMaterialPassport = async (analysisId: number): Promise<DigitalPassport> => {
  const res = await fetch(`${API_BASE_URL}/passport/${analysisId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch passport' }));
    throw new Error(errorData.detail || 'Passport retrieval failed');
  }
  return res.json();
};

export const fetchSafetyRecommendations = async (analysisId: number): Promise<SafetyAdvisorData> => {
  const res = await fetch(`${API_BASE_URL}/recommendations/${analysisId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch safety guidance' }));
    throw new Error(errorData.detail || 'Safety guidance retrieval failed');
  }
  return res.json();
};

export const runSimulation = async (
  analysisId: number,
  strategy: string,
  deviceCount: number = 100,
  iterations: number = 1000,
  laborRatePerHour: number = 250
): Promise<SimulationResult> => {
  const res = await fetch(`${API_BASE_URL}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_id: analysisId,
      strategy,
      device_count: deviceCount,
      iterations,
      labor_rate_per_hour_inr: laborRatePerHour,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to run simulation' }));
    throw new Error(errorData.detail || 'Simulation execution failed');
  }

  return res.json();
};

export const compareStrategies = async (
  analysisId: number,
  deviceCount: number = 100,
  iterations: number = 1000,
  laborRatePerHour: number = 250
): Promise<StrategyComparisonData> => {
  const res = await fetch(`${API_BASE_URL}/simulation/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_id: analysisId,
      device_count: deviceCount,
      iterations,
      labor_rate_per_hour_inr: laborRatePerHour,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to compare strategies' }));
    throw new Error(errorData.detail || 'Strategy comparison failed');
  }

  return res.json();
};

export const fetchDisassemblyTimeline = async (
  analysisId: number,
  strategy: string = 'selective_recovery',
  laborRate: number = 250
): Promise<DisassemblyTimelineResult> => {
  const res = await fetch(`${API_BASE_URL}/simulation/process-timeline/${analysisId}?strategy=${strategy}&labor_rate=${laborRate}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch process timeline' }));
    throw new Error(errorData.detail || 'Disassembly process timeline failed');
  }
  return res.json();
};
