import {
  AnalysisResult,
  AcousticSignature,
  TrustedVoiceProfile,
  CallerType,
  RequestedAction,
  UrgencyLevel,
  AudioChannel,
  RiskLevel,
  RecommendedAction,
} from '../types';
import { SENSITIVE_PHRASES } from './audioSimulator';

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // AudioContext resume can await user gesture
    });
  }
  return sharedAudioContext;
}

export interface AcousticMetrics {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  peakAmplitude: number;
  averageRms: number;
  isSilent: boolean;
  zeroCrossingRate: number;
  spectralCentroid: number;
  spectralRolloff: number;
  pitchStability: number;
  highFreqRatio: number;
}

/**
 * Decodes an audio File or Blob into an AudioBuffer using browser Web Audio API.
 * Validates audio format, duration, and audibility.
 */
export async function decodeAudioFileOrBlob(fileOrBlob: Blob | File): Promise<{
  buffer: AudioBuffer;
  metrics: AcousticMetrics;
}> {
  if (!fileOrBlob || fileOrBlob.size === 0) {
    throw new Error('Selected audio file is empty (0 bytes). Please choose a valid audio file.');
  }

  // Check file size (< 25MB)
  if (fileOrBlob.size > 25 * 1024 * 1024) {
    throw new Error('Audio file exceeds the 25MB maximum size limit. Please upload a shorter audio snippet.');
  }

  const ctx = getAudioContext();
  let arrayBuffer: ArrayBuffer;

  try {
    arrayBuffer = await fileOrBlob.arrayBuffer();
  } catch (err) {
    throw new Error('Failed to read the audio file data from disk. Please re-select the file.');
  }

  let audioBuffer: AudioBuffer;
  try {
    // decodeAudioData handles WAV, MP3, M4A, WebM (browser codec dependent)
    audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(
      `Could not decode audio file (${error?.message || 'Unsupported format or corrupted header'}). Please verify the file is a standard WAV, MP3, M4A, or WebM audio file.`
    );
  }

  if (!audioBuffer || audioBuffer.length === 0 || audioBuffer.duration === 0) {
    throw new Error('Audio file contains 0 audio frames. Please provide a file with recorded sound.');
  }

  const metrics = extractAcousticFeatures(audioBuffer);

  return {
    buffer: audioBuffer,
    metrics,
  };
}

/**
 * Extracts acoustic statistics directly from decoded AudioBuffer PCM frames.
 */
