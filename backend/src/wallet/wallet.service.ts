// wallet.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel('Wallet') private walletModel: Model<any>,
    @InjectModel('Transaction') private txModel: Model<any>,
  ) {}

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

  // POST /wallet/debit  { userId, amount, description? }
  async debit(userId: string, amount: number, description = 'Spend') {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
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
}
