import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialPost } from './social.schema';
import { AppGateway } from '../app.gateway';
import { UsersService } from '../users/users.service';
import { SocialAuthService } from './social-auth.service';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PublishSocialDto } from './dto/publish-social.dto';
import { ScheduleSocialDto } from './dto/schedule-social.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    @InjectModel(SocialPost.name) private socialModel: Model<SocialPost>,
    private readonly gateway: AppGateway,
    private readonly usersService: UsersService,
    private readonly socialAuthService: SocialAuthService,
    private readonly notifService: NotificationsService,
  ) { }

  async findAll(userId: string, workspaceId?: string): Promise<SocialPost[]> {
    const filter: Record<string, string> = { userId };
    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    return this.socialModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async create(dto: Partial<SocialPost>): Promise<SocialPost> {
    const newPost = new this.socialModel(dto);
    const saved = await newPost.save();
    return saved;
  }

  async publishPost(userId: string, dto: PublishSocialDto) {
    const post = await this.create({
      userId,
      content: dto.content,
      media: dto.media || [],
      platforms: dto.platforms.map((p) => p.toLowerCase()),
      status: 'processing',
      workspaceId: dto.workspaceId || 'default',
    });

    const results = await this.publishToPlatforms(userId, dto.content, dto.media || [], dto.platforms);
    const hasFailures = Object.values(results).some((result) => !result.success);
    const platforms = dto.platforms.map((platform) => platform.toLowerCase());
    const successCount = Object.values(results).filter((result) => result.success).length;
    post.status = hasFailures ? 'partial_failed' : 'published';
    post.results = results;
    await this.notifService.notifySocial(
      dto.workspaceId || 'default',
      platforms.join(', '),
      successCount > 0 ? 'published' : 'failed',
      { postId: post._id },
    );
    await post.save();
    return post;
  }

  async schedulePost(userId: string, dto: ScheduleSocialDto) {
    const scheduledDate = new Date(dto.scheduledFor);
    const post = await this.create({
      userId,
      content: dto.content,
      media: dto.media || [],
      platforms: dto.platforms.map((p) => p.toLowerCase()),
      status: 'scheduled',
      scheduledFor: scheduledDate,
      workspaceId: dto.workspaceId || 'default',
    });
    return post;
  }

  async getConnections(userId: string) {
    return this.socialAuthService.getConnections(userId);
  }

  async postToLinkedIn(userId: string, content: string, media: string[] = []) {
    const user = await this.usersService.findById(userId);
    if (!user?.linkedinAccessToken || !user.linkedinPersonUrn) {
      throw new NotFoundException('LinkedIn is not connected. Please reconnect LinkedIn from the Social Hub page.');
    }

    // linkedinPersonUrn may be just the ID or the full URN
    const authorUrn = user.linkedinPersonUrn.startsWith('urn:li:')
      ? user.linkedinPersonUrn
      : `urn:li:person:${user.linkedinPersonUrn}`;

    this.logger.log(`LinkedIn postToLinkedIn authorUrn: ${authorUrn}`);

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: media.length ? 'IMAGE' : 'NONE',
          media: media.length ? media.map((url) => ({ status: 'READY', originalUrl: url })) : [],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    return this.executePlatformCall('linkedin', async () => {
      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
        headers: {
          Authorization: `Bearer ${user.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202606',
        },
      });
      return response.data?.id || response.headers['x-restli-id'];
    });
  }

  async postToTwitter(userId: string, content: string, media: string[] = []) {
    const user = await this.usersService.findById(userId);
    if (!user?.twitterAccessToken) {
      throw new NotFoundException('Twitter is not connected.');
    }

    const payload: Record<string, any> = { text: content };
    if (media.length) {
      payload.media = { media_ids: media };
    }

    return this.executePlatformCall('twitter', async () => {
      try {
        const response = await axios.post('https://api.twitter.com/2/tweets', payload, {
          headers: { Authorization: `Bearer ${user.twitterAccessToken}` },
        });
        return response.data?.data?.id;
      } catch {
        const refreshedToken = await this.socialAuthService.refreshToken(userId, 'twitter');
        if (!refreshedToken) {
          throw new Error('Twitter token refresh failed.');
        }
        const retry = await axios.post('https://api.twitter.com/2/tweets', payload, {
          headers: { Authorization: `Bearer ${refreshedToken}` },
        });
        return retry.data?.data?.id;
      }
    });
  }

  async postToFacebook(userId: string, content: string, media: string[] = []) {
    const user = await this.usersService.findById(userId);
    if (!user?.metaAccessToken) {
      throw new NotFoundException('Facebook is not connected.');
    }

    const pageId = process.env.META_DEFAULT_PAGE_ID;
    if (!pageId) {
      throw new NotFoundException('META_DEFAULT_PAGE_ID is not configured.');
    }

    return this.executePlatformCall('facebook', async () => {
      const endpoint = media.length
        ? `https://graph.facebook.com/v20.0/${pageId}/photos`
        : `https://graph.facebook.com/v20.0/${pageId}/feed`;
      const payload = media.length
        ? { url: media[0], caption: content, access_token: user.metaAccessToken }
        : { message: content, access_token: user.metaAccessToken };
      const response = await axios.post(endpoint, payload);
      return response.data?.id;
    });
  }

  async postToInstagram(userId: string, content: string, media: string[] = []) {
    const user = await this.usersService.findById(userId);
    if (!user?.instagramAccessToken || !user.instagramUserId) {
      throw new NotFoundException('Instagram is not connected.');
    }

    if (!media.length) {
      throw new NotFoundException('Instagram requires at least one image URL.');
    }

    return this.executePlatformCall('instagram', async () => {
      const createContainer = await axios.post(
        `https://graph.facebook.com/v20.0/${user.instagramUserId}/media`,
        {
          image_url: media[0],
          caption: content,
          access_token: user.instagramAccessToken,
        },
      );

      const publish = await axios.post(
        `https://graph.facebook.com/v20.0/${user.instagramUserId}/media_publish`,
        {
          creation_id: createContainer.data.id,
          access_token: user.instagramAccessToken,
        },
      );

      return publish.data?.id;
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts() {
    const duePosts = await this.socialModel
      .find({
        status: 'scheduled',
        scheduledFor: { $lte: new Date() },
      })
      .limit(50)
      .exec();

    for (const post of duePosts) {
      try {
        post.status = 'processing';
        await post.save();
        const results = await this.publishToPlatforms(
          post.userId,
          post.content,
          post.media || [],
          post.platforms || [],
        );
        const hasFailures = Object.values(results).some((result) => !result.success);
        post.status = hasFailures ? 'partial_failed' : 'published';
        post.results = results;
        await post.save();
      } catch (error) {
        this.logger.error(`Failed scheduled post ${post.id}`, error instanceof Error ? error.stack : '');
        post.status = 'failed';
        post.results = {
          global: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        };
        await post.save();
      }
    }
  }

  private async publishToPlatforms(
    userId: string,
    content: string,
    media: string[],
    platforms: string[],
  ): Promise<Record<string, { success: boolean; postId?: string; error?: string }>> {
    const normalized = platforms.map((platform) => platform.toLowerCase());
    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {};

    for (const platform of normalized) {
      if (platform === 'linkedin') {
        results[platform] = await this.postToLinkedIn(userId, content, media);
        continue;
      }
      if (platform === 'twitter') {
        results[platform] = await this.postToTwitter(userId, content, media);
        continue;
      }
      if (platform === 'facebook') {
        results[platform] = await this.postToFacebook(userId, content, media);
        continue;
      }
      if (platform === 'instagram') {
        results[platform] = await this.postToInstagram(userId, content, media);
        continue;
      }
      results[platform] = { success: false, error: `Unsupported platform "${platform}"` };
    }

    const successCount = Object.values(results).filter((result) => result.success).length;
    this.gateway.sendGlobalEvent({
      title: successCount > 0 ? 'Social publish complete' : 'Social publish failed',
      message: `Published to ${successCount}/${normalized.length} selected platforms.`,
      type: successCount > 0 ? 'success' : 'error',
    });

    return results;
  }

  private async executePlatformCall(
    platform: string,
    operation: () => Promise<string>,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const postId = await operation();
      return { success: true, postId };
    } catch (error) {
      const message = this.getPlatformError(platform, error);
      this.logger.error(`${platform} publish failed`, error instanceof Error ? error.stack : '');
      return { success: false, error: message };
    }
  }

  private getPlatformError(platform: string, error: unknown): string {
    if (axios.isAxiosError(error)) {
      const apiMessage =
        (error.response?.data as any)?.error?.message ||
        (error.response?.data as any)?.detail ||
        error.message;
      return `[${platform}] ${apiMessage}`;
    }

    if (error instanceof Error) {
      return `[${platform}] ${error.message}`;
    }

    return `[${platform}] Unknown API error`;
  }
}
