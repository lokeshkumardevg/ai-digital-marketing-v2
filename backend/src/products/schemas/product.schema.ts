import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 'Manual' })
  source: string;

  @Prop()
  price: number;

  @Prop()
  category: string;

  @Prop()
  imageUrl: string;

  @Prop()
  externalUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
