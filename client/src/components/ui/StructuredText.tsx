import React from 'react';
import { StreamingText } from './StreamingText';

interface StructuredTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  startDelay?: number;
  showCursor?: boolean;
  enableStreaming?: boolean;
}

export function StructuredText({ 
  text, 
  speed = 12, 
  className = '', 
  onComplete,
  startDelay = 0,
  showCursor = true,
  enableStreaming = true
}: StructuredTextProps) {
  
  // Parse the text into structured format
  const formatStructuredText = (content: string) => {
    if (!content) return '';
    
    // Split by lines and process each one
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.map((line, index) => {
      // Check if it's a numbered heading (starts with number followed by period)
      if (/^\d+\.\s/.test(line)) {
        const heading = line.replace(/^\d+\.\s/, '');
        const number = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={`heading-${index}`} className="mb-4 mt-6 first:mt-0">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                {number}
              </span>
              {heading}
            </h3>
          </div>
        );
      }
      
      // Check if it's a bullet point
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.replace(/^[•\-\*]\s*/, '');
        return (
          <div key={`bullet-${index}`} className="mb-2 ml-8 flex items-start gap-2">
            <span className="text-primary font-bold mt-1">•</span>
            <span className="text-foreground leading-relaxed">{bulletText}</span>
          </div>
        );
      }
      
      // Check if it's a sub-bullet (indented)
      if (line.match(/^\s+[•\-\*]/)) {
        const bulletText = line.replace(/^\s+[•\-\*]\s*/, '');
        return (
          <div key={`sub-bullet-${index}`} className="mb-1 ml-12 flex items-start gap-2">
            <span className="text-muted-foreground font-bold mt-1">◦</span>
            <span className="text-muted-foreground leading-relaxed">{bulletText}</span>
          </div>
        );
      }
      
      // Check if it's a title/heading (all caps or starts with #)
      if (line.toUpperCase() === line && line.length > 3 || line.startsWith('#')) {
        const title = line.replace(/^#+\s*/, '');
        return (
          <div key={`title-${index}`} className="mb-6 mt-8 first:mt-0">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2">
              {title}
            </h2>
          </div>
        );
      }
      
      // Regular paragraph
      if (line.length > 0) {
        return (
          <div key={`para-${index}`} className="mb-3 text-foreground leading-relaxed">
            {line}
          </div>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  // If streaming is disabled, render formatted content directly
  if (!enableStreaming) {
    return (
      <div className={`space-y-2 ${className}`}>
        {formatStructuredText(text)}
      </div>
    );
  }

  // Custom streaming for structured content
  return (
    <div className={className}>
      <StreamingText 
        text={text}
        speed={speed}
        showCursor={showCursor}
        startDelay={startDelay}
        onComplete={onComplete}
        className="space-y-2"
      />
    </div>
  );
}

// Component specifically for rendering already formatted structured content
export function FormattedStructuredText({ 
  text, 
  className = '' 
}: { 
  text: string; 
  className?: string; 
}) {
  
  const formatStructuredText = (content: string) => {
    if (!content) return [];
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.map((line, index) => {
      // Numbered heading
      if (/^\d+\.\s/.test(line)) {
        const heading = line.replace(/^\d+\.\s/, '');
        const number = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={`heading-${index}`} className="mb-4 mt-6 first:mt-0">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                {number}
              </span>
              {heading}
            </h3>
          </div>
        );
      }
      
      // Main bullet point
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.replace(/^[•\-\*]\s*/, '');
        return (
          <div key={`bullet-${index}`} className="mb-3 ml-10 flex items-start gap-3">
            <span className="text-primary font-bold mt-1 text-lg">•</span>
            <span className="text-foreground leading-relaxed">{bulletText}</span>
          </div>
        );
      }
      
      // Sub-bullet
      if (line.match(/^\s+[•\-\*]/)) {
        const bulletText = line.replace(/^\s+[•\-\*]\s*/, '');
        return (
          <div key={`sub-bullet-${index}`} className="mb-2 ml-16 flex items-start gap-2">
            <span className="text-muted-foreground font-bold mt-1">◦</span>
            <span className="text-muted-foreground leading-relaxed">{bulletText}</span>
          </div>
        );
      }
      
      // Title/heading
      if (line.toUpperCase() === line && line.length > 3 || line.startsWith('#')) {
        const title = line.replace(/^#+\s*/, '');
        return (
          <div key={`title-${index}`} className="mb-6 mt-8 first:mt-0">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2">
              {title}
            </h2>
          </div>
        );
      }
      
      // Regular paragraph
      if (line.length > 0) {
        return (
          <div key={`para-${index}`} className="mb-4 text-foreground leading-relaxed">
            {line}
          </div>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {formatStructuredText(text)}
    </div>
  );
}