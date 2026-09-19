from typing import Optional, List, Dict, Any
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

class IncidentRecordSchema(BaseModel):
    id: str = Field(description="Incident reference identifier")
    timestamp: str = Field(description="ISO or formatted string timestamp")
    audio_source: str = Field(description="Audio file or stream source")
    caller_type: str = Field(description="Caller category")
    risk_score: int = Field(description="Risk score [0..100]")
    risk_level: str = Field(description="low, medium, or high")
    main_signal: str = Field(description="Primary indicator summary")
    recommended_action: str = Field(description="ALLOW, VERIFY, or HOLD")
    verification_status: str = Field(default="Pending", description="Pending, Verified, or Held & Escalated")
    detection_type: str = Field(description="Scam vector or cleared status")
    reasons: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IncidentListResponse(BaseModel):
    total_count: int = Field(description="Total incidents recorded")
    incidents: List[IncidentRecordSchema] = Field(default_factory=list)
