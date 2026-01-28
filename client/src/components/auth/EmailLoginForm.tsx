import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface EmailLoginFormProps {
  mode?: 'login' | 'signup';
  onBack?: () => void;
  onSuccess?: () => void;
}

interface EmailValidation {
  valid: boolean;
  provider: string;
  secure: boolean;
}

export function EmailLoginForm({ mode = 'login', onBack, onSuccess }: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState<EmailValidation | null>(null);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const validateEmail = (email: string): EmailValidation => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return { valid: false, provider: 'unknown', secure: false };
    }

    // Proton Mail domains
    const protonDomains = ['protonmail.com', 'proton.me', 'pm.me'];
    if (protonDomains.includes(domain)) {
      return { valid: true, provider: 'proton', secure: true };
    }

    // Gmail domains
    const gmailDomains = ['gmail.com', 'googlemail.com'];
    if (gmailDomains.includes(domain)) {
      return { valid: true, provider: 'google', secure: true };
    }

    // Apple domains
    const appleDomains = ['icloud.com', 'me.com', 'mac.com'];
    if (appleDomains.includes(domain)) {
      return { valid: true, provider: 'apple', secure: true };
    }

    // Other secure providers
    const secureProviders = ['outlook.com', 'hotmail.com', 'yahoo.com', 'fastmail.com', 'tutanota.com'];
    if (secureProviders.includes(domain)) {
      return { valid: true, provider: 'personal', secure: true };
    }

    // Generic personal email
    return { valid: true, provider: 'personal', secure: false };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail.includes('@')) {
      setEmailValidation(validateEmail(newEmail));
    } else {
      setEmailValidation(null);
    }
  };

  const getProviderBadge = (validation: EmailValidation) => {
    const configs = {
      proton: { label: 'Proton Mail', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield },
      google: { label: 'Google', color: 'bg-red-100 text-red-800 border-red-200', icon: Mail },
      apple: { label: 'Apple', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Mail },
      personal: { label: 'Personal Email', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Mail }
    };

    const config = configs[validation.provider as keyof typeof configs] || configs.personal;
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 mt-2"
      >
        <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        {validation.secure && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Secure
          </Badge>
        )}
      </motion.div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setIsLoading(false);
          return;
        }

        // Signup API call
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            provider: emailValidation?.provider || 'personal'
          })
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Registration failed');
          setIsLoading(false);
          return;
        }

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
      } else {
        // Login API call
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Login failed');
          setIsLoading(false);
          return;
        }

        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </div>
          <CardDescription>
            {mode === 'login' 
              ? 'Enter your email and password to sign in'
              : 'Create your account with email and password'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              {emailValidation && getProviderBadge(emailValidation)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {mode === 'login' && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </form>

          {/* Company Branding */}
          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-medium text-gray-600">AIChecklist.io™</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EmailLoginForm;