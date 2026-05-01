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

  @Prop()
  linkedinAccessToken?: string;

  @Prop()
  linkedinRefreshToken?: string;

  @Prop()
  linkedinPersonId?: string;

  @Prop()
  twitterAccessToken?: string;

  @Prop()
  twitterRefreshToken?: string;

  @Prop()
  twitterUserId?: string;

  @Prop()
  instagramAccessToken?: string;

  @Prop()
  instagramUserId?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g., ['dashboard', 'ads', 'analytics', 'superadmin']
}

export const UserSchema = SchemaFactory.createForClass(User);

