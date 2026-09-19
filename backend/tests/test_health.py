import sys
import os

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.api.routes.health import get_health_status

def test_health_check():
    data = get_health_status()
    assert data["status"] == "healthy"
    assert "VEYRiX" in data["service"]
    assert "ai_pipeline" in data
    assert "action_bound_defense" in data
    assert data["action_bound_defense"] == "active"
    print("test_health_check passed!")

if __name__ == "__main__":
    test_health_check()
