import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
// Lazy load components for better performance
const VideoPopup = React.lazy(() => import('@/components/ui/VideoPopup').then(module => ({ default: module.VideoPopup })));
import { User, Lock, Mic, Eye, EyeOff, Play, CheckCircle, Mail, Check, Zap, Shield, Clock, Users, ChevronLeft, ChevronRight, Brain, BarChart3, Calendar, Loader2, Plane, FileText, Timer, Printer, X, Download, Target, ListChecks, Lightbulb, BookOpen, Rocket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { safeRedirect } from '@/lib/security';
// Lazy load download counter to reduce initial bundle size
const DownloadCounter = React.lazy(() => import('@/components/stats/DownloadCounter').then(module => ({ default: module.DownloadCounter })));
import { TermsOfService } from '@/components/legal/TermsOfService';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/Logo';
const aidomoLogo = "/assets/icon_gold_small.png";
import { useQuery } from '@tanstack/react-query';

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
  product: {
    id: string;
    name: string;
    description: string;
  };
}

// Stripe Pricing Table type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
      }, HTMLElement>;
    }
  }
}

export function Auth() {
  console.log("Auth component rendering");
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Fetch pricing data from API
  const { data: prices, isLoading: pricesLoading } = useQuery<StripePrice[]>({
    queryKey: ['/api/pricing'],
  });

  // Parse prices into plan info
  const parsePlans = (priceData: StripePrice[]) => {
    const plans: { name: string; displayName: string; price: number; features: string[]; color: string; popular?: boolean }[] = [];
    const monthlyPrices = priceData.filter(p => p.recurring?.interval === 'month');
    
    for (const price of monthlyPrices) {
      const productName = price.product?.name?.toLowerCase() || '';
      
      if (productName.includes('pro') && !productName.includes('team') && !productName.includes('business') && !productName.includes('enterprise')) {
        if (!plans.find(p => p.name === 'pro')) {
          plans.push({
            name: 'pro',
            displayName: 'Pro',
            price: price.unit_amount / 100,
            color: 'blue',
            features: ['Unlimited tasks', 'AI suggestions', 'Voice commands', 'Calendar sync', 'Priority support']
          });
        }
      } else if (productName.includes('team') || productName.includes('business')) {
        if (!plans.find(p => p.name === 'team')) {
          plans.push({
            name: 'team',
            displayName: 'Team',
            price: price.unit_amount / 100,
            popular: true,
            color: 'purple',
            features: ['Everything in Pro', 'Team collaboration', 'Shared checklists', 'Project charts', 'Team analytics']
          });
        }
      } else if (productName.includes('enterprise')) {
        if (!plans.find(p => p.name === 'enterprise')) {
          plans.push({
            name: 'enterprise',
            displayName: 'Enterprise',
            price: price.unit_amount / 100,
            color: 'amber',
            features: ['Everything in Team', 'SSO authentication', 'Dedicated support', 'Custom workflows', 'SLA guarantee', 'Min. 2 seats/month']
          });
        }
      }
    }
    return plans.sort((a, b) => a.price - b.price);
  };

  const pricingPlans = prices ? parsePlans(prices) : [];
  
  // Horizontal scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [hasLeftFirstPage, setHasLeftFirstPage] = useState(false);
  
  // Handle keyboard navigation between form fields
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<HTMLInputElement> | null) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  const sections = ['login', 'features', 'signup', 'pricing', 'about'];
  
  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.offsetWidth;
      container.scrollTo({
        left: sectionWidth * index,
        behavior: 'smooth'
      });
      setCurrentSection(index);
      if (index > 0 && !hasLeftFirstPage) {
        setHasLeftFirstPage(true);
      }
      // Set authMode based on section (0=login, 1=features, 2=signup)
      if (index === 0) setAuthMode('login');
      if (index === 2) {
        setAuthMode('register');
        // Focus on firstname input after scroll animation (preventScroll avoids jump)
        setTimeout(() => {
          firstNameInputRef.current?.focus({ preventScroll: true });
        }, 500);
      }
    }
  };
  
  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleHorizontalScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.offsetWidth;
      const newSection = Math.round(container.scrollLeft / sectionWidth);
      setCurrentSection(newSection);
      if (newSection > 0 && !hasLeftFirstPage) {
        setHasLeftFirstPage(true);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleHorizontalScroll);
      return () => container.removeEventListener('scroll', handleHorizontalScroll);
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceAuthEnabled, setVoiceAuthEnabled] = useState(false);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showProductivityMethod, setShowProductivityMethod] = useState(false);
  const [showADHDGuide, setShowADHDGuide] = useState(false);
  const [showGetThereGuide, setShowGetThereGuide] = useState(false);
  const [showTakingBreaksGuide, setShowTakingBreaksGuide] = useState(false);
  const [showGoalSettingGuide, setShowGoalSettingGuide] = useState(false);
  const [showWhitePaper, setShowWhitePaper] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Video URL for the demo video - using Streamable embed (features/AIDOMO demo)
  const videoUrl = "https://streamable.com/e/e71sa7?autoplay=1&loop=0";
  
  // Video URL for the main login page promotional video
  const loginPageVideoUrl = "https://streamable.com/e/5b1sjj?autoplay=1&loop=0";
  
  // Video URL for todolist/templates demo
  const templatesVideoUrl = "https://streamable.com/e/ua6ps3?autoplay=1&loop=0";
  
  // Video URL for quick scheduling demo
  const quickSchedulingVideoUrl = "https://streamable.com/e/nmn8me?autoplay=1&loop=0";
  
  // Video URL for analytics demo
  const analyticsVideoUrl = "https://streamable.com/e/b4pl1g?autoplay=1&loop=0";
  
  // Video URL for collaboration demo
  const collaborationVideoUrl = "https://streamable.com/e/dmv5vm?autoplay=1&loop=0";
  
  // Video URL for schedule clients demo
  const scheduleClientsVideoUrl = "https://streamable.com/e/v2us8d?autoplay=1&loop=0";
  
  // Email code authentication state
  const [useEmailCode, setUseEmailCode] = useState(true); // Default to email code auth
  const [emailCodeStep, setEmailCodeStep] = useState<'email' | 'code'>('email');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    voicePassword: '',
    voiceTrainingData: '',
    firstName: '',
    lastName: ''
  });

  // Handle sending email code
  const handleSendEmailCode = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/send-code', { 
        email: formData.email 
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Code Sent",
          description: "Check your email for the login code",
        });
        setEmailCodeSent(true);
        setEmailCodeStep('code');
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send login code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle verifying email code
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/verify-code', {
        email: formData.email,
        code: verificationCode,
        username: formData.username || undefined
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Store session
        if (userData.sessionId) {
          localStorage.setItem('sessionId', userData.sessionId);
          localStorage.setItem('userId', userData.id.toString());
          localStorage.setItem('username', userData.username);
        }
        
        toast({
          title: "Success",
          description: userData.message,
        });
        
        // Trigger auth check event
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Use client-side navigation instead of full reload
        setTimeout(() => {
          setLocation('/');
        }, 100);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Invalid code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle traditional login/register
  const handleTraditionalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For registration, validate passwords match and terms accepted
    if (authMode === 'register') {
      // Terms acceptance validation
      if (!termsAccepted) {
        toast({
          title: "Terms Required",
          description: "You must accept the Terms of Service to create an account",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Password matching validation (only for registration)
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please check and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      // For registration, auto-generate username from email
      const autoUsername = formData.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6);
      const payload = authMode === 'login' 
        ? { email: formData.email, password: formData.password, rememberMe }
        : { 
            username: autoUsername,
            email: formData.email, 
            password: formData.password, 
            firstName: formData.firstName,
            lastName: formData.lastName,
            voicePassword: formData.voicePassword,
            voiceEnabled: voiceAuthEnabled,
            termsAccepted: termsAccepted,
            termsVersion: 'v1.0',
            selectedPlan: selectedPlan,
            preferredBillingCycle: billingCycle
          };

      const response = await apiRequest('POST', endpoint, payload);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Handle email verification requirement for registration
        if (authMode === 'register' && userData.requiresVerification) {
          // Set success state to show prominent message
          setRegisteredEmail(userData.email);
          setRegistrationSuccess(true);
          toast({
            title: "Registration Successful!",
            description: `Please check your email (${userData.email}) and click the verification link to activate your account.`,
            variant: "default",
            duration: 10000, // Show for 10 seconds
          });
          // Don't redirect - user needs to verify email first
        } else if (authMode === 'register') {
          // Registration without email or legacy flow
          toast({
            title: "Registration Successful!",
            description: "Welcome to AICHECKLIST! You are now logged in.",
            variant: "default",
          });
          
          // Store session token if provided
          if (userData.sessionId) {
            localStorage.setItem('sessionId', userData.sessionId);
            // Dispatch custom event to notify auth system
            window.dispatchEvent(new Event('userLoggedIn'));
          }
          
          // Force a small delay to ensure localStorage is set before redirect
          setTimeout(() => {
            setLocation('/');
          }, 200);
        } else {
          // Login successful
          if (userData.sessionId) {
            localStorage.setItem('sessionId', userData.sessionId);
            // Dispatch custom event to notify auth system
            window.dispatchEvent(new Event('userLoggedIn'));
          }
          
          // Force a small delay to ensure localStorage is set before redirect
          setTimeout(() => {
            setLocation('/');
          }, 200);
        }
      } else {
        const errorData = await response.json();
        
        // Handle email verification required error
        if (errorData.requiresVerification) {
          toast({
            title: "Email Verification Required",
            description: errorData.message || "Please verify your email address before logging in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorData.message || 'Authentication failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice biometric login
  const handleVoiceBiometricLogin = async (voiceData: string, transcribedText?: string) => {
    console.log('handleVoiceBiometricLogin called with voiceData length:', voiceData?.length);
    console.log('Transcribed text:', transcribedText);
    console.log('Current formData.username:', formData.username);
    
    // Get username from input field directly if form state is empty
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const username = formData.username.trim() || usernameInput?.value?.trim() || '';
    
    console.log('Final username to use:', username);
    
    if (!username) {
      console.log('Username validation failed - field is empty');
      toast({
        title: "Username Required",
        description: "Please enter your username first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting voice biometric login for:', username);

    try {
      const response = await apiRequest('POST', '/api/voice-biometric-login', {
        username: username,
        voiceData: voiceData,
        transcribedText: transcribedText
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Voice biometric login successful:', userData);
        
        // Store session token if provided
        if (userData.sessionId) {
          localStorage.setItem('sessionId', userData.sessionId);
        }
        
        toast({
          title: "Voice Authentication Successful",
          description: "Welcome back!",
        });
        
        // Force navigation to home page
        setTimeout(() => {
          safeRedirect('/');
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Voice biometric login failed:', errorData);
        console.log('Error message received:', errorData.message);
        
        // If voice authentication is not set up, offer to set it up
        if (errorData.message === "Voice authentication not set up") {
          console.log('Voice not set up, triggering auto-setup...');
          setIsLoading(false); // Reset loading state
          toast({
            title: "Voice Setup Required",
            description: "Setting up voice authentication for your account...",
          });
          await handleVoiceBiometricSetup(voiceData);
          return;
        }
        
        throw new Error(errorData.message || 'Voice authentication failed');
      }
    } catch (error: any) {
      console.error('Voice biometric login error:', error);
      
      // Check if this is a 401 error for voice setup
      if (error.message && error.message.includes("Voice authentication not set up")) {
        console.log('Caught voice setup error, triggering auto-setup...');
        setIsLoading(false);
        toast({
          title: "Voice Setup Required",
          description: "Setting up voice authentication for your account...",
        });
        await handleVoiceBiometricSetup(voiceData);
        return;
      }
      
      toast({
        title: "Voice Authentication Failed",
        description: error instanceof Error ? error.message : "Voice not recognized. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice biometric setup
  const handleVoiceBiometricSetup = async (voiceData: string) => {
    // Get username from input field directly if form state is empty
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const username = formData.username.trim() || usernameInput?.value?.trim() || '';
    
    console.log('Setting up voice biometric for username:', username);
    console.log('Voice data length for setup:', voiceData?.length);
    
    try {
      const response = await apiRequest('POST', '/api/voice-biometric-setup', {
        username: username,
        voiceData: voiceData
      });

      if (response.ok) {
        toast({
          title: "Voice Authentication Setup Complete",
          description: "You can now log in with your voice",
        });
        // Automatically attempt login after setup
        await handleVoiceBiometricLogin(voiceData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Voice setup failed');
      }
    } catch (error) {
      console.error('Voice biometric setup error:', error);
      toast({
        title: "Voice Setup Failed",
        description: error instanceof Error ? error.message : "Could not set up voice authentication",
        variant: "destructive",
      });
    }
  };

  // Handle voice password setup during registration
  const handleVoicePasswordSetup = (voicePassword: string) => {
    setFormData(prev => ({ ...prev, voicePassword }));
    setVoiceAuthEnabled(true);
    toast({
      title: "Voice Password Set",
      description: "Your voice password has been recorded successfully.",
    });
  };

  // Handle voice training completion
  const handleVoiceTrainingComplete = (voiceData: any) => {
    setFormData(prev => ({ 
      ...prev, 
      voicePassword: "welcome to the best ai list",
      voiceTrainingData: JSON.stringify(voiceData)
    }));
    setVoiceAuthEnabled(true);
    setShowVoiceTraining(false);
    toast({
      title: "Voice Training Complete",
      description: "Your voice has been trained successfully!",
    });
  };

  return (
    <div className="auth-container h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700" data-testid="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="relative h-8 flex items-center">
              <div 
                className={`flex items-center gap-2 transition-all duration-500 ease-out ${
                  currentSection === 0 
                    ? 'opacity-0 transform translate-x-4 pointer-events-none' 
                    : 'opacity-100 transform translate-x-0'
                }`}
              >
                <button 
                  onClick={() => scrollToSection(0)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  data-testid="nav-home-btn"
                >
                  <Logo className="w-8 h-8 mr-1" />
                  <span className="text-xl font-bold text-white">AICHECKLIST</span>
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => scrollToSection(0)}
                className={`text-sm font-medium transition-colors duration-150 min-w-[80px] text-center ${currentSection === 0 ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                data-testid="nav-login"
              >
                Login
              </button>
              <button 
                onClick={() => scrollToSection(1)}
                className={`text-sm font-medium transition-colors duration-150 min-w-[60px] text-center ${currentSection === 1 ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                data-testid="nav-features"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection(2)}
                className={`text-sm font-medium transition-colors duration-150 min-w-[60px] text-center ${currentSection === 2 ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                data-testid="nav-signup"
              >
                Sign Up
              </button>
              <button 
                onClick={() => scrollToSection(3)}
                className={`text-sm font-medium transition-colors duration-150 min-w-[50px] text-center ${currentSection === 3 ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                data-testid="nav-pricing"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection(4)}
                className={`text-sm font-medium transition-colors duration-150 min-w-[65px] text-center ${currentSection === 4 ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                data-testid="nav-about"
              >
                About Us
              </button>
            </div>
            
            <Button 
              onClick={() => scrollToSection(2)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold h-9"
              data-testid="nav-signup-btn"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Launch Announcement Banner - displays for 72 hours from Jan 6, 2026 */}
      {(() => {
        const bannerStart = new Date('2026-01-06T00:00:00Z');
        const bannerEnd = new Date(bannerStart.getTime() + 72 * 60 * 60 * 1000);
        const now = new Date();
        return now >= bannerStart && now <= bannerEnd;
      })() && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-center py-2 px-4">
          <p className="text-sm font-medium">
            Official launch is in less than two weeks. Thank you for your patience as we update mainframes.
          </p>
        </div>
      )}

      {/* Horizontal Scrolling Sections with Arrow Navigation */}
      <div className="relative flex-1 flex flex-col">
        {/* Left Arrow */}
        <button
          onClick={() => scrollToSection(Math.max(0, currentSection - 1))}
          className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-gray-800/80 border border-gray-600 hover:bg-gray-700 hover:border-primary transition-all duration-200 ${currentSection === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          disabled={currentSection === 0}
          data-testid="scroll-arrow-left"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
        
        {/* Right Arrow */}
        <button
          onClick={() => scrollToSection(Math.min(sections.length - 1, currentSection + 1))}
          className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-gray-800/80 border border-gray-600 hover:bg-gray-700 hover:border-primary transition-all duration-200 ${currentSection === sections.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          disabled={currentSection === sections.length - 1}
          data-testid="scroll-arrow-right"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory flex-1 h-full scroll-smooth"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
        data-testid="horizontal-scroll-container"
      >
        {/* Login Section - First Slide */}
        <section ref={signupRef} className="min-w-full h-full snap-start flex items-start justify-center pt-2 pb-4 px-4" data-testid="section-login">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
            {/* Hero Section - Hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-start pt-8 space-y-4 text-center lg:text-left">
              <div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Logo className="w-12 h-12" />
                  <h1 className="text-4xl lg:text-5xl font-bold text-white">AICHECKLIST</h1>
                </div>
                <p className="text-lg text-gray-300 mt-3">Intelligent management, powered by secure AI</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">Key Highlights</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white text-sm"><strong>Voice-driven task management</strong> — Create and manage tasks using voice or text. (Voice login coming soon.)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white text-sm"><strong>Organized in minutes</strong> — AIDOMO transforms your objectives into clear, actionable checklists — schedules your appointments generate briefs with no complexity.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white text-sm"><strong>Secure cloud synchronization</strong> — Your data stays protected and accessible across devices, teams, and locations. (Coming soon)</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white text-sm">Replace manual tracking and status meetings with a single system that keeps work moving, visible, and accountable.</span>
                </div>
                
                <div className="flex justify-center lg:justify-start mt-4 lg:ml-11">
                  <Button onClick={() => { setCurrentVideoUrl(loginPageVideoUrl); setShowVideoPopup(true); }} variant="outline" size="sm" className="group flex items-center gap-2 border-primary/50 hover:border-primary hover:bg-primary/10 animate-green-swoosh">
                    <Play className="h-3.5 w-3.5 text-primary" />
                    Watch Demo Video
                  </Button>
                </div>
                
                <div className="flex justify-center lg:justify-start mt-3">
                  <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading stats...</div>}>
                    <DownloadCounter />
                  </React.Suspense>
                </div>
              </div>
            </div>
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-4">
              <div className="flex items-center gap-2 justify-center">
                <Logo className="w-10 h-10" />
                <h1 className="text-3xl font-bold text-white">AICHECKLIST</h1>
              </div>
              <p className="text-sm text-gray-300 mt-2">Intelligent management, powered by secure AI</p>
            </div>

            {/* Auth Form - Login Only */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center py-3">
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                      {useEmailCode ? (
                        <motion.div key="email-code-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">Sign in with Email</h3>
                            <p className="text-sm text-muted-foreground">No password needed - we'll send you a login code</p>
                          </div>
                          {emailCodeStep === 'email' ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="email-login">Email Address</Label>
                                <Input id="email-login" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="your.email@example.com" required />
                              </div>
                              <Button onClick={handleSendEmailCode} className="w-full" disabled={isLoading} type="button">{isLoading ? 'Sending Code...' : 'Send Login Code'}</Button>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="code">Enter Code</Label>
                                <p className="text-sm text-muted-foreground">We sent a 6-digit code to {formData.email}</p>
                                <Input id="code" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyCode(); }} placeholder="Enter 6-digit code" maxLength={6} className="text-center text-2xl tracking-widest font-mono" required />
                              </div>
                              <Button onClick={handleVerifyCode} className="w-full" disabled={isLoading} type="button">{isLoading ? 'Verifying...' : 'Sign In'}</Button>
                              <button type="button" onClick={() => { setEmailCodeStep('email'); setVerificationCode(''); }} className="text-sm text-muted-foreground hover:text-primary underline w-full text-center">Use a different email</button>
                            </>
                          )}
                          <Separator />
                          <button type="button" onClick={() => { setUseEmailCode(false); setEmailCodeStep('email'); setVerificationCode(''); }} className="text-sm text-muted-foreground hover:text-primary underline w-full text-center">Sign in with email & password instead</button>
                          <div className="text-center mt-4"><p className="text-sm text-muted-foreground">AIChecklist.io™</p></div>
                        </motion.div>
                      ) : (
                        <motion.form key="traditional-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleTraditionalAuth} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email-pw">Email</Label>
                            <Input id="login-email-pw" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required />
                              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} data-testid="checkbox-remember-me" />
                              <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">Remember me for 30 days</Label>
                            </div>
                            <button type="button" onClick={() => setLocation('/forgot-password')} className="text-sm text-muted-foreground hover:text-primary underline">Forgot Password?</button>
                          </div>
                          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
                          <Separator />
                          <button type="button" onClick={() => { setUseEmailCode(true); setEmailCodeStep('email'); }} className="text-sm text-muted-foreground hover:text-primary underline w-full text-center">Sign in with email code instead (no password needed)</button>
                          <div className="text-center mt-4"><p className="text-sm text-muted-foreground">AIChecklist.io™</p></div>
                        </motion.form>
                      )}
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Don't have an account? <button type="button" onClick={() => scrollToSection(2)} className="text-primary hover:underline font-medium">Sign Up</button></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Second Slide */}
        <section className="min-w-full h-full snap-start flex items-start justify-center pt-4 pb-4 px-6" data-testid="section-features">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Powerful Features</h2>
              <p className="text-lg text-gray-300">Everything you need to manage tasks intelligently</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Clock, title: 'TODO LIST CHECKLIST', desc: 'Generate rapid todolists & checklists', highlight: true, isAidomo: false, isPilotMode: true },
                { icon: null, title: 'AIDOMO', subtitle: 'personal assistant', desc: 'Schedule appointments, write business briefs, create rolling todolists & checklists', highlight: true, isAidomo: true },
                { icon: Calendar, title: 'Scheduling Business & Personal', desc: 'Schedule, Remind, Build Your Empire', highlight: true, isAidomo: false },
                { icon: BarChart3, title: 'Analytics', desc: 'Track productivity', highlight: false, isAidomo: false },
                { icon: Shield, title: 'Secure', desc: 'Enterprise security', highlight: false, isAidomo: false },
                { icon: Mic, title: 'Voice Commands', desc: 'AIDOMO assistant for efficiency', highlight: true, isAidomo: false },
                { icon: Users, title: 'Collaboration', desc: 'Share workload with team', highlight: true, isAidomo: false, hasVideo: true },
                { icon: Zap, title: 'Fast Sync', desc: 'Real-time sync', highlight: false, isAidomo: false },
              ].map((feature) => (
                <div key={feature.title} className={`bg-gray-800/50 border rounded-lg p-3 transition-colors duration-150 relative flex flex-col ${feature.highlight ? 'border-blue-400 ring-1 ring-blue-400/50' : 'border-gray-700 hover:border-blue-500/50'}`}>
                  <div className="flex-1">
                    {feature.isAidomo ? (
                      <img src={aidomoLogo} alt="AIDOMO" className="h-6 w-6 mb-1" />
                    ) : (feature as any).isPilotMode ? (
                      <div className="flex justify-between items-start mb-1">
                        <Clock className="h-6 w-6 text-blue-400" />
                        <Plane className="h-5 w-5 text-green-400" />
                      </div>
                    ) : feature.icon && (
                      <feature.icon className="h-6 w-6 text-blue-400 mb-1" />
                    )}
                    <h3 className="text-sm font-semibold text-white mb-1">
                      <span className="flex items-center gap-1">
                        {feature.title}
                        {(feature as any).subtitle && (
                          <span className="text-[10px] font-normal text-gray-400">{(feature as any).subtitle}</span>
                        )}
                      </span>
                      {(feature as any).subtitle2 && (
                        <span className="block text-[9px] font-normal text-gray-400 mt-0.5">{(feature as any).subtitle2}</span>
                      )}
                    </h3>
                    {feature.isAidomo ? (
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>• Client Onboarding</li>
                        <li>• Client Scheduling Portal</li>
                        <li>• Store projects & assignments</li>
                        <li>• .doc, .pdf & .odt support</li>
                        <li>• Continue where you left off</li>
                        <li>• Build checklists & schedule meetings</li>
                      </ul>
                    ) : feature.title === 'Voice Commands' ? (
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>• Create todo's</li>
                        <li>• Create multiple items</li>
                        <li>• Say "next item" for rolling lists</li>
                      </ul>
                    ) : feature.title === 'Analytics' ? (
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>• Celebrate your wins</li>
                        <li>• PERT & Gantt charting</li>
                        <li>• See how productive you were</li>
                        <li>• Make micro changes to scale</li>
                      </ul>
                    ) : feature.title === 'Scheduling Business & Personal' ? (
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>• Appointment Scheduling Software</li>
                        <li>• Brand your scheduling portal</li>
                        <li>• Schedule with clients</li>
                        <li>• AIDOMO will schedule for you</li>
                      </ul>
                    ) : feature.title === 'TODO LIST CHECKLIST' ? (
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>• Access hundreds of quick templates</li>
                        <li>• Preflight pilot friendly mode</li>
                        <li>• Generate rapid checklists</li>
                        <li>• Create todolists instantly</li>
                      </ul>
                    ) : feature.title === 'Collaboration' ? (
                      <p className="text-gray-400 text-xs">Share workload with team</p>
                    ) : (
                      <p className="text-gray-400 text-xs">{feature.desc}</p>
                    )}
                  </div>
                  {feature.isAidomo && (
                    <button
                      onClick={() => { setCurrentVideoUrl(videoUrl); setShowVideoPopup(true); }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-[10px] font-medium py-1 px-2 rounded transition-all duration-200"
                      data-testid="button-aidomo-demo"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                        <Play className="h-2 w-2 fill-current" />
                      </span>
                      Scheduling & AIDOMO
                    </button>
                  )}
                  {feature.title === 'Analytics' && (
                    <button
                      onClick={() => { setCurrentVideoUrl(analyticsVideoUrl); setShowVideoPopup(true); }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-[10px] font-medium py-1 px-2 rounded transition-all duration-200"
                      data-testid="button-analytics-demo"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                        <Play className="h-2 w-2 fill-current" />
                      </span>
                      Analytics
                    </button>
                  )}
                  {feature.title === 'Scheduling Business & Personal' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => { setCurrentVideoUrl(quickSchedulingVideoUrl); setShowVideoPopup(true); }}
                        className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-[10px] font-medium py-1 px-1.5 rounded transition-all duration-200"
                        data-testid="button-quick-scheduling"
                      >
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                          <Play className="h-2 w-2 fill-current" />
                        </span>
                        Quick Scheduling
                      </button>
                      <button
                        onClick={() => { setCurrentVideoUrl(scheduleClientsVideoUrl); setShowVideoPopup(true); }}
                        className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[10px] font-medium py-1 px-1.5 rounded transition-all duration-200 animate-subtle-shimmer"
                        data-testid="button-schedule-clients"
                      >
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                          <Play className="h-2 w-2 fill-current" />
                        </span>
                        schedule clients
                      </button>
                    </div>
                  )}
                  {feature.title === 'TODO LIST CHECKLIST' && (
                    <button
                      onClick={() => { setCurrentVideoUrl(templatesVideoUrl); setShowVideoPopup(true); }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-[10px] font-medium py-1 px-2 rounded transition-all duration-200"
                      data-testid="button-quick-templates"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                        <Play className="h-2 w-2 fill-current" />
                      </span>
                      Quick Templates
                    </button>
                  )}
                  {feature.title === 'Collaboration' && (
                    <button
                      onClick={() => { setCurrentVideoUrl(collaborationVideoUrl); setShowVideoPopup(true); }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-[10px] font-medium py-1 px-2 rounded transition-all duration-200"
                      data-testid="button-collaboration-demo"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 border border-white/40">
                        <Play className="h-2 w-2 fill-current" />
                      </span>
                      Collaboration
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Section - Third Slide */}
        <section className="min-w-full h-full snap-start flex items-center justify-center py-4 px-4" data-testid="section-signup">
          <div className="w-full max-w-5xl grid lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Left Side - Plan Selection Cards (stacked vertically) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex flex-col space-y-3"
            >
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Choose Your Plan</h2>
              </div>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-3 p-2 bg-gray-800/70 rounded-lg mb-2" data-testid="billing-cycle-toggle">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="billing-monthly-btn"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="billing-yearly-btn"
                >
                  Yearly
                  <span className="ml-1 text-xs bg-green-600/50 px-1.5 py-0.5 rounded">Save 20%</span>
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedPlan === 'pro'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
                data-testid="plan-card-pro"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">Pro</span>
                  <div className="text-right">
                    <span className="text-xs text-blue-400 font-medium">{billingCycle === 'yearly' ? '$7.33/mo' : '$9.99/mo'}</span>
                    {billingCycle === 'yearly' && <span className="block text-[10px] text-gray-400">$88/yr <span className="text-green-400">Save $31</span></span>}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Unlimited tasks • AI • 14-day trial</p>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPlan('team')}
                className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                  selectedPlan === 'team'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
                data-testid="plan-card-team"
              >
                <span className="absolute -top-2 right-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">POPULAR</span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">Team</span>
                  <div className="text-right">
                    <span className="text-xs text-purple-400 font-medium">{billingCycle === 'yearly' ? '$24/mo' : '$29.99/mo'}</span>
                    {billingCycle === 'yearly' && <span className="block text-[10px] text-gray-400">$288/yr <span className="text-green-400">Save $71</span></span>}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Collaboration • Priority support • 14-day trial</p>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPlan('enterprise')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedPlan === 'enterprise'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
                data-testid="plan-card-enterprise"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">Enterprise</span>
                  <div className="text-right">
                    <span className="text-xs text-amber-400 font-medium">{billingCycle === 'yearly' ? '$73/mo' : '$99.99/mo'}</span>
                    {billingCycle === 'yearly' && <span className="block text-[10px] text-gray-400">$881/yr <span className="text-green-400">Save $318</span></span>}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">SSO • Custom • Min. 2 seats • 14-day trial</p>
              </button>
              
              <p className="text-center text-xs text-green-400 mt-2">
                <Check className="inline h-3 w-3 mr-1" />
                No credit card required for trial
              </p>
            </motion.div>
            
            {/* Mobile Header & Plan Selection */}
            <div className="lg:hidden text-center mb-2">
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              {/* Mobile Billing Toggle */}
              <div className="flex items-center justify-center gap-2 mt-2" data-testid="mobile-billing-toggle">
                <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>Monthly</button>
                <button onClick={() => setBillingCycle('yearly')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${billingCycle === 'yearly' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>Yearly <span className="text-[10px]">-20%</span></button>
              </div>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                <button onClick={() => setSelectedPlan('pro')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedPlan === 'pro' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>Pro {billingCycle === 'yearly' ? '$7.33/mo' : '$9.99/mo'}</button>
                <button onClick={() => setSelectedPlan('team')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all relative ${selectedPlan === 'team' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}`}><span className="absolute -top-1.5 right-0 text-[8px] bg-purple-600 px-1 rounded">TOP</span>Team {billingCycle === 'yearly' ? '$24/mo' : '$29.99/mo'}</button>
                <button onClick={() => setSelectedPlan('enterprise')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedPlan === 'enterprise' ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300'}`}>Enterprise {billingCycle === 'yearly' ? '$73.42/mo' : '$99.99/mo'}</button>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center py-3">
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription>
                    {`Start your ${selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'team' ? 'Team' : 'Enterprise'} trial`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {registrationSuccess ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4" data-testid="signup-registration-success">
                      <div className="flex justify-center"><div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="h-8 w-8 text-green-600" /></div></div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-green-700">Registration Successful!</h3>
                        <p className="text-muted-foreground text-sm">We've sent a verification email to:</p>
                        <p className="font-medium flex items-center justify-center gap-2 text-sm"><Mail className="h-4 w-4" />{registeredEmail}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        <p>Please check your inbox and click the verification link.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { setRegistrationSuccess(false); scrollToSection(0); }} data-testid="signup-button-back-to-login">Go to Login</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleTraditionalAuth} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="signup-firstname" className="text-xs">First Name *</Label>
                          <Input ref={firstNameInputRef} id="signup-firstname" type="text" value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} onKeyDown={(e) => handleFieldKeyDown(e, lastNameInputRef)} placeholder="First name" required data-testid="signup-input-firstname" className="h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-lastname" className="text-xs">Last Name *</Label>
                          <Input ref={lastNameInputRef} id="signup-lastname" type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} onKeyDown={(e) => handleFieldKeyDown(e, emailInputRef)} placeholder="Last name" required data-testid="signup-input-lastname" className="h-9" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-email" className="text-xs">Email Address *</Label>
                        <Input ref={emailInputRef} id="signup-email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} onKeyDown={(e) => handleFieldKeyDown(e, passwordInputRef)} placeholder="your.email@example.com" required data-testid="signup-input-email" className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-password" className="text-xs">Password</Label>
                        <div className="relative">
                          <Input ref={passwordInputRef} id="signup-password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} onKeyDown={(e) => handleFieldKeyDown(e, confirmPasswordInputRef)} required className="h-9" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-confirm-password" className="text-xs">Confirm Password</Label>
                        <div className="relative">
                          <Input ref={confirmPasswordInputRef} id="signup-confirm-password" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} required className={`h-9 ${formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : ''}`} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        </div>
                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <Checkbox id="signup-terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} data-testid="signup-checkbox-terms" />
                        <Label htmlFor="signup-terms" className="text-xs">I accept the <button type="button" onClick={() => setShowTerms(true)} className="text-primary hover:underline">Terms of Service</button></Label>
                      </div>
                      <Button type="submit" className="w-full h-9" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Already have an account? <button type="button" onClick={() => scrollToSection(0)} className="text-primary hover:underline">Sign in</button></p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="min-w-full h-full snap-start flex flex-col items-center justify-center px-4 pt-0 pb-8 -mt-8" data-testid="section-pricing">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-white mb-1">Choose Your Plan</h2>
            <p className="text-white text-sm mb-3">Start with a 14-day free trial on any paid plan</p>
            
            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center bg-gray-700 border border-gray-600 rounded-full p-0.5" data-testid="billing-toggle">
              <button 
                onClick={() => setBillingCycle('monthly')} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-white hover:text-white'}`}
                data-testid="btn-monthly"
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${billingCycle === 'yearly' ? 'bg-green-500 text-white' : 'text-white hover:text-white'}`}
                data-testid="btn-yearly"
              >
                Yearly
                <span className="text-[10px] bg-green-600 px-1 py-0.5 rounded text-white">-20%</span>
              </button>
            </div>
          </div>
          
          {pricesLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {pricingPlans.length > 0 && (
            <div className="grid md:grid-cols-3 gap-3 max-w-3xl mx-auto w-full" data-testid="pricing-grid">
              {pricingPlans.map((plan) => {
                const monthlyPrice = plan.price;
                const yearlyPrice = Math.round(monthlyPrice * 0.8 * 100) / 100;
                const yearlyTotal = Math.round(yearlyPrice * 12);
                const yearlySavings = Math.round(monthlyPrice * 12 - yearlyTotal);
                const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
                const planColors = {
                  pro: { border: 'border-blue-500/50', bg: 'bg-blue-500', ring: 'ring-blue-500/20', badge: 'bg-blue-500' },
                  team: { border: 'border-purple-500/50', bg: 'bg-purple-500', ring: 'ring-purple-500/20', badge: 'bg-purple-500' },
                  enterprise: { border: 'border-amber-500/50', bg: 'bg-amber-500', ring: 'ring-amber-500/20', badge: 'bg-amber-500' }
                };
                const colors = planColors[plan.name as keyof typeof planColors] || planColors.pro;
                
                return (
                  <div 
                    key={plan.name}
                    className={`bg-gray-700 backdrop-blur border rounded-lg p-3 transition-all hover:scale-[1.01] ${plan.popular ? `${colors.border} ring-1 ${colors.ring}` : 'border-gray-500'}`}
                    data-testid={`pricing-card-${plan.name}`}
                  >
                    {plan.popular && (
                      <div className="text-center mb-1">
                        <span className={`${colors.badge} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>Most Popular</span>
                      </div>
                    )}
                    <h3 className="text-base font-bold text-white text-center">{plan.displayName}</h3>
                    <div className="text-center my-2">
                      <span className="text-2xl font-bold text-white">${displayPrice.toFixed(2)}</span>
                      <span className="text-white text-sm">/mo</span>
                      {billingCycle === 'yearly' && (
                        <div className="mt-0.5">
                          <span className="text-[10px] text-white">${yearlyTotal}/yr</span>
                          <span className="ml-1 text-[10px] text-green-400 font-medium">Save ${yearlySavings}</span>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1 mb-3">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs text-white">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      size="sm"
                      className={`w-full h-8 text-xs text-white font-semibold ${plan.popular ? `${colors.bg} hover:opacity-90` : 'bg-green-600 hover:bg-green-500 border border-green-400'}`}
                      onClick={() => {
                        setSelectedPlan(plan.name as 'pro' | 'team' | 'enterprise');
                        scrollToSection(2);
                      }}
                      data-testid={`btn-select-${plan.name}`}
                    >
                      Start Free Trial
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="min-w-full h-full snap-start flex items-start justify-center pt-6 pb-4 px-4" data-testid="section-about">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">About AIChecklist</h2>
            
            <div className="flex flex-col items-center gap-6">
              {/* Downloadable Resources - Centered */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 text-center">Productivity Resources</h3>
                <div className="grid grid-cols-3 gap-2" style={{ display: 'grid' }}>
                  {/* START HERE - First Item */}
                  <button 
                    type="button"
                    onClick={() => setShowGetThereGuide(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Rocket className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">START HERE</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                  
                  {/* AIChecklist White Paper */}
                  <button 
                    type="button"
                    onClick={() => setShowWhitePaper(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <FileText className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">White Paper</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                  
                  {/* Why Taking Breaks Matters */}
                  <button 
                    type="button"
                    onClick={() => setShowTakingBreaksGuide(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Timer className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">Taking Breaks</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                  
                  {/* How to Be More Productive */}
                  <button 
                    type="button"
                    onClick={() => setShowProductivityMethod(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Zap className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">Productivity</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                  
                  {/* ADHD */}
                  <button 
                    type="button"
                    onClick={() => setShowADHDGuide(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Brain className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">ADHD</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                  
                  {/* Goal Setting Guide */}
                  <button 
                    type="button"
                    onClick={() => setShowGoalSettingGuide(true)}
                    className="w-20 h-20 p-2 bg-gray-900 rounded-lg border border-green-600/50 cursor-pointer hover:border-green-400 active:border-green-300 hover:scale-105 active:scale-100 transition-all flex flex-col items-center justify-center text-center group"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Target className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    <span className="text-white text-[9px] font-medium leading-tight">Goal Setting</span>
                    <Printer className="h-3 w-3 text-gray-500 group-hover:text-green-400 mt-1" />
                  </button>
                </div>
              </div>
              
              {/* Stats - Below Downloads */}
              <div>
                <p className="text-xs text-gray-400 mb-2 text-center">Click here to print out data</p>
                <div className="grid grid-cols-3 gap-3" style={{ display: 'grid' }}>
                  <button type="button" className="text-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 active:bg-gray-600/50 transition-all min-h-[60px]" onClick={() => window.print()} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <div className="text-2xl font-bold text-blue-400">3.4M</div>
                    <div className="text-gray-400 text-xs">Potential Signups</div>
                  </button>
                  <button type="button" className="text-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 active:bg-gray-600/50 transition-all min-h-[60px]" onClick={() => window.print()} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <div className="text-2xl font-bold text-purple-400">1M+</div>
                    <div className="text-gray-400 text-xs">Tasks</div>
                  </button>
                  <button type="button" className="text-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 active:bg-gray-600/50 transition-all min-h-[60px]" onClick={() => window.print()} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <div className="text-2xl font-bold text-green-400">99.9%</div>
                    <div className="text-gray-400 text-xs">Uptime</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>

      {/* Section Indicators */}
      <div className="flex justify-center gap-2 py-3 bg-gray-900/50" data-testid="section-indicators">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(index)}
            className={`h-2 rounded-full transition-all duration-150 ${
              currentSection === index ? 'bg-blue-500 w-6' : 'bg-gray-600 w-2 hover:bg-gray-500'
            }`}
            data-testid={`indicator-${section}`}
          />
        ))}
      </div>
      
      {/* Terms of Service Modal */}
      <TermsOfService
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTerms(false);
          toast({
            title: "Terms Accepted",
            description: "Thank you for accepting our Terms of Service",
            variant: "default",
          });
        }}
      />

      {/* Productivity Method Modal */}
      <Dialog open={showProductivityMethod} onOpenChange={setShowProductivityMethod}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-400" />
                AI Checklist: Productivity Science in Practice
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('productivity-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - Productivity Science in Practice</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>AI Checklist: Productivity Science in Practice</h1>
                            <p style="color: #6b7280; font-style: italic;">A Deep-Dive on Focus Timers, Automated Scheduling, Task Systems, and ADHD-Friendly Work Design</p>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="productivity-content" className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-400 italic">A Deep-Dive on Focus Timers, Automated Scheduling, Task Systems, and ADHD-Friendly Work Design</p>
            
            <section>
              <p className="text-sm leading-relaxed">
                This document provides an in-depth explanation of how established productivity research is applied in real systems. Rather than presenting abstract theory, it demonstrates how AI Checklist converts cognitive science into practical workflows that protect attention, reduce cognitive load, and increase execution reliability in modern knowledge work.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">1. Why Modern Knowledge Work Fails Without Structure</h3>
              <p className="text-sm leading-relaxed">
                Modern professionals operate in environments dominated by constant interruption, ambiguous task boundaries, and reactive scheduling. Research consistently shows that the human brain performs poorly when forced to repeatedly switch contexts, negotiate priorities on the fly, or maintain large task inventories in working memory. The result is not a lack of effort, but fragmented attention and declining execution quality.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist is designed around a simple principle: productivity is not a motivation problem, it is a systems problem. When structure is externalized into software—through timers, scheduling automation, and checklists—the brain is freed to focus on judgment, creativity, and execution rather than coordination.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">2. Timeboxing, Pomodoro, and Focus Preservation</h3>
              <p className="text-sm leading-relaxed">
                Timeboxing methods such as the Pomodoro Technique impose artificial but effective constraints on work. By defining a clear start and stop point for effort, they reduce the psychological resistance to beginning a task and prevent work from expanding indefinitely. This structure supports sustained attention by reducing uncertainty and minimizing internal negotiation about when to stop or switch tasks.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist embeds this logic directly into execution. Focus timers are attached to individual tasks and checklist items, allowing users to initiate a work session with a single action. During the focus interval, attention is protected; when the timer ends, a deliberate break is prompted.
              </p>
              <p className="text-sm leading-relaxed mt-2 text-gray-400 italic">
                This approach aligns with research from UC Berkeley and Caltech showing that attention performs best when task boundaries are explicit and task-switching is minimized.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">3. Breaks as a Performance Tool, Not Lost Time</h3>
              <p className="text-sm leading-relaxed">
                Breaks are often misunderstood as interruptions to productivity. In reality, short, intentional breaks play a critical role in restoring attention, emotional regulation, and working memory. Without breaks, cognitive fatigue accumulates, leading to slower decision-making and increased error rates.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist treats breaks as a first-class component of execution. Rather than leaving recovery to chance, the system prompts users to step away after focused work cycles, supporting consistent output over long periods of time.
              </p>
              <p className="text-sm leading-relaxed mt-2 text-gray-400 italic">
                Guidance from UC Berkeley's Greater Good Science Center and German research institutions supports the effectiveness of brief recovery periods in maintaining performance and reducing burnout.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">4. ADHD-Friendly Design Without Medical Framing</h3>
              <p className="text-sm leading-relaxed">
                Many high-performing individuals experience difficulty with task initiation, sustained attention, and overwhelm in unstructured environments. Productivity systems that rely on willpower or vague prioritization often fail for these users. What works instead is clarity, predictability, and visible progress.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist includes an ADHD-friendly mode that adjusts formatting, pacing, and workflow structure. Tasks are broken into smaller units, text output is shortened and chunked, and timers create predictable execution cycles. This reduces cognitive friction and supports consistent follow-through.
              </p>
              <p className="text-sm leading-relaxed mt-2 text-gray-400 italic">
                This design philosophy aligns with WebMD summaries of adult ADHD focus strategies and research from USC and German universities on cognitive load and attention regulation.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">5. Automated Scheduling as Focus Protection</h3>
              <p className="text-sm leading-relaxed">
                Scheduling is one of the most underestimated drains on productivity. Each scheduling interaction requires context switching, negotiation, and calendar management—all of which fragment attention and interrupt deep work.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist eliminates this burden by automating appointment booking. Clients select available times via a scheduling link, appointments appear directly on the user's calendar, and confirmations are handled automatically. The professional remains focused on work.
              </p>
              <p className="text-sm leading-relaxed mt-2 text-gray-400 italic">
                By separating coordination from execution, AI Checklist preserves uninterrupted focus blocks, a practice strongly supported by attention research from Caltech and UC Berkeley.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">6. Task Management and Checklists as Cognitive Offloading</h3>
              <p className="text-sm leading-relaxed">
                Checklists are not about control—they are about cognitive offloading. By externalizing steps and progress, checklists reduce working memory demands and allow users to focus on quality and decision-making rather than recall.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                AI Checklist combines traditional to-do lists with structured checklists and task grouping. Each task is designed to answer three questions clearly: what to do now, what comes next, and what completion looks like.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">7. End-to-End Productivity Flow</h3>
              <p className="text-sm leading-relaxed">
                When all components are combined—timers, breaks, scheduling, and task structure—AI Checklist becomes an end-to-end execution system rather than a simple task manager.
              </p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Clients book appointments without interrupting work</li>
                <li>Appointments appear automatically on the calendar</li>
                <li>Focus timers guide execution during protected work blocks</li>
                <li>Tasks and checklists reduce cognitive load</li>
                <li>Breaks restore attention</li>
                <li>Progress remains visible and measurable</li>
              </ul>
            </section>
            
            <div className="flex justify-center pt-4 border-t border-gray-700">
              <Button
                onClick={() => {
                  const content = document.getElementById('productivity-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AIChecklist - Productivity Method</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                            h3 { color: #1e3a8a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>AIChecklist.io</h1>
                            <p>Timer & Productivity Method Guide</p>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>Visit AIChecklist.io for more productivity tools</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }
                  }
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                Print This Guide
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADHD Guide Modal */}
      <Dialog open={showADHDGuide} onOpenChange={setShowADHDGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-green-400" />
                ADHD & Productivity Guide
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('adhd-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - ADHD & Productivity Guide</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>ADHD & Productivity Guide</h1>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="adhd-content" className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">1. ADHD and Productivity in Knowledge Work</h3>
              <p className="text-sm leading-relaxed">
                ADHD-related attention challenges often stem from difficulty with task initiation, sustained focus, and working-memory overload. Productivity systems that rely on willpower or vague prioritization tend to fail. Structured systems, clear boundaries, and visible progress consistently improve execution.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                Short work intervals, external reminders, and step-by-step checklists reduce cognitive friction by shifting attention management from the individual to the system.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">2. Color Psychology and Cognitive Performance</h3>
              <p className="text-sm leading-relaxed">
                Color influences attention, emotional regulation, and task persistence. Research shows that cool colors support calm focus, while excessive contrast or saturation can increase mental fatigue and distractibility.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                For ADHD-friendly environments, muted blues and greens support sustained attention, while limited accent colors help guide focus without overwhelming the senses.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">3. How AI Checklist Applies These Principles</h3>
              <p className="text-sm leading-relaxed">
                AI Checklist integrates ADHD-aware productivity design and color psychology by combining timers, structured checklists, minimal visual noise, and predictable workflows. Color is used intentionally to highlight priority actions while maintaining a calm interface.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">References</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                <li>WebMD. Adult ADHD: Organization and Productivity Strategies.</li>
                <li>University of California, Berkeley – Greater Good Science Center. Attention, focus, and break research.</li>
                <li>University of Southern California. Cognitive load and attention performance studies.</li>
                <li>California Institute of Technology (Caltech). Attention control and task-switching research.</li>
                <li>Mehta, R., & Zhu, J. (2009). Blue or Red? Exploring the Effect of Color on Cognitive Task Performance. Science.</li>
                <li>University of British Columbia. Color psychology and cognitive task performance research.</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Get There Guide Modal */}
      <Dialog open={showGetThereGuide} onOpenChange={setShowGetThereGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-green-400" />
                We Get You There Guide
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('getthere-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - We Get You There Guide</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>We Get You There Guide</h1>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="getthere-content" className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">1. Start Your New Project With a Template</h3>
              <p className="text-sm leading-relaxed">
                When starting a new project, we believe the best approach is to begin with a template. Feel free to email us templates you would like to see added, especially if they are industry-specific. Once a template is selected, a checklist is created within your to-do list. Select the template box inside the to-do list area and add your own adjustments to make it your own. This allows you to get a head start by using something that is already structured.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">2. Use the Checklist Box Inside Your To-Do List</h3>
              <p className="text-sm leading-relaxed">
                Once the to-do list item is created, you will see a checklist box. Select the checklist box inside your to-do list to add as many checklist items as needed. As each item is marked complete, progress updates automatically and focus moves rapidly to the next item, allowing you to move quickly through your work. This system has been used across many Fortune 100 and Fortune 500 companies to increase processing speed while reducing mistakes.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">3. Schedule Your Day With AIDomo</h3>
              <p className="text-sm leading-relaxed">
                Ask AIDomo to schedule your appointments and print a copy of your daily schedule. Once appointments are set, return to your to-do list and set alarms for your tasks. When a task begins, the countdown clock helps keep you ahead of your next call or workflow session.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">4. Give Yourself a Head Start</h3>
              <p className="text-sm leading-relaxed">
                Give yourself a 15-minute head start before transitions. Treat yourself well—stand up, walk around, and get fresh air. Use the 26-minute on and 10-minute off method and watch productivity increase.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">5. Let Workflow Sessions Carry You</h3>
              <p className="text-sm leading-relaxed">
                As workflow sessions continue, the system begins to function like a well-oiled machine. You will notice how quickly tasks are completed once structure and timing are in place. Ask AIDomo for a daily summary to see what still needs to be completed, especially in enterprise accounts.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">6. Review Analytics and Make Micro Improvements</h3>
              <p className="text-sm leading-relaxed">
                Review analytics to see what you are doing better this week compared to last. These insights help you make small adjustments that lead to continuous improvement.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">7. Share Your Calendar and Work Zone-to-Zone</h3>
              <p className="text-sm leading-relaxed">
                Share your calendar with your assistant, especially if you are frequently in and out of the car. This helps keep scheduling on track if you are a serial meeting attendee and allows you to move smoothly from zone to zone. In the future, AI assistants will also support calls and sales follow-ups.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Taking Breaks Guide Modal */}
      <Dialog open={showTakingBreaksGuide} onOpenChange={setShowTakingBreaksGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <Timer className="h-6 w-6 text-green-400" />
                The Role of Structured Breaks
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('breaks-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - The Role of Structured Breaks</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>The Role of Structured Breaks in Sustained Performance</h1>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="breaks-content" className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
              <p className="text-sm leading-relaxed">
                In high-responsibility environments such as finance, aerospace, manufacturing, and food processing, sustained attention and decision quality are mission-critical. Research across cognitive psychology, occupational safety, and human performance consistently shows that structured breaks are not a productivity loss, but a productivity and safety multiplier.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">The Cost of Continuous Work</h3>
              <p className="text-sm leading-relaxed">
                Human cognitive resources are finite. Prolonged periods of continuous work lead to mental fatigue, reduced vigilance, slower reaction times, and increased error rates. According to research from the University of Illinois, sustained attention declines significantly over time without breaks. The researchers concluded that "brief diversions from a task can dramatically improve one's ability to focus on that task for prolonged periods."
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">The Science of Recovery and Attention</h3>
              <p className="text-sm leading-relaxed">
                Cognitive science demonstrates that the brain operates optimally in cycles rather than in continuous exertion. Dr. Anders Ericsson, known for his work on expert performance, observed that elite performers do not practice continuously. Instead, they work in intense, focused intervals followed by deliberate rest. Ericsson noted that "deliberate practice requires rest, because continuous effort leads to diminishing returns."
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Structured Break Systems and the Pomodoro Principle</h3>
              <p className="text-sm leading-relaxed">
                One of the most widely referenced structured break frameworks is the Pomodoro Technique, which advocates focused work intervals followed by short breaks. Francesco Cirillo, creator of the method, stated that "working in short bursts allows the brain to stay fresh and engaged while preventing mental exhaustion." Importantly, structured break systems externalize discipline, reducing burnout and sustaining long-term performance.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Breaks, Safety, and Error Reduction</h3>
              <p className="text-sm leading-relaxed">
                In safety-critical environments such as aviation and manufacturing, breaks are formally embedded into operations. The Federal Aviation Administration and other regulatory bodies mandate duty time limits and rest periods because fatigue has been directly linked to accidents. A landmark report by the National Transportation Safety Board concluded that "fatigue degrades human performance and increases the likelihood of errors in judgment, reaction time, and procedural compliance."
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Implications for Modern Operations</h3>
              <p className="text-sm leading-relaxed">
                Organizations that institutionalize structured breaks benefit in several ways. First, employees maintain higher cognitive clarity throughout the day. Second, error rates decline, particularly in repetitive or detail-sensitive tasks. Third, decision quality improves, as fatigue-driven shortcuts are reduced. In executive environments, breaks also improve strategic thinking.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">References</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                <li>University of Illinois at Urbana-Champaign. Vigilance Decrement and Attention Restoration Studies.</li>
                <li>Ericsson, A. Deliberate Practice and the Acquisition of Expert Performance.</li>
                <li>Cognition Journal. Attention and Mental Breaks Meta-Analysis.</li>
                <li>National Transportation Safety Board. Fatigue and Human Performance Reports.</li>
                <li>Stanford University. Rest, Creativity, and Cognitive Performance Research.</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Setting Guide Modal */}
      <Dialog open={showGoalSettingGuide} onOpenChange={setShowGoalSettingGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-400" />
                Goal Setting as an Operational Control System
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('goalsetting-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - Goal Setting Guide</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Goal Setting as an Operational Control System</h1>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="goalsetting-content" className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
              <p className="text-sm leading-relaxed">
                Goal setting is often treated as a motivational exercise rather than a formal control mechanism. However, decades of research demonstrate that structured goal setting is one of the most powerful tools for improving performance, accountability, and execution quality across organizations.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Why Most Goals Fail</h3>
              <p className="text-sm leading-relaxed">
                Many organizations set goals that are ambiguous, unmeasurable, or disconnected from daily operations. Phrases such as "do your best" or "improve performance" lack specificity and provide no objective standard for success. Dr. Edwin Locke, a pioneer in goal-setting theory, stated plainly that "specific and challenging goals lead to higher performance than easy goals, vague goals, or no goals at all."
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">The Science Behind Goal Setting</h3>
              <p className="text-sm leading-relaxed">
                Goal-setting theory, developed by Locke and later expanded with Dr. Gary Latham, demonstrates that effective goals have five core attributes: clarity, challenge, commitment, feedback, and task complexity alignment. Locke and Latham wrote that "goals serve as the immediate regulators of human action." In operational terms, this means that well-designed goals directly influence what people prioritize, how they allocate time, and how they evaluate progress.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Goals as a Management Control System</h3>
              <p className="text-sm leading-relaxed">
                In professional environments, goals are not motivational posters. They are control systems. Clear goals establish expectations, define acceptable performance ranges, and create a basis for feedback and correction. Research published in the Academy of Management Journal found that teams with clearly defined operational goals outperformed those without by a significant margin.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">The Role of Feedback and Review</h3>
              <p className="text-sm leading-relaxed">
                Goals without feedback degrade quickly. Continuous feedback allows individuals and teams to adjust behavior before small deviations become systemic failures. According to Locke and Latham, "feedback is essential for goal effectiveness because it provides information on progress toward goal attainment." Modern operational systems increasingly automate feedback through dashboards and reporting tools.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Goal Setting in High-Reliability Environments</h3>
              <p className="text-sm leading-relaxed">
                Aerospace, finance, and food processing environments rely heavily on goal clarity because ambiguity increases risk. Production targets, safety thresholds, and quality tolerances must be explicit. Research in human factors engineering shows that clear performance targets reduce cognitive load and decision ambiguity, particularly under pressure.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">References</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                <li>Locke, E. A. Toward a Theory of Task Motivation and Incentives.</li>
                <li>Locke, E. A., and Latham, G. P. A Theory of Goal Setting and Task Performance.</li>
                <li>Academy of Management Journal. Goal Clarity and Performance Studies.</li>
                <li>Human Factors Journal. Performance Targets and Cognitive Load.</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* White Paper Modal */}
      <Dialog open={showWhitePaper} onOpenChange={setShowWhitePaper}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white text-xl">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-400" />
                Goal Setting, Time-Structured Work & Operational Discipline
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const content = document.getElementById('whitepaper-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>AI Checklist - White Paper</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; font-size: 18px; }
                            h3 { color: #16a34a; margin-top: 24px; }
                            p { line-height: 1.6; color: #374151; }
                            ul { color: #374151; }
                            li { margin: 8px 0; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Goal Setting, Time-Structured Work, and Operational Discipline in Modern Organizations</h1>
                          </div>
                          ${content.innerHTML}
                          <div class="footer">
                            <p>AIChecklist.io - Intelligent Task Management</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="text-gray-400 hover:text-white"
                title="Print document"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div id="whitepaper-content" className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
              <p className="text-sm leading-relaxed">
                Organizations across industries face increasing pressure to deliver consistent results in environments characterized by distraction, operational complexity, regulatory oversight, and human fatigue. Traditional approaches to productivity often rely on motivation alone, which has proven unreliable at scale. Research across cognitive science, organizational psychology, and operational management demonstrates that structured goal setting combined with time-based work cycles and automation produces significantly better outcomes than motivation-driven approaches.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">The Role of Goal Setting in Operational Performance</h3>
              <p className="text-sm leading-relaxed">
                Goal setting is one of the most extensively studied performance drivers in organizational research. Decades of empirical evidence show that clear, specific, and measurable goals significantly outperform vague or open-ended directives. Edwin Locke, a foundational researcher in this field, stated that "specific goals increase performance by directing attention, mobilizing effort, increasing persistence, and motivating strategy development." In regulated and safety-sensitive industries, goal clarity is not merely a motivational tool. It is an operational necessity.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Time-Structured Work and the Science of Attention</h3>
              <p className="text-sm leading-relaxed">
                While goals define what must be achieved, time-structured work defines how effort is applied. Human attention is not designed for prolonged, uninterrupted focus. Cognitive research consistently shows that sustained mental effort without rest leads to diminishing returns, reduced accuracy, and higher error rates. The University of Illinois demonstrated that brief diversions from a task can significantly improve sustained attention and overall task performance.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Time Structure as a Goal Execution Mechanism</h3>
              <p className="text-sm leading-relaxed">
                Goals without time structure often fail because they lack a mechanism for consistent progress. Large objectives can feel abstract or overwhelming, leading to procrastination or fragmented effort. Time-based work cycles break goals into manageable execution windows, transforming strategic objectives into actionable units of work. Research in organizational behavior shows that progress visibility is a key driver of motivation and persistence.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Automation and Consistency in Productivity Systems</h3>
              <p className="text-sm leading-relaxed">
                Automation plays a critical role in sustaining goal-oriented behavior at scale. Manual systems rely heavily on memory, motivation, and managerial oversight, all of which degrade under pressure. Automated systems, by contrast, enforce consistency regardless of workload or environmental stress. Studies in operations management show that automated feedback loops significantly improve execution quality.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Leading Daily Productive Measures</h3>
              <p className="text-sm leading-relaxed">
                Leadership plays a decisive role in translating goals and time structures into daily behavior. Effective leaders do not rely on motivation speeches or abstract vision alone. They establish clear daily measures that reinforce strategic objectives through routine execution. Daily productive measures should be simple, observable, and aligned with higher-level goals.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Succeeding Despite Environmental Constraints</h3>
              <p className="text-sm leading-relaxed">
                One of the most significant advantages of structured goal setting and time-based execution is resilience to environmental conditions. Distractions, stress, organizational change, and external pressures are unavoidable. Systems that rely on ideal conditions are fragile. Systems built on structure and automation are robust. Studies during periods of high disruption show that teams with strong execution frameworks maintain higher performance levels.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Integrating Goals, Time Structure, and Leadership</h3>
              <p className="text-sm leading-relaxed">
                The most effective organizations do not treat goal setting, time management, and leadership as separate initiatives. They integrate them into a unified operational system. Goals define direction. Time-structured work governs execution. Automation enforces consistency. Leadership ensures alignment and accountability. When these elements are aligned, productivity becomes a systemic outcome rather than an individual struggle.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">References</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                <li>Locke, E. A. Toward a Theory of Task Motivation and Incentives.</li>
                <li>Locke, E. A., and Latham, G. P. A Theory of Goal Setting and Task Performance.</li>
                <li>University of Illinois at Urbana-Champaign. Studies on Attention and Vigilance.</li>
                <li>Cirillo, F. The Pomodoro Technique.</li>
                <li>Cognition Journal. Mental Breaks and Sustained Attention Research.</li>
                <li>National Transportation Safety Board. Fatigue and Human Performance Reports.</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Popup - Only load when opened */}
      {showVideoPopup && (
        <React.Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center text-white">Loading video...</div>}>
          <VideoPopup
            isOpen={showVideoPopup}
            onClose={() => setShowVideoPopup(false)}
            videoUrl={currentVideoUrl}
            title="Why AI Checklist?"
          />
        </React.Suspense>
      )}
    </div>
  );
}