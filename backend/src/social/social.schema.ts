import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SocialPost extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [String], default: [] })
  platforms: string[];

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop({ required: true })
  workspaceId: string;

  @Prop()
  scheduledFor?: Date;

  @Prop({ type: Object, default: {} })
  results?: Record<string, { success: boolean; postId?: string; error?: string }>;
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPost);
