import pytest
from app.services.monte_carlo import MonteCarloSimulator
from app.services.optimizer import StrategyOptimizer
from app.services.disassembly_sim import DisassemblySimulator

SAMPLE_COMPONENTS = [
    {
        "code": "battery",
        "name": "Li-Ion Battery",
        "weight_kg": 0.35,
        "market_value_inr": 800.0,
        "condition_score": 0.40,
        "removal_time_min": 2.5,
        "damage_probability": 0.04,
        "is_hazardous": True,
        "final_category": "HAZARDOUS"
    },
    {
        "code": "ssd",
        "name": "M.2 NVMe SSD",
        "weight_kg": 0.03,
        "market_value_inr": 1800.0,
        "condition_score": 0.85,
        "removal_time_min": 1.5,
        "damage_probability": 0.02,
        "is_hazardous": False,
        "final_category": "REUSABLE"
    },
    {
        "code": "ram",
        "name": "DDR4 SO-DIMM",
        "weight_kg": 0.025,
        "market_value_inr": 1200.0,
        "condition_score": 0.88,
        "removal_time_min": 1.0,
        "damage_probability": 0.02,
        "is_hazardous": False,
        "final_category": "REUSABLE"
    }
]

SAMPLE_MATERIALS = [
    {
        "material_name": "Copper",
        "category": "base_metal",
        "total_weight_kg": 0.15,
        "recoverable_weight_kg": 0.138,
        "total_value_inr": 103.5,
        "recovery_rate": 0.92,
        "market_value_per_kg": 750.0,
        "hazard_level": "none"
    }
]

def test_monte_carlo_simulation_runs():
    res = MonteCarloSimulator.run_strategy_simulation(
        components=SAMPLE_COMPONENTS,
        materials=SAMPLE_MATERIALS,
        strategy="selective_recovery",
        device_count=50,
        iterations=200
    )
    assert "metrics" in res
    assert res["iterations"] == 200
    assert res["metrics"]["net_recovery_value_inr"] > 0
    assert len(res["monte_carlo_distribution"]) > 0

def test_strategy_optimizer_ranking():
    res = StrategyOptimizer.compare_and_optimize(
        components=SAMPLE_COMPONENTS,
        materials=SAMPLE_MATERIALS,
        device_count=50,
        iterations=100
    )
    assert len(res["comparison"]) == 3
    assert res["recommended_strategy"] in ["selective_recovery", "component_recovery", "direct_recycling"]

def test_disassembly_simpy_timeline():
    comp_map = {c["code"]: c for c in SAMPLE_COMPONENTS}
    timeline = DisassemblySimulator.simulate_single_device(
        components_map=comp_map,
        strategy="selective_recovery"
    )
    assert "operation_timeline" in timeline
    assert timeline["total_disassembly_time_min"] > 0
