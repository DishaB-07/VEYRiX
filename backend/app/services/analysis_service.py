import time
from typing import Optional, Dict, Any, List
from backend.app.core.security import generate_request_id
from backend.app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    LivenessDetails,
)
from backend.app.schemas.incident import IncidentRecordSchema
from backend.app.services.voice_authenticity import voice_authenticity_service
from backend.app.services.speaker_verification import speaker_verification_service
from backend.app.services.intent_detection import intent_detection_service
from backend.app.services.policy_engine import policy_engine
from backend.app.services.risk_engine import risk_engine

# In-memory incident buffer for prototype demo session (Future: PostgreSQL / SQLite)
IN_MEMORY_INCIDENTS: List[IncidentRecordSchema] = [
    IncidentRecordSchema(
        id="INC-DEMO-001",
        timestamp="2026-09-18 14:32",
        audio_source="executive_urgent_wire_85k.wav",
        caller_type="Executive / Manager",
        risk_score=92,
        risk_level="high",
        main_signal="88.5% Synthetic Probability (Urgent Money Transfer)",
        recommended_action="HOLD",
        verification_status="Held & Escalated",
        detection_type="Synthetic Voice & Action Impersonation",
        reasons=[
            "High-impact action requested: Urgent Money Transfer under urgency coercion",
            "Synthetic voice indicators detected (88.5% probability)",
            "Secrecy coercion detected: caller instructed victim not to cross-verify"
        ],
        metadata={"channel": "Cellular / PSTN", "action": "Urgent Money Transfer"}
    ),
    IncidentRecordSchema(
        id="INC-DEMO-002",
        timestamp="2026-09-18 16:10",
        audio_source="it_support_otp_extraction.wav",
        caller_type="Unknown Number",
        risk_score=78,
        risk_level="high",
        main_signal="76.0% Synthetic Probability (OTP Request)",
        recommended_action="HOLD",
        verification_status="Pending",
        detection_type="Credential & Dual-Factor Authentication Interception",
        reasons=[
            "Violates POL-AUTH-02: Employees must NEVER transmit OTPs over phone",
            "Urgency coercion detected"
        ],
        metadata={"channel": "VoIP / SIP", "action": "OTP Request"}
    ),
    IncidentRecordSchema(
        id="INC-DEMO-003",
        timestamp="2026-09-19 09:15",
        audio_source="team_routine_sync.wav",
        caller_type="Executive / Manager",
        risk_score=14,
        risk_level="low",
        main_signal="94.2% Speaker Match (General Conversation)",
        recommended_action="ALLOW",
        verification_status="Verified",
        detection_type="Natural Voice Integrity Cleared",
        reasons=["Acoustic parameters and conversational intent cleared as routine benign baseline"],
        metadata={"channel": "Enterprise UC / Teams", "action": "General Conversation"}
    )
]

class AnalysisService:
    """
    Orchestrates the entire VEYRiX multi-modal pipeline:
    Audio -> Authenticity + Speaker + Liveness -> Intent -> Action Risk -> Policy Check -> Risk Fusion
    """

    def process_analysis(self, req: AnalysisRequest) -> AnalysisResponse:
        req_id = generate_request_id()
        context_hint = f"{req.requested_action} {req.audio_file_name or ''}"

        # 1. Voice Authenticity & Spoofing Evaluation (Proposed: AASIST / Wav2Vec2)
        authenticity = voice_authenticity_service.analyze(
            metrics=req.metrics,
            context_hint=context_hint
        )

        # 2. Speaker Verification (Proposed: ECAPA-TDNN)
        speaker_match = speaker_verification_service.verify_against_profile(
            profile_id=req.trusted_profile_id,
            context_hint=context_hint,
            metrics=req.metrics
        )

        # 3. Liveness & Replay Analysis (Channel acoustics)
        replay_prob = 12.0
        if "account" in context_hint.lower() or (req.metrics and req.metrics.get("highFreqRatio", 0.05) < 0.01):
            replay_prob = 68.0
        liveness = LivenessDetails(
            replay_probability=replay_prob,
            channel_drift_score=22.0,
            liveness_confirmed=(replay_prob < 50.0)
        )

        # 4. Intent & Social Engineering Detection (Proposed: Whisper + Lexicon)
        intent = intent_detection_service.detect_intent(
            transcript=req.transcript,
            requested_action=req.requested_action,
            urgency=req.urgency
        )

        # 5. Action Sensitivity Evaluation (Action-Bound Trust)
        action_risk = risk_engine.compute_action_risk(
            requested_action=req.requested_action,
            urgency=req.urgency,
            caller_type=req.caller_type
        )

        # 6. Corporate Security Policy & RAG Check
        policy_check = policy_engine.evaluate_policy(
            requested_action=req.requested_action,
            transcript=req.transcript
        )

        # 7. Risk Fusion Decision
        risk_score, risk_level, recommendation, reasons, steps = risk_engine.evaluate_risk(
            authenticity=authenticity,
            speaker_match=speaker_match,
            liveness=liveness,
            intent=intent,
            action_risk=action_risk,
            policy_check=policy_check
        )

        # Auto-log incident in session history
        new_incident = IncidentRecordSchema(
            id=f"INC-{req_id[-8:].upper()}",
            timestamp=time.strftime("%Y-%m-%d %H:%M"),
            audio_source=req.audio_file_name or "uploaded_sample.wav",
            caller_type=req.caller_type,
            risk_score=risk_score,
            risk_level=risk_level.lower(),
            main_signal=f"{authenticity.synthetic_probability:.1f}% Synthetic Probability ({req.requested_action})",
            recommended_action=recommendation,
            verification_status="Pending",
            detection_type="Synthetic Voice & Action Impersonation" if risk_level == "HIGH" else "Routine Voice Cleared",
            reasons=reasons,
            metadata={"channel": req.channel, "action": req.requested_action}
        )
        IN_MEMORY_INCIDENTS.insert(0, new_incident)

        return AnalysisResponse(
            request_id=req_id,
            risk_score=risk_score,
            risk_level=risk_level,
            recommendation=recommendation,
            voice_authenticity=authenticity,
            speaker_match=speaker_match,
            liveness=liveness,
            intent=intent,
            action_risk=action_risk,
            policy_check=policy_check,
            reasons=reasons,
            immediate_steps=steps,
            demo_mode=True
        )

    def list_incidents(self) -> List[IncidentRecordSchema]:
        return list(IN_MEMORY_INCIDENTS)

    def get_incident(self, incident_id: str) -> Optional[IncidentRecordSchema]:
        for inc in IN_MEMORY_INCIDENTS:
            if inc.id.lower() == incident_id.lower():
                return inc
        return None

analysis_service = AnalysisService()
