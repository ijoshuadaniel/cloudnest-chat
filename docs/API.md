# API Reference

Base path: `/api`

## Health

`GET /health`

Returns service status.

## Models

`GET /models`

Returns configured models and capabilities.

`POST /models`

Creates or updates a model configuration.

```json
{
  "modelId": "meta/llama-3.1-70b-instruct",
  "label": "Llama 3.1 70B",
  "capabilities": ["text"],
  "endpointType": "chat"
}
```

## Chats

`GET /chats`

Returns chat summaries.

`POST /chats`

Creates a chat.

`GET /chats/:chatId`

Returns one chat with messages.

`PATCH /chats/:chatId`

Renames, pins, categorizes, or archives a chat.

`DELETE /chats/:chatId`

Deletes a chat.

## Messages

`POST /messages`

Creates a user message and stores attachments metadata.

## NVIDIA Streaming

`POST /nim/stream`

Streams Server-Sent Events.

The NVIDIA API key is read from the backend `NVIDIA_API_KEY` environment variable.

Body:

```json
{
  "chatId": "mongo-id",
  "modelId": "meta/llama-3.1-70b-instruct",
  "messages": [{"role": "user", "content": "Hello"}],
  "attachments": []
}
```
