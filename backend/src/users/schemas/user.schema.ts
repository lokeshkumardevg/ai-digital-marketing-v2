import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'free' })
  subscriptionTier: string;

  @Prop({ default: 'client' })
  role: string; // 'admin', 'client', 'agency'

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop()
  googleDeveloperToken?: string;

  @Prop()
  googleClientId?: string;

  @Prop()
  googleClientSecret?: string;

  @Prop()
  googleRefreshToken?: string;

  @Prop()
  metaAppId?: string;

  @Prop()
  metaAppSecret?: string;

  @Prop()
  metaAccessToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

