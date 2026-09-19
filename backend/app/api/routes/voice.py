from typing import Dict, Any
try:
    from fastapi import APIRouter
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs):
            self.routes = []
        def post(self, *args, **kwargs):
            def decorator(f): return f
            return decorator

from backend.app.schemas.voice_profile import VoiceVerificationRequest, VoiceVerificationResult
from backend.app.services.speaker_verification import speaker_verification_service

router = APIRouter(prefix="/voice", tags=["Voice Biometrics"])

@router.post("/verify", response_model=VoiceVerificationResult)
def verify_voice_speaker(req: VoiceVerificationRequest):
    """
    Verifies audio snippet against an enrolled voice profile.
    Proposed model: ECAPA-TDNN with cosine distance scoring.
    """
    return speaker_verification_service.verify_request(
        profile_id=req.profile_id,
        audio_file_name=req.audio_file_name
    )
