from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("device_analyses.id"), nullable=False)
    strategy = Column(String(50), nullable=False)  # 'direct_recycling', 'component_recovery', 'selective_recovery'
    device_count = Column(Integer, default=100)
    iterations = Column(Integer, default=1000)

    # Core Metrics
    mean_recovery_weight_kg = Column(Float, nullable=False)
    mean_recovery_value_inr = Column(Float, nullable=False)
    mean_processing_time_min = Column(Float, nullable=False)
    mean_residual_waste_kg = Column(Float, nullable=False)
    mean_processing_cost_inr = Column(Float, nullable=False)
    mean_net_recovery_value_inr = Column(Float, nullable=False)
    
    # Statistical bounds (Monte Carlo P5, P50, P95, Std Dev)
    distribution_stats = Column(JSON, default=dict)
    
    # Recovered component counts
    component_recovery_counts = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("DeviceAnalysis", back_populates="simulation_runs")
