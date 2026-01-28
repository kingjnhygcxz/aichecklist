import { createHash, randomBytes } from 'crypto';
import { EnhancedVoiceFeatures } from './enhanced-voice-biometric';

// =============================================================================
// FREE VOICE AUTHENTICATION ENHANCEMENTS
// Enhanced security features using open-source techniques
// =============================================================================

// Liveness Detection System
export interface LivenessChallenge {
  id: string;
  phrase: string;
  timestamp: number;
  expiresAt: number;
  expectedWords: string[];
}

export interface LivenessResponse {
  challengeId: string;
  transcribedText: string;
  audioData: string;
  responseTime: number;
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  reasons: string[];
  timingAnalysis: {
    responseTime: number;
    naturalPacing: boolean;
    pausePattern: boolean;
  };
}

// Anti-Spoofing Detection
export interface AntiSpoofingResult {
  isSpoofed: boolean;
  confidence: number;
  detectedArtifacts: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Enhanced Audio Analysis
export interface EnhancedAudioFeatures extends EnhancedVoiceFeatures {
  // Additional free analysis features
  zeroCrossingRate: number;
  spectralRolloff: number;
  spectralFlux: number;
  temporalCentroid: number;
  
  // Quality indicators
  signalToNoiseRatio: number;
  dynamicRange: number;
  clippingDetected: boolean;
  
  // Liveness indicators
  naturalVariation: number;
  microPauses: number;
  breathingDetected: boolean;
  emotionalMarkers: number;
}

// =============================================================================
// LIVENESS DETECTION IMPLEMENTATION
// =============================================================================

const LIVENESS_PHRASES = [
  "Today is {date} and the time is {time}",
  "My unique number for today is {random}",
  "I am speaking live on {date} at {time}",
  "The current moment is {timestamp}",
  "Authentication request at {time} on {date}",
  "Live voice sample recorded {timestamp}",
  "Real-time verification at {time}",
  "Current session started at {time}",
  "Today's authentication code is {random}",
  "Speaking live verification at {timestamp}"
];

export class LivenessDetector {
  private activeChallenges = new Map<string, LivenessChallenge>();
  private readonly challengeTimeout = 30 * 1000; // 30 seconds

  generateChallenge(): LivenessChallenge {
    const challengeId = randomBytes(16).toString('hex');
    const template = LIVENESS_PHRASES[Math.floor(Math.random() * LIVENESS_PHRASES.length)];
    
    const now = new Date();
    const timestamp = now.getTime();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    const randomNum = Math.floor(Math.random() * 10000).toString();
    
    // Replace placeholders
    const phrase = template
      .replace('{date}', dateStr)
      .replace('{time}', timeStr)
      .replace('{timestamp}', timestamp.toString())
      .replace('{random}', randomNum);
    
    // Extract expected words for validation
    const expectedWords = phrase.toLowerCase().split(' ').filter(word => 
      word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all'].includes(word)
    );
    
    const challenge: LivenessChallenge = {
      id: challengeId,
      phrase,
      timestamp,
      expiresAt: timestamp + this.challengeTimeout,
      expectedWords
    };
    
    this.activeChallenges.set(challengeId, challenge);
    
    // Clean up expired challenges
    this.cleanupExpiredChallenges();
    
    return challenge;
  }

  validateResponse(response: LivenessResponse): LivenessResult {
    const challenge = this.activeChallenges.get(response.challengeId);
    
    if (!challenge) {
      return {
        isLive: false,
        confidence: 0,
        reasons: ['Challenge not found or expired'],
        timingAnalysis: {
          responseTime: response.responseTime,
          naturalPacing: false,
          pausePattern: false
        }
      };
    }
    
    // Check expiration
    if (Date.now() > challenge.expiresAt) {
      this.activeChallenges.delete(response.challengeId);
      return {
        isLive: false,
        confidence: 0,
        reasons: ['Challenge expired'],
        timingAnalysis: {
          responseTime: response.responseTime,
          naturalPacing: false,
          pausePattern: false
        }
      };
    }
    
    // Analyze transcribed text
    const textAnalysis = this.analyzeTranscribedText(challenge, response.transcribedText);
    
    // Analyze timing
    const timingAnalysis = this.analyzeResponseTiming(challenge, response);
    
    // Analyze audio patterns
    const audioAnalysis = this.analyzeAudioForLiveness(response.audioData);
    
    // Calculate overall confidence
    const confidence = this.calculateLivenessConfidence(textAnalysis, timingAnalysis, audioAnalysis);
    
    const reasons = [
      ...textAnalysis.issues,
      ...timingAnalysis.issues,
      ...audioAnalysis.issues
    ];
    
    const isLive = confidence >= 0.7 && reasons.length === 0;
    
    // Clean up used challenge
    this.activeChallenges.delete(response.challengeId);
    
    return {
      isLive,
      confidence,
      reasons,
      timingAnalysis: {
        responseTime: response.responseTime,
        naturalPacing: timingAnalysis.naturalPacing,
        pausePattern: timingAnalysis.pausePattern
      }
    };
  }