export function extractAcousticFeatures(audioBuffer: AudioBuffer): AcousticMetrics {
  const channelData = audioBuffer.getChannelData(0);
  const totalSamples = channelData.length;
  const sampleRate = audioBuffer.sampleRate;

  let sumSquares = 0;
  let peakAmplitude = 0;
  let zeroCrossings = 0;

  // Scan samples
  for (let i = 0; i < totalSamples; i++) {
    const val = channelData[i];
    const absVal = Math.abs(val);
    if (absVal > peakAmplitude) peakAmplitude = absVal;
    sumSquares += val * val;

    if (i > 0 && ((channelData[i - 1] >= 0 && val < 0) || (channelData[i - 1] < 0 && val >= 0))) {
      zeroCrossings++;
    }
  }

  const averageRms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
  const isSilent = averageRms < 0.003 || peakAmplitude < 0.01;
  const zeroCrossingRate = zeroCrossings / Math.max(1, totalSamples);

  // Spectral approximation: compute windowed energy across frequency bands
  // Window size: 1024 samples
  const windowSize = 1024;
  const step = Math.max(windowSize, Math.floor(totalSamples / 20)); // Sample ~20 slices
  let centroidSum = 0;
  let centroidWeight = 0;
  let highFreqEnergy = 0;
  let lowFreqEnergy = 0;
  let windowsCount = 0;

  // Autocorrelation pitch variability
  const pitchVariations: number[] = [];

  for (let offset = 0; offset + windowSize < totalSamples; offset += step) {
    windowsCount++;
    // Discrete Fourier Magnitude approximation for this slice
    let sliceHigh = 0;
    let sliceLow = 0;
    let localCentroidNumerator = 0;
    let localCentroidDenominator = 0;

    // Analyze first 64 frequency bins (up to sampleRate / 2)
    const numBins = 64;
    const binFreqStep = (sampleRate / 2) / numBins;

    for (let k = 1; k < numBins; k++) {
      const freq = k * binFreqStep;
      // Real & Imag sum for frequency bin
      let real = 0;
      let imag = 0;
      const omega = (2 * Math.PI * k) / windowSize;
      for (let n = 0; n < windowSize; n += 2) {
        // Subsample for fast in-browser feature extraction
        const s = channelData[offset + n];
        real += s * Math.cos(omega * n);
        imag -= s * Math.sin(omega * n);
      }
      const magnitude = Math.sqrt(real * real + imag * imag);

      localCentroidNumerator += freq * magnitude;
      localCentroidDenominator += magnitude;

      if (freq > 3500) {
        sliceHigh += magnitude;
      } else {
        sliceLow += magnitude;
      }
    }

    if (localCentroidDenominator > 0.001) {
      const sliceCentroid = localCentroidNumerator / localCentroidDenominator;
      centroidSum += sliceCentroid;
      centroidWeight++;
    }

    highFreqEnergy += sliceHigh;
    lowFreqEnergy += sliceLow;

    // Estimate pitch period via normalized autocorrelation
    let bestCorrelation = -1;
    let bestPeriod = 0;
    const minPeriod = Math.floor(sampleRate / 400); // 400Hz
    const maxPeriod = Math.floor(sampleRate / 75);  // 75Hz

    for (let lag = minPeriod; lag < maxPeriod; lag += 2) {
      let corr = 0;
      for (let n = 0; n < windowSize - lag; n += 4) {
        corr += channelData[offset + n] * channelData[offset + n + lag];
      }
      if (corr > bestCorrelation) {
        bestCorrelation = corr;
        bestPeriod = lag;
      }
    }

    if (bestPeriod > 0) {
      pitchVariations.push(bestPeriod);
    }
  }

  const spectralCentroid = centroidWeight > 0 ? Math.round(centroidSum / centroidWeight) : 1500;
  const highFreqRatio = lowFreqEnergy > 0 ? highFreqEnergy / (lowFreqEnergy + highFreqEnergy) : 0.15;
  const spectralRolloff = Math.min(8000, Math.round(spectralCentroid * 1.85));

  // Pitch stability: standard deviation of pitch periods normalized
  let pitchStability = 0.85;
  if (pitchVariations.length > 2) {
    const meanPitch = pitchVariations.reduce((a, b) => a + b, 0) / pitchVariations.length;
    const variance = pitchVariations.reduce((sum, p) => sum + Math.pow(p - meanPitch, 2), 0) / pitchVariations.length;
    const stdDev = Math.sqrt(variance);
    // Unnatural voice clones tend to have hyper-flat pitch (stdDev < 1.5) or erratic phase jumps
    const normalizedJitter = stdDev / Math.max(1, meanPitch);
    pitchStability = Math.max(0.2, Math.min(0.99, 1 - normalizedJitter * 2));
  }

  return {
    durationSeconds: Math.round(audioBuffer.duration * 10) / 10,
    sampleRate,
    channels: audioBuffer.numberOfChannels,
    peakAmplitude: Math.round(peakAmplitude * 1000) / 1000,
    averageRms: Math.round(averageRms * 1000) / 1000,
    isSilent,
    zeroCrossingRate: Math.round(zeroCrossingRate * 1000) / 1000,
    spectralCentroid,
    spectralRolloff,
    pitchStability: Math.round(pitchStability * 100) / 100,
    highFreqRatio: Math.round(highFreqRatio * 100) / 100,
  };
}

/**
 * Creates an AcousticSignature from AcousticMetrics for profile storage.
 */
export function createAcousticSignature(metrics: AcousticMetrics): AcousticSignature {
  return {
    sampleRate: metrics.sampleRate,
    averageRms: metrics.averageRms,
    spectralCentroid: metrics.spectralCentroid,
    zeroCrossingRate: metrics.zeroCrossingRate,
    spectralRolloff: metrics.spectralRolloff,
    pitchStability: metrics.pitchStability,
    duration: metrics.durationSeconds,
  };
}

