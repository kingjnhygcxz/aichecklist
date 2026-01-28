import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { safeRedirect } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Lock, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface DomoAIVoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

interface VoiceStatus {
  enabled: boolean;
  hasAccess?: boolean;
  trialDaysLeft: number | null;
  message?: string;
}

export function DomoAIVoice({ isOpen, onClose, onTranscript }: DomoAIVoiceProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true); // Default to enabled for demo
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  const { toast } = useToast();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Check voice access status - only fetch when component mounts, no polling
  const { data: voiceStatus } = useQuery<VoiceStatus>({
    queryKey: ['/api/domoai/voice-status'],
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  useEffect(() => {
    if (voiceStatus) {
      setIsVoiceEnabled(voiceStatus.enabled);
      setTrialDaysLeft(voiceStatus.trialDaysLeft);

      // Show trial warning if applicable
      if (voiceStatus.trialDaysLeft !== null && voiceStatus.trialDaysLeft <= 3 && voiceStatus.trialDaysLeft > 0) {
        toast({
          title: "Voice Trial Ending Soon",
          description: `You have ${voiceStatus.trialDaysLeft} days left in your voice trial. Upgrade to Enterprise to keep using voice features!`,
          variant: "default",
        });
      }
    }
  }, [voiceStatus, toast]);

  // Start listening when modal opens
  useEffect(() => {
    if (isOpen && browserSupportsSpeechRecognition && isVoiceEnabled) {
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true, 
        language: 'en-US',
        interimResults: true 
      });
    } else {
      SpeechRecognition.stopListening();
    }
    
    return () => {
      SpeechRecognition.stopListening();
    };
  }, [isOpen, browserSupportsSpeechRecognition, isVoiceEnabled, resetTranscript]);

  // Process transcript when it changes
  useEffect(() => {
    if (!isOpen || !transcript) return;
    
    // Only process if we have substantial content and it's different from what we processed before
    if (transcript.trim().length > 3 && transcript.trim() !== lastProcessedTranscript) {
      const processingTimeout = setTimeout(() => {
        const currentTranscript = transcript.trim();
        
        // Double-check we haven't already processed this
        if (currentTranscript === lastProcessedTranscript) return;
        
        // Send to DomoAI for processing
        onTranscript(currentTranscript);
        setLastProcessedTranscript(currentTranscript);
        
        // Clear transcript for next input
        setTimeout(() => {
          resetTranscript();
          setLastProcessedTranscript('');
        }, 1000);
      }, 1500); // Wait 1.5 seconds after user stops speaking
      
      return () => clearTimeout(processingTimeout);
    }
  }, [transcript, isOpen, lastProcessedTranscript, onTranscript, resetTranscript]);

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <div className="text-center py-6">
            <MicOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Voice Not Supported</h3>
            <p className="text-gray-400 text-sm">
              Your browser doesn't support voice features. Please use Chrome, Edge, or Safari.
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Check for enterprise access
  if (!isVoiceEnabled && voiceStatus && !voiceStatus.hasAccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <div className="text-center py-6">
            <Lock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Feature</h3>
            <p className="text-gray-400 text-sm mb-4">
              {voiceStatus?.trialDaysLeft === 0 
                ? "Your voice trial has ended. Upgrade to Enterprise to continue using voice features."
                : "Voice features are exclusive to Enterprise accounts."}
            </p>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
              onClick={() => safeRedirect('/pricing')}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Enterprise
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>

          {/* Header with microphone animation - matching task page green theme */}
          <div className="text-center mb-4">
            <div className="relative mx-auto w-24 h-24 mb-4">
              {/* Outer rotating circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-green-400/30"
              />
              
              {/* Inner rotating circle */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-green-500/40"
              />
              
              {/* Static background */}
              <div className="absolute inset-4 rounded-full bg-green-500/20" />
              
              {/* Center mic container - NO MOVEMENT */}
              <div className="absolute inset-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                {listening ? (
                  <Mic className="w-5 h-5 text-white" />
                ) : (
                  <MicOff className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">DomoAI Voice Chat</h3>
            <p className="text-green-400 text-sm">
              {listening ? "Listening..." : "Starting..."}
            </p>
            {trialDaysLeft !== null && trialDaysLeft > 0 && (
              <p className="text-xs text-amber-400 mt-1">
                {trialDaysLeft} days left in trial
              </p>
            )}
          </div>

          {/* Audio visualization bars */}
          {listening && (
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [3, 16, 3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  className="w-1 bg-green-500 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Transcript display */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/60 rounded-xl p-3 mb-4 border border-green-500/20"
            >
              <p className="text-xs text-green-400 mb-1">You said:</p>
              <p className="text-white text-sm font-medium">{transcript}</p>
            </motion.div>
          )}

          {/* Instructions */}
          <div className="text-center mb-4">
            <p className="text-slate-400 text-xs">
              Say commands like "create task", "set timer", or ask for help
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}