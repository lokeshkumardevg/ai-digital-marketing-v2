// wallet.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  public razorpay: any;

  constructor(
    @InjectModel('Wallet') private walletModel: Model<any>,
    @InjectModel('Transaction') private txModel: Model<any>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
    });
  }

  // GET /wallet/balance/:userId
  async getBalance(userId: string) {
    let wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      wallet = await this.walletModel.create({ userId, balance: 0 });
    }
    return { balance: wallet.balance };
  }

  // POST /wallet/credit  { userId, amount, description? }
  async credit(userId: string, amount: number, description = 'Topup') {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const wallet = await this.walletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true },
    );

    await this.txModel.create({
      userId,
      type: 'CREDIT',
      amount,
      description,
    });

    return { balance: wallet.balance };
  }

  // POST /wallet/debit  { userId, amount, description?, allowNegative? }
  async debit(userId: string, amount: number, description = 'Spend', allowNegative = false) {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }
    
    if (!allowNegative && wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;
    await wallet.save();

    await this.txModel.create({
      userId,
      type: 'DEBIT',
      amount,
      description,
    });

    return { balance: wallet.balance };
  }

  // GET /wallet/transactions/:userId?page=1&limit=10
  async getTransactions(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.txModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.txModel.countDocuments({ userId }),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Used internally by BillingService for analytics
  async getSpendByMonth(userId: string, since: Date) {
    return this.txModel.aggregate([
      {
        $match: {
          userId,
          type: 'DEBIT',
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          spend: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }

  // Get total ad spend deducted from wallet *today*
  async getTodayAdSpendDeductions(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const txs = await this.txModel.find({
      userId,
      type: 'DEBIT',
      description: { $regex: /Ad Spend/i },
      createdAt: { $gte: startOfDay }
    });

    return txs.reduce((sum, tx) => sum + tx.amount, 0);
  }

  // --- RAZORPAY INTEGRATION ---

  // POST /wallet/razorpay/create-order
  async createRazorpayOrder(amountInRupees: number) {
    const options = {
      amount: amountInRupees * 100, // Razorpay takes paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new BadRequestException('Failed to create Razorpay order');
    }
  }

  // POST /wallet/razorpay/verify
  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string, amountInRupees: number) {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

    if (expectedSignature === signature) {
      // Signature is valid, credit the wallet
      // We credit the user minus 10% platform fee if desired, or we just credit 100% and deduct the 10% on ad spend?
      // Since user said 10% platform fee, we can deduct it here or at spend time.
      // Easiest is to add 100% to wallet, but when we bill them for ads, we mark up the ad spend by 10%.
      // For now, let's just add the full amount.
      const newBalance = await this.credit(userId, amountInRupees, `Razorpay Topup (Payment ID: ${paymentId})`);
      return { success: true, message: 'Payment verified successfully', balance: newBalance.balance };
    } else {
      throw new BadRequestException('Invalid payment signature');
    }
  }
}
