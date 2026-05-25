import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LinkedInAccount, LinkedInAccountDocument } from './schemas/linkedin-account.schema';
import { LinkedInLead, LinkedInLeadDocument } from './schemas/linkedin-lead.schema';
import { LinkedInPost, LinkedInPostDocument } from './schemas/linkedin-post.schema';
import { LinkedInAdCampaign, LinkedInAdCampaignDocument } from './schemas/linkedin-ad-campaign.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInCrmService {
  constructor(
    @InjectModel(LinkedInAccount.name) private accountModel: Model<LinkedInAccountDocument>,
    @InjectModel(LinkedInLead.name) private leadModel: Model<LinkedInLeadDocument>,
    @InjectModel(LinkedInPost.name) private postModel: Model<LinkedInPostDocument>,
    @InjectModel(LinkedInAdCampaign.name) private adCampaignModel: Model<LinkedInAdCampaignDocument>,
    private configService: ConfigService,
  ) {}

  // ===================== ACCOUNTS =====================

  async getConnectedAccount(userId: string): Promise<LinkedInAccountDocument | null> {
    return this.accountModel.findOne({ userId: new Types.ObjectId(userId), status: 'connected' });
  }

  async getAllAccounts(userId: string): Promise<LinkedInAccountDocument[]> {
    return this.accountModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async saveOrUpdateAccount(userId: string, data: Partial<LinkedInAccount>): Promise<LinkedInAccountDocument> {
    const existing = await this.accountModel.findOne({
      userId: new Types.ObjectId(userId),
      linkedinId: data.linkedinId,
    });

    if (existing) {
      Object.assign(existing, data, { lastSyncedAt: new Date(), status: 'connected' });
      return existing.save();
    }

    return this.accountModel.create({
      ...data,
      userId: new Types.ObjectId(userId),
      lastSyncedAt: new Date(),
      status: 'connected',
    });
  }

  async disconnectAccount(userId: string, accountId: string): Promise<LinkedInAccountDocument> {
    const account = await this.accountModel.findOne({
      _id: new Types.ObjectId(accountId),
      userId: new Types.ObjectId(userId),
    });
    if (!account) throw new NotFoundException('LinkedIn account not found');
    account.status = 'disconnected';
    account.accessToken = '';
    account.refreshToken = '';
    return account.save();
  }

  // ===================== LEADS =====================

  async getLeads(userId: string, filters?: {
    stage?: string;
    tag?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const query: any = { userId: new Types.ObjectId(userId), status: { $ne: 'deleted' } };

    if (filters?.stage) query.stage = filters.stage;
    if (filters?.tag) query.tags = { $in: [filters.tag] };
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
        { headline: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const sortField = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      this.leadModel
        .find(query)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      this.leadModel.countDocuments(query),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLeadById(userId: string, leadId: string): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOne({
      _id: new Types.ObjectId(leadId),
      userId: new Types.ObjectId(userId),
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async createLead(userId: string, data: Partial<LinkedInLead>): Promise<LinkedInLeadDocument> {
    return this.leadModel.create({
      ...data,
      userId: new Types.ObjectId(userId),
      activityLog: [{
        action: 'created',
        timestamp: new Date(),
        details: `Lead created from ${data.source || 'manual'} source`,
      }],
    });
  }

  async updateLead(userId: string, leadId: string, data: Partial<LinkedInLead>): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      {
        ...data,
        $push: {
          activityLog: {
            action: 'updated',
            timestamp: new Date(),
            details: `Lead updated: ${Object.keys(data).join(', ')}`,
          },
        },
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateLeadStage(userId: string, leadId: string, stage: string): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      {
        stage,
        $push: {
          activityLog: {
            action: 'stage_changed',
            timestamp: new Date(),
            details: `Pipeline stage changed to: ${stage}`,
          },
        },
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async addNoteToLead(userId: string, leadId: string, note: { message: string; type: string }): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      {
        $push: {
          notes: { ...note, timestamp: new Date(), author: userId },
          activityLog: {
            action: 'note_added',
            timestamp: new Date(),
            details: `${note.type} note added`,
          },
        },
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async addTagToLead(userId: string, leadId: string, tag: string): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      { $addToSet: { tags: tag } },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async removeTagFromLead(userId: string, leadId: string, tag: string): Promise<LinkedInLeadDocument> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      { $pull: { tags: tag } },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async deleteLead(userId: string, leadId: string): Promise<{ success: boolean }> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), userId: new Types.ObjectId(userId) },
      { status: 'deleted' },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return { success: true };
  }

  async getLeadStats(userId: string) {
    const pipeline = [
      { $match: { userId: new Types.ObjectId(userId), status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          avgScore: { $avg: '$aiLeadScore' },
        },
      },
    ];

    const stageStats = await this.leadModel.aggregate(pipeline);
    const totalLeads = await this.leadModel.countDocuments({ userId: new Types.ObjectId(userId), status: { $ne: 'deleted' } });
    const highValueLeads = await this.leadModel.countDocuments({ userId: new Types.ObjectId(userId), aiLeadScore: { $gte: 70 }, status: { $ne: 'deleted' } });

    return {
      totalLeads,
      highValueLeads,
      stageBreakdown: stageStats,
    };
  }

  // ===================== POSTS =====================

  async getPosts(userId: string, filters?: {
    search?: string;
    postType?: string;
    page?: number;
    limit?: number;
  }) {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.postType) query.postType = filters.postType;
    if (filters?.search) {
      query.$or = [
        { content: { $regex: filters.search, $options: 'i' } },
        { authorName: { $regex: filters.search, $options: 'i' } },
        { hashtags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.postModel.countDocuments(query),
    ]);

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPostById(userId: string, postId: string): Promise<LinkedInPostDocument> {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async savePost(userId: string, data: Partial<LinkedInPost>): Promise<LinkedInPostDocument> {
    return this.postModel.create({
      ...data,
      userId: new Types.ObjectId(userId),
    });
  }

  async deletePost(userId: string, postId: string): Promise<{ success: boolean }> {
    const result = await this.postModel.deleteOne({
      _id: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) throw new NotFoundException('Post not found');
    return { success: true };
  }

  async publishPostToLinkedIn(userId: string, text: string): Promise<any> {
    const account = await this.getConnectedAccount(userId);
    if (!account) throw new BadRequestException('LinkedIn account not connected');
    if (!account.accessToken) throw new BadRequestException('LinkedIn access token missing');

    const authorUrn = `urn:li:person:${account.linkedinId}`;

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('LinkedIn Publish Error:', errorText);
      throw new BadRequestException(`Failed to publish to LinkedIn: ${errorText}`);
    }

    const data = await res.json();
    return data;
  }

  // ===================== ADS =====================

  async getAdCampaigns(userId: string) {
    const account = await this.getConnectedAccount(userId);
    if (!account) throw new BadRequestException('LinkedIn account not connected');
    if (!account.accessToken) throw new BadRequestException('LinkedIn access token missing');

    // MOCK DATA for now until we fully authorize the user with LinkedIn Marketing APIs
    const mockCampaigns = [
      {
        campaignId: 'cam-101',
        name: 'Q3 B2B Software Launch',
        status: 'ACTIVE',
        objectiveType: 'LEAD_GENERATION',
        budget: { daily: 50, total: 1500, currencyCode: 'USD' },
        metrics: { impressions: 12500, clicks: 450, spend: 320.50, conversions: 12 },
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        campaignId: 'cam-102',
        name: 'Retargeting - Website Visitors',
        status: 'PAUSED',
        objectiveType: 'WEBSITE_CONVERSIONS',
        budget: { daily: 20, total: 500, currencyCode: 'USD' },
        metrics: { impressions: 4200, clicks: 120, spend: 85.00, conversions: 3 },
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    ];

    // Upsert mocked campaigns to DB
    for (const c of mockCampaigns) {
      await this.adCampaignModel.findOneAndUpdate(
        { campaignId: c.campaignId, userId: new Types.ObjectId(userId) },
        { ...c, accountId: account._id },
        { upsert: true, new: true }
      );
    }

    return this.adCampaignModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  // ===================== LINKEDIN OAUTH HELPERS =====================

  async handleLinkedInOAuthCallback(userId: string, code: string) {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('LinkedIn OAuth credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env');
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${this.configService.get('BACKEND_URL') || 'http://localhost:3000'}/linkedin-crm/oauth/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new BadRequestException(tokenData.error_description || 'Failed to exchange LinkedIn auth code');
    }

    // Fetch user profile from LinkedIn API
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();

    // Save account
    const account = await this.saveOrUpdateAccount(userId, {
      linkedinId: profile.sub,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + (tokenData.expires_in * 1000),
      profileName: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
      headline: profile.headline || '',
      profileImageUrl: profile.picture || '',
      email: profile.email || '',
      location: profile.locale ? `${profile.locale.language}-${profile.locale.country}` : '',
      rawProfile: profile,
    });

    return { success: true, account };
  }

  getLinkedInOAuthUrl(userId: string): string {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const redirectUri = `${this.configService.get('BACKEND_URL') || 'http://localhost:3000'}/linkedin-crm/oauth/callback`;
    
    const scope = [
      'openid',
      'profile',
      'email',
      'w_member_social',
      // 'rw_ads', // Temporarily disabled: requires Marketing Developer Platform approval
      // 'r_ads',
      // 'r_ads_reporting',
    ].join(' ');

    return `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${userId}`;
  }
}
