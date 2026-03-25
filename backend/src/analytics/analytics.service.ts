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
    // Determine the past 7 days of dummy data for visualization
    const historicalData = [];
    const today = new Date();
    
    let baseTraffic = 1200;
    let baseRevenue = 4500;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      historicalData.push({
        date: d.toISOString().split('T')[0],
        traffic: Math.floor(baseTraffic + (Math.random() * 400 - 100)),
        revenue: Math.floor(baseRevenue + (Math.random() * 1200 - 300)),
        isPrediction: false
      });
      baseTraffic += 150;
      baseRevenue += 600;
    }

    // Call the AI Orchestrator to "predict" the next 7 days based on the trajectory!
    let predictiveData = [];
    try {
      const prompt = `Analyze this historical 7-day SaaS marketing data: ${JSON.stringify(historicalData)}.
      Predict the exact next 7 days of 'traffic' and 'revenue' assuming a continuing successful AI marketing campaign push resulting in 15% WoW growth.
      Return ONLY raw JSON in this format: [{"date": "YYYY-MM-DD", "traffic": 1234, "revenue": 5678, "isPrediction": true}]`;
      
      const predictionResponse = await this.aiService.generateContent(prompt, 'You are a highly accurate data science predictor determining SaaS KPIs.');
      predictiveData = JSON.parse(predictionResponse.replace(/```json|```/g, '').trim());
      
      // Ensure the "isPrediction" flag is set correctly on AI objects
      predictiveData = predictiveData.map((pd: any) => ({ ...pd, isPrediction: true }));
    } catch (e) {
      this.logger.error('Failed to parse AI predictions, using heuristics', e);
      // Fallback heuristics
      for (let i = 1; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        predictiveData.push({
          date: d.toISOString().split('T')[0],
          traffic: Math.floor(baseTraffic + (Math.random() * 500)),
          revenue: Math.floor(baseRevenue + (Math.random() * 1500)),
          isPrediction: true
        });
        baseTraffic += 200;
        baseRevenue += 800;
      }
    }

    return {
      historical: historicalData,
      predictions: predictiveData,
      summary: {
        totalTraffic: historicalData.reduce((acc, curr) => acc + curr.traffic, 0),
        totalRevenue: historicalData.reduce((acc, curr) => acc + curr.revenue, 0),
        predictedTrafficGrowth: '+18.4%',
        predictedRevenueGrowth: '+22.1%',
        aiConfidenceScore: 92
      }
    };
  }
}
