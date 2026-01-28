import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles, RefreshCw, Mic, Trash2, Printer, X, Share2, ThumbsUp, ThumbsDown, Calendar, Maximize2, Minimize2, FileText, ArrowDownToLine, MessageSquare, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useLocation } from 'wouter';
import { DomoAIVoice } from './DomoAIVoice';
import { RobotGreenBlack1 } from '@/components/icons/RobotIcons';
import { DomoAILogo } from './DomoAILogo';
import { StreamingText } from '@/components/ui/StreamingText';
import { DocumentResponse } from '@/components/ui/DocumentResponse';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { TrialExpiredModal } from '@/components/TrialExpiredModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  tokensUsed?: number;
  calendarConflicts?: {
    conflicts: any[];
    proposals: any[];
    targetDate: string;
  };
}

interface DomoAIProps {
  isFullscreen?: boolean;
  setIsFullscreen?: (value: boolean) => void;
}

interface SavedConversation {
  id: number;
  sessionId: string;
  title: string;
  lastMessageAt: string;
  totalMessages: number;
}

export function DomoAI({ isFullscreen: propIsFullscreen, setIsFullscreen: propSetIsFullscreen }: DomoAIProps = {}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [userMemory, setUserMemory] = useState<any>(null);
  const [memoryLoaded, setMemoryLoaded] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<{[key: number]: 'up' | 'down' | null}>({});
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [sessionResponseCount, setSessionResponseCount] = useState(0);
  
  // Trial status check
  const { isActive: hasActiveSubscription, isExpired: trialExpired } = useTrialStatus();
  const FREE_RESPONSE_LIMIT = 2;
  
  // Conversation history state
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [messagesLoadedFromHistory, setMessagesLoadedFromHistory] = useState(false); // Skip animation for loaded messages
  const [streamingComplete, setStreamingComplete] = useState(false); // Track when text animation is done
  
  const isFullscreen = propIsFullscreen ?? false;
  const setIsFullscreen = propSetIsFullscreen ?? (() => {});
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Superhuman Mode UI Effects
  const triggerSuperhumanFX = (event: 'superhuman_on' | 'superhuman_off') => {
    const root = document.documentElement;
    const cls = event === 'superhuman_on' ? 'superhuman-on' : 'superhuman-off';
    root.classList.add(cls);
    window.setTimeout(() => root.classList.remove(cls), 1000);
  };

  const playSoftClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = 'sine';
      o.frequency.value = 880;

      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      o.stop(ctx.currentTime + 0.08);

      o.onended = () => ctx.close();
    } catch (e) {
      console.log('Audio click skipped:', e);
    }
  };

  const speakSuperhuman = (event: 'superhuman_on' | 'superhuman_off') => {
    if (!('speechSynthesis' in window)) return;

    const utter = new SpeechSynthesisUtterance(
      event === 'superhuman_on' ? 'Superhuman mode engaged.' : 'Superhuman mode disengaged.'
    );

    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Auto-focus input when AIDOMO tab is opened
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const focusTimer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(focusTimer);
  }, []);

  // Smart scrolling to show new messages at the top, not bottom
  const scrollToShowNewMessage = () => {
    if (chatContainerRef.current && messagesEndRef.current) {
      const container = chatContainerRef.current;
      const lastMessage = container.lastElementChild?.previousElementSibling as HTMLElement;
      
      if (lastMessage) {
        // Scroll to show the top of the new message, not the bottom
        const messageTop = lastMessage.offsetTop - container.offsetTop;
        const containerHeight = container.clientHeight;
        const scrollPosition = Math.max(0, messageTop - 20); // 20px padding from top
        
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Load user memory for personalized AI responses
  const loadUserMemory = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      const response = await fetch('/api/user/memory', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const memory = await response.json();
        setUserMemory(memory);
        setMemoryLoaded(true);
      }
    } catch (error) {
      console.error('Error loading user memory:', error);
      setMemoryLoaded(true); // Mark as loaded even on error
    }
  };

  // Save conversation context to user memory
  const saveConversationToMemory = async (userMessage: string, aiResponse: string) => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      // Extract topic and key points from the conversation
      const topic = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage;
      const keyPoints = [userMessage.substring(0, 100), aiResponse.substring(0, 100)];

      await fetch('/api/user/memory/conversation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          topic,
          summary: `User asked: ${userMessage}. AIDOMO responded about: ${aiResponse.substring(0, 100)}`,
          keyPoints,
          userMood: 'neutral', // Could be enhanced with sentiment analysis
          taskContext: 'general_chat'
        })
      });
    } catch (error) {
      console.error('Error saving conversation to memory:', error);
    }
  };

  // Update user's preferred name in memory
  const updatePreferredName = async (name: string) => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      await fetch('/api/user/memory/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ preferredName: name })
      });

      // Update local memory state
      setUserMemory(prev => ({ ...prev, preferredName: name }));
      
      toast({
        title: "Name Remembered! 🧠",
        description: `I'll remember to call you ${name} from now on.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating preferred name:', error);
    }
  };

  // Load all user conversations
  const loadConversations = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      const response = await fetch('/api/aidomo/conversations', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Save conversation with explicit messages parameter to avoid stale closure issues
  const saveConversationWithMessages = async (messagesToSave: Message[], conversationId: string | null) => {
    if (messagesToSave.length === 0) return;

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      // Generate title from first user message
      const firstUserMessage = messagesToSave.find(m => m.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';

      // Prepare messages with preserved timestamps
      const preparedMessages = messagesToSave.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
        tokensUsed: m.tokensUsed || 0
      }));

      // If we have a current conversation ID, update it
      if (conversationId) {
        await fetch(`/api/aidomo/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({
            messages: preparedMessages
          })
        });
      } else {
        // Create new conversation
        const response = await fetch('/api/aidomo/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({
            title,
            messages: preparedMessages
          })
        });

        if (response.ok) {
          const newConversation = await response.json();
          setCurrentConversationId(newConversation.sessionId);
        }
      }

      // Refresh conversations list
      await loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Save current conversation (uses state - for manual saves)
  const saveCurrentConversation = async () => {
    await saveConversationWithMessages(messages, currentConversationId);
  };

  // Load a specific conversation
  const loadConversation = async (sessionId: string) => {
    try {
      const authSessionId = localStorage.getItem('sessionId');
      if (!authSessionId) return;

      const response = await fetch(`/api/aidomo/conversations/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${authSessionId}`
        }
      });

      if (response.ok) {
        const conversation = await response.json();
        
        // Parse messages - handle both string (from DB) and array formats
        let loadedMessages: Message[] = [];
        if (conversation.messages) {
          if (typeof conversation.messages === 'string') {
            try {
              loadedMessages = JSON.parse(conversation.messages);
            } catch (e) {
              console.error('Failed to parse conversation messages:', e);
              loadedMessages = [];
            }
          } else if (Array.isArray(conversation.messages)) {
            loadedMessages = conversation.messages;
          }
        }
        
        // Ensure messages have proper structure
        loadedMessages = loadedMessages.filter((msg: any) => 
          msg && typeof msg === 'object' && msg.role && msg.content
        ).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          tokensUsed: msg.tokensUsed
        }));
        
        // If conversation has messages, load them instantly (skip animation)
        if (loadedMessages.length > 0) {
          setMessagesLoadedFromHistory(true); // Skip animation for loaded messages
          setMessages(loadedMessages);
          setCurrentConversationId(sessionId);
          setShowConversations(false);
          
          toast({
            title: "Conversation Loaded",
            description: `${loadedMessages.length} messages restored`,
            variant: "default",
          });
        } else {
          // Conversation exists but has no saved messages - create a context message
          const contextMessage: Message = {
            role: 'assistant',
            content: `This is a continuation of your conversation about "${conversation.title}". The previous messages weren't saved, but I'm ready to continue helping you. What would you like to discuss?`,
            timestamp: new Date().toISOString()
          };
          setMessagesLoadedFromHistory(true); // Skip animation for context message
          setMessages([contextMessage]);
          setCurrentConversationId(sessionId);
          setShowConversations(false);
          
          toast({
            title: "Conversation Restored",
            description: `Continuing: ${conversation.title}`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Load Failed",
        description: "Unable to load conversation",
        variant: "destructive",
      });
    }
  };

  // Start a new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowConversations(false);
    
    toast({
      title: "New Conversation Started",
      description: "Ready for your questions!",
      variant: "default",
    });
  };

  // Delete a conversation
  const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering loadConversation
    
    try {
      const authSessionId = localStorage.getItem('sessionId');
      if (!authSessionId) return;

      const response = await fetch(`/api/aidomo/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authSessionId}`
        }
      });

      if (response.ok) {
        // If we just deleted the current conversation, clear messages
        if (currentConversationId === sessionId) {
          setMessages([]);
          setCurrentConversationId(null);
        }
        
        // Refresh conversations list
        await loadConversations();
        
        toast({
          title: "Conversation Deleted",
          description: "The conversation has been removed",
          variant: "default",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Unable to delete conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete conversation",
        variant: "destructive",
      });
    }
  };

  // Load memory and conversations when component mounts
  useEffect(() => {
    loadUserMemory();
    loadConversations();
  }, []);

  // Auto-focus input when component mounts (only once, not on every render)
  useEffect(() => {
    if (inputRef.current && messages.length === 0) {
      // Small delay to ensure component is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-focus input after AI response is received
  useEffect(() => {
    if (!isLoading && messages.length > 0 && inputRef.current) {
      // Focus the input after AI response is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoading, messages.length]);

  // Scroll to input area AFTER AI finishes responding (not during)
  // Respects user scroll - if user scrolled up, don't force scroll
  const userScrolledUpRef = useRef(false);
  
  // Track when user scrolls up during AI response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (messages.length > 0 && lastMessage?.role === 'assistant' && !messagesLoadedFromHistory) {
      // Reset scroll tracking when new AI message starts
      userScrolledUpRef.current = false;
      
      // Detect user scrolling up - let them take over
      const handleUserScroll = (e: WheelEvent) => {
        if (e.deltaY < 0) {
          userScrolledUpRef.current = true;
        }
      };
      
      const handleTouchStart = () => {
        userScrolledUpRef.current = true;
      };
      
      window.addEventListener('wheel', handleUserScroll, { passive: true });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      
      return () => {
        window.removeEventListener('wheel', handleUserScroll);
        window.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [messages, messagesLoadedFromHistory]);
  
  // Reset streaming complete flag (removed scrollIntoView to prevent unwanted page scrolling)
  useEffect(() => {
    if (streamingComplete) {
      setStreamingComplete(false); // Reset for next message
    }
  }, [streamingComplete]);
  
  // Handle streaming complete callback from StreamingText/DocumentResponse
  const handleStreamingComplete = useCallback(() => {
    if (!messagesLoadedFromHistory) {
      setStreamingComplete(true);
    }
  }, [messagesLoadedFromHistory]);

  // Handle ESC key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    // Add event listener when in fullscreen mode
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, setIsFullscreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check if trial expired and response limit reached
    if (trialExpired && !hasActiveSubscription && sessionResponseCount >= FREE_RESPONSE_LIMIT) {
      setShowTrialExpiredModal(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsTyping(false); // Reset typing state
    setMessagesLoadedFromHistory(false); // Enable animation for new messages
    
    // Create the new message with timestamp
    const newUserMessage: Message = { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Track conversation ID locally to avoid stale closure issues with React state
    let conversationIdForSave = currentConversationId;

    // Auto-save conversation immediately when user submits their query
    // This ensures the search appears in Conversations right away
    try {
      const authSessionId = localStorage.getItem('sessionId');
      if (authSessionId) {
        const title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
        const messagesToSave = [...messages, newUserMessage].map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
          tokensUsed: m.tokensUsed || 0
        }));

        if (conversationIdForSave) {
          // Update existing conversation
          await fetch(`/api/aidomo/conversations/${conversationIdForSave}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSessionId}`
            },
            body: JSON.stringify({ messages: messagesToSave })
          });
        } else {
          // Create new conversation immediately
          const response = await fetch('/api/aidomo/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSessionId}`
            },
            body: JSON.stringify({ title, messages: messagesToSave })
          });

          if (response.ok) {
            const newConversation = await response.json();
            // Update both state AND local variable for the AI response save
            conversationIdForSave = newConversation.sessionId;
            setCurrentConversationId(newConversation.sessionId);
          }
        }
        // Refresh conversations list so it shows immediately
        loadConversations();
      }
    } catch (saveError) {
      console.error('Error auto-saving conversation:', saveError);
    }

    try {
      // Get the session ID from localStorage for authentication
      const sessionId = localStorage.getItem('sessionId');
      
      // Get browser's local timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const response = await fetch('/api/domoai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionId ? `Bearer ${sessionId}` : ''
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          userMemory: memoryLoaded ? userMemory : null,
          timezone: userTimezone
        })
      });

      if (!response.ok) {
        // Check for trial expired / upgrade required response
        if (response.status === 402) {
          const errorData = await response.json();
          if (errorData.trialExpired || errorData.upgradeRequired) {
            setShowTrialExpiredModal(true);
            setIsLoading(false);
            // Remove the pending user message since we're blocking the request
            setMessages(prev => prev.slice(0, -1));
            return;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle Superhuman Mode UI events
      if (data.uiEvent === 'superhuman_on' || data.uiEvent === 'superhuman_off') {
        triggerSuperhumanFX(data.uiEvent);
        playSoftClick();
        speakSuperhuman(data.uiEvent);
      }
      
      // Create the AI response message
      const aiResponseMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString(),
        tokensUsed: data.tokensUsed || 0,
        calendarConflicts: data.calendarConflicts
      };
      
      // Build complete messages array including the new AI response
      const updatedMessages = [...messages, newUserMessage, aiResponseMessage];
      
      setMessages(prev => [...prev, aiResponseMessage]);
      
      // Increment response count for trial limit tracking
      if (trialExpired && !hasActiveSubscription) {
        setSessionResponseCount(prev => prev + 1);
      }
      
      // Save conversation with both user message AND AI response immediately
      // Uses conversationIdForSave (local variable) to avoid stale React state closure
      saveConversationWithMessages(updatedMessages, conversationIdForSave);
      
      // Save conversation to memory for future context
      if (memoryLoaded) {
        saveConversationToMemory(userMessage, data.response);
      }
      
      // Scroll to show AIDOMO's response at the top
      setTimeout(scrollToShowNewMessage, 100);

      // Show success toast if a task was created and refresh the task list
      if (data.taskCreated) {
        // Invalidate the tasks query to refresh the task list immediately
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        // Create a more informative toast message for calendar events
        const isCalendarEvent = data.task.scheduledDate;
        const scheduleInfo = isCalendarEvent 
          ? ` scheduled for ${new Date(data.task.scheduledDate).toLocaleDateString()}`
          : '';
        
        toast({
          title: isCalendarEvent ? "Calendar Event Created! 📅" : "Task Created! 🎉",
          description: `"${data.task.title}" has been added to your ${data.task.category} tasks${scheduleInfo}.`,
          variant: "default",
          action: isCalendarEvent ? (
            <ToastAction 
              altText="View Calendar" 
              onClick={() => setLocation('/calendar')}
              data-testid="toast-view-calendar"
            >
              View Calendar
            </ToastAction>
          ) : undefined,
        });
      }
      
      // Show success toast if a checklist was created and refresh the task list
      if (data.checklistCreated) {
        // Invalidate the tasks query to refresh the task list immediately
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        const itemCount = data.checklist.checklistItems.length;
        toast({
          title: "Checklist Created! ✅",
          description: `"${data.checklist.title}" checklist with ${itemCount} items has been added to your ${data.checklist.category} tasks. Check your Checklist tab!`,
          variant: "default",
        });
      }
      
      // Handle print requests
      if (data.printGenerated) {
        // Direct print using temporary DOM element - no new window
        const sanitizedPrintContent = DOMPurify.sanitize(data.printContent);
        const sanitizedPrintTitle = DOMPurify.sanitize(data.printTitle || 'AICHECKLIST.IO Print', {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: []
        });
        const printHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${sanitizedPrintTitle}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                @media print {
                  body { margin: 10mm; }
                  * { 
                    -webkit-print-color-adjust: exact !important; 
                    color-adjust: exact !important; 
                  }
                }
              </style>
            </head>
            <body>
              ${sanitizedPrintContent}
            </body>
          </html>
        `;
        
        // Create iframe for printing without opening new window
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        iframe.contentDocument?.open();
        iframe.contentDocument?.write(printHtml);
        iframe.contentDocument?.close();
        
        // Wait for content to load then print
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 250);
        
        toast({
          title: "Print Dialog Opening! 🖨️",
          description: `"${data.printTitle}" is ready for printing.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm experiencing a temporary system optimization. Please allow me another moment to process your request." 
      }]);
      
      // Scroll to show AIDOMO's error response at the top
      setTimeout(scrollToShowNewMessage, 100);
      
      toast({
        title: "Connection Issue",
        description: "I'm having trouble connecting. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Refocus input so user can keep typing without clicking
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const loadQuickResponse = async (endpoint: string, setAsInput = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': sessionId ? `Bearer ${sessionId}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (setAsInput) {
        setInput(data.analysis || data.tips || '');
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.analysis || data.tips || 'Here you go!' 
        }]);
        
        // Scroll to show AIDOMO's response at the top
        setTimeout(scrollToShowNewMessage, 100);
      }
    } catch (error) {
      console.error('Quick response error:', error);
      toast({
        title: "Error",
        description: "Couldn't load that information. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRescheduling = async (changes: any[]) => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch('/api/calendar/apply-rescheduling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionId ? `Bearer ${sessionId}` : ''
        },
        body: JSON.stringify({ changes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply rescheduling');
      }
      
      const data = await response.json();
      
      toast({
        title: "Schedule Updated! 📅",
        description: data.message || `Successfully rescheduled ${changes.length} event(s).`,
        variant: "default"
      });
      
      // Refresh tasks to show updated schedule
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error applying rescheduling:', error);
      toast({
        title: "Rescheduling Failed",
        description: "Unable to apply the suggested schedule. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    setShowVoice(false);
    // Automatically submit the voice input
    if (transcript.trim()) {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  // Handle keyboard shortcuts for textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 128); // max-h-32 = 128px
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Auto-resize when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const clearMessages = () => {
    // Check if user is near the bottom of the chat before clearing
    const container = chatContainerRef.current;
    const wasAtBottom = container 
      ? (container.scrollHeight - container.scrollTop - container.clientHeight) < 100
      : false;
    
    setMessages([]);
    
    // Scroll to top if user was at the bottom (for long conversations)
    if (wasAtBottom && container) {
      setTimeout(() => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
    
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
      variant: "default",
    });
  };

  // Handle message feedback
  const handleMessageFeedback = (messageIndex: number, feedback: 'up' | 'down') => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageIndex]: prev[messageIndex] === feedback ? null : feedback
    }));
    
    toast({
      title: feedback === 'up' ? "👍 Thanks for the feedback!" : "👎 Thanks for the feedback!",
      description: "Your feedback helps improve AI responses.",
      variant: "default"
    });
  };

  // Handle message sharing - shares only the message snapshot, not the app URL
  const handleMessageShare = async (messageContent: string, messageIndex: number) => {
    try {
      // Create a formatted snapshot of just this message
      const timestamp = new Date().toLocaleString();
      const snapshot = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIDOMO Response
AICHECKLIST.IO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${messageContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shared on ${timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      if (navigator.share) {
        // Share just the text snapshot, no URL
        await navigator.share({
          title: 'AIDOMO Response',
          text: snapshot
        });
      } else {
        // Copy the formatted snapshot to clipboard
        await navigator.clipboard.writeText(snapshot);
        toast({
          title: "📋 Copied to Clipboard!",
          description: "Message snapshot copied - ready to paste and share.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      // If share was cancelled by user, don't show error
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "❌ Share Failed",
          description: "Unable to share this message.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle individual message printing - goes straight to print dialog
  const handleMessagePrint = (messageContent: string, messageIndex: number) => {
    const sanitizedContent = DOMPurify.sanitize(messageContent, {
      ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea']
    });
    
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AIDOMO Response ${messageIndex + 1}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; }
            @media print {
              body { margin: 0; }
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">AIDOMO Response ${messageIndex + 1}</h1>
              <p style="color: #666; margin: 0;">AICHECKLIST.IO - Your AI-Powered Digital Majordomo</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
                Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </div>
            <div style="padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              ${sanitizedContent}
            </div>
          </div>
        </body>
      </html>
    `;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(printHtml);
    iframe.contentDocument?.close();
    
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  const printChat = () => {
    if (messages.length === 0) {
      toast({
        title: "Nothing to Print",
        description: "Start a conversation first!",
        variant: "default",
      });
      return;
    }

    // Create conversation HTML for printing with iframe - no new window
    const conversationHtml = `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">AIDOMO Chat Conversation</h1>
          <p style="color: #666; margin: 0;">AICHECKLIST.IO - Your AI-Powered Digital Majordomo</p>
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
            Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div style="space-y: 20px;">
          ${messages.map((message, index) => {
            const sanitizedContent = DOMPurify.sanitize(message.content, {
              ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
              ALLOWED_ATTR: [],
              FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style', 'class'],
              FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea']
            });
            return `
            <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; ${
              message.role === 'user' 
                ? 'background-color: #2563eb; color: white; margin-left: 20%;' 
                : 'background-color: #f3f4f6; color: #333; margin-right: 20%;'
            }">
              <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; opacity: 0.8;">
                ${message.role === 'user' ? 'You' : 'AIDOMO'}
              </div>
              <div style="white-space: pre-wrap;">${sanitizedContent}</div>
              <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
                Message ${index + 1} of ${messages.length}
              </div>
            </div>
          `;
          }).join('')}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p>Generated by AIDOMO - Your AI-Powered Digital Majordomo</p>
          <p>AICHECKLIST.IO - Intelligent Task Management Platform</p>
        </div>
      </div>
    `;

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AIDOMO Chat Conversation</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important; 
              }
            }
          </style>
        </head>
        <body>
          ${conversationHtml}
        </body>
      </html>
    `;

    // Create iframe for printing without opening new window
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(printHtml);
    iframe.contentDocument?.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
    
    toast({
      title: "Print Dialog Opening! 🖨️",
      description: "Your AIDOMO conversation is ready for printing!",
      variant: "default",
    });
  };

  // Download conversation as Word document
  const downloadWord = async () => {
    if (messages.length === 0) {
      toast({
        title: "Nothing to Download",
        description: "Start a conversation first!",
        variant: "default",
      });
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch('/api/domoai/export-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionId ? `Bearer ${sessionId}` : ''
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          title: 'AIDOMO Chat Export'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate Word document');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      a.download = `AIDOMO_Chat_${timestamp}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started! 📥",
        description: "Your AIDOMO conversation is being downloaded as a Word document.",
        variant: "default",
      });
    } catch (error) {
      console.error('Word download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download Word document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add swipe gesture support
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      // Check if it's a horizontal swipe to the right
      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 100 && messages.length > 0) {
        clearMessages();
      }

      startX = 0;
      startY = 0;
    };

    chatContainer.addEventListener('touchstart', handleTouchStart);
    chatContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      chatContainer.removeEventListener('touchstart', handleTouchStart);
      chatContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [messages.length]);

  // State for dynamic logo behavior
  const [isTyping, setIsTyping] = useState(false);

  // Handle input focus and typing state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    setIsTyping(true);
  };

  const handleInputBlur = () => {
    if (!input.trim()) {
      setIsTyping(false);
    }
  };

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-background overflow-y-auto"
    : "h-full relative";

  const contentWrapperClasses = isFullscreen
    ? "min-h-screen flex flex-col items-center bg-background pt-2 pb-8"
    : "h-full flex flex-col items-center bg-background pt-2";

  return (
    <div className={containerClasses}>
      {/* Conversation History Sidebar */}
      {showConversations && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowConversations(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConversations(false)}
                data-testid="button-close-conversations"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <Button
                onClick={startNewConversation}
                className="w-full mb-4"
                data-testid="button-new-conversation"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
              
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved conversations yet. Start chatting to create your first one!
                  </p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.sessionId}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted ${
                        currentConversationId === conv.sessionId ? 'bg-muted border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => loadConversation(conv.sessionId)}
                          className="flex-1 min-w-0 text-left"
                          data-testid={`button-load-conversation-${conv.sessionId}`}
                        >
                          <p className="font-medium text-sm truncate">{conv.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{conv.totalMessages} messages</span>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => deleteConversation(conv.sessionId, e)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Delete conversation"
                            data-testid={`button-delete-conversation-${conv.sessionId}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={contentWrapperClasses}>
        {/* Logo Section - Smaller when messages exist */}
        <div className={`transition-all duration-500 ease-in-out ${messages.length > 0 ? 'mb-2' : 'mb-4'}`}>
          <div className="flex flex-col items-center animate-in fade-in duration-700">
            <DomoAILogo size={messages.length > 0 ? 60 : 100} />
            {messages.length === 0 && (
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">intelligent simplified and productive</p>
              </div>
            )}
          </div>
        </div>

      {/* Main Heading - Hide when messages exist */}
      {messages.length === 0 && (
        <div className={`text-center mb-4 transition-all duration-500 ${isTyping ? 'mb-2' : ''}`}>
          <h1 className="text-lg md:text-xl font-normal text-foreground mb-1">
            Let's make your wish a reality
          </h1>
        </div>
      )}

      {/* Input at top when no messages */}
      {messages.length === 0 && (
        <div className="w-full max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-background border border-white rounded-full h-14 px-5 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
              <div className="flex items-center text-muted-foreground mr-3">
                <span className="text-lg">+</span>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      handleSubmit(e as any);
                    }
                  }
                }}
                placeholder="Ask anything"
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground domoai-input"
              />
              
              <div className="flex items-center gap-2 ml-3">
                {/* Conversations button - only show when input is empty and conversations exist */}
                {input.trim().length === 0 && conversations.length > 0 && (
                  <Button 
                    type="button" 
                    onClick={() => setShowConversations(true)}
                    disabled={isLoading}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted"
                    title="View past conversations"
                    data-testid="button-conversations-inline"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  type="button" 
                  onClick={() => setShowVoice(true)}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button 
                  type="button" 
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>
                </Button>
              </div>
            </div>
          </form>
          
          {/* Recent conversations preview - show below search bar when input is empty */}
          {input.trim().length === 0 && conversations.length > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Conversations
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversations(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  data-testid="button-view-all-conversations"
                >
                  View All
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conversations.slice(0, 4).map((conv) => (
                  <button
                    key={conv.sessionId}
                    onClick={() => loadConversation(conv.sessionId)}
                    className="text-left p-3 rounded-lg border bg-background/50 hover:bg-muted transition-colors group"
                    data-testid={`button-recent-conversation-${conv.sessionId}`}
                  >
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{conv.totalMessages} msgs</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages - Free flowing conversation */}
      {messages.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mt-4 px-4">
          <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'text-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {/* Show calendar conflicts if present */}
                    {message.role === 'assistant' && message.calendarConflicts && (
                      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold mb-2 flex items-center text-yellow-800 dark:text-yellow-200">
                          <Calendar className="w-5 h-5 mr-2" />
                          Calendar Conflicts Detected
                        </h4>
                        <div className="space-y-3">
                          {message.calendarConflicts.conflicts.map((conflict: any, conflictIndex: number) => (
                            <div key={conflictIndex} className="p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700">
                              <p className="text-sm font-medium mb-1">Conflict {conflictIndex + 1}:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{conflict.task1.title}</span> overlaps with{' '}
                                <span className="font-medium">{conflict.task2.title}</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Type: {conflict.type}
                              </p>
                            </div>
                          ))}
                          
                          {message.calendarConflicts.proposals.length > 0 && (
                            <div className="mt-3">
                              <h5 className="font-medium text-sm mb-2">Suggested Rescheduling Options:</h5>
                              {message.calendarConflicts.proposals.map((proposal: any, proposalIndex: number) => (
                                <div key={proposalIndex} className="p-2 bg-green-50 dark:bg-green-900/20 rounded mb-2 border border-green-200 dark:border-green-800">
                                  <p className="text-sm font-medium mb-1">Option {proposalIndex + 1} (Score: {proposal.score.toFixed(2)}):</p>
                                  <ul className="text-xs space-y-1">
                                    {proposal.changes.map((change: any, changeIndex: number) => (
                                      <li key={changeIndex} className="text-gray-600 dark:text-gray-400">
                                        • Move "{change.taskTitle}" from {new Date(change.originalStart).toLocaleTimeString()} to {new Date(change.newStart).toLocaleTimeString()}
                                      </li>
                                    ))}
                                  </ul>
                                  <button
                                    onClick={() => handleApplyRescheduling(proposal.changes)}
                                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                  >
                                    Apply This Schedule
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      {message.role === 'assistant' && message.content.length > 200 ? (
                        <DocumentResponse
                          response={message.content}
                          title={`AIDOMO Response ${index + 1}`}
                          author="AIDOMO AI Assistant"
                          streaming={!messagesLoadedFromHistory && index === messages.length - 1}
                          speed={3}
                          showHeader={false}
                          className="bg-transparent border-0 p-0"
                          onComplete={index === messages.length - 1 ? handleStreamingComplete : undefined}
                        />
                      ) : message.role === 'assistant' ? (
                        <StreamingText 
                          text={message.content}
                          speed={3}
                          showCursor={!messagesLoadedFromHistory && index === messages.length - 1}
                          startDelay={0}
                          instant={messagesLoadedFromHistory || index !== messages.length - 1}
                          onComplete={index === messages.length - 1 ? handleStreamingComplete : undefined}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {/* AIDOMO Capabilities List - shown when user asks what AIDOMO can do */}
                    {message.role === 'assistant' && index > 0 && 
                      messages[index - 1].role === 'user' && 
                      /what.*can.*do|capabilities|help.*with|what.*are.*you|who.*are.*you/i.test(messages[index - 1].content) && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          I can help you with:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Client Onboarding, Client Scheduling Portal</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Create and manage tasks with priorities</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Generate detailed reports and summaries</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Research notes and documentation</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Recommend productivity templates</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Schedule calendar events</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Analyze your task patterns</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Create custom checklists</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Provide productivity insights</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Help with ADHD-friendly workflows</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Organize your goals and priorities</span>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground italic">
                          Just ask me anything - I'm here to help make your productivity soar! ✨
                        </p>
                      </div>
                    )}
                    
                    {/* Action buttons for AI responses */}
                    {message.role === 'assistant' && (
                      <div className="mt-2 flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-background/80"
                          onClick={() => handleMessagePrint(message.content, index)}
                          title="Print this response"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-background/80"
                          onClick={() => handleMessageShare(message.content, index)}
                          title="Share this response"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 hover:bg-background/80 ${
                            messageFeedback[index] === 'up' ? 'text-green-600' : ''
                          }`}
                          onClick={() => handleMessageFeedback(index, 'up')}
                          title="This response was helpful"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 hover:bg-background/80 ${
                            messageFeedback[index] === 'down' ? 'text-red-600' : ''
                          }`}
                          onClick={() => handleMessageFeedback(index, 'down')}
                          title="This response was not helpful"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
          </div>
          
          {/* Floating action buttons */}
          <div className="flex justify-center gap-2 mt-6 mb-4">
            <Button 
              type="button" 
              onClick={() => setShowConversations(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              title="View Conversation History"
              data-testid="button-show-conversations"
            >
              <MessageSquare className="h-3 w-3" />
              Conversations
            </Button>
            <Button 
              type="button" 
              onClick={printChat}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-print-chat"
            >
              <Printer className="h-3 w-3" />
              Print Chat
            </Button>
            <Button 
              type="button" 
              onClick={downloadWord}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 group"
              data-testid="button-download-word"
            >
              <div className="relative">
                <FileText className="h-4 w-4 text-blue-600" />
                <ArrowDownToLine className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-green-600 group-hover:animate-bounce" />
              </div>
              <span>Export .docx</span>
            </Button>
            <Button 
              type="button" 
              onClick={clearMessages}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-clear-chat"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>

          {/* Input at bottom when messages exist */}
          <div className="mt-4">
            <div className="w-full max-w-2xl mx-auto px-4">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center bg-background border border-white rounded-full h-14 px-5 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
                  <div className="flex items-center text-muted-foreground mr-3">
                    <span className="text-lg">+</span>
                  </div>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !isLoading) {
                          handleSubmit(e as any);
                        }
                      }
                    }}
                    placeholder="Ask anything"
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground domoai-input"
                  />
                  
                  <div className="flex items-center gap-2 ml-3">
                    <Button 
                      type="button" 
                      onClick={() => setShowConversations(true)}
                      disabled={isLoading}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                      title="View Conversation History"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      type="button" 
                      onClick={() => setShowVoice(true)}
                      disabled={isLoading}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      type="button" 
                      disabled={isLoading}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                      </div>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Voice input dialog */}
      {showVoice && (
        <DomoAIVoice
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          onTranscript={handleVoiceTranscript}
        />
      )}
      
      {/* Trial Expired Modal */}
      <TrialExpiredModal
        isOpen={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
        feature="unlimited AIDOMO responses"
      />
      </div>
    </div>
  );
}