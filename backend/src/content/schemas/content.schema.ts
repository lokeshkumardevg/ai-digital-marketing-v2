import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  contentType: string; // 'blog', 'social_post', 'email'

  @Prop()
  body: string;

  @Prop()
  imageUrl: string;

  @Prop([String])
  platforms: string[]; // e.g., ['linkedin', 'twitter', 'wordpress']

  @Prop({ default: 'draft' })
  status: string; // 'draft', 'scheduled', 'published'

  @Prop()
  scheduledFor: Date;

  @Prop({ type: Object })
  seoMetrics: {
    keywordDensity: number;
    readabilityScore: number;
    estimatedRank: number;
  };
}

export const ContentSchema = SchemaFactory.createForClass(Content);
