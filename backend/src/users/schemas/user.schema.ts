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
  role: string; // 'admin', 'client', 'agency', 'superadmin'

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop()
  googleDeveloperToken?: string;

  @Prop()
  googleClientId?: string;

  @Prop()
  googleClientSecret?: string;

  @Prop()
  googleCustomerId?: string;

  @Prop()
  googleRefreshToken?: string;

  /** OAuth access token for Google Ads API (short-lived; refresh when integrating full OAuth) */
  @Prop()
  googleAccessToken?: string;

  @Prop()
  googleTokenExpiry?: number;

  @Prop()
  metaAppId?: string;

  @Prop()
  metaAppSecret?: string;

  @Prop()
  metaAccessToken?: string;
  @Prop({ required: false })
  metaAdAccountId?: string;

  @Prop({ required: false })
  metaAdAccountName?: string;

  @Prop({ required: false })
  metaBusinessId?: string;

  @Prop({ required: false })
  metaBusinessName?: string;

  @Prop()
  linkedinAccessToken?: string;

  @Prop()
  linkedinRefreshToken?: string;

  @Prop()
  linkedinPersonUrn?: string;

  @Prop()
  twitterAccessToken?: string;

  @Prop()
  twitterRefreshToken?: string;

  @Prop()
  twitterUserId?: string;

  @Prop()
  twitterUsername?: string; // The @handle (e.g. WheedleTech)

  @Prop()
  twitterName?: string; // Display name (e.g. Wheedle Technologies)

  @Prop()
  instagramAccessToken?: string;

  @Prop()
  instagramUserId?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g., ['dashboard', 'ads', 'analytics', 'superadmin']
}

export const UserSchema = SchemaFactory.createForClass(User);

