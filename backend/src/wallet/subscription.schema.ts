import { Schema } from 'mongoose';

export const SubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    aiTokensUsedCurrentBillingCycle: { type: Number, default: 0 },
    aiTokenLimit: { type: Number, default: 10000 },
    currentPeriodEnd: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);
