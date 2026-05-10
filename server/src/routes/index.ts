import { Router } from 'express';
import { createChat, deleteChat, getChat, listChats, updateChat } from '../controllers/chatController.js';
import { createMessage } from '../controllers/messageController.js';
import { deleteModel, getModels, saveModel } from '../controllers/modelController.js';
import { streamChat } from '../controllers/nimController.js';

export const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, service: 'nim-chat-api' }));
router.get('/models', getModels);
router.post('/models', saveModel);
router.delete('/models/:modelId', deleteModel);
router.get('/chats', listChats);
router.post('/chats', createChat);
router.get('/chats/:chatId', getChat);
router.patch('/chats/:chatId', updateChat);
router.delete('/chats/:chatId', deleteChat);
router.post('/messages', createMessage);
router.post('/nim/stream', streamChat);
