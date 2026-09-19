from typing import Dict, Any
try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs):
            self.routes = []
        def get(self, *args, **kwargs):
            def decorator(f): return f
            return decorator
        def post(self, *args, **kwargs):
            def decorator(f): return f
            return decorator
    class HTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

from backend.app.schemas.analysis import AnalysisRequest, AnalysisResponse, IntentDetails
from backend.app.schemas.risk import RiskEvaluationRequest
from backend.app.services.analysis_service import analysis_service
from backend.app.services.intent_detection import intent_detection_service
from backend.app.services.risk_engine import risk_engine
from backend.app.services.voice_authenticity import voice_authenticity_service
from backend.app.services.speaker_verification import speaker_verification_service
from backend.app.services.policy_engine import policy_engine
from backend.app.schemas.analysis import LivenessDetails

router = APIRouter(tags=["Analysis & Risk"])

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_call(req: AnalysisRequest):
    """
    Executes comprehensive multi-modal voice & action fraud analysis.
    Evaluates:
    1. Voice Authenticity (Synthetic/Deepfake probability)
    2. Speaker Identity (Biometric match)
    3. Liveness & Replay verification
    4. Conversational Intent & Social Engineering detection
    5. Action Sensitivity & Policy Compliance check
    6. Multi-modal Risk Fusion
    """
    try:
        result = analysis_service.process_analysis(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline processing failed: {str(e)}")

@router.post("/intent/analyze", response_model=IntentDetails)
def analyze_intent(payload: Dict[str, Any]):
    """
    Evaluates transcript or requested action for social engineering pressure,
    coercive urgency, secrecy demands, and financial/credential extraction.
    """
    transcript = payload.get("transcript", "")
    requested_action = payload.get("requested_action", "General Conversation")
    urgency = payload.get("urgency", "Standard")
    return intent_detection_service.detect_intent(
        transcript=transcript,
        requested_action=requested_action,
        urgency=urgency
    )

@router.post("/risk/evaluate")
def evaluate_risk(req: RiskEvaluationRequest):
    """
    Direct endpoint for evaluating action-bound risk given pre-computed or mock signals.
    """
    action_risk = risk_engine.compute_action_risk(
        requested_action=req.requested_action,
        urgency=req.urgency_level,
        caller_type=req.caller_type
    )

    authenticity = voice_authenticity_service.analyze(
        context_hint=req.requested_action
    )
    if req.synthetic_probability is not None:
        authenticity.synthetic_probability = req.synthetic_probability

    speaker_match = speaker_verification_service.verify_against_profile(
        profile_id="profile_1" if req.has_reference_voice else None,
        context_hint=req.requested_action
    )
    if req.speaker_similarity is not None:
        speaker_match.similarity_score = req.speaker_similarity

    liveness = LivenessDetails(
        replay_probability=req.replay_probability if req.replay_probability is not None else 10.0,
        channel_drift_score=15.0,
        liveness_confirmed=True
    )

    intent = intent_detection_service.detect_intent(
        transcript=req.transcript,
        requested_action=req.requested_action,
        urgency=req.urgency_level
    )

    policy_check = policy_engine.evaluate_policy(
        requested_action=req.requested_action,
        transcript=req.transcript
    )

    score, level, recommendation, reasons, steps = risk_engine.evaluate_risk(
        authenticity=authenticity,
        speaker_match=speaker_match,
        liveness=liveness,
        intent=intent,
        action_risk=action_risk,
        policy_check=policy_check
    )

    return {
        "risk_score": score,
        "risk_level": level,
        "recommendation": recommendation,
        "reasons": reasons,
        "action_risk": action_risk.dict() if hasattr(action_risk, 'dict') else action_risk.__dict__,
        "policy_violation": policy_check.is_violated,
        "immediate_steps": steps
    }