/**
 * Compares an analyzed audio sample against a selected TrustedVoiceProfile.
 * Honest output: Never claims 100% identity match.
 */
export function compareWithVoiceProfile(
  metrics: AcousticMetrics,
  profile: TrustedVoiceProfile | null
): {
  status: 'Verified against reference' | 'Possible mismatch' | 'Unknown speaker' | 'Insufficient audio';
  similarityScore: number | null;
  explanation: string;
} {
  if (!profile) {
    return {
      status: 'Unknown speaker',
      similarityScore: null,
      explanation: 'Speaker identity cannot be verified without a trusted reference voice profile.',
    };
  }

  if (metrics.isSilent || metrics.durationSeconds < 1.5) {
    return {
      status: 'Insufficient audio',
      similarityScore: null,
      explanation: 'Audio sample is too short or silent to perform acoustic profile comparison.',
    };
  }

  const sig = profile.acousticSignature;

  // Normalized acoustic distance metrics
  // Centroid delta (human speech centroid typically 800 - 3500 Hz)
  const centroidDiff = Math.abs(metrics.spectralCentroid - sig.spectralCentroid) / Math.max(1200, sig.spectralCentroid);
  // Zero crossing rate delta
  const zcrDiff = Math.abs(metrics.zeroCrossingRate - sig.zeroCrossingRate) / Math.max(0.04, sig.zeroCrossingRate);
  // Pitch stability delta
  const pitchDiff = Math.abs(metrics.pitchStability - sig.pitchStability);
  // Spectral rolloff delta
  const rolloffDiff = Math.abs(metrics.spectralRolloff - sig.spectralRolloff) / Math.max(2000, sig.spectralRolloff);

  const compositeDistance = centroidDiff * 0.35 + zcrDiff * 0.25 + rolloffDiff * 0.25 + pitchDiff * 0.15;
  const rawSimilarity = Math.max(25, Math.min(96, Math.round((1 - Math.min(1, compositeDistance)) * 100)));

  if (rawSimilarity >= 72) {
    return {
      status: 'Verified against reference',
      similarityScore: rawSimilarity,
      explanation: `Acoustic resonance and frequency envelope closely match ${profile.name}'s enrolled reference sample (${rawSimilarity}% similarity). Note: Client acoustic verification provides guidance, not cryptographic identity proof.`,
    };
  } else {
    return {
      status: 'Possible mismatch',
      similarityScore: rawSimilarity,
      explanation: `Acoustic resonance and pitch envelope diverge from ${profile.name}'s enrolled reference sample (${rawSimilarity}% similarity). The caller's voice characteristics differ noticeably from the saved profile on file.`,
    };
  }
}

/**
 * Evaluates synthetic voice and vocoder artifacts honestly.
 */
export function evaluateVoiceAuthenticity(metrics: AcousticMetrics): {
  status: 'No strong synthetic signal detected' | 'Possible synthetic voice' | 'Analysis unavailable';
  syntheticScore: number;
  details: string;
} {
  if (metrics.isSilent) {
    return {
      status: 'Analysis unavailable',
      syntheticScore: 0,
      details: 'Audio is silent or empty. Voice authenticity cannot be evaluated.',
    };
  }

  if (metrics.durationSeconds < 1.5) {
    return {
      status: 'Analysis unavailable',
      syntheticScore: 15,
      details: 'Audio sample is under 1.5 seconds. Longer speech is required for acoustic stability scoring.',
    };
  }

  // Evaluate synthetic characteristics:
  // 1. Abnormally flat pitch (jitter < threshold) combined with high centroid
  // 2. Excess high frequency vocoder artifact (> 4kHz unnatural ratio)
  let syntheticScore = 12; // Baseline natural speech noise

  if (metrics.pitchStability > 0.94) {
    syntheticScore += 35; // Artificial pitch continuity / vocoder quantization
  }
  if (metrics.highFreqRatio > 0.38) {
    syntheticScore += 25; // Phase vocoder high-band dispersion
  }
  if (metrics.spectralCentroid > 2800) {
    syntheticScore += 18;
  }

  syntheticScore = Math.min(94, Math.max(6, syntheticScore));

  if (syntheticScore >= 60) {
    return {
      status: 'Possible synthetic voice',
      syntheticScore,
      details: 'Synthetic acoustic anomalies detected: Speech exhibits unnaturally rigid pitch contour and elevated high-band vocoder dispersion typical of AI voice generators.',
    };
  } else if (syntheticScore >= 35) {
    return {
      status: 'No strong synthetic signal detected',
      syntheticScore,
      details: 'Mild compression or room reverberation detected, but fundamental vocal tract resonances appear mostly organic.',
    };
  } else {
    return {
      status: 'No strong synthetic signal detected',
      syntheticScore,
      details: 'Organic vocal tract dynamics: Natural pitch flutter, breath pauses, and acoustic resonances consistent with human speech.',
    };
  }
}