  private analyzeTranscribedText(challenge: LivenessChallenge, transcribed: string) {
    const transcribedWords = transcribed.toLowerCase().split(' ');
    const matchedWords = challenge.expectedWords.filter(word => 
      transcribedWords.some(t => t.includes(word) || word.includes(t))
    );
    
    const wordMatchRatio = matchedWords.length / challenge.expectedWords.length;
    const issues: string[] = [];
    
    if (wordMatchRatio < 0.6) {
      issues.push('Transcribed text does not match challenge phrase');
    }
    
    // Check for time-sensitive elements
    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    const currentDate = now.toLocaleDateString();
    
    if (challenge.phrase.includes(currentTime.split(':')[0]) && 
        !transcribed.includes(currentTime.split(':')[0])) {
      issues.push('Time reference mismatch');
    }
    
    return { wordMatchRatio, issues };
  }

  private analyzeResponseTiming(challenge: LivenessChallenge, response: LivenessResponse) {
    const responseTime = response.responseTime;
    const naturalPacing = responseTime >= 3000 && responseTime <= 15000; // 3-15 seconds is natural
    const pausePattern = true; // Will be enhanced with audio analysis
    
    const issues: string[] = [];
    
    if (responseTime < 1000) {
      issues.push('Response too fast - possible playback');
    }
    
    if (responseTime > 30000) {
      issues.push('Response too slow - possible manipulation');
    }
    
    return { naturalPacing, pausePattern, issues };
  }

  private analyzeAudioForLiveness(audioData: string) {
    // Basic audio analysis for liveness indicators
    try {
      const buffer = Buffer.from(audioData, 'base64');
      const features = extractEnhancedAudioFeatures(buffer);
      
      const issues: string[] = [];
      
      // Check for natural variation
      if (features.naturalVariation < 0.3) {
        issues.push('Audio lacks natural variation');
      }
      
      // Check for micro pauses
      if (features.microPauses < 2) {
        issues.push('Missing natural speech pauses');
      }
      
      // Check signal quality
      if (features.signalToNoiseRatio < 10) {
        issues.push('Poor audio quality or processing artifacts');
      }
      
      return { issues, features };
    } catch (error) {
      return { issues: ['Audio analysis failed'], features: null };
    }
  }

  private calculateLivenessConfidence(textAnalysis: any, timingAnalysis: any, audioAnalysis: any): number {
    let confidence = 0;
    
    // Text matching (40% weight)
    confidence += textAnalysis.wordMatchRatio * 0.4;
    
    // Timing analysis (30% weight)
    if (timingAnalysis.naturalPacing) confidence += 0.3;
    
    // Audio quality (30% weight)
    if (audioAnalysis.features) {
      const audioScore = Math.min(1, 
        (audioAnalysis.features.naturalVariation + 
         audioAnalysis.features.microPauses / 5 + 
         Math.min(1, audioAnalysis.features.signalToNoiseRatio / 20)) / 3
      );
      confidence += audioScore * 0.3;
    }
    
    return Math.min(1, confidence);
  }

  private cleanupExpiredChallenges() {
    const now = Date.now();
    const entries = Array.from(this.activeChallenges.entries());
    for (let i = 0; i < entries.length; i++) {
      const [id, challenge] = entries[i];
      if (now > challenge.expiresAt) {
        this.activeChallenges.delete(id);
      }
    }
  }
}

// =============================================================================
// ANTI-SPOOFING DETECTION
// =============================================================================

export class AntiSpoofingDetector {
  
