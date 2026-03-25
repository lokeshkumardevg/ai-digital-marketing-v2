import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SocialPost extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ default: 'All Networks' })
  platform: string;

  @Prop({ default: 'Scheduled' })
  status: string;

  @Prop({ required: true })
  scheduledFor: Date;

  @Prop({ required: true })
  workspaceId: string;
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPost);
