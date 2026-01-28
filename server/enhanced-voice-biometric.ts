import { createHash } from 'crypto';
import { advancedAudioProcessor, type AdvancedAudioFeatures } from './advanced-audio-processing';

// Enhanced voice feature interfaces
export interface EnhancedVoiceFeatures {
  // Basic features (existing)
  duration: number;
  avgFrequency: number;
  pitch: number;
  tempo: number;
  energy: number;
  spectralCentroid: number;
  fingerprint: string;
  
  // Enhanced features for health monitoring
  voiceStrain: number; // 0-100 strain indicator
  backgroundNoise: number; // 0-100 noise level
  speechClarity: number; // 0-100 clarity score
  breathingPattern: number; // Breathing irregularities
  vocalTremor: number; // Voice tremor detection
  
  // Environmental factors
  environmentType: 'quiet' | 'noisy' | 'outdoor' | 'vehicle' | 'office' | 'unknown';
  deviceQuality: number; // Microphone quality assessment
  
  // Adaptive features
  consistencyScore: number; // How consistent with previous samples
  adaptationNeeded: boolean; // Whether adaptation is recommended
  confidenceLevel: number; // 0-100 confidence in biometric match
}

export interface VoiceHealthAssessment {
  overallHealth: 'healthy' | 'mild_strain' | 'significant_strain' | 'illness_detected';
  healthScore: number; // 0-100 overall voice health
  recommendations: string[];
  anomalies: string[];
  requiresAdaptation: boolean;
  suggestedThresholdAdjustment: number; // Percentage adjustment to thresholds
}

export interface AdaptiveLearningData {
  samples: EnhancedVoiceFeatures[];
  averageFeatures: EnhancedVoiceFeatures;
  varianceMetrics: Record<string, number>;
  learningProgress: number; // 0-100 how well the system knows the user
  recommendedSampleCount: number;
}

// Enhanced voice feature extraction
export function extractEnhancedVoiceFeatures(audioBuffer: Buffer): EnhancedVoiceFeatures {
  // Basic feature extraction (existing logic)
  const duration = Math.max(1, audioBuffer.length / 1000);
  
  let totalEnergy = 0;
  let avgFrequency = 0;
  let sampleCount = 0;
  let highFreqEnergy = 0;
  let lowFreqEnergy = 0;
  
  const startOffset = Math.min(1000, audioBuffer.length / 4);
  const endOffset = Math.max(startOffset + 100, audioBuffer.length - 1000);
  
  for (let i = startOffset; i < endOffset && i < audioBuffer.length; i++) {
    const sample = audioBuffer[i];
    const energy = Math.abs(sample);
    totalEnergy += energy;
    
    // Frequency analysis for enhanced features
    if (i % 2 === 0) {
      highFreqEnergy += energy;
    } else {
      lowFreqEnergy += energy;
    }
    
    sampleCount++;
  }
  
  avgFrequency = sampleCount > 0 ? totalEnergy / sampleCount : 100;
  
  // Enhanced feature calculations
  const voiceStrain = calculateVoiceStrain(audioBuffer, totalEnergy, sampleCount);
  const backgroundNoise = calculateBackgroundNoise(audioBuffer);
  const speechClarity = calculateSpeechClarity(highFreqEnergy, lowFreqEnergy);
  const breathingPattern = analyzeBreathingPattern(audioBuffer);
  const vocalTremor = detectVocalTremor(audioBuffer);
  const environmentType = classifyEnvironment(backgroundNoise, totalEnergy);
  const deviceQuality = assessDeviceQuality(audioBuffer);
  
  const fingerprint = generateVoiceFingerprint(audioBuffer);
  
  return {
    // Basic features
    duration,
    avgFrequency,
    pitch: avgFrequency * 0.8,
    tempo: duration > 0 ? sampleCount / duration : 50,
    energy: totalEnergy,
    spectralCentroid: avgFrequency * 1.2,
    fingerprint,
    
    // Enhanced features
    voiceStrain,
    backgroundNoise,
    speechClarity,
    breathingPattern,
    vocalTremor,
    environmentType,
    deviceQuality,
    
    // Adaptive features (to be calculated by comparison functions)
    consistencyScore: 0,
    adaptationNeeded: false,
    confidenceLevel: 0,
  };
}

