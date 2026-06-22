import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedInLeadDocument = LinkedInLead & Document;

@Schema({ timestamps: true })
export class LinkedInLead {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  headline?: string;

  @Prop()
  profileImageUrl?: string;

  @Prop()
  linkedinProfileUrl?: string;

  @Prop()
  linkedinId?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  location?: string;

  @Prop()
  industry?: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop()
  bio?: string;

  @Prop({ type: Object, default: {} })
  experience: Record<string, any>;

  // CRM fields
  @Prop({ default: 'new', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] })
  stage: string;

  @Prop({ default: 0 })
  aiLeadScore: number; // 0-100

  @Prop({ default: 0 })
  networkingScore: number; // 0-100

  @Prop({ default: 0 })
  hiringScore: number; // 0-100

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [{ message: String, type: { type: String }, timestamp: Date, author: String }], default: [] })
  notes: Array<{
    message: string;
    type: string; // 'note', 'call', 'email', 'meeting'
    timestamp: Date;
    author: string;
  }>;

  @Prop({ type: [{ action: String, timestamp: Date, details: String }], default: [] })
  activityLog: Array<{
    action: string;
    timestamp: Date;
    details: string;
  }>;

  @Prop()
  aiSummary?: string; // AI-generated profile summary

  @Prop({ type: [String], default: [] })
  aiSuggestedKeywords: string[];

  @Prop({ type: [String], default: [] })
  aiProfileImprovements: string[];

  @Prop()
  assignedTo?: string; // Team member assignment

  @Prop({ default: 'medium', enum: ['low', 'medium', 'high', 'critical'] })
  priority: string;

  @Prop()
  lastContactedAt?: Date;

  @Prop()
  nextFollowUpAt?: Date;

  @Prop({ default: 'active', enum: ['active', 'archived', 'deleted'] })
  status: string;

  @Prop({ type: Object, default: {} })
  rawScrapedData: Record<string, any>;

  @Prop({ default: 'manual', enum: ['manual', 'scraped', 'imported', 'chrome-extension'] })
  source: string;
}

export const LinkedInLeadSchema = SchemaFactory.createForClass(LinkedInLead);
