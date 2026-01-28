import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, User, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicrophoneTest } from './MicrophoneTest';

interface VoiceTrainingProps {
  phrase: string;
  onTrainingComplete: (voiceData: VoiceTrainingData) => void;
  onCancel: () => void;
}

interface VoiceTrainingData {
  samples: string[];
  averageLength: number;
  commonWords: string[];
  voicePattern: string;
}

function VoiceTraining({ phrase, onTrainingComplete, onCancel }: VoiceTrainingProps) {
  const [currentSample, setCurrentSample] = useState(0);
  const [samples, setSamples] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'recording' | 'processing' | 'complete'>('waiting');
  const [micTested, setMicTested] = useState(false);
  const [showMicTest, setShowMicTest] = useState(true);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const totalSamples = 5; // Train with 5 voice samples

  const startRecording = useCallback(() => {
    if (!browserSupportsSpeechRecognition) return;

    resetTranscript();
    setIsRecording(true);
    setStatus('recording');
    
    SpeechRecognition.startListening({ 
      continuous: false,
      language: 'en-US'
    });

    // Auto-stop after 8 seconds
    setTimeout(() => {
      if (listening) {
        SpeechRecognition.stopListening();
      }
    }, 8000);
  }, [browserSupportsSpeechRecognition, resetTranscript, listening]);

  const stopRecording = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
    setStatus('processing');

    setTimeout(() => {
      if (transcript.trim()) {
        const newSamples = [...samples, transcript.trim().toLowerCase()];
        setSamples(newSamples);
        
        if (newSamples.length >= totalSamples) {
          // Training complete - analyze voice patterns
          const voiceData = analyzeVoicePatterns(newSamples);
          setStatus('complete');
          onTrainingComplete(voiceData);
        } else {
          setCurrentSample(prev => prev + 1);
          setStatus('waiting');
          resetTranscript();
        }
      } else {
        setStatus('waiting');
      }
    }, 2000);
  }, [transcript, samples, onTrainingComplete, resetTranscript]);

  // Analyze voice patterns from samples
  const analyzeVoicePatterns = (voiceSamples: string[]): VoiceTrainingData => {
    const allWords = voiceSamples.join(' ').split(' ');
    const wordFrequency: { [key: string]: number } = {};
    
    allWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const commonWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    const averageLength = voiceSamples.reduce((sum, sample) => sum + sample.length, 0) / voiceSamples.length;
    
    // Create a voice pattern signature
    const voicePattern = voiceSamples.join('|');

    return {
      samples: voiceSamples,
      averageLength,
      commonWords,
      voicePattern
    };
  };

  // Handle automatic recording stop
  React.useEffect(() => {
    if (!listening && isRecording && status === 'recording') {
      stopRecording();
    }
  }, [listening, isRecording, status, stopRecording]);

  const retryCurrentSample = () => {
    setStatus('waiting');
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

  const handleMicTestComplete = (success: boolean) => {
    setMicTested(success);
    if (success) {
      setShowMicTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Voice Training
        </h3>
        <p className="text-sm text-muted-foreground">
          Train the system to recognize your unique voice by saying the phrase {totalSamples} times
        </p>
      </div>

      {showMicTest && (
        <MicrophoneTest onTestComplete={handleMicTestComplete} />
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Training Progress</span>
          <span>{samples.length} of {totalSamples}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${(samples.length / totalSamples) * 100}%` }}
          />
        </div>
      </div>

      {/* Training Phrase */}
      <div className="bg-primary/10 p-4 rounded-lg border-2 border-dashed border-primary/30">
        <p className="text-center text-lg font-medium">
          Say: "{phrase}"
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Sample {currentSample + 1} of {totalSamples}
        </p>
      </div>

      {/* Voice Visualizer */}
      <div className="relative">
        <div className="flex items-center justify-center h-32 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
          <AnimatePresence mode="wait">
            {status === 'waiting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <Mic className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ready to record sample {currentSample + 1}
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
                <p className="text-sm text-muted-foreground">Processing sample...</p>
              </motion.div>
            )}

            {status === 'complete' && (
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
                  Voice training complete!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div className="bg-primary/10 p-3 rounded-md">
          <p className="text-sm font-medium">Captured:</p>
          <p className="text-sm italic">"{transcript}"</p>
        </div>
      )}

      {/* Samples List */}
      {samples.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Voice Samples:</p>
          {samples.map((sample, index) => (
            <div key={index} className="bg-secondary/50 p-2 rounded text-sm">
              <span className="text-muted-foreground">#{index + 1}:</span> {sample}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {status === 'waiting' && (
          <>
            <Button 
              onClick={startRecording}
              className="bg-primary hover:bg-primary/90"
            >
              <Mic className="h-4 w-4 mr-2" />
              Record Sample {currentSample + 1}
            </Button>
            {samples.length > 0 && (
              <Button 
                onClick={retryCurrentSample}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </>
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

        <Button 
          onClick={onCancel}
          variant="outline"
          disabled={status === 'processing'}
        >
          Cancel Training
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Speak clearly and consistently</p>
        <p>• Use the same tone and pace for each sample</p>
        <p>• Avoid background noise for best results</p>
      </div>
    </div>
  );
}

export default VoiceTraining;