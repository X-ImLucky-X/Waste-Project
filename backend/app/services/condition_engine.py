from typing import Dict, Any, List

class ConditionEngine:
    """
    Multi-variable heuristic engine combining:
    1. AI visual assessment score (25%)
    2. User operational inputs (35%)
    3. Age degradation curve (25%)
    4. Fault penalties (15%)
    """

    @classmethod
    def calculate_device_condition(
        cls,
        visual_score: float,
        age_years: float,
        power_state: str,
        battery_state: str,
        physical_condition: str,
        known_faults: List[str]
    ) -> Dict[str, Any]:
        # 1. Operational State Score (0.0 to 1.0)
        power_scores = {
            "fully_working": 0.95,
            "partially_working": 0.60,
            "does_not_turn_on": 0.25
        }
        power_val = power_scores.get(power_state.lower(), 0.50)

        phys_scores = {
            "good": 0.95,
            "moderate": 0.70,
            "damaged": 0.35
        }
        phys_val = phys_scores.get(physical_condition.lower(), 0.65)

        bat_scores = {
            "good": 0.90,
            "degraded": 0.45,
            "swollen": 0.10,
            "unknown": 0.50
        }
        bat_val = bat_scores.get(battery_state.lower(), 0.50)

        user_ops_score = (0.50 * power_val) + (0.30 * phys_val) + (0.20 * bat_val)

        # 2. Age Degradation Score (half-life of ~7 years for electronics)
        # 1 year -> 0.90, 3 years -> 0.75, 5 years -> 0.55, 8+ years -> 0.30
        age_clamped = max(0.0, min(age_years, 15.0))
        age_score = max(0.15, 1.0 / (1.0 + 0.12 * age_clamped))

        # 3. Fault Penalties
        fault_penalty = min(0.40, len(known_faults) * 0.12)
        fault_score = max(0.10, 1.0 - fault_penalty)

        # 4. Weighted Composite Overall Score
        overall_score = (
            0.25 * visual_score +
            0.35 * user_ops_score +
            0.25 * age_score +
            0.15 * fault_score
        )
        overall_score = max(0.10, min(round(overall_score, 3), 0.98))

        if overall_score >= 0.75:
            condition_label = "Good"
        elif overall_score >= 0.45:
            condition_label = "Moderate"
        else:
            condition_label = "Heavily Degraded"

        return {
            "overall_condition_score": overall_score,
            "overall_condition_pct": round(overall_score * 100, 1),
            "condition_label": condition_label,
            "factor_scores": {
                "visual_score": round(visual_score, 2),
                "user_operational_score": round(user_ops_score, 2),
                "age_retention_score": round(age_score, 2),
                "fault_integrity_score": round(fault_score, 2)
            }
        }

    @classmethod
    def evaluate_component_condition_and_category(
        cls,
        component_code: str,
        default_category: str,
        overall_condition: float,
        age_years: float,
        power_state: str,
        battery_state: str,
        physical_condition: str,
        known_faults: List[str]
    ) -> Dict[str, Any]:
        """
        Determines component-specific condition percentage and assigns final category:
        REUSABLE, REPAIRABLE, RECYCLABLE, HAZARDOUS, or RESIDUAL.
        """
        comp_cond = overall_condition

        # Specific component sensitivities
        if component_code == "battery":
            # Lithium batteries degrade sharply with age and user indication
            if battery_state.lower() == "swollen":
                comp_cond = 0.05
            elif battery_state.lower() == "degraded":
                comp_cond = min(comp_cond, 0.35)
            elif age_years > 4:
                comp_cond = min(comp_cond, 0.40)
            final_cat = "HAZARDOUS"  # Always hazardous irrespective of condition

        elif component_code in ["ram", "ssd"]:
            # Solid state components retain high reuse value unless power fault is severe
            comp_cond = min(0.95, overall_condition * 1.25)
            if power_state == "does_not_turn_on":
                comp_cond *= 0.85
            final_cat = "REUSABLE" if comp_cond >= 0.60 else ("REPAIRABLE" if comp_cond >= 0.40 else "RECYCLABLE")

        elif component_code == "display":
            if physical_condition.lower() == "damaged" or any("screen" in f.lower() or "display" in f.lower() for f in known_faults):
                comp_cond = 0.25
                final_cat = "RECYCLABLE"
            elif overall_condition >= 0.70:
                final_cat = "REUSABLE"
            elif overall_condition >= 0.45:
                final_cat = "REPAIRABLE"
            else:
                final_cat = "RECYCLABLE"

        elif component_code == "motherboard":
            if power_state == "does_not_turn_on":
                comp_cond = min(comp_cond, 0.40)
                final_cat = "RECYCLABLE"
            elif power_state == "partially_working":
                final_cat = "REPAIRABLE"
            else:
                final_cat = "RECYCLABLE"  # In e-waste, complex laptop boards mostly go to high-yield material recovery

        elif component_code in ["cooling_system", "cables_connectors", "chassis", "speakers"]:
            # Structural and passive metal/plastic components are primarily recyclable
            final_cat = "RECYCLABLE"

        elif component_code in ["cooling_fans", "keyboard_trackpad"]:
            if comp_cond >= 0.70:
                final_cat = "REUSABLE"
            elif comp_cond >= 0.45:
                final_cat = "REPAIRABLE"
            else:
                final_cat = "RECYCLABLE"
        else:
            final_cat = default_category

        return {
            "condition_score": round(max(0.05, min(comp_cond, 0.98)), 2),
            "condition_pct": round(max(5.0, min(comp_cond * 100, 98.0)), 1),
            "final_category": final_cat
        }
