import React, { useState, useEffect } from 'react';
// Lightweight CSS animation alternatives - no heavy framer-motion
const MotionDiv = ({ children, className, initial, animate, transition, ...props }: any) => (
  <div 
    className={`transition-all duration-300 ${className || ""} ${animate?.opacity ? 'opacity-100' : ''}`} 
    {...props}
  >
    {children}
  </div>
);
import { MicIcon, X } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

export function ModernVoiceModalPreview() {
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    browserSupportsSpeechRecognition 
  } = useVoiceCommands();
  
  const [isOpen, setIsOpen] = useState(true);

  // Start listening when modal opens
  useEffect(() => {
    if (isOpen && browserSupportsSpeechRecognition) {
      startListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen, browserSupportsSpeechRecognition, startListening, stopListening]);

  const handleClose = () => {
    stopListening();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm mx-4 shadow-2xl border border-slate-700/30 animate-in fade-in duration-300">
        {/* Header with microphone animation */}
        <div className="text-center mb-4">
          <div className="relative mx-auto w-24 h-24 mb-4">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-spin" style={{ animationDuration: '8s' }}></div>
            
            {/* Inner rotating circle */}
            <div className="absolute inset-2 rounded-full border border-green-500/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
            
            {/* Static background */}
            <div className="absolute inset-4 rounded-full bg-green-500/20" />
            
            {/* Center mic container - NO MOVEMENT */}
            <div className="absolute inset-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <MicIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">Voice Commands</h3>
          <p className="text-green-400 text-sm">
            {isListening ? "Listening..." : "Starting..."}
          </p>
        </div>

        {/* Audio visualization bars */}
        {isListening && (
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-500 rounded-full animate-pulse"
                style={{ 
                  height: '12px',
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* Transcript display */}
        {transcript && (
          <div className="bg-slate-800/60 rounded-xl p-3 mb-4 border border-green-500/20 animate-in fade-in duration-300">
            <p className="text-xs text-green-400 mb-1">You said:</p>
            <p className="text-white text-sm font-medium">{transcript}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mb-4">
          <p className="text-slate-400 text-xs">
            Say tasks separated by "next item" or "delete last item" to remove the most recent task
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 hover:scale-105 text-white rounded-xl border border-slate-600/40 text-sm transition-all duration-200"
          >
            {isListening ? 'Stop & Close' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}