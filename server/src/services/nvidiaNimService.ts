import axios from 'axios';
import type { Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import type { AttachmentInput, ChatMessageInput, EndpointType } from '../types/index.js';

const BASE_URL = env.NVIDIA_BASE_URL.replace(/\/$/, '');
const IMAGE_BASE_URL = (env.NVIDIA_IMAGE_BASE_URL || env.NVIDIA_BASE_URL).replace(/\/$/, '');

function toOpenAiContent(content: string, attachments: AttachmentInput[] = []) {
  const rich = attachments
    .filter((attachment) => attachment.mimeType?.startsWith('image/') && (attachment.dataUrl || attachment.url))
    .map((attachment) => {
      const imageUrl = attachment.dataUrl || attachment.url;
      return { type: 'image_url' as const, image_url: { url: imageUrl } };
    });

  if (!rich.length) return content;
  return [{ type: 'text', text: content }, ...rich];
}

function routeFor(endpointType: EndpointType) {
  if (endpointType === 'embedding') return '/embeddings';
  if (endpointType === 'image') return '/infer';
  return '/chat/completions';
}

function writeChatDelta(res: Response, content: string) {
  res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
}

function writeStreamError(res: Response, message: string) {
  res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  res.end();
}

async function generateImageResponse(params: {
  apiKey: string;
  messages: ChatMessageInput[];
  res: Response;
}) {
  const prompt = [...params.messages].reverse().find((message) => message.role === 'user')?.content.trim();
  if (!prompt) {
    throw new AppError('Image generation requires a prompt', 400, 'MISSING_IMAGE_PROMPT');
  }

  const response = await axios.post(
    `${IMAGE_BASE_URL}/infer`,
    {
      prompt,
      seed: 0
    },
    {
      headers: {
        ...(params.apiKey ? { Authorization: `Bearer ${params.apiKey}` } : {}),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 180000
    }
  );

  const artifact = response.data?.artifacts?.[0];
  const imageUrl = artifact?.url || (artifact?.base64 ? `data:image/png;base64,${artifact.base64}` : undefined);
  if (!imageUrl) {
    throw new AppError('NVIDIA image response did not include an image', 502, 'EMPTY_IMAGE_RESPONSE');
  }

  writeChatDelta(params.res, `Generated image for: ${prompt}\n\n![Generated image](${imageUrl})`);
  params.res.write('data: [DONE]\n\n');
  params.res.end();
}

export async function streamNimResponse(params: {
  apiKey?: string;
  modelId: string;
  endpointType: EndpointType;
  messages: ChatMessageInput[];
  attachments?: AttachmentInput[];
  res: Response;
}) {
  if (!params.apiKey) {
    throw new AppError('Missing NVIDIA API key', 401, 'MISSING_NVIDIA_API_KEY');
  }

  const route = routeFor(params.endpointType);
  if (route === '/embeddings') {
    throw new AppError('Embedding models do not support chat streaming', 400, 'UNSUPPORTED_MODEL_OPERATION');
  }

  if (route === '/infer') {
    try {
      await generateImageResponse({
        apiKey: params.apiKey,
        messages: params.messages,
        res: params.res
      });
    } catch (error) {
      if (params.res.headersSent) {
        const message = axios.isAxiosError(error)
          ? error.response?.status === 404
            ? `Image infer endpoint not found: ${IMAGE_BASE_URL}/infer. Set NVIDIA_IMAGE_BASE_URL to your visual NIM base URL, for example http://localhost:8000/v1.`
            : error.response?.data?.error?.message || error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : 'Image generation failed';
        writeStreamError(params.res, message);
        return;
      }
      throw error;
    }
    return;
  }

  const lastUserIndex = params.messages.map((message) => message.role).lastIndexOf('user');
  const messages = params.messages.map((message, index) => ({
    role: message.role,
    content:
      index === lastUserIndex
        ? toOpenAiContent(message.content, params.attachments)
        : message.content
  }));

  let response;
  try {
    response = await axios.post(
      `${BASE_URL}${route}`,
      {
        model: params.modelId,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 2048,
        stream: true
      },
      {
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          Accept: 'text/event-stream',
          'Content-Type': 'application/json'
        },
        responseType: 'stream',
        timeout: 180000
      }
    );
  } catch (error) {
    if (params.res.headersSent) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'NVIDIA request failed';
      writeStreamError(params.res, message);
      return;
    }
    throw error;
  }

  response.data.on('data', (chunk: Buffer) => {
    params.res.write(chunk);
  });

  response.data.on('end', () => {
    params.res.end();
  });

  response.data.on('error', () => {
    writeStreamError(params.res, 'NVIDIA stream interrupted');
  });
}
