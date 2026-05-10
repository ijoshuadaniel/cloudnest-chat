import axios from "axios";
import type { Attachment, Chat, Message, ModelConfig } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://apichat.cloudnest.in/api",
});

export async function fetchModels() {
  const { data } = await api.get<{ models: ModelConfig[] }>("/models");
  return data.models;
}

export async function saveModel(
  model: Partial<ModelConfig> & { modelId: string },
) {
  const { data } = await api.post<{ model: ModelConfig }>("/models", model);
  return data.model;
}

export async function deleteModel(modelId: string) {
  await api.delete(`/models/${encodeURIComponent(modelId)}`);
}

export async function fetchChats(search = "") {
  const { data } = await api.get<{ chats: Chat[] }>("/chats", {
    params: { search },
  });
  return data.chats;
}

export async function createChat(modelId: string) {
  const { data } = await api.post<{ chat: Chat }>("/chats", { modelId });
  return data.chat;
}

export async function fetchChat(chatId: string) {
  const { data } = await api.get<{ chat: Chat; messages: Message[] }>(
    `/chats/${chatId}`,
  );
  return data;
}

export async function updateChat(chatId: string, input: Partial<Chat>) {
  const { data } = await api.patch<{ chat: Chat }>(`/chats/${chatId}`, input);
  return data.chat;
}

export async function deleteChat(chatId: string) {
  await api.delete(`/chats/${chatId}`);
}

export async function createMessage(message: Message) {
  const { data } = await api.post<{ message: Message }>("/messages", message);
  return data.message;
}

export async function streamAssistant(params: {
  chatId: string;
  modelId: string;
  messages: Message[];
  attachments: Attachment[];
  onToken: (token: string) => void;
}) {
  const response = await fetch(`${api.defaults.baseURL}/nim/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let currentEvent = "message";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n")) {
      if (line.startsWith("event: ")) {
        currentEvent = line.replace("event: ", "").trim();
        continue;
      }
      if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
      try {
        const parsed = JSON.parse(line.replace("data: ", ""));
        if (currentEvent === "error") {
          throw new Error(parsed.message || "Stream failed");
        }
        const token = parsed.choices?.[0]?.delta?.content || "";
        if (token) params.onToken(token);
      } catch (error) {
        if (currentEvent === "error") {
          throw error instanceof Error ? error : new Error("Stream failed");
        }
      }
      currentEvent = "message";
    }
  }
}
