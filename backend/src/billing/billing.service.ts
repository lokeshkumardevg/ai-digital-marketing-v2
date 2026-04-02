import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

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
    @InjectModel(Transaction.name) private txnModel: Model<TransactionDocument>,
  ) {}

  // --- WALLET SYSTEM logic ---
  async getWalletBalance(tenantId: string = 'default_tenant'): Promise<{ balance: number, history: Transaction[] }> {
    // In a real system, you'd calculate balance from User schema or sum of transactions.
    // Here we compute balance dynamically from transactions for safety
    const history = await this.txnModel.find({ tenantId }).sort({ createdAt: -1 }).limit(10).exec();
    const balance = history.reduce((acc, curr) => curr.type === 'CREDIT' ? acc + curr.amount : acc - curr.amount, 0);
    return { balance: Math.max(0, balance), history };
  }

  async rechargeWallet(tenantId: string, amount: number, paymentId: string): Promise<Transaction> {
    this.logger.log(`Recharging Tenant ${tenantId} Wallet by ₹${amount}`);
    const txn = new this.txnModel({
      tenantId,
      type: 'CREDIT',
      amount,
      description: `Recharge via Gateway (ID: ${paymentId})`,
      status: 'COMPLETED'
    });
    return await txn.save();
  }

  async deductWallet(tenantId: string, amount: number, reason: string): Promise<boolean> {
    const { balance } = await this.getWalletBalance(tenantId);
    if (balance < amount) {
      throw new HttpException('Insufficient Wallet Balance', HttpStatus.PAYMENT_REQUIRED);
    }
    const txn = new this.txnModel({
      tenantId,
      type: 'DEBIT',
      amount,
      description: reason,
      status: 'COMPLETED'
    });
    await txn.save();
    return true;
  }

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
