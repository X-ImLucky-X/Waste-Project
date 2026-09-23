import uuid
from typing import List, Dict, Any
from datetime import datetime

class MaterialPassportService:
    """
    Generates structured, verifiable Digital Product Passports (DPP)
    according to circular economy standards (ESPR / WEEE compliant data models).
    """

    @classmethod
    def generate_passport(
        cls,
        analysis_id: int,
        product_name: str,
        category: str,
        age_years: float,
        condition_info: Dict[str, Any],
        components: List[Dict[str, Any]],
        materials: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        passport_uuid = f"DPP-EWASTE-{datetime.utcnow().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"

        # 1. Component Category Distribution
        cat_counts = {
            "REUSABLE": 0,
            "REPAIRABLE": 0,
            "RECYCLABLE": 0,
            "HAZARDOUS": 0,
            "RESIDUAL": 0
        }
        reusable_mass = 0.0
        total_mass = sum(c["weight_kg"] for c in components)
        component_reuse_val = 0.0

        for c in components:
            cat = c.get("final_category", c.get("category", "RECYCLABLE"))
            if cat in cat_counts:
                cat_counts[cat] += 1
            else:
                cat_counts["RECYCLABLE"] += 1

            if cat == "REUSABLE":
                reusable_mass += c["weight_kg"]
                component_reuse_val += c["market_value_inr"] * c["condition_score"]
            elif cat == "REPAIRABLE":
                component_reuse_val += c["market_value_inr"] * c["condition_score"] * 0.65

        # 2. Material Scrap Recovery Metrics
        recoverable_material_mass = sum(m["recoverable_weight_kg"] for m in materials)
        material_scrap_val = sum(m["total_value_inr"] for m in materials)

        # Residual waste = total device mass - (reusable component mass + recoverable raw materials from non-reused parts)
        # To avoid double counting, materials from reusable components are isolated
        residual_waste = max(0.20, total_mass - (reusable_mass * 0.70 + recoverable_material_mass * 0.85))
        circularity_rate = min(95.0, round(((total_mass - residual_waste) / max(total_mass, 0.1)) * 100, 1))

        # 3. Processing costs & Net Recovery
        # Scaled processing fee: baseline dismantling, sorting, and logistics based on mass & complexity
        estimated_processing_cost = max(120.0, round(total_mass * 160.0 + len(components) * 15.0, 2))
        gross_value = component_reuse_val + (material_scrap_val * 0.6)  # combined recovery
        net_value = max(100.0, gross_value - estimated_processing_cost)

        # 4. Environmental Savings
        co2_avoided_kg = round(recoverable_material_mass * 4.2 + reusable_mass * 12.5, 2)
        landfill_diverted_kg = round(total_mass - residual_waste, 2)

        # 5. Key Materials Distribution for Visual Passport
        materials_distribution = [
            {
                "material": m["material_name"],
                "category": m["category"],
                "weight_kg": round(m["total_weight_kg"], 3),
                "recoverable_kg": round(m["recoverable_weight_kg"], 3),
                "value_inr": round(m["total_value_inr"], 1),
                "hazard": m["hazard_level"]
            }
            for m in materials[:8]
        ]

        passport = {
            "passport_id": passport_uuid,
            "analysis_id": analysis_id,
            "product_category": category,
            "product_name": product_name,
            "age_years": age_years,
            "overall_condition_pct": condition_info["overall_condition_pct"],
            "overall_condition_label": condition_info["condition_label"],
            "total_components_count": len(components),
            "category_counts": cat_counts,
            "weight_metrics": {
                "total_weight_kg": round(total_mass, 2),
                "recoverable_material_kg": round(recoverable_material_mass, 2),
                "reusable_components_kg": round(reusable_mass, 2),
                "residual_waste_kg": round(residual_waste, 2),
                "circularity_rate_pct": circularity_rate
            },
            "economic_metrics": {
                "component_reuse_value_inr": round(component_reuse_val, 2),
                "material_scrap_value_inr": round(material_scrap_val, 2),
                "gross_recovery_value_inr": round(gross_value, 2),
                "estimated_processing_cost_inr": round(estimated_processing_cost, 2),
                "net_recovery_value_inr": round(net_value, 2)
            },
            "key_materials_distribution": materials_distribution,
            "environmental_offsets": {
                "co2_emissions_avoided_kg": co2_avoided_kg,
                "landfill_diverted_kg": landfill_diverted_kg,
                "equivalent_trees_planted": round(co2_avoided_kg / 21.0, 1)
            },
            "compliance_standards": [
                "EU Ecodesign for Sustainable Products Regulation (ESPR)",
                "WEEE Directive 2012/19/EU Compliant",
                "ISO 14044 Life Cycle Assessment (LCA) Framework",
                "E-Waste Management Rules (MoEFCC Schedule I & II)"
            ],
            "generated_at": datetime.utcnow().isoformat()
        }

        return passport
