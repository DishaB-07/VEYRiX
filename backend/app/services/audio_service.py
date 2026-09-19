import os
import uuid
from typing import Tuple, Optional
from backend.app.schemas.audio import AudioMetadata

class AudioService:
    """
    Handles audio ingestion, format validation, and feature extraction.
    NOTE: Audio is processed ephemerally in memory; no permanent audio storage is retained by default.
    """
    MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg"}

    def validate_audio(self, filename: str, content_length: int) -> Tuple[bool, Optional[str]]:
        if content_length > self.MAX_FILE_SIZE:
            return False, f"Audio file exceeds maximum size of {self.MAX_FILE_SIZE // (1024*1024)}MB"
        
        _, ext = os.path.splitext(filename.lower())
        if ext and ext not in self.ALLOWED_EXTENSIONS:
            return False, f"Unsupported audio format '{ext}'. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}"
        
        return True, None

    def extract_metadata(self, filename: str, raw_bytes: bytes) -> AudioMetadata:
        """
        Extracts basic stream metadata from raw audio payload.
        In a full PyTorch runtime, torchaudio.load() or soundfile parses the PCM headers.
        """
        size_bytes = len(raw_bytes)
        # Approximate duration estimation for demo fallback if headers are raw
        approx_seconds = max(1.0, round(size_bytes / (16000 * 2), 2)) if size_bytes > 0 else 5.0
        
        return AudioMetadata(
            file_name=filename or "captured_voice.wav",
            file_size_bytes=size_bytes,
            duration_seconds=approx_seconds,
            sample_rate=16000,
            channels=1,
            format=os.path.splitext(filename)[1].lstrip(".") or "wav"
        )

audio_service = AudioService()
