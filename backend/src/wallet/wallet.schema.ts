import { Schema } from 'mongoose';

export const WalletSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
