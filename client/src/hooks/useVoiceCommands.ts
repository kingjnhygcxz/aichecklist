import { useEffect, useState, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useTaskManager } from './useTaskManager';
import { NewTask, TaskCategory, TaskPriority } from '@/types';

// Define command patterns for task management
const ADD_TASK_PATTERN = /^(add|create|put down) (task|to-do|todo|shopping)(.*)$/i;
const COMPLETE_TASK_PATTERN = /^(complete|finish|mark done|check) (task|to-do|todo)(.*)$/i;
const DELETE_TASK_PATTERN = /^(delete|remove) (task|to-do|todo)(.*)$/i;
const LIST_TASKS_PATTERN = /^(list|show|display) (tasks|to-dos|todos)$/i;
const SET_TIMER_PATTERN = /^set timer (?:for|to) (\d+) (minutes|minute|mins|min)(.*)$/i;
const START_TIMER_PATTERN = /^start timer$/i;
const STOP_LISTENING_PATTERN = /^(stop listening|stop voice commands|stop)$/i;
const NEXT_ITEM_PATTERN = /^(next item|next task|add another|another task|next)$/i;
const DELETE_LAST_ITEM_PATTERN = /^(delete last item|remove last item|delete last task|remove last task|undo last|delete most recent)$/i;
const CONFIRMATION_PATTERN = /^(yes|correct|right|confirm|ok|okay|sure)$/i;
const REJECTION_PATTERN = /^(no|wrong|incorrect|cancel|nope)$/i;

// Helper to extract task name from voice command
const extractTaskName = (text: string): string => {
  return text.trim().replace(/^(called|named|titled|about|for|to)\s+/i, '');
};

// Function to parse speech and extract individual tasks using AI
const parseTasksFromSpeech = async (transcript: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/ai/parse-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse tasks');
    }
    
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('Error parsing tasks:', error);
    // Fallback: return the original transcript as a single task
    return [transcript.trim()];
  }
};

// Helper to detect category from keywords in text
const detectCategory = (text: string): TaskCategory => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('project') || lowerText.includes('business')) {
    return 'Work';
  } else if (lowerText.includes('shop') || lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('store') || lowerText.includes('shopping')) {
    return 'Shopping';
  } else if (lowerText.includes('health') || lowerText.includes('exercise') || lowerText.includes('workout') || lowerText.includes('doctor')) {
    return 'Health';
  } else if (lowerText.includes('personal') || lowerText.includes('home') || lowerText.includes('family') || lowerText.includes('friend')) {
    return 'Personal';
  }
  
  return 'Other';
};

// Helper to detect priority from keywords in text
const detectPriority = (text: string): TaskPriority => {
  const lowerText = text.toLowerCase();
  
  // Improved priority detection with more variations of how users might specify priority
  // High priority detection
  if (lowerText.includes('high priority') || 
      lowerText.includes('urgent') || 
      lowerText.includes('important') || 
      lowerText.includes('critical') || 
      lowerText.includes('highest priority') ||
      lowerText.includes('top priority') ||
      // Match "high" as a standalone word or at the end of a sentence
      /\bhigh\b/.test(lowerText) || 
      /priority(?:\s+is)?\s+high/.test(lowerText)) {
    console.log('Detected HIGH priority from:', lowerText);
    return 'High';
  } 
  // Low priority detection
  else if (lowerText.includes('low priority') || 
          lowerText.includes('whenever') || 
          lowerText.includes('not urgent') || 
          lowerText.includes('lowest priority') ||
          // Match "low" as a standalone word or at the end of a sentence
          /\blow\b/.test(lowerText) || 
          /priority(?:\s+is)?\s+low/.test(lowerText)) {
    console.log('Detected LOW priority from:', lowerText);
    return 'Low';
  }
  // Medium priority detection
  else if (lowerText.includes('medium priority') || 
          lowerText.includes('moderate priority') || 
          lowerText.includes('normal priority') ||
          // Match "medium" as a standalone word or at the end of a sentence
          /\bmedium\b/.test(lowerText) || 
          /priority(?:\s+is)?\s+medium/.test(lowerText) ||
          /\baverage\b/.test(lowerText)) {
    console.log('Detected MEDIUM priority from:', lowerText);
    return 'Medium';
  }
  
  // Default priority if none detected
  console.log('No specific priority detected, defaulting to Medium for:', lowerText);
  return 'Medium';
};

