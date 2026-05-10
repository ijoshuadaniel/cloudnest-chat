import { Schema, model, Types } from 'mongoose';

const ChatSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    title: { type: String, default: 'New chat' },
    category: { type: String },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    modelId: { type: String, required: true },
    lastMessageAt: { type: Date, default: Date.now },
    summary: String,
    persona: String
  },
  { timestamps: true }
);

ChatSchema.index({ title: 'text', category: 'text', summary: 'text' });

export const Chat = model('Chat', ChatSchema);
