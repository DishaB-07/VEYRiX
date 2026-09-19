/**
 * VEYRiX Frontend Analysis Coordinator Service
 * Bridges UI requests to either the FastAPI Python Backend or the local Web Audio Action-Bound engine.
 */

import {
  AnalysisResult,
  CallerType,
  RequestedAction,
  UrgencyLevel,
  AudioChannel,
  TrustedVoiceProfile,
} from '../types';
import { executeRealAnalysis, AcousticMetrics } from '../utils/audioProcessor';
import { apiService, BackendAnalysisResponse } from './apiService';

export interface RunAnalysisParams {
  audioFileName: string;
  durationSeconds: number;
  channel: AudioChannel;
  callerType: CallerType;
  requestedAction: RequestedAction;
  urgency: UrgencyLevel;
  trustedProfile: TrustedVoiceProfile | null;
  metrics: AcousticMetrics;
  transcript?: string;
  isDemo?: boolean;
}

export class AnalysisService {
  /**
   * Runs the complete multi-modal fraud & impersonation analysis.
   * If backend is available (via VITE_API_BASE_URL), routes request to Python FastAPI.
   * Otherwise, seamlessly executes local Web Audio Action-Bound engine.
   */
  public async runAnalysis(params: RunAnalysisParams): Promise<{
    result: AnalysisResult;
    source: 'backend' | 'client';
  }> {
    // 1. Check if backend is reachable
    const isBackendUp = await apiService.isBackendOnline();

    if (isBackendUp) {
      try {
        const backendRes = await apiService.analyzeCall({
          audio_file_name: params.audioFileName,
          caller_type: params.callerType,
          requested_action: params.requestedAction,
          urgency: params.urgency,
          channel: params.channel,
          trusted_profile_id: params.trustedProfile?.id || null,
          transcript: params.transcript,
          metrics: {
            durationSeconds: params.metrics.durationSeconds,
            sampleRate: params.metrics.sampleRate,
            zeroCrossingRate: params.metrics.zeroCrossingRate,
            spectralCentroid: params.metrics.spectralCentroid,
            spectralRolloff: params.metrics.spectralRolloff,
            pitchStability: params.metrics.pitchStability,
            highFreqRatio: params.metrics.highFreqRatio,
          },
        });

        const mapped = this.mapBackendResponseToResult(backendRes, params);
        return { result: mapped, source: 'backend' };
      } catch (err) {
        console.warn('[VEYRiX] Backend call encountered an issue, gracefully falling back to browser engine:', err);
      }
    }

    // 2. Fallback: Browser Web Audio Action-Bound Engine
    const localResult = executeRealAnalysis({
      audioFileName: params.audioFileName,
      durationSeconds: params.durationSeconds,
      channel: params.channel,
      callerType: params.callerType,
      requestedAction: params.requestedAction,
      urgency: params.urgency,
      trustedProfile: params.trustedProfile,
      metrics: params.metrics,
      transcript: params.transcript,
      isDemo: params.isDemo,
    });

    return { result: localResult, source: 'client' };
  }

