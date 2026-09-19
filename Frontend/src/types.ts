export type RiskLevel = 'low' | 'medium' | 'high';
export type RecommendedAction = 'ALLOW' | 'VERIFY' | 'HOLD';

export type CallerType =
  | 'Known Contact'
  | 'Unknown Number'
  | 'Customer Support'
  | 'Executive / Manager'
  | 'Family Member';

export type RequestedAction =
  | 'General Conversation'
  | 'OTP Request'
  | 'Password Reset'
  | 'Payment Request'
  | 'Account Detail Change'
  | 'Urgent Money Transfer'
  | 'Confidential Information Request';

export type UrgencyLevel = 'Normal' | 'Urgent' | 'Emergency';

export type AudioChannel =
  | 'Uploaded Audio'
  | 'Recorded Microphone Audio'
  | 'Recorded Simulated Voice'
  | 'Demo Live Stream';

export interface SensitiveKeyword {
  phrase: string;
  category: 'financial' | 'urgency' | 'secrecy' | 'credential' | 'authority';
  severity: 'low' | 'medium' | 'high';
}

export interface AcousticSignals {
  syntheticProbability: number; // 0 - 100
  syntheticDetails: string;
  speakerSimilarity: number | null; // null if no reference voice
  speakerDetails: string;
  replayProbability: number; // 0 - 100
  replayDetails: string;
  spectralDiscrepancy: number; // 0 - 100
  phaseAnomalies: number; // 0 - 100
  channelNoiseFloor: string;
}

export interface IntentAnalysis {
  riskLevel: RiskLevel;
  tags: string[];
  explanation: string;
  detectedIntents: string[];
  flaggedPhrases: { text: string; offset: number; length: number; risk: string }[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  audioFileName: string;
  audioDurationSeconds: number;
  channel: AudioChannel;
  callerType: CallerType;
  requestedAction: RequestedAction;
  urgency: UrgencyLevel;
  hasReferenceVoice: boolean;
  
  overallRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  
  acousticSignals: AcousticSignals;
  transcript: string;
  intent: IntentAnalysis;
  
  securityRecommendation: {
    title: string;
    description: string;
    immediateSteps: string[];
    secondaryVerificationSuggested: boolean;
  };
  
  verificationStatus: 'Pending Verification' | 'Verified' | 'Held & Escalated' | 'Cleared (Low Risk)';
  isDemo: boolean;
  
  // Honest analysis & profile fields
  trustedProfileId?: string | null;
  trustedProfileName?: string | null;
  speakerVerificationStatus: 'Verified against reference' | 'Possible mismatch' | 'Unknown speaker' | 'Insufficient audio';
  voiceAuthenticityStatus: 'No strong synthetic signal detected' | 'Possible synthetic voice' | 'Analysis unavailable';
  replayRiskStatus: 'Normal acoustic capture' | 'Possible replay' | 'Not evaluated';
  requestDangerStatus: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Routine / Low Risk';
  prototypeDisclaimer?: string;
  decodedMetrics?: {
    durationSeconds: number;
    sampleRate: number;
    peakAmplitude: number;
    averageRms: number;
    isSilent: boolean;
    zeroCrossingRate: number;
    spectralCentroid: number;
    spectralRolloff: number;
    pitchStability: number;
  };
}

export interface AcousticSignature {
  sampleRate: number;
  averageRms: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  spectralRolloff: number;
  pitchStability: number;
  duration: number;
}

export interface TrustedVoiceProfile {
  id: string;
  name: string;
  relationship: CallerType;
  createdDate: string;
  sampleDuration: number;
  sampleSource: 'microphone' | 'upload' | 'pre-enrolled';
  audioBlobUrl?: string;
  acousticSignature: AcousticSignature;
  notes?: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  audioSource: string;
  callerType: string;
  detectionType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  mainSignal: string;
  recommendedAction: RecommendedAction;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Held & Escalated' | 'Cleared (Low Risk)';
  details?: AnalysisResult;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  callerType: CallerType;
  requestedAction: RequestedAction;
  urgency: UrgencyLevel;
  hasReferenceVoice: boolean;
  transcript: string;
  syntheticScore: number;
  speakerScore: number | null;
  replayScore: number;
  overallScore: number;
  action: RecommendedAction;
}
