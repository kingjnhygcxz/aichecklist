import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";

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

interface PlanInfo {
  name: string;
  displayName: string;
  price: number;
  yearlyPrice?: number;
  priceId: string;
  yearlyPriceId?: string;
  interval: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export function Subscription() {
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const { data: prices, isLoading, error } = useQuery<StripePrice[]>({
    queryKey: ['/api/pricing'],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: 'Subscription successful!',
        description: 'Your subscription has been activated. Thank you for subscribing!',
      });
      window.history.replaceState({}, '', '/pricing');
    } else if (params.get('canceled') === 'true') {
      toast({
        title: 'Checkout canceled',
        description: 'Your checkout was canceled. No charges were made.',
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/pricing');
    }
  }, [toast]);

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const response = await apiRequest('POST', '/api/checkout', { priceId });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast({
        title: 'Checkout Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const parsePlans = (prices: StripePrice[]): PlanInfo[] => {
    const plans: PlanInfo[] = [];
    
    const monthlyPrices = prices.filter(p => p.recurring?.interval === 'month');
    const yearlyPrices = prices.filter(p => p.recurring?.interval === 'year');
    
    // Helper to find yearly price for a product
    const findYearlyPrice = (productName: string): StripePrice | undefined => {
      return yearlyPrices.find(p => {
        const name = p.product?.name?.toLowerCase() || '';
        if (productName === 'pro') {
          return name.includes('pro') && !name.includes('team') && !name.includes('business') && !name.includes('enterprise');
        } else if (productName === 'team') {
          return name.includes('team') || name.includes('business');
        } else if (productName === 'enterprise') {
          return name.includes('enterprise');
        }
        return false;
      });
    };
    
    for (const price of monthlyPrices) {
      const productName = price.product?.name?.toLowerCase() || '';
      
      let planInfo: PlanInfo | null = null;
      
      if (productName.includes('pro') && !productName.includes('team') && !productName.includes('business') && !productName.includes('enterprise')) {
        const yearlyPrice = findYearlyPrice('pro');
        planInfo = {
          name: 'pro',
          displayName: 'Pro',
          price: price.unit_amount / 100,
          yearlyPrice: yearlyPrice ? yearlyPrice.unit_amount / 100 : undefined,
          priceId: price.id,
          yearlyPriceId: yearlyPrice?.id,
          interval: 'month',
          color: 'blue',
          features: [
            'Unlimited tasks',
            'AI-powered task suggestions',
            'Voice commands',
            'Calendar integration',
            'Priority support',
            'Advanced analytics',
          ]
        };
      } else if (productName.includes('team') || productName.includes('business')) {
        const yearlyPrice = findYearlyPrice('team');
        planInfo = {
          name: 'team',
          displayName: 'Team',
          price: price.unit_amount / 100,
          yearlyPrice: yearlyPrice ? yearlyPrice.unit_amount / 100 : undefined,
          priceId: price.id,
          yearlyPriceId: yearlyPrice?.id,
          interval: 'month',
          popular: true,
          color: 'purple',
          features: [
            'Everything in Pro',
            'Team collaboration',
            'Shared checklists',
            'Project charts',
            'Task sharing',
            'Team analytics',
          ]
        };
      } else if (productName.includes('enterprise')) {
        const yearlyPrice = findYearlyPrice('enterprise');
        planInfo = {
          name: 'enterprise',
          displayName: 'Enterprise',
          price: price.unit_amount / 100,
          yearlyPrice: yearlyPrice ? yearlyPrice.unit_amount / 100 : undefined,
          priceId: price.id,
          yearlyPriceId: yearlyPrice?.id,
          interval: 'month',
          color: 'amber',
          features: [
            'Everything in Team',
            'Custom integrations',
            'SSO authentication',
            'Dedicated support',
            'Custom workflows',
            'SLA guarantee',
            'Min. 2 seats/month',
          ]
        };
      }
      
      if (planInfo && !plans.find(p => p.name === planInfo!.name)) {
        plans.push(planInfo);
      }
    }
    
    return plans.sort((a, b) => a.price - b.price);
  };

  const plans = prices ? parsePlans(prices) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container pt-0 pb-10 mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="gap-2"
              data-testid="button-back-to-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="pricing-heading">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the plan that works best for you. All plans include a free trial.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6" data-testid="billing-toggle">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              data-testid="switch-billing-cycle"
            />
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <span className="ml-1 text-xs text-green-500 font-semibold">(Save 20%)</span>
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12" data-testid="pricing-loading">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500" data-testid="pricing-error">
            Failed to load pricing. Please try again later.
          </div>
        )}

        {plans.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" data-testid="pricing-grid">
            {plans.map((plan) => {
              const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice !== undefined 
                ? plan.yearlyPrice 
                : plan.price;
              const displayInterval = billingCycle === 'yearly' ? 'year' : 'month';
              const activePriceId = billingCycle === 'yearly' && plan.yearlyPriceId 
                ? plan.yearlyPriceId 
                : plan.priceId;
              const hasYearlyPrice = plan.yearlyPrice !== undefined && plan.yearlyPriceId;
              
              return (
                <Card 
                  key={plan.name} 
                  className={`relative ${plan.popular ? 'border-purple-500 border-2 shadow-lg' : ''}`}
                  data-testid={`pricing-card-${plan.name}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">${displayPrice}</span>
                      <span className="text-muted-foreground">/{displayInterval}</span>
                      {billingCycle === 'yearly' && hasYearlyPrice && (
                        <div className="text-xs text-green-500 mt-1">
                          Save ${Math.round(plan.price * 12 - plan.yearlyPrice!)} per year
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className={`h-4 w-4 text-${plan.color}-500 flex-shrink-0`} />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                      onClick={() => handleCheckout(activePriceId)}
                      disabled={checkoutLoading === activePriceId || (billingCycle === 'yearly' && !hasYearlyPrice)}
                      data-testid={`button-subscribe-${plan.name}-${billingCycle}`}
                    >
                      {checkoutLoading === activePriceId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {checkoutLoading === activePriceId 
                        ? 'Loading...' 
                        : (billingCycle === 'yearly' && !hasYearlyPrice)
                          ? 'Yearly Not Available'
                          : 'Start Free Trial'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && plans.length === 0 && !error && (
          <div className="text-center py-12 text-muted-foreground" data-testid="pricing-empty">
            No pricing plans available at this time.
          </div>
        )}
        
        
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">What happens after my free trial?</h3>
              <p className="text-muted-foreground">After your trial ends, you'll be charged the plan rate unless you cancel. We'll send a reminder before your trial ends.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Can I change plans?</h3>
              <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the end of your current billing period.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">How do I cancel my subscription?</h3>
              <p className="text-muted-foreground">You can cancel your subscription anytime from your account settings. If you cancel during your trial period, you won't be charged.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">What's the minimum for Enterprise?</h3>
              <p className="text-muted-foreground">Enterprise plans require a minimum of 2 seats per month. This is ideal for teams who need advanced collaboration features and priority support.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Subscription;
