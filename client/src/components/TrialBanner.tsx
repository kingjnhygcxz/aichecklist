import { useQuery } from "@tanstack/react-query";
import { Clock, Sparkles, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  success: boolean;
  status: string;
  planId?: string;
  trialEndsAt?: string;
  daysRemaining?: number;
  message?: string;
}

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscriptions/status"],
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 5 * 60 * 1000,
  });

  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (subscription?.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays > 0 ? diffDays : 0);
    } else if (subscription?.daysRemaining !== undefined) {
      setDaysRemaining(subscription.daysRemaining);
    }
  }, [subscription?.trialEndsAt, subscription?.daysRemaining]);

  if (dismissed) return null;
  
  const isOnTrial = subscription?.status === 'trial' || 
                    (subscription?.trialEndsAt && daysRemaining !== null && daysRemaining > 0);
  
  if (!isOnTrial || daysRemaining === null) return null;

  const urgencyClass = daysRemaining <= 3 
    ? 'bg-gradient-to-r from-orange-500 to-red-500' 
    : 'bg-gradient-to-r from-blue-500 to-purple-500';

  // Determine which plan to upgrade to based on current trial
  // Check planId first, then fall back to status for team/enterprise detection
  const planInfo = subscription?.planId?.toLowerCase() || subscription?.status?.toLowerCase() || '';
  const upgradePlan = (planInfo.includes('team') || planInfo.includes('enterprise') || planInfo.includes('business')) ? 'team' : 'pro';

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/checkout-by-plan', { plan: upgradePlan });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: error instanceof Error ? error.message : 'Failed to connect to payment system',
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={`${urgencyClass} text-white py-2 px-4 flex items-center justify-center gap-3 relative`} data-testid="trial-banner">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">
        {daysRemaining === 1 
          ? "Your trial ends tomorrow!" 
          : `${daysRemaining} days left in your ${subscription?.planId || 'Pro'} trial`}
      </span>
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-7 text-xs"
        onClick={handleUpgrade}
        disabled={isLoading}
        data-testid="trial-upgrade-button"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1" />
        )}
        {isLoading ? 'Loading...' : 'Upgrade Now'}
      </Button>
      <button 
        onClick={() => setDismissed(true)} 
        className="absolute right-2 p-1 hover:bg-white/20 rounded"
        aria-label="Dismiss banner"
        data-testid="trial-dismiss-button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
