import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewAgentDocument = ReviewAgent & Document;

@Schema({ collection: 'reviews' })
export class ReviewAgent {
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop()
  reviewerName?: string;

  @Prop({ default: 'pending' })
  status: string;

  // Used to identify which brand/user a review (and its recommendations) belong to
  @Prop()
  brandId?: string;

  @Prop()
  userId?: string;

  // Populated by the reply-generation agent
  @Prop()
  generated_review?: string;

  // Populated by the analysis/recommendation agent
  @Prop()
  sentiment?: string;

  @Prop({ type: [String], default: [] })
  issues?: string[];

  @Prop({ type: [String], default: [] })
  recommendations?: string[];
}

export const ReviewAgentSchema = SchemaFactory.createForClass(ReviewAgent);