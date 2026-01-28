import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useColorOverlay } from '@/context/ColorOverlayContext';
import { X, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuperHeroPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperHeroPanel({ isOpen, onClose }: SuperHeroPanelProps) {
  const { overlayColor, setOverlayColor } = useColorOverlay();

  const colorOptions = [
    { id: 'none', name: 'Standard', color: 'transparent', bgClass: 'bg-gray-100' },
    { id: 'yellow', name: 'Solar', color: '#fef08a', bgClass: 'bg-yellow-200' },
    { id: 'green', name: 'Nature', color: '#bbf7d0', bgClass: 'bg-green-200' },
    { id: 'red', name: 'Fire', color: '#fecaca', bgClass: 'bg-red-200' },
    { id: 'braille', name: 'Braille', color: '#000000', bgClass: 'bg-black' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[90vw]"
          >
            <Card className="w-80 max-w-[90vw] shadow-xl border border-border/50 bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Super Hero Vision
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose your vision mode for enhanced screen overlay
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Important Notice */}
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-xs font-medium text-foreground mb-2">⚠️ Light Mode Required</p>
                    <p className="text-xs text-muted-foreground">
                      Color effects are only visible in Light Mode. Switch your browser/system to Light Mode for full visual enhancements.
                    </p>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <kbd className="bg-background px-1 py-0.5 rounded text-[10px] border">Esc</kbd> to turn off • <kbd className="bg-background px-1 py-0.5 rounded text-[10px] border">Alt+A</kbd> for Accessibility
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant={overlayColor === option.id ? "default" : "outline"}
                        className={`h-14 flex flex-col items-center gap-1.5 relative overflow-hidden transition-all ${
                          overlayColor === option.id ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50'
                        } ${option.id === 'braille' ? 'col-span-2 bg-black text-white hover:bg-gray-800 border-gray-700' : ''}`}
                        onClick={() => setOverlayColor(option.id as any)}
                        aria-label={`Activate ${option.name} vision mode${option.id === 'braille' ? ' for Braille accessibility support' : ''}`}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full border-2 ${option.id === 'braille' ? 'border-white' : 'border-border'} ${option.bgClass}`}
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-xs font-medium">{option.name}</span>
                        {option.id === 'braille' && (
                          <span className="text-[9px] opacity-75">Accessibility</span>
                        )}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Active Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Active Mode:</span>
                    <span className="text-xs font-medium text-foreground">
                      {colorOptions.find(c => c.id === overlayColor)?.name || 'Standard'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}