import { AcousticMetrics, extractAcousticFeatures, getAudioContext } from './audioProcessor';

/**
 * Converts an AudioBuffer into a standard 16-bit PCM WAV Blob.
 * Fully client-side, zero external dependencies.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels and write 16-bit PCM samples
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      // Clamp sample between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Procedurally generates realistic synthetic speech audio samples
 * for both genuine human voice and AI deepfake clone calls.
 */
export function generateScenarioSampleAudio(scenarioId: string): {
  file: File;
  metrics: AcousticMetrics;
  audioUrl: string;
} {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const duration = scenarioId === 'demo-2' ? 7.5 : 6.0;
  const totalSamples = Math.floor(sampleRate * duration);

  const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const isFakeBoss = scenarioId === 'demo-2';

  // Synthesis Parameters
  if (isFakeBoss) {
    // AI VOICE CLONE CHARACTERISTICS:
    // 1. Unnaturally rigid pitch (flat F0 around 142 Hz with no human micro-tremor)
    // 2. Quantized robotic timbre and phase vocoder metallic high-band artifacts (> 3.5kHz)
    // 3. Paced urgent speech cadences with abrupt non-organic cutoffs
    const f0 = 142; // Fundamental pitch

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;

      // Syllable rhythmic gate (3.8 syllables per sec)
      const syllableGate = Math.max(0, Math.sin(t * Math.PI * 3.8));
      const phraseEnvelope = t < 0.2 ? t / 0.2 : t > duration - 0.3 ? (duration - t) / 0.3 : 1;

      // Little to no natural jitter (pitchStability will be > 0.94)
      const rigidF0 = f0;

      // Harmonics (Formants F1, F2, F3)
      const h1 = Math.sin(2 * Math.PI * rigidF0 * t) * 0.45;
      const h2 = Math.sin(2 * Math.PI * rigidF0 * 2 * t) * 0.25;
      const h3 = Math.sin(2 * Math.PI * rigidF0 * 3 * t) * 0.18;
      const h4 = Math.sin(2 * Math.PI * rigidF0 * 5 * t) * 0.12;

      // Vocoder phase buzz / high frequency artifacts (elevates highFreqRatio > 0.38)
      const vocoderNoise = (Math.sin(2 * Math.PI * 4200 * t + Math.sin(t * 80)) * 0.15) *
        (Math.cos(2 * Math.PI * 6200 * t) * 0.1);

      const sampleVal = (h1 + h2 + h3 + h4 + vocoderNoise) * syllableGate * phraseEnvelope * 0.65;
      data[i] = Math.max(-0.95, Math.min(0.95, sampleVal));
    }
  } else {
    // NATURAL HUMAN VOICE CHARACTERISTICS:
    // 1. Natural pitch inflection, warm vibrato and human breath pauses
    // 2. Smooth decaying harmonics with organic vocal tract resonance
    // 3. Gentle consonant dynamics
    const baseF0 = 165;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;

      // Human intonation melody curve + subtle vibrato LFO (5.2 Hz)
      const pitchInflection = Math.sin(t * 1.8) * 18 + Math.sin(t * 5.2) * 3.5;
      const currentF0 = baseF0 + pitchInflection;

      // Conversational pauses between words (natural speech cadence)
      const cadence = Math.sin(t * Math.PI * 2.4);
      const isSpeaking = cadence > -0.15;
      const syllableGate = isSpeaking ? Math.pow(Math.max(0, cadence + 0.15) / 1.15, 0.7) : 0;
      const phraseEnvelope = t < 0.3 ? t / 0.3 : t > duration - 0.4 ? (duration - t) / 0.4 : 1;

      // Warm acoustic harmonics
      const h1 = Math.sin(2 * Math.PI * currentF0 * t) * 0.55;
      const h2 = Math.sin(2 * Math.PI * currentF0 * 2 * t) * 0.32;
      const h3 = Math.sin(2 * Math.PI * currentF0 * 3 * t) * 0.14;
      const h4 = Math.sin(2 * Math.PI * currentF0 * 4 * t) * 0.06;

      // Organic breath air (soft low-passed whisper)
      const breath = (Math.random() * 2 - 1) * 0.025;

      const sampleVal = (h1 + h2 + h3 + h4 + breath) * syllableGate * phraseEnvelope * 0.6;
      data[i] = Math.max(-0.95, Math.min(0.95, sampleVal));
    }
  }

  const metrics = extractAcousticFeatures(buffer);
  const wavBlob = audioBufferToWavBlob(buffer);
  const fileName = isFakeBoss
    ? 'urgent_wire_voicemail.wav'
    : 'sample_team_checkin.wav';

  const file = new File([wavBlob], fileName, { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(wavBlob);

  return {
    file,
    metrics,
    audioUrl,
  };
}
