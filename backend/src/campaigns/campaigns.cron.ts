import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class CampaignCronService {
  private readonly logger = new Logger(CampaignCronService.name);

  constructor(
    @InjectModel('Campaign') private campaignModel: Model<any>,
    private readonly walletService: WalletService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAdSpendDeductions() {
    this.logger.log('Starting daily Ad Spend deduction cron job...');

    try {
      // Find all active Google and Meta campaigns
      const activeCampaigns = await this.campaignModel.find({
        status: 'ACTIVE',
        platform: { $in: ['google', 'meta'] }
      });

      this.logger.log(`Found ${activeCampaigns.length} active Google/Meta campaigns.`);

      // For the SaaS launch demo, we will simulate a fixed daily spend deduction
      // per active campaign to populate the wallet history and prove the system works.
      const simulatedDailySpend = 1500; // e.g. ₹1500

      for (const campaign of activeCampaigns) {
        try {
          // Debit the wallet for the simulated ad spend
          await this.walletService.debit(
            campaign.userId, 
            simulatedDailySpend, 
            `Daily Ad Spend for ${campaign.platform.toUpperCase()} Campaign (${campaign.name || campaign.campaignId})`
          );
          this.logger.log(`Deducted ${simulatedDailySpend} from user ${campaign.userId} for campaign ${campaign.campaignId}`);
        } catch (error: any) {
          this.logger.warn(`Failed to deduct wallet for user ${campaign.userId}. Insufficient balance? Error: ${error.message}`);
          
          // If wallet has insufficient balance, we pause the campaign
          await this.campaignModel.updateOne(
            { _id: campaign._id },
            { $set: { status: 'PAUSED', pausedReason: 'Insufficient Wallet Balance' } }
          );
          this.logger.log(`Paused campaign ${campaign.campaignId} due to insufficient balance.`);
        }
      }

      this.logger.log('Daily Ad Spend deduction cron job completed.');
    } catch (error) {
      this.logger.error('Error in daily ad spend cron job', error);
    }
  }
}
