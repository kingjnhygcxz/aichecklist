import { useState, useEffect } from 'react';
import { StreamingText } from './StreamingText';
import { Card } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { FileText, Clock, User, Bot } from 'lucide-react';

interface DocumentResponseProps {
  response: string;
  title?: string;
  timestamp?: Date;
  author?: string;
  className?: string;
  showHeader?: boolean;
  streaming?: boolean;
  speed?: number;
  onComplete?: () => void;
}

export function DocumentResponse({
  response,
  title = "AIDOMO Analysis Report",
  timestamp = new Date(),
  author = "AIDOMO AI Assistant",
  className = "",
  showHeader = true,
  streaming = true,
  speed = 12,
  onComplete
}: DocumentResponseProps) {
  const [sections, setSections] = useState<Array<{ title: string; content: string; type: 'header' | 'paragraph' | 'list' | 'quote' }>>([]);

  useEffect(() => {
    // Parse the response into structured sections
    const parseResponse = (text: string) => {
      const lines = text.split('\n').filter(line => line.trim());
      const parsedSections: Array<{ title: string; content: string; type: 'header' | 'paragraph' | 'list' | 'quote' }> = [];
      
      let currentSection: { title: string; content: string; type: 'header' | 'paragraph' | 'list' | 'quote' } = { title: '', content: '', type: 'paragraph' };
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check for headers (lines starting with # or all caps)
        if (trimmed.startsWith('#') || (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /^[A-Z\s:]+$/.test(trimmed))) {
          // Save previous section if it has content
          if (currentSection.content.trim()) {
            parsedSections.push({ ...currentSection });
          }
          
          // Start new header section
          currentSection = {
            title: trimmed.replace(/^#+\s*/, '').replace(/^[*\-]\s*/, ''),
            content: '',
            type: 'header'
          };
        }
        // Check for list items
        else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
          if (currentSection.type !== 'list') {
            // Save previous section
            if (currentSection.content.trim()) {
              parsedSections.push({ ...currentSection });
            }
            currentSection = { title: 'Key Points', content: trimmed, type: 'list' };
          } else {
            currentSection.content += '\n' + trimmed;
          }
        }
        // Check for quotes or important statements
        else if (trimmed.startsWith('>') || trimmed.includes('**') || trimmed.includes('*')) {
          if (currentSection.type !== 'quote') {
            if (currentSection.content.trim()) {
              parsedSections.push({ ...currentSection });
            }
            currentSection = { title: 'Important Note', content: trimmed, type: 'quote' };
          } else {
            currentSection.content += '\n' + trimmed;
          }
        }
        // Regular paragraph content
        else {
          if (currentSection.type === 'header' && !currentSection.content) {
            // First content after header
            currentSection.content = trimmed;
            currentSection.type = 'paragraph';
          } else if (currentSection.type === 'paragraph' || currentSection.type === 'header') {
            currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
          } else {
            // Different type, save current and start new paragraph
            if (currentSection.content.trim()) {
              parsedSections.push({ ...currentSection });
            }
            currentSection = { title: '', content: trimmed, type: 'paragraph' };
          }
        }
      }
      
      // Add the last section
      if (currentSection.content.trim()) {
        parsedSections.push(currentSection);
      }
      
      // If no structured content found, treat as single paragraph
      if (parsedSections.length === 0) {
        parsedSections.push({ title: '', content: text, type: 'paragraph' });
      }
      
      return parsedSections;
    };

    setSections(parseResponse(response));
  }, [response]);

  // Call onComplete after animation finishes
  useEffect(() => {
    if (streaming && onComplete && sections.length > 0) {
      // Calculate total animation time based on content length
      const totalChars = sections.reduce((sum, s) => sum + (s.title?.length || 0) + (s.content?.length || 0), 0);
      const charsPerFrame = Math.max(1, Math.ceil(16.67 / speed));
      const totalFrames = Math.ceil(totalChars / charsPerFrame);
      const animationTime = totalFrames * 16.67; // ms
      const lastSectionDelay = (sections.length - 1) * 200; // delay per section
      const totalTime = animationTime + lastSectionDelay + 500; // extra buffer
      
      const timer = setTimeout(() => {
        onComplete();
      }, totalTime);
      
      return () => clearTimeout(timer);
    }
  }, [streaming, onComplete, sections, speed]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSection = (section: typeof sections[0], index: number) => {
    const delay = streaming ? index * 200 : 0;
    
    switch (section.type) {
      case 'header':
        return (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {streaming ? (
                <StreamingText text={section.title} speed={speed} startDelay={delay} showCursor={false} />
              ) : (
                section.title
              )}
            </h3>
            {section.content && (
              <div className="text-base text-muted-foreground leading-relaxed">
                {streaming ? (
                  <StreamingText text={section.content} speed={speed} startDelay={delay + 500} showCursor={false} />
                ) : (
                  section.content
                )}
              </div>
            )}
          </div>
        );
        
      case 'list':
        return (
          <div key={index} className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">{section.title}</h4>
              <div className="text-base text-blue-700 dark:text-blue-300">
                {streaming ? (
                  <StreamingText text={section.content} speed={speed} startDelay={delay} showCursor={false} />
                ) : (
                  <div className="whitespace-pre-line">{section.content}</div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'quote':
        return (
          <div key={index} className="mb-6">
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border-l-4 border-amber-500">
              <h4 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">{section.title}</h4>
              <div className="text-base text-amber-700 dark:text-amber-300 italic">
                {streaming ? (
                  <StreamingText text={section.content} speed={speed} startDelay={delay} showCursor={false} />
                ) : (
                  <div className="whitespace-pre-line">{section.content}</div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div key={index} className="mb-4">
            <div className="text-base text-foreground leading-relaxed">
              {streaming ? (
                <StreamingText text={section.content} speed={speed} startDelay={delay} showCursor={false} />
              ) : (
                <div className="whitespace-pre-line">{section.content}</div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={`p-8 w-full ${className}`}>
      {showHeader && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {title}
              </h2>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(timestamp)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Generated by {author}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Structured Report
              </div>
            </div>
            
            <Separator className="mb-6" />
          </div>
        </>
      )}
      
      <div className="space-y-6 w-full">
        {sections.map((section, index) => renderSection(section, index))}
      </div>
      
      {showHeader && (
        <>
          <Separator className="mt-6 mb-4" />
          <div className="text-xs text-muted-foreground text-center">
            This analysis was generated by AIDOMO AI Assistant • AIChecklist.io
          </div>
        </>
      )}
    </Card>
  );
}