  analyzeForSpoofing(audioData: string): AntiSpoofingResult {
    try {
      const buffer = Buffer.from(audioData, 'base64');
      const features = extractEnhancedAudioFeatures(buffer);
      
      const detectedArtifacts: string[] = [];
      let riskScore = 0;
      
      // Check for compression artifacts
      const compressionRisk = this.detectCompressionArtifacts(buffer);
      if (compressionRisk.detected) {
        detectedArtifacts.push('Compression artifacts detected');
        riskScore += compressionRisk.severity;
      }
      
      // Check for unnatural audio characteristics
      const unnaturalRisk = this.detectUnnaturalCharacteristics(features);
      if (unnaturalRisk.detected) {
        detectedArtifacts.push('Unnatural audio characteristics');
        riskScore += unnaturalRisk.severity;
      }
      
      // Check for playback indicators
      const playbackRisk = this.detectPlaybackIndicators(features);
      if (playbackRisk.detected) {
        detectedArtifacts.push('Possible recording playback');
        riskScore += playbackRisk.severity;
      }
      
      // Check for synthesis indicators
      const synthesisRisk = this.detectSynthesisIndicators(features);
      if (synthesisRisk.detected) {
        detectedArtifacts.push('Possible synthetic voice');
        riskScore += synthesisRisk.severity;
      }
      
      const riskLevel = riskScore < 0.3 ? 'low' : riskScore < 0.7 ? 'medium' : 'high';
      const isSpoofed = riskScore >= 0.5;
      
      const recommendations = this.generateRecommendations(detectedArtifacts, riskLevel);
      
      return {
        isSpoofed,
        confidence: Math.min(1, riskScore),
        detectedArtifacts,
        riskLevel,
        recommendations
      };
      
    } catch (error) {
      return {
        isSpoofed: true,
        confidence: 1,
        detectedArtifacts: ['Audio processing error'],
        riskLevel: 'high',
        recommendations: ['Retry with clear audio recording']
      };
    }
  }

  private detectCompressionArtifacts(buffer: Buffer) {
    // Look for signs of heavy compression
    let artifactCount = 0;
    let totalSamples = 0;
    
    for (let i = 1; i < buffer.length - 1; i++) {
      const current = buffer[i];
      const prev = buffer[i - 1];
      const next = buffer[i + 1];
      
      // Check for compression stepping
      if (Math.abs(current - prev) > 50 && Math.abs(next - current) > 50) {
        artifactCount++;
      }
      totalSamples++;
    }
    
    const artifactRatio = artifactCount / totalSamples;
    const detected = artifactRatio > 0.1;
    const severity = Math.min(1, artifactRatio * 5);
    
    return { detected, severity };
  }

  private detectUnnaturalCharacteristics(features: EnhancedAudioFeatures) {
    let unnaturalScore = 0;
    
    // Check for too perfect characteristics
    if (features.naturalVariation < 0.1) unnaturalScore += 0.3;
    if (features.microPauses === 0) unnaturalScore += 0.2;
    if (!features.breathingDetected) unnaturalScore += 0.2;
    if (features.emotionalMarkers < 0.1) unnaturalScore += 0.2;
    if (features.dynamicRange < 10) unnaturalScore += 0.1;
    
    return {
      detected: unnaturalScore > 0.3,
      severity: Math.min(1, unnaturalScore)
    };
  }

  private detectPlaybackIndicators(features: EnhancedAudioFeatures) {
    let playbackScore = 0;
    
    // Check for recording artifacts
    if (features.backgroundNoise < 5) playbackScore += 0.2; // Too clean
    if (features.signalToNoiseRatio > 50) playbackScore += 0.2; // Too perfect
    if (features.clippingDetected) playbackScore += 0.3; // Over-amplified
    if (features.zeroCrossingRate < 0.1) playbackScore += 0.3; // Unnatural
    
    return {
      detected: playbackScore > 0.4,
      severity: Math.min(1, playbackScore)
    };
  }

  private detectSynthesisIndicators(features: EnhancedAudioFeatures) {
    let synthesisScore = 0;
    
    // Check for synthetic voice characteristics
    if (features.spectralFlux < 0.1) synthesisScore += 0.3;
    if (features.temporalCentroid < 0.2) synthesisScore += 0.2;
    if (features.vocalTremor === 0) synthesisScore += 0.2;
    if (features.pitch > 0 && features.pitch < 50) synthesisScore += 0.3; // Unnaturally low
    if (features.pitch > 500) synthesisScore += 0.3; // Unnaturally high
    
    return {
      detected: synthesisScore > 0.4,
      severity: Math.min(1, synthesisScore)
    };
  }

