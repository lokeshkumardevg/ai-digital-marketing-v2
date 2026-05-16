import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
import { Campaign, CampaignDocument } from '../campaigns/schemas/campaign.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 1800; // 30 min

  constructor(
    @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>,
    @InjectModel(Campaign) private campaignModel: Model<CampaignDocument>,
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
    platform: 'google' | 'meta' | 'twitter' | 'linkedin',
    userId: string,
    customerId?: string,
    bypassCache = false,
  ): Promise<any> {
    const cacheKey = `ad_insights:${userId}:${platform}:${customerId || 'default'}:${bypassCache ? Date.now() : ''}`;

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
      data = await this.fetchGoogleInsights(user, customerId);
    } else if (platform === 'meta') {
      data = await this.fetchMetaInsights(user);
    } else if (platform === 'twitter') {
      data = await this.fetchTwitterInsights(user);
    } else if (platform === 'linkedin') {
      data = await this.fetchLinkedInInsights(user);
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

  private async fetchGoogleInsights(user: any, customerId?: string): Promise<any> {
    try {
      this.logger.log('Fetching Google Ads insights');

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      if (!user.googleRefreshToken && !user.googleAccessToken) {
        throw new HttpException(
          'Google Ads access is not configured. Please connect your Google Ads account and provide a customerId if required.',
          HttpStatus.PRECONDITION_REQUIRED,
        );
      }

      const resolvedCustomerId = customerId || (user as any).googleCustomerId || this.configService.get<string>('GOOGLE_ADS_CUSTOMER_ID');
      if (!resolvedCustomerId) {
        throw new HttpException(
          'Google Ads customer ID is required. Pass ?customerId=YOUR_CUSTOMER_ID or set GOOGLE_ADS_CUSTOMER_ID.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const accessToken = await this.resolveGoogleAccessToken(user);
      const developerToken = user.googleDeveloperToken || this.configService.get<string>('GOOGLE_DEVELOPER_TOKEN');
      if (!developerToken) {
        throw new HttpException(
          'Google developer token is required. Set GOOGLE_DEVELOPER_TOKEN or add googleDeveloperToken to your user profile.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const query = `
        SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.conversions
        FROM campaign
        WHERE segments.date DURING LAST_7_DAYS
        ORDER BY metrics.impressions DESC
        LIMIT 10
      `;

      const response = await fetch(
        `https://googleads.googleapis.com/v16/customers/${resolvedCustomerId}/googleAds:search`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        },
      );

      const json = await response.json();
      if (!response.ok || json.error) {
        const message = json.error?.message || JSON.stringify(json);
        this.logger.warn(`Google Ads API error: ${message}`);
        throw new HttpException(`Google Ads API error: ${message}`, HttpStatus.BAD_REQUEST);
      }

      const rows = json.results || [];
      const creatives = rows.map((row: any) => {
        const campaign = row.campaign || {};
        const metrics = row.metrics || {};
        const impressions = Number(metrics.impressions ?? 0);
        const spend = Number(metrics.costMicros ?? 0) / 1_000_000;
        const conversions = Number(metrics.conversions ?? 0);
        const ctr = Number(metrics.ctr ?? 0);
        return {
          name: campaign.name || 'Unknown campaign',
          impressions,
          cpa: conversions > 0 ? parseFloat((spend / conversions).toFixed(2)) : 0,
          ctr,
          spend,
          color: '#2631d6',
        };
      });

      return {
        audiences: creatives.map((item: any) => ({ label: item.name, value: item.impressions, color: '#2631d6' })),
        pages: [{ label: 'Google Ads', value: creatives.reduce((sum: number, item: any) => sum + item.impressions, 0), color: '#2631d6' }],
        creatives,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Google API error', error?.message || error);
      throw new HttpException('Failed to fetch Google Ads insights. Verify your account details and tokens.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async resolveGoogleAccessToken(user: any): Promise<string> {
    const isTokenValid = user.googleAccessToken && user.googleTokenExpiry && Date.now() + 60000 < user.googleTokenExpiry;
    if (isTokenValid) {
      return user.googleAccessToken;
    }

    if (!user.googleRefreshToken) {
      throw new HttpException(
        'Google refresh token is missing. Please reconnect Google to continue.',
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    const clientId = user.googleClientId || this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = user.googleClientSecret || this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new HttpException(
        'Google OAuth client ID and secret are not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: user.googleRefreshToken,
      grant_type: 'refresh_token',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenJson = await tokenResponse.json();
    if (!tokenResponse.ok || tokenJson.error) {
      const message = tokenJson.error_description || tokenJson.error || 'Unable to refresh Google access token';
      this.logger.warn(`Google token refresh failed: ${message}`);
      throw new HttpException(`Google token refresh failed: ${message}`, HttpStatus.UNAUTHORIZED);
    }

    await this.usersService.update(user._id || user.id, {
      googleAccessToken: tokenJson.access_token,
      googleTokenExpiry: Date.now() + (tokenJson.expires_in || 3600) * 1000,
    });

    return tokenJson.access_token;
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

  private async fetchTwitterInsights(user: any): Promise<any> {
    try {
      if (!user.twitterAccessToken) {
        this.logger.warn('Missing Twitter access token');
        return this.getMockData('Twitter');
      }

      // Twitter Ads API v11 - Note: Twitter Ads API requires OAuth 2.0 or OAuth 1.0a
      // This is a placeholder implementation
      const response = await fetch(
        `https://ads-api.twitter.com/11/accounts/${user.twitterUserId}/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${user.twitterAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data) {
        this.logger.warn('Twitter Ads API error', data);
        return this.getMockData('Twitter');
      }

      // Process Twitter data into unified format
      return {
        audiences: [],
        pages: [],
        creatives: [],
      };
    } catch (error) {
      this.logger.error('Twitter API error', error);
      return this.getMockData('Twitter');
    }
  }

  private async fetchLinkedInInsights(user: any): Promise<any> {
    try {
      if (!user.linkedinAccessToken) {
        this.logger.warn('Missing LinkedIn access token');
        return this.getMockData('LinkedIn');
      }

      // LinkedIn Marketing API
      const response = await fetch(
        `https://api.linkedin.com/v2/adAccounts?q=search&search=(status:(values:List(ACTIVE)))`,
        {
          headers: {
            Authorization: `Bearer ${user.linkedinAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data) {
        this.logger.warn('LinkedIn API error', data);
        return this.getMockData('LinkedIn');
      }

      // Process LinkedIn data into unified format
      return {
        audiences: [],
        pages: [],
        creatives: [],
      };
    } catch (error) {
      this.logger.error('LinkedIn API error', error);
      return this.getMockData('LinkedIn');
    }
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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const customerIdRaw = (user as any).googleCustomerId || this.configService.get<string>('GOOGLE_ADS_CUSTOMER_ID');
    const customerId = customerIdRaw?.replace(/-/g, '') || '';
    const developerToken = user.googleDeveloperToken || this.configService.get<string>('GOOGLE_DEVELOPER_TOKEN');

    if (!customerId) {
      throw new HttpException(
        'Google Ads customer ID is required to sync data. Set GOOGLE_ADS_CUSTOMER_ID or add googleCustomerId to your profile.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!developerToken) {
      throw new HttpException(
        'Google developer token is required to sync Google Ads data. Set GOOGLE_DEVELOPER_TOKEN or add googleDeveloperToken to your profile.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessToken = await this.resolveGoogleAccessToken(user);

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
          'developer-token': developerToken,
          'Content-Type': 'application/json',
          'login-customer-id': customerId,
        },
        body: JSON.stringify({ query }),
      },
    );
    const json: any = await res.json();

    if (json.error) {
      throw new HttpException(
        `Google Ads API error: ${json.error.message || JSON.stringify(json.error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!res.ok) {
      throw new HttpException(
        `Google Ads API request failed with status ${res.status}`,
        HttpStatus.BAD_REQUEST,
      );
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

  async syncTwitterInsights(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    if (!user.twitterAccessToken) {
      throw new HttpException('X Ads access token not found. Connect X Ads first.', HttpStatus.PRECONDITION_FAILED);
    }

    const response = await fetch('https://ads-api.twitter.com/11/accounts', {
      headers: {
        Authorization: `Bearer ${user.twitterAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data: any = await response.json();
    if (!response.ok || !data.data || !data.data.length) {
      throw new HttpException('Unable to fetch X Ads accounts. Check connection and permissions.', HttpStatus.BAD_REQUEST);
    }

    const accountId = data.data[0].id;
    const statsRes = await fetch(`https://ads-api.twitter.com/11/accounts/${accountId}/campaigns`, {
      headers: {
        Authorization: `Bearer ${user.twitterAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const statsJson: any = await statsRes.json();
    if (!statsRes.ok || !statsJson.data) {
      throw new HttpException('Unable to fetch X Ads campaign data.', HttpStatus.BAD_REQUEST);
    }

    let synced = 0;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const aggregate = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    for (const item of statsJson.data) {
      aggregate.spend += Number(item.daily_spend || item.spend || 0);
      aggregate.impressions += Number(item.impressions || 0);
      aggregate.clicks += Number(item.clicks || 0);
      aggregate.conversions += Number(item.conversions || 0);
      aggregate.revenue += Number(item.conversion_value || 0);
    }

    await this.analyticsModel.findOneAndUpdate(
      { date: new Date(dateStr), platform: 'twitter' },
      {
        $set: {
          date: new Date(dateStr),
          platform: 'twitter',
          spend: parseFloat(aggregate.spend.toFixed(2)),
          impressions: aggregate.impressions,
          clicks: aggregate.clicks,
          conversions: aggregate.conversions,
          revenue: parseFloat(aggregate.revenue.toFixed(2)),
          cpm: aggregate.impressions > 0 ? (aggregate.spend / aggregate.impressions) * 1000 : 0,
          cpc: aggregate.clicks > 0 ? aggregate.spend / aggregate.clicks : 0,
          ctr: aggregate.impressions > 0 ? (aggregate.clicks / aggregate.impressions) * 100 : 0,
        },
      },
      { upsert: true, new: true },
    );

    synced += 1;
    this.logger.log(`Synced X Ads insights for ${accountId}`);
    return { synced };
  }

  async syncLinkedInInsights(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    if (!user.linkedinAccessToken) {
      throw new HttpException('LinkedIn access token not found. Connect LinkedIn first.', HttpStatus.PRECONDITION_FAILED);
    }

    const accountsRes = await fetch('https://api.linkedin.com/v2/adAccounts?q=search', {
      headers: {
        Authorization: `Bearer ${user.linkedinAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const accountsData: any = await accountsRes.json();
    if (!accountsRes.ok || !accountsData.elements || !accountsData.elements.length) {
      throw new HttpException('Unable to fetch LinkedIn Ad accounts. Check connection and permissions.', HttpStatus.BAD_REQUEST);
    }

    const accountUrn = accountsData.elements[0].id || accountsData.elements[0].account || accountsData.elements[0].organisations?.[0];
    const today = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const dateFrom = since.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];
    const analyticsUrl = `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&dateRange.start.year=${since.getFullYear()}&dateRange.start.month=${since.getMonth() + 1}&dateRange.start.day=${since.getDate()}&dateRange.end.year=${today.getFullYear()}&dateRange.end.month=${today.getMonth() + 1}&dateRange.end.day=${today.getDate()}&pivot=ACCOUNT&accounts=urn%3Ali%3AadAccount%3A${encodeURIComponent(accountUrn)}&fields=costInLocalCurrency,impressions,clicks,conversions`;

    const statsRes = await fetch(analyticsUrl, {
      headers: {
        Authorization: `Bearer ${user.linkedinAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const statsJson: any = await statsRes.json();
    if (!statsRes.ok || !statsJson.elements) {
      throw new HttpException('Unable to fetch LinkedIn analytics.', HttpStatus.BAD_REQUEST);
    }

    const aggregate = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    for (const element of statsJson.elements) {
      aggregate.spend += Number(element.costInLocalCurrency || 0);
      aggregate.impressions += Number(element.impressions || 0);
      aggregate.clicks += Number(element.clicks || 0);
      aggregate.conversions += Number(element.conversions || 0);
    }

    const dateStr = today.toISOString().split('T')[0];
    await this.analyticsModel.findOneAndUpdate(
      { date: new Date(dateStr), platform: 'linkedin' },
      {
        $set: {
          date: new Date(dateStr),
          platform: 'linkedin',
          spend: parseFloat(aggregate.spend.toFixed(2)),
          impressions: aggregate.impressions,
          clicks: aggregate.clicks,
          conversions: aggregate.conversions,
          revenue: parseFloat(aggregate.revenue.toFixed(2)),
          cpm: aggregate.impressions > 0 ? (aggregate.spend / aggregate.impressions) * 1000 : 0,
          cpc: aggregate.clicks > 0 ? aggregate.spend / aggregate.clicks : 0,
          ctr: aggregate.impressions > 0 ? (aggregate.clicks / aggregate.impressions) * 100 : 0,
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Synced LinkedIn insights for ${accountUrn}`);
    return { synced: 1 };
  }

  private getMockData(platform: string): any {
    return {
      audiences: [{ label: `${platform} Default`, value: 100, color: '#2631d6' }],
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
}
