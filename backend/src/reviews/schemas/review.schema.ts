import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true }) brandId: string;
  @Prop({ required: true, enum: ['google', 'facebook', 'trustpilot', 'website'] }) platform: string;
  @Prop({ required: true }) reviewerName: string;
  @Prop() reviewerAvatar: string;
  @Prop({ required: true }) content: string;
  @Prop({ required: true, min: 1, max: 5 }) rating: number;
  @Prop({ default: 'pending', enum: ['pending', 'replied', 'ignored'] }) status: string;
  @Prop({ default: 'neutral', enum: ['positive', 'neutral', 'negative', 'mixed'] }) sentiment: string;
  @Prop({ type: [String], default: [] }) topics: string[];
  @Prop() generatedReply: string;
  @Prop() publishedReply: string;
  @Prop({ default: false }) isReplied: boolean;
  @Prop({ default: false }) isResolved: boolean;
  @Prop() externalId: string;
  @Prop() reviewDate: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
