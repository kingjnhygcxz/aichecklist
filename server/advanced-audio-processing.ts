import { createHash } from 'crypto';
import { EnhancedVoiceFeatures } from './enhanced-voice-biometric';

// =============================================================================
// ADVANCED AUDIO PROCESSING ENHANCEMENTS 
// Professional-grade signal processing using free algorithms
// =============================================================================

export interface AdvancedAudioFeatures extends EnhancedVoiceFeatures {
  // Advanced frequency analysis
  fundamentalFrequency: number;
  harmonicRatio: number;
  spectralCentroid: number;
  spectralBandwidth: number;
  spectralSkewness: number;
  spectralKurtosis: number;
  
  // Mel-frequency cepstral coefficients (MFCC-like)
  cepstralCoefficients: number[];
  deltaCoefficients: number[];
  
  // Advanced temporal features
  attackTime: number;
  decayTime: number;
  sustainLevel: number;
  releaseTime: number;
  
  // Voice quality metrics
  jitter: number;           // Pitch perturbation
  shimmer: number;          // Amplitude perturbation  
  harmonicToNoiseRatio: number;
  voicingProbability: number;
  
  // Prosodic features
  stressPattern: number[];
  intonationContour: number[];
  rhythmMetrics: {
    syllableRate: number;
    pauseDuration: number;
    speechRate: number;
  };
  
  // Biometric security features
  voicePrintHash: string;
  uniquenessScore: number;
  consistencyMetrics: {
    pitchStability: number;
    timbreConsistency: number;
    rhythmRegularity: number;
  };
}

export interface AudioQualityMetrics {
  overallQuality: number;    // 0-100 score
  qualityFactors: {
    clarity: number;
    stability: number;
    naturalness: number;
    uniqueness: number;
  };
  recommendations: string[];
  warnings: string[];
}

// =============================================================================
// ADVANCED AUDIO PROCESSOR CLASS
// =============================================================================

export class AdvancedAudioProcessor {
  private sampleRate: number = 16000; // Assumed sample rate
  private frameSize: number = 512;    // Frame size for analysis
  
  constructor(sampleRate: number = 16000) {
    this.sampleRate = sampleRate;
    this.frameSize = Math.min(512, Math.floor(sampleRate * 0.032)); // ~32ms frames
  }

  /**
   * Extract comprehensive audio features for voice biometrics
   */
  extractAdvancedFeatures(audioBuffer: Buffer): AdvancedAudioFeatures {
    // Convert buffer to normalized float array
    const audioSamples = this.bufferToFloatArray(audioBuffer);
    
    // Basic features from existing system
    const basicFeatures = this.extractBasicFeatures(audioBuffer);
    
    // Advanced frequency analysis
    const frequencyFeatures = this.extractFrequencyFeatures(audioSamples);
    
    // Temporal analysis
    const temporalFeatures = this.extractTemporalFeatures(audioSamples);
    
    // Voice quality analysis  
    const qualityFeatures = this.extractVoiceQualityFeatures(audioSamples);
    
    // Prosodic analysis
    const prosodicFeatures = this.extractProsodicFeatures(audioSamples);
    
    // Biometric security features
    const securityFeatures = this.extractSecurityFeatures(audioSamples);
    
    return {
      ...basicFeatures,
      ...frequencyFeatures,
      ...temporalFeatures,
      ...qualityFeatures,
      ...prosodicFeatures,
      ...securityFeatures
    };
  }

  /**
   * Analyze audio quality and provide recommendations
   */
  analyzeAudioQuality(features: AdvancedAudioFeatures): AudioQualityMetrics {
    const qualityFactors = {
      clarity: this.calculateClarityScore(features),
      stability: this.calculateStabilityScore(features),
      naturalness: this.calculateNaturalnessScore(features),
      uniqueness: this.calculateUniquenessScore(features)
    };
    
    const overallQuality = Object.values(qualityFactors)
      .reduce((sum, score) => sum + score, 0) / 4;
    
    const { recommendations, warnings } = this.generateQualityRecommendations(features, qualityFactors);
    
    return {
      overallQuality: Math.round(overallQuality),
      qualityFactors: {
        clarity: Math.round(qualityFactors.clarity),
        stability: Math.round(qualityFactors.stability),
        naturalness: Math.round(qualityFactors.naturalness),
        uniqueness: Math.round(qualityFactors.uniqueness)
      },
      recommendations,
      warnings
    };
  }

