from typing import List, Dict, Any, Optional
from backend.app.schemas.analysis import IntentDetails

SENSITIVE_KEYWORD_PATTERNS = [
    {"phrase": "transfer the money", "category": "financial", "risk": "Financial capital transfer request"},
    {"phrase": "transfer", "category": "financial", "risk": "Fund movement solicitation"},
    {"phrase": "immediately", "category": "urgency", "risk": "Urgent pressure coercion tactic"},
    {"phrase": "emergency", "category": "urgency", "risk": "Emotional crisis lever"},
    {"phrase": "do not call anyone", "category": "secrecy", "risk": "Verification avoidance and isolation"},
    {"phrase": "confidential", "category": "secrecy", "risk": "Restricting out-of-band communication"},
    {"phrase": "otp", "category": "credential", "risk": "One-Time Password extraction attempt"},
    {"phrase": "password", "category": "credential", "risk": "Authentication bypass attempt"},
    {"phrase": "pin", "category": "credential", "risk": "Security credential demand"},
    {"phrase": "routing number", "category": "financial", "risk": "Direct deposit / payment hijacking"},
]

class IntentDetectionService:
    """
    Speech Recognition & Intent Detection Interface.
    
    Proposed Technology Stack:
    - OpenAI Whisper / Whisper-large-v3 / Distil-Whisper for automated speech recognition (ASR)
    - Semantic intent classifier / zero-shot LLM intent extraction
    
    Current State:
    - Service Interface & Contract defined.
    - Rule-based lexicon and regex pattern matching for fast, explainable social engineering detection.
    """

    def detect_intent(
        self,
        transcript: Optional[str] = None,
        requested_action: str = "General Conversation",
        urgency: str = "Standard"
    ) -> IntentDetails:
        text = transcript or ""
        lower_text = text.lower()
        
        detected_phrases: List[Dict[str, Any]] = []
        for pattern in SENSITIVE_KEYWORD_PATTERNS:
            if pattern["phrase"] in lower_text:
                detected_phrases.append({
                    "phrase": pattern["phrase"],
                    "category": pattern["category"],
                    "risk_rationale": pattern["risk"]
                })

        coercion_detected = (
            urgency in ("Urgent", "Emergency") or
            any(p["category"] == "urgency" for p in detected_phrases)
        )
        
        secrecy_demand = any(p["category"] == "secrecy" for p in detected_phrases)

        # Classify primary intent
        primary_intent = "Routine Conversational Inquiry"
        if "transfer" in lower_text or "money" in lower_text or "financial" in requested_action.lower():
            primary_intent = "Outbound Wire / Capital Transfer Solicitation"
        elif "otp" in lower_text or "password" in lower_text or "credential" in requested_action.lower():
            primary_intent = "Credential & Dual-Factor Authentication Interception"
        elif "account" in requested_action.lower():
            primary_intent = "Account Profile & Routing Modification"
        elif coercion_detected:
            primary_intent = "High-Pressure Coercive Verification Evasion"

        return IntentDetails(
            primary_intent=primary_intent,
            detected_phrases=detected_phrases,
            coercion_detected=coercion_detected,
            secrecy_demand=secrecy_demand
        )

intent_detection_service = IntentDetectionService()
