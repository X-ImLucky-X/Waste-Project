import simpy
from typing import List, Dict, Any, Tuple
import random

class DisassemblySimulator:
    """
    Discrete-event simulation of the disassembly process using SimPy.
    Models workstation throughput, operation sequence, tooling constraints,
    operator time, and component damage risk during manual de-manufacturing.
    """

    # Precedence sequence for laptop dismantling
    SEQUENCE = [
        {"code": "chassis", "op_name": "Remove Base Enclosure & Fasteners", "tool": "Phillips #00 / Torx T5"},
        {"code": "battery", "op_name": "Isolate & Extract Li-Ion Battery", "tool": "Plastic Spudger (Non-conductive)"},
        {"code": "ssd", "op_name": "Extract M.2 NVMe SSD", "tool": "Phillips #00 + Anti-static Wristband"},
        {"code": "ram", "op_name": "Eject SO-DIMM RAM Modules", "tool": "ESD Tweezers"},
        {"code": "cooling_system", "op_name": "Detach Heatpipe Radiator & Clean Compound", "tool": "Reverse-torque Screwdriver"},
        {"code": "cooling_fans", "op_name": "Unmount Centrifugal Blower Fans", "tool": "Micro Screwdriver"},
        {"code": "motherboard", "op_name": "Disconnect Flex Cables & Lift Mainboard", "tool": "ZIF Cable Extractor"},
        {"code": "display", "op_name": "Unscrew Zinc Hinges & Detach eDP Panel", "tool": "Hinge Nut Driver"},
        {"code": "keyboard_trackpad", "op_name": "Separate Input Deck from Chassis", "tool": "Heat Mat / Ultrasonic Prying"},
        {"code": "speakers", "op_name": "De-bond NdFeB Speaker Modules", "tool": "Adhesive Solvent Swab"},
        {"code": "cables_connectors", "op_name": "Collect Wiring Harness & DC Jack", "tool": "Wire Snippers"}
    ]

    @classmethod
    def simulate_single_device(
        cls,
        components_map: Dict[str, Dict[str, Any]],
        strategy: str = "selective_recovery",
        operator_skill_factor: float = 1.0,
        labor_rate_per_hour_inr: float = 250.0,
        random_seed: int = None
    ) -> Dict[str, Any]:
        """
        Runs one discrete-event SimPy simulation run of a single device.
        """
        if random_seed is not None:
            random.seed(random_seed)

        env = simpy.Environment()
        workstation = simpy.Resource(env, capacity=1)

        log = []
        recovered_components = []
        damaged_components = []
        total_time_spent = 0.0

        def disassembly_process(env, workstation):
            nonlocal total_time_spent
            for step in cls.SEQUENCE:
                code = step["code"]
                comp = components_map.get(code)
                if not comp:
                    continue

                # Strategy filtering:
                # Direct Recycling skips manual disassembly for all non-hazardous parts
                if strategy == "direct_recycling" and not comp.get("is_hazardous", False):
                    continue

                # Selective Recovery skips low-value/high-time non-hazardous components
                if strategy == "selective_recovery":
                    market_val = comp.get("market_value_inr", 0)
                    time_cost = comp.get("removal_time_min", 2.0) * (labor_rate_per_hour_inr / 60.0)
                    risk = comp.get("damage_probability", 0.05)
                    # If expected value / cost-risk ratio is too low and not hazardous, send to bulk recycling
                    expected_val = market_val * comp.get("condition_score", 0.5)
                    if (expected_val < (time_cost * 1.2)) and not comp.get("is_hazardous", False):
                        continue

                with workstation.request() as req:
                    yield req
                    # Operation duration modeled with normal variation around standard time
                    base_time = comp.get("removal_time_min", 2.0) / max(operator_skill_factor, 0.5)
                    actual_duration = max(0.4, random.gauss(base_time, base_time * 0.15))
                    
                    yield env.timeout(actual_duration)
                    total_time_spent += actual_duration

                    # Damage occurrence check
                    base_damage_prob = comp.get("damage_probability", 0.05) / max(operator_skill_factor, 0.5)
                    is_damaged = (random.random() < base_damage_prob)

                    step_entry = {
                        "timestamp_min": round(env.now, 2),
                        "component_code": code,
                        "component_name": comp.get("name", code),
                        "operation": step["op_name"],
                        "tool": step["tool"],
                        "duration_min": round(actual_duration, 2),
                        "damaged": is_damaged,
                        "recovered": not is_damaged
                    }
                    log.append(step_entry)

                    if is_damaged:
                        damaged_components.append(code)
                    else:
                        recovered_components.append(code)

        env.process(disassembly_process(env, workstation))
        env.run()

        return {
            "strategy": strategy,
            "total_disassembly_time_min": round(total_time_spent, 2),
            "recovered_count": len(recovered_components),
            "damaged_count": len(damaged_components),
            "recovered_components": recovered_components,
            "damaged_components": damaged_components,
            "operation_timeline": log
        }
