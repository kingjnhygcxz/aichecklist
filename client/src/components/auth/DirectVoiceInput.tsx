import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface DirectVoiceInputProps {
  onVoicePassword: (password: string) => void;
  mode: 'setup' | 'login';
}

export function DirectVoiceInput({ onVoicePassword, mode }: DirectVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [recordedPassword, setRecordedPassword] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [browserSupport, setBrowserSupport] = useState(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setBrowserSupport(!!SpeechRecognition);
  }, []);

  // Start voice recording with native browser API
  const startListening = async () => {
    if (!browserSupport) {
      setStatus('error');
      return;
    }

    try {
      console.log('Requesting microphone permission...');
      
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Create new speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;
      
      // Add speech detection sensitivity
      if ('speechstart' in recognition) {
        recognition.onspeechstart = () => {
          console.log('Speech detected - keeping microphone active');
        };
      }
      
      if ('speechend' in recognition) {
        recognition.onspeechend = () => {
          console.log('Speech ended - processing in 2 seconds');
          setTimeout(() => {
            if (transcript.trim()) {
              recognition.stop();
            }
          }, 2000);
        };
      }
      
      recognitionRef.current = recognition;
      
      // Set up event handlers
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setStatus('listening');
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        console.log('Speech recognition result received');
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          console.log('Network error - attempting retry...');
          // Retry after short delay
          setTimeout(() => {
            if (recognitionRef.current) {
              setStatus('idle');
              startListening();
            }
          }, 1000);
        } else {
          setStatus('error');
          setIsListening(false);
          setTimeout(() => setStatus('idle'), 2000);
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        if (status === 'listening' && transcript.trim()) {
          // Process immediately if we have transcript
          processTranscript();
        } else if (status === 'listening') {
          // Restart recognition if no transcript captured yet
          console.log('Restarting recognition - no transcript captured');
          setTimeout(() => {
            if (recognitionRef.current && !transcript.trim()) {
              recognition.start();
              setIsListening(true);
            }
          }, 500);
        }
      };
      
      // Start recognition
      recognition.start();
      console.log('Speech recognition started successfully');
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (recognitionRef.current && isListening) {
          console.log('Auto-stopping after 10 seconds');
          stopListening();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // Stop voice recording
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('processing');
    }
  };

  // Process the captured transcript
  const processTranscript = () => {
    if (transcript.trim()) {
      const cleanPassword = transcript.trim().toLowerCase();
      setRecordedPassword(cleanPassword);
      
      setStatus('success');
      onVoicePassword(cleanPassword);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };



  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening... Speak your password';
      case 'processing':
        return 'Processing your voice...';
      case 'success':
        return 'Voice password captured!';
      case 'error':
        return 'Please try again';
      default:
        return mode === 'setup' ? 'Set your voice password' : 'Say your voice password';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-blue-500';
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

  if (!browserSupport) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Voice recognition is not supported in this browser
        </p>
        <Input
          type="text"
          placeholder="Type: welcome to the best ai list"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              if (value.trim()) {
                onVoicePassword(value.trim().toLowerCase());
              }
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium mb-2">Voice Password Authentication</h4>
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </p>
      </div>



      <div className="flex justify-center space-x-4">
        {status === 'idle' && (
          <Button
            type="button"
            size="lg"
            onClick={startListening}
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}

        {status === 'listening' && (
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={stopListening}
            className="rounded-full w-16 h-16 animate-pulse"
          >
            <MicOff className="h-6 w-6" />
          </Button>
        )}

        {status === 'processing' && (
          <Button
            type="button"
            size="lg"
            disabled
            className="rounded-full w-16 h-16"
          >
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
          </Button>
        )}

        {(status === 'success' || status === 'error') && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => {
              setStatus('idle');
              setRecordedPassword('');
            }}
            className="rounded-full w-16 h-16"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>

      {recordedPassword && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Captured:</p>
          <p className="text-sm font-mono bg-muted p-2 rounded">
            "{recordedPassword}"
          </p>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Click the microphone to start recording</p>
        <p>• Speak clearly: "welcome to the best ai list"</p>
        <p>• Recording will stop automatically after 10 seconds</p>
      </div>
    </div>
  );
}