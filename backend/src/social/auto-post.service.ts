import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutoPostTopic } from './auto-post.schema';
import { CreateAutoPostTopicDto, UpdateAutoPostTopicDto } from './dto/auto-post.dto';
import { AiService } from '../ai/ai.service';
import { SocialService } from './social.service';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AutoPostService {
  private readonly logger = new Logger(AutoPostService.name);

  constructor(
    @InjectModel(AutoPostTopic.name) private autoPostModel: Model<AutoPostTopic>,
    private readonly aiService: AiService,
    private readonly socialService: SocialService,
    private readonly notifService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateAutoPostTopicDto): Promise<AutoPostTopic> {
    const topic = new this.autoPostModel({
      userId,
      workspaceId: dto.workspaceId || 'default',
      topic: dto.topic,
      context: dto.context || '',
      tone: dto.tone || 'professional',
      platforms: dto.platforms,
      frequency: dto.frequency || 'daily',
      preferredTime: dto.preferredTime || '09:00',
      timezone: dto.timezone || 'Asia/Kolkata',
      hashtags: dto.hashtags || [],
      language: dto.language || 'english',
      isActive: true,
    });
    return topic.save();
  }

  async findAll(userId: string, workspaceId?: string): Promise<AutoPostTopic[]> {
    const filter: Record<string, string> = { userId };
    if (workspaceId) filter.workspaceId = workspaceId;
    return this.autoPostModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<AutoPostTopic> {
    const topic = await this.autoPostModel.findById(id).exec();
    if (!topic) throw new NotFoundException('Auto-post topic not found.');
    return topic;
  }

  async update(id: string, userId: string, dto: UpdateAutoPostTopicDto): Promise<AutoPostTopic> {
    const topic = await this.autoPostModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: dto },
      { new: true },
    ).exec();
    if (!topic) throw new NotFoundException('Auto-post topic not found.');
    return topic;
  }

  async toggle(id: string, userId: string): Promise<AutoPostTopic> {
    const topic = await this.autoPostModel.findOne({ _id: id, userId }).exec();
    if (!topic) throw new NotFoundException('Auto-post topic not found.');
    topic.isActive = !topic.isActive;
    return topic.save();
  }

  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    const result = await this.autoPostModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Auto-post topic not found.');
    return { deleted: true };
  }

  /** Generate a social media post using AI based on topic configuration */
  async generatePostContent(topic: AutoPostTopic): Promise<string> {
    const hashtagStr = topic.hashtags?.length ? `\nAlways include these hashtags: ${topic.hashtags.join(' ')}` : '';
    const prompt = `Generate a social media post about "${topic.topic}".
${topic.context ? `Additional context: ${topic.context}` : ''}
Tone: ${topic.tone}
Language: ${topic.language}
Target platforms: ${topic.platforms.join(', ')}${hashtagStr}

Requirements:
- Keep it engaging, concise, and platform-appropriate
- Include relevant emojis
- If posting to LinkedIn, keep it professional yet engaging
- Maximum 280 characters for Twitter, 500 for others
- Make it unique and not repetitive
- Do NOT wrap the response in quotes or markdown
- Return ONLY the post text, nothing else`;

    const systemPrompt = `You are an expert social media content creator. You create viral, engaging posts that drive engagement and conversions. You write naturally and avoid generic corporate language. Always return just the post text, no explanations or formatting.`;

    const content = await this.aiService.generateContent(prompt, systemPrompt);
    return typeof content === 'string' ? content.trim() : JSON.stringify(content);
  }

  /** Generate a post preview without publishing */
  async previewPost(id: string, userId: string): Promise<{ content: string }> {
    const topic = await this.autoPostModel.findOne({ _id: id, userId }).exec();
    if (!topic) throw new NotFoundException('Auto-post topic not found.');
    const content = await this.generatePostContent(topic);
    return { content };
  }

  /** Manually trigger an AI post for a topic */
  async triggerPost(id: string, userId: string): Promise<any> {
    const topic = await this.autoPostModel.findOne({ _id: id, userId }).exec();
    if (!topic) throw new NotFoundException('Auto-post topic not found.');

    const content = await this.generatePostContent(topic);

    // Publish through existing social service
    const post = await this.socialService.publishPost(userId, {
      content,
      platforms: topic.platforms,
      workspaceId: topic.workspaceId,
    });

    // Update stats
    topic.lastPostedAt = new Date();
    topic.totalPostsGenerated = (topic.totalPostsGenerated || 0) + 1;
    await topic.save();

    return { generatedContent: content, post };
  }

  /**
   * CRON: Runs every 5 minutes to check if any auto-post topics need publishing.
   * Compares current time (in topic's timezone) against preferredTime.
   */
  @Cron('*/5 * * * *')
  async processAutoPostTopics() {
    const activeTopics = await this.autoPostModel.find({ isActive: true }).exec();

    for (const topic of activeTopics) {
      try {
        if (!this.shouldPostNow(topic)) continue;

        this.logger.log(`Auto-posting for topic: "${topic.topic}" (user: ${topic.userId})`);

        const content = await this.generatePostContent(topic);

        await this.socialService.publishPost(topic.userId, {
          content,
          platforms: topic.platforms,
          workspaceId: topic.workspaceId,
        });

        topic.lastPostedAt = new Date();
        topic.totalPostsGenerated = (topic.totalPostsGenerated || 0) + 1;
        await topic.save();

        await this.notifService.notifySocial(
          topic.workspaceId,
          topic.platforms.join(', '),
          'published',
          { autoPost: true, topic: topic.topic },
        );

        this.logger.log(`✅ Auto-posted: "${topic.topic}" to ${topic.platforms.join(', ')}`);
      } catch (error) {
        this.logger.error(`❌ Auto-post failed for topic "${topic.topic}":`, error instanceof Error ? error.stack : '');
      }
    }
  }

  private shouldPostNow(topic: AutoPostTopic): boolean {
    const now = new Date();

    // Get current time in topic's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: topic.timezone || 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

    const [prefHour, prefMinute] = (topic.preferredTime || '09:00').split(':').map(Number);

    // Only fire within the 5-minute window of preferred time
    const currentTotalMin = currentHour * 60 + currentMinute;
    const prefTotalMin = prefHour * 60 + prefMinute;
    if (Math.abs(currentTotalMin - prefTotalMin) > 4) return false;

    // Check frequency
    if (!topic.lastPostedAt) return true;

    const hoursSinceLastPost = (now.getTime() - new Date(topic.lastPostedAt).getTime()) / (1000 * 60 * 60);

    switch (topic.frequency) {
      case 'twice_daily':
        return hoursSinceLastPost >= 10;
      case 'daily':
        return hoursSinceLastPost >= 20;
      case 'every_3_days':
        return hoursSinceLastPost >= 68;
      case 'weekly':
        return hoursSinceLastPost >= 164;
      default:
        return hoursSinceLastPost >= 20;
    }
  }
}
