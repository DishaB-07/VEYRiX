import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UserCheck,
  Plus,
  Trash2,
  Mic,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Clock,
  Radio,
} from 'lucide-react';
import { TrustedVoiceProfile, CallerType } from '../../types';
import {
  loadTrustedProfilesFromStorage,
  saveSingleTrustedProfile,
  deleteTrustedProfileFromStorage,
  resetStarterProfiles,
} from '../../utils/storage';
import { decodeAudioFileOrBlob, createAcousticSignature, AcousticMetrics } from '../../utils/audioProcessor';

interface TrustedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile?: (profile: TrustedVoiceProfile) => void;
  selectedProfileId?: string | null;
}

export const TrustedProfileModal: React.FC<TrustedProfileModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
  selectedProfileId,
}) => {
  const [profiles, setProfiles] = useState<TrustedVoiceProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'enroll'>('list');

  // Enrollment Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<CallerType>('Executive / Manager');
  const [notes, setNotes] = useState('');
  const [sampleSource, setSampleSource] = useState<'record' | 'upload'>('upload');

  // Audio capture state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AcousticMetrics | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Playback state
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load profiles on open
  useEffect(() => {
    if (isOpen) {
      setProfiles(loadTrustedProfilesFromStorage());
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Clean up media on modal close
  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioFile(null);
      setMetrics(null);
      setName('');
      setNotes('');
      setErrorMsg(null);
      setActiveTab('list');
    }
  }, [isOpen]);

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Recorder already inactive
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleFileChosen = async (file: File) => {
    setErrorMsg(null);
    setIsDecoding(true);
    try {
      const { metrics: decodedMetrics } = await decodeAudioFileOrBlob(file);
      if (decodedMetrics.durationSeconds < 1.0) {
        setErrorMsg('Audio is too short. Please provide at least 1.5 seconds of speech.');
        setIsDecoding(false);
        return;
      }

      setAudioFile(file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setMetrics(decodedMetrics);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not decode audio file.');
    } finally {
      setIsDecoding(false);
    }
  };

  const startMicRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);

        setIsDecoding(true);
        try {
          const { metrics: decodedMetrics } = await decodeAudioFileOrBlob(audioBlob);
          if (decodedMetrics.durationSeconds < 1.5) {
            setErrorMsg('Recording is too short. Please speak for at least 2 seconds.');
          } else {
            setMetrics(decodedMetrics);
          }
        } catch (err: any) {
          setErrorMsg('Error processing recording: ' + err.message);
        } finally {
          setIsDecoding(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopMicRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg('Microphone access was denied or is not available.');
      setIsRecording(false);
    }
  };

  const stopMicRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a name for this contact.');
      return;
    }
    if (!metrics) {
      setErrorMsg('Please record or upload a short voice sample.');
      return;
    }

    const signature = createAcousticSignature(metrics);
    const newProfile: TrustedVoiceProfile = {
      id: `PROF-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      relationship,
      sampleDuration: Math.round(metrics.durationSeconds),
      sampleSource: sampleSource === 'record' ? 'microphone' : 'upload',
      createdDate: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      acousticSignature: signature,
    };

    const updated = saveSingleTrustedProfile(newProfile);
    setProfiles(updated);

    if (onSelectProfile) {
      onSelectProfile(newProfile);
    }

    // Reset form
    setName('');
    setNotes('');
    setAudioFile(null);
    setAudioUrl(null);
    setMetrics(null);
    setActiveTab('list');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteTrustedProfileFromStorage(id);
    setProfiles(updated);
  };

  const handleResetDefaults = () => {
    const defaults = resetStarterProfiles();
    setProfiles(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-left">
      <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/30 shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#080e1d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Saved Voice Profiles
              </h2>
              <p className="text-xs text-slate-400">
                Save known voices to check whether incoming calls match legitimate people
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-[#080e1d]/50">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Saved Profiles ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enroll')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'enroll'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Voice Profile</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* TAB 1: LIST PROFILES */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Select a profile to compare against incoming calls:
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="text-teal-300 hover:text-teal-200 text-xs underline cursor-pointer"
                >
                  Reset Sample Profiles
                </button>
              </div>

              {profiles.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#080e1d] border border-slate-800 space-y-3">
                  <UserCheck className="w-8 h-8 mx-auto text-slate-600" />
                  <div className="text-sm font-medium text-slate-300">
                    No voice profiles saved yet
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add a voice sample from your manager, family member, or friend to check their calls automatically.
                  </p>
                  <button
                    onClick={() => setActiveTab('enroll')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Profile</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {profiles.map((prof) => {
                    const isSelected = selectedProfileId === prof.id;
                    return (
                      <div
                        key={prof.id}
                        onClick={() => onSelectProfile && onSelectProfile(prof)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#142346] border-teal-400 ring-1 ring-teal-400/40 shadow-md'
                            : 'bg-[#080e1d] hover:bg-[#0c162e] border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {prof.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#101c38] text-teal-300 border border-teal-500/30">
                              {prof.relationship}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40 font-semibold">
                                Active Comparison
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>Length: ~{prof.sampleDuration}s</span>
                            </span>
                            <span>•</span>
                            <span>Added: {prof.createdDate}</span>
                            <span>•</span>
                            <span>Pitch: ~{prof.acousticSignature.spectralCentroid} Hz</span>
                          </div>
                          {prof.notes && (
                            <p className="text-xs text-slate-400 italic">
                              {prof.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {onSelectProfile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProfile(prof);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-teal-500 text-slate-950 font-bold'
                                  : 'bg-[#101c38] text-slate-300 hover:text-white hover:bg-[#15244a]'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Use in Check'}
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(prof.id, e)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENROLL PROFILE */}
          {activeTab === 'enroll' && (
            <div className="space-y-5">
              {/* Error banner */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah (CFO) or Dad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as CallerType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Executive / Manager">Boss / Executive</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Known Contact">Colleague / Friend</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Unknown Number">Other Contact</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-slate-300 font-semibold">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Always calls from office line"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Voice Sample Capture Section */}
              <div className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-white">
                    Step 2: Voice Sample (2 to 10 seconds of clear speech)
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#101c38] p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        setSampleSource('upload');
                        cleanupRecording();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        sampleSource === 'upload'
                          ? 'bg-teal-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      onClick={() => {
                        setSampleSource('record');
                        cleanupRecording();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        sampleSource === 'record'
                          ? 'bg-teal-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Mic className="w-3 h-3 inline mr-1" />
                      Record Sample
                    </button>
                  </div>
                </div>

                {/* Upload Mode */}
                {sampleSource === 'upload' && (
                  <div className="space-y-3">
                    <label className="border border-dashed border-slate-700 hover:border-teal-400 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#0c152a] transition-colors text-center">
                      <Upload className="w-6 h-6 text-teal-400" />
                      <span className="font-medium text-slate-200">
                        {isDecoding
                          ? 'Checking audio...'
                          : audioFile
                          ? `Selected: ${audioFile.name}`
                          : 'Click to select audio file (WAV, MP3, M4A)'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Clear voice recording without background music
                      </span>
                      <input
                        type="file"
                        accept="audio/wav, audio/mp3, audio/mpeg, audio/m4a, audio/webm, audio/ogg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChosen(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Record Mode */}
                {sampleSource === 'record' && (
                  <div className="space-y-3 text-center py-2">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="font-mono text-sm font-bold text-slate-300">
                        00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </div>

                      {!isRecording ? (
                        <button
                          onClick={startMicRecording}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-500/20"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Recording</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopMicRecording}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer animate-pulse"
                        >
                          <span className="w-2.5 h-2.5 rounded-xs bg-white" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Validated Audio Preview */}
                {metrics && (
                  <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Audio Sample Processed</span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-2">
                        <span>Duration: {metrics.durationSeconds}s</span>
                        <span>•</span>
                        <span>Pitch: ~{metrics.spectralCentroid} Hz</span>
                      </div>
                    </div>

                    {audioUrl && (
                      <audio
                        ref={audioPlayerRef}
                        src={audioUrl}
                        controls
                        className="h-8 max-w-[200px]"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl bg-[#080e1d] hover:bg-[#142346] text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={!name.trim() || !metrics || isDecoding}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-500/20"
                >
                  Save Voice Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
