import pytest
from app.services.condition_engine import ConditionEngine

def test_condition_engine_healthy_device():
    res = ConditionEngine.calculate_device_condition(
        visual_score=0.90,
        age_years=1.0,
        power_state="fully_working",
        battery_state="good",
        physical_condition="good",
        known_faults=[]
    )
    assert res["overall_condition_score"] >= 0.75
    assert res["condition_label"] == "Good"

def test_condition_engine_degraded_device():
    res = ConditionEngine.calculate_device_condition(
        visual_score=0.30,
        age_years=8.0,
        power_state="does_not_turn_on",
        battery_state="swollen",
        physical_condition="damaged",
        known_faults=["cracked casing", "water damage"]
    )
    assert res["overall_condition_score"] < 0.50
    assert res["condition_label"] == "Heavily Degraded"

def test_component_battery_is_always_hazardous():
    res = ConditionEngine.evaluate_component_condition_and_category(
        component_code="battery",
        default_category="HAZARDOUS",
        overall_condition=0.95,
        age_years=1.0,
        power_state="fully_working",
        battery_state="good",
        physical_condition="good",
        known_faults=[]
    )
    assert res["final_category"] == "HAZARDOUS"

def test_reusable_ssd_classification():
    res = ConditionEngine.evaluate_component_condition_and_category(
        component_code="ssd",
        default_category="REUSABLE",
        overall_condition=0.80,
        age_years=2.0,
        power_state="fully_working",
        battery_state="good",
        physical_condition="good",
        known_faults=[]
    )
    assert res["final_category"] == "REUSABLE"
    assert res["condition_score"] >= 0.60
