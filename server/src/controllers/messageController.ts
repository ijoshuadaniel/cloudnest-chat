import { z } from 'zod';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { estimateTokens } from '../services/memoryService.js';

const attachmentSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string().optional(),
  dataUrl: z.string().optional()
});

function titleFromMessage(content: string) {
  const title = content
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);

  if (!title) return 'New chat';
  return title.length === 70 ? `${title.replace(/[.,;:!?-]\s*$/, '')}...` : title;
}

export const createMessage = asyncHandler(async (req, res) => {
  const schema = z.object({
    chatId: z.string(),
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string().default(''),
    modelId: z.string().optional(),
    attachments: z.array(attachmentSchema).default([])
  });
  const input = schema.parse(req.body);
  const message = await Message.create({
    ...input,
    attachments: input.attachments.map((attachment) => ({
      ...attachment,
      kind: attachment.mimeType.startsWith('image/')
        ? 'image'
        : attachment.mimeType.startsWith('audio/')
          ? 'audio'
          : attachment.mimeType.startsWith('video/')
            ? 'video'
            : 'file'
    })),
    tokenEstimate: estimateTokens(input.content)
  });

  const update: Record<string, unknown> = { lastMessageAt: new Date() };
  if (input.role === 'user') {
    const previousUserMessage = await Message.exists({
      chatId: input.chatId,
      role: 'user',
      _id: { $ne: message._id }
    });

    if (!previousUserMessage) {
      update.title = titleFromMessage(input.content);
    }
  }

  await Chat.findByIdAndUpdate(input.chatId, update);
  res.status(201).json({ message });
});
