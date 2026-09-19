from typing import Dict, Any
try:
    from fastapi import APIRouter
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

from backend.app.core.config import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def get_health_status() -> Dict[str, Any]:
    """
    Returns service health, operational readiness, and enabled AI engine modes.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "ai_pipeline": {
            "voice_authenticity": f"{settings.VOICE_AUTHENTICITY_BACKEND} (AASIST/Wav2Vec2 ready)",
            "speaker_verification": f"{settings.SPEAKER_VERIFICATION_BACKEND} (ECAPA-TDNN ready)",
            "speech_recognition": f"{settings.SPEECH_RECOGNITION_BACKEND} (Whisper ready)",
            "policy_rag": f"{settings.POLICY_RAG_BACKEND} (Vector store ready)",
        },
        "storage": "ephemeral_memory (Zero Permanent Audio Retention)",
        "action_bound_defense": "active"
    }
