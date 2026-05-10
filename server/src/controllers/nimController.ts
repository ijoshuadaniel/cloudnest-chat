import { z } from 'zod';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { UsageLog } from '../models/UsageLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { trimMessagesForContext } from '../services/memoryService.js';
import { resolveModelConfig } from '../services/modelRegistry.js';
import { streamNimResponse } from '../services/nvidiaNimService.js';

const schema = z.object({
  chatId: z.string(),
  modelId: z.string().min(2),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string()
    })
  ),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        mimeType: z.string(),
        size: z.number(),
        url: z.string().optional(),
        dataUrl: z.string().optional()
      })
    )
    .default([])
});

export const streamChat = asyncHandler(async (req, res) => {
  const started = Date.now();
  const input = schema.parse(req.body);
  if (!env.NVIDIA_API_KEY) {
    throw new AppError('Missing NVIDIA_API_KEY in server environment', 500, 'MISSING_NVIDIA_API_KEY');
  }
  const model = await resolveModelConfig(input.modelId);
  const messages = trimMessagesForContext(input.messages, model.contextWindow);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let assistantContent = '';
  const originalWrite = res.write.bind(res);
  res.write = ((chunk: string | Buffer) => {
    const text = chunk.toString();
    for (const line of text.split('\n')) {
      if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
      try {
        const parsed = JSON.parse(line.replace('data: ', ''));
        assistantContent += parsed.choices?.[0]?.delta?.content || '';
      } catch {
        continue;
      }
    }
    return originalWrite(chunk);
  }) as typeof res.write;

  res.on('finish', async () => {
    if (assistantContent.trim()) {
      await Message.create({
        chatId: input.chatId,
        role: 'assistant',
        content: assistantContent,
        modelId: input.modelId
      });
      await Chat.findByIdAndUpdate(input.chatId, { lastMessageAt: new Date() });
    }
    await UsageLog.create({
      chatId: input.chatId,
      modelId: input.modelId,
      latencyMs: Date.now() - started,
      status: 'ok'
    });
  });

  await streamNimResponse({
    apiKey: env.NVIDIA_API_KEY,
    modelId: input.modelId,
    endpointType: model.endpointType,
    messages,
    attachments: input.attachments,
    res
  });
});
