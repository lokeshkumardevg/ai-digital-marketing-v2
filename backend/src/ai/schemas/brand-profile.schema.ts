import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandProfileDocument = HydratedDocument<BrandProfile>;

@Schema()
export class BrandProfile {
  @Prop({ required: true, index: true })
  projectId!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  brandName!: string;

  @Prop({ type: Object, required: true })
  data!: any;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const BrandProfileSchema = SchemaFactory.createForClass(BrandProfile);

