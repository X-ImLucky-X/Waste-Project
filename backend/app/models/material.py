from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    category = Column(String(50), nullable=False)  # 'precious_metal', 'base_metal', 'polymer', 'hazardous_compound', 'glass'
    market_value_per_kg = Column(Float, nullable=False)  # in INR
    recovery_rate = Column(Float, nullable=False, default=0.85)  # typical recovery efficiency (0.0 to 1.0)
    hazard_level = Column(String(20), default="low")  # 'none', 'low', 'medium', 'high', 'critical'
    environmental_impact_factor = Column(Float, default=1.0) # CO2-eq saved per kg recycled
    created_at = Column(DateTime, default=datetime.utcnow)

    component_associations = relationship("ComponentMaterial", back_populates="material")


class ComponentMaterial(Base):
    __tablename__ = "component_materials"

    id = Column(Integer, primary_key=True, index=True)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    mass_fraction = Column(Float, nullable=False)  # percentage of component weight (e.g. 0.25 = 25%)

    component = relationship("Component", back_populates="material_associations")
    material = relationship("Material", back_populates="component_associations")
