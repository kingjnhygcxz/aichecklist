import React, { useState } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { VoiceCommandListener } from './VoiceCommandListener';

interface VoiceCommandButtonProps {
  className?: string;
}

export function VoiceCommandButton({ className }: VoiceCommandButtonProps) {
  const { isListening, stopListening, browserSupportsSpeechRecognition } = useVoiceCommands();
  const [isListenerOpen, setIsListenerOpen] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn("bg-background/20 hover:bg-background/50 border-muted cursor-not-allowed opacity-50", className)}
              disabled
            >
              <MicOffIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice commands not supported in this browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const handleOpenListener = () => {
    // Directly open the voice command listener without audio beep
    setIsListenerOpen(true);
  };

  const handleCloseListener = () => {
    // Stop listening and close the interface
    stopListening();
    setIsListenerOpen(false);
  };

  return (
    <>
      <div className="relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={cn(
                  isListening 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-background/20 hover:bg-background/50 border-muted", 
                  className
                )}
                onClick={handleOpenListener}
                data-voice-button
              >
                {isListening ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    <MicIcon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <MicOffIcon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add tasks with voice commands</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Voice Command Listener Modal */}
      <VoiceCommandListener 
        isOpen={isListenerOpen} 
        onClose={handleCloseListener} 
      />
    </>
  );
}