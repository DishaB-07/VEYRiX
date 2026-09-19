import { DemoScenario, IncidentRecord, AnalysisResult } from '../types';

export const SIH_METADATA = {
  problemCode: 'SIH26104',
  problemTitle: 'AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks',
  systemName: 'VEYRiX',
  tagline: 'Stop voice scams before you send money or share codes.',
  supportingLine: 'A friendly AI safeguard that checks if a caller sounds cloned and flags risky requests.',
  coreInnovation: 'Verify what they ask you to do — never just the voice alone.',
  disclaimer: 'VEYRiX provides AI-assisted security guidance to help you make informed decisions. It does not replace personal judgment. If a caller asks for money or passwords, always double-check using a trusted contact number.',
};

// Two clean, realistic demo scenarios: one safe everyday call, one high-risk clone scam
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-1',
    name: 'Example 1: Safe Team Check-in',
    description: 'A genuine, relaxed conversation between coworkers about tomorrow’s presentation. No sensitive info or money requested.',
    riskLevel: 'low',
    callerType: 'Known Contact',
    requestedAction: 'General Conversation',
    urgency: 'Normal',
    hasReferenceVoice: true,
    transcript: 'Hey Marcus, just checking in about our product design review tomorrow at 10 AM. I uploaded the slide deck to the shared workspace for everyone to review. Let me know if you want any edits beforehand.',
    syntheticScore: 6,
    speakerScore: 94,
    replayScore: 11,
    overallScore: 12,
    action: 'ALLOW',
  },
  {
    id: 'demo-2',
    name: 'Example 2: Fake Boss Wire Transfer Scam',
    description: 'An urgent call pretending to be your manager demanding an immediate $85,000 wire transfer and insisting you must not tell anyone.',
    riskLevel: 'high',
    callerType: 'Executive / Manager',
    requestedAction: 'Urgent Money Transfer',
    urgency: 'Emergency',
    hasReferenceVoice: true,
    transcript: 'Listen to me carefully. We are closing an emergency confidential acquisition right now. Please wire eighty-five thousand dollars immediately to the escrow account sent on WhatsApp. Do not call anyone to confirm or email the team, it is time-critical!',
    syntheticScore: 92,
    speakerScore: 39,
    replayScore: 44,
    overallScore: 91,
    action: 'HOLD',
  },
];

// Exactly two demo records showing one clear safe call and one high-risk threat
export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'VX-101',
    timestamp: '2026-09-17 10:15 AM',
    audioSource: 'sample_team_checkin.wav',
    callerType: 'Known Contact',
    detectionType: 'Routine Work Discussion',
    riskScore: 12,
    riskLevel: 'low',
    mainSignal: 'Natural breathing, authentic human pitch, 94% voice match with known contact',
    recommendedAction: 'ALLOW',
    verificationStatus: 'Cleared (Low Risk)',
  },
  {
    id: 'VX-102',
    timestamp: '2026-09-17 11:42 AM',
    audioSource: 'urgent_wire_voicemail.wav',
    callerType: 'Executive / Manager',
    detectionType: 'AI Voice Clone + Urgent Money Transfer',
    riskScore: 91,
    riskLevel: 'high',
    mainSignal: 'Unnatural robotic pitch pattern (92% AI pattern) + rushed money transfer request',
    recommendedAction: 'HOLD',
    verificationStatus: 'Held & Escalated',
  },
];

