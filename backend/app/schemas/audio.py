from typing import Optional
try:
    from pydantic import BaseModel, Field
except ImportError:
    # Lightweight fallback if pydantic is not yet installed in standard environment
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

class AudioMetadata(BaseModel):
    file_name: str = Field(default="recorded_audio.wav", description="Name of the audio file")
    file_size_bytes: int = Field(default=0, description="Size of the audio stream in bytes")
    duration_seconds: float = Field(default=0.0, description="Duration in seconds")
    sample_rate: int = Field(default=16000, description="Audio sample rate (Hz)")
    channels: int = Field(default=1, description="Number of audio channels")
    format: str = Field(default="wav", description="Audio container format (wav, mp3, webm, m4a)")
    peak_amplitude: Optional[float] = Field(default=None, description="Max PCM amplitude [0..1]")
    rms_energy: Optional[float] = Field(default=None, description="RMS energy value")

class AudioUploadResponse(BaseModel):
    status: str = Field(default="received")
    audio_id: str = Field(description="Unique temporary audio processing identifier")
    metadata: AudioMetadata
    message: str = Field(default="Audio received for processing; no permanent storage enabled")
