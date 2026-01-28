import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { DomoAIMicroLogo } from "@/components/domoai/DomoAIMicroLogo";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { StreamingText } from "@/components/ui/StreamingText";
import { DocumentResponse } from "@/components/ui/DocumentResponse";

interface AidomoChatWidgetProps {
  // Positioning options
  position?: 'inline' | 'floating' | 'toolbar';
  // Size options
  size?: 'sm' | 'md' | 'lg';
  // Context for AI responses
  context?: string;
  // Custom styling
  className?: string;
  // Button text (optional)
  buttonText?: string;
  // Show icon
  showIcon?: boolean;
}

export function AidomoChatWidget({ 
  position = 'inline',
  size = 'md',
  context = 'general_assistant',
  className = "",
  buttonText,
  showIcon = true
}: AidomoChatWidgetProps) {
  const [aidomoInput, setAidomoInput] = useState('');
  const [aidomoResponse, setAidomoResponse] = useState('');
  const [aidomoLoading, setAidomoLoading] = useState(false);
  const { toast } = useToast();

  const handleAidomoSubmit = async () => {
    if (!aidomoInput.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for AIDOMO to respond to.",
        variant: "destructive",
      });
      return;
    }

    setAidomoLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message: aidomoInput,
          context: context 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setAidomoResponse(data.response);
      
      toast({
        title: "AIDOMO Response Ready! ✨",
        description: "Your AI assistant has provided a helpful response.",
      });
    } catch (error) {
      console.error('AIDOMO error:', error);
      setAidomoResponse('');
      
      toast({
        title: "AIDOMO Unavailable",
        description: "AIDOMO is temporarily unavailable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAidomoLoading(false);
    }
  };

  const clearChat = () => {
    setAidomoInput('');
    setAidomoResponse('');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'default';
      default: return 'sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  // Floating position styling
  const getPositionClasses = () => {
    switch (position) {
      case 'floating':
        return 'fixed bottom-6 right-6 z-50';
      case 'toolbar':
        return 'flex items-center';
      default:
        return '';
    }
  };

  const buttonContent = (
    <>
      {showIcon && (
        <ErrorBoundary>
          <DomoAIMicroLogo size={getIconSize()} />
        </ErrorBoundary>
      )}
      {buttonText && <span className="ml-1">{buttonText}</span>}
      {!buttonText && showIcon && <Sparkles className="h-3 w-3 ml-1" />}
    </>
  );

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size={getButtonSize()}
            className={`${getSizeClasses()} no-print bg-green-500/10 hover:bg-green-500/20 border-green-500/30`}
            title="Ask AIDOMO ✨"
          >
            {buttonContent}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1400px] max-h-[98vh] overflow-y-auto w-[98vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ErrorBoundary>
                <DomoAIMicroLogo size={20} />
              </ErrorBoundary>
              AIDOMO ✨ AI Assistant
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 w-full">
            <div>
              <Label htmlFor="aidomo-input">Ask AIDOMO anything:</Label>
              <Textarea
                id="aidomo-input"
                placeholder="Type your question or request..."
                value={aidomoInput}
                onChange={(e) => setAidomoInput(e.target.value)}
                className="mt-1 text-base"
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAidomoSubmit}
                disabled={aidomoLoading}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {aidomoLoading ? "AIDOMO is thinking..." : "Ask AIDOMO"}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearChat}
                disabled={aidomoLoading}
              >
                Clear
              </Button>
            </div>
            
            {aidomoResponse && (
              <div className="mt-6 w-full">
                <DocumentResponse
                  response={aidomoResponse}
                  title="AIDOMO Analysis"
                  author="AIDOMO AI Assistant"
                  streaming={true}
                  speed={15}
                  showHeader={true}
                  className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10 w-full min-h-[60vh]"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}