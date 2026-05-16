import { Schema, InferSchemaType } from 'mongoose';

// NOTE: The existing project uses a misspelled schema export `CampaigndSchema`.
// To keep backwards compatibility, we keep it and also export the correctly named
// symbols expected by other modules (analytics).
export const CampaigndSchema = new Schema(
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

    name: {
      type: String,
      required: true,
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

// Correctly named re-exports / aliases
export const CampaignSchema = CampaigndSchema;

export type CampaignDocument = InferSchemaType<typeof CampaignSchema>;

// A Nest/Mongoose token name used in forFeature can be either a class or a string.
// Analytics imports `Campaign` from this file, so export a simple string constant.
export const Campaign = 'Campaign';

