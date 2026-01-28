import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoicePasswordInputProps {
  onVoicePassword: (password: string) => void;
  isVerifying?: boolean;
  expectedPassword?: string;
  mode: 'setup' | 'login';
}

export function VoicePasswordInput({ 
  onVoicePassword, 
  isVerifying = false, 
  expectedPassword,
  mode 
}: VoicePasswordInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recordedPassword, setRecordedPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Check microphone permissions
  const checkMicPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(result.state);
    } catch (error) {
      console.log('Permission API not supported');
      setMicPermission('unknown');
    }
  }, []);

  // Start voice recording
  const startRecording = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      setStatus('error');
      return;
    }

    // Check microphone permission first
    await checkMicPermission();

    resetTranscript();
    setIsListening(true);
    setStatus('recording');
    
    console.log('Starting speech recognition...');
    
    try {
      await SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US',
        interimResults: false
      });
      console.log('Speech recognition started successfully');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setStatus('error');
      setIsListening(false);
    }

    // Add a backup timeout in case speech recognition fails
    setTimeout(() => {
      if (isListening && !transcript.trim()) {
        console.log('No speech detected in 10 seconds, stopping...');
        SpeechRecognition.stopListening();
        setIsListening(false);
        setStatus('error');
      }
    }, 10000);
  }, [browserSupportsSpeechRecognition, resetTranscript, checkMicPermission, isListening, transcript]);

  // Stop recording and process
  const stopRecording = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsListening(false);
    setStatus('processing');

    // Process the transcript after a longer delay to capture full phrase
    setTimeout(() => {
      if (transcript.trim()) {
        const cleanPassword = transcript.trim().toLowerCase();
        setRecordedPassword(cleanPassword);
        
        if (mode === 'setup') {
          setStatus('success');
          onVoicePassword(cleanPassword);
        } else if (mode === 'login') {
          // Send the voice password to server for comparison
          onVoicePassword(cleanPassword);
          // Don't set success status here, let the server response handle it
        }
      } else {
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      }
    }, 2000);
  }, [transcript, mode, expectedPassword, onVoicePassword, resetTranscript]);

  // Add event listeners for speech recognition
  useEffect(() => {
    const handleResult = (event: any) => {
      console.log('Speech recognition result received');
    };

    const handleError = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setStatus('error');
      setIsListening(false);
    };

    const handleEnd = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        setTimeout(() => {
          stopRecording();
        }, 1000);
      }
    };

    if (typeof window !== 'undefined' && window.SpeechRecognition) {
      const recognition = new window.SpeechRecognition();
      recognition.addEventListener('result', handleResult);
      recognition.addEventListener('error', handleError);
      recognition.addEventListener('end', handleEnd);

      return () => {
        recognition.removeEventListener('result', handleResult);
        recognition.removeEventListener('error', handleError);
        recognition.removeEventListener('end', handleEnd);
      };
    }
  }, [isListening, stopRecording]);

  // Handle speech recognition state changes
  useEffect(() => {
    if (!listening && isListening && status === 'recording') {
      // Wait longer for final transcript, then process
      setTimeout(() => {
        stopRecording();
      }, 2000);
    }
  }, [listening, isListening, status, stopRecording]);

  // Reset function
  const resetPassword = () => {
    setStatus('idle');
    setRecordedPassword('');
    setAttempts(0);
    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-center p-4 border border-destructive/20 rounded-md bg-destructive/5">
        <X className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive">
          Voice recognition not supported in this browser. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  if (micPermission === 'denied') {
    return (
      <div className="text-center p-4 border border-destructive/20 rounded-md bg-destructive/5">
        <X className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive">
          Microphone access denied. Please enable microphone permissions and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {mode === 'setup' ? 'Set Voice Password' : 'Voice Password Login'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'setup' 
            ? 'Speak a memorable passphrase that will be your voice password'
            : 'Speak your voice password to login'
          }
        </p>
      </div>

      {/* Voice Visualizer */}
      <div className="relative">
        <div className="flex items-center justify-center h-32 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <Lock className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to start recording
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
                  className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <Mic className="h-6 w-6 text-white" />
                </motion.div>
                <p className="text-sm text-red-500 font-medium">Recording...</p>
                
                {/* Voice bars animation */}
                <div className="flex items-center justify-center space-x-1 mt-4">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-red-500 rounded-full"
                      animate={{
                        height: transcript ? 
                          Math.random() * 20 + 8 : 
                          Math.random() * 8 + 4,
                      }}
                      transition={{
                        duration: 0.1,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05,
                      }}
                    />
                  ))}
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
                  className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
                />
                <p className="text-sm text-muted-foreground">Processing...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <Check className="h-6 w-6 text-white" />
                </motion.div>
                <p className="text-sm text-green-500 font-medium">
                  {mode === 'setup' ? 'Voice password set!' : 'Login successful!'}
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  animate={{ x: [-10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
                <p className="text-sm text-red-500 font-medium">
                  {mode === 'setup' ? 'Recording failed. Try again.' : 'Incorrect voice password'}
                </p>
                {attempts > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Attempts: {attempts}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-primary/10 p-3 rounded-md">
          <p className="text-sm font-medium">Recorded:</p>
          <p className="text-sm italic">"{transcript}"</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Microphone: {micPermission}</p>
        <p>Listening: {listening ? 'Yes' : 'No'}</p>
        <p>Browser Support: {browserSupportsSpeechRecognition ? 'Yes' : 'No'}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {status === 'idle' && (
          <Button 
            onClick={startRecording}
            disabled={isVerifying}
            className="bg-primary hover:bg-primary/90"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}

        {status === 'recording' && (
          <Button 
            onClick={stopRecording}
            variant="destructive"
          >
            <MicOff className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        )}

        {(status === 'success' || status === 'error') && mode === 'setup' && (
          <Button 
            onClick={resetPassword}
            variant="outline"
          >
            Record Again
          </Button>
        )}

        {status === 'error' && mode === 'login' && (
          <Button 
            onClick={resetPassword}
            variant="outline"
          >
            Try Again
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Speak clearly and at a normal pace</p>
        <p>• Choose a unique phrase you'll remember</p>
        <p>• Avoid background noise for best results</p>
      </div>
    </div>
  );
}