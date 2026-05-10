import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(1002),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/nim-chat"),
  CLIENT_ORIGIN: z.string().default("https://chat.cloudnest.in"),
  CLIENT_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().default("dev-secret"),
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_IMAGE_BASE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
