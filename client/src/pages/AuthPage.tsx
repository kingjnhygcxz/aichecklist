import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User, Sparkles, Shield } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import EmailLoginForm from '@/components/auth/EmailLoginForm';
import { safeRedirect } from '@/lib/security';

export default function AuthPage() {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>('login');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authStep, setAuthStep] = useState<'social' | 'email'>('social');

  const handleBackToSocial = () => {
    setShowEmailForm(false);
    setAuthStep('social');
  };

  const handleEmailLogin = () => {
    setShowEmailForm(true);
    setAuthStep('email');
  };

  const handleAuthSuccess = () => {
    // Redirect to dashboard or handle success
    safeRedirect('/?login=success');
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AIChecklist
          </h1>
          <p className="text-gray-300 text-lg">
            Your intelligent task companion
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {authStep === 'social' ? (
            <motion.div
              key="social"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeVariants}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white">
                    {currentMode === 'login' ? 'Welcome Back' : 'Get Started'}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {currentMode === 'login' 
                      ? 'Sign in to your account to continue' 
                      : 'Create your account and start organizing'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as 'login' | 'signup')}>
                    <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
                      <TabsTrigger 
                        value="login" 
                        className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup"
                        className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="mt-6">
                      <SocialLoginButtons mode="login" onEmailLogin={handleEmailLogin} />
                    </TabsContent>
                    
                    <TabsContent value="signup" className="mt-6">
                      <SocialLoginButtons mode="signup" onEmailLogin={handleEmailLogin} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeVariants}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl">
                <EmailLoginForm
                  mode={currentMode}
                  onBack={handleBackToSocial}
                  onSuccess={handleAuthSuccess}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Preview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <User className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xs text-white font-medium">Voice Control</div>
                  <div className="text-xs text-gray-400">Speak your tasks</div>
                </div>
                <div>
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xs text-white font-medium">AI Powered</div>
                  <div className="text-xs text-gray-400">Smart suggestions</div>
                </div>
                <div>
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-400" />
                  <div className="text-xs text-white font-medium">Secure</div>
                  <div className="text-xs text-gray-400">Privacy first</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms and Privacy */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-400">
            By continuing, you agree to our{' '}
            <button className="text-blue-400 hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-blue-400 hover:underline">Privacy Policy</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}