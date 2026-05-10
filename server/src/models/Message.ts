import { Schema, model, Types } from 'mongoose';

const AttachmentSchema = new Schema(
  {
    name: String,
    mimeType: String,
    size: Number,
    url: String,
    dataUrl: String,
    kind: { type: String, enum: ['image', 'audio', 'video', 'file'], default: 'file' }
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    chatId: { type: Types.ObjectId, ref: 'Chat', required: true, index: true },
    role: { type: String, enum: ['system', 'user', 'assistant', 'tool'], required: true },
    content: { type: String, default: '' },
    modelId: String,
    attachments: [AttachmentSchema],
    reactions: [{ type: String }],
    tokenEstimate: Number,
    error: String
  },
  { timestamps: true }
);

export const Message = model('Message', MessageSchema);
