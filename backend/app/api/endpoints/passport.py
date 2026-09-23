from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import DeviceAnalysis
from app.schemas.passport import DigitalMaterialPassportResponse

router = APIRouter()

@router.get("/passport/{analysis_id}", response_model=DigitalMaterialPassportResponse)
def get_material_passport(analysis_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the verifiable Digital Material Passport for an analyzed device.
    """
    analysis = db.query(DeviceAnalysis).filter(DeviceAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID {analysis_id} not found."
        )

    if not analysis.passport_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passport data has not been generated for this analysis."
        )

    return DigitalMaterialPassportResponse(**analysis.passport_data)
