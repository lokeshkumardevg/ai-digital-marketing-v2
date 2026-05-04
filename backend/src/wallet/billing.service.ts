// billing.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletService } from './wallet.service';
import { Plan, PlanId, isPlanId } from './billing.types';

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

    // TODO: Replace with real Stripe/Razorpay checkout session
    // const session = await stripe.checkout.sessions.create({ ... });
    // return { id: session.id, url: session.url, plan };
    return {
      id: 'cs_' + Math.random().toString(36).substr(2, 9),
      url: successUrl,
      plan,
    };
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
