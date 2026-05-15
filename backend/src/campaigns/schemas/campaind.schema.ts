import { Schema } from 'mongoose';

export const CampaignSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    campaignId: {
      type: String,
      required: true,
      unique: true,
    },

    platform: {
      type: String,
      required: true,
    },

    data: {
      type: Object,
      default: {},
    },

    status: {
      type: String,
      default: 'DRAFT',
    },
  },
  {
    timestamps: true,
  },
);