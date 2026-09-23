from fastapi import APIRouter
from app.api.endpoints import analyze, passport, recommendations, simulation

api_router = APIRouter()

api_router.include_router(analyze.router, tags=["Device Intake & AI Analysis"])
api_router.include_router(passport.router, tags=["Digital Material Passport"])
api_router.include_router(recommendations.router, tags=["Recovery & Safety Advisor"])
api_router.include_router(simulation.router, tags=["Disassembly & Monte Carlo Simulation"])
