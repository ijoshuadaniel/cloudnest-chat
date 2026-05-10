require("dotenv").config({ path: "./server/.env" });

module.exports = {
  apps: [
    {
      name: "nim-chat-api",
      cwd: "./server",
      script: "dist/index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 1002,
        MONGODB_URI:
          process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nim-chat",
        CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "https://chat.cloudnest.in",
        JWT_SECRET: process.env.JWT_SECRET || "replace-me-for-production",
        NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || "",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "nim-chat-web",
      cwd: "./client",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 1001",
      env: {
        NODE_ENV: "production",
        VITE_API_URL:
          process.env.VITE_API_URL || "https://chatapi.cloudnest.in",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
  ],
};
