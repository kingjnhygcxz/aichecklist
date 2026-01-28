import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from '@/hooks/use-toast';

interface VoiceDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceDiagnostic({ isOpen, onClose }: VoiceDiagnosticProps) {
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const addResult = (message: string) => {
    setDiagnosticResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('Diagnostic:', message);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults([]);
    
    // Test 1: Browser support
    addResult(`Browser support: ${browserSupportsSpeechRecognition ? 'YES' : 'NO'}`);
    addResult(`User agent: ${navigator.userAgent}`);
    
    // Test 2: Check if running on HTTPS
    addResult(`Protocol: ${window.location.protocol}`);
    addResult(`Host: ${window.location.host}`);
    
    // Test 3: Check Web Speech API availability
    const speechRecognitionAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    addResult(`Web Speech API: ${speechRecognitionAvailable ? 'Available' : 'Not available'}`);
    
    // Test 4: Check microphone permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addResult('Microphone permission: GRANTED');
      
      // Test audio input levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Check for audio input for 3 seconds
      let maxVolume = 0;
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        let volume = 0;
        for (let i = 0; i < dataArray.length; i++) {
          volume = Math.max(volume, dataArray[i]);
        }
        maxVolume = Math.max(maxVolume, volume);
      };
      
      const audioCheckInterval = setInterval(checkAudio, 100);
      
      setTimeout(() => {
        clearInterval(audioCheckInterval);
        addResult(`Max audio level detected: ${maxVolume} (0-255 scale)`);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        // Test 5: Try starting speech recognition
        testSpeechRecognition();
      }, 3000);
      
    } catch (error) {
      addResult(`Microphone permission: DENIED - ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRunning(false);
    }
  };

  const testSpeechRecognition = () => {
    addResult('Testing speech recognition...');
    resetTranscript();
    
    try {
      // Try different configurations
      const configs = [
        { continuous: true, interimResults: true, language: 'en-US' },
        { continuous: false, interimResults: true, language: 'en-US' },
        { continuous: true, interimResults: false, language: 'en-US' },
        { continuous: false, interimResults: false, language: 'en-US' }
      ];
      
      let configIndex = 0;
      
      const testNextConfig = () => {
        if (configIndex >= configs.length) {
          addResult('All speech recognition tests completed');
          setIsRunning(false);
          return;
        }
        
        const config = configs[configIndex];
        addResult(`Testing config ${configIndex + 1}: continuous=${config.continuous}, interim=${config.interimResults}`);
        
        try {
          SpeechRecognition.startListening(config);
          
          setTimeout(() => {
            SpeechRecognition.stopListening();
            addResult(`Config ${configIndex + 1} result: "${transcript || 'No speech detected'}"`);
            configIndex++;
            setTimeout(testNextConfig, 1000);
          }, 5000);
          
        } catch (error) {
          addResult(`Config ${configIndex + 1} failed: ${error.message}`);
          configIndex++;
          setTimeout(testNextConfig, 1000);
        }
      };
      
      testNextConfig();
      
    } catch (error) {
      addResult(`Speech recognition test failed: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Monitor transcript changes
  useEffect(() => {
    if (transcript && isRunning) {
      addResult(`Transcript update: "${transcript}"`);
    }
  }, [transcript, isRunning]);

  // Monitor listening state
  useEffect(() => {
    if (isRunning) {
      addResult(`Listening state: ${listening ? 'ACTIVE' : 'INACTIVE'}`);
    }
  }, [listening, isRunning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 shadow-xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Voice Recognition Diagnostic</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <button
            onClick={runDiagnostic}
            disabled={isRunning}
            className={`px-4 py-2 rounded ${
              isRunning 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isRunning ? 'Running Diagnostic...' : 'Start Diagnostic'}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
          <h4 className="font-semibold mb-2">Diagnostic Results:</h4>
          {diagnosticResults.length === 0 ? (
            <p className="text-gray-500">Click "Start Diagnostic" to begin tests</p>
          ) : (
            <div className="space-y-1">
              {diagnosticResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {isRunning && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-blue-700 text-sm">
              <strong>During audio test:</strong> Please speak clearly into your microphone to test audio input levels.
            </p>
          </div>
        )}
        
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}