import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

@Schema({ collection: 'review_recommendations', timestamps: true })
export class Recommendation {
  @Prop({ type: [Types.ObjectId], ref: 'ReviewAgent' })  
  reviewIds: Types.ObjectId[];

  @Prop()
  brandId: string;

  @Prop()
  userId: string;

  @Prop()
  sentiment: string;

  @Prop({ type: [String] })
  issues: string[];

  @Prop({ type: [String] })
  recommendations: string[];

  @Prop()
  month: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);