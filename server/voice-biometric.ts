import { createHash } from 'crypto';

// Voice biometric processing and analysis
export interface VoiceFeatures {
  duration: number;
  avgFrequency: number;
  pitch: number;
  tempo: number;
  energy: number;
  spectralCentroid: number;
  fingerprint: string;
}

// Extract basic voice characteristics from audio data
export function extractVoiceFeatures(audioBuffer: Buffer): VoiceFeatures {
  // Simplified voice analysis that works with WebM audio data
  const duration = Math.max(1, audioBuffer.length / 1000); // Simplified duration estimation
  
  // Extract basic characteristics from the raw audio buffer
  let totalEnergy = 0;
  let avgFrequency = 0;
  let sampleCount = 0;
  
  // Process audio buffer safely, skipping potential header data
  const startOffset = Math.min(1000, audioBuffer.length / 4); // Skip potential headers
  const endOffset = Math.max(startOffset + 100, audioBuffer.length - 1000);
  
  for (let i = startOffset; i < endOffset && i < audioBuffer.length; i++) {
    const sample = audioBuffer[i];
    totalEnergy += Math.abs(sample);
    sampleCount++;
  }
  
  avgFrequency = sampleCount > 0 ? totalEnergy / sampleCount : 100;
  
  // Generate voice fingerprint based on characteristics
  const fingerprint = generateVoiceFingerprint(audioBuffer);
  
  return {
    duration,
    avgFrequency,
    pitch: avgFrequency * 0.8, // Simplified pitch estimation
    tempo: duration > 0 ? sampleCount / duration : 50,
    energy: totalEnergy,
    spectralCentroid: avgFrequency * 1.2,
    fingerprint
  };
}

// Generate a unique voice fingerprint
function generateVoiceFingerprint(audioBuffer: Buffer): string {
  // Extract key characteristics for fingerprinting
  const samples: number[] = [];
  for (let i = 0; i < Math.min(audioBuffer.length, 1000); i += 10) {
    samples.push(audioBuffer[i]);
  }
  
  // Create hash of voice characteristics
  const hash = createHash('sha256');
  hash.update(Buffer.from(samples));
  return hash.digest('hex').substring(0, 32);
}

// Compare two voice feature sets for similarity
export function compareVoiceFeatures(stored: VoiceFeatures, captured: VoiceFeatures): number {
  const weights = {
    pitch: 0.3,
    energy: 0.2,
    duration: 0.1,
    avgFrequency: 0.2,
    tempo: 0.1,
    fingerprint: 0.1
  };
  
  let similarity = 0;
  
  // Compare pitch (normalized)
  const pitchDiff = Math.abs(stored.pitch - captured.pitch);
  const pitchSimilarity = Math.max(0, 1 - (pitchDiff / Math.max(stored.pitch, captured.pitch)));
  similarity += pitchSimilarity * weights.pitch;
  
  // Compare energy
  const energyDiff = Math.abs(stored.energy - captured.energy);
  const energySimilarity = Math.max(0, 1 - (energyDiff / Math.max(stored.energy, captured.energy)));
  similarity += energySimilarity * weights.energy;
  
  // Compare duration
  const durationDiff = Math.abs(stored.duration - captured.duration);
  const durationSimilarity = Math.max(0, 1 - (durationDiff / Math.max(stored.duration, captured.duration)));
  similarity += durationSimilarity * weights.duration;
  
  // Compare frequency
  const freqDiff = Math.abs(stored.avgFrequency - captured.avgFrequency);
  const freqSimilarity = Math.max(0, 1 - (freqDiff / Math.max(stored.avgFrequency, captured.avgFrequency)));
  similarity += freqSimilarity * weights.avgFrequency;
  
  // Compare tempo
  const tempoDiff = Math.abs(stored.tempo - captured.tempo);
  const tempoSimilarity = Math.max(0, 1 - (tempoDiff / Math.max(stored.tempo, captured.tempo)));
  similarity += tempoSimilarity * weights.tempo;
  
  // Compare fingerprint (exact match bonus)
  if (stored.fingerprint === captured.fingerprint) {
    similarity += weights.fingerprint;
  }
  
  return similarity;
}

// Process audio data from base64
export function processAudioBase64(base64Audio: string): VoiceFeatures {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    return extractVoiceFeatures(audioBuffer);
  } catch (error) {
    console.error('Failed to process audio:', error);
    throw new Error('Invalid audio data');
  }
}