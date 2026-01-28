import Logo from "../Logo";
import { Moon, Sun, Settings, CreditCard, LogOut, MessageSquare, Trophy, BarChart2, Calendar, Network, BarChart3, Shield, Eye, Bot, Menu, X, Home, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/context/ThemeContext";
import { useColorOverlay } from "@/context/ColorOverlayContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { InboxBadge } from "@/components/notifications/InboxBadge";
import { SuperHeroPanel } from "@/components/ui/SuperHeroPanel";
import { useState } from "react";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { VoiceCommandButton } from "@/components/task/VoiceCommandButton";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
// import { SuperPowersMenu } from "@/components/SuperPowersMenu";

// Founder badge component - displays golden sunburst badge for founder accounts
function FounderBadge() {
  return (
    <div className="h-16 w-16 flex-shrink-0 ml-3" title="Founder">
      <svg viewBox="0 0 100 100" className="h-16 w-16">
        {/* Outer rays */}
        <g fill="#C9A227" stroke="#C9A227" strokeWidth="1">
          {[...Array(16)].map((_, i) => (
            <polygon
              key={i}
              points="50,5 52,35 48,35"
              transform={`rotate(${i * 22.5} 50 50)`}
            />
          ))}
        </g>
        {/* Inner circle background */}
        <circle cx="50" cy="50" r="25" fill="#1a1a1a" stroke="#C9A227" strokeWidth="3"/>
        {/* Inner gold ring */}
        <circle cx="50" cy="50" r="20" fill="none" stroke="#C9A227" strokeWidth="2"/>
        {/* Crown */}
        <path d="M38 42 L42 48 L46 44 L50 50 L54 44 L58 48 L62 42 L60 52 L40 52 Z" fill="white"/>
        {/* FOUNDER text */}
        <text x="50" y="62" textAnchor="middle" fill="#C9A227" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">FOUNDER</text>
        {/* Bottom lines */}
        <g stroke="#C9A227" strokeWidth="1.5">
          <line x1="40" y1="66" x2="40" y2="72"/>
          <line x1="44" y1="66" x2="44" y2="72"/>
          <line x1="48" y1="66" x2="48" y2="72"/>
          <line x1="52" y1="66" x2="52" y2="72"/>
          <line x1="56" y1="66" x2="56" y2="72"/>
          <line x1="60" y1="66" x2="60" y2="72"/>
        </g>
      </svg>
    </div>
  );
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { overlayColor, setOverlayColor } = useColorOverlay();
  
  // Check if user is a founder
  const { data: user } = useQuery<{ customerType?: string }>({
    queryKey: ['/api/user'],
  });
  const isFounder = user?.customerType === 'founder';
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSuperherosPanelOpen, setIsSuperherosPanelOpen] = useState(false);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { browserSupportsSpeechRecognition } = useVoiceCommands();

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      // Clear session token from localStorage
      localStorage.removeItem('sessionId');
      // Clear all cached data to prevent stale data from previous user session
      queryClient.clear();
      toast({
        title: "Logout Successful",
        description: "You have been logged out successfully",
      });
      setLocation('/auth');
    } catch (error) {
      // Clear session token even if logout request fails
      localStorage.removeItem('sessionId');
      // Clear all cached data even on error
      queryClient.clear();
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
      setLocation('/auth');
    }
  };
  
  return (
    <header className="border-b border-border py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Logo className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-semibold tracking-tight">AIChecklist</h1>
        </Link>
        {isFounder && <FounderBadge />}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Project Charts
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/pricing">
            <CreditCard className="h-4 w-4 mr-2" />
            Pricing
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Link>
        </Button>
        
        {/* Mobile Menu - Hamburger button and slide-out sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Open menu" 
              className="sm:hidden"
              data-testid="mobile-menu-trigger"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[280px] p-0 border-r-0 shadow-2xl bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="px-5 py-4 border-b border-border/50">
                <SheetTitle className="flex items-center gap-2.5 text-lg font-semibold">
                  <Logo className="h-7 w-7" />
                  <span>AIChecklist</span>
                  {isFounder && <FounderBadge />}
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex-1 overflow-y-auto py-3" data-testid="mobile-nav-menu">
                <div className="px-3 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 px-2">
                    Main
                  </span>
                </div>
                <div className="space-y-0.5 px-2">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <Home className="h-[18px] w-[18px] text-muted-foreground" />
                      Home
                    </button>
                  </Link>
                  <Link href="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <Calendar className="h-[18px] w-[18px] text-muted-foreground" />
                      Calendar
                    </button>
                  </Link>
                  <Link href="/charts" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <BarChart3 className="h-[18px] w-[18px] text-muted-foreground" />
                      Project Charts
                    </button>
                  </Link>
                  <Link href="/reports" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <FileText className="h-[18px] w-[18px] text-muted-foreground" />
                      Reports
                    </button>
                  </Link>
                </div>

                <div className="px-3 mt-5 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 px-2">
                    Account
                  </span>
                </div>
                <div className="space-y-0.5 px-2">
                  <Link href="/achievements" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <Trophy className="h-[18px] w-[18px] text-muted-foreground" />
                      Achievements
                    </button>
                  </Link>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <CreditCard className="h-[18px] w-[18px] text-muted-foreground" />
                      Pricing
                    </button>
                  </Link>
                  <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <Settings className="h-[18px] w-[18px] text-muted-foreground" />
                      Settings
                    </button>
                  </Link>
                </div>

                <div className="px-3 mt-5 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 px-2">
                    Support
                  </span>
                </div>
                <div className="space-y-0.5 px-2">
                  <Link href="/feedback" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <MessageSquare className="h-[18px] w-[18px] text-muted-foreground" />
                      Feedback
                    </button>
                  </Link>
                  <Link href="/help" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                      <HelpCircle className="h-[18px] w-[18px] text-muted-foreground" />
                      Help Center
                    </button>
                  </Link>
                </div>
              </nav>

              <div className="mt-auto border-t border-border/50 p-3">
                <button 
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Sign Out
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>


        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Super Heros" 
          title="super heros" 
          className="hover:text-yellow-400 transition-colors"
          onClick={() => setIsSuperherosPanelOpen(true)}
        >
          <Shield className="h-5 w-5 text-muted-foreground hover:text-yellow-400" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle Accessibility Mode" 
          title={overlayColor === 'braille' ? "Turn off Accessibility Mode" : "Turn on Accessibility Mode"} 
          className={`hover:text-blue-400 transition-colors ${overlayColor === 'braille' ? 'bg-blue-100 text-blue-600' : ''}`}
          onClick={() => setOverlayColor(overlayColor === 'braille' ? 'none' : 'braille')}
        >
          <Eye className={`h-5 w-5 ${overlayColor === 'braille' ? 'text-blue-600' : 'text-muted-foreground hover:text-blue-400'}`} />
        </Button>
        
        <Button variant="ghost" size="icon" aria-label="Settings" title="Settings" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </Button>

        {/* Voice Command Button - Moved to Header */}
        {browserSupportsSpeechRecognition && (
          <div className="transition-all duration-200">
            <VoiceCommandButton />
          </div>
        )}

        <InboxBadge />
        <NotificationBell />
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle theme"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-muted-foreground theme-toggle-icon" />
          ) : (
            <Moon className="h-5 w-5 text-muted-foreground theme-toggle-icon" />
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      {/* Super Hero Panel */}
      <SuperHeroPanel 
        isOpen={isSuperherosPanelOpen}
        onClose={() => setIsSuperherosPanelOpen(false)}
      />
      
      {/* Accessibility Panel */}
      <AccessibilityPanel 
        isOpen={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
      />
    </header>
  );
}

export default Header;
