import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Logo from "@/components/Logo";
import { 
  Users, 
  Trophy, 
  Zap, 
  Crown, 
  Star, 
  Target, 
  Sparkles, 
  Share2, 
  Copy, 
  CheckCircle, 
  Gift,
  TrendingUp,
  Award,
  Rocket,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RobotGreenBlack1 } from "@/components/icons/RobotIcons";

interface WaitlistUser {
  position: number;
  referrals: number;
  level: string;
  nextReward: string;
  referralCode: string;
}

export function WaitlistLanding() {
  const [email, setEmail] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [userStats, setUserStats] = useState<WaitlistUser | null>(null);
  const [totalUsers, setTotalUsers] = useState(15847);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Mock leaderboard data
  const leaderboard = [
    { name: "Alex M.", referrals: 47, badge: "🥇 Gold Champion" },
    { name: "Sarah K.", referrals: 39, badge: "🥈 Silver Elite" },
    { name: "Mike R.", referrals: 32, badge: "🥉 Bronze Master" },
    { name: "Emma L.", referrals: 28, badge: "⭐ Rising Star" },
    { name: "David P.", referrals: 24, badge: "🚀 Growth Hacker" }
  ];

  // Gamification levels
  const levels = [
    { name: "Newcomer", minReferrals: 0, reward: "ADHD-Friendly Theme", color: "bg-gray-500" },
    { name: "Sharer", minReferrals: 3, reward: "Early Access (1 week)", color: "bg-blue-500" },
    { name: "Connector", minReferrals: 8, reward: "Premium Features (3 months)", color: "bg-purple-500" },
    { name: "Influencer", minReferrals: 15, reward: "Lifetime Premium", color: "bg-yellow-500" },
    { name: "Champion", minReferrals: 25, reward: "Beta Tester + Recognition", color: "bg-green-500" }
  ];

  const getCurrentLevel = (referrals: number) => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (referrals >= levels[i].minReferrals) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const getNextLevel = (referrals: number) => {
    for (let i = 0; i < levels.length; i++) {
      if (referrals < levels[i].minReferrals) {
        return levels[i];
      }
    }
    return null;
  };

  const handleSignup = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: WaitlistUser = {
      position: Math.floor(Math.random() * 5000) + 1000,
      referrals: 0,
      level: "Newcomer",
      nextReward: "ADHD-Friendly Theme",
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    setUserStats(mockUser);
    setShareUrl(`https://aichecklist.io/join?ref=${mockUser.referralCode}`);
    setIsSignedUp(true);
    
    toast({
      title: "Welcome to the Waitlist! 🎉",
      description: `You're #${mockUser.position} in line. Share to move up faster!`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied!",
        description: "Share this link to move up in line. Each friend = +100 spots!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const progressToNext = userStats ? 
    (getNextLevel(userStats.referrals) ? 
      (userStats.referrals / getNextLevel(userStats.referrals)!.minReferrals) * 100 : 100) : 0;

  if (isSignedUp && userStats) {
    const currentLevel = getCurrentLevel(userStats.referrals);
    const nextLevel = getNextLevel(userStats.referrals);

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border py-4 px-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Logo className="mr-3" />
              <h1 className="text-xl font-semibold tracking-tight">AICHECKLIST</h1>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <Users className="w-4 h-4 mr-2" />
              {totalUsers.toLocaleString()} joined
            </Badge>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Status Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RobotGreenBlack1 size={48} />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">You're In! 🎉</h1>
                <p className="text-muted-foreground text-lg">Welcome to the AIChecklist.io community</p>
              </div>
            </div>
            
            {/* Position Counter */}
            <Card className="max-w-md mx-auto mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    #{userStats.position.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">Your position in line</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Each referral = +100 spots</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress & Level */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${currentLevel.color}`}></div>
                    <span className="font-semibold">{currentLevel.name}</span>
                    <Badge variant="outline">{userStats.referrals} referrals</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reward: {currentLevel.reward}
                  </div>
                </div>

                {/* Progress Bar */}
                {nextLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextLevel.name}</span>
                      <span>{userStats.referrals}/{nextLevel.minReferrals}</span>
                    </div>
                    <Progress value={progressToNext} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      Next reward: {nextLevel.reward}
                    </p>
                  </div>
                )}

                {/* Level Timeline */}
                <div className="space-y-3">
                  <h4 className="font-semibold">All Levels & Rewards</h4>
                  {levels.map((level, index) => (
                    <div key={level.name} className={`flex items-center gap-3 p-3 rounded-lg border ${
                      userStats.referrals >= level.minReferrals ? 'bg-primary/10 border-primary' : 'bg-muted/30'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{level.name}</span>
                          {userStats.referrals >= level.minReferrals && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {level.minReferrals} referrals → {level.reward}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <div className="space-y-6">
              {/* Share Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share & Win
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Share your unique link to move up faster. Each friend who joins moves you up 100 spots!
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Referral Link</label>
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="flex-1" />
                      <Button onClick={handleShare} size="sm">
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user, index) => (
                      <div key={user.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{user.referrals}</div>
                          <div className="text-xs text-muted-foreground">{user.badge}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What's Coming */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                What You're Waiting For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">ADHD-Optimized Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Purpose-built for neurodivergent minds with focus-friendly features
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    AIDOMO learns your patterns and optimizes your productivity
                  </p>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Gamified Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn productivity into an engaging game with rewards and achievements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Initial signup form
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="mr-3" />
            <h1 className="text-xl font-semibold tracking-tight">AICHECKLIST</h1>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            <Users className="w-4 h-4 mr-2" />
            {totalUsers.toLocaleString()} joined
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <RobotGreenBlack1 size={64} />
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                The Future of
                <span className="text-primary"> ADHD-Friendly</span>
                <br />Task Management
              </h1>
              <p className="text-xl text-muted-foreground">
                Join the waitlist for AIChecklist.io + AIDOMO - where productivity meets neurodivergent-friendly design
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">People Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2025</div>
              <div className="text-sm text-muted-foreground">Launch Year</div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="max-w-lg mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              Join the Movement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleSignup} className="w-full" size="lg">
                <Rocket className="w-4 h-4 mr-2" />
                Reserve My Spot
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Join for free early access, exclusive features, and ADHD-optimized productivity tools
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">ADHD-Optimized</h3>
              <p className="text-sm text-muted-foreground">
                Built specifically for neurodivergent minds with focus-friendly interfaces and dopamine-driven rewards
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">AIDOMO AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Your personal AI productivity coach that learns your patterns and optimizes your workflow
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Gamified Progress</h3>
              <p className="text-sm text-muted-foreground">
                Turn your tasks into an engaging game with achievements, levels, and meaningful rewards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Early Bird Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Early Bird Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Lifetime 50% discount on premium features</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Exclusive ADHD-friendly themes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Beta access to AIDOMO AI features</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Direct input on feature development</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}