from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import DeviceAnalysis, SimulationRun
from app.schemas.simulation import (
    SimulationRunRequest,
    SimulationRunResponse,
    StrategyComparisonResponse,
    StrategyMetrics
)
from app.services.monte_carlo import MonteCarloSimulator
from app.services.optimizer import StrategyOptimizer
from app.services.disassembly_sim import DisassemblySimulator

router = APIRouter()

@router.post("/simulation/run", response_model=SimulationRunResponse)
def run_simulation(req: SimulationRunRequest, db: Session = Depends(get_db)):
    """
    Executes a high-iteration Monte Carlo stochastic simulation for a given recovery strategy.
    """
    analysis = db.query(DeviceAnalysis).filter(DeviceAnalysis.id == req.analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis ID {req.analysis_id} not found."
        )

    sim_result = MonteCarloSimulator.run_strategy_simulation(
        components=analysis.components_breakdown or [],
        materials=analysis.materials_breakdown or [],
        strategy=req.strategy,
        device_count=req.device_count,
        iterations=req.iterations,
        labor_rate_per_hour_inr=req.labor_rate_per_hour_inr,
        overhead_per_device_inr=req.overhead_cost_per_device_inr
    )

    metrics = sim_result["metrics"]

    # Persist simulation run in database
    run_record = SimulationRun(
        analysis_id=analysis.id,
        strategy=req.strategy,
        device_count=req.device_count,
        iterations=req.iterations,
        mean_recovery_weight_kg=metrics["recovery_mass_kg"],
        mean_recovery_value_inr=metrics["net_recovery_value_inr"],
        mean_processing_time_min=metrics["processing_time_minutes"],
        mean_residual_waste_kg=metrics["residual_waste_kg"],
        mean_processing_cost_inr=metrics["processing_cost_inr"],
        mean_net_recovery_value_inr=metrics["net_recovery_value_inr"],
        distribution_stats=metrics["distribution"],
        component_recovery_counts=sim_result["component_outcomes"]
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)

    return SimulationRunResponse(
        run_id=run_record.id,
        analysis_id=analysis.id,
        strategy=req.strategy,
        device_count=req.device_count,
        iterations=req.iterations,
        metrics=StrategyMetrics(**metrics),
        monte_carlo_distribution=sim_result["monte_carlo_distribution"],
        component_outcomes=sim_result["component_outcomes"]
    )

@router.post("/simulation/compare", response_model=StrategyComparisonResponse)
def compare_strategies(req: SimulationRunRequest, db: Session = Depends(get_db)):
    """
    Evaluates and compares Direct Recycling, Component Recovery, and Selective Recovery
    using weighted multi-objective scoring and Monte Carlo modeling.
    """
    analysis = db.query(DeviceAnalysis).filter(DeviceAnalysis.id == req.analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis ID {req.analysis_id} not found."
        )

    opt_result = StrategyOptimizer.compare_and_optimize(
        components=analysis.components_breakdown or [],
        materials=analysis.materials_breakdown or [],
        device_count=req.device_count,
        iterations=req.iterations,
        labor_rate_per_hour_inr=req.labor_rate_per_hour_inr
    )

    return StrategyComparisonResponse(
        analysis_id=analysis.id,
        device_count=opt_result["device_count"],
        iterations=opt_result["iterations"],
        recommended_strategy=opt_result["recommended_strategy"],
        optimization_explanation=opt_result["optimization_explanation"],
        comparison=[StrategyMetrics(**m) for m in opt_result["comparison"]]
    )

@router.get("/simulation/process-timeline/{analysis_id}")
def get_disassembly_timeline(
    analysis_id: int,
    strategy: str = "selective_recovery",
    labor_rate: float = 250.0,
    db: Session = Depends(get_db)
):
    """
    Runs a discrete-event SimPy operation-level simulation and returns step-by-step
    disassembly sequence logs, tools, and timings for a single device.
    """
    analysis = db.query(DeviceAnalysis).filter(DeviceAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    comp_map = {c["code"]: c for c in (analysis.components_breakdown or [])}
    timeline_result = DisassemblySimulator.simulate_single_device(
        components_map=comp_map,
        strategy=strategy,
        labor_rate_per_hour_inr=labor_rate
    )
    return timeline_result
