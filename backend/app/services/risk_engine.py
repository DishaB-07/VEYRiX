from typing import Tuple, List
from backend.app.schemas.risk import ActionRiskDetails, RiskEvaluationRequest
from backend.app.schemas.analysis import (
    VoiceAuthenticityDetails,
    SpeakerMatchDetails,
    LivenessDetails,
    IntentDetails,
    PolicyCheckResult,
)

class RiskEngine:
    """
    Action-Bound Multi-Modal Risk Fusion Engine.
    
    Core VEYRiX Tenet:
    "Trust is assigned to the action — not to the voice alone."
    
    Even if an AI voice matches a known speaker with 99% biometric fidelity,
    an irreversible high-risk action (e.g. $85,000 urgent wire or OTP disclosure)
    demands mandatory verification or hold.
    
    Formula Weights (Prototype Specification):
    - Action Sensitivity & Coercion: 40%
    - Voice Synthetic Probability: 35%
    - Speaker Biometric Mismatch: 15%
    - Replay / Channel Drift: 10%
    """

    ACTION_BASE_WEIGHTS = {
        "urgent money transfer": 85,
        "otp request": 80,
        "password reset": 75,
        "confidential information request": 70,
        "payment request": 65,
        "account detail change": 60,
        "general conversation": 10,
    }

    def compute_action_risk(
        self,
        requested_action: str,
        urgency: str,
        caller_type: str
    ) -> ActionRiskDetails:
        action_key = requested_action.lower().strip()
        base_weight = self.ACTION_BASE_WEIGHTS.get(action_key, 25)

        urgency_multiplier = 1.0
        if urgency == "Emergency":
            urgency_multiplier = 1.35
        elif urgency == "Urgent":
            urgency_multiplier = 1.2

        caller_suspicion = 1.0
        if caller_type == "Unknown Number":
            caller_suspicion = 1.25
        elif caller_type == "Executive / Manager" and base_weight > 20:
            # Executive impersonation modifier
            caller_suspicion = 1.2

        critical_risk = (base_weight * urgency_multiplier * caller_suspicion) >= 75

        return ActionRiskDetails(
            action_type=requested_action,
            base_weight=base_weight,
            urgency_multiplier=urgency_multiplier,
            caller_suspicion_multiplier=caller_suspicion,
            critical_risk=critical_risk
        )

    def evaluate_risk(
        self,
        authenticity: VoiceAuthenticityDetails,
        speaker_match: SpeakerMatchDetails,
        liveness: LivenessDetails,
        intent: IntentDetails,
        action_risk: ActionRiskDetails,
        policy_check: PolicyCheckResult
    ) -> Tuple[int, str, str, List[str], List[str]]:
        """
        Fuses acoustic, biometric, conversational intent, and action-bound policy signals.
        Returns: (risk_score, risk_level, recommendation, reasons, immediate_steps)
        """
        # 1. Action impact component (0..100)
        action_component = min(100.0, action_risk.base_weight * action_risk.urgency_multiplier * action_risk.caller_suspicion_multiplier)

        # 2. Synthetic voice component (0..100)
        synthetic_component = authenticity.synthetic_probability

        # 3. Speaker mismatch penalty (0..100)
        if speaker_match.similarity_score is not None:
            mismatch_penalty = max(0.0, 100.0 - speaker_match.similarity_score)
        else:
            mismatch_penalty = 20.0  # Unverified stranger penalty

        # 4. Replay component (0..100)
        replay_component = liveness.replay_probability

        # Multi-modal fusion
        composite_score = (
            action_component * 0.40 +
            synthetic_component * 0.35 +
            mismatch_penalty * 0.15 +
            replay_component * 0.10
        )

        # Policy escalation override: If an explicit corporate policy is violated under high urgency
        if policy_check.is_violated and action_risk.critical_risk:
            composite_score = max(composite_score, 78.0)

        final_score = int(round(min(99, max(5, composite_score))))

        # Decision threshold mapping
        if final_score >= 70:
            risk_level = "HIGH"
            recommendation = "HOLD"
        elif final_score >= 35:
            risk_level = "MEDIUM"
            recommendation = "VERIFY"
        else:
            risk_level = "LOW"
            recommendation = "ALLOW"

        # Construct clear, explainable reasons
        reasons: List[str] = []
        if action_risk.critical_risk:
            reasons.append(f"High-impact action requested: {action_risk.action_type} under urgency coercion")
        if authenticity.synthetic_probability >= 65:
            reasons.append(f"Synthetic voice indicators detected ({authenticity.synthetic_probability:.1f}% probability)")
        if speaker_match.similarity_score is not None and speaker_match.similarity_score < 60:
            reasons.append(f"Biometric voice mismatch with claimed speaker ({speaker_match.similarity_score:.1f}% match)")
        if intent.secrecy_demand:
            reasons.append("Secrecy coercion detected: caller instructed victim not to cross-verify")
        if policy_check.is_violated:
            reasons.append(f"Violates {policy_check.policy_code}: {policy_check.policy_rule}")
        if not reasons:
            reasons.append("Vocal acoustics, speaker similarity, and conversational action conform to routine benign baselines")

        # Concrete immediate safety steps
        steps: List[str] = []
        if risk_level == "HIGH":
            steps = [
                "Stop immediately. Do not release funds, transfer money, or disclose one-time passwords (OTPs).",
                "Hang up the call. Do not negotiate or answer further questions from the caller.",
                "Perform an independent callback using the contact's official verified phone number from your corporate directory.",
                "Report this voice impersonation incident to your organization's security operations desk."
            ]
        elif risk_level == "MEDIUM":
            steps = [
                "Pause before taking any action on account details or routing numbers.",
                "Notify the caller that dual-channel verification policy requires an independent callback.",
                "Confirm the caller's request over an authorized secondary channel (e.g. corporate Slack/Teams or in-person).",
                "Never share authentication push codes or SMS OTPs over voice calls."
            ]
        else:
            steps = [
                "Routine communication cleared. Proceed with normal conversation.",
                "Maintain standard baseline caution: never recite master passwords or private encryption keys."
            ]

        return final_score, risk_level, recommendation, reasons, steps

risk_engine = RiskEngine()
