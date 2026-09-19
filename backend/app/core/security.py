import hashlib
import hmac
import secrets
from typing import Optional
from backend.app.core.config import settings

def generate_request_id() -> str:
    """Generate a clean trace ID for audio analysis request."""
    return f"vx_req_{secrets.token_hex(6)}"

def generate_incident_id() -> str:
    """Generate a high-level incident case number."""
    return f"INC-{secrets.token_hex(4).upper()}"

def verify_api_key(provided_key: Optional[str]) -> bool:
    """
    Validates optional server-to-server API key.
    If no key is configured in settings, requests are allowed in development.
    """
    if not settings.API_SECRET_KEY:
        return True
    if not provided_key:
        return False
    return hmac.compare_digest(provided_key, settings.API_SECRET_KEY)
