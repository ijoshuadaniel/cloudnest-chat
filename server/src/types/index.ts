export type ModelCapability = 'text' | 'images' | 'audio' | 'video' | 'embeddings' | 'multimodal';
export type EndpointType = 'chat' | 'vision' | 'audio' | 'embedding' | 'image' | 'multimodal';

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface AttachmentInput {
  name: string;
  mimeType: string;
  size: number;
  url?: string;
  dataUrl?: string;
}