// Voice strain analysis
function calculateVoiceStrain(audioBuffer: Buffer, totalEnergy: number, sampleCount: number): number {
  if (sampleCount === 0) return 0;
  
  const avgEnergy = totalEnergy / sampleCount;
  let varianceSum = 0;
  let peakCount = 0;
  
  for (let i = 1; i < audioBuffer.length - 1; i++) {
    const energy = Math.abs(audioBuffer[i]);
    varianceSum += Math.pow(energy - avgEnergy, 2);
    
    // Count energy peaks (potential strain indicators)
    if (energy > audioBuffer[i-1] && energy > audioBuffer[i+1] && energy > avgEnergy * 1.5) {
      peakCount++;
    }
  }
  
  const variance = varianceSum / sampleCount;
  const strainIndicator = Math.min(100, (variance / 1000) + (peakCount / 10));
  
  return Math.round(strainIndicator);
}

// Background noise detection
function calculateBackgroundNoise(audioBuffer: Buffer): number {
  const samples = audioBuffer.slice(0, Math.min(500, audioBuffer.length));
  let minEnergy = Infinity;
  let noiseFloor = 0;
  
  for (let i = 0; i < samples.length; i++) {
    const energy = Math.abs(samples[i]);
    if (energy < minEnergy) {
      minEnergy = energy;
    }
    noiseFloor += energy;
  }
  
  noiseFloor = noiseFloor / samples.length;
  const noiseLevel = Math.min(100, (noiseFloor / 50) * 100);
  
  return Math.round(noiseLevel);
}

// Speech clarity assessment
function calculateSpeechClarity(highFreqEnergy: number, lowFreqEnergy: number): number {
  if (highFreqEnergy + lowFreqEnergy === 0) return 0;
  
  const ratio = highFreqEnergy / (highFreqEnergy + lowFreqEnergy);
  const clarity = Math.min(100, ratio * 150); // Higher frequencies indicate clearer speech
  
  return Math.round(clarity);
}

// Breathing pattern analysis
function analyzeBreathingPattern(audioBuffer: Buffer): number {
  let silencePeriods = 0;
  let inSilence = false;
  const silenceThreshold = 10;
  
  for (let i = 0; i < audioBuffer.length; i++) {
    const energy = Math.abs(audioBuffer[i]);
    
    if (energy < silenceThreshold && !inSilence) {
      inSilence = true;
      silencePeriods++;
    } else if (energy >= silenceThreshold) {
      inSilence = false;
    }
  }
  
  // Normal breathing should have some pauses
  const breathingScore = Math.min(100, silencePeriods * 20);
  return Math.round(breathingScore);
}

// Vocal tremor detection
function detectVocalTremor(audioBuffer: Buffer): number {
  let rapidChanges = 0;
  const changeThreshold = 20;
  
  for (let i = 1; i < audioBuffer.length; i++) {
    const change = Math.abs(audioBuffer[i] - audioBuffer[i-1]);
    if (change > changeThreshold) {
      rapidChanges++;
    }
  }
  
  const tremorScore = Math.min(100, (rapidChanges / audioBuffer.length) * 1000);
  return Math.round(tremorScore);
}

// Environment classification
function classifyEnvironment(backgroundNoise: number, totalEnergy: number): EnhancedVoiceFeatures['environmentType'] {
  if (backgroundNoise < 20) return 'quiet';
  if (backgroundNoise < 40) return 'office';
  if (backgroundNoise < 60) return 'noisy';
  if (backgroundNoise < 80) return 'vehicle';
  if (backgroundNoise >= 80) return 'outdoor';
  return 'unknown';
}

