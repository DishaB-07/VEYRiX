from typing import Optional, List
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

class VoiceProfile(BaseModel):
    profile_id: str = Field(description="Unique profile ID for enrolled voice")
    speaker_name: str = Field(description="Name or title of authorized speaker")
    organization_role: Optional[str] = Field(default="Executive", description="Role/authority level")
    embedding_dimension: int = Field(default=192, description="Speaker embedding dimension (e.g. ECAPA-TDNN)")
    enrolled_samples_count: int = Field(default=1, description="Number of enrolled audio samples")
    is_active: bool = Field(default=True, description="Whether profile is currently active")

class VoiceVerificationRequest(BaseModel):
    profile_id: Optional[str] = Field(default=None, description="Enrolled profile to compare against")
    audio_data_base64: Optional[str] = Field(default=None, description="Base64 encoded audio snippet (optional)")
    audio_file_name: Optional[str] = Field(default=None, description="Name of uploaded audio snippet")
    channel: str = Field(default="Cellular / PSTN", description="Transmission medium")

class VoiceVerificationResult(BaseModel):
    matched: bool = Field(description="Whether the speaker matches enrolled profile")
    similarity_score: float = Field(description="Confidence percentage [0..100]")
    status: str = Field(description="Verified Match / Unverified / Significant Mismatch")
    confidence: str = Field(default="HIGH", description="LOW, MEDIUM, HIGH")
    model_name: str = Field(default="ECAPA-TDNN (Proposed Interface)", description="Underlying or proposed model")