  private generateRecommendations(artifacts: string[], riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (artifacts.includes('Compression artifacts detected')) {
      recommendations.push('Use uncompressed audio recording');
      recommendations.push('Ensure good microphone quality');
    }
    
    if (artifacts.includes('Unnatural audio characteristics')) {
      recommendations.push('Speak naturally and vary your tone');
      recommendations.push('Include natural pauses in your speech');
    }
    
    if (artifacts.includes('Possible recording playback')) {
      recommendations.push('Record live audio directly');
      recommendations.push('Ensure you are in a natural environment');
    }
    
    if (artifacts.includes('Possible synthetic voice')) {
      recommendations.push('Use your natural speaking voice');
      recommendations.push('Avoid voice modulation software');
    }
    
    if (riskLevel === 'high') {
      recommendations.push('Contact support if you believe this is an error');
    }
    
    return recommendations;
  }
}

// =============================================================================
// ENHANCED AUDIO FEATURE EXTRACTION
// =============================================================================

export function extractEnhancedAudioFeatures(audioBuffer: Buffer): EnhancedAudioFeatures {
  // Extract basic features first
  const basicFeatures = extractBasicFeatures(audioBuffer);
  
  // Add enhanced analysis
  const enhancedFeatures = {
    ...basicFeatures,
    
    // Advanced spectral features
    zeroCrossingRate: calculateZeroCrossingRate(audioBuffer),
    spectralRolloff: calculateSpectralRolloff(audioBuffer),
    spectralFlux: calculateSpectralFlux(audioBuffer),
    temporalCentroid: calculateTemporalCentroid(audioBuffer),
    
    // Quality indicators
    signalToNoiseRatio: calculateSNR(audioBuffer),
    dynamicRange: calculateDynamicRange(audioBuffer),
    clippingDetected: detectClipping(audioBuffer),
    
    // Liveness indicators
    naturalVariation: calculateNaturalVariation(audioBuffer),
    microPauses: countMicroPauses(audioBuffer),
    breathingDetected: detectBreathing(audioBuffer),
    emotionalMarkers: detectEmotionalMarkers(audioBuffer),
  };
  
  return enhancedFeatures;
}

// Helper functions for enhanced audio analysis
function extractBasicFeatures(buffer: Buffer): any {
  // Use existing enhanced voice features as base
  const duration = Math.max(1, buffer.length / 1000);
  let totalEnergy = 0;
  let sampleCount = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    totalEnergy += Math.abs(buffer[i]);
    sampleCount++;
  }
  
  const avgFrequency = sampleCount > 0 ? totalEnergy / sampleCount : 100;
  
  return {
    duration,
    avgFrequency,
    pitch: avgFrequency * 0.8,
    tempo: duration > 0 ? sampleCount / duration : 50,
    energy: totalEnergy,
    spectralCentroid: avgFrequency * 1.2,
    fingerprint: createHash('sha256').update(buffer).digest('hex').substring(0, 32),
    voiceStrain: Math.min(100, totalEnergy / 1000),
    backgroundNoise: Math.min(100, Math.abs(buffer[0]) / 10),
    speechClarity: Math.min(100, avgFrequency / 5),
    breathingPattern: 50,
    vocalTremor: 0,
    environmentType: 'unknown' as const,
    deviceQuality: 75,
    consistencyScore: 0,
    adaptationNeeded: false,
    confidenceLevel: 0,
  };
}

function calculateZeroCrossingRate(buffer: Buffer): number {
  let crossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0) !== (buffer[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / buffer.length;
}

function calculateSpectralRolloff(buffer: Buffer): number {
  // Simplified spectral rolloff calculation
  let highFreqEnergy = 0;
  let totalEnergy = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    const energy = Math.abs(buffer[i]);
    totalEnergy += energy;
    if (i > buffer.length / 2) {
      highFreqEnergy += energy;
    }
  }
  
  return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
}

function calculateSpectralFlux(buffer: Buffer): number {
  let flux = 0;
  const windowSize = 256;
  
  for (let i = windowSize; i < buffer.length - windowSize; i += windowSize) {
    let currentPower = 0;
    let prevPower = 0;
    
    for (let j = 0; j < windowSize; j++) {
      currentPower += Math.pow(buffer[i + j], 2);
      prevPower += Math.pow(buffer[i - windowSize + j], 2);
    }
    
    flux += Math.abs(currentPower - prevPower);
  }
  
  return flux / (buffer.length / windowSize);
}

