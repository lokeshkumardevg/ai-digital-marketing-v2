import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
import { CampaignDocument } from '../campaigns/schemas/campaign.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 1800; // 30 min

  constructor(
    @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>,
    @InjectModel('Campaign') private campaignModel: Model<CampaignDocument>,
    private readonly aiService: AiService,
    private usersService: UsersService,
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // ✅ Always return safe structure
  private getEmptyResponse() {
    return {
      audiences: [],
      pages: [],
      creatives: [],
    };
  }

  async getAdInsights(
    platform: 'google' | 'meta',
    userId: string,
    bypassCache = false,
  ): Promise<any> {
    const cacheKey = `ad_insights:${userId}:${platform}:${bypassCache ? Date.now() : ''}`;

    // ✅ Try cache
    if (!bypassCache) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error: any) {
        this.logger.warn('Redis cache unavailable', error.message);
      }
    }

    // ✅ Get user
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn('User not found');
      return this.getEmptyResponse();
    }

    let data: any;

    // ✅ Platform switch
    if (platform === 'google') {
      data = await this.fetchGoogleInsights(user);
    } else if (platform === 'meta') {
      data = await this.fetchMetaInsights(user);
    } else {
      this.logger.warn(`Unsupported platform: ${platform}`);
      return this.getEmptyResponse();
    }

    // ✅ Final safety guard
    const safeData = {
      audiences: data?.audiences ?? [],
      pages: data?.pages ?? [],
      creatives: data?.creatives ?? [],
    };

    // ✅ Cache result
    if (!bypassCache) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(safeData), 'EX', this.CACHE_TTL);
      } catch (error: any) {
        this.logger.warn('Failed to cache data', error.message);
      }
    }

    return safeData;
  }

  private async fetchGoogleInsights(user: any): Promise<any> {
    try {
      this.logger.log('Fetching Google Ads insights (mocked)');
      
      // 👉 Replace with real API later
      const data = this.getMockData('google');

      if (!data) {
        return this.getEmptyResponse();
      }

      return data;
    } catch (error) {
      this.logger.error('Google API error', error);
      return this.getEmptyResponse();
    }
  }

  private async fetchMetaInsights(user: any): Promise<any> {
    try {
      if (!user.metaAccessToken) {
        this.logger.warn('Missing Meta access token');
        return this.getEmptyResponse();
      }

      const response = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?fields=insights{name,account_name,campaign_name,impressions,clicks,spend,ctr}&access_token=${user.metaAccessToken}`,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const data = await response.json();

      // ✅ Empty or invalid response guard
      if (!data || !data.data || data.data.length === 0) {
        this.logger.warn('Meta API returned empty data');
        return this.getEmptyResponse();
      }

      // 👉 Transform real API data here
      return {
        audiences: [],
        pages: [],
        creatives: [],
      };
    } catch (error) {
      this.logger.error('Meta API error', error);
      return this.getEmptyResponse();
    }
  }

  private getMockData(platform: string): any {
    return {
      audiences: [
        { label: `${platform} Default`, value: 100, color: '#7c3aed' },
      ],
      pages: [
        { label: 'default', value: 100, color: '#3b82f6' },
      ],
      creatives: [
        {
          name: `${platform} Mock`,
          cpa: 2.5,
          ctr: 7.0,
          spend: 300,
          color: '#f97316',
        },
      ],
    };
  }

  // Backward compatibility
  async getDashboardMetrics(): Promise<any> {
    return this.getEmptyResponse();
  }
}