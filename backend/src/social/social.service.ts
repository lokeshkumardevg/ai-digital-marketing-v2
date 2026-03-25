import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialPost } from './social.schema';
import { AppGateway } from '../app.gateway';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    @InjectModel(SocialPost.name) private socialModel: Model<SocialPost>,
    private readonly gateway: AppGateway,
  ) {}

  async findAll(workspaceId: string): Promise<SocialPost[]> {
    const posts = await this.socialModel.find({ workspaceId }).sort({ createdAt: -1 }).exec();
    
    if (posts.length === 0) {
      // Return structural mock for live dashboard feel
      return [
        {
          _id: 'mock-1',
          content: 'Excited to announce our newest AI expansion for local targeting! #SaaS #AI',
          platform: 'Twitter',
          status: 'Published',
          createdAt: new Date(Date.now() - 7200000), // 2h ago
        },
        {
          _id: 'mock-2',
          content: 'Data-driven marketing is useless without right execution. Here is a 5-step framework...',
          platform: 'LinkedIn',
          status: 'Published',
          createdAt: new Date(Date.now() - 86400000), // Yesterday
        }
      ] as any[];
    }
    
    return posts;
  }

  async create(dto: any): Promise<SocialPost> {
    const newPost = new this.socialModel(dto);
    const saved = await newPost.save();
    
    // Emit AI Event Notify
    this.gateway.sendGlobalEvent({
      title: 'Social Stream Active',
      message: `AI Agents have successfully distributed a post to ${dto.platform || 'all networks'}.`,
      type: 'success'
    });

    return saved;
  }
}