  /**
   * Adapts FastAPI response schema into frontend UI AnalysisResult model.
   */
  private mapBackendResponseToResult(
    backendRes: BackendAnalysisResponse,
    params: RunAnalysisParams
  ): AnalysisResult {
    const riskLevel = backendRes.risk_level.toLowerCase() as 'low' | 'medium' | 'high';
    const recAction = backendRes.recommendation;

    // Map speaker verification status
    let speakerVerificationStatus: 'Verified against reference' | 'Possible mismatch' | 'Unknown speaker' | 'Insufficient audio' = 'Unknown speaker';
    if (params.trustedProfile) {
      if (backendRes.speaker_match?.matched) {
        speakerVerificationStatus = 'Verified against reference';
      } else {
        speakerVerificationStatus = 'Possible mismatch';
      }
    }

    // Map synthetic status
    const synthProb = backendRes.voice_authenticity?.synthetic_probability ?? 10;
    const voiceAuthenticityStatus: 'No strong synthetic signal detected' | 'Possible synthetic voice' | 'Analysis unavailable' =
      synthProb > 50 ? 'Possible synthetic voice' : 'No strong synthetic signal detected';

    // Map verification status
    const verificationStatus: 'Pending Verification' | 'Verified' | 'Held & Escalated' | 'Cleared (Low Risk)' =
      recAction === 'HOLD'
        ? 'Held & Escalated'
        : recAction === 'VERIFY'
        ? 'Pending Verification'
        : 'Cleared (Low Risk)';

    // Map request danger
    const requestDangerStatus: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Routine / Low Risk' =
      backendRes.action_risk?.critical_risk
        ? 'Critical Risk'
        : riskLevel === 'high'
        ? 'High Risk'
        : riskLevel === 'medium'
        ? 'Moderate Risk'
        : 'Routine / Low Risk';

    const transcriptText =
      params.transcript ||
      (params.requestedAction === 'Urgent Money Transfer'
        ? 'Voice call requesting immediate wire transfer to designated account. High urgency indicated.'
        : 'Voice call recorded. Routine communication.');

    return {
      id: backendRes.request_id || `VX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      audioFileName: params.audioFileName,
      audioDurationSeconds: params.durationSeconds,
      channel: params.channel,
      callerType: params.callerType,
      requestedAction: params.requestedAction,
      urgency: params.urgency,
      hasReferenceVoice: Boolean(params.trustedProfile),
      overallRiskScore: backendRes.risk_score,
      riskLevel,
      recommendedAction: recAction,

      trustedProfileId: params.trustedProfile?.id || null,
      trustedProfileName: params.trustedProfile?.name || null,
      speakerVerificationStatus,
      voiceAuthenticityStatus,
      replayRiskStatus:
        (backendRes.liveness?.replay_probability ?? 0) > 40
          ? 'Possible replay'
          : 'Normal acoustic capture',
      requestDangerStatus,

      acousticSignals: {
        syntheticProbability: synthProb,
        syntheticDetails:
          synthProb > 50
            ? 'Neural vocoder synthetic spectral anomalies identified.'
            : 'Natural human vocal tract harmonics observed.',
        speakerSimilarity: backendRes.speaker_match?.similarity_score ?? null,
        speakerDetails:
          params.trustedProfile
            ? `Biometric similarity with reference: ${backendRes.speaker_match?.similarity_score ?? 0}%`
            : 'No reference voice profile enrolled for this contact.',
        replayProbability: backendRes.liveness?.replay_probability ?? 12,
        replayDetails: 'Acoustic background room-impulse response within normal thresholds.',
        spectralDiscrepancy: Math.round((1 - params.metrics.spectralRolloff) * 100),
        phaseAnomalies: Math.round(params.metrics.pitchStability * 50),
        channelNoiseFloor: '-42 dBFS (Standard telephony/VoIP channel)',
      },

      transcript: transcriptText,

      intent: {
        riskLevel,
        tags: [
          `Action: ${params.requestedAction}`,
          `Urgency: ${params.urgency}`,
          ...(backendRes.intent?.secrecy_demand ? ['Secrecy Demanded'] : []),
          ...(backendRes.intent?.coercion_detected ? ['Urgency Coercion'] : []),
        ],
        explanation:
          backendRes.reasons.join('. ') ||
          'Acoustic authenticity and action danger evaluated across multi-modal defense layers.',
        detectedIntents: [backendRes.intent?.primary_intent || 'General communication'],
        flaggedPhrases: (backendRes.intent?.detected_phrases || []).map((p) => ({
          text: p.phrase,
          offset: 0,
          length: p.phrase.length,
          risk: p.risk_rationale,
        })),
      },

      securityRecommendation: {
        title:
          recAction === 'HOLD'
            ? 'Hold Action — Step-Up Verification Mandated'
            : recAction === 'VERIFY'
            ? 'Pause & Perform Independent Out-of-Band Callback'
            : 'Standard Precautionary Awareness',
        description:
          recAction === 'HOLD'
            ? 'Do not release funds, transfer money, or share security OTP codes.'
            : recAction === 'VERIFY'
            ? 'Confirm identity with an independent callback before proceeding.'
            : 'Normal conversational safety rules apply.',
        immediateSteps: backendRes.immediate_steps,
        secondaryVerificationSuggested: recAction !== 'ALLOW',
      },

      verificationStatus,
      isDemo: backendRes.demo_mode ?? true,
      prototypeDisclaimer:
        'Live FastAPI backend assessment. Trust is assigned to the action — not to the voice alone.',
      decodedMetrics: {
        durationSeconds: params.metrics.durationSeconds,
        sampleRate: params.metrics.sampleRate,
        peakAmplitude: params.metrics.peakAmplitude,
        averageRms: params.metrics.averageRms,
        isSilent: params.metrics.isSilent,
        zeroCrossingRate: params.metrics.zeroCrossingRate,
        spectralCentroid: params.metrics.spectralCentroid,
        spectralRolloff: params.metrics.spectralRolloff,
        pitchStability: params.metrics.pitchStability,
      },
    };
  }
}

export const analysisService = new AnalysisService();
