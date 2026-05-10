import type { ChatMessageInput } from '../types/index.js';

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function trimMessagesForContext(messages: ChatMessageInput[], contextWindow = 8192) {
  const budget = Math.floor(contextWindow * 0.75);
  const system = messages.filter((message) => message.role === 'system');
  const rest = messages.filter((message) => message.role !== 'system').reverse();
  const kept: ChatMessageInput[] = [];
  let total = system.reduce((sum, message) => sum + estimateTokens(message.content), 0);

  for (const message of rest) {
    const cost = estimateTokens(message.content);
    if (total + cost > budget) break;
    kept.push(message);
    total += cost;
  }

  return [...system, ...kept.reverse()];
}
