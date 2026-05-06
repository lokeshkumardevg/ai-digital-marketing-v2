import { Schema } from 'mongoose';

export const SessionSchema = new Schema({
  userId: { type: String, required: true, unique: true },

  version: String,
  url: String,
  urlStatus: String,
  isChatMode: Boolean,
  viewMode: String,

  // ✅ MUST be Mixed for large JSON
  brandDetails: { type: Schema.Types.Mixed },
  budgetBreakdown: { type: Schema.Types.Mixed },
  liveCampaign: { type: Schema.Types.Mixed },

  selectedPlatform: String,
  selectedTier: String,
  campaignId: String,

  // ✅ allow large array
  messages: { type: Array },

  updatedAt: String,
});