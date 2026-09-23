import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "system" in response.json()

def test_analyze_device_form():
    response = client.post(
        "/api/analyze",
        data={
            "category": "Laptop",
            "age_years": "3.5",
            "power_state": "partially_working",
            "battery_state": "degraded",
            "physical_condition": "moderate",
            "known_faults": "[]"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "analysis_id" in data
    assert data["detected_product"] == "Laptop"
    assert len(data["components"]) > 0
    assert len(data["materials"]) > 0

    analysis_id = data["analysis_id"]

    # Test passport endpoint
    pass_res = client.get(f"/api/passport/{analysis_id}")
    assert pass_res.status_code == 200
    pass_data = pass_res.json()
    assert "weight_metrics" in pass_data
    assert "economic_metrics" in pass_data

    # Test recommendations endpoint
    rec_res = client.get(f"/api/recommendations/{analysis_id}")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "action_items" in rec_data
    # Verify battery is not manually dismantled
    battery_item = next((item for item in rec_data["action_items"] if item["component_code"] == "battery"), None)
    assert battery_item is not None
    assert battery_item["allow_manual_disassembly"] is False

    # Test simulation compare endpoint
    sim_res = client.post(
        "/api/simulation/compare",
        json={
            "analysis_id": analysis_id,
            "device_count": 25,
            "iterations": 100
        }
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert len(sim_data["comparison"]) == 3

def test_dynamic_screen_size_and_disassembly_timeline():
    # Test 14-inch ThinkPad
    response = client.post(
        "/api/analyze",
        data={
            "category": "Laptop",
            "brand": "Lenovo",
            "model": "ThinkPad T14",
            "screen_size_inch": "14.0",
            "age_years": "2.0",
            "power_state": "fully_working",
            "battery_state": "good",
            "physical_condition": "good",
            "known_faults": "[]"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == "Lenovo ThinkPad T14 (14.0-inch)"
    assert data["screen_size_inch"] == 14.0
    
    display_comp = next((c for c in data["components"] if c["code"] == "display"), None)
    assert display_comp is not None
    assert "14.0-inch" in display_comp["name"]
    # 15.6" display was 0.42 kg; 14" display should be (14/15.6)^2 * 0.42 ~= 0.338 kg
    assert display_comp["weight_kg"] < 0.42
    
    # Check passport has correct product name and scaled total weight
    pass_res = client.get(f"/api/passport/{data['analysis_id']}")
    assert pass_res.status_code == 200
    pass_data = pass_res.json()
    assert pass_data["product_name"] == "Lenovo ThinkPad T14 (14.0-inch)"
    assert pass_data["weight_metrics"]["total_weight_kg"] < 2.35

    # Check process timeline with custom labor rate
    timeline_res = client.get(f"/api/simulation/process-timeline/{data['analysis_id']}?strategy=selective_recovery&labor_rate=350")
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    assert "operation_timeline" in timeline_data
    assert "total_disassembly_time_min" in timeline_data
