import { Schema, model, Types } from 'mongoose';

const UsageLogSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    chatId: { type: Types.ObjectId, ref: 'Chat' },
    modelId: { type: String, index: true },
    promptTokens: Number,
    completionTokens: Number,
    latencyMs: Number,
    status: String,
    errorCode: String
  },
  { timestamps: true }
);

export const UsageLog = model('UsageLog', UsageLogSchema);
