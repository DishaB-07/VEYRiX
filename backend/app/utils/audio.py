import io
import math
from typing import Dict, Any

def compute_basic_pcm_stats(raw_bytes: bytes) -> Dict[str, Any]:
    """
    Computes rudimentary energy and zero-crossing heuristics directly from raw byte stream.
    Future upgrade: torchaudio.load() or librosa.feature.
    """
    length = len(raw_bytes)
    if length == 0:
        return {"rms": 0.0, "peak": 0.0, "is_silent": True}
    
    # Fast 8-bit or 16-bit PCM sampling estimate
    sample_step = max(1, length // 2000)
    samples = [b for i, b in enumerate(raw_bytes[::sample_step])]
    
    if not samples:
        return {"rms": 0.0, "peak": 0.0, "is_silent": True}
        
    peak = max(samples) / 255.0
    sum_sq = sum((s - 128) ** 2 for s in samples)
    rms = math.sqrt(sum_sq / len(samples)) / 128.0
    
    return {
        "rms": round(rms, 4),
        "peak": round(peak, 4),
        "is_silent": rms < 0.01
    }
