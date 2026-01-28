import { AdvancedAudioFeatures } from './advanced-audio-processing';

// =============================================================================
// ENHANCED VOICE HEALTH MONITORING SYSTEM
// Advanced health detection with anomaly detection and recommendations
// =============================================================================

export interface VoiceHealthMetrics {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'concerning';
  healthScore: number; // 0-100
  
  vocalWellness: {
    strainLevel: number;        // 0-100 (0 = no strain)
    fatigueIndicators: number;  // 0-100 (0 = no fatigue)
    breathingQuality: number;   // 0-100 (100 = excellent)
    vocalStability: number;     // 0-100 (100 = very stable)
  };
  
  detectedConditions: {
    condition: string;
    severity: 'mild' | 'moderate' | 'severe';
    confidence: number; // 0-100
    description: string;
  }[];
  
  anomalies: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }[];
  
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
  
  recommendations: {
    immediate: string[];
    daily: string[];
    weekly: string[];
    lifestyle: string[];
  };
  
  riskFactors: {
    factor: string;
    level: 'low' | 'medium' | 'high';
    impact: string;
  }[];
}

export interface VoiceHealthHistory {
  date: string;
  healthScore: number;
  strainLevel: number;
  respiratoryHealth: number;
  vocalStability: number;
  environmentalFactors: string[];
  notes?: string;
}

export interface HealthBaseline {
  establishedDate: string;
  baselineMetrics: {
    normalPitch: { min: number; max: number; average: number };
    normalEnergy: { min: number; max: number; average: number };
    normalJitter: number;
    normalShimmer: number;
    normalHNR: number;
  };
  personalPatterns: {
    timeOfDayVariations: Record<string, number>;
    environmentalPreferences: string[];
    typicalStressIndicators: string[];
  };
  adaptationLevel: number; // How well system knows this user's voice
}

// =============================================================================
// VOICE HEALTH MONITOR CLASS
// =============================================================================

export class VoiceHealthMonitor {
  private readonly STRAIN_THRESHOLDS = {
    jitter: { mild: 0.02, moderate: 0.05, severe: 0.08 },
    shimmer: { mild: 0.1, moderate: 0.2, severe: 0.35 },
    hnr: { excellent: 20, good: 15, fair: 10, poor: 5 },
    breathingRate: { low: 0.1, normal: 0.5, high: 0.8 }
  };
  
  private readonly ANOMALY_DETECTORS = {
    voiceBreaks: (features: AdvancedAudioFeatures) => this.detectVoiceBreaks(features),
    unnaturalPitch: (features: AdvancedAudioFeatures) => this.detectPitchAnomalies(features),
    breathingIssues: (features: AdvancedAudioFeatures) => this.detectBreathingAnomalies(features),
    fatigueMarkers: (features: AdvancedAudioFeatures) => this.detectVocalFatigue(features),
    stressIndicators: (features: AdvancedAudioFeatures) => this.detectStressMarkers(features),
    healthDecline: (features: AdvancedAudioFeatures) => this.detectHealthDecline(features)
  };

  /**
   * Comprehensive voice health assessment
   */
  assessVoiceHealth(
    currentFeatures: AdvancedAudioFeatures,
    baseline?: HealthBaseline,
    history?: VoiceHealthHistory[]
  ): VoiceHealthMetrics {
    
    // Calculate core wellness metrics
    const vocalWellness = this.calculateVocalWellness(currentFeatures, baseline);
    
    // Detect potential health conditions
    const detectedConditions = this.detectHealthConditions(currentFeatures, baseline);
    
    // Run anomaly detection
    const anomalies = this.runAnomalyDetection(currentFeatures, baseline);
    
    // Analyze trends if history is available
    const trends = history ? this.analyzeTrends(history) : { improving: [], declining: [], stable: [] };
    
    // Generate health recommendations
    const recommendations = this.generateHealthRecommendations(
      currentFeatures,
      vocalWellness,
      detectedConditions,
      anomalies
    );
    
    // Assess risk factors
    const riskFactors = this.assessRiskFactors(currentFeatures, detectedConditions, anomalies);
    
    // Calculate overall health score
    const healthScore = this.calculateOverallHealthScore(
      vocalWellness,
      detectedConditions,
      anomalies,
      trends
    );
    
    // Determine overall health status
    const overallHealth = this.categorizeHealthStatus(healthScore, detectedConditions);
    
    return {
      overallHealth,
      healthScore,
      vocalWellness,
      detectedConditions,
      anomalies,
      trends,
      recommendations,
      riskFactors
    };
  }

