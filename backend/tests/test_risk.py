import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.schemas.analysis import (
    VoiceAuthenticityDetails,
    SpeakerMatchDetails,
    LivenessDetails,
    IntentDetails,
    PolicyCheckResult,
)
from backend.app.schemas.risk import ActionRiskDetails
from backend.app.services.risk_engine import risk_engine

def test_risk_engine_action_bound_rule():
    """
    Validates VEYRiX core rule:
    Even with 99% speaker match, a critical $85k urgent wire cannot be simply ALLOWed.
    """
    authenticity = VoiceAuthenticityDetails(
        synthetic_probability=20.0,
        status="Natural Speech"
    )
    speaker_match = SpeakerMatchDetails(
        matched=True,
        similarity_score=98.0,
        status="Biometric Match Verified"
    )
    liveness = LivenessDetails(
        replay_probability=10.0,
        channel_drift_score=10.0,
        liveness_confirmed=True
    )
    intent = IntentDetails(
        primary_intent="Wire transfer",
        coercion_detected=True,
        secrecy_demand=True
    )
    action_risk = ActionRiskDetails(
        action_type="Urgent Money Transfer",
        base_weight=85,
        urgency_multiplier=1.35,
        caller_suspicion_multiplier=1.2,
        critical_risk=True
    )
    policy_check = PolicyCheckResult(
        policy_code="POL-FIN-01",
        policy_rule="Wire transfers over $10k require independent dual-key verification.",
        is_violated=True,
        recommended_mitigation="Hold transaction until out-of-band supervisor callback."
    )

    score, level, recommendation, reasons, steps = risk_engine.evaluate_risk(
        authenticity=authenticity,
        speaker_match=speaker_match,
        liveness=liveness,
        intent=intent,
        action_risk=action_risk,
        policy_check=policy_check
    )

    # Core assertion: An urgent money transfer with secrecy MUST NOT be ALLOWed!
    assert recommendation in ("HOLD", "VERIFY"), f"Expected HOLD/VERIFY, got {recommendation}"
    assert score >= 70, f"Expected elevated score >= 70, got {score}"
    assert level == "HIGH"
    print("test_risk_engine_action_bound_rule passed!")

if __name__ == "__main__":
    test_risk_engine_action_bound_rule()
