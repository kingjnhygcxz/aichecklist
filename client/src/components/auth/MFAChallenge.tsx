import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, HelpCircle, Copy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MFAChallengeProps {
  sessionToken: string;
  onSuccess: (sessionToken: string) => void;
  onCancel: () => void;
  availableMethods: Array<'pin' | 'challenge' | 'backup'>;
  userHasBackupCodes?: boolean;
}

export function MFAChallenge({ 
  sessionToken, 
  onSuccess, 
  onCancel, 
  availableMethods = ['pin', 'challenge', 'backup'],
  userHasBackupCodes = true 
}: MFAChallengeProps) {
  const [activeMethod, setActiveMethod] = useState<'pin' | 'challenge' | 'backup'>(availableMethods[0]);
  const [pin, setPin] = useState('');
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Example challenge questions (in real app, these would come from user's stored questions)
  const sampleChallenges = [
    "What was the name of your first pet?",
    "In what city were you born?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What was your childhood nickname?"
  ];

  const [currentChallenge] = useState(sampleChallenges[Math.floor(Math.random() * sampleChallenges.length)]);

  // Lockout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setRemainingAttempts(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const handleSubmit = async (method: 'pin' | 'challenge' | 'backup') => {
    if (isLocked) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = { sessionToken };
      
      switch (method) {
        case 'pin':
          if (!pin || pin.length < 4) {
            setError('PIN must be at least 4 digits');
            setIsSubmitting(false);
            return;
          }
          payload.pin = pin;
          break;
        case 'challenge':
          if (!challengeAnswer.trim()) {
            setError('Challenge answer is required');
            setIsSubmitting(false);
            return;
          }
          payload.challengeAnswer = challengeAnswer.trim();
          break;
        case 'backup':
          if (!backupCode.trim()) {
            setError('Backup code is required');
            setIsSubmitting(false);
            return;
          }
          payload.backupCode = backupCode.trim().toUpperCase();
          break;
      }

      const response = await fetch('/api/auth/voice/mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(sessionToken);
      } else {
        setError(data.error || 'Authentication failed');
        
        // Handle failed attempts
        const newRemainingAttempts = remainingAttempts - 1;
        setRemainingAttempts(newRemainingAttempts);
        
        if (newRemainingAttempts <= 0) {
          setIsLocked(true);
          setLockoutTime(300); // 5 minutes lockout
          setError('Too many failed attempts. Account locked for 5 minutes.');
        }
        
        // Clear form fields
        if (method === 'pin') setPin('');
        if (method === 'challenge') setChallengeAnswer('');
        if (method === 'backup') setBackupCode('');
      }
    } catch (error) {
      console.error('MFA challenge error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Shield className="h-5 w-5" />
            Account Temporarily Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Too many failed authentication attempts. Please wait {formatTime(lockoutTime)} before trying again.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete authentication using one of the methods below
        </p>
        {remainingAttempts < 3 && (
          <Badge variant="destructive" className="w-fit">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as typeof activeMethod)}>
          <TabsList className="grid w-full grid-cols-3">
            {availableMethods.includes('pin') && (
              <TabsTrigger value="pin" className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                PIN
              </TabsTrigger>
            )}
            {availableMethods.includes('challenge') && (
              <TabsTrigger value="challenge" className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Question
              </TabsTrigger>
            )}
            {availableMethods.includes('backup') && userHasBackupCodes && (
              <TabsTrigger value="backup" className="flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Backup
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* PIN Authentication */}
            {availableMethods.includes('pin') && (
              <TabsContent value="pin" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Enter your PIN</label>
                  <Input
                    type="password"
                    placeholder="Enter 4-6 digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    disabled={isSubmitting}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit('pin');
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={() => handleSubmit('pin')} 
                  disabled={isSubmitting || !pin}
                  className="w-full"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify PIN'}
                </Button>
              </TabsContent>
            )}

            {/* Challenge Question */}
            {availableMethods.includes('challenge') && (
              <TabsContent value="challenge" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Security Question</label>
                  <p className="text-sm text-muted-foreground mb-2">{currentChallenge}</p>
                  <Input
                    type="text"
                    placeholder="Enter your answer"
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                    disabled={isSubmitting}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit('challenge');
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={() => handleSubmit('challenge')} 
                  disabled={isSubmitting || !challengeAnswer.trim()}
                  className="w-full"
                >
                  {isSubmitting ? 'Verifying...' : 'Submit Answer'}
                </Button>
              </TabsContent>
            )}

            {/* Backup Code */}
            {availableMethods.includes('backup') && userHasBackupCodes && (
              <TabsContent value="backup" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Backup Code</label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter one of your saved backup codes
                  </p>
                  <Input
                    type="text"
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    maxLength={8}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit('backup');
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Each backup code can only be used once
                  </p>
                </div>
                <Button 
                  onClick={() => handleSubmit('backup')} 
                  disabled={isSubmitting || !backupCode.trim()}
                  className="w-full"
                >
                  {isSubmitting ? 'Verifying...' : 'Use Backup Code'}
                </Button>
              </TabsContent>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
              Cancel
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}