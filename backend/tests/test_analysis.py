import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.schemas.analysis import AnalysisRequest
from backend.app.services.analysis_service import analysis_service

def test_analysis_pipeline_hold():
    # Simulated high-risk wire transfer request
    req = AnalysisRequest(
        audio_file_name="executive_urgent_wire_85k.wav",
        caller_type="Executive / Manager",
        requested_action="Urgent Money Transfer",
        urgency="Emergency",
        transcript="Please transfer the money immediately to the escrow account, do not call anyone."
    )
    result = analysis_service.process_analysis(req)
    
    assert result.risk_score >= 70, f"Expected high risk, got {result.risk_score}"
    assert result.risk_level == "HIGH"
    assert result.recommendation == "HOLD"
    assert result.action_risk is not None
    assert result.action_risk.critical_risk is True
    assert len(result.reasons) > 0
    print("test_analysis_pipeline_hold passed!")

def test_analysis_pipeline_allow():
    # Routine benign conversation
    req = AnalysisRequest(
        audio_file_name="team_routine_sync.wav",
        caller_type="Executive / Manager",
        requested_action="General Conversation",
        urgency="Standard",
        transcript="Let me know when you have time for our weekly sync."
    )
    result = analysis_service.process_analysis(req)
    
    assert result.risk_score < 35, f"Expected low risk, got {result.risk_score}"
    assert result.risk_level == "LOW"
    assert result.recommendation == "ALLOW"
    print("test_analysis_pipeline_allow passed!")

if __name__ == "__main__":
    test_analysis_pipeline_hold()
    test_analysis_pipeline_allow()