// Device quality assessment
function assessDeviceQuality(audioBuffer: Buffer): number {
  // Simple quality assessment based on sample consistency
  let consistency = 0;
  const sampleSize = Math.min(100, audioBuffer.length);
  
  for (let i = 1; i < sampleSize; i++) {
    const diff = Math.abs(audioBuffer[i] - audioBuffer[i-1]);
    if (diff < 50) consistency++; // Lower diff indicates better quality
  }
  
  const quality = (consistency / sampleSize) * 100;
  return Math.round(quality);
}

// Enhanced voice comparison with adaptive learning
export function compareEnhancedVoiceFeatures(
  stored: EnhancedVoiceFeatures[], 
  captured: EnhancedVoiceFeatures,
  userAdaptationLevel: number = 1
): { similarity: number; healthAssessment: VoiceHealthAssessment; adaptationData: AdaptiveLearningData } {
  
  if (stored.length === 0) {
    return {
      similarity: 0,
      healthAssessment: assessVoiceHealth(captured),
      adaptationData: {
        samples: [captured],
        averageFeatures: captured,
        varianceMetrics: {},
        learningProgress: 0,
        recommendedSampleCount: 5
      }
    };
  }
  
  // Calculate average of stored features
  const avgStored = calculateAverageFeatures(stored);
  
  // Adaptive weights based on user's adaptation level
  const weights = getAdaptiveWeights(userAdaptationLevel);
  
  let similarity = 0;
  
  // Enhanced comparison with health-aware adjustments
  const healthAssessment = assessVoiceHealth(captured);
  const healthMultiplier = getHealthAdjustmentMultiplier(healthAssessment);
  
  // Compare each feature with adaptive thresholds
  similarity += compareFeature(avgStored.pitch, captured.pitch, weights.pitch) * healthMultiplier;
  similarity += compareFeature(avgStored.energy, captured.energy, weights.energy) * healthMultiplier;
  similarity += compareFeature(avgStored.avgFrequency, captured.avgFrequency, weights.frequency);
  similarity += compareFeature(avgStored.tempo, captured.tempo, weights.tempo);
  similarity += compareFeature(avgStored.speechClarity, captured.speechClarity, weights.clarity);
  
  // Environment-aware adjustments
  if (captured.environmentType === avgStored.environmentType) {
    similarity += 0.1; // Bonus for same environment
  }
  
  // Device quality adjustments
  if (captured.deviceQuality > 70) {
    similarity += 0.05; // Bonus for good quality
  }
  
  // Consistency bonus for regular users
  if (userAdaptationLevel > 3) {
    captured.consistencyScore = calculateConsistencyScore(stored, captured);
    similarity += captured.consistencyScore * 0.1;
  }
  
  captured.confidenceLevel = Math.round(similarity * 100);
  captured.adaptationNeeded = similarity < 0.7 || healthAssessment.requiresAdaptation;
  
  const adaptationData: AdaptiveLearningData = {
    samples: [...stored, captured],
    averageFeatures: calculateAverageFeatures([...stored, captured]),
    varianceMetrics: calculateVarianceMetrics(stored),
    learningProgress: Math.min(100, userAdaptationLevel * 20),
    recommendedSampleCount: Math.max(3, 10 - userAdaptationLevel)
  };
  
  return { similarity, healthAssessment, adaptationData };
}

