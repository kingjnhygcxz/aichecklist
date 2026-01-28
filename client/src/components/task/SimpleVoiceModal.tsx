import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from '@/hooks/use-toast';
import { MicIcon, MicOffIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/hooks/useTaskManager';
import { TaskCategory, TaskPriority } from '@/types';

interface SimpleVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleVoiceModal({ isOpen, onClose }: SimpleVoiceModalProps) {
  const { addTask } = useTaskManager();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [isProcessing, setIsProcessing] = useState(false);

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

  // Process transcript with 1.2 second delay
  useEffect(() => {
    if (!isOpen || !transcript || isProcessing) return;
    
    const timeoutId = setTimeout(async () => {
      if (transcript.trim().length < 3) return;
      
      setIsProcessing(true);
      console.log('Processing transcript:', transcript);

      try {
        // Use AI to parse tasks
        const response = await fetch('/api/ai/parse-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcript.trim() })
        });
        
        if (response.ok) {
          const data = await response.json();
          const tasks = data.tasks || [];
          
          console.log('AI parsed tasks:', tasks);
          
          if (tasks.length > 0) {
            for (const taskText of tasks) {
              if (taskText.trim().length > 2) {
                const finalTask = {
                  title: taskText.trim(),
                  category: detectCategory(taskText),
                  priority: detectPriority(taskText),
                  completed: false
                };
                
                console.log('Creating task:', finalTask);
                addTask(finalTask);
              }
            }
            
            const taskCount = tasks.filter((t: string) => t.trim().length > 2).length;
            
            toast({
              title: taskCount === 1 ? "Task Added" : "Tasks Added",
              description: taskCount === 1 
                ? `Added: "${tasks[0]}". Say "next item" for another task.`
                : `Added ${taskCount} tasks. Say "next item" for more tasks.`,
              variant: "default"
            });
          }
        } else {
          // Fallback: create single task
          const fallbackTask = {
            title: transcript.trim(),
            category: detectCategory(transcript),
            priority: detectPriority(transcript),
            completed: false
          };
          
          addTask(fallbackTask);
          
          toast({
            title: "Task Added",
            description: `Added: "${transcript.trim()}". Say "next item" for another task.`,
            variant: "default"
          });
        }
        
        resetTranscript();
      } catch (error) {
        console.error('Error processing voice command:', error);
        
        // Fallback: create single task
        const fallbackTask = {
          title: transcript.trim(),
          category: detectCategory(transcript),
          priority: detectPriority(transcript),
          completed: false
        };
        
        addTask(fallbackTask);
        
        toast({
          title: "Task Added",
          description: `Added: "${transcript.trim()}". Say "next item" for another task.`,
          variant: "default"
        });
        
        resetTranscript();
      } finally {
        setIsProcessing(false);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [transcript, isOpen, isProcessing, addTask, resetTranscript]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen && browserSupportsSpeechRecognition) {
      console.log('Starting speech recognition...');
      resetTranscript();
      setIsProcessing(false);
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('Microphone permission granted');
          stream.getTracks().forEach(track => track.stop());
          
          console.log('Starting SpeechRecognition with continuous mode...');
          SpeechRecognition.startListening({ 
            continuous: true,
            language: 'en-US',
            interimResults: true
          });
          
          // Log speech recognition state
          setTimeout(() => {
            console.log('Speech recognition state:', { listening, transcript });
          }, 1000);
        })
        .catch(error => {
          console.error('Microphone permission denied:', error);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands",
            variant: "destructive"
          });
        });
    } else if (!isOpen) {
      console.log('Stopping speech recognition');
      SpeechRecognition.stopListening();
    }
  }, [isOpen, browserSupportsSpeechRecognition, resetTranscript]);

  // Debug transcript changes
  useEffect(() => {
    if (transcript) {
      console.log('Transcript changed:', transcript);
    }
  }, [transcript]);

  // Debug listening state changes
  useEffect(() => {
    console.log('Listening state changed:', listening);
  }, [listening]);

  if (!isOpen) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Voice Commands Not Supported</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
      >
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Voice Commands</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Animated circles when listening */}
              {listening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 w-20 h-20 rounded-full bg-green-400"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    className="absolute inset-0 w-20 h-20 rounded-full bg-green-500"
                  />
                </>
              )}
              
              {/* Audio visualization bars */}
              {listening && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: listening ? [4, 16, 4] : 4,
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="w-1 bg-white rounded-full"
                        style={{ height: 4 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Main microphone button */}
              <motion.div
                animate={listening ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 ${
                  listening 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500'
                }`}
              >
                {listening ? <MicIcon className="w-10 h-10" /> : <MicOffIcon className="w-10 h-10" />}
              </motion.div>
            </div>
          </div>
          
          {listening ? (
            <div>
              <p className="text-green-600 mb-2">Listening...</p>
              <p className="text-sm text-gray-500 mb-4">
                Say: "buy groceries next item call dentist"
              </p>
              {transcript && (
                <div className="bg-gray-50 p-3 rounded mb-4 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>You said:</strong> {transcript}
                  </p>
                </div>
              )}
              {isProcessing && (
                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Processing...</strong> Creating tasks
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">
              Starting voice recognition...
            </p>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {listening ? 'Stop & Close' : 'Close'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}