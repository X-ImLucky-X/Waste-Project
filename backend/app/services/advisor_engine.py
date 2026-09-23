import json
from pathlib import Path
from typing import List, Dict, Any

class SafetyAdvisorEngine:
    """
    Deterministic rule-based safety advisor.
    Enforces strict safety protocols, blocks dangerous teardowns of batteries or high-voltage
    sections, and provides exact DOs, DON'Ts, and recycling routes.
    """

    def __init__(self, data_dir: Path):
        rules_path = data_dir / "safety_rules.json"
        if rules_path.exists():
            with open(rules_path, "r", encoding="utf-8") as f:
                self.rules_data = json.load(f)
        else:
            self.rules_data = {}

    def generate_recommendations(self, components: List[Dict[str, Any]]) -> Dict[str, Any]:
        general_disclaimer = self.rules_data.get(
            "general_disclaimer",
            "AI-generated component identification is estimated. Observe standard industrial WEEE safety practices."
        )

        hazard_protocols = self.rules_data.get("hazard_protocols", {})
        action_items = []
        hazardous_count = 0

        for comp in components:
            code = comp.get("code", "")
            name = comp.get("name", "")
            cat = comp.get("final_category", comp.get("category", "RECYCLABLE"))
            is_haz = comp.get("is_hazardous", False)
            hazard_lvl = comp.get("hazard_level", "none")
            allow_manual = comp.get("allow_manual_disassembly", True)
            data_wipe = comp.get("data_wipe_required", False)

            if is_haz:
                hazardous_count += 1

            dos = list(comp.get("handling_dos", []))
            donts = list(comp.get("handling_donts", []))
            special_warning = None

            # Apply specific hazard protocol overrides
            if code == "battery":
                proto = hazard_protocols.get("battery", {})
                special_warning = proto.get("warning")
                allow_manual = False  # Strictly forbidden manual teardown
                recommended_action = "CRITICAL: Do not dismantle. Transport intact in fire-retardant drum to certified hydrometallurgical recycling facility."
            elif data_wipe or code == "ssd":
                proto = hazard_protocols.get("storage", {})
                special_warning = proto.get("warning")
                recommended_action = "MANDATORY DATA SANITIZATION: NIST SP 800-88 cryptographic erase or physical cross-cut shredding."
            elif code == "display":
                proto = hazard_protocols.get("glass_display", {})
                special_warning = proto.get("warning")
                recommended_action = "Panel Diagnostic & Glass Reclamation: Check LCD polarizer for reuse; recycle glass through specialized indium channel."
            elif cat == "REUSABLE":
                recommended_action = "Testing & Secondary Market Resale: Clean contacts with 99% IPA, execute automated benchmark, and restock for spare-parts refurbishing."
            elif cat == "REPAIRABLE":
                recommended_action = "Refurbishment & Minor Repair: Replace damaged sub-elements or re-solder broken joints before qualification test."
            else:
                recommended_action = "High-Efficiency Material Recovery: Route to authorized industrial shredder and hydrometallurgical/pyrometallurgical smelter."

            action_items.append({
                "component_code": code,
                "component_name": name,
                "category": cat,
                "hazard_level": hazard_lvl,
                "is_hazardous": is_haz,
                "allow_manual_disassembly": allow_manual,
                "recommended_action": recommended_action,
                "recycling_channel": comp.get("recycling_channel", "Authorized WEEE Recycler"),
                "data_wipe_required": data_wipe,
                "dos": dos,
                "donts": donts,
                "special_warnings": special_warning
            })

        return {
            "general_safety_warning": general_disclaimer,
            "hazardous_components_detected": hazardous_count,
            "action_items": action_items
        }
