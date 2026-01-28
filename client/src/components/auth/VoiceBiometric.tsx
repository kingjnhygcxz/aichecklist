import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, CheckCircle, XCircle } from 'lucide-react';

interface VoiceBiometricProps {
  onVoiceCapture: (voiceData: string, transcribedText?: string) => void;
  mode: 'setup' | 'login';
}

export function VoiceBiometric({ onVoiceCapture, mode }: VoiceBiometricProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      console.log('Starting voice biometric recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      setTranscribedText('');
      
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
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setStatus('recording');
      
      // Auto-stop after 5 seconds for voice sample
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 5000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('processing');
      
      // Stop speech recognition
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
      
      // Convert to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        const audioData = base64Audio.split(',')[1]; // Remove data URL prefix
        
        console.log('Voice biometric data captured, size:', audioData.length);
        console.log('Transcribed text:', transcribedText);
        console.log('Calling onVoiceCapture with data...');
        setStatus('success');
        
        // Add delay to ensure status update is visible
        setTimeout(() => {
          onVoiceCapture(audioData, transcribedText);
        }, 500);
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return `Recording voice sample... ${recordingTime}s`;
      case 'processing':
        return 'Processing voice biometric...';
      case 'success':
        return mode === 'setup' ? 'Voice registered!' : 'Voice verified!';
      case 'error':
        return 'Recording failed. Try again.';
      default:
        return mode === 'setup' ? 'Record your voice for biometric setup' : 'Record your voice to authenticate';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return 'text-red-500';
      case 'processing':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium mb-2">Voice Biometric Authentication</h4>
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        {transcribedText && mode === 'login' && (
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <span className="text-muted-foreground">Heard: </span>
            <span className="font-mono">{transcribedText}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status === 'processing'}
          className="rounded-full w-20 h-20"
        >
          {isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : status === 'success' ? (
            <CheckCircle className="h-8 w-8" />
          ) : status === 'error' ? (
            <XCircle className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Click to record a 5-second voice sample</p>
        <p>• Speak clearly: "Welcome to the best AI list"</p>
        <p>• Your voice characteristics will be analyzed for security</p>
      </div>
    </div>
  );
}