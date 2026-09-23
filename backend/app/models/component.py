from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False, index=True)  # e.g., 'ram', 'ssd', 'battery', 'motherboard'
    default_category = Column(String(50), nullable=False)  # 'REUSABLE', 'REPAIRABLE', 'RECYCLABLE', 'HAZARDOUS', 'RESIDUAL'
    weight_kg = Column(Float, nullable=False)
    removal_time_min = Column(Float, nullable=False, default=3.0)
    damage_probability = Column(Float, nullable=False, default=0.08)
    market_value_inr = Column(Float, nullable=False, default=500.0)
    
    # Safety and disassembly parameters
    hazard_level = Column(String(20), default="none")  # 'none', 'low', 'medium', 'high', 'critical'
    is_hazardous = Column(Boolean, default=False)
    allow_manual_disassembly = Column(Boolean, default=True)
    handling_dos = Column(JSON, default=list)
    handling_donts = Column(JSON, default=list)
    recycling_channel = Column(String(200), default="Standard WEEE recycling facility")
    data_wipe_required = Column(Boolean, default=False)

    product = relationship("Product", back_populates="components")
    material_associations = relationship("ComponentMaterial", back_populates="component", cascade="all, delete-orphan")
