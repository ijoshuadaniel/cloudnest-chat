import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { router } from "./routes/index.js";
import { seedDefaultModels } from "./services/modelRegistry.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  [
    env.CLIENT_ORIGIN,
    env.CLIENT_ORIGINS,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]
    .flatMap((origin) => origin?.split(",") ?? [])
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use("/api", router);
app.use(errorHandler);

await connectDb();
await seedDefaultModels();

app.listen(env.PORT, () => {
  console.log(`NIM chat API listening on ${env.PORT}`);
});
