from typing import List, Optional
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

class RiskEvaluationRequest(BaseModel):
    caller_type: str = Field(default="Unknown Number", description="Caller identity category")
    requested_action: str = Field(default="General Conversation", description="Sensitivity of action requested")
    urgency_level: str = Field(default="Standard", description="Standard, Urgent, or Emergency")
    has_reference_voice: bool = Field(default=False, description="Whether an enrolled voice profile exists")
    synthetic_probability: Optional[float] = Field(default=None, description="Pre-computed or measured synthetic score [0..100]")
    replay_probability: Optional[float] = Field(default=None, description="Pre-computed or measured replay score [0..100]")
    speaker_similarity: Optional[float] = Field(default=None, description="Speaker match score [0..100]")
    transcript: Optional[str] = Field(default=None, description="Recognized speech transcript")

class ActionRiskDetails(BaseModel):
    action_type: str = Field(description="Normalized action type")
    base_weight: int = Field(description="Risk weight for requested action [0..100]")
    urgency_multiplier: float = Field(default=1.0, description="Urgency scaling factor")
    caller_suspicion_multiplier: float = Field(default=1.0, description="Caller context scaling factor")
    critical_risk: bool = Field(default=False, description="Whether action requires mandatory dual-authorization")

class PolicyCheckResult(BaseModel):
    policy_code: str = Field(default="POL-SEC-01", description="Matched corporate security policy rule")
    policy_rule: str = Field(description="Policy statement text")
    is_violated: bool = Field(default=False, description="Whether the requested action violates policy")
    recommended_mitigation: str = Field(description="Mitigation action required by policy")
