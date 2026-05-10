import { z } from 'zod';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listChats = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  const filter = search
    ? { archived: false, $text: { $search: search } }
    : { archived: false };
  const chats = await Chat.find(filter).sort({ pinned: -1, lastMessageAt: -1 }).lean();
  res.json({ chats });
});

export const createChat = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().optional(),
    modelId: z.string().min(2),
    category: z.string().optional(),
    persona: z.string().optional()
  });
  const input = schema.parse(req.body);
  const chat = await Chat.create({
    title: input.title || 'New chat',
    modelId: input.modelId,
    category: input.category || undefined,
    persona: input.persona
  });
  res.status(201).json({ chat });
});

export const getChat = asyncHandler(async (req, res) => {
  const [chat, messages] = await Promise.all([
    Chat.findById(req.params.chatId).lean(),
    Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 }).lean()
  ]);
  res.json({ chat, messages });
});

export const updateChat = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().optional(),
    pinned: z.boolean().optional(),
    archived: z.boolean().optional(),
    category: z.string().optional(),
    modelId: z.string().optional()
  });
  const input = schema.parse(req.body);
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, input, { new: true }).lean();
  res.json({ chat });
});

export const deleteChat = asyncHandler(async (req, res) => {
  await Promise.all([
    Chat.findByIdAndDelete(req.params.chatId),
    Message.deleteMany({ chatId: req.params.chatId })
  ]);
  res.status(204).end();
});