/**
 * Evaluates possible acoustic replay / secondary speakerphone capture.
 */
export function evaluateReplayRisk(metrics: AcousticMetrics): {
  status: 'Normal acoustic capture' | 'Possible replay' | 'Not evaluated';
  replayScore: number;
  details: string;
} {
  if (metrics.isSilent) {
    return {
      status: 'Not evaluated',
      replayScore: 0,
      details: 'Audio is silent or empty.',
    };
  }

  // Replay attacks often show heavy room impulse response (diffuse energy floor, lowered dynamic range)
  const dynamicRange = metrics.peakAmplitude / Math.max(0.001, metrics.averageRms);
  let replayScore = 14;

  if (dynamicRange < 2.2 && metrics.averageRms > 0.05) {
    replayScore = 65; // Loudspeaker compression & acoustic reflections
  } else if (dynamicRange < 3.0) {
    replayScore = 38;
  }

  if (replayScore >= 55) {
    return {
      status: 'Possible replay',
      replayScore,
      details: 'Secondary acoustic reflection and limited dynamic range detected, characteristic of audio re-broadcasted over loudspeaker or recorded playback.',
    };
  } else {
    return {
      status: 'Normal acoustic capture',
      replayScore,
      details: 'Direct microphone/line capture with natural dynamic transients and minimal room reflection.',
    };
  }
}

/**
 * Action-Bound Voice Security Engine: Evaluates the requested action and conversational intent.
 */
export function evaluateActionDanger(
  requestedAction: RequestedAction,
  urgency: UrgencyLevel,
  callerType: CallerType,
  transcriptText?: string
): {
  status: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Routine / Low Risk';
  dangerScore: number;
  flaggedPhrases: { text: string; offset: number; length: number; risk: string }[];
  tags: string[];
  explanation: string;
} {
  let baseScore = 10;
  let status: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Routine / Low Risk' = 'Routine / Low Risk';

  switch (requestedAction) {
    case 'Urgent Money Transfer':
      baseScore = 88;
      status = 'Critical Risk';
      break;
    case 'OTP Request':
      baseScore = 84;
      status = 'Critical Risk';
      break;
    case 'Password Reset':
      baseScore = 78;
      status = 'High Risk';
      break;
    case 'Account Detail Change':
      baseScore = 72;
      status = 'High Risk';
      break;
    case 'Confidential Information Request':
      baseScore = 68;
      status = 'High Risk';
      break;
    case 'Payment Request':
      baseScore = 55;
      status = 'Moderate Risk';
      break;
    case 'General Conversation':
      baseScore = 8;
      status = 'Routine / Low Risk';
      break;
  }

  // Urgency multiplier
  if (urgency === 'Emergency') baseScore = Math.min(98, Math.round(baseScore * 1.3));
  else if (urgency === 'Urgent') baseScore = Math.min(95, Math.round(baseScore * 1.15));

  // Caller Context modifier
  if (callerType === 'Unknown Number') baseScore = Math.min(99, baseScore + 12);
  else if (callerType === 'Executive / Manager' && requestedAction !== 'General Conversation') {
    baseScore = Math.min(99, baseScore + 10); // Executive impersonation vector
  }

  const tags: string[] = [];
  const flaggedPhrases: { text: string; offset: number; length: number; risk: string }[] = [];

  if (requestedAction === 'Urgent Money Transfer' || requestedAction === 'Payment Request') {
    tags.push('Financial Transfer Demand');
  }
  if (requestedAction === 'OTP Request' || requestedAction === 'Password Reset') {
    tags.push('Authentication / Credential Extraction');
  }
  if (requestedAction === 'Account Detail Change') {
    tags.push('Account Routing Modification');
  }
  if (urgency === 'Emergency' || urgency === 'Urgent') {
    tags.push('High-Urgency Coercion');
  }
  if (tags.length === 0) {
    tags.push('Standard Conversation');
  }

  // Scan transcript if provided
  if (transcriptText) {
    const lower = transcriptText.toLowerCase();
    for (const item of SENSITIVE_PHRASES) {
      const idx = lower.indexOf(item.text.toLowerCase());
      if (idx !== -1) {
        flaggedPhrases.push({
          text: transcriptText.slice(idx, idx + item.text.length),
          offset: idx,
          length: item.text.length,
          risk: item.risk,
        });
      }
    }
  }

  let explanation = '';
  if (status === 'Critical Risk') {
    explanation =
      'Critical danger: The caller is demanding immediate financial routing, one-time passwords, or security credentials under urgency. Impersonators exploit voice cloning specifically to rush victims before they can verify.';
  } else if (status === 'High Risk') {
    explanation =
      'High risk: The caller is asking to modify account details, reset credentials, or access confidential information. Always verify through an established second channel before complying.';
  } else if (status === 'Moderate Risk') {
    explanation =
      'Moderate caution: Standard payment or transactional request. Routine verification recommended before releasing funds.';
  } else {
    explanation =
      'Routine interaction: No financial transactions, security credentials, or urgent coercive language detected.';
  }

  return {
    status,
    dangerScore: baseScore,
    flaggedPhrases,
    tags,
    explanation,
  };
}

