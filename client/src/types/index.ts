export type ModelCapability = 'text' | 'images' | 'audio' | 'video' | 'embeddings' | 'multimodal';

export interface ModelConfig {
  _id?: string;
  modelId: string;
  label: string;
  capabilities: ModelCapability[];
  endpointType: 'chat' | 'vision' | 'audio' | 'embedding' | 'image' | 'multimodal';
  contextWindow?: number;
  maxUploadMb?: number;
}

export interface Attachment {
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
  url?: string;
}

export interface Chat {
  _id: string;
  title: string;
  modelId: string;
  category: string;
  pinned: boolean;
  lastMessageAt: string;
  summary?: string;
}

export interface Message {
  _id?: string;
  chatId?: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  modelId?: string;
  attachments?: Attachment[];
  createdAt?: string;
  pending?: boolean;
  error?: string;
}
