import { z } from 'zod';
import { deleteModelConfig, listModels, upsertModelConfig } from '../services/modelRegistry.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/errors.js';

const modelSchema = z.object({
  modelId: z.string().min(2),
  label: z.string().optional(),
  capabilities: z.array(z.enum(['text', 'images', 'audio', 'video', 'embeddings', 'multimodal'])).optional(),
  endpointType: z.enum(['chat', 'vision', 'audio', 'embedding', 'image', 'multimodal']).optional(),
  contextWindow: z.number().optional(),
  maxUploadMb: z.number().optional()
});

export const getModels = asyncHandler(async (_req, res) => {
  res.json({ models: await listModels() });
});

export const saveModel = asyncHandler(async (req, res) => {
  const input = modelSchema.parse(req.body);
  res.status(201).json({ model: await upsertModelConfig(input) });
});

export const deleteModel = asyncHandler(async (req, res) => {
  const modelId = z.string().min(2).parse(req.params.modelId);
  const deleted = await deleteModelConfig(modelId);
  if (!deleted) throw new AppError('Model not found', 404, 'MODEL_NOT_FOUND');
  res.status(204).send();
});
