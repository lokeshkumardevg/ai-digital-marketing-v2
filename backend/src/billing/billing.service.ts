import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  // Hardcoded SaaS pricing tiers config
  public readonly PLANS = {
    free: { name: 'Hobbyist', price: 0, limit: 10000 },
    pro: { name: 'Growth Pro', price: 99, limit: 250000 },
    enterprise: { name: 'Enterprise Matrix', price: 499, limit: 2000000 }
  };

  constructor(
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
  ) {}

  async getSubscription(tenantId: string = 'default_tenant'): Promise<SubscriptionDocument> {
    let sub = await this.subModel.findOne({ tenantId }).exec();
    
    // Auto-provision a free tier for new tenants
    if (!sub) {
      sub = new this.subModel({
        tenantId,
        plan: 'free',
        aiTokenLimit: this.PLANS.free.limit,
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
      });
      await sub.save();
    }
    
    return sub;
  }

  async trackTokenUsage(tokens: number, tenantId: string = 'default_tenant'): Promise<boolean> {
    const sub = await this.getSubscription(tenantId);
    
    if (sub.aiTokensUsedCurrentBillingCycle + tokens > sub.aiTokenLimit) {
      throw new HttpException('Token limit exceeded for current plan. Please upgrade.', HttpStatus.PAYMENT_REQUIRED);
    }

    sub.aiTokensUsedCurrentBillingCycle += tokens;
    await sub.save();
    return true;
  }

  /**
   * Generates a secure checkout link simulating Stripe/Razorpay session
   */
  async createCheckoutSession(planId: string, tenantId: string = 'default_tenant'): Promise<{ checkoutUrl: string }> {
    this.logger.log(`Initiating checkout session for Tenant ${tenantId} -> Plan: ${planId}`);
    
    if (!this.PLANS[planId as keyof typeof this.PLANS]) {
      throw new HttpException('Invalid Plan Selection', HttpStatus.BAD_REQUEST);
    }

    // Mock delay for external gateway API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In production, this returns a Stripe Checkout URL
    return { checkoutUrl: `https://nexus.ai/checkout/mock-session?plan=${planId}&session=${Math.random().toString(36).substring(7)}` };
  }

  /**
   * Webhook handler simulating successful payment completion
   */
  async processPaymentSuccessWebhook(tenantId: string, newPlanId: string): Promise<Subscription> {
    this.logger.log(`Processing successful webhook upgrade -> ${newPlanId}`);
    
    const sub = await this.getSubscription(tenantId);
    sub.plan = newPlanId;
    sub.aiTokenLimit = this.PLANS[newPlanId as keyof typeof this.PLANS].limit;
    sub.aiTokensUsedCurrentBillingCycle = 0; // Reset on upgrade
    sub.currentPeriodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1));
    
    return await sub.save();
  }
}
