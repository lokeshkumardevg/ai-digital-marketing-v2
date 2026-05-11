import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({ collection: 'contents', timestamps: true })
export class Content {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
contentType: string; // 'blog', 'social_post', 'email', 'image', 'video', 'text'

  @Prop()
  body: string;

  @Prop()
  imageUrl: string;

  @Prop()
thumbnailUrl: string;

@Prop()
lifetimeStart: Date;

@Prop()
lifetimeEnd: Date;

@Prop({ default: false })
isManualCreative: boolean;

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

ContentSchema.index({ createdAt: -1 });
