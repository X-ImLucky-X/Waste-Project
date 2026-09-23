from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class DeviceAnalysis(Base):
    __tablename__ = "device_analyses"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    image_filename = Column(String(255), nullable=True)
    image_dimensions = Column(String(50), nullable=True)
    image_filesize_bytes = Column(Integer, nullable=True)
    
    # AI Identification
    detected_product = Column(String(100), nullable=False, default="Laptop")
    detection_confidence = Column(Float, nullable=False, default=0.90)
    visual_condition = Column(String(50), default="Moderate")  # 'Good', 'Moderate', 'Damaged'
    visual_condition_confidence = Column(Float, default=0.85)

    # User Input Parameters
    reported_age_years = Column(Float, default=4.0)
    reported_power_state = Column(String(50), default="does_not_turn_on")  # 'fully_working', 'partially_working', 'does_not_turn_on'
    reported_battery_state = Column(String(50), default="degraded")  # 'good', 'degraded', 'swollen', 'unknown'
    reported_physical_condition = Column(String(50), default="moderate")  # 'good', 'moderate', 'damaged'
    known_faults = Column(JSON, default=list)

    # Computed Overall Condition
    calculated_condition_score = Column(Float, default=0.65)  # 0.0 to 1.0

    # Structured Component & Material Inventory Snapshot
    components_breakdown = Column(JSON, default=list)
    materials_breakdown = Column(JSON, default=list)
    passport_data = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    simulation_runs = relationship("SimulationRun", back_populates="analysis", cascade="all, delete-orphan")