  // =============================================================================
  // FREQUENCY DOMAIN ANALYSIS
  // =============================================================================

  private extractFrequencyFeatures(samples: Float32Array) {
    // Compute fundamental frequency using autocorrelation
    const fundamentalFrequency = this.computeFundamentalFrequency(samples);
    
    // Compute spectral features using simplified FFT-like analysis
    const spectralFeatures = this.computeSpectralFeatures(samples);
    
    // Compute harmonic analysis
    const harmonicRatio = this.computeHarmonicRatio(samples, fundamentalFrequency);
    
    // Compute MFCC-like coefficients
    const { cepstralCoefficients, deltaCoefficients } = this.computeCepstralFeatures(samples);
    
    return {
      fundamentalFrequency,
      harmonicRatio,
      spectralCentroid: spectralFeatures.centroid,
      spectralBandwidth: spectralFeatures.bandwidth,
      spectralSkewness: spectralFeatures.skewness,
      spectralKurtosis: spectralFeatures.kurtosis,
      cepstralCoefficients,
      deltaCoefficients
    };
  }

  private computeFundamentalFrequency(samples: Float32Array): number {
    // Autocorrelation-based pitch detection
    const maxLag = Math.floor(this.sampleRate / 80);  // Min 80 Hz
    const minLag = Math.floor(this.sampleRate / 400); // Max 400 Hz
    
    let maxCorrelation = 0;
    let bestLag = minLag;
    
    for (let lag = minLag; lag < maxLag && lag < samples.length / 2; lag++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = 0; i < samples.length - lag; i++) {
        correlation += samples[i] * samples[i + lag];
        count++;
      }
      
      correlation = correlation / count;
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }
    
