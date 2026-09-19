import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Mic,
  Radio,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileAudio,
  Trash2,
  Sparkles,
  PhoneCall,
  FileText,
  Clock,
  Info,
  ShieldCheck,
  Volume2,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Plus,
  ArrowRight,
  Square,
  Activity,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  CallerType,
  RequestedAction,
  UrgencyLevel,
  AudioChannel,
  AnalysisResult,
  DemoScenario,
  TrustedVoiceProfile,
} from '../types';
import {
  WaveformVisualizer,
  RiskMeter,
  ThreeDCard,
  TrustedProfileModal,
} from '../components';
import {
  decodeAudioFileOrBlob,
  executeRealAnalysis,
  AcousticMetrics,
} from '../utils/audioProcessor';
import { analysisService } from '../services/analysisService';
import { generateScenarioSampleAudio } from '../utils/sampleAudio';
import { DEMO_SCENARIOS } from '../data/demoData';
import { loadTrustedProfilesFromStorage } from '../utils/storage';

interface AnalyzeViewProps {
  onAnalysisFinished: (result: AnalysisResult) => void;
  activeScenario: DemoScenario | null;
  onOpenVerificationModal: (result: AnalysisResult) => void;
  onOpenReportModal: (result: AnalysisResult) => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  onAnalysisFinished,
  activeScenario,
  onOpenVerificationModal,
  onOpenReportModal,
}) => {
  const [inputTab, setInputTab] = useState<'upload' | 'record' | 'preset'>('record');

  // Trusted Voice Profiles State
  const [profiles, setProfiles] = useState<TrustedVoiceProfile[]>(() => loadTrustedProfilesFromStorage());
  const [selectedProfileId, setSelectedProfileId] = useState<string>('none');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [decodedMetrics, setDecodedMetrics] = useState<AcousticMetrics | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Microphone Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micStatus, setMicStatus] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Contextual Risk Inputs
  const [showContextInputs, setShowContextInputs] = useState(true);
  const [callerType, setCallerType] = useState<CallerType>('Executive / Manager');
  const [requestedAction, setRequestedAction] = useState<RequestedAction>('Urgent Money Transfer');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Emergency');
  const [transcript, setTranscript] = useState<string>('');

  // Analysis Execution State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Refresh trusted profiles
  useEffect(() => {
    setProfiles(loadTrustedProfilesFromStorage());
  }, [isProfileModalOpen]);

  // Helper to load procedural scenario audio sample
  const handleLoadScenarioAudio = (scenario: DemoScenario) => {
    cleanupRecording();
    setAudioError(null);
    setMicError(null);
    setAnalysisResult(null);
    try {
      const sample = generateScenarioSampleAudio(scenario.id);
      setUploadedFile(sample.file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(sample.audioUrl);
      setDecodedMetrics(sample.metrics);
      setCallerType(scenario.callerType);
      setRequestedAction(scenario.requestedAction);
      setUrgency(scenario.urgency);
      setTranscript(scenario.transcript);
      setInputTab('preset');
    } catch (e: any) {
      setAudioError('Failed to load scenario audio: ' + (e.message || 'Unknown error'));
    }
  };

  // Sync with activeScenario
  useEffect(() => {
    if (activeScenario) {
      setCallerType(activeScenario.callerType);
      setRequestedAction(activeScenario.requestedAction);
      setUrgency(activeScenario.urgency);
      setTranscript(activeScenario.transcript);

      // Auto-load audio sample if user doesn't have custom audio
      if (!uploadedFile && micStatus === 'idle') {
        try {
          const sample = generateScenarioSampleAudio(activeScenario.id);
          setUploadedFile(sample.file);
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(sample.audioUrl);
          setDecodedMetrics(sample.metrics);
          setInputTab('preset');
        } catch (e) {
          console.debug('Scenario sample note:', e);
        }
      }
    }
  }, [activeScenario]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  // Reset current audio (allows re-recording or picking a new file)
  const handleResetAudio = () => {
    cleanupRecording();
    audioChunksRef.current = [];
    setUploadedFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDecodedMetrics(null);
    setMicStatus('idle');
    setRecordingSeconds(0);
    setAudioError(null);
    setMicError(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle File Selection
  const handleFileSelect = async (file: File) => {
    setAudioError(null);
    setAnalysisResult(null);

    const validTypes = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm',
      'audio/x-m4a',
      'audio/m4a',
      'audio/aac',
    ];
    const isExtValid = /\.(wav|mp3|m4a|ogg|webm|aac)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtValid) {
      setAudioError('Please choose a standard audio file (WAV, MP3, M4A, or WebM).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAudioError('Audio file is larger than 25MB. Please choose a shorter clip.');
      return;
    }

    setUploadedFile(file);
    setIsDecoding(true);

    try {
      const { metrics } = await decodeAudioFileOrBlob(file);
      setDecodedMetrics(metrics);

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const newUrl = URL.createObjectURL(file);
      setAudioUrl(newUrl);
    } catch (err: any) {
      setAudioError(err.message || 'Could not decode audio. Try another file.');
      setUploadedFile(null);
      setDecodedMetrics(null);
    } finally {
      setIsDecoding(false);
    }
  };

  // Start Microphone Recording
  const handleStartRecording = async () => {
    setMicError(null);
    setAudioError(null);
    setAnalysisResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        cleanupRecording();

        if (audioBlob.size < 1000) {
          setMicError('Recording was too short. Speak for at least 3 seconds.');
          setMicStatus('idle');
          return;
        }

        setIsDecoding(true);
        try {
          const { metrics } = await decodeAudioFileOrBlob(audioBlob);
          setDecodedMetrics(metrics);

          if (audioUrl) URL.revokeObjectURL(audioUrl);
          const newUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(newUrl);

          const fileFromBlob = new File([audioBlob], `mic-recording-${Date.now()}.webm`, {
            type: audioBlob.type,
          });
          setUploadedFile(fileFromBlob);
          setMicStatus('finished');
        } catch (err: any) {
          setMicError(err.message || 'Could not process microphone audio.');
          setMicStatus('idle');
        } finally {
          setIsDecoding(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setMicStatus('recording');
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setMicError('No microphone was detected on your device.');
      } else {
        setMicError('Could not start microphone: ' + (err.message || 'Unknown error'));
      }
      setIsRecording(false);
      setMicStatus('idle');
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Cancel Recording
  const handleCancelRecording = () => {
    cleanupRecording();
    audioChunksRef.current = [];
    setMicStatus('idle');
    setRecordingSeconds(0);
    setMicError(null);
  };

  // Execute Analysis
  const handleRunAnalysis = () => {
    if (!decodedMetrics) {
      setAudioError('Please record or select an audio sample first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    setAnalysisStep('Evaluating vocal timbre & harmonic balance...');
    setTimeout(() => {
      setAnalysisStep('Correlating caller intent & security urgency...');
      setTimeout(() => {
        setAnalysisStep('Synthesizing risk report & defense advice...');
        setTimeout(async () => {
          const selectedProfile =
            selectedProfileId !== 'none'
              ? profiles.find((p) => p.id === selectedProfileId) || null
              : null;

          try {
            const { result } = await analysisService.runAnalysis({
              audioFileName: uploadedFile?.name || 'Live Audio Sample',
              durationSeconds: decodedMetrics.durationSeconds,
              channel:
                inputTab === 'record'
                  ? 'Recorded Microphone Audio'
                  : inputTab === 'preset'
                  ? 'Recorded Simulated Voice'
                  : 'Uploaded Audio',
              callerType,
              requestedAction,
              urgency,
              trustedProfile: selectedProfile,
              metrics: decodedMetrics,
              transcript: transcript.trim() || undefined,
              isDemo: false,
            });

            setAnalysisResult(result);
            setIsAnalyzing(false);
            setAnalysisStep('');
            onAnalysisFinished(result);
          } catch (err: any) {
            console.error('[VEYRiX] Analysis execution error:', err);
            setAudioError('Analysis execution failed: ' + (err?.message || 'Unknown error'));
            setIsAnalyzing(false);
            setAnalysisStep('');
          }
        }, 300);
      }, 300);
    }, 300);
  };

  const selectedProfileObj =
    selectedProfileId !== 'none'
      ? profiles.find((p) => p.id === selectedProfileId) || null
      : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <span>VEYRiX Voice Defense Engine</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">SIH26104</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display tracking-tight">
              Analyze a Suspicious Voice
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Record a live phone conversation or upload an audio clip. VEYRiX scans for AI voice cloning patterns, frequency drift, and high-risk social engineering demands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f1b26] hover:bg-[#152536] border border-teal-500/30 text-xs font-semibold text-teal-300 transition-all cursor-pointer shadow-sm focus-ring"
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Voice Profiles ({profiles.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Input & Context, Right = Result / Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* LEFT COLUMN: Input Source & Call Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 1: AUDIO INPUT CARD */}
          <div className="card-3d rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/25 p-5 sm:p-6 space-y-5 shadow-xl fresh-grid relative overflow-hidden">
            {/* Card Header & High-Contrast Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">
                    Audio Source
                  </h2>
                  <p className="text-[11px] text-teal-300/90 font-medium">
                    Step 1 of 3: Record live voice, upload file, or test sample
                  </p>
                </div>
              </div>

              {/* Segmented Mode Toggle with high contrast */}
              <div className="inline-flex items-center bg-[#060c13] p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setInputTab('record');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-ring ${
                    inputTab === 'record'
                      ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Record Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputTab('upload');
                    cleanupRecording();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-ring ${
                    inputTab === 'upload'
                      ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputTab('preset');
                    cleanupRecording();
                    if (!uploadedFile) {
                      handleLoadScenarioAudio(activeScenario || DEMO_SCENARIOS[1]);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-ring ${
                    inputTab === 'preset'
                      ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preset Calls</span>
                </button>
              </div>
            </div>

            {/* TAB B: MICROPHONE RECORDING (Primary & Highest Priority) */}
            {inputTab === 'record' && (
              <div className="space-y-4">
                {micError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold block">Microphone Notice:</span>
                      <span>{micError}</span>
                    </div>
                  </div>
                )}

                {/* State 1: Decoding / Processing State */}
                {isDecoding ? (
                  <div className="p-8 rounded-2xl bg-[#060d15] border border-teal-500/30 text-center space-y-4 shadow-inner">
                    <RefreshCw className="w-9 h-9 text-teal-400 animate-spin mx-auto" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Extracting Acoustic Telemetry...
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                        Decoding spectral harmonics, jitter, and pitch variance. This takes just a moment.
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-sky-400 animate-pulse rounded-full" />
                    </div>
                  </div>
                ) : isRecording ? (
                  /* State 2: Active Recording State */
                  <div className="p-6 sm:p-7 rounded-2xl bg-[#070e17] border border-rose-500/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
                    {/* Pulsing radar rings background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                      <div className="w-32 h-32 rounded-full border border-rose-500 animate-radar" />
                      <div className="w-48 h-48 rounded-full border border-rose-500 animate-radar" style={{ animationDelay: '0.6s' }} />
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold font-mono tracking-wider shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>LIVE CAPTURE IN PROGRESS</span>
                    </div>

                    {/* Prominent Recording Timer */}
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                        00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                        <span className="text-xs text-slate-400 font-sans ml-1.5">/ 01:00</span>
                      </div>
                      <p className="text-xs text-rose-300 font-medium mt-1.5 flex items-center justify-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Listening... Speak clearly or hold phone speaker close</span>
                      </p>
                    </div>

                    {/* Duration Progress Indicator */}
                    <div className="space-y-1 max-w-xs mx-auto">
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (recordingSeconds / 60) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0s</span>
                        <span className="text-emerald-400 font-semibold">Ideal: 5-15s</span>
                        <span>60s max</span>
                      </div>
                    </div>

                    {/* High-Contrast Action Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
                      {/* Primary STOP Button */}
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/35 hover:shadow-rose-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5 focus-ring"
                      >
                        <Square className="w-4 h-4 fill-white text-white" />
                        <span>Stop &amp; Save Recording</span>
                      </button>

                      {/* Secondary CANCEL Button */}
                      <button
                        type="button"
                        onClick={handleCancelRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 min-h-[46px] rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer focus-ring"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : audioUrl && !isRecording ? (
                  /* State 3: Captured Voice Sample Review */
                  <div className="p-5 rounded-2xl bg-[#060e17] border border-teal-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Voice Sample Ready
                          </span>
                          <span className="text-[11px] text-teal-300">
                            {decodedMetrics ? `~${decodedMetrics.durationSeconds}s duration recorded` : 'Audio captured'}
                          </span>
                        </div>
                      </div>

                      {/* Re-record Action */}
                      <button
                        type="button"
                        onClick={handleResetAudio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer focus-ring"
                        title="Discard this recording and record a new one"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                        <span>Re-record</span>
                      </button>
                    </div>

                    {/* Native Audio Playback */}
                    <div className="p-3 rounded-xl bg-[#0a1420] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Audio Preview:</span>
                        {decodedMetrics && (
                          <span className="font-mono text-teal-400">
                            {decodedMetrics.sampleRate} Hz • Float32 PCM
                          </span>
                        )}
                      </div>
                      <audio
                        ref={audioPlayerRef}
                        src={audioUrl}
                        controls
                        className="w-full h-9 focus-ring rounded"
                        onPlay={() => setIsPlayingAudio(true)}
                        onPause={() => setIsPlayingAudio(false)}
                        onEnded={() => setIsPlayingAudio(false)}
                      />
                    </div>

                    {/* Next step hint */}
                    <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Ready! Review the call context below and click <strong>Run Safety Check</strong>.</span>
                    </div>
                  </div>
                ) : (
                  /* State 4: Idle / Ready to Record State */
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#060e17] border border-slate-800/90 text-center space-y-4 shadow-inner relative group hover:border-teal-500/30 transition-all">
                    {/* Visual Mic Focus Radar */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-teal-500/10 border border-teal-500/20 group-hover:scale-110 transition-transform duration-300" />
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-500/20 to-sky-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-md shadow-teal-500/20">
                        <Mic className="w-7 h-7 text-teal-300" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Ready to Record Audio
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                        Speak into your mic or play audio near your speaker for 5 to 15 seconds. VEYRiX checks for robotic vocal artifacts and pitch drift on-device.
                      </p>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-teal-300/90 font-medium mt-2">
                        <span>1. Click Record</span>
                        <span className="text-slate-500">→</span>
                        <span>2. Speak 5–15s</span>
                        <span className="text-slate-500">→</span>
                        <span>3. Click Stop &amp; Save</span>
                      </div>
                    </div>

                    {/* High-Contrast Start Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all cursor-pointer focus-ring"
                      >
                        <Mic className="w-4 h-4 text-slate-950" />
                        <span>Start Voice Recording</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audio remains 100% private — processed only in your browser</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB A: FILE UPLOAD */}
            {inputTab === 'upload' && (
              <div className="space-y-4">
                {audioError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{audioError}</span>
                  </div>
                )}

                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-teal-400/70 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#060e17] hover:bg-[#091522] transition-all text-center group focus-ring"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="p-4 rounded-full bg-[#0a1520] border border-slate-700 text-teal-300 group-hover:scale-110 group-hover:border-teal-400 transition-all shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {isDecoding ? 'Decoding audio file...' : 'Choose an audio file to analyze'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Click or drag &amp; drop WAV, MP3, M4A, or WebM (up to 25MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".wav,.mp3,.m4a,.webm,.ogg,audio/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#060e17] border border-teal-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 truncate max-w-[240px]">
                        <span className="text-xs font-bold text-white truncate block">
                          {uploadedFile.name}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                          {decodedMetrics && (
                            <>
                              <span>•</span>
                              <span className="text-teal-400 font-mono">~{decodedMetrics.durationSeconds}s duration</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetAudio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 border border-slate-700 text-xs font-medium transition-colors cursor-pointer focus-ring"
                        title="Remove file and choose another"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Native Audio Player */}
                    {audioUrl && (
                      <div className="pt-1">
                        <audio
                          ref={audioPlayerRef}
                          src={audioUrl}
                          controls
                          className="w-full h-8 focus-ring rounded"
                          onPlay={() => setIsPlayingAudio(true)}
                          onPause={() => setIsPlayingAudio(false)}
                          onEnded={() => setIsPlayingAudio(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB C: PRESET CALL SCENARIOS */}
            {inputTab === 'preset' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Select a test scenario to evaluate acoustic clone indicators and high-risk intent vectors without needing a microphone:
                </p>

                <div className="space-y-2.5">
                  {DEMO_SCENARIOS.map((sc) => {
                    const isSelected = uploadedFile?.name === (sc.id === 'demo-2' ? 'urgent_wire_voicemail.wav' : 'sample_team_checkin.wav');
                    return (
                      <div
                        key={sc.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#081824] border-teal-400/60 shadow-md shadow-teal-500/10'
                            : 'bg-[#060e17] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {sc.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sc.riskLevel === 'high'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {sc.riskLevel === 'high' ? 'AI Voice Clone' : 'Organic Human'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {sc.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLoadScenarioAudio(sc)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer focus-ring ${
                              isSelected
                                ? 'bg-teal-400 text-slate-950 shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isSelected ? 'Loaded ✓' : 'Load Call'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Audio preview when preset is loaded */}
                {uploadedFile && audioUrl && (
                  <div className="p-4 rounded-xl bg-[#060e17] border border-teal-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {uploadedFile.name}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                          {decodedMetrics && (
                            <>
                              <span>•</span>
                              <span className="text-teal-400 font-mono">
                                ~{decodedMetrics.durationSeconds}s @ {decodedMetrics.sampleRate} Hz
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetAudio}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 text-xs transition-colors cursor-pointer"
                        title="Clear loaded preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </div>

                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      controls
                      className="w-full h-8 focus-ring rounded"
                      onPlay={() => setIsPlayingAudio(true)}
                      onPause={() => setIsPlayingAudio(false)}
                      onEnded={() => setIsPlayingAudio(false)}
                    />

                    <div className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Audio sample ready. Review Step 2 &amp; 3 below and click <strong>Run Voice Safety Check</strong>.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: KNOWN VOICE MATCH CARD */}
          <div className="card-3d rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/25 p-5 sm:p-6 space-y-4 shadow-xl fresh-grid relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">
                    Voice Match Target
                  </h2>
                  <p className="text-[11px] text-teal-300/90 font-medium">
                    Step 2 of 3: Select who the caller claims to be
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer focus-ring rounded px-2 py-1 bg-teal-950/40 border border-teal-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Profile</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs text-slate-200 font-semibold">
                Who does the caller claim to be?
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e17] border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer focus-ring"
              >
                <option value="none">
                  No saved profile (Unknown caller, cold call, or stranger)
                </option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship}) — {p.sampleDuration}s reference sample
                  </option>
                ))}
              </select>

              {selectedProfileObj ? (
                <div className="p-3 rounded-xl bg-[#082229] border border-teal-500/40 text-xs text-teal-200 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Target Profile: {selectedProfileObj.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    VEYRiX will compare biometric frequency signatures against {selectedProfileObj.name}&apos;s saved profile ({selectedProfileObj.sampleDuration}s baseline).
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#060e17] border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>Zero-Knowledge Mode</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    No stored baseline profile selected. The engine will evaluate acoustic synthesis indicators and behavioral urgency.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: ACTION & RISK CONTEXT CARD */}
          <div className="card-3d rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/25 p-5 sm:p-6 space-y-4 shadow-xl fresh-grid relative overflow-hidden">
            <div
              className="flex items-center justify-between pb-3 border-b border-slate-800 cursor-pointer select-none"
              onClick={() => setShowContextInputs(!showContextInputs)}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">
                    Threat &amp; Action Context
                  </h2>
                  <p className="text-[11px] text-teal-300/90 font-medium">
                    Step 3 of 3: What did the caller ask for?
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Toggle Context Inputs"
              >
                {showContextInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showContextInputs && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Scammers frequently combine synthetic voices with high-pressure social engineering (e.g. emergency bank wires or OTP sharing).
                </p>

                {/* Requested Action */}
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-semibold">
                    What was requested? *
                  </label>
                  <select
                    value={requestedAction}
                    onChange={(e) => setRequestedAction(e.target.value as RequestedAction)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e17] border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer focus-ring"
                  >
                    <option value="Urgent Money Transfer">Emergency Money Transfer / Bank Wire</option>
                    <option value="OTP Request">Read out a One-Time Passcode (OTP)</option>
                    <option value="Password Reset">Password Reset or Security Code</option>
                    <option value="Account Detail Change">Change bank account number for direct deposits</option>
                    <option value="Confidential Information Request">Share confidential files or customer data</option>
                    <option value="Payment Request">Pay an unexpected invoice</option>
                    <option value="General Conversation">Regular conversation (no money or password asked)</option>
                  </select>
                </div>

                {/* Caller Role & Urgency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-semibold">
                      Who is calling?
                    </label>
                    <select
                      value={callerType}
                      onChange={(e) => setCallerType(e.target.value as CallerType)}
                      className="w-full px-3 py-2 rounded-xl bg-[#060e17] border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer focus-ring"
                    >
                      <option value="Executive / Manager">Boss or Company Executive</option>
                      <option value="Family Member">Family Member (Child / Parent)</option>
                      <option value="Known Contact">Friend or Work Colleague</option>
                      <option value="Customer Support">Bank or Tech Support Agent</option>
                      <option value="Unknown Number">Unknown Number / Stranger</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-semibold">
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                      className="w-full px-3 py-2 rounded-xl bg-[#060e17] border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer focus-ring"
                    >
                      <option value="Emergency">Immediate Emergency (Do it NOW!)</option>
                      <option value="Urgent">Urgent (Within the hour)</option>
                      <option value="Normal">Normal / Routine pace</option>
                    </select>
                  </div>
                </div>

                {/* Optional Transcript */}
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-semibold">
                    What did they say? (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="e.g., 'Wire seventy thousand dollars immediately, do not mention this to anyone...'"
                    className="w-full px-3 py-2 rounded-xl bg-[#060e17] border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-teal-400 resize-none focus-ring"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY EXECUTION BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={!decodedMetrics || isAnalyzing}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2.5 focus-ring ${
                !decodedMetrics || isAnalyzing
                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transform hover:-translate-y-0.5'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{analysisStep || 'Analyzing Voice Forensics...'}</span>
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5 text-slate-950" />
                  <span>Run Voice Safety Check</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

            {!decodedMetrics && !isAnalyzing && (
              <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-200 text-center flex items-center justify-center gap-1.5 animate-pulse">
                <HelpCircle className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Complete Step 1 above (record voice, upload file, or pick a preset) to enable the safety check</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Waveform & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio Waveform Inspection Box */}
          <ThreeDCard
            maxTilt={3}
            glareOpacity={0.08}
            className="card-3d rounded-2xl bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#0b1120] border border-slate-800/90 p-5 sm:p-6 space-y-3 shadow-xl fresh-grid relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span>Acoustic Waveform Visualizer</span>
              </span>
              {decodedMetrics ? (
                <span className="text-xs text-teal-300 font-mono">
                  {decodedMetrics.durationSeconds}s @ {decodedMetrics.sampleRate} Hz
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-mono">
                  Ready for Audio Stream
                </span>
              )}
            </div>

            <div className="rounded-xl overflow-hidden bg-[#050912] border border-slate-800/90">
              <WaveformVisualizer
                isRecording={isRecording}
                isPlaying={isPlayingAudio}
                stream={mediaStreamRef.current}
                audioElement={audioPlayerRef.current}
                height={125}
              />
            </div>
          </ThreeDCard>

          {/* ANALYSIS RESULTS SECTION */}
          {analysisResult ? (
            <ThreeDCard
              maxTilt={4}
              glareOpacity={0.12}
              className="card-3d rounded-2xl bg-gradient-to-b from-[#131d35] via-[#0f172a] to-[#0b1120] border border-slate-700/80 p-6 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 text-left fresh-grid relative overflow-hidden"
            >
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        analysisResult.riskLevel === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : analysisResult.riskLevel === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {analysisResult.recommendedAction}:{' '}
                      {analysisResult.riskLevel === 'high'
                        ? 'High Scam Risk'
                        : analysisResult.riskLevel === 'medium'
                        ? 'Confirm Before Acting'
                        : 'Cleared & Safe'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {analysisResult.id}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white font-display">
                    {analysisResult.securityRecommendation.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Audio Duration: {analysisResult.audioDurationSeconds}s • Checked at{' '}
                    {analysisResult.timestamp}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <RiskMeter
                    score={analysisResult.overallRiskScore}
                    riskLevel={analysisResult.riskLevel}
                    recommendedAction={analysisResult.recommendedAction}
                    size="md"
                  />
                </div>
              </div>

              {/* 4 Simple Checks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1: Speaker Identity */}
                <div className="card-3d p-4 rounded-xl bg-[#0b1120]/90 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    1. Voice Identity Match
                  </div>
                  <div className="flex items-center gap-2">
                    {analysisResult.trustedProfileName ? (
                      <span className="text-sm font-semibold text-white">
                        {analysisResult.acousticSignals.speakerSimilarity !== null
                          ? `${analysisResult.acousticSignals.speakerSimilarity}% match with `
                          : 'Matched with '}
                        {analysisResult.trustedProfileName}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-slate-300">
                        {analysisResult.speakerVerificationStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {analysisResult.acousticSignals.speakerDetails || 'No reference voice baseline enrolled.'}
                  </p>
                </div>

                {/* 2: AI Voice Detection */}
                <div className="card-3d p-4 rounded-xl bg-[#0b1120]/90 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    2. Synthetic Tone Signals
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        analysisResult.acousticSignals.syntheticProbability > 60
                          ? 'text-rose-400'
                          : analysisResult.acousticSignals.syntheticProbability > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {analysisResult.acousticSignals.syntheticProbability}% Synthetic Voice Probability
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {analysisResult.acousticSignals.syntheticDetails ||
                      (analysisResult.acousticSignals.syntheticProbability > 50
                        ? 'Robotic pitch stability and spectral artifacts detected.'
                        : 'Natural speech variation and organic vocal pitch observed.')}
                  </p>
                </div>

                {/* 3: Request Risk */}
                <div className="card-3d p-4 rounded-xl bg-[#0b1120]/90 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    3. Request Danger Level
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {analysisResult.requestedAction}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        analysisResult.intent.riskLevel === 'high'
                          ? 'bg-rose-950 text-rose-300'
                          : analysisResult.intent.riskLevel === 'medium'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {analysisResult.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {analysisResult.intent.explanation ||
                      `${analysisResult.requestDangerStatus}: Demand pattern checked against high-risk social engineering vectors.`}
                  </p>
                </div>

                {/* 4: Advice */}
                <div className="card-3d p-4 rounded-xl bg-[#0b1120]/90 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    4. What You Should Do
                  </div>
                  <div className="text-xs font-semibold text-teal-300">
                    {analysisResult.securityRecommendation.immediateSteps?.[0] ||
                      analysisResult.securityRecommendation.title}
                  </div>
                  <p className="text-xs text-slate-400">
                    {analysisResult.securityRecommendation.description ||
                      'Do not act on sensitive phone requests without separate secondary verification.'}
                  </p>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-[#060e17] border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-3">
                <span>
                  <strong>Notice:</strong> {analysisResult.prototypeDisclaimer}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-teal-300 shrink-0">
                  Web Audio API
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenVerificationModal(analysisResult)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm focus-ring"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>Call Back to Verify</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenReportModal(analysisResult)}
                  className="px-4 py-2.5 rounded-xl bg-[#0b1120] hover:bg-[#111827] text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 focus-ring"
                >
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Download Report</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAudio}
                  className="px-4 py-2.5 rounded-xl bg-[#0b1120] hover:bg-[#111827] border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer ml-auto focus-ring"
                >
                  Check Another Call
                </button>
              </div>
            </ThreeDCard>
          ) : (
            <div className="card-3d p-10 rounded-2xl bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#0b1120] border border-slate-800 text-center space-y-3 shadow-xl fresh-grid relative overflow-hidden">
              <ShieldCheck className="w-12 h-12 mx-auto text-teal-400/70 animate-pulse" />
              <div className="text-base font-bold text-white font-display">
                Ready for Voice Safety Check
              </div>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Start a voice recording on the left, or upload an audio file. Click &quot;Run Voice Safety Check&quot; to inspect synthetic acoustic signals and high-risk demands.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trusted Voice Profile Modal */}
      <TrustedProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        selectedProfileId={selectedProfileId}
        onSelectProfile={(profile) => {
          setSelectedProfileId(profile.id);
          setIsProfileModalOpen(false);
        }}
      />
    </div>
  );
};