  /**
   * Create or update health baseline for a user
   */
  establishHealthBaseline(voiceSamples: AdvancedAudioFeatures[]): HealthBaseline {
    if (voiceSamples.length < 3) {
      throw new Error('At least 3 voice samples required to establish baseline');
    }
    
    const pitchValues = voiceSamples.map(s => s.fundamentalFrequency).filter(p => p > 0);
    const energyValues = voiceSamples.map(s => s.energy);
    const jitterValues = voiceSamples.map(s => s.jitter);
    const shimmerValues = voiceSamples.map(s => s.shimmer);
    const hnrValues = voiceSamples.map(s => s.harmonicToNoiseRatio);
    
    return {
      establishedDate: new Date().toISOString(),
      baselineMetrics: {
        normalPitch: {
          min: Math.min(...pitchValues),
          max: Math.max(...pitchValues),
          average: pitchValues.reduce((sum, p) => sum + p, 0) / pitchValues.length
        },
        normalEnergy: {
          min: Math.min(...energyValues),
          max: Math.max(...energyValues),
          average: energyValues.reduce((sum, e) => sum + e, 0) / energyValues.length
        },
        normalJitter: jitterValues.reduce((sum, j) => sum + j, 0) / jitterValues.length,
        normalShimmer: shimmerValues.reduce((sum, s) => sum + s, 0) / shimmerValues.length,
        normalHNR: hnrValues.reduce((sum, h) => sum + h, 0) / hnrValues.length
      },
      personalPatterns: {
        timeOfDayVariations: {},
        environmentalPreferences: this.analyzeEnvironmentalPreferences(voiceSamples),
        typicalStressIndicators: this.identifyStressPatterns(voiceSamples)
      },
      adaptationLevel: Math.min(voiceSamples.length / 10, 1) // Max 1.0 for 10+ samples
    };
  }

  /**
   * Check for urgent health alerts
   */
  checkForHealthAlerts(features: AdvancedAudioFeatures, baseline?: HealthBaseline): {
    hasAlerts: boolean;
    alerts: Array<{
      type: 'urgent' | 'warning' | 'info';
      message: string;
      action: string;
    }>;
  } {
    const alerts: Array<{ type: 'urgent' | 'warning' | 'info'; message: string; action: string; }> = [];
    
    // Check for severe vocal strain
    if (features.jitter > this.STRAIN_THRESHOLDS.jitter.severe) {
      alerts.push({
        type: 'urgent',
        message: 'Severe vocal strain detected - immediate voice rest recommended',
        action: 'Stop using voice authentication and rest your voice for 24 hours'
      });
    }
    
    // Check for potential health issues
    if (features.harmonicToNoiseRatio < this.STRAIN_THRESHOLDS.hnr.poor) {
      alerts.push({
        type: 'warning',
        message: 'Voice quality significantly degraded - possible illness or fatigue',
        action: 'Consider postponing voice authentication and monitoring symptoms'
      });
    }
    
    // Check for breathing irregularities
    if (!features.breathingDetected || features.breathingPattern < 20) {
      alerts.push({
        type: 'warning',
        message: 'Irregular breathing pattern detected',
        action: 'Take deep breaths and speak at a comfortable pace'
      });
    }
    
    // Check for sudden changes from baseline
    if (baseline) {
      const pitchDeviation = Math.abs(features.fundamentalFrequency - baseline.baselineMetrics.normalPitch.average) /
                            baseline.baselineMetrics.normalPitch.average;
      
      if (pitchDeviation > 0.3) {
        alerts.push({
          type: 'info',
          message: 'Significant change in voice characteristics detected',
          action: 'Verify you are feeling well and speaking naturally'
        });
      }
    }
    
    return {
      hasAlerts: alerts.length > 0,
      alerts
    };
  }

