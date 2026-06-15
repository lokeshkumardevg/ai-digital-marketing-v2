import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) brandId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop() phone: string;
  @Prop({ default: 'pending', enum: ['pending', 'sent', 'completed'] }) reviewStatus: string;
  @Prop({ default: 'manual', enum: ['manual', 'csv', 'website', 'shopify', 'referral'] }) source: string;
  @Prop({ default: 'pending', enum: ['pending', 'active', 'inactive'] }) status: string;
  @Prop() lastPurchase?: Date;
  @Prop() totalSpent?: number;
}


export const CustomerSchema = SchemaFactory.createForClass(Customer);