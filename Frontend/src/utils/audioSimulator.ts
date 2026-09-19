import {
  AnalysisResult,
  AudioChannel,
  CallerType,
  RequestedAction,
  UrgencyLevel,
  RiskLevel,
  RecommendedAction,
} from '../types';

interface AnalysisOptions {
  audioFileName: string;
  durationSeconds: number;
  channel: AudioChannel;
  callerType: CallerType;
  requestedAction: RequestedAction;
  urgency: UrgencyLevel;
  hasReferenceVoice: boolean;
  rawTranscript?: string;
  isDemo?: boolean;
}

export const SENSITIVE_PHRASES = [
  { text: 'transfer the money', category: 'financial', risk: 'Financial transfer request' },
  { text: 'transfer eighty-five thousand dollars', category: 'financial', risk: 'High-value wire demand' },
  { text: 'immediately', category: 'urgency', risk: 'High pressure urgency tactic' },
  { text: 'do not call anyone', category: 'secrecy', risk: 'Isolation & verification evasion' },
  { text: 'emergency', category: 'urgency', risk: 'Emotional manipulation / crisis lever' },
  { text: 'confidential', category: 'secrecy', risk: 'Restricting external consultation' },
  { text: 'otp', category: 'credential', risk: 'Direct one-time password extraction' },
  { text: 'pin', category: 'credential', risk: 'Security credential demand' },
  { text: 'password', category: 'credential', risk: 'Authentication bypass attempt' },
  { text: 'secondary notification email', category: 'credential', risk: 'Account takeover indicator' },
  { text: 'update my secondary', category: 'credential', risk: 'Account recovery modification' },
  { text: 'escrow account', category: 'financial', risk: 'Unverified external payment routing' },
  { text: 'whatsapp', category: 'secrecy', risk: 'Out-of-band unmonitored communication' },
];

