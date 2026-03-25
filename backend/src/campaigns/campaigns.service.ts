import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { AiService } from '../ai/ai.service'; // Import Orchestrator

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private readonly aiService: AiService,
  ) {}

  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const results = await this.campaignModel.find().populate('audience').lean().exec();
      if (!results || results.length === 0) {
        return [
           { _id: 'camp-1', name: 'Spring Cyber Sale', status: 'active', platform: 'Meta', budgetDaily: 450, cpc: 1.12, createdAt: new Date() } as any,
           { _id: 'camp-2', name: 'Brand Awareness', status: 'draft', platform: 'Google', budgetDaily: 1500, cpc: 0, createdAt: new Date() } as any
        ];
      }
      return results as any;
    } catch(e) { return [] as any; }
  }

  /**
   * Automates an end-to-end multi-channel ad creation process using AI.
   */
  async autoGenerateCampaign(data: { name: string; audienceId: string; platform: string; productUrl: string; baseBudget: number }): Promise<Campaign> {
    this.logger.log(`Auto-generating campaign: ${data.name}`);

    // Call AI Orchestrator to write high-converting Ad Copy
    const prompt = `Write an engaging Ad for a digital marketing campaign targeting the provided audience. Base URL: ${data.productUrl}. Platform: ${data.platform}. Return raw JSON: {"headline": "Max 40 chars", "primaryText": "Max 125 chars", "description": "Max 50 chars"}`;
    
    let parsedCopy = { headline: 'AI Headline', primaryText: 'AI Text', description: 'AI Desc' };
    try {
      const resultStr = await this.aiService.generateContent(prompt, 'You are an elite, modern performance marketing copywriter.');
      parsedCopy = JSON.parse(resultStr.replace(/```json|```/g, '').trim());
    } catch (e) {
      this.logger.error('Failed to parse AI copy for campaign', e);
    }

    // Call AI (e.g. Stability AI mock) for creatives
    const imageUrl = await this.aiService.generateImage(`Cinematic, high quality product advertising image for ${data.name}`);

    const newCampaign = new this.campaignModel({
      name: data.name,
      audience: data.audienceId,
      platform: data.platform,
      budgetDaily: data.baseBudget,
      aiGeneratedContent: {
        ...parsedCopy,
        imageUrl,
      },
      status: 'draft',
    });

    return await newCampaign.save();
  }

  /**
   * Pseudo-integration pushes campaigns to live Google/Meta API Endpoints.
   */
  async launchCampaign(campaignId: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    this.logger.log(`Pushing Campaign ${campaignId} to ${campaign.platform} API via automated pipeline...`);
    
    // MOCK: Delay for API call simulation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    campaign.status = 'active';
    // MOCK: Generate some metrics
    campaign.cpc = Math.random() * 2 + 0.5; // Random CPC between $0.50 and $2.50
    return await campaign.save();
  }
}
