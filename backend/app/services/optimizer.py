from typing import List, Dict, Any
from app.services.monte_carlo import MonteCarloSimulator

class StrategyOptimizer:
    """
    Multi-objective recovery strategy optimizer.
    Evaluates:
    1. Direct Shredding & Material Recovery
    2. Full Manual Component Harvesting
    3. Optimized Selective Recovery
    
    Ranks them using the objective utility function:
    Score = α(Normalized Value) + β(Circularity Mass) + γ(Component Reuse)
            - δ(Labor Time) - ε(Damage Risk) - ζ(Cost)
    """

    DEFAULT_WEIGHTS = {
        "alpha_value": 0.35,
        "beta_mass": 0.20,
        "gamma_reuse": 0.20,
        "delta_time": 0.10,
        "epsilon_risk": 0.05,
        "zeta_cost": 0.10
    }

    @classmethod
    def compare_and_optimize(
        cls,
        components: List[Dict[str, Any]],
        materials: List[Dict[str, Any]],
        device_count: int = 100,
        iterations: int = 1000,
        labor_rate_per_hour_inr: float = 250.0,
        weights: Dict[str, float] = None
    ) -> Dict[str, Any]:
        w = weights or cls.DEFAULT_WEIGHTS
        strategies = ["direct_recycling", "component_recovery", "selective_recovery"]
        results = []

        for strat in strategies:
            sim_res = MonteCarloSimulator.run_strategy_simulation(
                components=components,
                materials=materials,
                strategy=strat,
                device_count=device_count,
                iterations=iterations,
                labor_rate_per_hour_inr=labor_rate_per_hour_inr
            )
            results.append(sim_res["metrics"])

        # Compute max bounds across strategies for normalization
        max_net_val = max(r["net_recovery_value_inr"] for r in results) or 1.0
        max_mass = max(r["recovery_mass_kg"] for r in results) or 1.0
        max_reuse = max(r["reusable_components_count"] for r in results) or 1.0
        max_time = max(r["processing_time_minutes"] for r in results) or 1.0
        max_cost = max(r["processing_cost_inr"] for r in results) or 1.0

        scored_results = []
        for r in results:
            val_norm = max(0.0, r["net_recovery_value_inr"] / max_net_val)
            mass_norm = r["recovery_mass_kg"] / max_mass
            reuse_norm = r["reusable_components_count"] / max(max_reuse, 1)
            time_norm = r["processing_time_minutes"] / max(max_time, 1)
            risk_norm = r["damage_risk_score"] / 100.0
            cost_norm = r["processing_cost_inr"] / max(max_cost, 1)

            utility_score = (
                w["alpha_value"] * val_norm +
                w["beta_mass"] * mass_norm +
                w["gamma_reuse"] * reuse_norm -
                w["delta_time"] * time_norm -
                w["epsilon_risk"] * risk_norm -
                w["zeta_cost"] * cost_norm
            )
            # Rescale to 0 - 100
            utility_score = round(max(0.0, utility_score * 100), 1)

            entry = dict(r)
            entry["optimization_utility_score"] = utility_score
            scored_results.append(entry)

        # Sort descending by utility score
        scored_results.sort(key=lambda x: x["optimization_utility_score"], reverse=True)
        winner = scored_results[0]

        explanation = (
            f"Strategy '{winner['strategy_name']}' is mathematically optimal with a composite utility score of {winner['optimization_utility_score']}/100. "
            f"It generates ₹{winner['net_recovery_value_inr']:,.2f} net value across {device_count} devices with {winner['processing_time_minutes']} min labor per unit, "
            f"balancing high-value component retention against manual labor costs."
        )

        return {
            "device_count": device_count,
            "iterations": iterations,
            "recommended_strategy": winner["strategy_code"],
            "recommended_strategy_name": winner["strategy_name"],
            "optimization_explanation": explanation,
            "comparison": scored_results
        }