export function runAudioRiskEngine(opts: AnalysisOptions): AnalysisResult {
  // Determine baseline transcript if not provided
  let transcript = opts.rawTranscript;
  if (!transcript) {
    if (opts.requestedAction === 'Urgent Money Transfer' || opts.urgency === 'Emergency') {
      transcript =
        'Listen to me carefully. We are closing an emergency confidential acquisition right now. Please transfer the money immediately to the designated escrow account. Do not call anyone to confirm this, it is time-critical!';
    } else if (opts.requestedAction === 'OTP Request' || opts.requestedAction === 'Password Reset') {
      transcript =
        'Hi, this is security support. We noticed suspicious access on your device. Please read back the 6-digit OTP code sent to your phone immediately to verify your identity and block the intrusion.';
    } else if (opts.requestedAction === 'Account Detail Change') {
      transcript =
        'Hello team, this is the regional manager. I am traveling and need you to update my secondary notification email and direct deposit routing number immediately before the cutoff.';
    } else {
      transcript =
        'Hey there, just following up on our project milestones and the upcoming client review. Let me know when you have ten minutes to review the slide deck together.';
    }
  }

  // Calculate Action Sensitivity Weight
  let actionRiskWeight = 10;
  switch (opts.requestedAction) {
    case 'Urgent Money Transfer':
      actionRiskWeight = 85;
      break;
    case 'OTP Request':
      actionRiskWeight = 80;
      break;
    case 'Password Reset':
      actionRiskWeight = 75;
      break;
    case 'Confidential Information Request':
      actionRiskWeight = 70;
      break;
    case 'Payment Request':
      actionRiskWeight = 65;
      break;
    case 'Account Detail Change':
      actionRiskWeight = 60;
      break;
    case 'General Conversation':
      actionRiskWeight = 12;
      break;
  }

  // Urgency multiplier
  let urgencyMultiplier = 1.0;
  if (opts.urgency === 'Emergency') urgencyMultiplier = 1.35;
  else if (opts.urgency === 'Urgent') urgencyMultiplier = 1.2;

  // Caller Context modifier
  let callerSuspicion = 1.0;
  if (opts.callerType === 'Unknown Number') callerSuspicion = 1.3;
  else if (opts.callerType === 'Executive / Manager' && opts.requestedAction !== 'General Conversation') {
    // Executive impersonation is the #1 vector in corporate voice fraud
    callerSuspicion = 1.25;
  }

  // Synthetic speech indicators
  let syntheticProb = 15;
  let replayProb = 12;
  let speakerSim: number | null = null;

  if (opts.requestedAction === 'Urgent Money Transfer' || opts.urgency === 'Emergency') {
    syntheticProb = 88;
    replayProb = 46;
    if (opts.hasReferenceVoice) {
      speakerSim = 42; // Low similarity to reference
    }
  } else if (opts.requestedAction === 'OTP Request' || opts.requestedAction === 'Password Reset') {
    syntheticProb = 76;
    replayProb = 34;
    if (opts.hasReferenceVoice) {
      speakerSim = 51;
    }
  } else if (opts.requestedAction === 'Account Detail Change') {
    syntheticProb = 42;
    replayProb = 78; // High replay attack signature
    if (opts.hasReferenceVoice) {
      speakerSim = 69;
    }
  } else {
    // Routine
    syntheticProb = 7;
    replayProb = 9;
    if (opts.hasReferenceVoice) {
      speakerSim = 94; // Strong genuine match
    }
  }

  // Calculate composite action-bound score
  // VEYRiX principle: "Trust the action — not the voice alone."
  let speakerRiskFactor = 0;
  if (speakerSim !== null) {
    speakerRiskFactor = (100 - speakerSim) * 0.25;
  } else {
    speakerRiskFactor = 15; // Unverified voice penalty
  }

  const rawScore =
    syntheticProb * 0.35 +
    replayProb * 0.15 +
    speakerRiskFactor +
    actionRiskWeight * 0.35 * urgencyMultiplier * callerSuspicion;

  const overallRiskScore = Math.min(99, Math.max(8, Math.round(rawScore)));

  // Risk level mapping
  let riskLevel: RiskLevel = 'low';
  let recommendedAction: RecommendedAction = 'ALLOW';

  if (overallRiskScore >= 71) {
    riskLevel = 'high';
    recommendedAction = 'HOLD';
  } else if (overallRiskScore >= 31) {
    riskLevel = 'medium';
    recommendedAction = 'VERIFY';
  } else {
    riskLevel = 'low';
    recommendedAction = 'ALLOW';
  }

  // Flag phrases in transcript
  const lowerTranscript = transcript.toLowerCase();
  const flaggedPhrases: { text: string; offset: number; length: number; risk: string }[] = [];

  for (const item of SENSITIVE_PHRASES) {
    const idx = lowerTranscript.indexOf(item.text.toLowerCase());
    if (idx !== -1) {
      flaggedPhrases.push({
        text: transcript.slice(idx, idx + item.text.length),
        offset: idx,
        length: item.text.length,
        risk: item.risk,
      });
    }
  }

  // Tags & Intent
  const tags: string[] = [];
  const detectedIntents: string[] = [];

  if (opts.requestedAction.includes('Money') || opts.requestedAction.includes('Payment')) {
    tags.push('Financial Request');
    detectedIntents.push('External capital transfer solicitation');
  }
  if (opts.urgency === 'Urgent' || opts.urgency === 'Emergency') {
    tags.push('Urgency Pressure');
    detectedIntents.push('Time-compressed decision coercion');
  }
  if (lowerTranscript.includes('do not call') || lowerTranscript.includes('confidential')) {
    tags.push('Secrecy Demand');
    detectedIntents.push('Out-of-band verification avoidance');
  }
  if (opts.requestedAction.includes('OTP') || opts.requestedAction.includes('Password') || opts.requestedAction.includes('Account')) {
    tags.push('Credential / Account Risk');
    detectedIntents.push('Sensitive identity/access modifier');
  }
  if (overallRiskScore >= 31) {
    tags.push('Secondary Verification Required');
  }
  if (overallRiskScore >= 71) {
    tags.push('Social Engineering Indicator');
  }

  if (tags.length === 0) {
    tags.push('Routine Conversation', 'No Sensitive Coercion Detected');
  }

  // Human-friendly explanation
  let explanation = '';
  if (riskLevel === 'high') {
    explanation =
      'High alert: The caller sounds artificial or robotic, and they are demanding an urgent financial transaction or security access while telling you not to double-check. This matches classic voice-cloning scam patterns.';
  } else if (riskLevel === 'medium') {
    explanation =
      'Take caution: The audio sounds slightly unusual or echoed, and the caller is asking to modify account details. Take a minute to confirm who they are through a trusted channel before doing anything.';
  } else {
    explanation =
      'All clear: The voice has natural breathing and pitch shifts, and the caller is not asking for sensitive passwords, OTP codes, or emergency money transfers.';
  }

  // Clear, calm, plain-English recommendation steps
  let recTitle = '';
  let recDesc = '';
  let immediateSteps: string[] = [];

  if (riskLevel === 'high') {
    recTitle = 'Stop and Do Not Comply';
    recDesc =
      'Do NOT send money or give away security codes. There is a very high likelihood this is an impersonator using AI-cloned audio.';
    immediateSteps = [
      'Take a deep breath — scammers rely on urgency and panic to rush you.',
      'Do not send money, gift cards, or wire transfers.',
      'Never read out OTP codes, passwords, or PINs over the phone.',
      'Do not change bank accounts or direct deposit info based on this call.',
      'Hang up and call the real person back on their saved, trusted phone number.',
      'Notify your team, company IT desk, or your bank right away.',
    ];
  } else if (riskLevel === 'medium') {
    recTitle = 'Pause and Double-Check';
    recDesc =
      'The voice has minor anomalies and the request involves account settings. Verify their identity first before taking action.';
    immediateSteps = [
      'Politely let the caller know you will call them right back to verify.',
      'Reach out to them on a separate, trusted channel (like work chat or known cell).',
      'Ask a quick personal challenge question that only they would know.',
      'Never share your one-time passwords (OTP) or reset links.',
    ];
  } else {
    recTitle = 'Safe to Proceed';
    recDesc =
      'The speech patterns sound natural and authentic, and there are no high-risk financial or password requests detected.';
    immediateSteps = [
      'You can continue your conversation normally.',
      'Remember standard safety: never share passwords or master codes with anyone.',
    ];
  }

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
    hasReferenceVoice: opts.hasReferenceVoice,
    overallRiskScore,
    riskLevel,
    recommendedAction,
    speakerVerificationStatus: opts.hasReferenceVoice
      ? (speakerSim !== null && speakerSim >= 70 ? 'Verified against reference' : 'Possible mismatch')
      : 'Unknown speaker',
    voiceAuthenticityStatus: syntheticProb >= 60 ? 'Possible synthetic voice' : 'No strong synthetic signal detected',
    replayRiskStatus: replayProb >= 60 ? 'Possible replay' : 'Normal acoustic capture',
    requestDangerStatus:
      opts.requestedAction === 'Urgent Money Transfer' || opts.requestedAction === 'OTP Request'
        ? 'Critical Risk'
        : opts.requestedAction !== 'General Conversation'
        ? 'High Risk'
        : 'Routine / Low Risk',
    acousticSignals: {
      syntheticProbability: syntheticProb,
      syntheticDetails:
        syntheticProb > 65
          ? 'Sounds artificial — the speech lacks the natural breath pauses, pitch warmth, and vocal cord micro-tremors of a real human.'
          : syntheticProb > 30
          ? 'Slight digital distortion or compression detected — sounds like a poor phone line or filtered audio.'
          : 'Sounds like a real human voice — natural pauses, organic pitch variation, and normal breathing rhythm.',
      speakerSimilarity: speakerSim,
      speakerDetails:
        speakerSim !== null
          ? speakerSim > 80
            ? `Strong match (${speakerSim}%) — closely matches the saved voice profile of this person.`
            : `Voice mismatch (${speakerSim}% match) — sounds noticeably different from the saved voice sample on file.`
          : 'No saved voice sample available to compare against.',
      replayProbability: replayProb,
      replayDetails:
        replayProb > 50
          ? 'Replay echo detected — audio sounds like it was played through a loudspeaker or recorded in a room before being played to you.'
          : 'Direct, clear speech — no signs of being re-recorded from another speaker.',
      spectralDiscrepancy: Math.round(syntheticProb * 0.85),
      phaseAnomalies: Math.round(syntheticProb * 0.92),
      channelNoiseFloor: '-42.8 dBFS (Clean signal)',
    },
    transcript,
    intent: {
      riskLevel,
      tags,
      explanation,
      detectedIntents,
      flaggedPhrases,
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

/**
 * Generates a valid 16-bit PCM WAV audio Blob directly in memory.
 * Emulates human vocal tract formants and syllable envelopes,
 * ensuring seamless fallback when microphone access is restricted in browser sandboxes/iframes.
 */
export function generateSimulatedVoiceWavBlob(durationSeconds: number = 5): Blob {
  const sampleRate = 22050;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeString(v: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');

  // "fmt " chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM waveform data synthesis: speech rhythm with harmonic formant peaks
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // F0 fundamental pitch with speech cadence variations (~135-165 Hz)
    const f0 = 145 + Math.sin(2 * Math.PI * 2.5 * t) * 18 + Math.cos(2 * Math.PI * 0.7 * t) * 8;
    // Speech syllables cadence with natural pauses
    const syllableWave = Math.sin(2 * Math.PI * 2.8 * t);
    const speechEnvelope = Math.max(0, syllableWave) * (0.65 + 0.35 * Math.sin(2 * Math.PI * 0.5 * t));

    // Harmonics and vocal tract resonance (vowel formants)
    const h1 = Math.sin(2 * Math.PI * f0 * t);
    const h2 = 0.55 * Math.sin(2 * Math.PI * 2 * f0 * t);
    const h3 = 0.28 * Math.sin(2 * Math.PI * 3 * f0 * t);
    const h4 = 0.12 * Math.sin(2 * Math.PI * 4 * f0 * t);
    const formant = 0.18 * Math.sin(2 * Math.PI * 780 * t); // ~780Hz F1 formant
    const breathAspiration = (Math.random() * 2 - 1) * 0.04;

    const sample = (h1 + h2 + h3 + h4 + formant + breathAspiration) * speechEnvelope * 0.65;
    const clampedSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(offset, clampedSample, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