    return bestLag > 0 ? this.sampleRate / bestLag : 0;
  }

  private computeSpectralFeatures(samples: Float32Array) {
    // Simplified spectral analysis using magnitude spectrum approximation
    const frameCount = Math.floor(samples.length / this.frameSize);
    let totalCentroid = 0;
    let totalBandwidth = 0;
    let totalSkewness = 0;
    let totalKurtosis = 0;
    
    for (let frame = 0; frame < frameCount; frame++) {
      const start = frame * this.frameSize;
      const end = Math.min(start + this.frameSize, samples.length);
      const frameData = samples.slice(start, end);
      
      const spectrum = this.computeMagnitudeSpectrum(frameData);
      const centroid = this.computeSpectralCentroid(spectrum);
      const bandwidth = this.computeSpectralBandwidth(spectrum, centroid);
      const skewness = this.computeSpectralSkewness(spectrum, centroid);
      const kurtosis = this.computeSpectralKurtosis(spectrum, centroid);
      
      totalCentroid += centroid;
      totalBandwidth += bandwidth;
      totalSkewness += skewness;
      totalKurtosis += kurtosis;
    }
    
    return {
      centroid: totalCentroid / frameCount,
      bandwidth: totalBandwidth / frameCount,
      skewness: totalSkewness / frameCount,
      kurtosis: totalKurtosis / frameCount
    };
  }

  private computeMagnitudeSpectrum(frame: Float32Array): Float32Array {
    // Simplified magnitude spectrum using energy in frequency bands
    const spectrumSize = Math.floor(frame.length / 2);
    const spectrum = new Float32Array(spectrumSize);
    
    for (let k = 0; k < spectrumSize; k++) {
      let real = 0;
      let imag = 0;
      
      // Simplified DFT for specific frequency bins
      for (let n = 0; n < frame.length; n++) {
        const angle = -2 * Math.PI * k * n / frame.length;
        real += frame[n] * Math.cos(angle);
        imag += frame[n] * Math.sin(angle);
      }
      
      spectrum[k] = Math.sqrt(real * real + imag * imag) / frame.length;
    }
    
    return spectrum;
  }

  private computeSpectralCentroid(spectrum: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * spectrum.length);
      weightedSum += frequency * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  private computeSpectralBandwidth(spectrum: Float32Array, centroid: number): number {
    let variance = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * spectrum.length);
      variance += Math.pow(frequency - centroid, 2) * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? Math.sqrt(variance / magnitudeSum) : 0;
  }

  private computeSpectralSkewness(spectrum: Float32Array, centroid: number): number {
    // Simplified skewness calculation
    let skewness = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * spectrum.length);
      skewness += Math.pow(frequency - centroid, 3) * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? skewness / magnitudeSum : 0;
  }

  private computeSpectralKurtosis(spectrum: Float32Array, centroid: number): number {
    // Simplified kurtosis calculation
    let kurtosis = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * spectrum.length);
      kurtosis += Math.pow(frequency - centroid, 4) * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? kurtosis / magnitudeSum : 0;
  }

  private computeHarmonicRatio(samples: Float32Array, fundamentalFreq: number): number {
    if (fundamentalFreq === 0) return 0;
    
    // Analyze harmonic content vs inharmonic content
    const harmonicBins = [1, 2, 3, 4, 5].map(h => Math.floor(h * fundamentalFreq * samples.length / this.sampleRate));
    const spectrum = this.computeMagnitudeSpectrum(samples);
    
    let harmonicEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const energy = spectrum[i] * spectrum[i];
      totalEnergy += energy;
      
      if (harmonicBins.includes(i)) {
        harmonicEnergy += energy;
      }
    }
    
    return totalEnergy > 0 ? harmonicEnergy / totalEnergy : 0;
  }

  private computeCepstralFeatures(samples: Float32Array) {
    // Simplified MFCC-like analysis
    const spectrum = this.computeMagnitudeSpectrum(samples);
    const melSpectrum = this.computeMelSpectrum(spectrum);
    const cepstralCoefficients = this.computeCepstrum(melSpectrum);
    const deltaCoefficients = this.computeDeltaCoefficients(cepstralCoefficients);
    
    return { cepstralCoefficients, deltaCoefficients };
  }

  private computeMelSpectrum(spectrum: Float32Array): Float32Array {
    // Simplified mel-scale conversion
    const melBanks = 13;
    const melSpectrum = new Float32Array(melBanks);
    
    for (let m = 0; m < melBanks; m++) {
      const start = Math.floor((m * spectrum.length) / melBanks);
      const end = Math.floor(((m + 1) * spectrum.length) / melBanks);
      
      let energy = 0;
      for (let i = start; i < end; i++) {
        energy += spectrum[i];
      }
      melSpectrum[m] = energy / (end - start);
    }
    
    return melSpectrum;
  }

  private computeCepstrum(melSpectrum: Float32Array): number[] {
    // Simplified cepstral analysis (DCT-like)
    const cepstralCount = 12;
    const cepstrum: number[] = [];
    
    for (let c = 0; c < cepstralCount; c++) {
      let sum = 0;
      for (let m = 0; m < melSpectrum.length; m++) {
        const logMel = Math.log(Math.max(melSpectrum[m], 1e-10));
        sum += logMel * Math.cos((Math.PI * c * (m + 0.5)) / melSpectrum.length);
      }
      cepstrum.push(sum);
    }
    
    return cepstrum;
  }

  private computeDeltaCoefficients(cepstrum: number[]): number[] {
    // Simple first-order differences
    const delta: number[] = [];
    for (let i = 1; i < cepstrum.length; i++) {
      delta.push(cepstrum[i] - cepstrum[i - 1]);
    }
    return delta;
  }

  // =============================================================================
  // TEMPORAL ANALYSIS  
  // =============================================================================

  private extractTemporalFeatures(samples: Float32Array) {
    const envelope = this.computeAmplitudeEnvelope(samples);
    
    return {
      attackTime: this.computeAttackTime(envelope),
      decayTime: this.computeDecayTime(envelope),
      sustainLevel: this.computeSustainLevel(envelope),
      releaseTime: this.computeReleaseTime(envelope)
    };
  }

  private computeAmplitudeEnvelope(samples: Float32Array): Float32Array {
    const hopSize = Math.floor(this.frameSize / 4);
    const envelopeLength = Math.floor(samples.length / hopSize);
    const envelope = new Float32Array(envelopeLength);
    
    for (let i = 0; i < envelopeLength; i++) {
      const start = i * hopSize;
      const end = Math.min(start + this.frameSize, samples.length);
      
      let rms = 0;
      for (let j = start; j < end; j++) {
        rms += samples[j] * samples[j];
      }
      envelope[i] = Math.sqrt(rms / (end - start));
    }
    
    return envelope;
  }

  private computeAttackTime(envelope: Float32Array): number {
    const maxValue = Math.max.apply(Math, Array.from(envelope));
    const threshold = maxValue * 0.9;
    
    for (let i = 0; i < envelope.length; i++) {
      if (envelope[i] >= threshold) {
        return (i * this.frameSize) / (4 * this.sampleRate); // Convert to seconds
      }
    }
    return 0;
  }

  private computeDecayTime(envelope: Float32Array): number {
    const maxIndex = envelope.indexOf(Math.max.apply(Math, Array.from(envelope)));
    if (maxIndex === -1) return 0;
    
    const maxValue = envelope[maxIndex];
    const sustainThreshold = maxValue * 0.5;
    
    for (let i = maxIndex; i < envelope.length; i++) {
      if (envelope[i] <= sustainThreshold) {
        return ((i - maxIndex) * this.frameSize) / (4 * this.sampleRate);
      }
    }
    return 0;
  }

  private computeSustainLevel(envelope: Float32Array): number {
    const maxValue = Math.max.apply(Math, Array.from(envelope));
    const sustainStart = Math.floor(envelope.length * 0.3);
    const sustainEnd = Math.floor(envelope.length * 0.7);
    
    let sustainSum = 0;
    let sustainCount = 0;
    
    for (let i = sustainStart; i < sustainEnd; i++) {
      sustainSum += envelope[i];
      sustainCount++;
    }
    
    const sustainLevel = sustainCount > 0 ? sustainSum / sustainCount : 0;
    return maxValue > 0 ? sustainLevel / maxValue : 0;
  }

  private computeReleaseTime(envelope: Float32Array): number {
    const sustainEnd = Math.floor(envelope.length * 0.7);
    const endValue = envelope[envelope.length - 1];
    const startValue = envelope[sustainEnd];
    
    return startValue > endValue ? ((envelope.length - sustainEnd) * this.frameSize) / (4 * this.sampleRate) : 0;
  }

  // =============================================================================
  // VOICE QUALITY ANALYSIS
  // =============================================================================

  private extractVoiceQualityFeatures(samples: Float32Array) {
    return {
      jitter: this.computeJitter(samples),
      shimmer: this.computeShimmer(samples),
      harmonicToNoiseRatio: this.computeHNR(samples),
      voicingProbability: this.computeVoicingProbability(samples)
    };
  }

  private computeJitter(samples: Float32Array): number {
    // Pitch period variation (simplified)
    const periods = this.extractPitchPeriods(samples);
    if (periods.length < 2) return 0;
    
    let totalVariation = 0;
    for (let i = 1; i < periods.length; i++) {
      totalVariation += Math.abs(periods[i] - periods[i - 1]);
    }
    
    const avgPeriod = periods.reduce((sum, p) => sum + p, 0) / periods.length;
    return avgPeriod > 0 ? (totalVariation / (periods.length - 1)) / avgPeriod : 0;
  }

  private computeShimmer(samples: Float32Array): number {
    // Amplitude variation between periods
    const amplitudes = this.extractPeriodAmplitudes(samples);
    if (amplitudes.length < 2) return 0;
    
    let totalVariation = 0;
    for (let i = 1; i < amplitudes.length; i++) {
      totalVariation += Math.abs(amplitudes[i] - amplitudes[i - 1]);
    }
    
    const avgAmplitude = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
    return avgAmplitude > 0 ? (totalVariation / (amplitudes.length - 1)) / avgAmplitude : 0;
  }

  private computeHNR(samples: Float32Array): number {
    // Harmonic-to-noise ratio estimation
    const spectrum = this.computeMagnitudeSpectrum(samples);
    const fundamentalFreq = this.computeFundamentalFrequency(samples);
    
    if (fundamentalFreq === 0) return 0;
    
    const harmonicBin = Math.floor(fundamentalFreq * spectrum.length / (this.sampleRate / 2));
    const harmonicEnergy = harmonicBin < spectrum.length ? spectrum[harmonicBin] : 0;
    
    // Estimate noise as average of non-harmonic bins
    let noiseEnergy = 0;
    let noiseCount = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      if (Math.abs(i - harmonicBin) > 2) { // Skip harmonic region
        noiseEnergy += spectrum[i];
        noiseCount++;
      }
    }
    
    const avgNoise = noiseCount > 0 ? noiseEnergy / noiseCount : 1e-10;
    return harmonicEnergy > 0 ? 20 * Math.log10(harmonicEnergy / avgNoise) : 0;
  }

  private computeVoicingProbability(samples: Float32Array): number {
    // Estimate probability that the signal is voiced
    const zcr = this.computeZeroCrossingRate(samples);
    const energy = this.computeEnergy(samples);
    const harmonicity = this.computeHarmonicRatio(samples, this.computeFundamentalFrequency(samples));
    
    // Voiced speech typically has low ZCR, moderate energy, and high harmonicity
    const zcrScore = Math.max(0, 1 - zcr / 0.5); // Normalize ZCR
    const energyScore = Math.min(1, energy / 1000); // Normalize energy
    const harmonicScore = harmonicity;
    
    return (zcrScore + energyScore + harmonicScore) / 3;
  }

  // =============================================================================
  // PROSODIC ANALYSIS
  // =============================================================================

  private extractProsodicFeatures(samples: Float32Array) {
    const stressPattern = this.computeStressPattern(samples);
    const intonationContour = this.computeIntonationContour(samples);
    const rhythmMetrics = this.computeRhythmMetrics(samples);
    
    return {
      stressPattern,
      intonationContour,
      rhythmMetrics
    };
  }

  private computeStressPattern(samples: Float32Array): number[] {
    // Simplified stress detection based on energy patterns
    const frameCount = Math.floor(samples.length / this.frameSize);
    const stressPattern: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const start = i * this.frameSize;
      const end = Math.min(start + this.frameSize, samples.length);
      const frameEnergy = this.computeFrameEnergy(samples.slice(start, end));
      stressPattern.push(frameEnergy);
    }
    
    return stressPattern;
  }

  private computeIntonationContour(samples: Float32Array): number[] {
    // F0 contour over time
    const frameCount = Math.floor(samples.length / this.frameSize);
    const contour: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const start = i * this.frameSize;
      const end = Math.min(start + this.frameSize, samples.length);
      const frameData = samples.slice(start, end);
      const f0 = this.computeFundamentalFrequency(frameData);
      contour.push(f0);
    }
    
    return contour;
  }

  private computeRhythmMetrics(samples: Float32Array) {
    const silenceThreshold = 0.01;
    const speechSegments = this.extractSpeechSegments(samples, silenceThreshold);
    
    const totalSpeechTime = speechSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const totalPauseTime = this.computeTotalPauseTime(samples, speechSegments);
    const syllableCount = this.estimateSyllableCount(speechSegments);
    
    return {
      syllableRate: totalSpeechTime > 0 ? syllableCount / totalSpeechTime : 0,
      pauseDuration: totalPauseTime,
      speechRate: totalSpeechTime / (totalSpeechTime + totalPauseTime)
    };
  }

  // =============================================================================
  // BIOMETRIC SECURITY FEATURES
  // =============================================================================

  private extractSecurityFeatures(samples: Float32Array) {
    const voicePrintHash = this.computeVoicePrintHash(samples);
    const uniquenessScore = this.computeUniquenessScore(samples);
    const consistencyMetrics = this.computeConsistencyMetrics(samples);
    
    return {
      voicePrintHash,
      uniquenessScore,
      consistencyMetrics
    };
  }

  private computeVoicePrintHash(samples: Float32Array): string {
    // Create a unique hash based on voice characteristics
    const features = [
      this.computeFundamentalFrequency(samples),
      this.computeSpectralCentroid(this.computeMagnitudeSpectrum(samples)),
      this.computeHNR(samples),
      this.computeJitter(samples),
      this.computeShimmer(samples)
    ];
    
    const featureString = features.map(f => f.toFixed(3)).join('|');
    return createHash('sha256').update(featureString).digest('hex').substring(0, 32);
  }

  private computeUniquenessScore(samples: Float32Array): number {
    // Score how unique/distinctive the voice characteristics are
    const spectrum = this.computeMagnitudeSpectrum(samples);
    const fundamentalFreq = this.computeFundamentalFrequency(samples);
    const harmonicity = this.computeHarmonicRatio(samples, fundamentalFreq);
    const hnr = this.computeHNR(samples);
    
    // Combine multiple uniqueness indicators
    const freqUniqueness = fundamentalFreq > 80 && fundamentalFreq < 300 ? 0.8 : 0.4;
    const harmonicUniqueness = harmonicity > 0.3 ? 0.9 : 0.5;
    const qualityUniqueness = hnr > 10 ? 0.8 : 0.6;
    
    return (freqUniqueness + harmonicUniqueness + qualityUniqueness) / 3;
  }

  private computeConsistencyMetrics(samples: Float32Array) {
    const frameCount = Math.floor(samples.length / this.frameSize);
    const pitchValues: number[] = [];
    const timbreValues: number[] = [];
    const rhythmValues: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const start = i * this.frameSize;
      const end = Math.min(start + this.frameSize, samples.length);
      const frameData = samples.slice(start, end);
      
      pitchValues.push(this.computeFundamentalFrequency(frameData));
      timbreValues.push(this.computeSpectralCentroid(this.computeMagnitudeSpectrum(frameData)));
      rhythmValues.push(this.computeFrameEnergy(frameData));
    }
    
    return {
      pitchStability: this.computeStability(pitchValues),
      timbreConsistency: this.computeStability(timbreValues),
      rhythmRegularity: this.computeStability(rhythmValues)
    };
  }

  // =============================================================================
  // QUALITY ASSESSMENT
  // =============================================================================

  private calculateClarityScore(features: AdvancedAudioFeatures): number {
    // Based on signal quality and speech characteristics
    let score = 50; // Base score
    
    if (features.harmonicToNoiseRatio > 15) score += 20;
    else if (features.harmonicToNoiseRatio > 10) score += 10;
    
    if (features.voicingProbability > 0.7) score += 15;
    else if (features.voicingProbability > 0.5) score += 10;
    
    if (features.speechClarity > 70) score += 15;
    else if (features.speechClarity > 50) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateStabilityScore(features: AdvancedAudioFeatures): number {
    let score = 50; // Base score
    
    if (features.jitter < 0.02) score += 25;
    else if (features.jitter < 0.05) score += 15;
    
    if (features.shimmer < 0.1) score += 25;
    else if (features.shimmer < 0.2) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateNaturalnessScore(features: AdvancedAudioFeatures): number {
    let score = 50; // Base score
    
    if (features.breathingDetected) score += 20;
    if (features.naturalVariation > 0.3) score += 15;
    if (features.microPauses >= 2) score += 10;
    if (features.emotionalMarkers > 0.2) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateUniquenessScore(features: AdvancedAudioFeatures): number {
    return features.uniquenessScore * 100;
  }

  private generateQualityRecommendations(features: AdvancedAudioFeatures, qualityFactors: any) {
    const recommendations: string[] = [];
    const warnings: string[] = [];
    
    if (qualityFactors.clarity < 70) {
      recommendations.push('Improve recording environment to reduce background noise');
      recommendations.push('Speak closer to the microphone');
    }
    
    if (qualityFactors.stability < 70) {
      recommendations.push('Try to maintain steady voice tone');
      recommendations.push('Take vocal rest if experiencing strain');
    }
    
    if (qualityFactors.naturalness < 60) {
      warnings.push('Speech may sound unnatural or processed');
      recommendations.push('Speak in your natural voice');
      recommendations.push('Avoid voice modulation effects');
    }
    
    if (qualityFactors.uniqueness < 50) {
      warnings.push('Voice characteristics may not be distinctive enough');
      recommendations.push('Ensure you are the person being enrolled');
    }
    
    if (features.backgroundNoise > 60) {
      warnings.push('High background noise detected');
      recommendations.push('Find a quieter environment for recording');
    }
    
    if (features.clippingDetected) {
      warnings.push('Audio clipping detected');
      recommendations.push('Reduce microphone sensitivity or speak softer');
    }
    
    return { recommendations, warnings };
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  private bufferToFloatArray(buffer: Buffer): Float32Array {
    const floatArray = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      // Convert from signed 8-bit to float (-1 to 1)
      floatArray[i] = (buffer[i] - 128) / 128.0;
    }
    return floatArray;
  }

  private extractBasicFeatures(buffer: Buffer): any {
    // Reuse existing basic feature extraction
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
      // Free enhancements from previous module
      zeroCrossingRate: this.computeZeroCrossingRate(new Float32Array(buffer)),
      spectralRolloff: 0.5,
      spectralFlux: 0.3,
      temporalCentroid: 0.5,
      signalToNoiseRatio: 15,
      dynamicRange: 150,
      clippingDetected: false,
      naturalVariation: 0.4,
      microPauses: 3,
      breathingDetected: true,
      emotionalMarkers: 0.3,
    };
  }

  private computeZeroCrossingRate(samples: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / samples.length;
  }

  private computeEnergy(samples: Float32Array): number {
    let energy = 0;
    for (let i = 0; i < samples.length; i++) {
      energy += samples[i] * samples[i];
    }
    return energy / samples.length;
  }

  private computeFrameEnergy(samples: Float32Array): number {
    return this.computeEnergy(samples);
  }

  private extractPitchPeriods(samples: Float32Array): number[] {
    // Simplified pitch period extraction
    const periods: number[] = [];
    const minPeriod = Math.floor(this.sampleRate / 400); // 400 Hz max
    const maxPeriod = Math.floor(this.sampleRate / 80);  // 80 Hz min
    
    for (let i = maxPeriod; i < samples.length - maxPeriod; i += maxPeriod) {
      const segment = samples.slice(i - maxPeriod, i + maxPeriod);
      const period = this.findBestPeriod(segment, minPeriod, maxPeriod);
      if (period > 0) periods.push(period);
    }
    
    return periods;
  }

  private findBestPeriod(segment: Float32Array, minPeriod: number, maxPeriod: number): number {
    let bestCorr = 0;
    let bestPeriod = 0;
    
    for (let period = minPeriod; period <= maxPeriod && period < segment.length / 2; period++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = 0; i < segment.length - period; i++) {
        correlation += segment[i] * segment[i + period];
        count++;
      }
      
      correlation = correlation / count;
      if (correlation > bestCorr) {
        bestCorr = correlation;
        bestPeriod = period;
      }
    }
    
    return bestPeriod;
  }

  private extractPeriodAmplitudes(samples: Float32Array): number[] {
    const periods = this.extractPitchPeriods(samples);
    const amplitudes: number[] = [];
    
    let currentPos = 0;
    for (const period of periods) {
      if (currentPos + period < samples.length) {
        let maxAmp = 0;
        for (let i = currentPos; i < currentPos + period; i++) {
          maxAmp = Math.max(maxAmp, Math.abs(samples[i]));
        }
        amplitudes.push(maxAmp);
        currentPos += period;
      }
    }
    
    return amplitudes;
  }

  private extractSpeechSegments(samples: Float32Array, threshold: number) {
    const segments: Array<{start: number, end: number, duration: number}> = [];
    let inSpeech = false;
    let segmentStart = 0;
    
    for (let i = 0; i < samples.length; i++) {
      const amplitude = Math.abs(samples[i]);
      
      if (amplitude > threshold && !inSpeech) {
        inSpeech = true;
        segmentStart = i;
      } else if (amplitude <= threshold && inSpeech) {
        inSpeech = false;
        const duration = (i - segmentStart) / this.sampleRate;
        segments.push({
          start: segmentStart,
          end: i,
          duration
        });
      }
    }
    
    return segments;
  }

  private computeTotalPauseTime(samples: Float32Array, speechSegments: any[]): number {
    let totalPauseTime = 0;
    
    for (let i = 1; i < speechSegments.length; i++) {
      const pauseStart = speechSegments[i - 1].end;
      const pauseEnd = speechSegments[i].start;
      totalPauseTime += (pauseEnd - pauseStart) / this.sampleRate;
    }
    
    return totalPauseTime;
  }

  private estimateSyllableCount(speechSegments: any[]): number {
    // Rough estimation: assume 3-5 syllables per second of speech
    const totalSpeechTime = speechSegments.reduce((sum, seg) => sum + seg.duration, 0);
    return Math.round(totalSpeechTime * 4); // Average 4 syllables per second
  }

  private computeStability(values: number[]): number {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize stability score (lower variation = higher stability)
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    return Math.max(0, 1 - coefficientOfVariation);
  }
}

// Export singleton instance
export const advancedAudioProcessor = new AdvancedAudioProcessor();