  // =============================================================================
  // PRIVATE ASSESSMENT METHODS
  // =============================================================================

  private calculateVocalWellness(features: AdvancedAudioFeatures, baseline?: HealthBaseline) {
    // Strain level (0-100, where 0 is no strain)
    let strainLevel = 0;
    if (features.jitter > this.STRAIN_THRESHOLDS.jitter.mild) strainLevel += 25;
    if (features.jitter > this.STRAIN_THRESHOLDS.jitter.moderate) strainLevel += 25;
    if (features.jitter > this.STRAIN_THRESHOLDS.jitter.severe) strainLevel += 50;
    
    if (features.shimmer > this.STRAIN_THRESHOLDS.shimmer.mild) strainLevel += 15;
    if (features.shimmer > this.STRAIN_THRESHOLDS.shimmer.moderate) strainLevel += 15;
    if (features.shimmer > this.STRAIN_THRESHOLDS.shimmer.severe) strainLevel += 20;
    
    strainLevel = Math.min(100, strainLevel);
    
    // Fatigue indicators
    let fatigueIndicators = 0;
    if (features.voiceStrain > 60) fatigueIndicators += 30;
    if (features.harmonicToNoiseRatio < 10) fatigueIndicators += 25;
    if (features.voicingProbability < 0.6) fatigueIndicators += 20;
    if (features.breathingPattern < 30) fatigueIndicators += 25;
    fatigueIndicators = Math.min(100, fatigueIndicators);
    
    // Breathing quality (0-100, where 100 is excellent)
    let breathingQuality = 100;
    if (!features.breathingDetected) breathingQuality -= 40;
    if (features.breathingPattern < 20) breathingQuality -= 30;
    if (features.microPauses < 2) breathingQuality -= 20;
    if (features.backgroundNoise > 60) breathingQuality -= 10;
    breathingQuality = Math.max(0, breathingQuality);
    
    // Vocal stability (0-100, where 100 is very stable)
    let vocalStability = 100;
    vocalStability -= features.vocalTremor;
    vocalStability -= Math.min(30, features.jitter * 1000);
    vocalStability -= Math.min(30, features.shimmer * 150);
    vocalStability = Math.max(0, vocalStability);
    
    return {
      strainLevel: Math.round(strainLevel),
      fatigueIndicators: Math.round(fatigueIndicators),
      breathingQuality: Math.round(breathingQuality),
      vocalStability: Math.round(vocalStability)
    };
  }

