import { useQuery } from "@tanstack/react-query";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  success: boolean;
  status: string;
  planId?: string;
}

interface FeatureGateProps {
  feature: string;
  requiredPlan?: 'pro' | 'team';
  children: React.ReactNode;
  showLockedUI?: boolean;
}

// Helper function to redirect to Stripe checkout for a specific plan
async function redirectToCheckout(plan: 'pro' | 'team'): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiRequest('POST', '/api/stripe/checkout-by-plan', { plan });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
      return { success: true };
    }
    return { success: false, error: data.error || 'Failed to create checkout session' };
  } catch (error) {
    return { success: false, error: 'Failed to connect to payment system' };
  }
}

export function FeatureGate({ feature, requiredPlan = 'pro', children, showLockedUI = true }: FeatureGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscriptions/status"],
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 60 * 1000, // 1 minute for faster updates after upgrades
  });

  const userPlan = subscription?.planId || subscription?.status || 'free';
  
  const planHierarchy: Record<string, number> = {
    'free': 0,
    'trial': 1,
    'pro': 2,
    'team': 3,
  };

  const userPlanLevel = planHierarchy[userPlan] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 2;
  
  const hasAccess = userPlanLevel >= requiredLevel;

  const handleUpgrade = async () => {
    setIsLoading(true);
    const result = await redirectToCheckout(requiredPlan);
    if (!result.success) {
      toast({
        title: "Upgrade failed",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showLockedUI) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group cursor-not-allowed" data-testid={`feature-gate-${feature}`}>
            <div className="opacity-50 pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-center p-3">
                <Lock className="h-5 w-5 text-white mx-auto mb-1" />
                <p className="text-xs text-white font-medium">{requiredPlan === 'team' ? 'Team' : 'Pro'} Feature</p>
                <Button 
                  size="sm" 
                  className="mt-2 h-7 text-xs"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  data-testid={`upgrade-btn-${feature}`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  {isLoading ? 'Loading...' : 'Upgrade'}
                </Button>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upgrade to {requiredPlan === 'team' ? 'Team' : 'Pro'} to unlock {feature}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function LockedFeatureBadge({ feature, requiredPlan = 'pro' }: { feature: string; requiredPlan?: 'pro' | 'team' }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscriptions/status"],
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 60 * 1000,
  });

  const userPlan = subscription?.planId || subscription?.status || 'free';
  
  const planHierarchy: Record<string, number> = {
    'free': 0,
    'trial': 1,
    'pro': 2,
    'team': 3,
  };

  const userPlanLevel = planHierarchy[userPlan] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 2;
  
  if (userPlanLevel >= requiredLevel) {
    return null;
  }

  const handleUpgrade = async () => {
    setIsLoading(true);
    const result = await redirectToCheckout(requiredPlan);
    if (!result.success) {
      toast({
        title: "Upgrade failed",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      disabled={isLoading}
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
      data-testid={`locked-badge-${feature}`}
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
      <span>{isLoading ? 'Loading...' : (requiredPlan === 'team' ? 'Team' : 'Pro')}</span>
    </button>
  );
}

export function useFeatureAccess() {
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscriptions/status"],
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 60 * 1000,
  });

  const userPlan = subscription?.planId || subscription?.status || 'free';
  
  const planHierarchy: Record<string, number> = {
    'free': 0,
    'trial': 1,
    'pro': 2,
    'team': 3,
  };

  const userPlanLevel = planHierarchy[userPlan] ?? 0;

  return {
    plan: userPlan,
    isPro: userPlanLevel >= 2,
    isTeam: userPlanLevel >= 3,
    isTrial: subscription?.status === 'trial',
    hasFeature: (requiredPlan: 'pro' | 'team') => {
      const requiredLevel = planHierarchy[requiredPlan] ?? 2;
      return userPlanLevel >= requiredLevel;
    }
  };
}
