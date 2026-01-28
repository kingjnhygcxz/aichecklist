import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { users, voiceAuthSessions, voiceHealthRecords, voiceTrainingSessions } from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { processEnhancedAudioBase64, compareEnhancedVoiceFeatures, type EnhancedVoiceFeatures, type VoiceHealthAssessment } from "./enhanced-voice-biometric";
import { livenessDetector, antiSpoofingDetector, extractEnhancedAudioFeatures, type LivenessChallenge, type LivenessResponse } from "./free-voice-enhancements";
import { processAdvancedAudioBase64, analyzeAudioQuality, advancedAudioProcessor } from "./enhanced-voice-biometric";
import { voiceHealthMonitor, type VoiceHealthMetrics, type HealthBaseline } from "./voice-health-monitor";
import { createHash, randomBytes } from 'crypto';

// Validation schemas
const enhancedVoiceAuthSchema = z.object({
  audioData: z.string(),
  transcribedText: z.string().optional(),
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
  environmentData: z.object({
    timestamp: z.string(),
    timezone: z.string().optional(),
  }).optional(),
});

const livenessChallengeSchema = z.object({
  challengeId: z.string(),
  transcribedText: z.string(),
  audioData: z.string(),
  responseTime: z.number(),
});

const mfaChallengeSchema = z.object({
  sessionToken: z.string(),
  pin: z.string().optional(),
  challengeAnswer: z.string().optional(),
  backupCode: z.string().optional(),
});

const voiceTrainingSchema = z.object({
  sessionType: z.enum(['initial', 'adaptation', 'recovery']),
  audioSamples: z.array(z.string()),
  transcripts: z.array(z.string()).optional(),
});

