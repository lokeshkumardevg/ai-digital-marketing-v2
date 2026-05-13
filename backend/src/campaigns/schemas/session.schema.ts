import { Schema } from 'mongoose';

export const SessionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },

    // Version sentinel — bump SESSION_VERSION in the service to invalidate old sessions
    version: { type: String, default: 'v2' },

    // ── Core campaign session fields (mirrors CampaignSession on the frontend) ──
    messages:      { type: Schema.Types.Mixed, default: [] },
    brandDetails:  { type: Schema.Types.Mixed, default: null },
    promoData:     { type: Schema.Types.Mixed, default: null },
    campaignId:    { type: String, default: null },
    viewMode:      { type: String, default: 'landing' },

    // ISO timestamp set by the frontend on every save
    savedAt: { type: String, default: null },
  },
  {
    // createdAt + updatedAt managed automatically by Mongoose
    // Do NOT also declare updatedAt as a plain field — that causes a conflict
    timestamps: true,
  },
);