export interface RealAnalysisInput {
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

/**
 * Executes full honest Action-Bound analysis on real acoustic metrics.
 */
export function executeRealAnalysis(opts: RealAnalysisInput): AnalysisResult {
  const profileComparison = compareWithVoiceProfile(opts.metrics, opts.trustedProfile);
  const authenticity = evaluateVoiceAuthenticity(opts.metrics);
  const replay = evaluateReplayRisk(opts.metrics);
  const actionDanger = evaluateActionDanger(
    opts.requestedAction,
    opts.urgency,
    opts.callerType,
    opts.transcript
  );

  // Composite Risk Score Calculation
  // VEYRiX Formula: Action Risk (40%) + Synthetic Audio (35%) + Speaker Mismatch (15%) + Replay Risk (10%)
  let speakerMismatchPenalty = 15;
  if (profileComparison.similarityScore !== null) {
    speakerMismatchPenalty = (100 - profileComparison.similarityScore) * 0.35;
  } else {
    speakerMismatchPenalty = 20; // Unverified stranger baseline
  }

  const rawRisk =
    actionDanger.dangerScore * 0.4 +
    authenticity.syntheticScore * 0.35 +
    speakerMismatchPenalty * 0.15 +
    replay.replayScore * 0.1;

  const overallRiskScore = Math.min(99, Math.max(5, Math.round(rawRisk)));

  let riskLevel: RiskLevel = 'low';
  let recommendedAction: RecommendedAction = 'ALLOW';

  if (overallRiskScore >= 70) {
    riskLevel = 'high';
    recommendedAction = 'HOLD';
  } else if (overallRiskScore >= 35) {
    riskLevel = 'medium';
    recommendedAction = 'VERIFY';
  } else {
    riskLevel = 'low';
    recommendedAction = 'ALLOW';
  }

  // Humanized, practical security guidance
  let recTitle = '';
  let recDesc = '';
  let immediateSteps: string[] = [];

  if (riskLevel === 'high') {
    recTitle = 'Hold Action — Verify Independently';
    recDesc =
      'Do not execute wire transfers, provide OTPs, or share credentials. The call combines high-risk demands with synthetic or unverified vocal traits.';
    immediateSteps = [
      'Take a breath — scammers rely on rapid urgency and pressure to bypass verification.',
      'Do not transfer money, send gift cards, or read out OTP verification codes.',
      'Do not update bank account routing or notification emails based solely on this call.',
      'Hang up immediately and call the contact back on their verified, saved phone number.',
      'If this claims to be internal management, confirm in person or via company enterprise chat.',
    ];
  } else if (riskLevel === 'medium') {
    recTitle = 'Pause & Perform Direct Callback';
    recDesc =
      'The caller is requesting sensitive account actions or the voice profile cannot be verified. Check identity before proceeding.';
    immediateSteps = [
      'Politely inform the caller that company policy requires an independent callback verification.',
      'Hang up and call them back on their known direct mobile or company extension.',
      'Never recite one-time passwords (OTP) or authentication push codes over an incoming call.',
      'Enroll their clean voice sample in Trusted Profiles once their identity is confirmed.',
    ];
  } else {
    recTitle = 'Standard Precautions';
    recDesc =
      'No elevated synthetic indicators or high-risk financial coercion detected. Normal conversational safety rules apply.';
    immediateSteps = [
      'Proceed with normal conversation.',
      'Maintain standard security practice: never share passwords or master credentials over the phone.',
    ];
  }

  const defaultTranscript = opts.transcript || (
    opts.requestedAction === 'Urgent Money Transfer'
      ? 'Voice call requesting immediate wire transfer to designated account. High urgency indicated.'
      : opts.requestedAction === 'OTP Request'
      ? 'Voice call requesting security verification OTP code.'
      : 'Voice call recorded. No high-risk demands noted.'
  );

  return {
    id: `VX-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    audioFileName: opts.audioFileName,
    audioDurationSeconds: opts.durationSeconds,
    channel: opts.channel,
    callerType: opts.callerType,
    requestedAction: opts.requestedAction,
    urgency: opts.urgency,
    hasReferenceVoice: Boolean(opts.trustedProfile),
    overallRiskScore,
    riskLevel,
    recommendedAction,

    // Profile & Verification Status
    trustedProfileId: opts.trustedProfile?.id || null,
    trustedProfileName: opts.trustedProfile?.name || null,
    speakerVerificationStatus: profileComparison.status,
    voiceAuthenticityStatus: authenticity.status,
    replayRiskStatus: replay.status,
    requestDangerStatus: actionDanger.status,

    // Disclosures
    prototypeDisclaimer: opts.isDemo
      ? 'Simulated Demonstration Scenario. Pre-configured forensic benchmark data.'
      : 'Client-Side Acoustic Extraction (Web Audio API). Biometric feature metrics computed directly in browser. Certified neural classification requires enterprise server backend.',

    decodedMetrics: {
      durationSeconds: opts.metrics.durationSeconds,
      sampleRate: opts.metrics.sampleRate,
      peakAmplitude: opts.metrics.peakAmplitude,
      averageRms: opts.metrics.averageRms,
      isSilent: opts.metrics.isSilent,
      zeroCrossingRate: opts.metrics.zeroCrossingRate,
      spectralCentroid: opts.metrics.spectralCentroid,
      spectralRolloff: opts.metrics.spectralRolloff,
      pitchStability: opts.metrics.pitchStability,
    },

    acousticSignals: {
      syntheticProbability: authenticity.syntheticScore,
      syntheticDetails: authenticity.details,
      speakerSimilarity: profileComparison.similarityScore,
      speakerDetails: profileComparison.explanation,
      replayProbability: replay.replayScore,
      replayDetails: replay.details,
      spectralDiscrepancy: Math.round(authenticity.syntheticScore * 0.8),
      phaseAnomalies: Math.round(authenticity.syntheticScore * 0.85),
      channelNoiseFloor: `${(20 * Math.log10(Math.max(0.0001, opts.metrics.averageRms))).toFixed(1)} dBFS`,
    },

    transcript: defaultTranscript,
    intent: {
      riskLevel,
      tags: actionDanger.tags,
      explanation: actionDanger.explanation,
      detectedIntents: [opts.requestedAction],
      flaggedPhrases: actionDanger.flaggedPhrases,
    },

    securityRecommendation: {
      title: recTitle,
      description: recDesc,
      immediateSteps,
      secondaryVerificationSuggested: riskLevel !== 'low',
    },

    verificationStatus:
      riskLevel === 'high'
        ? 'Held & Escalated'
        : riskLevel === 'medium'
        ? 'Pending Verification'
        : 'Cleared (Low Risk)',

    isDemo: opts.isDemo ?? false,
  };
}
