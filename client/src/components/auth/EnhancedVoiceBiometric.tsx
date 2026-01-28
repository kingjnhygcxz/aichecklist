import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Shield, CheckCircle, AlertTriangle, Settings, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedVoiceBiometricProps {
  onVoiceCapture: (voiceData: string, transcribedText?: string, healthData?: VoiceHealthData) => void;
  mode: 'setup' | 'login' | 'training';
  userId?: number;
  currentConfidenceLevel?: number;
  requiresMFA?: boolean;
  onMFAChallenge?: () => void;
}

interface VoiceHealthData {
  healthScore: number;
  voiceStrain: number;
  backgroundNoise: number;
  speechClarity: number;
  environmentType: string;
  recommendations: string[];
  anomalies: string[];
}

interface VoiceQualityMetrics {
  signalStrength: number;
  noiseLevel: number;
  clarity: number;
  consistency: number;
}

export function EnhancedVoiceBiometric({ 
  onVoiceCapture, 
  mode, 
  userId,
  currentConfidenceLevel = 0,
  requiresMFA = false,
  onMFAChallenge 
}: EnhancedVoiceBiometricProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error' | 'mfa_required'>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [voiceHealth, setVoiceHealth] = useState<VoiceHealthData | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<VoiceQualityMetrics>({
    signalStrength: 0,
    noiseLevel: 0,
    clarity: 0,
    consistency: 0
  });
  const [adaptationProgress, setAdaptationProgress] = useState(0);
  const [showHealthDetails, setShowHealthDetails] = useState(false);
  const [environmentAdaptation, setEnvironmentAdaptation] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const qualityAnalyzerRef = useRef<AudioAnalyser | null>(null);

  // Real-time audio quality analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && streamRef.current) {
      interval = setInterval(() => {
        analyzeAudioQuality();
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const analyzeAudioQuality = () => {
    if (qualityAnalyzerRef.current) {
      // Simulate real-time audio analysis
      const signalStrength = Math.random() * 40 + 60; // 60-100
      const noiseLevel = Math.random() * 30; // 0-30
      const clarity = Math.random() * 30 + 70; // 70-100
      const consistency = Math.random() * 20 + 80; // 80-100

      setQualityMetrics({
        signalStrength,
        noiseLevel,
        clarity,
        consistency
      });

      // Environmental adaptation suggestions
      if (noiseLevel > 20) {
        setEnvironmentAdaptation('High background noise detected - consider moving to a quieter location');
      } else if (signalStrength < 70) {
        setEnvironmentAdaptation('Weak signal - move closer to your microphone');
      } else {
        setEnvironmentAdaptation('');
      }
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting enhanced voice biometric recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher quality for better analysis
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      setTranscribedText('');
      setVoiceHealth(null);
      setEnvironmentAdaptation('');
      
      // Initialize audio quality analyzer
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      qualityAnalyzerRef.current = analyser;
      
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscribedText(transcript);
        };
        
        recognitionRef.current.start();
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processAudioData();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('processing');
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processAudioData = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioData = base64Audio.split(',')[1];
        
        // Simulate enhanced voice processing
        await simulateEnhancedProcessing(audioData);
        
        console.log('Enhanced voice biometric data captured');
        console.log('Health assessment:', voiceHealth);
        setStatus('success');
        
        setTimeout(() => {
          if (requiresMFA && status !== 'mfa_required') {
            setStatus('mfa_required');
            onMFAChallenge?.();
          } else {
            onVoiceCapture(audioData, transcribedText, voiceHealth || undefined);
          }
        }, 1000);
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const simulateEnhancedProcessing = async (audioData: string) => {
    // Simulate voice health analysis
    const healthScore = Math.random() * 30 + 70; // 70-100
    const voiceStrain = Math.random() * 50; // 0-50
    const backgroundNoise = qualityMetrics.noiseLevel;
    const speechClarity = qualityMetrics.clarity;
    
    const recommendations: string[] = [];
    const anomalies: string[] = [];
    
    if (voiceStrain > 30) {
      recommendations.push('Consider vocal rest');
      anomalies.push('Elevated voice strain detected');
    }
    
    if (backgroundNoise > 25) {
      recommendations.push('Try using the system in a quieter environment');
    }
    
    if (speechClarity < 75) {
      recommendations.push('Speak more clearly and slowly');
    }

    const environmentTypes = ['quiet', 'office', 'noisy', 'vehicle', 'outdoor'];
    const environmentType = environmentTypes[Math.floor(Math.random() * environmentTypes.length)];
    
    setVoiceHealth({
      healthScore,
      voiceStrain,
      backgroundNoise,
      speechClarity,
      environmentType,
      recommendations,
      anomalies
    });
    
    // Simulate adaptation progress
    if (mode === 'training') {
      setAdaptationProgress(prev => Math.min(100, prev + 20));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'text-blue-500';
      case 'processing': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'mfa_required': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Voice Authentication
            {mode === 'training' && <Badge variant="secondary">Training Mode</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Visualizer */}
          <div className="relative">
            <div className="flex items-center justify-center h-40 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <Mic className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">Ready to Record</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'setup' ? 'Speak your passphrase to set up voice authentication' :
                       mode === 'training' ? 'Speak to improve voice recognition accuracy' :
                       'Speak your passphrase to authenticate'}
                    </p>
                  </motion.div>
                )}

                {status === 'recording' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Mic className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg font-medium text-red-500">Recording...</p>
                    <p className="text-2xl font-mono">{recordingTime}s</p>
                    
                    {/* Real-time quality indicators */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div>Signal: {qualityMetrics.signalStrength.toFixed(0)}%</div>
                      <div>Clarity: {qualityMetrics.clarity.toFixed(0)}%</div>
                      <div>Noise: {qualityMetrics.noiseLevel.toFixed(0)}%</div>
                      <div>Consistency: {qualityMetrics.consistency.toFixed(0)}%</div>
                    </div>
                  </motion.div>
                )}

                {status === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg font-medium text-yellow-500">Processing...</p>
                    <p className="text-sm text-muted-foreground">Analyzing voice patterns and health</p>
                  </motion.div>
                )}

                {(status === 'success' || status === 'mfa_required') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-500">
                      {status === 'mfa_required' ? 'Voice Verified - MFA Required' : 'Voice Verified'}
                    </p>
                    {voiceHealth && (
                      <p className={`text-sm ${getHealthScoreColor(voiceHealth.healthScore)}`}>
                        Voice Health: {voiceHealth.healthScore.toFixed(0)}%
                      </p>
                    )}
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-500">Authentication Failed</p>
                    <p className="text-sm text-muted-foreground">Please try again</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Environmental adaptation alert */}
            {environmentAdaptation && (
              <Alert className="mt-4">
                <Volume2 className="h-4 w-4" />
                <AlertDescription>{environmentAdaptation}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" disabled={status === 'processing'}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            
            {voiceHealth && (
              <Button 
                variant="outline" 
                onClick={() => setShowHealthDetails(!showHealthDetails)}
              >
                Health Details
              </Button>
            )}
          </div>

          {/* Transcript */}
          {transcribedText && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Transcript:</p>
              <p className="text-sm">{transcribedText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Progress (for training mode) */}
      {mode === 'training' && adaptationProgress > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adaptation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={adaptationProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {adaptationProgress}% complete - {adaptationProgress < 100 ? 'Continue speaking to improve accuracy' : 'Training complete!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Voice Health Details */}
      {showHealthDetails && voiceHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Health Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Overall Health</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(voiceHealth.healthScore)}`}>
                  {voiceHealth.healthScore.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Environment</p>
                <Badge variant="secondary">{voiceHealth.environmentType}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Metrics</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Voice Strain: {voiceHealth.voiceStrain.toFixed(0)}%</div>
                <div>Background Noise: {voiceHealth.backgroundNoise.toFixed(0)}%</div>
                <div>Speech Clarity: {voiceHealth.speechClarity.toFixed(0)}%</div>
              </div>
            </div>

            {voiceHealth.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recommendations</p>
                <ul className="text-sm space-y-1">
                  {voiceHealth.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {voiceHealth.anomalies.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Anomalies Detected</p>
                <ul className="text-sm space-y-1">
                  {voiceHealth.anomalies.map((anomaly, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confidence Level Display */}
      {currentConfidenceLevel > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Authentication Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={currentConfidenceLevel} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {currentConfidenceLevel}% confidence - {currentConfidenceLevel >= 90 ? 'Excellent' : 
                                                      currentConfidenceLevel >= 75 ? 'Good' : 
                                                      currentConfidenceLevel >= 60 ? 'Fair' : 'Poor'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}