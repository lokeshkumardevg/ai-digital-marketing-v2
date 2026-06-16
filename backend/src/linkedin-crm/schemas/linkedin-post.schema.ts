import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedInPostDocument = LinkedInPost & Document;

@Schema({ timestamps: true })
export class LinkedInPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop()
  linkedinPostId?: string; // Original LinkedIn post ID

  @Prop()
  authorName?: string;

  @Prop()
  authorLinkedinUrl?: string;

  @Prop()
  authorHeadline?: string;

  @Prop()
  authorProfileImage?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ default: 'text', enum: ['text', 'image', 'video', 'article', 'poll', 'carousel'] })
  postType: string;

  @Prop()
  originalUrl?: string;

  // Engagement metrics
  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop({ default: 0 })
  impressions: number;

  // AI Analysis fields
  @Prop({ default: 0 })
  viralScore: number; // 0-100

  @Prop({ default: 0 })
  engagementPrediction: number; // predicted engagement rate

  @Prop()
  hookQuality?: string; // 'weak', 'average', 'strong', 'viral'

  @Prop()
  ctaAnalysis?: string;

  @Prop()
  aiRewriteSuggestion?: string;

  @Prop({ type: [String], default: [] })
  aiTopics: string[];

  @Prop()
  sentimentAnalysis?: string; // 'positive', 'negative', 'neutral'

  @Prop()
  readabilityScore?: number;

  @Prop({ type: Object, default: {} })
  aiFullAnalysis: Record<string, any>; // Full AI analysis JSON

  @Prop()
  postedAt?: Date;

  @Prop()
  status?: string;

  @Prop()
  author?: string;

  @Prop({ default: 'scraped', enum: ['scraped', 'api', 'manual'] })
  source: string;

  @Prop({ type: Object, default: {} })
  rawData: Record<string, any>;
}

export const LinkedInPostSchema = SchemaFactory.createForClass(LinkedInPost);