// Voice health assessment
function assessVoiceHealth(features: EnhancedVoiceFeatures): VoiceHealthAssessment {
  const recommendations: string[] = [];
  const anomalies: string[] = [];
  let healthScore = 100;
  
  // Analyze voice strain
  if (features.voiceStrain > 70) {
    healthScore -= 30;
    anomalies.push('High voice strain detected');
    recommendations.push('Take vocal rest and stay hydrated');
  } else if (features.voiceStrain > 40) {
    healthScore -= 15;
    recommendations.push('Monitor voice usage and consider vocal warm-ups');
  }
  
  // Analyze clarity
  if (features.speechClarity < 30) {
    healthScore -= 20;
    anomalies.push('Reduced speech clarity');
    recommendations.push('Check for congestion or speak more slowly');
  }
  
  // Analyze tremor
  if (features.vocalTremor > 60) {
    healthScore -= 25;
    anomalies.push('Vocal tremor detected');
    recommendations.push('Consider stress reduction or medical consultation');
  }
  
  // Analyze breathing
  if (features.breathingPattern < 20) {
    healthScore -= 15;
    anomalies.push('Irregular breathing pattern');
    recommendations.push('Practice deep breathing exercises');
  }
  
  // Background noise adjustments
  if (features.backgroundNoise > 60) {
    recommendations.push('Try to use the system in a quieter environment');
  }
  
  let overallHealth: VoiceHealthAssessment['overallHealth'];
  if (healthScore >= 80) overallHealth = 'healthy';
  else if (healthScore >= 60) overallHealth = 'mild_strain';
  else if (healthScore >= 40) overallHealth = 'significant_strain';
  else overallHealth = 'illness_detected';
  
  const requiresAdaptation = healthScore < 70 || features.voiceStrain > 50;
  const suggestedThresholdAdjustment = healthScore < 70 ? Math.max(-30, -50 + healthScore) : 0;
  
  return {
    overallHealth,
    healthScore,
    recommendations,
    anomalies,
    requiresAdaptation,
    suggestedThresholdAdjustment
  };
}

// Helper functions
function calculateAverageFeatures(features: EnhancedVoiceFeatures[]): EnhancedVoiceFeatures {
  if (features.length === 0) throw new Error('No features to average');
  
  const sum = features.reduce((acc, curr) => ({
    duration: acc.duration + curr.duration,
    avgFrequency: acc.avgFrequency + curr.avgFrequency,
    pitch: acc.pitch + curr.pitch,
    tempo: acc.tempo + curr.tempo,
    energy: acc.energy + curr.energy,
    spectralCentroid: acc.spectralCentroid + curr.spectralCentroid,
    voiceStrain: acc.voiceStrain + curr.voiceStrain,
    backgroundNoise: acc.backgroundNoise + curr.backgroundNoise,
    speechClarity: acc.speechClarity + curr.speechClarity,
    breathingPattern: acc.breathingPattern + curr.breathingPattern,
    vocalTremor: acc.vocalTremor + curr.vocalTremor,
    deviceQuality: acc.deviceQuality + curr.deviceQuality,
    consistencyScore: acc.consistencyScore + curr.consistencyScore,
    confidenceLevel: acc.confidenceLevel + curr.confidenceLevel,
    fingerprint: acc.fingerprint, // Keep first fingerprint
    environmentType: acc.environmentType, // Keep first environment
    adaptationNeeded: acc.adaptationNeeded, // Keep first value
  }));
  
  const count = features.length;
  return {
    duration: sum.duration / count,
    avgFrequency: sum.avgFrequency / count,
    pitch: sum.pitch / count,
    tempo: sum.tempo / count,
    energy: sum.energy / count,
    spectralCentroid: sum.spectralCentroid / count,
    voiceStrain: sum.voiceStrain / count,
    backgroundNoise: sum.backgroundNoise / count,
    speechClarity: sum.speechClarity / count,
    breathingPattern: sum.breathingPattern / count,
    vocalTremor: sum.vocalTremor / count,
    deviceQuality: sum.deviceQuality / count,
    consistencyScore: sum.consistencyScore / count,
    confidenceLevel: sum.confidenceLevel / count,
    fingerprint: features[0].fingerprint,
    environmentType: features[0].environmentType,
    adaptationNeeded: false,
  };
}

