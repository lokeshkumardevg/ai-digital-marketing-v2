import { Schema } from 'mongoose';

export const TransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);
