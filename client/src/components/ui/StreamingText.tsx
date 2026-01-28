import { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void; // 0-1 progress ratio
  startDelay?: number;
  showCursor?: boolean;
  instant?: boolean; // Skip animation and show text immediately
}

export function StreamingText({ 
  text, 
  speed = 8, 
  className = '', 
  onComplete,
  onProgress,
  startDelay = 0,
  showCursor = true,
  instant = false
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState(instant ? text : '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(instant);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If instant mode, just show the text immediately
    if (instant) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Reset state when text changes
    setDisplayedText('');
    setIsStreaming(false);
    setIsComplete(false);
    indexRef.current = 0;

    if (!text) return;

    // Start streaming after delay
    const startTimeout = setTimeout(() => {
      setIsStreaming(true);
      
      // Use requestAnimationFrame for smooth 60fps updates
      // Calculate chars per frame based on speed (speed is ms per char)
      // At 60fps (16.67ms per frame), with speed=3, we show ~5-6 chars per frame
      const charsPerFrame = Math.max(1, Math.ceil(16.67 / speed));
      let rafId: number;
      
      const animate = () => {
        if (indexRef.current < text.length) {
          // Batch multiple characters per frame for smoother rendering
          indexRef.current = Math.min(indexRef.current + charsPerFrame, text.length);
          setDisplayedText(text.substring(0, indexRef.current));
          onProgress?.(indexRef.current / text.length);
          rafId = requestAnimationFrame(animate);
        } else {
          // Streaming complete
          setIsStreaming(false);
          setIsComplete(true);
          onComplete?.();
        }
      };
      
      rafId = requestAnimationFrame(animate);
      intervalRef.current = rafId as unknown as NodeJS.Timeout;
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [text, speed, startDelay, onComplete, onProgress, instant]);

  // Handle fast-forward on click
  const handleClick = () => {
    if (isStreaming && intervalRef.current) {
      cancelAnimationFrame(intervalRef.current as unknown as number);
      intervalRef.current = null;
      setDisplayedText(text);
      setIsStreaming(false);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      <span className="whitespace-pre-wrap">
        {displayedText}
      </span>
      {showCursor && isStreaming && (
        <span className="animate-pulse text-primary">|</span>
      )}
      {isStreaming && (
        <div className="text-xs text-muted-foreground mt-1 opacity-70">
          Click to skip animation
        </div>
      )}
    </div>
  );
}

// Alternative component for markdown/formatted text streaming
export function StreamingMarkdown({ 
  text, 
  speed = 6, 
  className = '', 
  onComplete,
  startDelay = 0
}: Omit<StreamingTextProps, 'showCursor'>) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsStreaming(false);
    indexRef.current = 0;

    if (!text) return;

    const startTimeout = setTimeout(() => {
      setIsStreaming(true);
      
      intervalRef.current = setInterval(() => {
        if (indexRef.current < text.length) {
          // Stream word by word for better readability with formatted text
          const words = text.split(' ');
          const currentWordIndex = Math.floor((indexRef.current / text.length) * words.length);
          const wordsToShow = words.slice(0, currentWordIndex + 1).join(' ');
          
          setDisplayedText(wordsToShow);
          indexRef.current += Math.ceil(text.length / words.length);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setDisplayedText(text);
          setIsStreaming(false);
          onComplete?.();
        }
      }, speed * 3); // Slower for word-by-word
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, startDelay, onComplete]);

  const handleClick = () => {
    if (isStreaming && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayedText(text);
      setIsStreaming(false);
      onComplete?.();
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      <div className="whitespace-pre-wrap">{displayedText}</div>
      {isStreaming && (
        <>
          <span className="animate-pulse text-primary">●</span>
          <div className="text-xs text-muted-foreground mt-1 opacity-70">
            Click to skip animation
          </div>
        </>
      )}
    </div>
  );
}