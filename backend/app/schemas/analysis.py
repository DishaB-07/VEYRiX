from typing import List, Optional, Dict, Any
try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self, *args, **kwargs):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        def model_dump(self, *args, **kwargs):
            return self.dict()
    def Field(default=None, **kwargs):
        return default

from backend.app.schemas.audio import AudioMetadata
from backend.app.schemas.risk import ActionRiskDetails, PolicyCheckResult

class AnalysisRequest(BaseModel):
    audio_file_name: Optional[str] = Field(default="sample_call.wav", description="Audio file reference")
    audio_data_base64: Optional[str] = Field(default=None, description="Optional raw base64 PCM/WAV payload")
    caller_type: str = Field(default="Unknown Number", description="Caller category")
    requested_action: str = Field(default="General Conversation", description="Action requested during call")
    urgency: str = Field(default="Standard", description="Standard, Urgent, or Emergency")
    channel: str = Field(default="Cellular / PSTN", description="Transmission channel")
    trusted_profile_id: Optional[str] = Field(default=None, description="Enrolled profile to match against")
    transcript: Optional[str] = Field(default=None, description="Optional speech transcript")
    metrics: Optional[Dict[str, Any]] = Field(default=None, description="Client-extracted acoustic features")

class VoiceAuthenticityDetails(BaseModel):
    synthetic_probability: float = Field(description="Percentage probability audio is synthetic [0..100]")
    status: str = Field(description="Natural Speech / Suspect Synthetic / Verified Natural")
    model: str = Field(default="AASIST / Wav2Vec2 (Proposed Interface)")
    artifacts_detected: List[str] = Field(default_factory=list)

class SpeakerMatchDetails(BaseModel):
    matched: bool = Field(description="Whether speaker matches claimed enrolled identity")
    similarity_score: Optional[float] = Field(default=None, description="Similarity score [0..100]")
    status: str = Field(description="Match / Mismatch / Unenrolled Baseline")
    model: str = Field(default="ECAPA-TDNN (Proposed Interface)")

class LivenessDetails(BaseModel):
    replay_probability: float = Field(description="Replay attack probability [0..100]")
    channel_drift_score: float = Field(default=15.0, description="Acoustic drift score [0..100]")
    liveness_confirmed: bool = Field(default=True, description="Whether liveness signals pass threshold")

class IntentDetails(BaseModel):
    primary_intent: str = Field(description="Categorized primary intent")
    detected_phrases: List[Dict[str, Any]] = Field(default_factory=list, description="Flagged coercion/secrecy phrases")
    coercion_detected: bool = Field(default=False)
    secrecy_demand: bool = Field(default=False)

class AnalysisResponse(BaseModel):
    """
    Standard VEYRiX Core API Response Contract.
    Conforms strictly to the architectural specifications.
    """
    request_id: str = Field(description="Unique tracking ID for this analysis")
    risk_score: int = Field(description="Composite risk score [0..100]")
    risk_level: str = Field(description="LOW, MEDIUM, or HIGH")
    recommendation: str = Field(description="ALLOW, VERIFY, or HOLD")
    voice_authenticity: Optional[VoiceAuthenticityDetails] = Field(default=None)
    speaker_match: Optional[SpeakerMatchDetails] = Field(default=None)
    liveness: Optional[LivenessDetails] = Field(default=None)
    intent: Optional[IntentDetails] = Field(default=None)
    action_risk: Optional[ActionRiskDetails] = Field(default=None)
    policy_check: Optional[PolicyCheckResult] = Field(default=None)
    reasons: List[str] = Field(default_factory=list, description="Plain-language justification for risk decision")
    immediate_steps: List[str] = Field(default_factory=list, description="Concrete immediate human safety steps")
    demo_mode: bool = Field(default=True, description="Indicates simulation/demo tier vs hardware-accelerated model")
