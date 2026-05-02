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

    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn('User not found');
      return this.getEmptyResponse();
    }

    let data: any;

    if (platform === 'google') {
      data = await this.fetchGoogleInsights(user);
    } else if (platform === 'meta') {
      data = await this.fetchMetaInsights(user);
    } else {
      this.logger.warn(`Unsupported platform: ${platform}`);
      return this.getEmptyResponse();
    }

    const safeData = {
      audiences: data?.audiences ?? [],
      pages: data?.pages ?? [],
      creatives: data?.creatives ?? [],
    };

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

      if (!data || !data.data || data.data.length === 0) {
        this.logger.warn('Meta API returned empty data');
        return this.getEmptyResponse();
      }

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
      audiences: [{ label: `${platform} Default`, value: 100, color: '#7c3aed' }],
      pages: [{ label: 'default', value: 100, color: '#3b82f6' }],
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

  async getDashboardMetrics(dateRange?: string): Promise<any> {
    const days =
      dateRange === 'Last 14 days'
        ? 14
        : dateRange === 'Last 30 days'
          ? 30
          : dateRange === 'Last 90 days'
            ? 90
            : dateRange === 'Today'
              ? 1
              : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.analyticsModel
      .find({ date: { $gte: startDate } })
      .sort({ date: 1 })
      .lean()
      .exec();

    const campaigns = await this.campaignModel
      .find({ status: { $in: ['active', 'completed'] } })
      .lean()
      .exec();

    type DayAgg = {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };

    const byDay: Record<string, DayAgg> = {};
    for (const r of records) {
      const key = new Date(r.date).toISOString().split('T')[0];
      if (!byDay[key]) {
        byDay[key] = {
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        };
      }
      byDay[key].spend += r.spend || 0;
      byDay[key].impressions += r.impressions || 0;
      byDay[key].clicks += r.clicks || 0;
      byDay[key].conversions += r.conversions || 0;
      byDay[key].revenue += r.revenue || 0;
    }

    const daily = Object.keys(byDay)
      .sort()
      .map((dateStr) => {
        const m = byDay[dateStr];
        const spend = m.spend;
        const impressions = m.impressions;
        const clicks = m.clicks;
        const conversions = m.conversions;
        const revenue = m.revenue;
        return {
          date: dateStr,
          spend,
          impressions,
          clicks,
          conversions,
          revenue,
          cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          roas: spend > 0 ? revenue / spend : 0,
        };
      });

    const totalSpend = daily.reduce((s, d) => s + d.spend, 0);
    const totalImpressions = daily.reduce((s, d) => s + d.impressions, 0);
    const totalClicks = daily.reduce((s, d) => s + d.clicks, 0);
    const totalConversions = daily.reduce((s, d) => s + d.conversions, 0);
    const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);

    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return {
      summary: {
        spend: parseFloat(totalSpend.toFixed(2)),
        cpm: parseFloat(cpm.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        ctr: parseFloat(ctr.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
        purchaseValue: parseFloat(totalRevenue.toFixed(2)),
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
      },
      daily,
      campaigns: campaigns.length,
    };
  }

  async syncMetaInsights(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user?.metaAccessToken) {
      throw new Error('Meta access token not found for user. Connect Meta Ads first.');
    }

    const adAccountId =
      this.configService.get<string>('META_AD_ACCOUNT_ID') || '';
    const token = user.metaAccessToken;

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split('T')[0];
    const untilStr = new Date().toISOString().split('T')[0];

    const timeRange = encodeURIComponent(
      JSON.stringify({ since: sinceStr, until: untilStr }),
    );

    const url =
      `https://graph.facebook.com/v19.0/${adAccountId}/insights` +
      `?fields=date_start,spend,impressions,clicks,actions,action_values,cpm,cpc,ctr` +
      `&time_increment=1` +
      `&time_range=${timeRange}` +
      `&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    const json: any = await res.json();

    if (json.error) {
      throw new Error(`Meta API error: ${json.error.message}`);
    }

    const rows = json.data || [];

    for (const row of rows) {
      const conversions = (row.actions || [])
        .filter((a: any) => a.action_type === 'purchase')
        .reduce((s: number, a: any) => s + parseFloat(a.value || '0'), 0);

      const revenue = (row.action_values || [])
        .filter((a: any) => a.action_type === 'purchase')
        .reduce((s: number, a: any) => s + parseFloat(a.value || '0'), 0);

      await this.analyticsModel.findOneAndUpdate(
        { date: new Date(row.date_start), platform: 'meta' },
        {
          $set: {
            date: new Date(row.date_start),
            platform: 'meta',
            spend: parseFloat(row.spend || '0'),
            impressions: parseInt(row.impressions || '0', 10),
            clicks: parseInt(row.clicks || '0', 10),
            cpm: parseFloat(row.cpm || '0'),
            cpc: parseFloat(row.cpc || '0'),
            ctr: parseFloat(row.ctr || '0'),
            conversions,
            revenue,
          },
        },
        { upsert: true, new: true },
      );
    }

    this.logger.log(`Synced ${rows.length} days of Meta insights`);
    return { synced: rows.length };
  }

  async syncGoogleInsights(userId: string): Promise<any> {
    const customerIdRaw = this.configService.get<string>('GOOGLE_ADS_CUSTOMER_ID');
    const customerId = customerIdRaw?.replace(/-/g, '') || '';
    const devToken = this.configService.get<string>('GOOGLE_DEVELOPER_TOKEN');
    const user = await this.usersService.findById(userId);

    const accessToken = (user as any)?.googleAccessToken;
    if (!accessToken) {
      throw new Error('Google access token not found. Connect Google Ads first.');
    }

    const query = `
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value,
      metrics.average_cpm,
      metrics.average_cpc,
      metrics.ctr
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY segments.date ASC
  `;

    const res = await fetch(
      `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': devToken || '',
          'Content-Type': 'application/json',
          'login-customer-id': customerId,
        },
        body: JSON.stringify({ query }),
      },
    );
    const json: any = await res.json();

    if (json.error) {
      throw new Error(`Google Ads API: ${json.error.message || JSON.stringify(json.error)}`);
    }

    const byDate: Record<string, any> = {};
    for (const row of json.results || []) {
      const date = row.segments?.date;
      if (!date) continue;
      if (!byDate[date]) {
        byDate[date] = {
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        };
      }
      const m = row.metrics || {};
      const costMicros = m.costMicros ?? m.cost_micros ?? 0;
      byDate[date].spend += Number(costMicros) / 1_000_000;
      byDate[date].impressions += Number(m.impressions ?? 0);
      byDate[date].clicks += Number(m.clicks ?? 0);
      byDate[date].conversions += Number(m.conversions ?? 0);
      const convVal = m.conversionsValue ?? m.conversions_value ?? 0;
      byDate[date].revenue += Number(convVal);
    }

    for (const [dateStr, metrics] of Object.entries(byDate)) {
      const m = metrics as {
        spend: number;
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
      };
      await this.analyticsModel.findOneAndUpdate(
        { date: new Date(dateStr), platform: 'google' },
        {
          $set: {
            date: new Date(dateStr),
            platform: 'google',
            spend: parseFloat(m.spend.toFixed(2)),
            impressions: m.impressions,
            clicks: m.clicks,
            conversions: m.conversions,
            revenue: m.revenue,
            cpm:
              m.impressions > 0 ? (m.spend / m.impressions) * 1000 : 0,
            cpc: m.clicks > 0 ? m.spend / m.clicks : 0,
            ctr:
              m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0,
          },
        },
        { upsert: true, new: true },
      );
    }

    this.logger.log(`Synced ${Object.keys(byDate).length} days of Google insights`);
    return { synced: Object.keys(byDate).length };
  }
}