function getAdaptiveWeights(adaptationLevel: number) {
  // Higher adaptation level = more weight on learned patterns
  const baseWeights = {
    pitch: 0.25,
    energy: 0.2,
    frequency: 0.2,
    tempo: 0.15,
    clarity: 0.2
  };
  
  const adaptationBonus = Math.min(0.1, adaptationLevel * 0.02);
  return Object.fromEntries(
    Object.entries(baseWeights).map(([key, value]) => [key, value + adaptationBonus])
  );
}

function compareFeature(stored: number, captured: number, weight: number): number {
  if (stored === 0 && captured === 0) return weight;
  const diff = Math.abs(stored - captured);
  const max = Math.max(stored, captured);
  const similarity = Math.max(0, 1 - (diff / max));
  return similarity * weight;
}

function getHealthAdjustmentMultiplier(assessment: VoiceHealthAssessment): number {
  switch (assessment.overallHealth) {
    case 'healthy': return 1.0;
    case 'mild_strain': return 0.95;
    case 'significant_strain': return 0.85;
    case 'illness_detected': return 0.7;
    default: return 1.0;
  }
}

function calculateConsistencyScore(historical: EnhancedVoiceFeatures[], current: EnhancedVoiceFeatures): number {
  if (historical.length < 2) return 0;
  
  const recent = historical.slice(-3); // Last 3 samples
  const avgRecent = calculateAverageFeatures(recent);
  
  const similarity = [
    compareFeature(avgRecent.pitch, current.pitch, 1),
    compareFeature(avgRecent.energy, current.energy, 1),
    compareFeature(avgRecent.avgFrequency, current.avgFrequency, 1),
  ].reduce((sum, val) => sum + val, 0) / 3;
  
  return Math.round(similarity * 100);
}

function calculateVarianceMetrics(features: EnhancedVoiceFeatures[]): Record<string, number> {
  if (features.length < 2) return {};
  
  const avg = calculateAverageFeatures(features);
  const variances = {
    pitch: 0,
    energy: 0,
    frequency: 0,
    clarity: 0,
  };
  
  features.forEach(f => {
    variances.pitch += Math.pow(f.pitch - avg.pitch, 2);
    variances.energy += Math.pow(f.energy - avg.energy, 2);
    variances.frequency += Math.pow(f.avgFrequency - avg.avgFrequency, 2);
    variances.clarity += Math.pow(f.speechClarity - avg.speechClarity, 2);
  });
  
  const count = features.length;
  return Object.fromEntries(
    Object.entries(variances).map(([key, value]) => [key, value / count])
  );
}

function generateVoiceFingerprint(audioBuffer: Buffer): string {
  const samples: number[] = [];
  for (let i = 0; i < Math.min(audioBuffer.length, 1000); i += 10) {
    samples.push(audioBuffer[i]);
  }
  
  const hash = createHash('sha256');
  hash.update(Buffer.from(samples));
  return hash.digest('hex').substring(0, 32);
}

// Process base64 audio with enhanced features
export function processEnhancedAudioBase64(base64Audio: string): EnhancedVoiceFeatures {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    return extractEnhancedVoiceFeatures(audioBuffer);
  } catch (error) {
    console.error('Failed to process enhanced audio:', error);
    throw new Error('Invalid audio data');
  }
}

// Process audio with advanced professional-grade features
export function processAdvancedAudioBase64(base64Audio: string): AdvancedAudioFeatures {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    return advancedAudioProcessor.extractAdvancedFeatures(audioBuffer);
  } catch (error) {
    console.error('Failed to process advanced audio:', error);
    throw new Error('Invalid audio data');
  }
}

// Analyze audio quality with detailed metrics
export function analyzeAudioQuality(base64Audio: string) {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const features = advancedAudioProcessor.extractAdvancedFeatures(audioBuffer);
    return advancedAudioProcessor.analyzeAudioQuality(features);
  } catch (error) {
    console.error('Failed to analyze audio quality:', error);
    throw new Error('Invalid audio data');
  }
}