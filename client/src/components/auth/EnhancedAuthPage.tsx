import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Mic, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Sparkles,
  Brain,
  Activity 
} from 'lucide-react';
import { EnhancedVoiceBiometric } from './EnhancedVoiceBiometric';
import { MFAChallenge } from './MFAChallenge';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register' | 'voice-setup' | 'voice-training' | 'mfa';

interface EnhancedAuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export function EnhancedAuthPage({ onAuthSuccess }: EnhancedAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'voice'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mfaSessionToken, setMfaSessionToken] = useState<string>('');
  const [voiceHealthData, setVoiceHealthData] = useState<any>(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Handle traditional password authentication
  const handlePasswordAuth = async (authMode: 'login' | 'register') => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (authMode === 'register' && !email.trim()) {
      setError('Email is required for registration');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const payload = authMode === 'login' 
        ? { username, password }
        : { username, password, email };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (authMode === 'register') {
          toast({
            title: "Registration Successful",
            description: "Please check your email for verification instructions.",
          });
          setMode('login');
          setEmail('');
        } else {
          onAuthSuccess(data);
        }
      } else {
        setError(data.message || `${authMode} failed`);
      }
    } catch (error) {
      console.error(`${authMode} error:`, error);
      setError(`${authMode} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle enhanced voice authentication
  const handleVoiceAuth = async (voiceData: string, transcribedText?: string, healthData?: any) => {
    if (!username.trim()) {
      setError('Username is required for voice authentication');
      return;
    }

    setIsLoading(true);
    setError('');
    setVoiceHealthData(healthData);

    try {
      const endpoint = mode === 'voice-setup' ? '/api/auth/voice/setup' : '/api/auth/voice/login';
      const payload = {
        username,
        audioData: voiceData,
        transcribedText,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
        environmentData: {
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setConfidenceLevel(data.confidenceScore || 0);
        
        if (mode === 'voice-setup') {
          toast({
            title: "Voice Authentication Setup Complete",
            description: `Confidence level: ${data.confidenceScore}%`,
          });
          setMode('login');
          setAuthMethod('voice');
        } else if (data.requiresMFA) {
          setMfaSessionToken(data.sessionToken);
          setMode('mfa');
          toast({
            title: "Voice Verified",
            description: "Please complete multi-factor authentication.",
          });
        } else {
          toast({
            title: "Authentication Successful",
            description: `Voice confidence: ${data.confidenceScore}%`,
          });
          onAuthSuccess({ ...data, sessionToken: data.sessionToken });
        }
      } else {
        setError(data.error || 'Voice authentication failed');
        
        // Show health recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
          toast({
            title: "Voice Health Recommendations",
            description: data.recommendations.join(', '),
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Voice authentication error:', error);
      setError('Voice authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice training
  const handleVoiceTraining = async (voiceData: string, transcribedText?: string) => {
    // Simulate training with multiple samples
    const samples = [voiceData]; // In real implementation, collect multiple samples
    
    try {
      const response = await fetch('/api/auth/voice/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // Replace with actual user ID
          sessionType: 'adaptation',
          audioSamples: samples,
          transcripts: transcribedText ? [transcribedText] : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Training Progress",
          description: `Confidence improved by ${data.confidenceImprovement}%`,
        });
        
        if (data.trainingComplete) {
          setMode('login');
          setAuthMethod('voice');
        }
      } else {
        setError(data.error || 'Voice training failed');
      }
    } catch (error) {
      console.error('Voice training error:', error);
      setError('Voice training failed. Please try again.');
    }
  };

  // Handle MFA completion
  const handleMFASuccess = (sessionToken: string) => {
    toast({
      title: "Authentication Complete",
      description: "Multi-factor authentication successful.",
    });
    onAuthSuccess({ sessionToken });
  };

  const getAuthMethodIcon = (method: 'password' | 'voice') => {
    return method === 'password' ? <Lock className="h-4 w-4" /> : <Mic className="h-4 w-4" />;
  };

  const getFeatureBadges = () => {
    const features = [];
    
    if (mode === 'voice-setup' || authMethod === 'voice') {
      features.push(
        <Badge key="adaptive" variant="secondary" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          Adaptive Learning
        </Badge>
      );
      features.push(
        <Badge key="health" variant="secondary" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Health Monitoring
        </Badge>
      );
      features.push(
        <Badge key="mfa" variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Multi-Factor Auth
        </Badge>
      );
    }
    
    return features;
  };

  if (mode === 'mfa') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <MFAChallenge
          sessionToken={mfaSessionToken}
          onSuccess={handleMFASuccess}
          onCancel={() => {
            setMode('login');
            setMfaSessionToken('');
          }}
          availableMethods={['pin', 'challenge', 'backup']}
          userHasBackupCodes={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            AICHECKLIST.IO
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'voice-setup' ? 'Set up enhanced voice authentication' :
             mode === 'voice-training' ? 'Improve voice recognition accuracy' :
             mode === 'register' ? 'Create your account' :
             'Sign in to your account'}
          </p>
          
          {/* Feature badges */}
          {getFeatureBadges().length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {getFeatureBadges()}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Selection */}
          {(mode === 'login' || mode === 'register') && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Authentication Method Selection */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={authMethod === 'password' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('password')}
                  className="flex items-center gap-2"
                >
                  {getAuthMethodIcon('password')}
                  Password
                </Button>
                <Button
                  variant={authMethod === 'voice' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('voice')}
                  className="flex items-center gap-2"
                >
                  {getAuthMethodIcon('voice')}
                  Voice
                </Button>
              </div>
            </div>
          )}

          {/* Traditional Password Form */}
          {(mode === 'login' || mode === 'register') && authMethod === 'password' && (
            <motion.form
              ref={formRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordAuth(mode);
              }}
            >
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              {mode === 'register' && (
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.form>
          )}

          {/* Enhanced Voice Authentication */}
          {(((mode === 'login' || mode === 'register') && authMethod === 'voice') || 
           mode === 'voice-setup' || mode === 'voice-training') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Username input for voice auth */}
              {(mode === 'login' || mode === 'voice-setup') && (
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              <EnhancedVoiceBiometric
                onVoiceCapture={mode === 'voice-training' ? handleVoiceTraining : handleVoiceAuth}
                mode={mode === 'voice-setup' ? 'setup' : mode === 'voice-training' ? 'training' : 'login'}
                currentConfidenceLevel={confidenceLevel}
                requiresMFA={mode === 'login'}
                onMFAChallenge={() => {
                  // MFA will be handled when the voice auth returns requiresMFA
                }}
              />
            </motion.div>
          )}

          {/* Voice Health Display */}
          {voiceHealthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-muted rounded-lg space-y-2"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Voice Health: {voiceHealthData.healthScore}%</span>
              </div>
              {voiceHealthData.recommendations.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Recommendations: {voiceHealthData.recommendations.join(', ')}
                </div>
              )}
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Links */}
          <div className="space-y-2">
            <Separator />
            
            {/* Voice Setup Link */}
            {mode === 'login' && authMethod === 'password' && (
              <Button
                variant="ghost"
                onClick={() => setMode('voice-setup')}
                className="w-full flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Set up Enhanced Voice Authentication
              </Button>
            )}

            {/* Training Link */}
            {mode === 'login' && authMethod === 'voice' && (
              <Button
                variant="ghost"
                onClick={() => setMode('voice-training')}
                className="w-full flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Improve Voice Recognition
              </Button>
            )}

            {/* Back to Login */}
            {(mode === 'voice-setup' || mode === 'voice-training') && (
              <Button
                variant="ghost"
                onClick={() => setMode('login')}
                className="w-full"
              >
                Back to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}