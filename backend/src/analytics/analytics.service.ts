import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
import { AiService } from '../ai/ai.service'; 

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>,
    private readonly aiService: AiService,
  ) {}

  async getDashboardMetrics(): Promise<any> {
    const historicalData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      historicalData.push({
        date: dateStr,
        spend: 40 + Math.random() * 60,
        cpm: 4 + Math.random() * 2,
        cpc: 0.05 + Math.random() * 0.05,
        ctr: 5 + Math.random() * 5,
        roas: 1.5 + Math.random() * 1.5,
        purchaseValue: Math.random() > 0.5 ? Math.random() * 500 : 0
      });
    }

    const currentTotal = {
      spend: historicalData.reduce((s, c) => s + c.spend, 0).toFixed(2),
      cpm: (historicalData.reduce((s, c) => s + c.cpm, 0) / 7).toFixed(2),
      cpc: (historicalData.reduce((s, c) => s + c.cpc, 0) / 7).toFixed(2),
      ctr: (historicalData.reduce((s, c) => s + c.ctr, 0) / 7).toFixed(2) + '%',
      roas: (historicalData.reduce((s, c) => s + c.roas, 0) / 7).toFixed(2),
      purchaseValue: historicalData.reduce((s, c) => s + c.purchaseValue, 0).toFixed(2)
    };

    return {
      daily: historicalData,
      summary: currentTotal
    };
  }
}
