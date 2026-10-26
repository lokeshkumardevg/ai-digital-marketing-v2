import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AutoPostTopic extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  workspaceId: string;

  /** The niche/topic the AI should generate posts about */
  @Prop({ required: true })
  topic: string;

  /** Extra context/instructions for the AI */
  @Prop({ default: '' })
  context: string;

  /** Tone of the generated post: professional, casual, witty, etc. */
  @Prop({ default: 'professional' })
  tone: string;

  /** Platforms to auto-post to */
  @Prop({ type: [String], default: ['linkedin', 'facebook'] })
  platforms: string[];

  /** Frequency: daily, twice_daily, weekly, custom */
  @Prop({ default: 'daily' })
  frequency: string;

  /** Preferred posting time (HH:mm in user's timezone, e.g. '09:00') */
  @Prop({ default: '09:00' })
  preferredTime: string;

  /** User's timezone, e.g. 'Asia/Kolkata' */
  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;

  /** Whether this auto-post topic is active */
  @Prop({ default: true })
  isActive: boolean;

  /** Track last posted time so cron doesn't double-post */
  @Prop()
  lastPostedAt?: Date;

  /** Counter: total posts generated */
  @Prop({ default: 0 })
  totalPostsGenerated: number;

  /** Optional: hashtags to always include */
  @Prop({ type: [String], default: [] })
  hashtags: string[];

  /** Optional: language preference */
  @Prop({ default: 'english' })
  language: string;
}

export const AutoPostTopicSchema = SchemaFactory.createForClass(AutoPostTopic);
