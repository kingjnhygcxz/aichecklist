import Stripe from 'stripe';
import { logger } from './logger';
import { db } from './db';
import { users, subscriptionPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';

// For our demo purposes, we'll create a simplified version
// that will work even without Stripe API keys
export class StripeService {
  private stripeInstance: Stripe | null = null;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.STRIPE_SECRET_KEY;
    
    if (this.isConfigured) {
      try {
        this.stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2023-10-16' as any,
        });
        logger.info('Stripe initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Stripe', { error });
        this.isConfigured = false;
      }
    } else {
      // Note: This is the legacy Stripe service. The primary Stripe integration
      // uses Replit's connected Stripe account via stripeClient.ts
      logger.info('Legacy StripeService running in fallback mode - primary Stripe uses Replit connection');
    }
  }

  // Mock the customers.create method
  async createCustomer(params: any): Promise<any> {
    if (!this.isConfigured) {
      logger.info('Using mock Stripe customer creation', { params });
      return {
        id: `cus_mock_${Date.now()}`,
        name: params.name,
        email: params.email,
        metadata: params.metadata,
      };
    }
    
    return this.stripeInstance!.customers.create(params);
  }
  
  // Mock the subscriptions.create method
  async createSubscription(params: any): Promise<any> {
    if (!this.isConfigured) {
      logger.info('Using mock Stripe subscription creation', { params });
      return {
        id: `sub_mock_${Date.now()}`,
        status: 'active',
        customer: params.customer,
        trial_end: Math.floor(Date.now() / 1000) + (params.trial_period_days * 24 * 60 * 60), // Plan-specific trial period
        latest_invoice: {
          payment_intent: {
            client_secret: 'mock_client_secret',
          },
        },
      };
    }
    
    return this.stripeInstance!.subscriptions.create(params);
  }
  
  // Mock the subscriptions.retrieve method
  async retrieveSubscription(id: string): Promise<any> {
    if (!this.isConfigured) {
      logger.info('Using mock Stripe subscription retrieval', { id });
      return {
        id,
        status: 'active',
        cancel_at_period_end: false,
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        trial_end: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // Default trial period for retrieval
      };
    }
    
    return this.stripeInstance!.subscriptions.retrieve(id);
  }
  
  // Mock the subscriptions.update method
  async updateSubscription(id: string, params: any): Promise<any> {
    if (!this.isConfigured) {
      logger.info('Using mock Stripe subscription update', { id, params });
      return {
        id,
        status: 'active',
        cancel_at_period_end: params.cancel_at_period_end || false,
      };
    }
    
    return this.stripeInstance!.subscriptions.update(id, params);
  }
}

// Create and export a single instance of the service
export const stripe = new StripeService();

// Create a Stripe customer for a user
export async function createStripeCustomer(user: { id: number; username: string; email?: string | null }) {
  try {
    const customerData = {
      name: user.username,
      metadata: {
        userId: user.id.toString(),
      },
    } as any;

    // Add email if available
    if (user.email) {
      customerData.email = user.email;
    }

    // Use our mock-capable Stripe service
    const customer = await stripe.createCustomer(customerData);

    logger.info('Created Stripe customer', { userId: user.id, stripeCustomerId: customer.id });

    // Update user with Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, user.id));

    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer', { error, userId: user.id });
    
    // Create a mock customer in case of error
    const mockCustomer = {
      id: `cus_mock_${Date.now()}`,
      name: user.username,
      email: user.email,
      metadata: {
        userId: user.id.toString(),
      },
    };
    
    logger.info('Created mock Stripe customer due to error', { 
      userId: user.id, 
      stripeCustomerId: mockCustomer.id 
    });
    
    // Update user with mock Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: mockCustomer.id })
      .where(eq(users.id, user.id));
    
    return mockCustomer;
  }
}

// Start a plan-specific free trial for a user
export async function startFreeTrial(userId: number, planId?: number) {
  try {
    let trialDays = 7; // Default for free accounts
    
    if (planId) {
      // Get the subscription plan to determine trial period
      const [plan] = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));
      
      if (plan) {
        trialDays = plan.trialDays;
      }
    }

    // Calculate trial end date based on plan
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Update user with trial end date
    await db.update(users)
      .set({ 
        subscriptionStatus: 'trial',
        trialEndsAt
      })
      .where(eq(users.id, userId));

    logger.info('Started free trial for user', { 
      userId, 
      trialDays, 
      planId: planId || 'free', 
      trialEndsAt 
    });

    return { success: true, trialEndsAt, trialDays };
  } catch (error) {
    logger.error('Failed to start free trial', { error, userId, planId });
    throw error;
  }
}

