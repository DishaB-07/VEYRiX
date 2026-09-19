/**
 * VEYRiX Frontend Audio Service
 * Web Audio API management, microphone recording, audio decoding, and acoustic feature extraction.
 */

import {
  decodeAudioFileOrBlob,
  extractAcousticFeatures,
  getAudioContext,
  AcousticMetrics,
} from '../utils/audioProcessor';

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentStream: MediaStream | null = null;

  /**
   * Returns active or newly resumed browser AudioContext.
   */
  public getContext(): AudioContext {
    return getAudioContext();
  }

  /**
   * Starts microphone recording using browser MediaRecorder.
   */
  public async startRecording(): Promise<MediaStream> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.currentStream = stream;
    this.audioChunks = [];

    // Prioritize audio/webm or audio/wav depending on browser support
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
    return stream;
  }

  /**
   * Stops recording and returns the captured audio Blob.
   */
  public async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder session found'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        // Stop all audio tracks
        if (this.currentStream) {
          this.currentStream.getTracks().forEach((t) => t.stop());
          this.currentStream = null;
        }

        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Decodes an audio File or Blob into AudioBuffer and extracts acoustic features.
   */
  public async decodeAudio(fileOrBlob: Blob | File): Promise<{
    buffer: AudioBuffer;
    metrics: AcousticMetrics;
  }> {
    return decodeAudioFileOrBlob(fileOrBlob);
  }

  /**
   * Extracts acoustic metrics directly from AudioBuffer.
   */
  public extractFeatures(buffer: AudioBuffer): AcousticMetrics {
    return extractAcousticFeatures(buffer);
  }
}

export const audioService = new AudioService();
