import os
from typing import List

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "VEYRiX Voice Defense Core")
    VERSION: str = "1.0.0-prototype"
    DESCRIPTION: str = (
        "AI-Powered Voice Impersonation & Scam Defense Backend. "
        "SIH26104 Prototype architecture with Action-Bound Risk Engine."
    )
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # CORS configuration - safe for local Vite development & cloud preview
    raw_cors: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.raw_cors:
            return ["http://localhost:3000", "http://localhost:5173"]
        return [origin.strip() for origin in self.raw_cors.split(",") if origin.strip()]

    # AI Model Pipeline flags (Proposed Interfaces)
    VOICE_AUTHENTICITY_BACKEND: str = os.getenv("VOICE_AUTHENTICITY_BACKEND", "simulation")
    SPEAKER_VERIFICATION_BACKEND: str = os.getenv("SPEAKER_VERIFICATION_BACKEND", "simulation")
    SPEECH_RECOGNITION_BACKEND: str = os.getenv("SPEECH_RECOGNITION_BACKEND", "simulation")
    POLICY_RAG_BACKEND: str = os.getenv("POLICY_RAG_BACKEND", "simulation")

    # API Keys / Secrets (Server-side only)
    API_SECRET_KEY: str = os.getenv("API_SECRET_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
