import { useQuery } from '@tanstack/react-query';

interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  status: 'free' | 'trial' | 'active' | 'paid' | 'canceled';
  trialEndsAt: string | null;
  daysRemaining: number | null;
}

export function useTrialStatus() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const getTrialStatus = (): TrialStatus => {
    if (!user) {
      return {
        isActive: false,
        isExpired: false,
        status: 'free',
        trialEndsAt: null,
        daysRemaining: null
      };
    }

    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const status = user.subscriptionStatus || 'free';
    
    const hasActiveSubscription = status === 'active' || status === 'paid';
    const hasActiveTrial = status === 'trial' && trialEndsAt && trialEndsAt > now;
    const isTrialExpired = status === 'trial' && trialEndsAt && trialEndsAt <= now;
    
    let daysRemaining: number | null = null;
    if (hasActiveTrial && trialEndsAt) {
      daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      isActive: hasActiveSubscription || hasActiveTrial,
      isExpired: isTrialExpired || false,
      status,
      trialEndsAt: user.trialEndsAt,
      daysRemaining
    };
  };

  return {
    ...getTrialStatus(),
    isLoading,
    user
  };
}
