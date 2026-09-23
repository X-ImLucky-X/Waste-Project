from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # e.g., 'Laptop', 'Smartphone', 'Desktop'
    brand = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    average_weight_kg = Column(Float, nullable=False, default=2.2)
    created_at = Column(DateTime, default=datetime.utcnow)

    components = relationship("Component", back_populates="product", cascade="all, delete-orphan")
