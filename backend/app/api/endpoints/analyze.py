import json
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models import Product, Component, DeviceAnalysis
from app.services.ai_vision import AIVisionService
from app.services.condition_engine import ConditionEngine
from app.services.material_passport import MaterialPassportService
from app.schemas.analysis import AnalysisResponse, ComponentDetectionItem, MaterialRecoveryItem

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_device(
    file: Optional[UploadFile] = File(None),
    category: str = Form("Laptop"),
    brand: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    screen_size_inch: Optional[float] = Form(None),
    age_years: float = Form(4.0),
    power_state: str = Form("does_not_turn_on"),
    battery_state: str = Form("degraded"),
    physical_condition: str = Form("moderate"),
    known_faults: Optional[str] = Form("[]"),
    db: Session = Depends(get_db)
):
    """
    Intake e-waste device image and user operational attributes.
    Performs AI visual inspection, condition synthesis, expected component inventory,
    and material recovery breakdown.
    """
    try:
        faults_list = json.loads(known_faults) if known_faults else []
    except Exception:
        faults_list = [f.strip() for f in known_faults.split(",") if f.strip()] if known_faults else []

    image_filename = None
    dimensions_str = "N/A"
    filesize_bytes = 0

    if file and file.filename:
        file_bytes = await file.read()
        try:
            img, meta = AIVisionService.inspect_and_validate_image(file_bytes, file.filename)
            dimensions_str = meta["dimensions"]
            filesize_bytes = meta["filesize_bytes"]
            
            # Save to upload directory
            ext = Path(file.filename).suffix or ".jpg"
            saved_name = f"{uuid.uuid4()}{ext}"
            saved_path = settings.UPLOAD_DIR / saved_name
            with open(saved_path, "wb") as f_out:
                f_out.write(file_bytes)
            image_filename = saved_name

            vision_result = AIVisionService.analyze_device_image(img, user_hint_category=category)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
    else:
        # Fallback if testing without image
        vision_result = {
            "detected_product": category or "Laptop",
            "confidence": 0.85,
            "visual_condition": physical_condition.title(),
            "visual_condition_score": 0.70 if physical_condition == "moderate" else (0.90 if physical_condition == "good" else 0.40),
            "visual_condition_confidence": 0.80,
            "wear_description": "Default operational condition baseline based on user parameters.",
            "visible_component_codes": ["chassis", "display", "keyboard_trackpad"],
            "expected_internal_codes": ["battery", "motherboard", "ssd", "ram", "cooling_system", "cooling_fans", "speakers", "cables_connectors"]
        }

    # 1. Synthesize overall device condition
    cond_calc = ConditionEngine.calculate_device_condition(
        visual_score=vision_result["visual_condition_score"],
        age_years=age_years,
        power_state=power_state,
        battery_state=battery_state,
        physical_condition=physical_condition,
        known_faults=faults_list
    )

    # 2. Retrieve Product taxonomy from database
    target_category = vision_result["detected_product"]
    product = db.query(Product).filter(Product.category.ilike(f"%{target_category}%")).first()
    if not product:
        product = db.query(Product).first()

    if not product:
        raise HTTPException(status_code=500, detail="Database taxonomy not seeded. Please run seed.py.")

    # 3. Analyze Components & Link to Materials
    is_laptop = (category.lower() == "laptop" or (product and "laptop" in product.category.lower()))
    if is_laptop:
        effective_screen_size = float(screen_size_inch) if (screen_size_inch and screen_size_inch > 0) else 15.6
        ref_size = 15.6
        size_multiplier = (effective_screen_size / ref_size) ** 1.8
        display_multiplier = (effective_screen_size / ref_size) ** 2.0
        battery_multiplier = 0.75 if effective_screen_size <= 13.5 else (0.88 if effective_screen_size <= 14.5 else (1.25 if effective_screen_size >= 17.0 else 1.0))
    else:
        effective_screen_size = screen_size_inch
        size_multiplier = 1.0
        display_multiplier = 1.0
        battery_multiplier = 1.0

    # Determine dynamic product title
    clean_brand = brand.strip() if brand else ""
    clean_model = model.strip() if model else ""
    if clean_brand and clean_model:
        has_size_str = ('"' in clean_model) or ('inch' in clean_model.lower())
        if effective_screen_size and not has_size_str:
            product_name = f"{clean_brand} {clean_model} ({effective_screen_size:.1f}-inch)"
        else:
            product_name = f"{clean_brand} {clean_model}"
    elif clean_brand:
        product_name = f"{clean_brand} Laptop ({effective_screen_size:.1f}-inch)" if effective_screen_size else f"{clean_brand} Device"
    elif effective_screen_size:
        product_name = f"Standard Laptop ({effective_screen_size:.1f}-inch)"
    else:
        product_name = product.name

    components_items = []
    materials_agg = {}

    for comp in product.components:
        eval_res = ConditionEngine.evaluate_component_condition_and_category(
            component_code=comp.code,
            default_category=comp.default_category,
            overall_condition=cond_calc["overall_condition_score"],
            age_years=age_years,
            power_state=power_state,
            battery_state=battery_state,
            physical_condition=physical_condition,
            known_faults=faults_list
        )

        is_visible = comp.code in vision_result.get("visible_component_codes", [])
        status_label = "Visible" if is_visible else "Expected"
        conf = vision_result["confidence"] if is_visible else max(0.75, vision_result["confidence"] - 0.05)

        comp_name = comp.name
        comp_weight = comp.weight_kg
        comp_val = comp.market_value_inr
        comp_removal_time = comp.removal_time_min

        if is_laptop and effective_screen_size:
            if comp.code == "display":
                comp_weight = round(comp.weight_kg * display_multiplier, 3)
                if clean_brand and "apple" in clean_brand.lower():
                    comp_name = f"{effective_screen_size:.1f}-inch Liquid Retina Display Assembly"
                elif clean_brand and any(b in clean_brand.lower() for b in ["dell", "thinkpad", "lenovo", "hp"]):
                    comp_name = f"{effective_screen_size:.1f}-inch Anti-Glare IPS Display Assembly"
                else:
                    comp_name = f"{effective_screen_size:.1f}-inch LCD / IPS Display Assembly"
                comp_val = round(comp.market_value_inr * (0.85 if effective_screen_size < 14.5 else (1.20 if effective_screen_size > 16.0 else 1.0)), 2)
                comp_removal_time = round(comp.removal_time_min * (0.90 if effective_screen_size < 14.5 else (1.10 if effective_screen_size > 16.0 else 1.0)), 2)
            elif comp.code == "chassis":
                comp_weight = round(comp.weight_kg * size_multiplier, 3)
                if effective_screen_size < 14.0:
                    comp_name = f'Compact Ultrabook Unibody Chassis ({effective_screen_size:.1f}")'
                elif effective_screen_size > 16.0:
                    comp_name = f'Reinforced Workstation Chassis ({effective_screen_size:.1f}")'
                else:
                    comp_name = f'Standard Clamshell Chassis ({effective_screen_size:.1f}")'
            elif comp.code == "battery":
                comp_weight = round(comp.weight_kg * battery_multiplier, 3)
            elif comp.code in ["cooling_fans", "cooling_system"]:
                if effective_screen_size >= 17.0:
                    comp_weight = round(comp.weight_kg * 1.25, 3)
                elif effective_screen_size <= 13.5:
                    comp_weight = round(comp.weight_kg * 0.80, 3)

        # Materials breakdown for this component
        materials_summary = {}
        for assoc in comp.material_associations:
            mat = assoc.material
            mat_weight = comp_weight * assoc.mass_fraction
            materials_summary[mat.name] = round(mat_weight, 4)

            if mat.name not in materials_agg:
                materials_agg[mat.name] = {
                    "material_name": mat.name,
                    "category": mat.category,
                    "total_weight_kg": 0.0,
                    "recoverable_weight_kg": 0.0,
                    "recovery_rate": mat.recovery_rate,
                    "market_value_per_kg": mat.market_value_per_kg,
                    "hazard_level": mat.hazard_level
                }
            materials_agg[mat.name]["total_weight_kg"] += mat_weight
            materials_agg[mat.name]["recoverable_weight_kg"] += mat_weight * mat.recovery_rate

        comp_dict = {
            "name": comp_name,
            "code": comp.code,
            "category": eval_res["final_category"],
            "detection_status": status_label,
            "confidence": round(conf, 2),
            "condition_score": eval_res["condition_score"],
            "condition_pct": eval_res["condition_pct"],
            "weight_kg": comp_weight,
            "market_value_inr": comp_val,
            "hazard_level": comp.hazard_level,
            "is_hazardous": comp.is_hazardous,
            "allow_manual_disassembly": comp.allow_manual_disassembly,
            "data_wipe_required": comp.data_wipe_required,
            "removal_time_min": comp_removal_time,
            "damage_probability": comp.damage_probability,
            "materials_summary": materials_summary,
            "handling_dos": comp.handling_dos,
            "handling_donts": comp.handling_donts,
            "recycling_channel": comp.recycling_channel
        }
        components_items.append(comp_dict)

    # 4. Finalize Material Recovery List
    materials_list = []
    for mat_data in materials_agg.values():
        val = max(0.0, mat_data["recoverable_weight_kg"] * mat_data["market_value_per_kg"])
        mat_data["total_value_inr"] = round(val, 2)
        mat_data["total_weight_kg"] = round(mat_data["total_weight_kg"], 4)
        mat_data["recoverable_weight_kg"] = round(mat_data["recoverable_weight_kg"], 4)
        materials_list.append(mat_data)

    # 5. Persist Analysis Record
    analysis = DeviceAnalysis(
        product_id=product.id,
        image_filename=image_filename,
        image_dimensions=dimensions_str,
        image_filesize_bytes=filesize_bytes,
        detected_product=vision_result["detected_product"],
        detection_confidence=vision_result["confidence"],
        visual_condition=vision_result["visual_condition"],
        visual_condition_confidence=vision_result["visual_condition_confidence"],
        reported_age_years=age_years,
        reported_power_state=power_state,
        reported_battery_state=battery_state,
        reported_physical_condition=physical_condition,
        known_faults=faults_list,
        calculated_condition_score=cond_calc["overall_condition_score"],
        components_breakdown=components_items,
        materials_breakdown=materials_list
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Pre-generate and store passport snapshot
    passport_data = MaterialPassportService.generate_passport(
        analysis_id=analysis.id,
        product_name=product_name,
        category=product.category,
        age_years=age_years,
        condition_info=cond_calc,
        components=components_items,
        materials=materials_list
    )
    analysis.passport_data = passport_data
    db.commit()

    return AnalysisResponse(
        analysis_id=analysis.id,
        image_url=f"/uploads/{image_filename}" if image_filename else None,
        detected_product=analysis.detected_product,
        product_name=product_name,
        screen_size_inch=effective_screen_size,
        confidence=analysis.detection_confidence,
        visual_condition=analysis.visual_condition,
        visual_condition_confidence=analysis.visual_condition_confidence,
        calculated_condition_score=analysis.calculated_condition_score,
        disclaimer="AI-generated component identification and material composition are estimates and should not be treated as a certified recycling, hazardous-material, or valuation assessment.",
        components=[ComponentDetectionItem(**c) for c in components_items],
        materials=[MaterialRecoveryItem(**m) for m in materials_list],
        created_at=analysis.created_at
    )
