import { ModelConfig } from '../models/ModelConfig.js';
import type { EndpointType, ModelCapability } from '../types/index.js';

const defaultModels = [
  {
    modelId: 'meta/llama-3.1-70b-instruct',
    label: 'Llama 3.1 70B Instruct',
    capabilities: ['text'] as ModelCapability[],
    endpointType: 'chat' as EndpointType,
    contextWindow: 131072
  },
  {
    modelId: 'meta/llama-3.1-8b-instruct',
    label: 'Llama 3.1 8B Instruct',
    capabilities: ['text'] as ModelCapability[],
    endpointType: 'chat' as EndpointType,
    contextWindow: 131072
  },
  {
    modelId: 'mistralai/mixtral-8x7b-instruct-v0.1',
    label: 'Mixtral 8x7B Instruct',
    capabilities: ['text'] as ModelCapability[],
    endpointType: 'chat' as EndpointType,
    contextWindow: 32768
  },
  {
    modelId: 'nvidia/neva-22b',
    label: 'NEVA Vision',
    capabilities: ['text', 'images', 'multimodal'] as ModelCapability[],
    endpointType: 'vision' as EndpointType,
    contextWindow: 4096
  },
  {
    modelId: 'nvidia/nv-embedqa-e5-v5',
    label: 'NV EmbedQA E5 v5',
    capabilities: ['embeddings'] as ModelCapability[],
    endpointType: 'embedding' as EndpointType
  }
];

function inferredModelConfig(modelId: string) {
  const normalized = modelId.toLowerCase();
  if (normalized.includes('qwen-image') || normalized.includes('flux') || normalized.includes('stable-diffusion')) {
    return {
      capabilities: ['text', 'images'] as ModelCapability[],
      endpointType: 'image' as EndpointType,
      contextWindow: 4096,
      maxUploadMb: 0
    };
  }

  return {
    capabilities: ['text'] as ModelCapability[],
    endpointType: 'chat' as EndpointType,
    contextWindow: 8192,
    maxUploadMb: 20
  };
}

export async function seedDefaultModels() {
  await Promise.all(
    defaultModels.map((model) =>
      ModelConfig.updateOne({ modelId: model.modelId }, { $setOnInsert: model }, { upsert: true })
    )
  );
}

export async function listModels() {
  const models = await ModelConfig.find({ enabled: true }).sort({ label: 1 }).lean();
  return models;
}

export async function upsertModelConfig(input: {
  modelId: string;
  label?: string;
  capabilities?: ModelCapability[];
  endpointType?: EndpointType;
  contextWindow?: number;
  maxUploadMb?: number;
}) {
  const inferred = inferredModelConfig(input.modelId);
  return ModelConfig.findOneAndUpdate(
    { modelId: input.modelId },
    {
      $set: {
        label: input.label || input.modelId,
        capabilities: input.capabilities?.length ? input.capabilities : inferred.capabilities,
        endpointType: input.endpointType || inferred.endpointType,
        contextWindow: input.contextWindow || inferred.contextWindow,
        maxUploadMb: input.maxUploadMb ?? inferred.maxUploadMb,
        enabled: true
      }
    },
    { upsert: true, new: true }
  ).lean();
}

export async function deleteModelConfig(modelId: string) {
  return ModelConfig.findOneAndUpdate({ modelId }, { $set: { enabled: false } }, { new: true }).lean();
}

export async function resolveModelConfig(modelId: string) {
  const stored = await ModelConfig.findOne({ modelId, enabled: true }).lean();
  const inferred = inferredModelConfig(modelId);
  if (stored) {
    if (stored.endpointType === 'chat' && inferred.endpointType === 'image') {
      return upsertModelConfig({ modelId, label: stored.label, endpointType: 'image', capabilities: inferred.capabilities });
    }
    return stored;
  }
  return upsertModelConfig({ modelId, label: modelId, capabilities: inferred.capabilities, endpointType: inferred.endpointType });
}
