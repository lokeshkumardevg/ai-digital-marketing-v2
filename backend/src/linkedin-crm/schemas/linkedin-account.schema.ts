import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedInAccountDocument = LinkedInAccount & Document;

@Schema({ timestamps: true })
export class LinkedInAccount {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  linkedinId: string; // LinkedIn person URN / sub

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  tokenExpiry?: number;

  @Prop()
  profileName: string;

  @Prop()
  headline?: string;

  @Prop()
  profileImageUrl?: string;

  @Prop()
  email?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: Object, default: {} })
  experience: Record<string, any>;

  @Prop({ type: Object, default: {} })
  education: Record<string, any>;

  @Prop()
  location?: string;

  @Prop()
  industry?: string;

  @Prop()
  publicProfileUrl?: string;

  @Prop({ default: 0 })
  connectionsCount: number;

  @Prop({ default: 'connected' })
  status: string; // 'connected', 'expired', 'disconnected'

  @Prop()
  connectedOrganizationUrn?: string;

  @Prop()
  connectedOrganizationName?: string;

  @Prop({ type: Object, default: {} })
  rawProfile: Record<string, any>; // Store the full raw LinkedIn API response

  @Prop()
  lastSyncedAt?: Date;

  @Prop()
  li_at?: string; // Session cookie for Playwright Scraper

  @Prop({ default: 'pending' })
  scraperStatus?: string; // 'pending', 'active', 'failed', 'completed'
}

export const LinkedInAccountSchema = SchemaFactory.createForClass(LinkedInAccount);
