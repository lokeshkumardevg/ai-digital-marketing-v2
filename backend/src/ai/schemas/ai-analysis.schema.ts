import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiAnalysisDocument = AiAnalysis & Document;

@Schema({ timestamps: true })
export class AiAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // 'market-research', 'competitor-analysis', 'audience-insights', etc.

  @Prop({ required: true })
  brandName: string;

  @Prop({ required: true })
  brandUrl: string;

  @Prop({ type: Object, required: true })
  result: any; // The analyzed JSON result from AI

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const AiAnalysisSchema = SchemaFactory.createForClass(AiAnalysis);
