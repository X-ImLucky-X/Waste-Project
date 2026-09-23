from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models import DeviceAnalysis
from app.services.advisor_engine import SafetyAdvisorEngine
from app.schemas.recommendation import SafetyAdvisorResponse, SafetyActionGuideline

router = APIRouter()

@router.get("/recommendations/{analysis_id}", response_model=SafetyAdvisorResponse)
def get_recovery_recommendations(analysis_id: int, db: Session = Depends(get_db)):
    """
    Retrieve rule-based safety instructions, handling DOs & DON'Ts,
    and safe collection channel advice for all identified components.
    """
    analysis = db.query(DeviceAnalysis).filter(DeviceAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID {analysis_id} not found."
        )

    advisor = SafetyAdvisorEngine(data_dir=settings.DATA_DIR)
    recs = advisor.generate_recommendations(analysis.components_breakdown or [])

    return SafetyAdvisorResponse(
        analysis_id=analysis_id,
        general_safety_warning=recs["general_safety_warning"],
        hazardous_components_detected=recs["hazardous_components_detected"],
        action_items=[SafetyActionGuideline(**item) for item in recs["action_items"]]
    )
