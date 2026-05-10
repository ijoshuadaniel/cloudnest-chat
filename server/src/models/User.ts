import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, index: true, sparse: true },
    name: String,
    passwordHash: String,
    preferences: {
      theme: { type: String, default: 'dark' },
      defaultModelId: String
    }
  },
  { timestamps: true }
);

export const User = model('User', UserSchema);
