from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserDeviceInput(BaseModel):
    category: str = Field(default="Laptop", description="Reported product category")
    brand: Optional[str] = Field(default=None, description="Reported manufacturer/brand")
    model: Optional[str] = Field(default=None, description="Reported model series")
    screen_size_inch: Optional[float] = Field(default=15.6, ge=10.0, le=24.0, description="Screen size in inches")
    age_years: float = Field(default=4.0, ge=0.0, le=25.0, description="Approximate age in years")
    power_state: str = Field(default="does_not_turn_on", description="'fully_working', 'partially_working', 'does_not_turn_on'")
    battery_state: str = Field(default="degraded", description="'good', 'degraded', 'swollen', 'unknown'")
    physical_condition: str = Field(default="moderate", description="'good', 'moderate', 'damaged'")
    known_faults: List[str] = Field(default_factory=list, description="List of user observed defects")

class ComponentDetectionItem(BaseModel):
    name: str
    code: str
    category: str  # REUSABLE, REPAIRABLE, RECYCLABLE, HAZARDOUS, RESIDUAL
    detection_status: str  # 'Expected' or 'Visible'
    confidence: float
    condition_score: float  # 0.0 to 1.0 (or percentage 0-100)
    weight_kg: float
    market_value_inr: float
    hazard_level: str
    is_hazardous: bool
    allow_manual_disassembly: bool
    data_wipe_required: bool
    materials_summary: Dict[str, float]

class MaterialRecoveryItem(BaseModel):
    material_name: str
    category: str
    total_weight_kg: float
    recoverable_weight_kg: float
    recovery_rate: float
    market_value_per_kg: float
    total_value_inr: float
    hazard_level: str

class AnalysisResponse(BaseModel):
    analysis_id: int
    image_url: Optional[str] = None
    detected_product: str
    product_name: Optional[str] = None
    screen_size_inch: Optional[float] = None
    confidence: float
    visual_condition: str
    visual_condition_confidence: float
    calculated_condition_score: float
    disclaimer: str
    components: List[ComponentDetectionItem]
    materials: List[MaterialRecoveryItem]
    created_at: datetime