export function useVoiceCommands() {
  const { addTask, tasks, updateTask, deleteTask } = useTaskManager();
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [confirmedTask, setConfirmedTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Store pending task for verification
  const pendingTaskRef = useRef<{ type: string; data: any } | null>(null);
  
  // Idle timeout - will process command after this many ms of silence
  const silenceTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutDuration = 1200; // 1.2 seconds
  
  // Add debouncing to prevent duplicate task creation
  const taskCreationTimeoutRef = useRef<number | null>(null);
  const lastProcessedTranscriptRef = useRef<string>('');
  const isProcessingTaskRef = useRef<boolean>(false);
  
  // Configure speech recognition
  const { 
    transcript, 
    finalTranscript,
    listening, 
    resetTranscript, 
    browserSupportsSpeechRecognition,
    interimTranscript 
  } = useSpeechRecognition();
  
  // Function to provide feedback to the user (visually only, no sounds)
  const speak = useCallback((text: string) => {
    // Set feedback text (visual only, no speech synthesis sounds)
    setFeedback(text);
    
    // Clear feedback after 5 seconds
    setTimeout(() => {
      setFeedback('');
    }, 5000);
  }, []);
  
  // Reset the UI states after a command is processed
  const resetCommandUI = useCallback(() => {
    // Show the confirmation state for 2 seconds before cleaning up
    setTimeout(() => {
      setConfirmedTask(false);
      setErrorMessage('');
      setPendingVerification(false);
      pendingTaskRef.current = null;
      // Stop listening 
      if (isListening) {
        stopListening();
      }
    }, 2000);
  }, [isListening]);
  
  // Process the pending task when confirmed
  const processPendingTask = useCallback(() => {
    const pendingTask = pendingTaskRef.current;
    if (!pendingTask) return;
    
    try {
      switch (pendingTask.type) {
        case 'add':
          addTask(pendingTask.data);
          setConfirmedTask(true);
          speak(`Task added: ${pendingTask.data.title}`);
          break;
        case 'complete':
          updateTask(pendingTask.data.id, { completed: true });
          setConfirmedTask(true);
          speak(`Task completed: ${pendingTask.data.title}`);
          break;
        case 'delete':
          deleteTask(pendingTask.data.id);
          setConfirmedTask(true);
          speak(`Task deleted: ${pendingTask.data.title}`);
          break;
        case 'timer':
          updateTask(pendingTask.data.id, { timer: pendingTask.data.minutes });
          setActiveTaskId(pendingTask.data.id);
          setConfirmedTask(true);
          speak(`Timer set for ${pendingTask.data.minutes} minutes for task: ${pendingTask.data.title}`);
          break;
        default:
          throw new Error('Unknown task type');
      }
      
      resetCommandUI();
    } catch (err) {
      console.error('Error processing task:', err);
      setErrorMessage('Failed to process the task. Please try again.');
      speak('Sorry, there was an error processing your request. Please try again.');
      
      // Reset the UI states after error
      setTimeout(() => {
        setErrorMessage('');
        setPendingVerification(false);
        pendingTaskRef.current = null;
      }, 3000);
    }
  }, [addTask, updateTask, deleteTask, speak, resetCommandUI]);
  
  // Start listening for voice commands
  const startListening = useCallback(() => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      
      // Start with continuous listening
      try {
        SpeechRecognition.startListening({ continuous: true });
        console.log('Speech recognition started successfully');
        setIsListening(true);
        speak('Voice commands activated. How can I help you?');
        
        // Log that we're listening to help with debugging
        console.log('Voice recognition active. Listening...');
        
        // Set up silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        silenceTimeoutRef.current = window.setTimeout(() => {
          if (isListening && !pendingVerification) {
            console.log('Silence timeout reached, stopping listening');
            stopListening();
          }
        }, silenceTimeoutDuration);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        speak('There was a problem activating voice commands. Please check microphone permissions.');
        setFeedback('Error: Microphone access might be blocked. Please check your browser settings.');
      }
    } else {
      console.error('Browser does not support speech recognition');
      setFeedback('Your browser does not support voice recognition.');
    }
  }, [resetTranscript, browserSupportsSpeechRecognition, speak, isListening, pendingVerification]);
  
  // Stop listening for voice commands
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsListening(false);
    
    // Clear all timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (taskCreationTimeoutRef.current) {
      clearTimeout(taskCreationTimeoutRef.current);
      taskCreationTimeoutRef.current = null;
    }
    
    // Reset processing flags
    isProcessingTaskRef.current = false;
    lastProcessedTranscriptRef.current = '';
    
    // Only speak if not in the middle of verification or showing results
    if (!pendingVerification && !confirmedTask) {
      speak('Voice commands deactivated.');
    }
  }, [speak, pendingVerification, confirmedTask]);
  
  // Process finalTranscript immediately when available (when user stops speaking)
  useEffect(() => {
    if (!isListening || !finalTranscript || pendingVerification) return;
    
    // Check if we already processed this transcript to avoid duplicates
    if (finalTranscript === lastProcessedTranscriptRef.current) return;
    
    console.log('Final transcript received:', finalTranscript);
    
    // Process the final transcript immediately
    if (finalTranscript.trim().length > 0) {
      lastProcessedTranscriptRef.current = finalTranscript;
      // Small delay to ensure the transcript is complete
      setTimeout(() => {
        // Trigger processing by setting the transcript as the current transcript
        if (isListening && !pendingVerification) {
          console.log('Processing final transcript immediately');
        }
      }, 100);
    }
  }, [finalTranscript, isListening, pendingVerification]);

  // Reset the silence timeout whenever new transcript content is detected
  useEffect(() => {
    if (isListening && transcript) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      silenceTimeoutRef.current = window.setTimeout(() => {
        if (isListening && !pendingVerification) {
          stopListening();
        }
      }, silenceTimeoutDuration);
    }
  }, [transcript, isListening, pendingVerification, stopListening]);
  
  // Process verification responses
  useEffect(() => {
    if (!isListening || !transcript || !pendingVerification) return;
    
    // Check for verification response
    const normalizedTranscript = transcript.trim().toLowerCase();
    
    if (CONFIRMATION_PATTERN.test(normalizedTranscript)) {
      // User confirmed - execute the task
      processPendingTask();
      resetTranscript();
      return;
    }
    
    if (REJECTION_PATTERN.test(normalizedTranscript)) {
      // User rejected - cancel the task
      speak('Task cancelled.');
      setPendingVerification(false);
      pendingTaskRef.current = null;
      setConfirmedTask(false);
      resetTranscript();
      
      // Auto-stop listening after rejection
      setTimeout(stopListening, 1500);
      return;
    }
  }, [transcript, isListening, pendingVerification, processPendingTask, resetTranscript, speak, stopListening]);
  
  // Process voice commands based on recognized patterns or create a task directly from what was said
  useEffect(() => {
    if (!isListening || !transcript || pendingVerification) {
      console.log('Voice command processing skipped:', { isListening, transcript, pendingVerification });
      return;
    }
    
    console.log('Processing transcript:', transcript);
    
    // Check for stop listening command first
    if (STOP_LISTENING_PATTERN.test(transcript)) {
      stopListening();
      resetTranscript();
      return;
    }
    
    // Check for delete last item command
    if (DELETE_LAST_ITEM_PATTERN.test(transcript)) {
      const recentTasks = tasks.filter(task => !task.completed).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      if (recentTasks.length > 0) {
        const lastTask = recentTasks[0];
        deleteTask(lastTask.id);
        speak(`Deleted: "${lastTask.title}"`);
        setConfirmedTask(true);
        resetTranscript();
        resetCommandUI();
        return;
      } else {
        speak("No recent tasks to delete");
        resetTranscript();
        return;
      }
    }
    
    // First check if transcript contains "next item" - this indicates multiple tasks to parse
    const containsNextItem = /\b(next item|next task|add another|another task|next)\b/gi.test(transcript);
    
    // If transcript contains task content (longer than just commands), use AI parsing
    if (transcript.trim().length > 3) {
      const currentTranscript = transcript.trim();
      
      // Skip if we're already processing or if this is a duplicate
      if (isProcessingTaskRef.current || currentTranscript === lastProcessedTranscriptRef.current) {
        return;
      }
      
      // Clear any existing timeout
      if (taskCreationTimeoutRef.current) {
        clearTimeout(taskCreationTimeoutRef.current);
      }
      
      console.log('Processing spoken text for AI task parsing:', currentTranscript);
      console.log('Contains next item:', containsNextItem);
      
      // Set processing flag to prevent duplicates
      isProcessingTaskRef.current = true;
      
      // Process task creation with AI parsing
      taskCreationTimeoutRef.current = window.setTimeout(() => {
        // Wrap the async function to handle promises properly
        const processTasksAsync = async () => {
          try {
            console.log('Starting AI parsing for transcript:', currentTranscript);
            // Use AI to parse individual tasks from the transcript
            const parsedTasks = await parseTasksFromSpeech(currentTranscript);
            console.log('AI parsed tasks:', parsedTasks);
            
            if (parsedTasks.length > 0) {
              // Create each parsed task
              for (const taskText of parsedTasks) {
                if (taskText.trim().length > 2) {
                  const category = detectCategory(taskText);
                  const priority = detectPriority(taskText);
                  
                  const finalTask: NewTask = {
                    title: taskText.trim(),
                    category,
                    priority,
                    completed: false
                  };
                  
                  console.log('Creating parsed task:', finalTask);
                  addTask(finalTask);
                }
              }
              
              setConfirmedTask(true);
              const taskCount = parsedTasks.filter(t => t.trim().length > 2).length;
              if (taskCount === 1) {
                speak(`Added: "${parsedTasks[0]}". Say "next item" for another task or "stop" to finish.`);
              } else {
                speak(`Added ${taskCount} tasks. Say "next item" for more tasks or "stop" to finish.`);
              }
            }
            
            // Remember this transcript to prevent duplicates
            lastProcessedTranscriptRef.current = currentTranscript;
            
            // Reset transcript and processing state
            resetTranscript();
            isProcessingTaskRef.current = false;
            
            // Reset UI after a short delay but keep listening for continuous dialogue
            setTimeout(() => {
              setConfirmedTask(false);
              setErrorMessage('');
              setPendingVerification(false);
            }, 2000);
          } catch (error) {
            console.error('Error parsing tasks:', error);
            
            // Fallback: create a single task with the current transcript
            const taskName = currentTranscript;
            const category = detectCategory(taskName);
            const priority = detectPriority(taskName);
            
            const fallbackTask: NewTask = {
              title: taskName,
              category,
              priority,
              completed: false
            };
            
            // Add the task
            addTask(fallbackTask);
            setConfirmedTask(true);
            speak(`Added: "${taskName}". Say "next item" for another task or "stop" to finish.`);
            
            // Remember this transcript to prevent duplicates
            lastProcessedTranscriptRef.current = currentTranscript;
            
            // Reset transcript and processing state
            resetTranscript();
            isProcessingTaskRef.current = false;
            
            // Reset UI after a short delay but keep listening for continuous dialogue
            setTimeout(() => {
              setConfirmedTask(false);
              setErrorMessage('');
              setPendingVerification(false);
            }, 1500);
          }
        };
        
        // Call the async function and handle any unhandled promise rejections
        processTasksAsync().catch((error) => {
          console.error('Unhandled error in task processing:', error);
          isProcessingTaskRef.current = false;
        });
      }, 1200); // Wait for speech to complete before processing
      
      return;
    }
    
    // Check for complete task command
    const completeTaskMatch = transcript.match(COMPLETE_TASK_PATTERN);
    if (completeTaskMatch && completeTaskMatch[3]) {
      const taskNameFragment = extractTaskName(completeTaskMatch[3]).toLowerCase();
      
      if (taskNameFragment) {
        // Find task that matches the name fragment
        const taskToComplete = tasks.find(task => 
          !task.completed && task.title.toLowerCase().includes(taskNameFragment)
        );
        
        if (taskToComplete) {
          // Store pending task and ask for confirmation
          pendingTaskRef.current = { type: 'complete', data: taskToComplete };
          setPendingVerification(true);
          speak(`I'll mark "${taskToComplete.title}" as complete. Is that correct?`);
        } else {
          speak(`Sorry, I couldn't find an incomplete task containing "${taskNameFragment}"`);
          setTimeout(stopListening, 1500);
        }
        
        resetTranscript();
        return;
      }
    }
    
    // Check for delete task command
    const deleteTaskMatch = transcript.match(DELETE_TASK_PATTERN);
    if (deleteTaskMatch && deleteTaskMatch[3]) {
      const taskNameFragment = extractTaskName(deleteTaskMatch[3]).toLowerCase();
      
      if (taskNameFragment) {
        // Find task that matches the name fragment
        const taskToDelete = tasks.find(task => 
          task.title.toLowerCase().includes(taskNameFragment)
        );
        
        if (taskToDelete) {
          // Store pending task and ask for confirmation
          pendingTaskRef.current = { type: 'delete', data: taskToDelete };
          setPendingVerification(true);
          speak(`I'll delete the task "${taskToDelete.title}". Is that correct?`);
        } else {
          speak(`Sorry, I couldn't find a task containing "${taskNameFragment}"`);
          setTimeout(stopListening, 1500);
        }
        
        resetTranscript();
        return;
      }
    }
    
    // Check for list tasks command
    const listTasksMatch = transcript.match(LIST_TASKS_PATTERN);
    if (listTasksMatch) {
      const incompleteTasks = tasks.filter(task => !task.completed);
      
      if (incompleteTasks.length === 0) {
        speak("You don't have any incomplete tasks.");
      } else {
        speak(`You have ${incompleteTasks.length} incomplete tasks. The first few are: ${
          incompleteTasks.slice(0, 3).map(task => task.title).join(', ')
        }${incompleteTasks.length > 3 ? ', and more.' : '.'}`);
      }
      
      resetTranscript();
      // Stop listening after listing tasks
      setTimeout(stopListening, 2000);
      return;
    }
    
    // Check for set timer command
    const setTimerMatch = transcript.match(SET_TIMER_PATTERN);
    if (setTimerMatch) {
      const minutes = parseInt(setTimerMatch[1], 10);
      const taskNameFragment = setTimerMatch[3] ? extractTaskName(setTimerMatch[3]).toLowerCase() : '';
      
      if (minutes > 0) {
        if (taskNameFragment) {
          // Find task that matches the name fragment
          const targetTask = tasks.find(task => 
            task.title.toLowerCase().includes(taskNameFragment)
          );
          
          if (targetTask) {
            // Store pending task and ask for confirmation
            pendingTaskRef.current = { type: 'timer', data: { id: targetTask.id, minutes, title: targetTask.title } };
            setPendingVerification(true);
            speak(`I'll set a ${minutes} minute timer for task "${targetTask.title}". Is that correct?`);
          } else {
            speak(`Sorry, I couldn't find a task containing "${taskNameFragment}"`);
            setTimeout(stopListening, 1500);
          }
        } else {
          speak(`Timer set for ${minutes} minutes`);
          setConfirmedTask(true);
          // If no task was specified, you might want to create a generic timer or 
          // perhaps create a new task with the timer
          setTimeout(resetCommandUI, 1000);
        }
        
        resetTranscript();
        return;
      }
    }
    
    // Check for start timer command
    const startTimerMatch = transcript.match(START_TIMER_PATTERN);
    if (startTimerMatch) {
      // This logic would trigger the active task's timer in your UI
      if (activeTaskId) {
        speak("Timer started");
        setConfirmedTask(true);
        // Implement timer start logic here via state or context
        setTimeout(resetCommandUI, 1000);
      } else {
        speak("No active task with timer set. Please set a timer first.");
        setTimeout(stopListening, 1500);
      }
      
      resetTranscript();
      return;
    }
    
    // If we get here and there's significant transcript content but no command match
    if (transcript.trim().length > 10 && !interimTranscript) {
      speak("I didn't recognize that command. Try saying things like 'add task', 'complete task', or 'list tasks'.");
      resetTranscript();
      return;
    }
    
  }, [transcript, interimTranscript, isListening, resetTranscript, addTask, tasks, updateTask, deleteTask, speak, stopListening, activeTaskId, pendingVerification, resetCommandUI]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up all timeouts on unmount
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (taskCreationTimeoutRef.current) {
        clearTimeout(taskCreationTimeoutRef.current);
      }
      // Stop speech recognition on unmount
      SpeechRecognition.stopListening();
    };
  }, []);
  
  return {
    isListening,
    feedback,
    startListening,
    stopListening,
    pendingVerification,
    confirmedTask,
    errorMessage,
    browserSupportsSpeechRecognition,
    transcript
  };
}