// Create a subscription for a user
export async function createSubscription(userId: number, planId: number) {
  try {
    // Get the user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get the subscription plan
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    if (!plan.stripePriceId) {
      throw new Error(`Subscription plan has no Stripe Price ID: ${planId}`);
    }

    if (!user.stripeCustomerId) {
      // Create a Stripe customer if one doesn't exist
      const customer = await createStripeCustomer(user);
      if (!customer) {
        throw new Error(`Failed to create Stripe customer for user: ${userId}`);
      }
      user.stripeCustomerId = customer.id;
    }

    // Create the subscription with Stripe using plan-specific trial period
    const subscription = await stripe.createSubscription({
      customer: user.stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trialDays, // Plan-specific trial period
    });

    // Update user with subscription ID and status
    await db.update(users)
      .set({ 
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status
      })
      .where(eq(users.id, userId));

    logger.info('Created subscription with plan-specific trial', { 
      userId, 
      planId,
      trialDays: plan.trialDays,
      subscriptionId: subscription.id
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: ((subscription.latest_invoice as any)?.payment_intent as any)?.client_secret,
    };
  } catch (error) {
    logger.error('Failed to create subscription', { error, userId, planId });
    throw error;
  }
}

// Get user subscription details
export async function getUserSubscription(userId: number) {
  try {
    // Get the user with subscription info
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (!user.stripeSubscriptionId) {
      return {
        status: user.subscriptionStatus || 'free',
        trialEndsAt: user.trialEndsAt,
        planId: user.subscriptionPlan || 'free',
      };
    }

    // Get the subscription from Stripe for the latest data
    const subscription = await stripe.retrieveSubscription(user.stripeSubscriptionId);

    // Update the subscription status in our database
    if (subscription.status !== user.subscriptionStatus) {
      await db.update(users)
        .set({ subscriptionStatus: subscription.status })
        .where(eq(users.id, userId));
    }

    return {
      status: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEndsAt: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000) 
        : user.trialEndsAt,
      planId: user.subscriptionPlan || 'free',
    };
  } catch (error) {
    logger.error('Failed to get user subscription', { error, userId });
    
    // Return a fallback status if Stripe API fails
    return {
      status: 'unknown',
      error: 'Could not retrieve the latest subscription details'
    };
  }
}

// Cancel a subscription
export async function cancelSubscription(userId: number) {
  try {
    // Get the user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.stripeSubscriptionId) {
      throw new Error(`User not found or has no subscription: ${userId}`);
    }

    // Cancel the subscription with Stripe (at period end)
    const subscription = await stripe.updateSubscription(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info('Subscription canceled (at period end)', { 
      userId,
      subscriptionId: subscription.id
    });

    return { success: true, subscription };
  } catch (error) {
    logger.error('Failed to cancel subscription', { error, userId });
    throw error;
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const [user] = await db.select()
          .from(users)
          .where(eq(users.stripeSubscriptionId, subscription.id));
        
        if (user) {
          // Update the user's subscription status
          await db.update(users)
            .set({ subscriptionStatus: subscription.status })
            .where(eq(users.id, user.id));
            
          logger.info('Updated user subscription status from webhook', {
            userId: user.id,
            subscriptionId: subscription.id,
            status: subscription.status
          });
        }
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          logger.info('Successfully processed subscription payment', {
            subscriptionId: invoice.subscription,
            amount: invoice.amount_paid
          });
        }
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any;
        if (failedInvoice.subscription) {
          logger.warn('Failed subscription payment', {
            subscriptionId: failedInvoice.subscription,
            amount: failedInvoice.amount_due
          });
          
          // Here you might want to notify the user about the failed payment
        }
        break;
        
      default:
        logger.debug(`Unhandled Stripe webhook event type: ${event.type}`);
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error handling Stripe webhook', { error, eventType: event.type });
    throw error;
  }
}