export function registerEnhancedVoiceAuthRoutes(app: Express) {
  
  // =============================================================================
  // VOICE BIOMETRIC AUTHENTICATION IS DISABLED
  // Voice-to-task features remain available, but voice authentication is not.
  // =============================================================================
  
  // Middleware to disable all voice auth endpoints
  const voiceAuthDisabled = (req: any, res: any) => {
    return res.status(410).json({
      success: false,
      error: 'Voice biometric authentication has been disabled',
      message: 'Voice authentication is no longer available. Please use email/password login.',
    });
  };
  
  // All voice auth endpoints return disabled response
  app.post('/api/auth/voice/liveness/challenge', voiceAuthDisabled);
  app.post('/api/auth/voice/liveness/verify', voiceAuthDisabled);
  app.post('/api/auth/voice/anti-spoofing', voiceAuthDisabled);
  app.post('/api/auth/voice/training/start', voiceAuthDisabled);
  app.post('/api/auth/voice/training/sample', voiceAuthDisabled);
  app.post('/api/auth/voice/training/complete', voiceAuthDisabled);
  app.get('/api/auth/voice/health/status', voiceAuthDisabled);
  app.post('/api/auth/voice/health/check', voiceAuthDisabled);
  app.get('/api/auth/voice/sessions', voiceAuthDisabled);
  app.post('/api/auth/voice/mfa', voiceAuthDisabled);
  app.post('/api/auth/voice/adapt', voiceAuthDisabled);
  app.post('/api/auth/voice/verify', voiceAuthDisabled);
  app.post('/api/enhanced-voice-setup', voiceAuthDisabled);
  app.post('/api/voice-biometric-login', voiceAuthDisabled);
  
  // Return early - all the below routes are now disabled
  return;
  
  // =============================================================================
  // LEGACY CODE BELOW - KEPT FOR REFERENCE BUT NOT EXECUTED
  // =============================================================================
  
  // Generate liveness challenge
  app.post('/api/auth/voice/liveness/challenge-legacy', async (req, res) => {
    try {
      const challenge = livenessDetector.generateChallenge();
      
      res.json({
        success: true,
        challenge: {
          id: challenge.id,
          phrase: challenge.phrase,
          expiresAt: challenge.expiresAt
        },
        instructions: [
          'Please read the phrase exactly as shown',
          'Speak clearly and naturally',
          'Complete within 30 seconds',
          'Do not use pre-recorded audio'
        ]
      });
      
    } catch (error) {
      console.error('Liveness challenge generation error:', error);
      res.status(500).json({ error: 'Failed to generate liveness challenge' });
    }
  });
  
  // Validate liveness response
  app.post('/api/auth/voice/liveness/validate', async (req, res) => {
    try {
      const livenessResponse = livenessChallengeSchema.parse(req.body);
      
      // Validate liveness
      const livenessResult = livenessDetector.validateResponse(livenessResponse);
      
      // Anti-spoofing detection
      const spoofingResult = antiSpoofingDetector.analyzeForSpoofing(livenessResponse.audioData);
      
      // Enhanced audio analysis
      const audioFeatures = extractEnhancedAudioFeatures(Buffer.from(livenessResponse.audioData, 'base64'));
      
      // Combined security score
      const securityScore = Math.min(
        livenessResult.confidence,
        (1 - spoofingResult.confidence)
      ) * 100;
      
      const isSecure = livenessResult.isLive && !spoofingResult.isSpoofed && securityScore >= 70;
      
      const response = {
        success: isSecure,
        securityScore: Math.round(securityScore),
        liveness: {
          isLive: livenessResult.isLive,
          confidence: Math.round(livenessResult.confidence * 100),
          reasons: livenessResult.reasons,
          timingAnalysis: livenessResult.timingAnalysis
        },
        antiSpoofing: {
          isSpoofed: spoofingResult.isSpoofed,
          confidence: Math.round(spoofingResult.confidence * 100),
          detectedArtifacts: spoofingResult.detectedArtifacts,
          riskLevel: spoofingResult.riskLevel,
          recommendations: spoofingResult.recommendations
        },
        audioQuality: {
          signalToNoiseRatio: Math.round(audioFeatures.signalToNoiseRatio),
          naturalVariation: Math.round(audioFeatures.naturalVariation * 100),
          breathingDetected: audioFeatures.breathingDetected,
          clippingDetected: audioFeatures.clippingDetected
        },
        recommendations: [
          ...livenessResult.reasons,
          ...spoofingResult.recommendations
        ].filter((item, index, arr) => arr.indexOf(item) === index)
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Liveness validation error:', error);
      res.status(500).json({ error: 'Failed to validate liveness response' });
    }
  });
  
  // =============================================================================
  // ADVANCED AUDIO PROCESSING ENDPOINTS
  // =============================================================================
  
  // Advanced audio analysis endpoint
  app.post('/api/auth/voice/analyze-advanced', async (req, res) => {
    try {
      const { audioData } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required' });
      }
      
      // Extract advanced features
      const advancedFeatures = processAdvancedAudioBase64(audioData);
      
      // Analyze audio quality
      const qualityMetrics = analyzeAudioQuality(audioData);
      
      // Anti-spoofing analysis
      const spoofingResult = antiSpoofingDetector.analyzeForSpoofing(audioData);
      
      res.json({
        success: true,
        analysis: {
          // Frequency domain features
          frequencyAnalysis: {
            fundamentalFrequency: Math.round(advancedFeatures.fundamentalFrequency),
            harmonicRatio: Math.round(advancedFeatures.harmonicRatio * 100),
            spectralCentroid: Math.round(advancedFeatures.spectralCentroid),
            spectralBandwidth: Math.round(advancedFeatures.spectralBandwidth)
          },
          
          // Voice quality metrics
          voiceQuality: {
            jitter: Math.round(advancedFeatures.jitter * 1000) / 1000,
            shimmer: Math.round(advancedFeatures.shimmer * 1000) / 1000,
            harmonicToNoiseRatio: Math.round(advancedFeatures.harmonicToNoiseRatio * 10) / 10,
            voicingProbability: Math.round(advancedFeatures.voicingProbability * 100)
          },
          
          // Temporal features
          temporalAnalysis: {
            attackTime: Math.round(advancedFeatures.attackTime * 1000),
            decayTime: Math.round(advancedFeatures.decayTime * 1000),
            sustainLevel: Math.round(advancedFeatures.sustainLevel * 100),
            releaseTime: Math.round(advancedFeatures.releaseTime * 1000)
          },
          
          // Prosodic features
          prosody: {
            rhythmMetrics: advancedFeatures.rhythmMetrics,
            stressPatternLength: advancedFeatures.stressPattern.length,
            intonationRange: advancedFeatures.intonationContour.length > 0 ?
              Math.max(...advancedFeatures.intonationContour) - Math.min(...advancedFeatures.intonationContour) : 0
          },
          
          // Security features
          biometricSecurity: {
            voicePrintHash: advancedFeatures.voicePrintHash,
            uniquenessScore: Math.round(advancedFeatures.uniquenessScore * 100),
            consistencyMetrics: {
              pitchStability: Math.round(advancedFeatures.consistencyMetrics.pitchStability * 100),
              timbreConsistency: Math.round(advancedFeatures.consistencyMetrics.timbreConsistency * 100),
              rhythmRegularity: Math.round(advancedFeatures.consistencyMetrics.rhythmRegularity * 100)
            }
          }
        },
        
        qualityAssessment: qualityMetrics,
        securityAssessment: spoofingResult,
        
        recommendations: [
          ...qualityMetrics.recommendations,
          ...spoofingResult.recommendations
        ].filter((item, index, arr) => arr.indexOf(item) === index)
      });
      
    } catch (error) {
      console.error('Advanced audio analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze audio' });
    }
  });
  
  // Voice quality assessment endpoint
  app.post('/api/auth/voice/quality-check', async (req, res) => {
    try {
      const { audioData, userId } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required' });
      }
      
      // Analyze audio quality
      const qualityMetrics = analyzeAudioQuality(audioData);
      
      // Extract advanced features for detailed analysis
      const features = processAdvancedAudioBase64(audioData);
      
      // Get recommendations based on quality
      const qualityLevel = qualityMetrics.overallQuality >= 80 ? 'excellent' :
                          qualityMetrics.overallQuality >= 60 ? 'good' :
                          qualityMetrics.overallQuality >= 40 ? 'fair' : 'poor';
      
      const response = {
        success: true,
        qualityLevel,
        overallScore: qualityMetrics.overallQuality,
        detailedScores: qualityMetrics.qualityFactors,
        
        technicalMetrics: {
          signalToNoiseRatio: Math.round(features.signalToNoiseRatio),
          dynamicRange: Math.round(features.dynamicRange),
          harmonicToNoiseRatio: Math.round(features.harmonicToNoiseRatio * 10) / 10,
          voiceStrain: Math.round(features.voiceStrain),
          backgroundNoise: Math.round(features.backgroundNoise)
        },
        
        recommendations: qualityMetrics.recommendations,
        warnings: qualityMetrics.warnings,
        
        readyForAuthentication: qualityMetrics.overallQuality >= 60 && qualityMetrics.warnings.length === 0
      };
      
      // Store quality assessment if userId provided
      if (userId) {
        // Would store in voice health records table
        console.log(`Quality assessment for user ${userId}:`, qualityLevel);
      }
      
      res.json(response);
      
    } catch (error) {
      console.error('Voice quality check error:', error);
      res.status(500).json({ error: 'Failed to assess voice quality' });
    }
  });
  
  // =============================================================================
  // ENHANCED VOICE HEALTH MONITORING ENDPOINTS
  // =============================================================================
  
  // Comprehensive voice health assessment
  app.post('/api/auth/voice/health-assessment', async (req, res) => {
    try {
      const { audioData, userId } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required' });
      }
      
      // Extract advanced features for health analysis
      const features = processAdvancedAudioBase64(audioData);
      
      // Get user's health baseline if available
      let baseline: HealthBaseline | undefined;
      let history: any[] = [];
      
      if (userId) {
        // Get user data for baseline and history
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0) {
          if (user[0].voiceHealthBaseline) {
            baseline = JSON.parse(user[0].voiceHealthBaseline);
          }
        }
      }
      
      // Perform comprehensive health assessment
      const healthAssessment = voiceHealthMonitor.assessVoiceHealth(features, baseline, history);
      
      // Check for urgent health alerts
      const healthAlerts = voiceHealthMonitor.checkForHealthAlerts(features, baseline);
      
      res.json({
        success: true,
        healthAssessment,
        healthAlerts,
        
        summary: {
          overallHealth: healthAssessment.overallHealth,
          healthScore: healthAssessment.healthScore,
          primaryConcerns: healthAssessment.detectedConditions
            .filter(c => c.severity !== 'mild')
            .map(c => c.condition),
          urgentActions: healthAssessment.recommendations.immediate,
          hasBaseline: !!baseline,
          recordsAnalyzed: history.length
        }
      });
      
    } catch (error) {
      console.error('Voice health assessment error:', error);
      res.status(500).json({ error: 'Failed to assess voice health' });
    }
  });
  
  // Enhanced voice authentication setup
  app.post('/api/auth/voice/setup', async (req, res) => {
    try {
      const { audioData, transcribedText, deviceInfo } = enhancedVoiceAuthSchema.parse(req.body);
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required for voice setup' });
      }

      // Get user data
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = user[0];

      // Extract enhanced voice features
      const voiceFeatures = processEnhancedAudioBase64(audioData);
      
      // Create voice fingerprint
      const voicePrint = generateVoicePrint(voiceFeatures);
      
      // Initialize voice health baseline
      const healthBaseline = {
        baselinePitch: voiceFeatures.pitch,
        baselineEnergy: voiceFeatures.energy,
        baselineClarity: voiceFeatures.speechClarity,
        baselineStrain: voiceFeatures.voiceStrain,
        environmentType: voiceFeatures.environmentType,
        recordedAt: new Date().toISOString(),
      };

      // Store enhanced voice data
      await db.update(users)
        .set({
          voicePassword: transcribedText,
          voiceEnabled: true,
          voiceFeatures: JSON.stringify(voiceFeatures),
          voicePrint,
          voiceHealthBaseline: JSON.stringify(healthBaseline),
          voiceSamples: JSON.stringify([voiceFeatures]),
          voiceConfidenceScore: 75, // Initial confidence
          voiceAdaptationLevel: 1,
          lastVoiceTraining: new Date(),
        })
        .where(eq(users.username, username));

      // Create initial health record
      await db.insert(voiceHealthRecords).values({
          userId: userData.id,
          voiceFeatures: JSON.stringify(voiceFeatures),
          qualityScore: Math.round(voiceFeatures.speechClarity),
          backgroundNoise: Math.round(voiceFeatures.backgroundNoise),
          voiceStrain: Math.round(voiceFeatures.voiceStrain),
          environmentType: voiceFeatures.environmentType,
          healthStatus: 'healthy',
          adaptationRecommendations: JSON.stringify([]),
          anomaliesDetected: JSON.stringify([]),
        });

      res.json({ 
        success: true, 
        message: 'Enhanced voice authentication setup complete',
        confidenceLevel: 75,
        healthScore: Math.round(voiceFeatures.speechClarity),
      });

    } catch (error) {
      console.error('Enhanced voice setup error:', error);
      res.status(500).json({ error: 'Failed to setup enhanced voice authentication' });
    }
  });

  // Enhanced voice authentication login with liveness detection
  app.post('/api/auth/voice/login', async (req, res) => {
    try {
      const { audioData, transcribedText, deviceInfo, environmentData } = enhancedVoiceAuthSchema.parse(req.body);
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required for voice login' });
      }

      // Get user data
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = user[0];
      if (!userData.voiceEnabled || !userData.voiceFeatures) {
        return res.status(400).json({ error: 'Voice authentication not enabled for this user' });
      }

      // Enhanced security checks
      const spoofingResult = antiSpoofingDetector.analyzeForSpoofing(audioData);
      
      if (spoofingResult.isSpoofed && spoofingResult.riskLevel === 'high') {
        return res.status(401).json({
          error: 'Security check failed',
          reason: 'Possible spoofing attempt detected',
          riskLevel: spoofingResult.riskLevel,
          detectedArtifacts: spoofingResult.detectedArtifacts,
          recommendations: spoofingResult.recommendations
        });
      }
      
      // Extract advanced voice features with professional-grade analysis
      const currentFeatures = processAdvancedAudioBase64(audioData);
      
      // Analyze audio quality for authentication readiness
      const qualityAssessment = analyzeAudioQuality(audioData);
      
      // Check if audio quality meets authentication standards
      if (qualityAssessment.overallQuality < 50) {
        return res.status(400).json({
          error: 'Audio quality insufficient for authentication',
          qualityScore: qualityAssessment.overallQuality,
          recommendations: qualityAssessment.recommendations,
          warnings: qualityAssessment.warnings
        });
      }
      
      // Get stored voice samples for comparison
      const storedSamples: EnhancedVoiceFeatures[] = userData.voiceSamples ? 
        JSON.parse(userData.voiceSamples) : 
        [JSON.parse(userData.voiceFeatures)];

      // Enhanced comparison with adaptive learning
      const comparisonResult = compareEnhancedVoiceFeatures(
        storedSamples,
        currentFeatures,
        userData.voiceAdaptationLevel || 1
      );

      const { similarity, healthAssessment, adaptationData } = comparisonResult;
      
      // Adjust threshold based on health assessment and security factors
      let threshold = 0.7; // Base threshold
      if (userData.adaptiveThresholdEnabled) {
        threshold += (healthAssessment.suggestedThresholdAdjustment / 100);
        threshold = Math.max(0.5, Math.min(0.9, threshold)); // Keep within bounds
      }
      
      // Apply security penalties for spoofing risks
      if (spoofingResult.isSpoofed) {
        threshold += 0.2; // Increase threshold for suspicious audio
      }

      // Create session token
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Determine if authentication is successful
      const isSuccessful = similarity >= threshold;
      const requiresMFA = userData.mfaEnabled && isSuccessful;

      // Create voice auth session
      await db.insert(voiceAuthSessions).values({
        userId: userData.id,
        sessionToken,
        voiceFeatures: JSON.stringify(currentFeatures),
        confidenceScore: Math.round(similarity * 100),
        environmentData: JSON.stringify(environmentData || {}),
        mfaCompleted: !requiresMFA,
        challengeAnswered: false,
        isSuccessful,
        failureReason: isSuccessful ? null : `Voice similarity below threshold (${Math.round(similarity * 100)}% < ${Math.round(threshold * 100)}%)`,
        deviceInfo: JSON.stringify(deviceInfo || {}),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        expiresAt,
      });

      // Create health record
      await db.insert(voiceHealthRecords).values({
        userId: userData.id,
        voiceFeatures: JSON.stringify(currentFeatures),
        qualityScore: healthAssessment.healthScore,
        backgroundNoise: Math.round(currentFeatures.backgroundNoise),
        voiceStrain: Math.round(currentFeatures.voiceStrain),
        environmentType: currentFeatures.environmentType,
        healthStatus: healthAssessment.overallHealth,
        adaptationRecommendations: JSON.stringify(healthAssessment.recommendations),
        anomaliesDetected: JSON.stringify(healthAssessment.anomalies),
      });

      // Update user's voice samples if authentication was successful (adaptive learning)
      if (isSuccessful && adaptationData.samples.length > storedSamples.length) {
        await db.update(users)
          .set({
            voiceSamples: JSON.stringify(adaptationData.samples.slice(-10)), // Keep last 10 samples
            voiceConfidenceScore: Math.round(similarity * 100),
            voiceAdaptationLevel: Math.min(10, (userData.voiceAdaptationLevel || 1) + 0.1),
            lastVoiceTraining: new Date(),
          })
          .where(eq(users.id, userData.id));
      }

      if (!isSuccessful) {
        return res.status(401).json({ 
          error: 'Voice authentication failed',
          confidenceScore: Math.round(similarity * 100),
          requiredScore: Math.round(threshold * 100),
          healthAssessment,
          recommendations: healthAssessment.recommendations,
        });
      }

      if (requiresMFA) {
        return res.json({
          success: true,
          requiresMFA: true,
          sessionToken,
          confidenceScore: Math.round(similarity * 100),
          healthAssessment,
          message: 'Voice verified. Please complete multi-factor authentication.',
        });
      }

      res.json({
        success: true,
        sessionToken,
        confidenceScore: Math.round(similarity * 100),
        healthAssessment,
        adaptationProgress: adaptationData.learningProgress,
        message: 'Enhanced voice authentication successful',
      });

    } catch (error) {
      console.error('Enhanced voice login error:', error);
      res.status(500).json({ error: 'Failed to process enhanced voice authentication' });
    }
  });

  // Multi-factor authentication challenge
  app.post('/api/auth/voice/mfa', async (req, res) => {
    try {
      const { sessionToken, pin, challengeAnswer, backupCode } = mfaChallengeSchema.parse(req.body);

      // Get session
      const session = await db.select().from(voiceAuthSessions)
        .where(and(
          eq(voiceAuthSessions.sessionToken, sessionToken),
          gte(voiceAuthSessions.expiresAt, new Date())
        ))
        .limit(1);

      if (session.length === 0) {
        return res.status(404).json({ error: 'Session not found or expired' });
      }

      const sessionData = session[0];
      
      // Get user data
      const user = await db.select().from(users).where(eq(users.id, sessionData.userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = user[0];
      let mfaSuccess = false;

      // Check PIN if provided
      if (pin && userData.voicePin) {
        mfaSuccess = await verifyPin(pin, userData.voicePin);
      }

      // Check challenge answer if provided
      if (challengeAnswer && userData.challengeQuestions) {
        const challenges = JSON.parse(userData.challengeQuestions);
        mfaSuccess = challenges.some((challenge: any) => 
          challenge.answer.toLowerCase() === challengeAnswer.toLowerCase()
        );
      }

      // Check backup code if provided
      if (backupCode && userData.backupCodes) {
        const codes = JSON.parse(userData.backupCodes);
        mfaSuccess = codes.includes(backupCode);
        
        // Remove used backup code
        if (mfaSuccess) {
          const updatedCodes = codes.filter((code: string) => code !== backupCode);
          await db.update(users)
            .set({ backupCodes: JSON.stringify(updatedCodes) })
            .where(eq(users.id, userData.id));
        }
      }

      // Update session
      await db.update(voiceAuthSessions)
        .set({
          mfaCompleted: mfaSuccess,
          challengeAnswered: true,
          isSuccessful: mfaSuccess,
          failureReason: mfaSuccess ? null : 'MFA challenge failed',
        })
        .where(eq(voiceAuthSessions.id, sessionData.id));

      if (!mfaSuccess) {
        return res.status(401).json({ error: 'Multi-factor authentication failed' });
      }

      res.json({
        success: true,
        message: 'Multi-factor authentication successful',
        sessionToken,
      });

    } catch (error) {
      console.error('MFA challenge error:', error);
      res.status(500).json({ error: 'Failed to process MFA challenge' });
    }
  });

  // Voice training session
  app.post('/api/auth/voice/training', async (req, res) => {
    try {
      const { sessionType, audioSamples, transcripts } = voiceTrainingSchema.parse(req.body);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required for training' });
      }

      // Process all audio samples
      const processedSamples: EnhancedVoiceFeatures[] = [];
      for (const audioData of audioSamples) {
        const features = processEnhancedAudioBase64(audioData);
        processedSamples.push(features);
      }

      // Get user's current voice data
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = user[0];
      const currentSamples: EnhancedVoiceFeatures[] = userData.voiceSamples ? 
        JSON.parse(userData.voiceSamples) : [];

      // Combine with existing samples
      const allSamples = [...currentSamples, ...processedSamples].slice(-20); // Keep last 20 samples

      // Calculate improvement metrics
      const oldConfidence = userData.voiceConfidenceScore || 0;
      const newConfidence = Math.min(100, oldConfidence + (processedSamples.length * 5));
      const confidenceImprovement = newConfidence - oldConfidence;

      // Create training session record
      const trainingSession = await db.insert(voiceTrainingSessions).values({
        userId,
        sessionType,
        samplesCollected: processedSamples.length,
        voiceSamples: JSON.stringify(processedSamples),
        qualityMetrics: JSON.stringify({
          averageClarity: processedSamples.reduce((sum, s) => sum + s.speechClarity, 0) / processedSamples.length,
          averageStrain: processedSamples.reduce((sum, s) => sum + s.voiceStrain, 0) / processedSamples.length,
          consistencyScore: calculateConsistency(processedSamples),
        }),
        improvementMetrics: JSON.stringify({
          confidenceImprovement,
          sampleCount: processedSamples.length,
          trainingType: sessionType,
        }),
        trainingComplete: processedSamples.length >= 3,
        confidenceImprovement,
        completedAt: processedSamples.length >= 3 ? new Date() : null,
      });

      // Update user's voice data
      await db.update(users)
        .set({
          voiceSamples: JSON.stringify(allSamples),
          voiceConfidenceScore: newConfidence,
          voiceAdaptationLevel: Math.min(10, (userData.voiceAdaptationLevel || 1) + 0.5),
          lastVoiceTraining: new Date(),
        })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        trainingSessionId: trainingSession.insertId,
        samplesProcessed: processedSamples.length,
        confidenceImprovement,
        newConfidenceLevel: newConfidence,
        trainingComplete: processedSamples.length >= 3,
        message: 'Voice training session completed successfully',
      });

    } catch (error) {
      console.error('Voice training error:', error);
      res.status(500).json({ error: 'Failed to process voice training session' });
    }
  });

  // Get voice health history
  app.get('/api/auth/voice/health/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const healthRecords = await db.select()
        .from(voiceHealthRecords)
        .where(eq(voiceHealthRecords.userId, userId))
        .orderBy(desc(voiceHealthRecords.createdAt))
        .limit(10);

      const healthHistory = healthRecords.map(record => ({
        date: record.createdAt,
        healthScore: record.qualityScore,
        voiceStrain: record.voiceStrain,
        backgroundNoise: record.backgroundNoise,
        environmentType: record.environmentType,
        healthStatus: record.healthStatus,
        recommendations: JSON.parse(record.adaptationRecommendations || '[]'),
        anomalies: JSON.parse(record.anomaliesDetected || '[]'),
      }));

      res.json({
        success: true,
        healthHistory,
        summary: {
          averageHealthScore: healthHistory.reduce((sum, h) => sum + (h.healthScore || 0), 0) / healthHistory.length,
          totalRecords: healthHistory.length,
          latestStatus: healthHistory[0]?.healthStatus || 'unknown',
        },
      });

    } catch (error) {
      console.error('Voice health history error:', error);
      res.status(500).json({ error: 'Failed to get voice health history' });
    }
  });

  // Setup MFA for voice authentication
  app.post('/api/auth/voice/setup-mfa', async (req, res) => {
    try {
      const { userId, pin, challengeQuestions } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        randomBytes(4).toString('hex').toUpperCase()
      );

      // Hash PIN if provided
      const hashedPin = pin ? await hashPin(pin) : null;

      // Update user with MFA settings
      await db.update(users)
        .set({
          mfaEnabled: true,
          voicePin: hashedPin,
          challengeQuestions: JSON.stringify(challengeQuestions || []),
          backupCodes: JSON.stringify(backupCodes),
        })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        backupCodes,
        message: 'Multi-factor authentication setup complete',
      });

    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({ error: 'Failed to setup multi-factor authentication' });
    }
  });
}

// Helper functions
function generateVoicePrint(features: EnhancedVoiceFeatures): string {
  const data = `${features.pitch}-${features.energy}-${features.avgFrequency}-${features.spectralCentroid}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 32);
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(pin + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const [salt, hash] = hashedPin.split(':');
  const testHash = createHash('sha256').update(pin + salt).digest('hex');
  return testHash === hash;
}

function calculateConsistency(samples: EnhancedVoiceFeatures[]): number {
  if (samples.length < 2) return 100;
  
  let totalVariance = 0;
  const features = ['pitch', 'energy', 'avgFrequency', 'speechClarity'] as const;
  
  features.forEach(feature => {
    const values = samples.map(s => s[feature]);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    totalVariance += variance;
  });
  
  const avgVariance = totalVariance / features.length;
  return Math.max(0, 100 - (avgVariance / 100));
}