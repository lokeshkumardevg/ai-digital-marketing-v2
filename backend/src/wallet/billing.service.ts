// billing.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletService } from './wallet.service';
import { Plan, PlanId, isPlanId } from './billing.types';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel('Subscription') private subscriptionModel: Model<any>,
    private readonly walletService: WalletService,
  ) {}

  // GET /billing/subscription/:userId
  async getSubscription(userId: string) {
    let subscription = await this.subscriptionModel.findOne({ userId });
    if (!subscription) {
      subscription = await this.subscriptionModel.create({
        userId,
        plan: 'free',
        status: 'active',
        aiTokensUsedCurrentBillingCycle: 0,
        aiTokenLimit: 10000,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    return subscription;
  }

  // POST /billing/subscription/upgrade
  // Body: { userId, planId, successUrl, cancelUrl }
  async upgradeSubscription(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ id: string; url: string; plan: Plan }> {
    const plans = await this.getPlans();

    if (!isPlanId(planId)) throw new NotFoundException('Plan not found');

    const plan = plans[planId]; // fully type-safe — no cast needed

    // If it's the free plan, upgrade the database immediately without charging
    if (plan.price === 0) {
      let subscription = await this.subscriptionModel.findOne({ userId });
      if (!subscription) {
        await this.subscriptionModel.create({
          userId,
          plan: planId,
          status: 'active',
          aiTokensUsedCurrentBillingCycle: 0,
          aiTokenLimit: plan.limit,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      } else {
        subscription.plan = planId;
        subscription.status = 'active';
        subscription.aiTokenLimit = plan.limit;
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();
      }
      return {
        id: 'free_upgrade',
        url: successUrl,
        plan,
      };
    }

    // For paid plans, create a real Razorpay Order
    // Convert USD to INR (e.g. 1 USD = 83 INR) for Razorpay paise
    const amountInPaise = plan.price * 83 * 100;

    try {
      const order = await this.walletService.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `sub_${planId}_${Date.now().toString().slice(-6)}`,
        notes: { userId, planId },
      });

      return {
        id: order.id,
        url: '', // Frontend will open Razorpay checkout modal using order.id
        plan,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to create subscription order: ${error.message || error}`);
    }
  }

  // POST /billing/subscription/verify
  async verifySubscriptionPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    planId: string,
  ) {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const plans = await this.getPlans();
    if (!isPlanId(planId)) throw new NotFoundException('Plan not found');
    const plan = plans[planId];

    let subscription = await this.subscriptionModel.findOne({ userId });
    if (!subscription) {
      subscription = await this.subscriptionModel.create({
        userId,
        plan: planId,
        status: 'active',
        aiTokensUsedCurrentBillingCycle: 0,
        aiTokenLimit: plan.limit,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } else {
      subscription.plan = planId;
      subscription.status = 'active';
      subscription.aiTokenLimit = plan.limit;
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subscription.save();
    }

    return { success: true, plan: planId, subscription };
  }

  // POST /billing/subscription/cancel
  // Body: { userId }
  async cancelSubscription(userId: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionModel.findOne({ userId });
    if (!subscription) throw new NotFoundException('Subscription not found');

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    return { message: 'Subscription cancelled successfully' };
  }

  // GET /billing/plans
  async getPlans(): Promise<Record<PlanId, Plan>> {
    return {
      free: {
        name: 'Hobbyist',
        price: 0,
        limit: 10_000,
        features: ['Basic features', '10K tokens/month', 'Email support'],
      },
      pro: {
        name: 'Growth Pro',
        price: 99,
        limit: 250_000,
        features: ['Advanced features', '250K tokens/month', 'Priority support', 'Analytics'],
      },
      enterprise: {
        name: 'Enterprise Matrix',
        price: 499,
        limit: 2_000_000,
        features: ['All features', '2M tokens/month', '24/7 support', 'Custom integrations', 'SLA'],
      },
    };
  }

  // POST /billing/wallet/recharge
  // Body: { userId, amount, description? }
  async rechargeWallet(userId: string, amount: number, description = 'Wallet Recharge') {
    return this.walletService.credit(userId, amount, description);
  }

  // GET /billing/wallet/balance/:userId
  async getWalletBalance(userId: string) {
    return this.walletService.getBalance(userId);
  }

  // GET /billing/wallet/transactions/:userId?page=1&limit=10
  async getWalletTransactions(userId: string, page = 1, limit = 10) {
    return this.walletService.getTransactions(userId, page, limit);
  }

  // GET /billing/analytics/:userId
  async getAnalytics(userId: string) {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const spendData = await this.walletService.getSpendByMonth(userId, since);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const result = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-based

      const found = spendData.find(
        (s: any) => s._id.year === year && s._id.month === month,
      );

      result.push({
        month: monthNames[month - 1],
        spend: found?.spend ?? 0,
        roi: parseFloat((Math.random() * 5 + 2).toFixed(1)), // TODO: replace with real ROI calc
      });
    }

    return result;
  }
}
