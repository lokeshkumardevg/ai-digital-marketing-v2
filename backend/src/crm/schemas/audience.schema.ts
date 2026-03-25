import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AudienceDocument = Audience & Document;

@Schema({ timestamps: true })
export class Audience {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: {
      minAge: Number,
      maxAge: Number,
      locations: [String],
      interests: [String],
    },
  })
  targetingCriteria: Record<string, any>;

  @Prop({ default: 0 })
  estimatedSize: number;

  @Prop({ default: 'active' })
  status: string; // 'active', 'archived'
}

export const AudienceSchema = SchemaFactory.createForClass(Audience);
