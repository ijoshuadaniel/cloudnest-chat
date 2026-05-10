import { Schema, model } from 'mongoose';
import type { EndpointType, ModelCapability } from '../types/index.js';

export interface ModelConfigDocument {
  modelId: string;
  label: string;
  provider: 'nvidia';
  capabilities: ModelCapability[];
  endpointType: EndpointType;
  contextWindow?: number;
  maxUploadMb?: number;
  enabled: boolean;
}

const ModelConfigSchema = new Schema<ModelConfigDocument>(
  {
    modelId: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    provider: { type: String, default: 'nvidia' },
    capabilities: [{ type: String, required: true }],
    endpointType: { type: String, enum: ['chat', 'vision', 'audio', 'embedding', 'image', 'multimodal'], default: 'chat' },
    contextWindow: { type: Number, default: 8192 },
    maxUploadMb: { type: Number, default: 20 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ModelConfig = model<ModelConfigDocument>('ModelConfig', ModelConfigSchema);
