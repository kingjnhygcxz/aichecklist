import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    yearlySavings: 24,
    features: ['Unlimited AIDOMO responses', 'All templates', 'Voice commands', 'Priority support'],
    color: 'blue',
    priceId: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    }
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 29.99,
    yearlyPrice: 23.99,
    yearlySavings: 72,
    features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard', 'API access'],
    color: 'purple',
    popular: true,
    priceId: {
      monthly: 'price_team_monthly',
      yearly: 'price_team_yearly'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99.99,
    yearlyPrice: 79.99,
    yearlySavings: 240,
    features: ['Everything in Team', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    color: 'green',
    priceId: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    }
  }
];

export function TrialExpiredModal({ isOpen, onClose, feature = 'this feature' }: TrialExpiredModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(planId);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const priceId = billingCycle === 'yearly' ? plan.priceId.yearly : plan.priceId.monthly;
      
      // Get session token from localStorage for authentication
      const sessionId = localStorage.getItem('sessionId');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['Authorization'] = `Bearer ${sessionId}`;
      }
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          priceId,
          planId,
          billingCycle 
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to start checkout',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to payment system',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Crown className="h-10 w-10 text-amber-500" />
          </div>
          <DialogTitle className="text-xl">Your Trial Has Expired</DialogTitle>
          <DialogDescription className="text-sm">
            Upgrade now to continue using {feature} and unlock all premium features. Your work is safe and will be accessible once you subscribe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-3">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
            className="text-xs"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('yearly')}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            Yearly <span className="ml-1 text-[10px] opacity-80">Save 20%</span>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const colorClasses = {
              blue: 'border-blue-500/50 hover:border-blue-500',
              purple: 'border-purple-500/50 hover:border-purple-500',
              amber: 'border-amber-500/50 hover:border-amber-500',
              green: 'border-green-500/50 hover:border-green-500'
            };
            const buttonClasses = {
              blue: 'bg-blue-600 hover:bg-blue-700',
              purple: 'bg-purple-600 hover:bg-purple-700',
              amber: 'bg-amber-600 hover:bg-amber-700',
              green: 'bg-green-600 hover:bg-green-700'
            };

            return (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-3 transition-all ${colorClasses[plan.color as keyof typeof colorClasses]} ${plan.popular ? 'ring-1 ring-purple-500/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full">Popular</span>
                  </div>
                )}
                <h3 className="font-bold text-center text-sm">{plan.name}</h3>
                <div className="text-center my-2">
                  <span className="text-xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                  {billingCycle === 'yearly' && (
                    <div className="text-[10px] text-green-500">Save ${plan.yearlySavings}/yr</div>
                  )}
                </div>
                <ul className="space-y-1 mb-3 text-[10px]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1 text-muted-foreground">
                      <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className={`w-full h-7 text-xs ${buttonClasses[plan.color as keyof typeof buttonClasses]}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? (
                    <Zap className="h-3 w-3 animate-pulse" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
