import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, Keyboard, Volume2, Contrast, Timer, X } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { announce, handleKeyNavigation } = useAccessibility();
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    audioFeedback: false
  });

  if (!isOpen) return null;

  const updateSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
    
    // Apply settings to document
    const root = document.documentElement;
    switch (key) {
      case 'highContrast':
        root.classList.toggle('accessibility-high-contrast', newValue);
        break;
      case 'reducedMotion':
        root.classList.toggle('accessibility-reduced-motion', newValue);
        break;
      case 'largeText':
        root.classList.toggle('accessibility-large-text', newValue);
        break;
      case 'screenReaderMode':
        root.classList.toggle('accessibility-screen-reader', newValue);
        break;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-panel-title"
    >
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle id="accessibility-panel-title" className="text-lg">
                Accessibility Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            onKeyDown={(e) => handleKeyNavigation(e, onClose)}
            aria-label="Close accessibility panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                Visual Accessibility
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="text-sm">
                    High Contrast Mode
                  </Label>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={() => updateSetting('highContrast')}
                    aria-describedby="high-contrast-desc"
                  />
                </div>
                <p id="high-contrast-desc" className="text-xs text-muted-foreground">
                  Increases contrast for better visibility
                </p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="large-text" className="text-sm">
                    Large Text
                  </Label>
                  <Switch
                    id="large-text"
                    checked={settings.largeText}
                    onCheckedChange={() => updateSetting('largeText')}
                    aria-describedby="large-text-desc"
                  />
                </div>
                <p id="large-text-desc" className="text-xs text-muted-foreground">
                  Increases text size throughout the app
                </p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="text-sm">
                    Reduce Motion
                  </Label>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={() => updateSetting('reducedMotion')}
                    aria-describedby="reduced-motion-desc"
                  />
                </div>
                <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
                  Minimizes animations and transitions
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Navigation & Input
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="screen-reader" className="text-sm">
                    Screen Reader Mode
                  </Label>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReaderMode}
                    onCheckedChange={() => updateSetting('screenReaderMode')}
                    aria-describedby="screen-reader-desc"
                  />
                </div>
                <p id="screen-reader-desc" className="text-xs text-muted-foreground">
                  Optimizes interface for Braille displays and screen readers
                </p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav" className="text-sm">
                    Enhanced Keyboard Navigation
                  </Label>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigation}
                    onCheckedChange={() => updateSetting('keyboardNavigation')}
                    aria-describedby="keyboard-nav-desc"
                  />
                </div>
                <p id="keyboard-nav-desc" className="text-xs text-muted-foreground">
                  Enables full keyboard control and focus indicators
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Feedback
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-feedback" className="text-sm">
                    Task Completion Sounds
                  </Label>
                  <Switch
                    id="audio-feedback"
                    checked={settings.audioFeedback}
                    onCheckedChange={() => updateSetting('audioFeedback')}
                    aria-describedby="audio-feedback-desc"
                  />
                </div>
                <p id="audio-feedback-desc" className="text-xs text-muted-foreground">
                  Plays sounds when tasks are completed or timers finish
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              <strong>Keyboard Shortcuts:</strong>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Press Tab to navigate between elements</li>
              <li>• Press Enter or Space to activate buttons</li>
              <li>• Press Escape to close dialogs</li>
              <li>• Press Alt+A to open this accessibility panel</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}