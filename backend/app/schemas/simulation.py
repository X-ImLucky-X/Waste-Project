from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SimulationRunRequest(BaseModel):
    analysis_id: int
    strategy: str = Field(default="selective_recovery", description="'direct_recycling', 'component_recovery', 'selective_recovery'")
    device_count: int = Field(default=100, ge=1, le=10000, description="Number of e-waste units to simulate")
    iterations: int = Field(default=1000, ge=50, le=5000, description="Monte Carlo simulation sample runs")
    labor_rate_per_hour_inr: float = Field(default=250.0, ge=50.0, description="Hourly labor rate in INR")
    overhead_cost_per_device_inr: float = Field(default=50.0, ge=0.0)

class StrategyMetrics(BaseModel):
    strategy_name: str
    strategy_code: str
    recovery_mass_kg: float
    recovery_percentage: float
    reusable_components_count: int
    processing_time_minutes: float
    residual_waste_kg: float
    gross_recovery_value_inr: float
    processing_cost_inr: float
    net_recovery_value_inr: float
    damage_risk_score: float
    circularity_score: float
    distribution: Dict[str, Any]  # percentiles P5, P50, P95, std_dev

class SimulationRunResponse(BaseModel):
    run_id: Optional[int] = None
    analysis_id: int
    strategy: str
    device_count: int
    iterations: int
    metrics: StrategyMetrics
    monte_carlo_distribution: List[Dict[str, float]] # histogram bins or sample percentiles
    component_outcomes: Dict[str, Dict[str, Any]]

class StrategyComparisonResponse(BaseModel):
    analysis_id: int
    device_count: int
    iterations: int
    recommended_strategy: str
    optimization_explanation: str
    comparison: List[StrategyMetrics]
