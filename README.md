# Cloudnest Chat

A full-stack AI chatbot platform built with React, TypeScript, Vite, Tailwind CSS, Node.js, Express, and MongoDB. Cloudnest Chat supports configurable NVIDIA NIM model IDs, capability-aware multimodal UI, streaming responses, persistent chat history, and deployment-ready structure.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Start MongoDB locally or use MongoDB Atlas by setting `MONGODB_URI` in `.env`.

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000/api`

## PM2 Production Run

Install PM2 globally once:

```bash
npm install -g pm2
```

Build and start both apps:

```bash
npm run pm2:start
```

Useful commands:

```bash
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
pm2 save
```

The PM2 config lives in `ecosystem.config.cjs` and runs:

- `nim-chat-api` from `server/dist/index.js`
- `nim-chat-web` with Vite preview on port `5173`

## NVIDIA API Keys

Set your NVIDIA key on the backend only:

```bash
NVIDIA_API_KEY=nvapi-your-key
```

The frontend never stores or sends the key. All NVIDIA requests are routed through the Express API.

## Model IDs

The backend uses a dynamic model registry. New NVIDIA NIM model IDs can be used without code changes by creating a model configuration through the API or by selecting "custom model" in the UI. Capabilities drive the interface:

- `text`
- `images`
- `audio`
- `video`
- `embeddings`
- `multimodal`

## Deployment

- Frontend: Vercel, set `VITE_API_URL`.
- Backend: PM2 on a VPS, Render, or Railway. Set `MONGODB_URI`, `CLIENT_ORIGIN`, and `JWT_SECRET`.
- Database: MongoDB Atlas recommended for production.

See [docs/API.md](./docs/API.md) for endpoint documentation.
