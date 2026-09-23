from pydantic import BaseModel
from typing import List, Optional

class SafetyActionGuideline(BaseModel):
    component_code: str
    component_name: str
    category: str
    hazard_level: str
    is_hazardous: bool
    allow_manual_disassembly: bool
    recommended_action: str
    recycling_channel: str
    data_wipe_required: bool
    dos: List[str]
    donts: List[str]
    special_warnings: Optional[str] = None

class SafetyAdvisorResponse(BaseModel):
    analysis_id: int
    general_safety_warning: str
    hazardous_components_detected: int
    action_items: List[SafetyActionGuideline]
