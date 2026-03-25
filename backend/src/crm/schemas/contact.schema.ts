import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Audience } from './audience.schema';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ default: 0 })
  aiLeadScore: number; // 0-100 indicating likelihood to convert

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Audience' }] })
  audiences: Audience[];

  @Prop({ default: 'lead' })
  stage: string; // 'lead', 'prospect', 'customer', 'churned'
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
