import React, { useEffect, useState, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from '@/hooks/use-toast';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/hooks/useTaskManager';
import { TaskCategory, TaskPriority } from '@/types';

interface VoiceCommandListenerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCommandListener({ isOpen, onClose }: VoiceCommandListenerProps) {
  const { addTask } = useTaskManager();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  const detectCategory = (text: string): TaskCategory => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('shop') || lowerText.includes('buy') || lowerText.includes('grocery')) {
      return 'Shopping';
    } else if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('project')) {
      return 'Work';
    } else if (lowerText.includes('doctor') || lowerText.includes('health') || lowerText.includes('exercise')) {
      return 'Health';
    } else if (lowerText.includes('personal') || lowerText.includes('home') || lowerText.includes('family')) {
      return 'Personal';
    }
    return 'Other';
  };

  const detectPriority = (text: string): TaskPriority => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('high priority')) {
      return 'High';
    } else if (lowerText.includes('low priority') || lowerText.includes('whenever')) {
      return 'Low';
    }
    return 'Medium';
  };

  // Process transcript with AI parsing
  useEffect(() => {
    if (!isOpen || !transcript) return;
    
    // Only process if we have substantial content and it's different from what we processed before
    if (transcript.trim().length > 3 && transcript.trim() !== lastProcessedTranscript) {
      console.log("Processing spoken text for AI task parsing:", transcript);
      
      // Check if transcript contains "next item" patterns
      const containsNextItem = /\b(next item|next task|add another|another task|next)\b/gi.test(transcript);
      console.log('Contains next item:', containsNextItem);
      
      const processingTimeout = setTimeout(async () => {
        const currentTranscript = transcript.trim();
        
        // Double-check we haven't already processed this
        if (currentTranscript === lastProcessedTranscript) return;
        
        try {
          console.log('Starting AI parsing for transcript:', currentTranscript);
          // Use AI to parse tasks
          const response = await fetch('/api/ai/parse-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: currentTranscript })
          });
          
          if (response.ok) {
            const data = await response.json();
            const tasks = data.tasks || [];
            
            console.log('AI parsed tasks:', tasks);
            
            if (tasks.length > 0) {
              // Create each parsed task
              for (const taskText of tasks) {
                if (taskText.trim().length > 2) {
                  const finalTask = {
                    title: taskText.trim(),
                    category: detectCategory(taskText),
                    priority: detectPriority(taskText),
                    completed: false
                  };
                  
                  console.log('Creating parsed task:', finalTask);
                  addTask(finalTask);
                }
              }
              
              const taskCount = tasks.filter((t: string) => t.trim().length > 2).length;
              
              if (taskCount === 1) {
                toast({
                  title: "Task Added",
                  description: `Added: "${tasks[0]}". Say "next item" for another task.`,
                  variant: "default"
                });
              } else {
                toast({
                  title: "Tasks Added",
                  description: `Added ${taskCount} tasks. Say "next item" for more tasks.`,
                  variant: "default"
                });
              }
              
              // Mark this transcript as processed
              setLastProcessedTranscript(currentTranscript);
              
              // Clear the transcript to prepare for next input but keep listening
              resetTranscript();
              
              // Keep listening for more tasks - don't auto-close
            }
          } else {
            throw new Error('AI parsing failed');
          }
        } catch (error) {
          console.error('AI parsing error:', error);
          
          // Fallback: create single task
          const fallbackTask = {
            title: currentTranscript,
            category: detectCategory(currentTranscript),
            priority: detectPriority(currentTranscript),
            completed: false
          };
          
          addTask(fallbackTask);
          
          toast({
            title: "Task Added",
            description: `Added: "${currentTranscript}". Say "next item" for another task.`,
            variant: "default"
          });
          
          setLastProcessedTranscript(currentTranscript);
          
          // Clear the transcript to prepare for next input but keep listening
          resetTranscript();
          
          // Keep listening for more tasks - don't auto-close
        }
      }, 1200);

      return () => clearTimeout(processingTimeout);
    }
  }, [transcript, isOpen, lastProcessedTranscript, addTask, onClose]);

  // Handle dialog open/close and speech recognition
  useEffect(() => {
    if (isOpen && browserSupportsSpeechRecognition) {
      // Reset state when opening
      resetTranscript();
      setLastProcessedTranscript('');
      
      const startListeningWithPermission = async () => {
        try {
          console.log("Requesting microphone permission for voice commands...");
          // Request microphone permission explicitly
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Stop the stream immediately - we just needed to get permission
          stream.getTracks().forEach(track => track.stop());
          console.log("Microphone permission granted, starting speech recognition");
          
          // Start speech recognition with proper configuration for continuous listening
          SpeechRecognition.startListening({ 
            continuous: true,
            language: 'en-US',
            interimResults: true
          });
        } catch (error) {
          console.error("Microphone permission denied:", error);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands",
            variant: "destructive"
          });
        }
      };
      
      // Only start if not already listening
      if (!listening) {
        setTimeout(startListeningWithPermission, 100);
      }
    } else if (!isOpen) {
      console.log("Stopping speech recognition");
      SpeechRecognition.stopListening();
    }

    return () => {
      if (!isOpen) {
        SpeechRecognition.stopListening();
      }
    };
  }, [isOpen, browserSupportsSpeechRecognition]);

  if (!isOpen) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Voice Commands Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please enable it in your browser settings or try Chrome, Edge, or Safari.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm mx-4 shadow-2xl border border-slate-700/30"
      >
        {/* Header with microphone animation */}
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
              <MicIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">Voice Commands</h3>
          <p className="text-green-400 text-sm">
            {listening ? "Listening..." : "Starting..."}
          </p>
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
            Say tasks separated by "next item" or "delete last item" to remove the most recent task
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-xl border border-slate-600/40 text-sm transition-colors"
          >
            {listening ? 'Stop & Close' : 'Close'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}