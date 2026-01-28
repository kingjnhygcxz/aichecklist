import React from 'react';
import { Button } from '@/components/ui/button';
import { safeRedirect } from '@/lib/security';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Apple, Mail, Shield, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'signup';
  onEmailLogin?: () => void;
}

export function SocialLoginButtons({ mode = 'login', onEmailLogin }: SocialLoginButtonsProps) {
  const handleGoogleLogin = () => {
    safeRedirect('/auth/google');
  };

  const handleAppleLogin = () => {
    safeRedirect('/auth/apple');
  };

  const handleProtonLogin = () => {
    // For Proton Mail, we'll use the email form with special handling
    if (onEmailLogin) {
      onEmailLogin();
    }
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          {mode === 'login' ? 'Sign in with your preferred method' : 'Create your account using'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Google Login */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-3 py-6 hover:bg-red-50 hover:border-red-200"
          >
            <Chrome className="h-5 w-5 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Google</div>
              <div className="text-xs text-gray-500">Gmail & Google Account</div>
            </div>
          </Button>
        </motion.div>

        {/* Apple Login */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={handleAppleLogin}
            variant="outline"
            className="w-full flex items-center gap-3 py-6 hover:bg-gray-50 hover:border-gray-300"
          >
            <Apple className="h-5 w-5 text-gray-800" />
            <div className="text-left">
              <div className="font-medium">Apple ID</div>
              <div className="text-xs text-gray-500">iCloud & Apple Account</div>
            </div>
          </Button>
        </motion.div>

        {/* Personal Email */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={onEmailLogin}
            variant="outline"
            className="w-full flex items-center gap-3 py-6 hover:bg-blue-50 hover:border-blue-200"
          >
            <Mail className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Personal Email</div>
              <div className="text-xs text-gray-500">Any email address</div>
            </div>
          </Button>
        </motion.div>

        {/* Proton Mail */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={handleProtonLogin}
            variant="outline"
            className="w-full flex items-center gap-3 py-6 hover:bg-purple-50 hover:border-purple-200"
          >
            <Shield className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Proton Mail</div>
              <div className="text-xs text-gray-500">Secure & Private</div>
            </div>
          </Button>
        </motion.div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Secure Authentication
            </span>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Lock className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xs font-medium">Encrypted</div>
              <div className="text-xs text-gray-500">End-to-end</div>
            </div>
            <div>
              <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xs font-medium">Private</div>
              <div className="text-xs text-gray-500">No tracking</div>
            </div>
            <div>
              <User className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xs font-medium">Secure</div>
              <div className="text-xs text-gray-500">2FA support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Branding */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-400">
          Powered by <span className="font-medium text-gray-600">AIChecklist.io™</span>
        </p>
      </div>
    </div>
  );
}

export default SocialLoginButtons;