function calculateTemporalCentroid(buffer: Buffer): number {
  let centroid = 0;
  let totalEnergy = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    const energy = Math.abs(buffer[i]);
    centroid += i * energy;
    totalEnergy += energy;
  }
  
  return totalEnergy > 0 ? centroid / totalEnergy / buffer.length : 0;
}

function calculateSNR(buffer: Buffer): number {
  // Estimate signal-to-noise ratio
  let signalPower = 0;
  let minNoise = Infinity;
  
  for (let i = 0; i < buffer.length; i++) {
    signalPower += Math.pow(buffer[i], 2);
    const abs = Math.abs(buffer[i]);
    if (abs < minNoise) minNoise = abs;
  }
  
  signalPower = signalPower / buffer.length;
  const noisePower = minNoise;
  
  return signalPower > 0 && noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;
}

function calculateDynamicRange(buffer: Buffer): number {
  let max = -Infinity;
  let min = Infinity;
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] > max) max = buffer[i];
    if (buffer[i] < min) min = buffer[i];
  }
  return max - min;
}

function detectClipping(buffer: Buffer): boolean {
  let maxValue = 0;
  for (let i = 0; i < buffer.length; i++) {
    const absValue = Math.abs(buffer[i]);
    if (absValue > maxValue) maxValue = absValue;
  }
  const clippingThreshold = 240; // Near maximum for 8-bit samples
  return maxValue >= clippingThreshold;
}

function calculateNaturalVariation(buffer: Buffer): number {
  let variation = 0;
  const windowSize = 100;
  
  for (let i = 0; i < buffer.length - windowSize; i += windowSize) {
    const window = buffer.slice(i, i + windowSize);
    const mean = window.reduce((sum, val) => sum + val, 0) / windowSize;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowSize;
    variation += Math.sqrt(variance);
  }
  
  return variation / (buffer.length / windowSize) / 100; // Normalize
}

function countMicroPauses(buffer: Buffer): number {
  let pauses = 0;
  let inPause = false;
  const pauseThreshold = 20;
  const minPauseLength = 5;
  let pauseLength = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    const amplitude = Math.abs(buffer[i]);
    
    if (amplitude < pauseThreshold) {
      if (!inPause) {
        inPause = true;
        pauseLength = 1;
      } else {
        pauseLength++;
      }
    } else {
      if (inPause && pauseLength >= minPauseLength) {
        pauses++;
      }
      inPause = false;
      pauseLength = 0;
    }
  }
  
  return pauses;
}

function detectBreathing(buffer: Buffer): boolean {
  // Look for low-frequency, low-amplitude patterns that might indicate breathing
  let breathingIndicators = 0;
  const windowSize = 500;
  
  for (let i = 0; i < buffer.length - windowSize; i += windowSize) {
    const window = buffer.slice(i, i + windowSize);
    const avgAmplitude = window.reduce((sum, val) => sum + Math.abs(val), 0) / windowSize;
    
    // Breathing typically creates very low amplitude patterns
    if (avgAmplitude > 0 && avgAmplitude < 10) {
      breathingIndicators++;
    }
  }
  
  return breathingIndicators > 2; // At least 2 potential breathing patterns
}

function detectEmotionalMarkers(buffer: Buffer): number {
  // Look for variations in pitch and energy that indicate natural emotional expression
  let markers = 0;
  const windowSize = 200;
  
  for (let i = windowSize; i < buffer.length - windowSize; i += windowSize) {
    const currentWindow = buffer.slice(i, i + windowSize);
    const prevWindow = buffer.slice(i - windowSize, i);
    
    const currentEnergy = currentWindow.reduce((sum, val) => sum + Math.abs(val), 0) / windowSize;
    const prevEnergy = prevWindow.reduce((sum, val) => sum + Math.abs(val), 0) / windowSize;
    
    // Emotional speech has natural energy variations
    const energyChange = Math.abs(currentEnergy - prevEnergy);
    if (energyChange > 10) {
      markers++;
    }
  }
  
  return markers / (buffer.length / windowSize); // Normalize
}

// Export singleton instances
export const livenessDetector = new LivenessDetector();
export const antiSpoofingDetector = new AntiSpoofingDetector();