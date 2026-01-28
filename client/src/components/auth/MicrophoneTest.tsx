import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface MicrophoneTestProps {
  onTestComplete: (success: boolean) => void;
}

export function MicrophoneTest({ onTestComplete }: MicrophoneTestProps) {
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const testMicrophone = useCallback(async () => {
    setIsTestingMic(true);
    setMicStatus('testing');
    setErrorMessage('');

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      console.log('Microphone stream obtained:', stream);

      // Create audio context to analyze audio input
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let audioDetected = false;
      let testDuration = 0;
      const maxTestTime = 5000; // 5 seconds

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        if (average > 10) { // Threshold for audio detection
          audioDetected = true;
          console.log('Audio detected, average volume:', average);
        }

        testDuration += 100;
        
        if (audioDetected || testDuration >= maxTestTime) {
          // Stop the test
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          if (audioDetected) {
            setMicStatus('success');
            onTestComplete(true);
          } else {
            setMicStatus('error');
            setErrorMessage('No audio detected. Please check your microphone and speak during the test.');
            onTestComplete(false);
          }
          setIsTestingMic(false);
        } else {
          setTimeout(checkAudio, 100);
        }
      };

      // Start audio detection
      setTimeout(checkAudio, 100);

    } catch (error) {
      console.error('Microphone test failed:', error);
      setMicStatus('error');
      setIsTestingMic(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No microphone found. Please connect a microphone and try again.');
        } else {
          setErrorMessage(`Microphone error: ${error.message}`);
        }
      } else {
        setErrorMessage('Unknown microphone error occurred.');
      }
      onTestComplete(false);
    }
  }, [onTestComplete]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
      <div className="text-center">
        <h4 className="font-medium mb-2">Microphone Test</h4>
        <p className="text-sm text-muted-foreground">
          Test your microphone before voice training
        </p>
      </div>

      <div className="flex items-center justify-center">
        {micStatus === 'idle' && (
          <Button onClick={testMicrophone} variant="outline">
            <Mic className="h-4 w-4 mr-2" />
            Test Microphone
          </Button>
        )}

        {micStatus === 'testing' && (
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Speak now to test your microphone...</p>
          </div>
        )}

        {micStatus === 'success' && (
          <div className="text-center text-green-600">
            <Volume2 className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Microphone working correctly!</p>
          </div>
        )}

        {micStatus === 'error' && (
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Microphone Test Failed</p>
            {errorMessage && (
              <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
            )}
            <Button 
              onClick={testMicrophone} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {micStatus === 'success' && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Great! Your microphone is working. You can now proceed with voice training.
          </p>
        </div>
      )}
    </div>
  );
}