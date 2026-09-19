/**
 * VEYRiX Frontend API Service
 * Centralized abstraction for all communication with the VEYRiX FastAPI Backend.
 *
 * Architecture:
 * React UI -> apiService.ts -> FastAPI (/api/v1/...) -> Analysis Service -> Risk Fusion
 */

import {
  AnalysisResult,
  AudioChannel,
  CallerType,
  RequestedAction,
  UrgencyLevel,
  RiskLevel,
  RecommendedAction,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  ai_pipeline: {
    voice_authenticity: string;
    speaker_verification: string;
    speech_recognition: string;
    policy_rag: string;
  };
  storage: string;
  action_bound_defense: string;
}

export interface BackendAnalysisRequest {
  audio_file_name?: string;
  audio_data_base64?: string;
  caller_type: CallerType;
  requested_action: RequestedAction;
  urgency: UrgencyLevel;
  channel: AudioChannel;
  trusted_profile_id?: string | null;
  transcript?: string;
  metrics?: Record<string, unknown>;
}

export interface BackendAnalysisResponse {
  request_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'ALLOW' | 'VERIFY' | 'HOLD';
  voice_authenticity?: {
    synthetic_probability: number;
    status: string;
    model: string;
    artifacts_detected: string[];
  } | null;
  speaker_match?: {
    matched: boolean;
    similarity_score: number | null;
    status: string;
    model: string;
  } | null;
  liveness?: {
    replay_probability: number;
    channel_drift_score: number;
    liveness_confirmed: boolean;
  } | null;
  intent?: {
    primary_intent: string;
    detected_phrases: Array<{ phrase: string; category: string; risk_rationale: string }>;
    coercion_detected: boolean;
    secrecy_demand: boolean;
  } | null;
  action_risk?: {
    action_type: string;
    base_weight: number;
    urgency_multiplier: number;
    caller_suspicion_multiplier: number;
    critical_risk: boolean;
  } | null;
  policy_check?: {
    policy_code: string;
    policy_rule: string;
    is_violated: boolean;
    recommended_mitigation: string;
  } | null;
  reasons: string[];
  immediate_steps: string[];
  demo_mode?: boolean;
}

export interface BackendVoiceVerifyRequest {
  profile_id?: string | null;
  audio_file_name?: string;
  channel?: string;
}

export interface BackendVoiceVerifyResponse {
  matched: boolean;
  similarity_score: number;
  status: string;
  confidence: string;
  model_name: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Returns whether a custom backend base URL is configured.
   */
  public hasConfiguredBackend(): boolean {
    return Boolean(this.baseUrl);
  }

  /**
   * Health check endpoint: GET /api/v1/health
   */
  public async checkHealth(): Promise<BackendHealthResponse> {
    const url = `${this.baseUrl}/api/v1/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Health check failed with HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Quick non-blocking probe to verify backend reachability.
   */
  public async isBackendOnline(): Promise<boolean> {
    if (!this.hasConfiguredBackend()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${this.baseUrl}/api/v1/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Multi-modal Voice & Action Analysis: POST /api/v1/analyze
   */
  public async analyzeCall(req: BackendAnalysisRequest): Promise<BackendAnalysisResponse> {
    const url = `${this.baseUrl}/api/v1/analyze`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Analysis request failed [${response.status}]: ${errorText || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Speaker Biometric Verification: POST /api/v1/voice/verify
   */
  public async verifyVoice(req: BackendVoiceVerifyRequest): Promise<BackendVoiceVerifyResponse> {
    const url = `${this.baseUrl}/api/v1/voice/verify`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(`Voice verification failed with HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Intent & Coercion Analysis: POST /api/v1/intent/analyze
   */
  public async analyzeIntent(payload: {
    transcript?: string;
    requested_action?: string;
    urgency?: string;
  }) {
    const url = `${this.baseUrl}/api/v1/intent/analyze`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Intent analysis failed with HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get Recent Incidents: GET /api/v1/incidents
   */
  public async getIncidents() {
    const url = `${this.baseUrl}/api/v1/incidents`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve incidents: HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get Single Incident: GET /api/v1/incidents/{id}
   */
  public async getIncident(incidentId: string) {
    const url = `${this.baseUrl}/api/v1/incidents/${encodeURIComponent(incidentId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve incident '${incidentId}': HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