  private detectHealthConditions(features: AdvancedAudioFeatures, baseline?: HealthBaseline) {
    const conditions: Array<{
      condition: string;
      severity: 'mild' | 'moderate' | 'severe';
      confidence: number;
      description: string;
    }> = [];
    
    // Vocal strain detection
    if (features.jitter > this.STRAIN_THRESHOLDS.jitter.moderate) {
      conditions.push({
        condition: 'Vocal Strain',
        severity: features.jitter > this.STRAIN_THRESHOLDS.jitter.severe ? 'severe' : 'moderate',
        confidence: Math.min(95, features.jitter * 1000),
        description: 'Irregular vocal fold vibration indicating strain or overuse'
      });
    }
    
    // Voice fatigue detection
    if (features.shimmer > this.STRAIN_THRESHOLDS.shimmer.moderate) {
      conditions.push({
        condition: 'Voice Fatigue',
        severity: features.shimmer > this.STRAIN_THRESHOLDS.shimmer.severe ? 'severe' : 'moderate',
        confidence: Math.min(90, features.shimmer * 300),
        description: 'Amplitude variations suggesting vocal muscle fatigue'
      });
    }
    
    // Respiratory issues
    if (!features.breathingDetected || features.breathingPattern < 20) {
      conditions.push({
        condition: 'Respiratory Irregularity',
        severity: features.breathingPattern < 10 ? 'severe' : 'mild',
        confidence: 75,
        description: 'Irregular breathing patterns affecting voice production'
      });
    }
    
    // Voice quality degradation
    if (features.harmonicToNoiseRatio < this.STRAIN_THRESHOLDS.hnr.poor) {
      conditions.push({
        condition: 'Voice Quality Degradation',
        severity: features.harmonicToNoiseRatio < 3 ? 'severe' : 'moderate',
        confidence: 80,
        description: 'Reduced voice clarity potentially indicating illness or vocal damage'
      });
    }
    
    // Neurological indicators (tremor)
    if (features.vocalTremor > 40) {
      conditions.push({
        condition: 'Vocal Tremor',
        severity: features.vocalTremor > 70 ? 'severe' : 'moderate',
        confidence: Math.min(85, features.vocalTremor),
        description: 'Voice tremor may indicate neurological factors or stress'
      });
    }
    
    return conditions;
  }

  private runAnomalyDetection(features: AdvancedAudioFeatures, baseline?: HealthBaseline) {
    const anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }> = [];
    
    // Run all anomaly detectors
    for (const [type, detector] of Object.entries(this.ANOMALY_DETECTORS)) {
      const result = detector(features);
      if (result) {
        anomalies.push({
          type,
          ...result
        });
      }
    }
    
