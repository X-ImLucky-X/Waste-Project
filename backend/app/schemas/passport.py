from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class CategoryCount(BaseModel):
    category: str
    count: int
    percentage: float

class WeightMetrics(BaseModel):
    total_weight_kg: float
    recoverable_material_kg: float
    reusable_components_kg: float
    residual_waste_kg: float
    circularity_rate_pct: float

class EconomicMetrics(BaseModel):
    component_reuse_value_inr: float
    material_scrap_value_inr: float
    gross_recovery_value_inr: float
    estimated_processing_cost_inr: float
    net_recovery_value_inr: float

class DigitalMaterialPassportResponse(BaseModel):
    passport_id: str
    analysis_id: int
    product_category: str
    product_name: str
    age_years: float
    overall_condition_pct: float
    overall_condition_label: str
    total_components_count: int
    category_counts: Dict[str, int]
    weight_metrics: WeightMetrics
    economic_metrics: EconomicMetrics
    key_materials_distribution: List[Dict[str, Any]]
    environmental_offsets: Dict[str, float]  # CO2-eq saved in kg, landfill avoided in kg
    compliance_standards: List[str]
    generated_at: datetime
