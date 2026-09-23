import numpy as np
from typing import List, Dict, Any

class MonteCarloSimulator:
    """
    Stochastic Monte Carlo simulation engine for e-waste disassembly and recovery.
    Simulates thousands of stochastic realizations modeling:
    - Component functional health & damage probability
    - Material shredding recovery efficiency variance
    - Operator labor time fluctuations
    - Net economic yield & 95% confidence interval (P5 to P95)
    """

    @classmethod
    def run_strategy_simulation(
        cls,
        components: List[Dict[str, Any]],
        materials: List[Dict[str, Any]],
        strategy: str = "selective_recovery",
        device_count: int = 100,
        iterations: int = 1000,
        labor_rate_per_hour_inr: float = 250.0,
        overhead_per_device_inr: float = 40.0
    ) -> Dict[str, Any]:
        rng = np.random.default_rng(seed=42)

        # Pre-extract component parameters
        comp_codes = [c["code"] for c in components]
        comp_names = [c["name"] for c in components]
        weights = np.array([c["weight_kg"] for c in components])
        market_values = np.array([c["market_value_inr"] for c in components])
        condition_scores = np.array([c.get("condition_score", 0.6) for c in components])
        removal_times = np.array([c.get("removal_time_min", 2.5) for c in components])
        damage_probs = np.array([c.get("damage_probability", 0.05) for c in components])
        is_hazardous = np.array([c.get("is_hazardous", False) for c in components])
        final_categories = [c.get("final_category", c.get("category", "RECYCLABLE")) for c in components]

        # Determine which components to manually disassemble based on strategy
        active_mask = np.ones(len(components), dtype=bool)
        if strategy == "direct_recycling":
            # Only mandatory hazardous separation (battery); rest is shredded directly
            active_mask = is_hazardous
        elif strategy == "selective_recovery":
            # Filter components where expected value strictly exceeds dismantling labor cost & risk
            time_cost = (removal_times / 60.0) * labor_rate_per_hour_inr
            expected_gain = market_values * condition_scores
            # Keep if expected gain > 1.3x labor cost OR if hazardous
            selective_criteria = (expected_gain > (time_cost * 1.3)) | is_hazardous
            active_mask = selective_criteria

        # Material recovery baseline for shredded portions
        total_raw_material_value = sum(m["total_value_inr"] for m in materials)
        total_raw_material_mass = sum(m["recoverable_weight_kg"] for m in materials)

        # Multi-iteration Monte Carlo arrays
        net_values = np.zeros(iterations)
        gross_values = np.zeros(iterations)
        labor_times = np.zeros(iterations)
        processing_costs = np.zeros(iterations)
        recovered_masses = np.zeros(iterations)
        residual_waste_masses = np.zeros(iterations)
        reused_component_counts = np.zeros(iterations)

        # Component success counters across all iterations
        comp_success_counts = np.zeros(len(components))

        total_device_mass = np.sum(weights)

        for i in range(iterations):
            # 1. Stochastic component recovery:
            # Condition variance: Normal distribution around baseline condition
            rand_conditions = rng.normal(loc=condition_scores, scale=0.08)
            rand_conditions = np.clip(rand_conditions, 0.05, 0.98)

            # Damage realization: Bernoulli draw with probability p = damage_probs
            damage_draw = rng.random(len(components)) > damage_probs

            # Successful recovery occurs if active in strategy and undamaged
            success = active_mask & damage_draw
            comp_success_counts += success.astype(int)

            # 2. Economic value calculation
            # Recovered reusable/repairable components yield resale value
            reusable_indices = [idx for idx, cat in enumerate(final_categories) if cat in ["REUSABLE", "REPAIRABLE"]]
            component_revenue = np.sum(
                market_values[reusable_indices] * rand_conditions[reusable_indices] * success[reusable_indices]
            )

            # Materials from un-recovered or shredded components undergo material extraction
            # Material efficiency stochastic fluctuation (±6% normal variance)
            mat_efficiency = np.clip(rng.normal(1.0, 0.06), 0.70, 1.15)
            
            # If strategy is direct recycling, raw material recovery is dominant
            if strategy == "direct_recycling":
                material_revenue = total_raw_material_value * 0.88 * mat_efficiency
                recovered_mass = total_raw_material_mass * 0.90 * mat_efficiency
                residual_waste = max(0.4, total_device_mass - recovered_mass)
                time_mins = float(np.sum(removal_times[active_mask])) + 8.0 # shredder overhead
            elif strategy == "component_recovery":
                # High manual effort, lower residual waste
                material_revenue = total_raw_material_value * 0.55 * mat_efficiency
                manual_mass = np.sum(weights[success])
                recovered_mass = manual_mass + (total_raw_material_mass * 0.40)
                residual_waste = max(0.18, total_device_mass - recovered_mass)
                time_mins = float(np.sum(rng.normal(removal_times[active_mask], removal_times[active_mask] * 0.12)))
            else:  # selective_recovery
                material_revenue = total_raw_material_value * 0.68 * mat_efficiency
                selective_mass = np.sum(weights[success])
                recovered_mass = selective_mass + (total_raw_material_mass * 0.55)
                residual_waste = max(0.25, total_device_mass - recovered_mass)
                time_mins = float(np.sum(rng.normal(removal_times[active_mask], removal_times[active_mask] * 0.10)))

            gross_val = (component_revenue + material_revenue) * device_count
            labor_cost = ((time_mins / 60.0) * labor_rate_per_hour_inr + overhead_per_device_inr) * device_count
            net_val = gross_val - labor_cost

            gross_values[i] = gross_val
            net_values[i] = net_val
            labor_times[i] = time_mins
            processing_costs[i] = labor_cost
            recovered_masses[i] = recovered_mass * device_count
            residual_waste_masses[i] = residual_waste * device_count
            reused_component_counts[i] = np.sum(success[reusable_indices]) * device_count

        # Compute summary statistics
        mean_net = float(np.mean(net_values))
        p5_net = float(np.percentile(net_values, 5))
        p50_net = float(np.percentile(net_values, 50))
        p95_net = float(np.percentile(net_values, 95))
        std_net = float(np.std(net_values))

        # Histogram bins (12 bins for sleek UI distribution chart)
        hist, bin_edges = np.histogram(net_values, bins=12)
        distribution_bins = [
            {
                "range": f"₹{int(bin_edges[k]):,} - ₹{int(bin_edges[k+1]):,}",
                "midpoint": round(float((bin_edges[k] + bin_edges[k+1]) / 2.0), 0),
                "frequency": int(hist[k]),
                "relative_freq": round(float(hist[k] / iterations), 3)
            }
            for k in range(len(hist))
        ]

        # Component recovery rates
        component_recovery_rates = {}
        for idx, code in enumerate(comp_codes):
            prob = float(comp_success_counts[idx] / iterations)
            component_recovery_rates[code] = {
                "name": comp_names[idx],
                "recovery_probability": round(prob, 3),
                "is_active_in_strategy": bool(active_mask[idx]),
                "expected_units_recovered": int(prob * device_count)
            }

        # Strategy circularity score (0 - 100)
        circularity_score = round(float(np.mean(recovered_masses) / (total_device_mass * device_count)) * 100, 1)

        strategy_labels = {
            "direct_recycling": "Direct Shredding & Material Recovery",
            "component_recovery": "Full Manual Component Harvesting",
            "selective_recovery": "Optimized Selective Recovery"
        }

        return {
            "strategy_code": strategy,
            "strategy_name": strategy_labels.get(strategy, strategy.title()),
            "device_count": device_count,
            "iterations": iterations,
            "metrics": {
                "strategy_code": strategy,
                "strategy_name": strategy_labels.get(strategy, strategy.title()),
                "recovery_mass_kg": round(float(np.mean(recovered_masses)), 2),
                "recovery_percentage": circularity_score,
                "reusable_components_count": int(np.mean(reused_component_counts)),
                "processing_time_minutes": round(float(np.mean(labor_times)), 1),
                "residual_waste_kg": round(float(np.mean(residual_waste_masses)), 2),
                "gross_recovery_value_inr": round(float(np.mean(gross_values)), 2),
                "processing_cost_inr": round(float(np.mean(processing_costs)), 2),
                "net_recovery_value_inr": round(mean_net, 2),
                "damage_risk_score": round(float(np.mean(damage_probs[active_mask])) * 100, 1) if any(active_mask) else 0.0,
                "circularity_score": circularity_score,
                "distribution": {
                    "p5_worst_case": round(p5_net, 2),
                    "p50_median": round(p50_net, 2),
                    "p95_best_case": round(p95_net, 2),
                    "std_deviation": round(std_net, 2),
                    "min_value": round(float(np.min(net_values)), 2),
                    "max_value": round(float(np.max(net_values)), 2)
                }
            },
            "monte_carlo_distribution": distribution_bins,
            "component_outcomes": component_recovery_rates
        }
