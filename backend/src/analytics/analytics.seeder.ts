import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';

@Injectable()
export class AnalyticsSeeder {
  constructor(
    @InjectModel(Analytics.name) private model: Model<AnalyticsDocument>,
  ) {}

  async seedDemoData(days = 30): Promise<number> {
    let seeded = 0;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const spend = parseFloat((Math.random() * 200 + 50).toFixed(2));
      const impressions = Math.floor(Math.random() * 50000 + 10000);
      const clicks = Math.max(1, Math.floor(impressions * (Math.random() * 0.05 + 0.01)));
      const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));
      const revenue = parseFloat((conversions * (Math.random() * 50 + 20)).toFixed(2));

      await this.model.findOneAndUpdate(
        { date, platform: 'demo' },
        {
          $set: {
            date,
            platform: 'demo',
            spend,
            impressions,
            clicks,
            conversions,
            revenue,
            cpm: (spend / impressions) * 1000,
            cpc: spend / clicks,
            ctr: (clicks / impressions) * 100,
          },
        },
        { upsert: true },
      );
      seeded++;
    }
    return seeded;
  }
}
