import { Schema } from 'mongoose';

export const SessionSchema = new Schema({
  userId: { type: String, required: true, unique: true },

  version:    String,
  url:        String,
  urlStatus:  String,
  isChatMode: Boolean,
  viewMode:   String,

  // Complex JSON objects — must be Mixed
  brandDetails:    { type: Schema.Types.Mixed },
  budgetBreakdown: { type: Schema.Types.Mixed },
  liveCampaign:    { type: Schema.Types.Mixed },
  selectedTier:    { type: Schema.Types.Mixed }, // ← was String, caused CastError

  selectedPlatform: String,
  campaignId:       String,

  // Large message array
  messages: { type: Array },

  updatedAt: String,
},
{
  // Auto-update updatedAt on every save
  timestamps: { updatedAt: 'updatedAt', createdAt: 'createdAt' },
});