export const TECHNICAL_FLOW_STEPS = [
  {
    stage: '01. Audio Ingestion',
    title: 'Listen to the Audio',
    description: 'Takes the audio from your microphone or file upload (WAV, MP3, M4A) and prepares it for analysis on your device.',
    specs: 'Browser Web Audio API, safe in-memory processing without saving your voice remotely.',
  },
  {
    stage: '02. Preprocessing',
    title: 'Clean the Sound',
    description: 'Removes background hiss, trims dead silence, and balances volume so the speech is crystal clear.',
    specs: 'Audio normalization and Voice Activity Detection (isolates actual words from silence).',
  },
  {
    stage: '03. Voice Authenticity',
    title: 'Spot AI Cloned Voices',
    description: 'Listens for subtle artificial glitches, missing breathing sounds, or unnaturally flat robotic tones typical of AI voice tools.',
    specs: 'Acoustic waveform analysis checking phase continuity and frequency resonance.',
  },
  {
    stage: '04. Speaker Match',
    title: 'Compare with Known Voice',
    description: 'Checks whether the caller sounds like the real person they claim to be using an enrolled voice sample.',
    specs: 'Voice fingerprint comparison calculating similarity percentage against your saved reference.',
  },
  {
    stage: '05. Audio Environment',
    title: 'Check for Echo or Replay',
    description: 'Detects if the voice was pre-recorded and replayed through a loudspeaker, tablet, or secondary phone.',
    specs: 'Room resonance and loudspeaker acoustic impulse analysis.',
  },
  {
    stage: '06. Intent & Requests',
    title: 'Look for Red-Flag Requests',
    description: 'Scans what was said for common scam words: urgent money transfers, passwords, OTP codes, or demands for secrecy.',
    specs: 'Speech-to-text scanning for urgent deadlines, secrecy coercion, and financial terms.',
  },
  {
    stage: '07. Risk Calculation',
    title: 'Weigh the Overall Danger',
    description: 'Combines the voice clues with what the caller is asking you to do to give you a single, clear risk rating (0 to 100).',
    specs: 'Weighted safety scoring: Voice Authenticity + Speaker Match + Replay Check + Requested Action Danger.',
  },
  {
    stage: '08. Simple Safe Steps',
    title: 'Actionable Advice for You',
    description: 'Gives clear, simple advice: Safe to continue (ALLOW), Double-check on a separate app (VERIFY), or Stop and do not send anything (HOLD).',
    specs: 'Clear step-by-step guidance on how to safely verify the caller without getting tricked.',
  },
];

export const TECH_STACK_COMPONENTS = [
  {
    layer: 'Web Application',
    tech: 'React 19, TypeScript, Tailwind CSS, Web Audio API',
    purpose: 'Handles recording, audio input, visual feedback, and the main application interface.',
    status: 'Active in Prototype',
  },
  {
    layer: 'Synthetic Voice Detection',
    tech: 'Acoustic feature analysis',
    purpose: 'Looks for voice characteristics and audio patterns that may indicate synthetic speech.',
    status: 'Active in Prototype',
  },
  {
    layer: 'Speaker Recognition',
    tech: 'Voice feature comparison',
    purpose: 'Compares the analyzed voice with available reference recordings to identify possible speaker differences.',
    status: 'Active in Prototype',
  },
  {
    layer: 'Liveness & Replay Filter',
    tech: 'Audio characteristic analysis',
    purpose: 'Looks for characteristics that may indicate replayed or previously recorded audio.',
    status: 'Active in Prototype',
  },
  {
    layer: 'Speech Intent Detection',
    tech: 'Speech analysis and risk keywords',
    purpose: 'Identifies potentially risky requests involving money, OTPs, passwords, urgency, or secrecy.',
    status: 'Active in Prototype',
  },
  {
    layer: 'Security Workflows',
    tech: 'Verification prompts and safety guidance',
    purpose: 'Helps users pause, verify the caller through a trusted channel, and avoid acting under pressure.',
    status: 'Active in Prototype',
  },
];

export const DEMO_INCIDENTS: IncidentRecord[] = INITIAL_INCIDENTS;

export const ROADMAP_PHASES = [
  {
    phase: 1,
    title: 'Prototype / Proof of Concept',
    timeline: 'Phase 1 (Current)',
    status: 'Current Prototype',
    deliverables: [
      'File upload and live microphone capture using Web Audio API',
      'Dual-signal detection: voice cloning clues plus sensitive request risks',
      'Instant visual safety rating with clear next steps',
      'Local call check history and verification logs',
      'Interactive test scenarios for safe calls and high-pressure wire scams',
    ],
  },
  {
    phase: 2,
    title: 'Audio Robustness & Model Optimization',
    timeline: 'Phase 2',
    status: 'Planned Deployment',
    deliverables: [
      'Enhanced detection across lossy phone audio codecs and noisy environments',
      'Improved background chatter cancellation and echo suppression',
      'Regional accent and multilingual baseline expansion',
    ],
  },
  {
    phase: 3,
    title: 'Live Call & Phone System Protection',
    timeline: 'Phase 3',
    status: 'Future Deployment Scope',
    deliverables: [
      'Real-time call protection for business phone systems',
      'Instant on-screen popups when high-risk requests are detected',
      'Direct integration with banking wire authorization policies',
      'Mobile app for live call safety alerts',
    ],
  },
  {
    phase: 4,
    title: 'Enterprise Security & Compliance',
    timeline: 'Phase 4',
    status: 'Future Deployment Scope',
    deliverables: [
      'Encrypted voice biometric storage with zero-knowledge keys',
      'Enterprise privacy compliance certifications',
      'Team-wide fraud monitoring and incident reporting',
    ],
  },
];
