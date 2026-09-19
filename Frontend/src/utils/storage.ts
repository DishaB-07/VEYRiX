import { IncidentRecord, AnalysisResult, TrustedVoiceProfile } from '../types';
import { INITIAL_INCIDENTS, DEMO_SCENARIOS } from '../data/demoData';

// Storage key updated to ensure only the two clean demo items are loaded initially
const STORAGE_KEY = 'veyrix_incidents_v3';

// Creates a complete analysis result for an incident record if details were not yet generated
function createFallbackDetails(inc: IncidentRecord): AnalysisResult {
  const isHigh = inc.riskLevel === 'high';
  const scenario = isHigh ? DEMO_SCENARIOS[1] : DEMO_SCENARIOS[0];

  const transcript = isHigh
    ? 'Listen to me carefully. We are closing an emergency confidential acquisition right now. Please wire eighty-five thousand dollars immediately to the escrow account sent on WhatsApp. Do not call anyone to confirm or email the team, it is time-critical!'
    : 'Hey Marcus, just checking in about our product design review tomorrow at 10 AM. I uploaded the slide deck to the shared workspace for everyone to review. Let me know if you want any edits beforehand.';

  return {
    id: inc.id,
    timestamp: inc.timestamp,
    audioFileName: inc.audioSource,
    audioDurationSeconds: 8,
    channel: inc.audioSource.includes('Mic') ? 'Recorded Microphone Audio' : 'Uploaded Audio',
    callerType: (inc.callerType as any) || (isHigh ? 'Executive / Manager' : 'Known Contact'),
    requestedAction: isHigh ? 'Urgent Money Transfer' : 'General Conversation',
    urgency: isHigh ? 'Emergency' : 'Normal',
    hasReferenceVoice: true,
    overallRiskScore: inc.riskScore,
    riskLevel: inc.riskLevel,
    recommendedAction: inc.recommendedAction,
    speakerVerificationStatus: isHigh ? 'Possible mismatch' : 'Verified against reference',
    voiceAuthenticityStatus: isHigh ? 'Possible synthetic voice' : 'No strong synthetic signal detected',
    replayRiskStatus: isHigh ? 'Possible replay' : 'Normal acoustic capture',
    requestDangerStatus: isHigh ? 'Critical Risk' : 'Routine / Low Risk',
    acousticSignals: {
      syntheticProbability: isHigh ? 92 : 6,
      syntheticDetails: isHigh
        ? 'Unnatural robotic pitch pattern detected — speech lacks human breath variation.'
        : 'Authentic voice rhythm — normal human breathing and pitch cadence.',
      speakerSimilarity: isHigh ? 39 : 94,
      speakerDetails: isHigh
        ? 'Voice mismatch (39% match) — significant difference from the saved reference sample.'
        : 'Strong voice match (94%) — closely matches this contact’s saved voice sample.',
      replayProbability: isHigh ? 44 : 11,
      replayDetails: isHigh
        ? 'Synthetic voice cues detected alongside minor room reflection.'
        : 'Direct audio capture with natural room sound.',
      spectralDiscrepancy: isHigh ? 88 : 12,
      phaseAnomalies: isHigh ? 91 : 8,
      channelNoiseFloor: '-48 dBFS (Clean signal)',
    },
    transcript,
    intent: {
      riskLevel: inc.riskLevel,
      tags: isHigh
        ? ['Money Transfer', 'Urgency Pressure', 'Secrecy Demand']
        : ['Normal Discussion', 'Project Planning'],
      explanation: isHigh
        ? 'High Risk: The caller is pressuring you for an urgent money transfer and insisting you must not tell anyone. This is a classic voice cloning scam tactic.'
        : 'Safe Call: A normal conversation with no requests for passwords, money, or sensitive info.',
      detectedIntents: isHigh
        ? ['Urgent Money Transfer', 'Secrecy Demand', 'Third-Party Channel Redirection']
        : ['General Conversation'],
      flaggedPhrases: isHigh
        ? [
            { text: 'wire eighty-five thousand dollars', offset: 95, length: 35, risk: 'high' },
            { text: 'immediately', offset: 135, length: 11, risk: 'high' },
            { text: 'Do not call anyone to confirm', offset: 195, length: 29, risk: 'high' },
            { text: 'time-critical', offset: 250, length: 13, risk: 'medium' },
          ]
        : [],
    },
    securityRecommendation: {
      title: isHigh ? 'Stop and Do Not Send Money' : 'Safe to Proceed',
      description: isHigh
        ? 'Do not wire money or share credentials. Hang up and verify by calling your colleague back on their real number.'
        : 'Everything looks genuine and normal. No action needed.',
      immediateSteps: isHigh
        ? [
            'Take a breath — scammers rely on sudden urgency and fear',
            'Do not send money or authorize any wire transfers',
            'Do not share passwords, PINs, or one-time codes',
            'Hang up and call the person back on their verified number',
            'Let your manager or security team know about this suspicious call',
          ]
        : [
            'Continue your regular conversation',
            'Never share master passwords or banking codes over any phone call',
          ],
      secondaryVerificationSuggested: isHigh,
    },
    verificationStatus: inc.verificationStatus,
    isDemo: true,
  };
}

