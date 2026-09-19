# VEYRiX — AI-Powered Voice Impersonation & Scam Defense Backend

The VEYRiX backend is a lightweight, high-performance Python FastAPI service implementing the **Action-Bound Risk Engine** for real-time voice scam and deepfake defense.

> **Core Philosophy**: *"Trust is assigned to the action — not to the voice alone."*  
> Even if a synthetic voice perfectly matches an authorized speaker's biometrics, irreversible actions (e.g. wire transfers, OTP disclosure, account routing changes) require mandatory step-up verification.

---

## Architecture Overview

```
VOICE INPUT (WAV / PCM / WebM)
          ↓
[Voice Authenticity]  +  [Speaker Identity]  +  [Liveness / Replay]
   (AASIST / Wav2Vec2)      (ECAPA-TDNN)         (Channel Drift)
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ↓
                     [Speech Recognition & Intent]
                         (Whisper + Lexicon)
                                 ↓
                         [Action Risk Model]
                     (Sensitivity & Urgency Weights)
                                 ↓
                     [Corporate Policy & RAG]
                     (Security Rules & Mitigations)
                                 ↓
                     [Multi-Modal Risk Fusion]
                                 ↓
                       [ALLOW / VERIFY / HOLD]
```

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entry & CORS middleware
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py           # GET  /api/v1/health
│   │   │   ├── analysis.py         # POST /api/v1/analyze, POST /api/v1/risk/evaluate
│   │   │   ├── voice.py            # POST /api/v1/voice/verify
│   │   │   └── incidents.py        # GET  /api/v1/incidents, GET /api/v1/incidents/{id}
│   │   └── router.py               # Combined API v1 router
│   │
│   ├── core/
│   │   ├── config.py               # Settings & environment configuration
│   │   └── security.py             # Session IDs and security validation
│   │
│   ├── schemas/                    # Pydantic schemas (typed API contracts)
│   │   ├── audio.py
│   │   ├── analysis.py
│   │   ├── risk.py
│   │   ├── voice_profile.py
│   │   └── incident.py
│   │
│   ├── services/                   # Modular service architecture
│   │   ├── audio_service.py        # Audio ingestion & validation (ephemeral)
│   │   ├── voice_authenticity.py   # Proposed: AASIST / Wav2Vec2 interface
│   │   ├── speaker_verification.py # Proposed: ECAPA-TDNN interface
│   │   ├── intent_detection.py     # Proposed: Whisper + Social engineering detector
│   │   ├── risk_engine.py          # Action-Bound Multi-Modal Risk Fusion
│   │   ├── policy_engine.py        # Proposed: RAG / Corporate Security Rules
│   │   └── analysis_service.py     # Pipeline orchestrator
│   │
│   ├── models/                     # ORM models placeholder for future PostgreSQL
│   │   └── __init__.py
│   │
│   └── utils/
│       ├── audio.py                # Audio heuristics and PCM stats
│       └── logging.py              # Structured logging utility
│
├── tests/
│   ├── test_health.py              # Unit tests for health endpoint
│   ├── test_analysis.py            # Unit tests for analysis pipeline
│   └── test_risk.py                # Unit tests for action-bound risk logic
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status and enabled AI pipelines |
| `POST` | `/api/v1/analyze` | Full multi-modal voice & action risk assessment |
| `POST` | `/api/v1/voice/verify` | Speaker biometric identity comparison |
| `POST` | `/api/v1/intent/analyze` | Coercive urgency, secrecy, and sensitive phrase detection |
| `POST` | `/api/v1/risk/evaluate` | Standalone action-bound risk calculation |
| `GET` | `/api/v1/incidents` | Incident history and audit trail |
| `GET` | `/api/v1/incidents/{id}` | Detailed forensic record for single incident |

### Standard Analysis Response Schema

```json
{
  "request_id": "vx_req_a1b2c3d4e5f6",
  "risk_score": 92,
  "risk_level": "HIGH",
  "recommendation": "HOLD",
  "voice_authenticity": {
    "synthetic_probability": 84.5,
    "status": "High Synthetic / Cloned Probability",
    "model": "AASIST / Wav2Vec2 (Proposed Interface)",
    "artifacts_detected": ["Synthetic neural vocoder artifacts detected"]
  },
  "speaker_match": {
    "matched": false,
    "similarity_score": 38.5,
    "status": "Significant Biometric Mismatch",
    "model": "ECAPA-TDNN (Proposed Interface)"
  },
  "liveness": {
    "replay_probability": 12.0,
    "channel_drift_score": 22.0,
    "liveness_confirmed": true
  },
  "intent": {
    "primary_intent": "Outbound Wire / Capital Transfer Solicitation",
    "detected_phrases": [
      {"phrase": "transfer the money", "category": "financial", "risk_rationale": "Financial capital transfer request"}
    ],
    "coercion_detected": true,
    "secrecy_demand": true
  },
  "action_risk": {
    "action_type": "Urgent Money Transfer",
    "base_weight": 85,
    "urgency_multiplier": 1.35,
    "caller_suspicion_multiplier": 1.2,
    "critical_risk": true
  },
  "policy_check": {
    "policy_code": "POL-FIN-01",
    "policy_rule": "External wire transfers exceeding $10,000 require independent dual-authorization.",
    "is_violated": true,
    "recommended_mitigation": "Hold transaction until out-of-band supervisor callback."
  },
  "reasons": [
    "High-impact action requested: Urgent Money Transfer under urgency coercion",
    "Synthetic voice indicators detected (84.5% probability)",
    "Violates POL-FIN-01: External wire transfers require dual-key verification"
  ],
  "immediate_steps": [
    "Stop immediately. Do not release funds or disclose OTPs.",
    "Hang up the call. Do not negotiate.",
    "Perform an independent callback using the contact's verified corporate directory number."
  ],
  "demo_mode": true
}
```

---

## How to Run

### 1. Setup Python Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` to configure port and CORS origins if needed.

### 3. Start the FastAPI Dev Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger API docs will be available at: `http://localhost:8000/docs`.

### 4. Run Unit Tests

```bash
python3 tests/test_health.py
python3 tests/test_analysis.py
python3 tests/test_risk.py
```

---

## AI Implementation Status

- **Currently Implemented (Demo/Simulation Tier)**:
  - Statistical feature evaluation (pitch stability, spectral roll-off, zero-crossing rate from client/Web Audio API).
  - Rule-based conversational intent & social engineering lexicon analysis.
  - Action-Bound Risk Fusion engine with context, urgency, and caller suspicion modifiers.
  - Corporate Security Policy engine with policy check and mitigation advice.
  - Ephemeral in-memory audio processing (zero permanent storage).

- **Proposed / Future AI Pipeline (Pluggable Interfaces)**:
  - **AASIST & Wav2Vec2**: Deep learning neural vocoder artifact detection.
  - **ECAPA-TDNN**: 192-dimensional biometric speaker embeddings and cosine verification.
  - **OpenAI Whisper**: Automatic speech-to-text transcription.
  - **ChromaDB / pgvector**: Dynamic RAG corporate policy retrieval.
  - **WebSocket Pipeline**: Continuous streaming audio analysis for live call centers.
