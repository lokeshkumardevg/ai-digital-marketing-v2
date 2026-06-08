import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InsightDocument = Insight & Document;

@Schema({ timestamps: true })
export class Insight {
  @Prop({ required: true }) brandId: string;
  @Prop({ required: true, enum: ['campaign_idea', 'social_post', 'email_copy', 'insight'] }) type: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop({ default: 'high', enum: ['high', 'medium', 'low'] }) priority: string;
  @Prop({ default: false }) read: boolean;
  @Prop() generatedAt: Date;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);