// Loads call history from browser storage, falling back to the 2 clean demo items
export function loadIncidentsFromStorage(): IncidentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialized = INITIAL_INCIDENTS.map((inc) => ({
        ...inc,
        details: inc.details || createFallbackDetails(inc),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
      return initialized;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((inc) => ({
        ...inc,
        details: inc.details || createFallbackDetails(inc),
      }));
    }
  } catch (err) {
    console.warn('Unable to read history from local storage:', err);
  }
  return INITIAL_INCIDENTS.map((inc) => ({
    ...inc,
    details: inc.details || createFallbackDetails(inc),
  }));
}

export function saveIncidentsToStorage(incidents: IncidentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch (err) {
    console.warn('Unable to save history to local storage:', err);
  }
}

export function saveAnalysisResultToStorage(result: AnalysisResult): IncidentRecord {
  const current = loadIncidentsFromStorage();
  const detectionType =
    result.riskLevel === 'high'
      ? 'Synthetic Voice & Action Impersonation'
      : result.riskLevel === 'medium'
      ? 'Suspicious Request or Voice Mismatch'
      : 'Natural Voice Cleared';

  const newRecord: IncidentRecord = {
    id: result.id,
    timestamp: result.timestamp,
    audioSource: result.audioFileName,
    callerType: result.callerType,
    detectionType,
    riskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    mainSignal: `${result.acousticSignals.syntheticProbability}% Synthetic probability (${result.requestedAction})`,
    recommendedAction: result.recommendedAction,
    verificationStatus: result.verificationStatus,
    details: result,
  };

  const updated = [newRecord, ...current.filter((i) => i.id !== result.id)];
  saveIncidentsToStorage(updated);
  return newRecord;
}

export function deleteIncidentFromStorage(id: string): IncidentRecord[] {
  const current = loadIncidentsFromStorage();
  const updated = current.filter((i) => i.id !== id);
  saveIncidentsToStorage(updated);
  return updated;
}

export function clearDemoHistoryStorage(): IncidentRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Unable to clear local storage history:', e);
  }
  return [];
}

export function getIncidentById(id: string): IncidentRecord | null {
  const incidents = loadIncidentsFromStorage();
  const found = incidents.find((i) => i.id.toLowerCase() === id.toLowerCase());
  if (found) {
    if (!found.details) {
      found.details = createFallbackDetails(found);
    }
    return found;
  }
  return null;
}

// Convenience helpers
export const getStoredIncidents = loadIncidentsFromStorage;
export const saveIncidents = saveIncidentsToStorage;
export const saveSingleIncident = (inc: IncidentRecord) => {
  const current = loadIncidentsFromStorage();
  const updated = [inc, ...current.filter((i) => i.id !== inc.id)];
  saveIncidentsToStorage(updated);
};
export const deleteStoredIncident = deleteIncidentFromStorage;
export const clearStoredIncidents = clearDemoHistoryStorage;
export const reseedStoredIncidents = (): IncidentRecord[] => {
  localStorage.removeItem(STORAGE_KEY);
  return loadIncidentsFromStorage();
};

// ==========================================
// TRUSTED VOICE PROFILES PERSISTENCE
// ==========================================
const PROFILES_STORAGE_KEY = 'veyrix_trusted_profiles_v1';

export const STARTER_PROFILES: TrustedVoiceProfile[] = [
  {
    id: 'prof-cfo',
    name: 'Sarah Jenkins (CFO)',
    relationship: 'Executive / Manager',
    createdDate: '2026-09-15',
    sampleDuration: 4.8,
    sampleSource: 'pre-enrolled',
    acousticSignature: {
      sampleRate: 44100,
      averageRms: 0.082,
      spectralCentroid: 1840,
      zeroCrossingRate: 0.076,
      spectralRolloff: 3420,
      pitchStability: 0.78,
      duration: 4.8,
    },
    notes: 'Enrolled voice sample for financial wire and executive call verification.',
  },
  {
    id: 'prof-father',
    name: 'David Miller (Father)',
    relationship: 'Family Member',
    createdDate: '2026-09-14',
    sampleDuration: 5.2,
    sampleSource: 'pre-enrolled',
    acousticSignature: {
      sampleRate: 44100,
      averageRms: 0.095,
      spectralCentroid: 1420,
      zeroCrossingRate: 0.058,
      spectralRolloff: 2750,
      pitchStability: 0.74,
      duration: 5.2,
    },
    notes: 'Family emergency contact voice enrollment.',
  },
];

export function loadTrustedProfilesFromStorage(): TrustedVoiceProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(STARTER_PROFILES));
      return STARTER_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Unable to load trusted profiles from storage:', err);
  }
  return STARTER_PROFILES;
}

export function saveTrustedProfilesToStorage(profiles: TrustedVoiceProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Unable to save trusted profiles to storage:', err);
  }
}

export function saveSingleTrustedProfile(profile: TrustedVoiceProfile): TrustedVoiceProfile[] {
  const current = loadTrustedProfilesFromStorage();
  const updated = [profile, ...current.filter((p) => p.id !== profile.id)];
  saveTrustedProfilesToStorage(updated);
  return updated;
}

export function deleteTrustedProfileFromStorage(id: string): TrustedVoiceProfile[] {
  const current = loadTrustedProfilesFromStorage();
  const updated = current.filter((p) => p.id !== id);
  saveTrustedProfilesToStorage(updated);
  return updated;
}

export function resetStarterProfiles(): TrustedVoiceProfile[] {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(STARTER_PROFILES));
  return STARTER_PROFILES;
}

