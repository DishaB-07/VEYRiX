export const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const SUPPORTED_AUDIO_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.webm', '.ogg'];

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No audio file provided.' };
  }
  if (file.size === 0) {
    return { valid: false, error: 'Audio file is empty (0 bytes).' };
  }
  if (file.size > MAX_AUDIO_FILE_SIZE) {
    return { valid: false, error: 'Audio file exceeds the 25MB maximum size limit.' };
  }

  const name = file.name.toLowerCase();
  const isSupported = SUPPORTED_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!isSupported && !file.type.startsWith('audio/')) {
    return {
      valid: false,
      error: `Unsupported audio format. Please provide a standard WAV, MP3, M4A, or WebM audio file.`,
    };
  }

  return { valid: true };
}
