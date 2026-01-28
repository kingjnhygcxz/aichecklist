import { useState, useEffect } from 'react';

interface RetroTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function RetroTypewriter({ text, speed = 50, onComplete }: RetroTypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  return (
    <div className="font-mono text-left bg-black text-green-400 p-6 rounded-lg border-2 border-green-400/20 min-h-[400px]">
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {displayText}
        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>█</span>
      </div>
    </div>
  );
}