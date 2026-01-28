import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Zap, Shield, Clock, Users, ChevronLeft, ChevronRight, Brain, BarChart3, Calendar, Mic, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export function HolidayAuth() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ['features', 'about', 'pricing'];
  
  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.offsetWidth;
      container.scrollTo({
        left: sectionWidth * index,
        behavior: 'smooth'
      });
      setCurrentSection(index);
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
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleHorizontalScroll);
      return () => container.removeEventListener('scroll', handleHorizontalScroll);
    }
  }, []);

  const handleSendCode = async () => {
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/send-code', { email });
      if (response.ok) {
        toast({ title: "Code Sent", description: "Check your email for the login code" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send code", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto" style={{
      background: 'linear-gradient(135deg, #0a1628 0%, #1a365d 30%, #0f2942 60%, #0a1628 100%)'
    }}>
      {/* Snowfall effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 12 + 8}px`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Navigation Header with Holiday Theme */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm border-b" style={{
        background: 'linear-gradient(90deg, #1a365d 0%, #0f2942 50%, #1a365d 100%)',
        borderColor: '#d4af37'
      }} data-testid="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎄</span>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-green-600 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{
                background: 'linear-gradient(90deg, #d4af37, #f5e6c8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>AIChecklist</span>
              <span className="text-2xl">🕎</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {['Features', 'About Us', 'Pricing'].map((label, i) => (
                <button 
                  key={label}
                  onClick={() => scrollToSection(i)}
                  className={`text-sm font-medium transition-colors duration-150 ${currentSection === i ? 'text-yellow-400' : 'text-blue-200 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <Button 
              onClick={scrollToSignup}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold"
              data-testid="nav-signup-btn"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Enhanced Festive Holiday Banner */}
      <div 
        className="w-full py-6 px-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2942 50%, #1a365d 100%)',
          borderBottom: '3px solid #d4af37'
        }}
        data-testid="banner-festive"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4 text-2xl">
          <span>🔔</span><span style={{color: '#c0c0c0'}}>🔔</span>
          <span style={{color: '#d4af37'}}>🔔</span><span>🔔</span>
        </div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 relative py-2">
          <div className="hidden md:block text-5xl">🎄</div>
          <div className="flex gap-2">
            <span className="text-2xl">🎀</span>
            <span className="text-2xl">🎁</span>
          </div>
          <div className="text-center">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-1"
              style={{
                background: 'linear-gradient(90deg, #d4af37, #f5e6c8, #d4af37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(212, 175, 55, 0.4)'
              }}
            >
              Happy Holidays!
            </h2>
            <p className="text-blue-200 text-sm">Wishing you joy and productivity this season</p>
          </div>
          <div className="flex gap-2">
            <span className="text-2xl">🎁</span>
            <span className="text-2xl">🎀</span>
          </div>
          <div className="hidden md:block text-5xl">🕎</div>
        </div>
        
        {/* Wreaths */}
        <div className="absolute bottom-0 left-8 text-3xl hidden lg:block">🌿</div>
        <div className="absolute bottom-0 right-8 text-3xl hidden lg:block">🌿</div>
      </div>

      {/* Horizontal Scrolling Sections */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory relative z-10"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {/* Features Section */}
        <section className="min-w-full snap-start flex items-center justify-center py-16 px-6">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-3">
                <span className="mr-2">✨</span>Powerful Features<span className="ml-2">✨</span>
              </h2>
              <p className="text-lg text-blue-200">Everything you need to manage tasks intelligently</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: Mic, title: 'Voice Commands', desc: 'AIDOMO assistant for efficiency', color: 'text-red-400', highlight: true },
                { icon: Brain, title: 'AI Suggestions', desc: 'Smart recommendations', color: 'text-green-400', highlight: false },
                { icon: BarChart3, title: 'Analytics', desc: 'Track productivity', color: 'text-yellow-400', highlight: false },
                { icon: Calendar, title: 'Scheduling', desc: 'Share your availability link', color: 'text-blue-400', highlight: true },
                { icon: Shield, title: 'Secure', desc: 'Enterprise security', color: 'text-green-400', highlight: false },
                { icon: Clock, title: 'Time Tracking', desc: 'Pomodoro timers', color: 'text-red-400', highlight: false },
                { icon: Users, title: 'Collaboration', desc: 'Share workload with team', color: 'text-yellow-400', highlight: true },
                { icon: Zap, title: 'Fast Sync', desc: 'Real-time sync', color: 'text-blue-400', highlight: false },
              ].map((feature) => (
                <div key={feature.title} className={`bg-gray-900/60 border rounded-xl p-5 transition-all duration-200 hover:transform hover:scale-105 ${feature.highlight ? 'border-blue-400 ring-1 ring-blue-400/50' : 'border-gray-700 hover:border-yellow-500/50'}`}>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-3`} />
                  <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="min-w-full snap-start flex items-center justify-center py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">About AIChecklist</h2>
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              We believe in making productivity accessible to everyone. AIChecklist combines 
              cutting-edge AI technology with intuitive design.
            </p>
            <div className="grid grid-cols-3 gap-8 mb-10">
              <div><div className="text-4xl font-bold text-yellow-400">50K+</div><div className="text-blue-200">Users</div></div>
              <div><div className="text-4xl font-bold text-green-400">1M+</div><div className="text-blue-200">Tasks</div></div>
              <div><div className="text-4xl font-bold text-red-400">99.9%</div><div className="text-blue-200">Uptime</div></div>
            </div>
            <div className="p-8 bg-gray-900/60 rounded-2xl border border-yellow-500/30">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-3">🎁 Our Mission</h3>
              <p className="text-blue-100">Empower individuals and teams through intelligent task management powered by AI.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="min-w-full snap-start flex items-center justify-center py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-3">Simple Pricing</h2>
              <p className="text-lg text-blue-200">Start free, upgrade when you need more</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition-colors">
                <h3 className="text-white font-semibold text-xl">Free</h3>
                <div className="text-4xl font-bold text-white my-4">$0<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 text-gray-300">
                  {['Up to 50 tasks', 'Basic AI', 'Voice commands'].map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" />{f}</li>
                  ))}
                </ul>
                <Button onClick={scrollToSignup} variant="outline" className="w-full mt-6 border-green-500/50 text-green-400 hover:bg-green-500/10">
                  Get Started
                </Button>
              </div>
              <div className="bg-gradient-to-b from-red-900/40 to-green-900/40 border-2 border-yellow-500 rounded-2xl p-6 relative transform scale-105">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  🎄 HOLIDAY SPECIAL
                </span>
                <h3 className="text-white font-semibold text-xl">Pro</h3>
                <div className="text-4xl font-bold text-yellow-400 my-4">$9<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 text-gray-200">
                  {['Unlimited tasks', 'Advanced AI', 'Team collab', 'Analytics'].map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-yellow-400" />{f}</li>
                  ))}
                </ul>
                <Button onClick={scrollToSignup} className="w-full mt-6 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700">
                  Start Free Trial
                </Button>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-colors">
                <h3 className="text-white font-semibold text-xl">Enterprise</h3>
                <div className="text-4xl font-bold text-white my-4">Custom</div>
                <ul className="space-y-3 text-gray-300">
                  {['Everything in Pro', 'SSO', 'Dedicated support'].map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-blue-400" />{f}</li>
                  ))}
                </ul>
                <Button onClick={scrollToSignup} variant="outline" className="w-full mt-6 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section Indicators */}
      <div className="flex justify-center gap-3 py-4 relative z-10">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(index)}
            className={`h-2.5 rounded-full transition-all duration-150 ${
              currentSection === index ? 'bg-yellow-500 w-8' : 'bg-gray-600 w-2.5 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Login/Signup Section */}
      <div ref={signupRef} className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-gray-900/80 border-yellow-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                <span className="text-2xl">🎄</span>
                <span className="text-2xl">🕎</span>
              </div>
              <CardTitle className="text-2xl text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Join the Celebration'}
              </CardTitle>
              <CardDescription className="text-blue-200">
                {authMode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-green-600">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-green-600">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-200">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
                  >
                    {isLoading ? 'Sending...' : 'Send Login Code'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-blue-200">Email Address</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </TabsContent>
              </Tabs>
              
              <div className="text-center mt-6 text-blue-200 text-sm">
                <p>🎁 Special holiday offer: First month free!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-blue-300 text-sm relative z-10">
        <p>AIChecklist.io™ - Wishing you a productive new year! 🎆</p>
      </div>
    </div>
  );
}

export default HolidayAuth;