    return anomalies;
  }

  private analyzeTrends(history: VoiceHealthHistory[]) {
    if (history.length < 3) {
      return { improving: [], declining: [], stable: [] };
    }
    
    const recent = history.slice(-3);
    const older = history.slice(-6, -3);
    
    const trends = {
      improving: [] as string[],
      declining: [] as string[],
      stable: [] as string[]
    };
    
    // Analyze health score trend
    const recentAvgHealth = recent.reduce((sum, h) => sum + h.healthScore, 0) / recent.length;
    const olderAvgHealth = older.length > 0 ? 
      older.reduce((sum, h) => sum + h.healthScore, 0) / older.length : recentAvgHealth;
    
    if (recentAvgHealth > olderAvgHealth + 5) {
      trends.improving.push('Overall voice health');
    } else if (recentAvgHealth < olderAvgHealth - 5) {
      trends.declining.push('Overall voice health');
    } else {
      trends.stable.push('Overall voice health');
    }
    
    // Analyze strain trend
    const recentAvgStrain = recent.reduce((sum, h) => sum + h.strainLevel, 0) / recent.length;
    const olderAvgStrain = older.length > 0 ?
      older.reduce((sum, h) => sum + h.strainLevel, 0) / older.length : recentAvgStrain;
    
    if (recentAvgStrain < olderAvgStrain - 5) {
      trends.improving.push('Vocal strain levels');
    } else if (recentAvgStrain > olderAvgStrain + 5) {
      trends.declining.push('Vocal strain levels');
    } else {
      trends.stable.push('Vocal strain levels');
    }
    
    return trends;
  }

  private generateHealthRecommendations(
    features: AdvancedAudioFeatures,
    wellness: any,
    conditions: any[],
    anomalies: any[]
  ) {
    const recommendations = {
      immediate: [] as string[],
      daily: [] as string[],
      weekly: [] as string[],
      lifestyle: [] as string[]
    };
    
    // Immediate recommendations based on current state
    if (wellness.strainLevel > 60) {
      recommendations.immediate.push('Take immediate voice rest for 15-30 minutes');
      recommendations.immediate.push('Drink warm water or herbal tea');
    }
    
    if (wellness.breathingQuality < 50) {
      recommendations.immediate.push('Practice deep breathing exercises');
      recommendations.immediate.push('Ensure good posture while speaking');
    }
    
    if (features.backgroundNoise > 60) {
      recommendations.immediate.push('Move to a quieter environment');
    }
    
    // Daily recommendations
    if (wellness.strainLevel > 40) {
      recommendations.daily.push('Limit voice use to essential communication only');
      recommendations.daily.push('Stay well hydrated throughout the day');
    }
    
    if (wellness.vocalStability < 70) {
      recommendations.daily.push('Practice gentle vocal warm-ups');
      recommendations.daily.push('Avoid shouting or whispering');
    }
    
    // Weekly recommendations
    if (conditions.some(c => c.condition === 'Vocal Strain')) {
      recommendations.weekly.push('Consider vocal rest periods during the week');
      recommendations.weekly.push('Schedule voice therapy consultation if strain persists');
    }
    
    if (anomalies.some(a => a.severity === 'high')) {
      recommendations.weekly.push('Monitor voice health daily');
      recommendations.weekly.push('Consider professional voice assessment');
    }
    
    // Lifestyle recommendations
    if (wellness.fatigueIndicators > 50) {
      recommendations.lifestyle.push('Ensure adequate sleep (7-9 hours nightly)');
      recommendations.lifestyle.push('Reduce stress through relaxation techniques');
    }
    
    recommendations.lifestyle.push('Maintain good overall health and nutrition');
    recommendations.lifestyle.push('Practice good vocal hygiene habits');
    
    return recommendations;
  }

  private assessRiskFactors(features: AdvancedAudioFeatures, conditions: any[], anomalies: any[]) {
    const riskFactors: Array<{
      factor: string;
      level: 'low' | 'medium' | 'high';
      impact: string;
    }> = [];
    
    // Environmental risk factors
    if (features.backgroundNoise > 50) {
      riskFactors.push({
        factor: 'Noisy Environment',
        level: features.backgroundNoise > 80 ? 'high' : 'medium',
        impact: 'May require speaking louder, increasing vocal strain'
      });
    }
    
    // Device quality risk
    if (features.deviceQuality < 60) {
      riskFactors.push({
        factor: 'Poor Audio Quality',
        level: features.deviceQuality < 40 ? 'high' : 'medium',
        impact: 'May affect accuracy of voice health monitoring'
      });
    }
    
    // Vocal strain progression risk
    if (conditions.some(c => c.condition === 'Vocal Strain' && c.severity !== 'mild')) {
      riskFactors.push({
        factor: 'Progressive Vocal Strain',
        level: 'high',
        impact: 'Risk of developing chronic voice problems'
      });
    }
    
    // Consistency risk
    if (features.consistencyScore < 60) {
      riskFactors.push({
        factor: 'Voice Inconsistency',
        level: 'medium',
        impact: 'May indicate underlying health changes or stress'
      });
    }
    
    return riskFactors;
  }

  private calculateOverallHealthScore(wellness: any, conditions: any[], anomalies: any[], trends: any) {
    let score = 100;
    
    // Subtract for wellness issues
    score -= wellness.strainLevel * 0.4;
    score -= wellness.fatigueIndicators * 0.3;
    score -= (100 - wellness.breathingQuality) * 0.2;
    score -= (100 - wellness.vocalStability) * 0.3;
    
    // Subtract for detected conditions
    conditions.forEach(condition => {
      const severityPenalty = condition.severity === 'severe' ? 20 : 
                             condition.severity === 'moderate' ? 10 : 5;
      score -= severityPenalty * (condition.confidence / 100);
    });
    
    // Subtract for anomalies
    anomalies.forEach(anomaly => {
      const severityPenalty = anomaly.severity === 'high' ? 15 :
                             anomaly.severity === 'medium' ? 8 : 3;
      score -= severityPenalty;
    });
    
    // Adjust for trends
    if (trends.declining.length > trends.improving.length) {
      score -= 5;
    } else if (trends.improving.length > trends.declining.length) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private categorizeHealthStatus(healthScore: number, conditions: any[]): VoiceHealthMetrics['overallHealth'] {
    const hasSevereConditions = conditions.some(c => c.severity === 'severe');
    
    if (hasSevereConditions || healthScore < 40) return 'concerning';
    if (healthScore < 60) return 'poor';
    if (healthScore < 75) return 'fair';
    if (healthScore < 90) return 'good';
    return 'excellent';
  }

  // =============================================================================
  // ANOMALY DETECTION METHODS
  // =============================================================================

  private detectVoiceBreaks(features: AdvancedAudioFeatures) {
    if (features.voicingProbability < 0.4 || features.harmonicToNoiseRatio < 5) {
      return {
        severity: 'medium' as const,
        description: 'Voice breaks or interruptions detected',
        recommendation: 'Speak slowly and take breaks to rest your voice'
      };
    }
    return null;
  }

  private detectPitchAnomalies(features: AdvancedAudioFeatures) {
    if (features.fundamentalFrequency < 60 || features.fundamentalFrequency > 400) {
      return {
        severity: 'medium' as const,
        description: 'Unusual pitch characteristics detected',
        recommendation: 'Speak in your natural voice range'
      };
    }
    return null;
  }

  private detectBreathingAnomalies(features: AdvancedAudioFeatures) {
    if (!features.breathingDetected || features.microPauses < 1) {
      return {
        severity: 'low' as const,
        description: 'Insufficient breathing patterns detected',
        recommendation: 'Take natural pauses and breathe normally while speaking'
      };
    }
    return null;
  }

  private detectVocalFatigue(features: AdvancedAudioFeatures) {
    if (features.shimmer > 0.15 && features.harmonicToNoiseRatio < 12) {
      return {
        severity: 'medium' as const,
        description: 'Signs of vocal fatigue detected',
        recommendation: 'Consider voice rest and hydration'
      };
    }
    return null;
  }

  private detectStressMarkers(features: AdvancedAudioFeatures) {
    if (features.vocalTremor > 30 && features.jitter > 0.03) {
      return {
        severity: 'low' as const,
        description: 'Stress-related voice changes detected',
        recommendation: 'Practice relaxation techniques before speaking'
      };
    }
    return null;
  }

  private detectHealthDecline(features: AdvancedAudioFeatures) {
    if (features.speechClarity < 30 && features.harmonicToNoiseRatio < 8) {
      return {
        severity: 'high' as const,
        description: 'Significant voice quality decline detected',
        recommendation: 'Consider consulting a healthcare professional'
      };
    }
    return null;
  }

  private analyzeEnvironmentalPreferences(samples: AdvancedAudioFeatures[]): string[] {
    const envCounts: Record<string, number> = {};
    
    samples.forEach(sample => {
      envCounts[sample.environmentType] = (envCounts[sample.environmentType] || 0) + 1;
    });
    
    return Object.entries(envCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([env]) => env);
  }

  private identifyStressPatterns(samples: AdvancedAudioFeatures[]): string[] {
    const patterns: string[] = [];
    
    const avgTremor = samples.reduce((sum, s) => sum + s.vocalTremor, 0) / samples.length;
    const avgJitter = samples.reduce((sum, s) => sum + s.jitter, 0) / samples.length;
    
    if (avgTremor > 20) patterns.push('elevated vocal tremor');
    if (avgJitter > 0.025) patterns.push('increased pitch instability');
    
    return patterns;
  }
}

// Export singleton instance
export const voiceHealthMonitor = new VoiceHealthMonitor();